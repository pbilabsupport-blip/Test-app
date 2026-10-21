const {
  json,
  readBody,
  requirePost,
  getSupabaseAdmin,
  normalizeEmail,
  verifyWithGumroad,
  isLicenseDead,
  saveLicense,
  listSeats,
  insertSeat,
  touchSeat,
  publicError
} = require('./_lib');

exports.handler = async function handler(event) {
  const methodError = requirePost(event);
  if (methodError) return methodError;

  try {
    const body = readBody(event);
    if (body === null) return json(400, { success: false, code: 'BAD_REQUEST', error: 'Invalid request.' });

    const licenseKey = String(body.licenseKey || '').trim();
    const email = normalizeEmail(body.email);
    const deviceId = String(body.deviceId || '').trim();
    const mode = body.mode || 'activate';

    if (!licenseKey || !email || !deviceId) {
      return json(400, { success: false, code: 'BAD_REQUEST', error: 'Email, license key, and device are required.' });
    }

    const supabase = getSupabaseAdmin();

    if (mode === 'release') {
      await supabase.from('device_seats').delete().eq('license_key', licenseKey).eq('device_id', deviceId);
      return json(200, { success: true });
    }

    const gumroadData = await verifyWithGumroad(licenseKey);
    if (isLicenseDead(gumroadData)) {
      await saveLicense(supabase, { licenseKey, email, active: false }).catch(() => {});
      await supabase.from('device_seats').delete().eq('license_key', licenseKey);
      return json(401, { success: false, code: 'INVALID_LICENSE', error: 'That license is invalid or no longer active.' });
    }

    const purchaseEmail = normalizeEmail(gumroadData.purchase && gumroadData.purchase.email);
    if (purchaseEmail && purchaseEmail !== email) {
      return json(401, { success: false, code: 'EMAIL_MISMATCH', error: 'That license is registered to a different email.' });
    }

    await saveLicense(supabase, { licenseKey, email: purchaseEmail || email, active: true });

    const seats = await listSeats(supabase, licenseKey);
    const existing = seats.find((seat) => seat.device_id === deviceId);

    if (!existing) {
      if (seats.length >= 2) {
        return json(403, {
          success: false,
          code: 'SEAT_LIMIT',
          error: 'This license already has 2 devices. Release one from Lost Device.'
        });
      }
      const now = new Date().toISOString();
      await insertSeat(supabase, {
        license_key: licenseKey,
        email: purchaseEmail || email,
        device_id: deviceId,
        last_ping: now,
        last_seen: now
      });
    } else if (mode === 'heartbeat' || mode === 'activate') {
      await touchSeat(supabase, licenseKey, deviceId);
    }

    return json(200, { success: true, tier: 'pro', email: purchaseEmail || email });
  } catch (error) {
    return publicError(error);
  }
};
