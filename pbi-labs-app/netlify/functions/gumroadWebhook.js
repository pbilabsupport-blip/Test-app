const {
  json,
  readBody,
  getSupabaseAdmin,
  normalizeEmail,
  webhookAuthorized,
  verifyWithGumroad,
  isLicenseDead,
  saveLicense
} = require('./_lib');

exports.handler = async function handler(event) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' });
  }

  if (!webhookAuthorized(event)) {
    return json(401, { error: 'Unauthorized webhook.' });
  }

  try {
    const payload = readBody(event) || {};
    const licenseKey = String(payload.license_key || payload.licenseKey || '').trim();
    const email = normalizeEmail(payload.email);

    if (!licenseKey) {
      return json(200, { ok: true, ignored: true });
    }

    const supabase = getSupabaseAdmin();
    let dead = false;
    try {
      const gumroadData = await verifyWithGumroad(licenseKey);
      dead = isLicenseDead(gumroadData);
    } catch (error) {
      if (error.code === 'MISSING_CONFIG') throw error;
      const flagged = payload.refunded === 'true' || payload.refunded === true
        || payload.chargebacked === 'true' || payload.chargebacked === true;
      if (!flagged) throw error;
      dead = true;
    }

    if (dead) {
      await saveLicense(supabase, { licenseKey, email, active: false });
      await supabase.from('device_seats').delete().eq('license_key', licenseKey);
      return json(200, { ok: true, status: 'inactive' });
    }

    await saveLicense(supabase, { licenseKey, email, active: true });
    return json(200, { ok: true, status: 'active' });
  } catch (error) {
    console.error('Gumroad webhook failed:', error.message);
    const status = error.code === 'MISSING_CONFIG' ? 500 : 500;
    return json(status, { error: 'Webhook failed.' });
  }
};
