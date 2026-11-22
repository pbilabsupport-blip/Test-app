const {
  json,
  readBody,
  requirePost,
  getSupabaseAdmin,
  normalizeEmail,
  hashOtp,
  findLicenseByEmail,
  secretsMatch,
  publicError
} = require('./_lib');

const MAX_OTP_ATTEMPTS = 5;

exports.handler = async function handler(event) {
  const methodError = requirePost(event);
  if (methodError) return methodError;

  try {
    const body = readBody(event);
    const email = normalizeEmail(body && body.email);
    const code = String((body && body.code) || '').trim();

    if (!email || !/^\d{6}$/.test(code)) {
      return json(400, {
        success: false,
        code: 'BAD_REQUEST',
        error: 'Enter the 6-digit code from your email.'
      });
    }

    const supabase = getSupabaseAdmin();
    const license = await findLicenseByEmail(supabase, email);
    const failure = json(401, {
      success: false,
      code: 'BAD_CODE',
      error: 'That code is invalid or expired.'
    });

    if (!license || !license.otp_hash || !license.license_key) {
      return failure;
    }

    const parts = String(license.otp_hash).split(':');
    const attempts = parts.length === 2 ? Number(parts[0]) || 0 : 0;
    const storedHash = parts.length === 2 ? parts[1] : parts[0];

    const expired = !license.otp_expiry || new Date(license.otp_expiry).getTime() < Date.now();
    if (expired || attempts >= MAX_OTP_ATTEMPTS || !storedHash) {
      await supabase
        .from('licenses')
        .update({ otp_hash: null, otp_expiry: null })
        .eq('license_key', license.license_key);

      return json(401, {
        success: false,
        code: 'BAD_CODE',
        error: attempts >= MAX_OTP_ATTEMPTS
          ? 'Too many incorrect attempts. Please request a new code.'
          : 'That code is invalid or expired.'
      });
    }

    const matches = secretsMatch(hashOtp(code, license.license_key), storedHash);
    if (!matches) {
      const nextAttempts = attempts + 1;
      const updatePayload = nextAttempts >= MAX_OTP_ATTEMPTS
        ? { otp_hash: null, otp_expiry: null }
        : { otp_hash: `${nextAttempts}:${storedHash}` };

      await supabase
        .from('licenses')
        .update(updatePayload)
        .eq('license_key', license.license_key);

      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        return json(401, {
          success: false,
          code: 'BAD_CODE',
          error: 'Too many incorrect attempts. Please request a new code.'
        });
      }
      return failure;
    }

    await supabase.from('device_seats').delete().eq('license_key', license.license_key);
    await supabase
      .from('licenses')
      .update({ otp_hash: null, otp_expiry: null, otp_sent_at: null })
      .eq('license_key', license.license_key);

    return json(200, {
      success: true,
      message: 'All devices were released. You can activate this one now.'
    });
  } catch (error) {
    return publicError(error);
  }
};