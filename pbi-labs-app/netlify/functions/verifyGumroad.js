const {
  json,
  readBody,
  requirePost,
  getSupabaseAdmin,
  normalizeEmail,
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

    // 1. Release Mode (Logout)
    if (mode === 'release') {
      await supabase.from('device_seats').delete().eq('license_key', licenseKey).eq('device_id', deviceId);
      return json(200, { success: true });
    }

    // 2. CHECK DATABASE FOR GUMROAD SALE
    const { data: existingRows } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .limit(1);

    const dbLicense = existingRows && existingRows[0];

    // If the record exists in your database from Gumroad, verify ownership
    if (dbLicense) {
      const dbEmail = normalizeEmail(dbLicense.email);
      if (dbEmail && dbEmail !== email) {
        return json(401, { success: false, code: 'EMAIL_MISMATCH', error: 'That license is registered to a different email.' });
      }

      // AUTO-HEALING: If it was mistakenly marked FALSE, heal it to TRUE now
      if (!dbLicense.is_active || dbLicense.status !== 'active') {
        await saveLicense(supabase, { licenseKey, email, active: true });
      }
    } else {
      // First-time direct activation: Save as active license
      await saveLicense(supabase, { licenseKey, email, active: true });
    }

    // 3. ENFORCE 2-DEVICE SEAT LIMIT
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
        email: email,
        device_id: deviceId,
        last_ping: now,
        last_seen: now
      });
    } else if (mode === 'heartbeat' || mode === 'activate') {
      await touchSeat(supabase, licenseKey, deviceId);
    }

    return json(200, { success: true, tier: 'pro', email: email });
  } catch (error) {
    return publicError(error);
  }
};