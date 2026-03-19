import { createClient } from '@supabase/supabase-js';

// Securely pulling your free-tier API keys
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * STRICT PROTOCOL: No Premature Pings.
 * Validates the payload BEFORE reaching out to Supabase to protect API limits.
 */
export const secureActivationPing = async (licenseKey, deviceId) => {
  if (!licenseKey || !deviceId) {
    return { success: false, error: 'Incomplete payload. Please enter a license key.' };
  }

  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Database Error: Could not verify license.' };
  }
};

/**
 * THE 15-MINUTE HEARTBEAT (Upgraded Dual-Ping)
 * Checks Gumroad subscription AND verifies the device has not been kicked out.
 */
export const checkSubscriptionStatus = async (licenseKey, currentDeviceId) => {
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('is_active, device_1, device_2')
      .eq('license_key', licenseKey)
      .single();

    if (error) throw error;
    
    // Verification: Is the main subscription active AND is this device still in a seat?
    const isAuthorized = (data.device_1 === currentDeviceId || data.device_2 === currentDeviceId);
    
    return { 
      success: true, 
      isActive: data.is_active,
      isAuthorized: isAuthorized 
    };
  } catch (error) {
    return { success: false, error: 'Heartbeat failure. Server connection lost.' };
  }
};

/**
 * SEAT RELEASE PROTOCOL
 * Clears the device ID from the database slot so the user can log in elsewhere.
 */
export const releaseDeviceSeat = async (licenseKey, deviceId) => {
  try {
    const { data: license } = await supabase
      .from('licenses')
      .select('device_1, device_2, seats_used')
      .eq('license_key', licenseKey)
      .single();

    if (!license) return false;

    let updatePayload = { seats_used: Math.max(0, license.seats_used - 1) };

    if (license.device_1 === deviceId) updatePayload.device_1 = null;
    else if (license.device_2 === deviceId) updatePayload.device_2 = null;
    else return true; // Device is already gone

    // Execute the wipe
    const { error } = await supabase
      .from('licenses')
      .update(updatePayload)
      .eq('license_key', licenseKey);

    if (error) throw error;
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * THE ASSET VAULT PIPELINE
 * Receives the cached data and saves it to the user's secure row.
 */
export const syncFinancialData = async (licenseKey, financialPayload) => {
  try {
    const { error } = await supabase
      .from('licenses')
      .update({ financial_data: financialPayload })
      .eq('license_key', licenseKey);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to sync to vault.' };
  }
};