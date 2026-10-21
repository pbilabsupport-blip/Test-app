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

const GENERIC = {
  success: true,
  message: 'If a license exists for that email, a recovery code is on the way.'
};

exports.handler = async function handler(event) {
  const methodError = requirePost(event);
  if (methodError) return methodError;

  try {
    const body = readBody(event);
    const email = normalizeEmail(body && body.email);
    const language = body && body.language === 'es' ? 'es' : 'en';
    if (!email) return json(400, { success: false, code: 'BAD_REQUEST', error: 'Email is required.' });

    const apiKey = env('BREVO_API_KEY');
    const senderEmail = env('BREVO_SENDER_EMAIL');
    if (!apiKey || !senderEmail) {
      return json(500, { success: false, code: 'MISSING_CONFIG', error: 'Email sending is not configured.' });
    }

    const supabase = getSupabaseAdmin();
    const license = await findLicenseByEmail(supabase, email);
    if (!license || !license.license_key) return json(200, GENERIC);

    if (license.otp_sent_at) {
      const elapsed = Date.now() - new Date(license.otp_sent_at).getTime();
      if (elapsed >= 0 && elapsed < 60 * 1000) return json(200, GENERIC);
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(otpCode, license.license_key);
    const now = new Date();
    const expiry = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    const { error: saveError } = await supabase
      .from('licenses')
      .update({
        otp_hash: otpHash,
        otp_expiry: expiry,
        otp_sent_at: now.toISOString()
      })
      .eq('license_key', license.license_key);
    if (saveError) throw saveError;

    const isEs = language === 'es';
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
      console.error('Brevo rejected the recovery email', response.status);
      return json(502, { success: false, code: 'EMAIL_FAILED', error: 'Could not send the recovery email.' });
    }

    return json(200, GENERIC);
  } catch (error) {
    return publicError(error);
  }
};
