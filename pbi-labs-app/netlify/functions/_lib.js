const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

function env(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && String(value).trim()) return String(value).trim();
  }
  return '';
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function readBody(event) {
  if (!event || !event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
  try {
    return JSON.parse(raw);
  } catch (err) {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }
}

function requirePost(event) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed', code: 'METHOD' });
  }
  return null;
}

function getSupabaseAdmin() {
  const url = env('SUPABASE_URL', 'REACT_APP_SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    const error = new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    error.code = 'MISSING_CONFIG';
    throw error;
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashOtp(code, licenseKey) {
  const pepper = env('OTP_PEPPER') || env('SUPABASE_SERVICE_ROLE_KEY') || 'pbi-labs-otp';
  return crypto
    .createHash('sha256')
    .update(`${pepper}:${String(licenseKey).trim()}:${String(code).trim()}`)
    .digest('hex');
}

function secretsMatch(a, b) {
  const left = crypto.createHash('sha256').update(String(a)).digest();
  const right = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(left, right);
}

function webhookAuthorized(event) {
  const secret = env('GUMROAD_WEBHOOK_TOKEN');
  if (!secret) return false;
  const query = (event.queryStringParameters && event.queryStringParameters.token) || '';
  const header = (event.headers && (event.headers['x-webhook-token'] || event.headers['X-Webhook-Token'])) || '';
  return secretsMatch(query || header, secret);
}

async function verifyWithGumroad(licenseKey) {
  const permalink = env('GUMROAD_PRODUCT_PERMALINK');
  const productId = env('GUMROAD_PRODUCT_ID');
  if (!permalink && !productId) {
    const error = new Error('Missing GUMROAD_PRODUCT_PERMALINK.');
    error.code = 'MISSING_CONFIG';
    throw error;
  }
  const fetchImpl = global.fetch || require('node-fetch');
  const payload = {
    license_key: String(licenseKey).trim(),
    increment_uses_count: false
  };
  if (permalink) payload.product_permalink = permalink;
  else payload.product_id = productId;

  const response = await fetchImpl('https://api.gumroad.com/v2/licenses/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  return data;
}

function isTruthy(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function isLicenseDead(data) {
  if (!data || data.success !== true) return true;
  const purchase = data.purchase || {};
  if (isTruthy(purchase.refunded) || isTruthy(purchase.chargebacked) || isTruthy(purchase.ended)) {
    return true;
  }
  if (purchase.subscription_ended_at) {
    const ended = new Date(purchase.subscription_ended_at).getTime();
    if (!Number.isNaN(ended) && ended <= Date.now()) return true;
  }
  if (purchase.subscription_failed_at) return true;
  return false;
}

async function findLicense(supabase, licenseKey) {
  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('license_key', String(licenseKey).trim())
    .limit(1);
  if (error) throw error;
  return (data && data[0]) || null;
}

async function findLicenseByEmail(supabase, email) {
  const normalized = normalizeEmail(email);
  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .ilike('email', normalized);
  if (error) throw error;
  const rows = data || [];
  const active = rows.find((row) => row.is_active !== false && row.status !== 'inactive');
  return active || rows[0] || null;
}

async function saveLicense(supabase, { licenseKey, email, active }) {
  const existing = await findLicense(supabase, licenseKey);
  const row = {
    license_key: String(licenseKey).trim(),
    email: normalizeEmail(email || (existing && existing.email)),
    is_active: active,
    status: active ? 'active' : 'inactive',
    updated_at: new Date().toISOString()
  };
  if (!existing) {
    const { error } = await supabase.from('licenses').insert([row]);
    if (!error) return;
    if (!/column|schema cache/i.test(error.message || '')) throw error;
    const minimal = {
      license_key: row.license_key,
      email: row.email,
      is_active: row.is_active,
      status: row.status
    };
    const retry = await supabase.from('licenses').insert([minimal]);
    if (retry.error) throw retry.error;
    return;
  }
  const { error } = await supabase.from('licenses').update(row).eq('license_key', row.license_key);
  if (!error) return;
  if (!/column|schema cache/i.test(error.message || '')) throw error;
  const { updated_at, ...rest } = row;
  const retry = await supabase.from('licenses').update(rest).eq('license_key', row.license_key);
  if (retry.error) throw retry.error;
}

async function listSeats(supabase, licenseKey) {
  const { data, error } = await supabase
    .from('device_seats')
    .select('*')
    .eq('license_key', String(licenseKey).trim());
  if (error) throw error;
  return data || [];
}

async function insertSeat(supabase, row) {
  const attempts = [
    row,
    {
      license_key: row.license_key,
      email: row.email,
      device_id: row.device_id,
      last_ping: row.last_ping
    },
    {
      license_key: row.license_key,
      device_id: row.device_id,
      last_seen: row.last_seen
    }
  ];
  let lastError = null;
  for (const payload of attempts) {
    const { error } = await supabase.from('device_seats').insert([payload]);
    if (!error) return;
    lastError = error;
    if (!/column|schema cache/i.test(error.message || '')) throw error;
  }
  throw lastError;
}

async function touchSeat(supabase, licenseKey, deviceId) {
  const now = new Date().toISOString();
  const update = { last_ping: now, last_seen: now };
  let { error } = await supabase
    .from('device_seats')
    .update(update)
    .eq('license_key', licenseKey)
    .eq('device_id', deviceId);
  if (error && /column|schema cache/i.test(error.message || '')) {
    ({ error } = await supabase
      .from('device_seats')
      .update({ last_ping: now })
      .eq('license_key', licenseKey)
      .eq('device_id', deviceId));
  }
  if (error) throw error;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date().toISOString().slice(0, 10);
  const due = Date.parse(`${String(dateStr).slice(0, 10)}T00:00:00Z`);
  const start = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(due) || Number.isNaN(start)) return null;
  return Math.round((due - start) / 86400000);
}

function buildReminderMessage({ tone, language, name, amount, nextDate, days }) {
  const isEs = language === 'es';
  const money = `$${Number(amount || 0).toFixed(2)}`;
  const when = days <= 0
    ? (isEs ? 'hoy' : 'today')
    : days === 1
      ? (isEs ? 'mañana' : 'tomorrow')
      : (isEs ? `en ${days} días` : `in ${days} days`);
  if (tone === 'gentle') {
    return isEs
      ? `Un recordatorio amable: ${name} (${money}) vence ${when} (${nextDate}).`
      : `A gentle reminder: ${name} (${money}) is due ${when} (${nextDate}).`;
  }
  if (tone === 'urgent') {
    return isEs
      ? `Atención: el pago de ${name} por ${money} vence ${when}. No lo dejes pasar.`
      : `Heads up: your ${name} payment of ${money} is due ${when}. Don't let it slip.`;
  }
  return isEs
    ? `Pago próximo: ${name} por ${money}, vence ${when}.`
    : `Upcoming payment: ${name} for ${money}, due ${when}.`;
}

async function assertReminderCaller(supabase, { email, accessToken, licenseKey }) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data || !data.user || !data.user.email) return null;
    if (data.user.email.toLowerCase() !== normalized) return null;
    return { email: normalized, tier: 'free' };
  }

  if (licenseKey) {
    const row = await findLicense(supabase, licenseKey);
    if (!row) return null;
    if (normalizeEmail(row.email) !== normalized) return null;
    if (row.is_active === false || row.status === 'inactive') return null;
    return { email: normalized, tier: 'pro' };
  }

  return null;
}

function publicError(error) {
  const code = error.code || 'SERVER';
  if (code === 'MISSING_CONFIG') {
    return json(500, { success: false, code, error: 'Server configuration is incomplete.' });
  }
  console.error(error);
  return json(500, { success: false, code: 'SERVER', error: 'Something went wrong. Try again.' });
}

module.exports = {
  env,
  json,
  readBody,
  requirePost,
  getSupabaseAdmin,
  normalizeEmail,
  hashOtp,
  secretsMatch,
  webhookAuthorized,
  verifyWithGumroad,
  isLicenseDead,
  findLicense,
  findLicenseByEmail,
  saveLicense,
  listSeats,
  insertSeat,
  touchSeat,
  daysUntil,
  buildReminderMessage,
  assertReminderCaller,
  publicError
};
