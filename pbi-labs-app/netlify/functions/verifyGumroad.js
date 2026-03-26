const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { licenseKey } = JSON.parse(event.body);
    const productId = process.env.GUMROAD_PRODUCT_ID;

    // The Master Keys
    const dbUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const dbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(dbUrl, dbKey);

    // 1. Verify with Gumroad (The Absolute Source of Truth)
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ product_id: productId, license_key: licenseKey })
    });

    const data = await response.json();

    // 2. If Gumroad says it's totally invalid or fake
    if (!data.success) {
      return { statusCode: 200, body: JSON.stringify({ status: 'invalid' }) };
    }

    const purchase = data.purchase;

    // 3. Strict Cancellation Logic (Now catches manual disables too)
    const isTerminated = 
      purchase.refunded || 
      purchase.chargebacked || 
      purchase.subscription_failed_at !== null || 
      purchase.subscription_cancelled_at !== null || 
      purchase.subscription_ended_at !== null ||
      purchase.disabled === true;

    // 4. THE SELF-HEALING DATABASE MECHANISM
    if (isTerminated) {
      // If Gumroad says it's dead, force Supabase to match and wipe seats instantly
      await supabase
        .from('licenses')
        .update({ is_active: false, device_1: null, device_2: null, seats_used: 0 })
        .eq('license_key', licenseKey);

      return { statusCode: 200, body: JSON.stringify({ status: 'canceled' }) };
    }

    // 5. If it passes all checks, ensure Supabase says it's active
    await supabase
      .from('licenses')
      .update({ is_active: true })
      .eq('license_key', licenseKey);

    return { statusCode: 200, body: JSON.stringify({ status: 'active', email: purchase.email }) };

  } catch (error) {
    console.error('Verification Error:', error);
    return { statusCode: 500, body: JSON.stringify({ status: 'error', message: error.message }) };
  }
};