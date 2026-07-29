const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Initialize Supabase with Service Role Key to bypass RLS for server-side webhooks
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Handle base64 encoded payloads from Netlify hosting
    const rawBody = event.isBase64Encoded 
      ? Buffer.from(event.body, 'base64').toString('utf-8') 
      : event.body;

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      // Fallback parser for URL-encoded form data sent by Gumroad
      const params = new URLSearchParams(rawBody);
      payload = Object.fromEntries(params);
    }

    const email = payload.email;
    const licenseKey = payload.license_key;

    if (!licenseKey) {
      return { statusCode: 200, body: 'Ignored: No License Key in payload.' };
    }

    // Check all possible Gumroad cancellation and refund flags
    const isCancellation = 
      payload.refunded === 'true' || 
      payload.refunded === true || 
      !!payload.subscription_ended_at || 
      !!payload.subscription_cancelled_at || 
      !!payload.subscription_failed_at;

    if (isCancellation) {
      // Deactivate license record and clear device slots
      await supabase
        .from('licenses')
        .update({ is_active: false, device_1: null, device_2: null, seats_used: 0 })
        .eq('license_key', licenseKey);
        
      // Purge active device seats
      await supabase
        .from('device_seats')
        .delete()
        .eq('license_key', licenseKey);

      return { statusCode: 200, body: 'Subscription Terminated.' };
    } else {
      // SAFE UPSERT: Only initializes default state if the record is brand new. 
      // This prevents monthly subscription renewals from wiping out existing user seats!
      const { data: existingLicense } = await supabase
        .from('licenses')
        .select('*')
        .eq('license_key', licenseKey)
        .single();

      if (!existingLicense) {
        await supabase
          .from('licenses')
          .insert({ 
            email: email, 
            license_key: licenseKey, 
            is_active: true,
            status: 'active'
          }); 
      } else {
        await supabase
          .from('licenses')
          .update({ is_active: true, status: 'active', email: email || existingLicense.email })
          .eq('license_key', licenseKey);
      }

      return { statusCode: 200, body: 'License Injected Successfully.' };
    }
  } catch (error) {
    console.error('Webhook Failure:', error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};