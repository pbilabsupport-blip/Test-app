const { schedule } = require('@netlify/functions');
const { getSupabaseAdmin } = require('./_lib');

const handler = async function () {
  try {
    console.log('Initiating server-side Supabase heartbeat...');
    const supabase = getSupabaseAdmin();

    // Lightweight query against an existing table using the service role
    const { error } = await supabase
      .from('licenses')
      .select('license_key')
      .limit(1);

    if (error) {
      console.error('Heartbeat ping failed:', error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }

    console.log('Heartbeat successful. Supabase database is awake.');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Heartbeat successful' })
    };
  } catch (error) {
    console.error('Fatal heartbeat error:', error.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

// Runs every 12 hours to keep Supabase active
exports.handler = schedule('0 */12 * * *', handler);