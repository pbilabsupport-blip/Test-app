import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client using environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Verify license key against Gumroad / Supabase
 */
export const verifyGumroadLicense = async (licenseKey) => {
  try {
    if (!licenseKey || !licenseKey.trim()) {
      return { valid: false, message: 'License key is required.' };
    }

    // Ping Supabase licenses table
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey.trim())
      .single();

    if (error || !data) {
      // Fallback check if active in Gumroad verification table
      return { valid: false, message: 'Invalid or inactive license key.' };
    }

    if (data.status !== 'active') {
      return { valid: false, message: 'License subscription is no longer active.' };
    }

    return { valid: true, data };
  } catch (err) {
    console.error('License Verification Error:', err);
    return { valid: false, message: 'Unable to verify license key.' };
  }
};

// Alias for backwards compatibility
export const verifyLicense = verifyGumroadLicense;

/**
 * Create or assign a device seat (Max 2 seats per license)
 */
export const createDeviceSeat = async (licenseKey, deviceId) => {
  try {
    const { data: seats, error: seatError } = await supabase
      .from('device_seats')
      .select('*')
      .eq('license_key', licenseKey.trim());

    if (seatError) throw seatError;

    const existingSeat = seats.find(s => s.device_id === deviceId);
    if (existingSeat) {
      return { success: true, message: 'Device recognized.', userData: existingSeat.user_data };
    }

    if (seats.length >= 2) {
      return { 
        success: false, 
        message: 'Seat limit reached (2/2 devices active). Please release a seat using Lost Device recovery.' 
      };
    }

    // Insert new seat
    const { data: newSeat, error: insertError } = await supabase
      .from('device_seats')
      .insert([
        { license_key: licenseKey.trim(), device_id: deviceId, last_seen: new Date() }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return { success: true, message: 'Seat activated successfully.', userData: newSeat?.user_data || null };
  } catch (err) {
    console.error('Device Seat Error:', err);
    return { success: false, message: 'Failed to assign device seat.' };
  }
};

/**
 * Release device seat on logout or recovery
 */
export const releaseDeviceSeat = async (licenseKey, deviceId) => {
  try {
    const { error } = await supabase
      .from('device_seats')
      .delete()
      .eq('license_key', licenseKey.trim())
      .eq('device_id', deviceId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Release Seat Error:', err);
    return { success: false, message: 'Failed to release seat.' };
  }
};