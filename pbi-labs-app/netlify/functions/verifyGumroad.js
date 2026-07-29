const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { licenseKey, email, deviceId } = JSON.parse(event.body);

    if (!licenseKey || !email || !deviceId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required parameters.' }) };
    }

    // 1. Verify license with Gumroad API
    const gumroadResponse = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_permalink: process.env.GUMROAD_PRODUCT_PERMALINK,
        license_key: licenseKey
      })
    });

    const gumroadData = await gumroadResponse.json();

    if (!gumroadData.success || gumroadData.purchase.cancelled || gumroadData.purchase.ended) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid or terminated Gumroad license.' }) };
    }

    // 2. Check active device seats in Supabase
    const { data: activeDevices, error: dbError } = await supabase
      .from('device_seats')
      .select('*')
      .eq('license_key', licenseKey);

    if (dbError) {
      throw new Error(dbError.message);
    }

    const isAlreadyRegistered = activeDevices.find(d => d.device_id === deviceId);

    if (!isAlreadyRegistered) {
      if (activeDevices.length >= 2) {
        return { 
          statusCode: 403, 
          body: JSON.stringify({ error: 'Device limit reached. Maximum 2 device seats allowed per license.' }) 
        };
      }

      // Register new device seat
      const { error: insertError } = await supabase
        .from('device_seats')
        .insert([{ license_key: licenseKey, email: email, device_id: deviceId, last_ping: new Date() }]);

      if (insertError) throw new Error(insertError.message);
    } else {
      // Update heartbeat timestamp for existing device
      await supabase
        .from('device_seats')
        .update({ last_ping: new Date() })
        .eq('license_key', licenseKey)
        .eq('device_id', deviceId);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'License verified and device seat secured.' })
    };

  } catch (error) {
    console.error('Gumroad Verification Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error during verification.' }) };
  }
};