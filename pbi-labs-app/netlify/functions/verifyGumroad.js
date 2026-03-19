exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { licenseKey } = JSON.parse(event.body);
    const productId = process.env.GUMROAD_PRODUCT_ID;

    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ product_id: productId, license_key: licenseKey })
    });

    const data = await response.json();

    // If Gumroad says the license doesn't exist at all
    if (!data.success) {
      return { statusCode: 200, body: JSON.stringify({ status: 'invalid' }) };
    }

    const purchase = data.purchase;

    // Strict Subscription Logic: Checks for refunds, chargebacks, and failed monthly payments
    const isTerminated = 
      purchase.refunded || 
      purchase.chargebacked || 
      purchase.subscription_failed_at !== null || 
      purchase.subscription_cancelled_at !== null || 
      purchase.subscription_ended_at !== null;

    if (isTerminated) {
      return { statusCode: 200, body: JSON.stringify({ status: 'canceled' }) };
    }

    // If it passes all checks, they are an active paying member
    return { statusCode: 200, body: JSON.stringify({ status: 'active', email: purchase.email }) };
    
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Gumroad Verification System Offline' }) };
  }
};