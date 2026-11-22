const crypto = require('crypto');
const {
  env,
  json,
  readBody,
  requirePost,
  getSupabaseAdmin,
  normalizeEmail,
  hashOtp,
  findLicenseByEmail,
  publicError
} = require('./_lib');

exports.handler = async function handler(event) {
  const methodError = requirePost(event);
  if (methodError) return methodError;

  try {
    const body = readBody(event);
    const email = normalizeEmail(body && body.email);
    const language = body && body.language === 'es' ? 'es' : 'en';
    const isEs = language === 'es';

    const genericResponse = {
      success: true,
      message: isEs
        ? 'Si existe una licencia activa para ese correo, el código de recuperación está en camino.'
        : 'If an active license exists for that email, a recovery code is on the way.'
    };

    if (!email) {
      return json(400, {
        success: false,
        code: 'BAD_REQUEST',
        error: isEs ? 'El correo electrónico es obligatorio.' : 'Email is required.'
      });
    }

    const apiKey = env('BREVO_API_KEY');
    const senderEmail = env('BREVO_SENDER_EMAIL');
    if (!apiKey || !senderEmail) {
      return json(500, {
        success: false,
        code: 'MISSING_CONFIG',
        error: 'Brevo API key or sender email is not configured.'
      });
    }

    const supabase = getSupabaseAdmin();
    const license = await findLicenseByEmail(supabase, email);

    // Do not leak account status or send reset codes for refunded/inactive licenses
    if (
      !license ||
      !license.license_key ||
      license.is_active === false ||
      license.status === 'inactive'
    ) {
      return json(200, genericResponse);
    }

    // 60-second cooldown only triggers if a previous code was actually sent
    if (license.otp_sent_at && license.otp_hash) {
      const elapsed = Date.now() - new Date(license.otp_sent_at).getTime();
      if (elapsed >= 0 && elapsed < 60 * 1000) {
        return json(200, genericResponse);
      }
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(otpCode, license.license_key);
    const now = new Date();
    const expiry = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    const subject = isEs ? 'P.B.I. Labs: Recuperación de dispositivo' : 'P.B.I. Labs: Device recovery';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #d4af37; text-align: center;">P.B.I. Labs</h2>
        <p>${isEs ? 'Usa este código para liberar los dispositivos de tu licencia. Expira en 15 minutos.' : 'Use this code to release the devices on your license. It expires in 15 minutes.'}</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;">${otpCode}</p>
        <p style="color: #94a3b8; font-size: 12px;">${isEs ? 'Si no fuiste tú, ignora este correo.' : 'If you did not ask for this, you can ignore this email.'}</p>
      </div>`;

    const fetchImpl = global.fetch || require('node-fetch');
    const response = await fetchImpl('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: { name: 'P.B.I. Labs Security', email: senderEmail },
        to: [{ email }],
        subject,
        htmlContent
      })
    });

    if (!response.ok) {
      const brevoDetails = await response.json().catch(() => ({}));
      const reason = brevoDetails.message || `Status ${response.status}`;
      console.error('Brevo rejected recovery email:', response.status, brevoDetails);
      return json(502, {
        success: false,
        code: 'EMAIL_FAILED',
        error: `Email service error (${reason}).`
      });
    }

    // Only save the OTP hash and cooldown timestamp after Brevo confirms delivery
    const { error: saveError } = await supabase
      .from('licenses')
      .update({
        otp_hash: otpHash,
        otp_expiry: expiry,
        otp_sent_at: now.toISOString()
      })
      .eq('license_key', license.license_key);

    if (saveError) throw saveError;

    return json(200, genericResponse);
  } catch (error) {
    return publicError(error);
  }
};