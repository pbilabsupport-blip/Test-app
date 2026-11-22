const { schedule } = require('@netlify/functions');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client using environment variables stored in Netlify
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async function(event, context) {
  try {
    console.log('Initiating Server-Side Heartbeat...');
    
    // Perform a lightweight query to register activity in Supabase
    const { data, error } = await supabase
      .from('users') // Assumes a 'users' or similar table exists
      .select('id')
      .limit(1);

    if (error) {
      console.error('Heartbeat ping failed:', error.message);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    console.log('Heartbeat successful. Supabase database is awake.');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Heartbeat successful' }),
    };
  } catch (error) {
    console.error('Fatal Heartbeat Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};

// Schedule the function to run every 12 hours (cron format: minute hour day month day-of-week)
exports.handler = schedule('0 */12 * * *', handler);