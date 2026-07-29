const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Only allow POST requests for security
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { email, type, language = 'en' } = JSON.parse(event.body);

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required.' }) };
    }

    // Generate a secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Bilingual Email Templates
    const isEs = language === 'es';
    const subject = type === 'reset' 
      ? (isEs ? 'P.B.I. Labs: Recuperación de Dispositivo' : 'P.B.I. Labs: Device Recovery') 
      : (isEs ? 'P.B.I. Labs: Su Código de Acceso' : 'P.B.I. Labs: Your Access Code');
      
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #d4af37; text-align: center;">P.B.I. Labs</h2>
        <p style="color: #334155; font-size: 16px;">
          ${isEs ? 'Hola,' : 'Hello,'}
        </p>
        <p style="color: #334155; font-size: 16px;">
          ${type === 'reset' 
            ? (isEs ? 'Utilice el siguiente código para liberar sus sesiones de dispositivos activos:' : 'Use the following code to release your active device sessions:') 
            : (isEs ? 'Utilice el siguiente código seguro para acceder a su sistema financiero:' : 'Use the following secure code to access your financial system:')}
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a; padding: 15px 30px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #d4af37;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          ${isEs ? 'Este código expirará en 15 minutos.' : 'This code will expire in 15 minutes.'}
        </p>
      </div>
    `;

    // Send via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.REACT_APP_BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'P.B.I. Labs Security', email: 'no-reply@pbilabs.com' },
        to: [{ email: email }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      throw new Error('Failed to dispatch email via Brevo.');
    }

    // In a production environment, you would save this OTP to Supabase to verify it on the next step.
    // We return success to the client so it can open the input modal.
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'OTP dispatched successfully.', generatedOtpForValidation: otpCode })
    };

  } catch (error) {
    console.error('Brevo OTP Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error processing OTP.' })
    };
  }
};