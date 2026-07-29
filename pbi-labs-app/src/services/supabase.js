import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const verifyGumroadLicense = async (licenseKey) => {
  try {
    if (!licenseKey || !licenseKey.trim()) {
      return { valid: false, message: 'License key is required.' };
    }

    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey.trim())
      .single();

    if (error || !data) {
      return { valid: false, message: 'Invalid or inactive license key.' };
    }

    if (data.status !== 'active' && data.is_active !== true) {
      return { valid: false, message: 'License subscription is no longer active.' };
    }

    return { valid: true, data };
  } catch (err) {
    console.error('License Verification Error:', err);
    return { valid: false, message: 'Unable to verify license key.' };
  }
};

export const verifyLicense = verifyGumroadLicense;

export const createDeviceSeat = async (licenseKey, deviceId, userTier = 'pro') => {
  try {
    if (userTier === 'free') {
      return { success: true, message: 'Free tier session active.', userData: null };
    }

    const trimmedKey = licenseKey ? licenseKey.trim() : '';
    if (!trimmedKey) return { success: false, message: 'License key is required.' };

    const { data: seats, error: seatError } = await supabase
      .from('device_seats')
      .select('*')
      .eq('license_key', trimmedKey);

    if (seatError) throw seatError;

    const existingSeat = (seats || []).find(s => s.device_id === deviceId);
    if (existingSeat) {
      return { success: true, message: 'Device recognized.', userData: existingSeat.user_data };
    }

    if ((seats || []).length >= 2) {
      return { 
        success: false, 
        message: 'Seat limit reached (2/2 devices active). Please release a seat using Lost Device recovery.' 
      };
    }

    const { data: newSeat, error: insertError } = await supabase
      .from('device_seats')
      .insert([
        { license_key: trimmedKey, device_id: deviceId, last_seen: new Date() }
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

export const releaseDeviceSeat = async (licenseKey, deviceId) => {
  try {
    if (!licenseKey) return { success: true };
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

export const checkSubscriptionStatus = async (licenseKey, deviceId, userTier = 'pro') => {
  if (userTier === 'free') {
    return { success: true, isActive: true, isAuthorized: true };
  }
  if (!licenseKey) return { success: false, isActive: false, isAuthorized: false };
  
  const verification = await verifyGumroadLicense(licenseKey);
  if (!verification.valid) {
    return { success: false, isActive: false, isAuthorized: false };
  }
  
  return { success: true, isActive: true, isAuthorized: true };
};