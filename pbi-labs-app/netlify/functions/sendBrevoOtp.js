const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { licenseKey } = JSON.parse(event.body);

    // BULLETPROOFING: Trim invisible spaces that cause database mismatches
    const cleanLicenseKey = licenseKey ? licenseKey.trim() : '';

    // BULLETPROOFING: Catch-all for environment variables
    const dbUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const dbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = createClient(dbUrl, dbKey);
    
    const { data: license, error: dbError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', cleanLicenseKey)
      .single();

    // EXACT DIAGNOSTICS: Stop guessing why it fails
    if (dbError) throw new Error(`Database Error: ${dbError.message}`);
    if (!license) throw new Error('License not found in database.');
    if (license.is_active !== true) throw new Error('License exists but is marked as INACTIVE in Supabase.');

    const userEmail = license.email;

    // Generate OTP (15 Min Expiry)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 15 * 60000).toISOString();

    // Save OTP to Supabase
    await supabase.from('licenses').update({ otp_code: otpCode, otp_expiry: expiryDate }).eq('license_key', cleanLicenseKey);

    // Dispatch Email via Brevo
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

    if (!response.ok) {
       const brevoError = await response.text();
       throw new Error(`Brevo API Failed: ${brevoError}`);
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, message: 'OTP Sent' }) };
  } catch (error) {
    // This exact error will now show in your Netlify log
    return { statusCode: 500, body: JSON.stringify({ success: false, message: error.message }) };
  }
};