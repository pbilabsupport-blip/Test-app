const {
  json,
  readBody,
  getSupabaseAdmin,
  normalizeEmail,
  verifyWithGumroad,
  isLicenseDead,
  saveLicense
} = require('./_lib');

exports.handler = async function handler(event) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' });
  }

  try {
    const payload = readBody(event) || {};
    const licenseKey = String(payload.license_key || payload.licenseKey || '').trim();
    const email = normalizeEmail(payload.email);

    // If it's just a test ping with no key, return 200 OK so Gumroad turns green
    if (!licenseKey) {
      console.log('Gumroad test ping received successfully.');
      return json(200, { ok: true, message: 'Test ping received.' });
    }

    const supabase = getSupabaseAdmin();
    let dead = false;

    try {
      const gumroadData = await verifyWithGumroad(licenseKey);
      dead = isLicenseDead(gumroadData);
    } catch (error) {
      const flagged = payload.refunded === 'true' || payload.refunded === true
        || payload.chargebacked === 'true' || payload.chargebacked === true;
      if (flagged) dead = true;
    }

    if (dead) {
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