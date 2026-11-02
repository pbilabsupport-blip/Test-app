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

    // 1. Release Mode (Logout)
    if (mode === 'release') {
      await supabase.from('device_seats').delete().eq('license_key', licenseKey).eq('device_id', deviceId);
      return json(200, { success: true });
    }

    // 2. CHECK SUPABASE FIRST (Trust verified sales on record)
    const { data: existingRows } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .limit(1);

    const dbLicense = existingRows && existingRows[0];

    // If the license exists in Supabase and is active, approve it directly!
    let isApproved = dbLicense && (dbLicense.is_active === true || dbLicense.status === 'active');
    let purchaseEmail = normalizeEmail(dbLicense && dbLicense.email);

    // 3. Fallback to Gumroad verification only if not yet in database
    if (!isApproved) {
      const gumroadData = await verifyWithGumroad(licenseKey);
      if (!isLicenseDead(gumroadData)) {
        purchaseEmail = normalizeEmail(gumroadData.purchase && gumroadData.purchase.email);
        if (!purchaseEmail || purchaseEmail === email) {
          isApproved = true;
          await saveLicense(supabase, { licenseKey, email: purchaseEmail || email, active: true });
        }
      }
    }

    // If neither Supabase nor Gumroad approves it, reject
    if (!isApproved) {
      return json(401, { success: false, code: 'INVALID_LICENSE', error: 'That license is invalid or no longer active.' });
    }

    // 4. Verify Email Match
    if (purchaseEmail && purchaseEmail !== email) {
      return json(401, { success: false, code: 'EMAIL_MISMATCH', error: 'That license is registered to a different email.' });
    }

    // 5. Seat Management (Enforce 2-device cap)
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