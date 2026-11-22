const {
  json,
  readBody,
  getSupabaseAdmin,
  normalizeEmail,
  webhookAuthorized,
  saveLicense
} = require('./_lib');

function isTruthy(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

exports.handler = async function handler(event) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' });
  }

  if (!webhookAuthorized(event)) {
    return json(401, { error: 'Unauthorized' });
  }

  try {
    const payload = readBody(event) || {};
    const licenseKey = String(payload.license_key || payload.licenseKey || '').trim();
    const email = normalizeEmail(payload.email);

    // Acknowledge Gumroad ping tests that do not include a license key
    if (!licenseKey) {
      return json(200, { ok: true, message: 'Test ping acknowledged.' });
    }

    const supabase = getSupabaseAdmin();

    const isRefunded = isTruthy(payload.refunded);
    const isChargebacked = isTruthy(payload.chargebacked);
    const isDisputed = isTruthy(payload.disputed);
    const isEnded = isTruthy(payload.ended);

    let isExpired = false;
    if (payload.subscription_ended_at) {
      const endedTime = new Date(payload.subscription_ended_at).getTime();
      if (!Number.isNaN(endedTime) && endedTime <= Date.now()) {
        isExpired = true;
      }
    }

    const isActive = !isRefunded && !isChargebacked && !isDisputed && !isEnded && !isExpired;

    if (!isActive) {
      await saveLicense(supabase, { licenseKey, email, active: false });
      await supabase.from('device_seats').delete().eq('license_key', licenseKey);
      return json(200, { ok: true, status: 'inactive' });
    }

    await saveLicense(supabase, { licenseKey, email, active: true });
    return json(200, { ok: true, status: 'active' });
  } catch (error) {
    console.error('Gumroad webhook error:', error);
    return json(200, { ok: true, warning: 'Processed with fallback' });
  }
};