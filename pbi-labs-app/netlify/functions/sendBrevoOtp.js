const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { licenseKey } = JSON.parse(event.body);

    // 1. The Asset Verification: Ask our own Supabase Vault instead of Gumroad
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: license, error: dbError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .single();

    if (dbError || !license || !license.is_active) {
      throw new Error('License Inactive or Terminated');
    }

    const userEmail = license.email;

    // 2. Generate OTP (15 Min Expiry)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 15 * 60000).toISOString();

    // 3. Save OTP to Supabase using the Master Key
    await supabase.from('licenses').update({ otp_code: otpCode, otp_expiry: expiryDate }).eq('license_key', licenseKey);

    // 4. Dispatch Email via Brevo
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { email: process.env.BREVO_SENDER_EMAIL, name: 'P.B.I. Labs Vault' },
        to: [{ email: userEmail }],
        subject: 'Código de Recuperación / Recovery Code',
        htmlContent: `
          <div style="font-family: Arial; text-align: center; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #d4af37;">P.B.I. Labs</h2>
            <p style="color: #333;">Your secure device bypass code is / Su código de seguridad es:</p>
            <h1 style="letter-spacing: 5px; color: #1a1a1a; background: #fff; padding: 15px; border: 1px solid #ccc; display: inline-block;">${otpCode}</h1>
            <p style="color: #ff4444; font-size: 12px; margin-top: 20px;">This code expires in 15 minutes. Entering this will kick out all active devices.</p>
          </div>
        `
      })
    });

    if (!response.ok) throw new Error('Brevo Email Failed');

    return { statusCode: 200, body: JSON.stringify({ success: true, message: 'OTP Sent' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: error.message }) };
  }
};