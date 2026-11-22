const {
  json,
  readBody,
  requirePost,
  getSupabaseAdmin,
  normalizeEmail,
  verifyWithGumroad,
  isLicenseDead,
  findLicense,
  saveLicense,
  listSeats,
  insertSeat,
  touchSeat,
  publicError
} = require('./_lib');

const REVERIFY_INTERVAL_MS = 24 * 60 * 60 * 1000;

exports.handler = async function handler(event) {
  const methodError = requirePost(event);
  if (methodError) return methodError;

  try {
    const body = readBody(event);
    if (body === null) {
      return json(400, { success: false, code: 'BAD_REQUEST', error: 'Invalid request.' });
    }

    const licenseKey = String(body.licenseKey || '').trim();
    const email = normalizeEmail(body.email);
    const deviceId = String(body.deviceId || '').trim();
    const mode = body.mode || 'activate';

    if (!licenseKey || !email || !deviceId) {
      return json(400, {
        success: false,
        code: 'BAD_REQUEST',
        error: 'Email, license key, and device are required.'
      });
    }

    const supabase = getSupabaseAdmin();

    // 1. Release Mode (Logout)
    if (mode === 'release') {
      await supabase
        .from('device_seats')
        .delete()
        .eq('license_key', licenseKey)
        .eq('device_id', deviceId);
      return json(200, { success: true });
    }

    // 2. Check existing record in Supabase
    const dbLicense = await findLicense(supabase, licenseKey);

    if (dbLicense) {
      const dbEmail = normalizeEmail(dbLicense.email);
      if (dbEmail && dbEmail !== email) {
        return json(401, {
          success: false,
          code: 'EMAIL_MISMATCH',
          error: 'That license is registered to a different email.'
        });
      }
    }

    const dbIsActive = dbLicense && dbLicense.is_active !== false && dbLicense.status !== 'inactive';

    // 3. Heartbeat Mode: Verify session is still active (plus 24h Gumroad safety re-check)
    if (mode === 'heartbeat') {
      if (!dbLicense || !dbIsActive) {
        return json(401, {
          success: false,
          code: 'INVALID_LICENSE',
          error: 'That license is invalid or no longer active.'
        });
      }

      const updatedAt = dbLicense.updated_at ? new Date(dbLicense.updated_at).getTime() : 0;
      const needsReverify = !updatedAt || (Date.now() - updatedAt > REVERIFY_INTERVAL_MS);

      if (needsReverify) {
        const gumroadData = await verifyWithGumroad(licenseKey);
        if (!gumroadData.networkError) {
          if (!gumroadData.success || isLicenseDead(gumroadData)) {
            await saveLicense(supabase, { licenseKey, email, active: false });
            await supabase.from('device_seats').delete().eq('license_key', licenseKey);
            return json(401, {
              success: false,
              code: 'INVALID_LICENSE',
              error: 'That license is invalid or no longer active.'
            });
          }
          await saveLicense(supabase, { licenseKey, email, active: true });
        }
      }
    } else {
      // 4. Activate Mode: Always verify directly with Gumroad
      const gumroadData = await verifyWithGumroad(licenseKey);

      if (gumroadData.networkError) {
        // Only fall back to DB if Gumroad is temporarily unreachable AND DB already has an active webhook record
        if (!dbIsActive) {
          return json(503, {
            success: false,
            code: 'NETWORK',
            error: 'Could not reach Gumroad to verify your license. Please try again shortly.'
          });
        }
      } else {
        if (!gumroadData.success || isLicenseDead(gumroadData)) {
          if (dbLicense) {
            await saveLicense(supabase, { licenseKey, email, active: false });
            await supabase.from('device_seats').delete().eq('license_key', licenseKey);
          }
          return json(401, {
            success: false,
            code: 'INVALID_LICENSE',
            error: 'That license key is invalid, refunded, or no longer active.'
          });
        }

        const gumroadEmail = normalizeEmail(gumroadData.purchase && gumroadData.purchase.email);
        if (gumroadEmail && gumroadEmail !== email) {
          return json(401, {
            success: false,
            code: 'EMAIL_MISMATCH',
            error: 'That license is registered to a different email.'
          });
        }

        await saveLicense(supabase, {
          licenseKey,
          email: gumroadEmail || email,
          active: true
        });
      }
    }

    // 5. Enforce 2-Device Seat Limit
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
        email,
        device_id: deviceId,
        last_ping: now,
        last_seen: now
      });
    } else if (mode === 'heartbeat' || mode === 'activate') {
      await touchSeat(supabase, licenseKey, deviceId);
    }

    return json(200, { success: true, tier: 'pro', email });
  } catch (error) {
    return publicError(error);
  }
};