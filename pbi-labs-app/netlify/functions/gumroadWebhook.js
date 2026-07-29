const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf-8') : event.body;

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      const params = new URLSearchParams(rawBody);
      payload = Object.fromEntries(params);
    }

    const email = payload.email;
    const licenseKey = payload.license_key;

    if (!licenseKey) {
        return { statusCode: 200, body: 'Ignored: No License Key in payload.' };
    }

    const isCancellation = 
      payload.refunded === 'true' || 
      payload.refunded === true || 
      !!payload.subscription_ended_at || 
      !!payload.subscription_cancelled_at || 
      !!payload.subscription_failed_at;

    if (isCancellation) {
      await supabase
        .from('licenses')
        .update({ is_active: false, device_1: null, device_2: null, seats_used: 0 })
        .eq('license_key', licenseKey);
        
      await supabase
        .from('device_seats')
        .delete()
        .eq('license_key', licenseKey);

      return { statusCode: 200, body: 'Subscription Terminated.' };
    } else {
      // SAFE UPSERT: Only initializes default seats if the record is brand new. Prevents monthly renewal seat wipes!
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