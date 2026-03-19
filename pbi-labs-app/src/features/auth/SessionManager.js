import { supabase, secureActivationPing, checkSubscriptionStatus } from '../../services/supabase';
import { generateDeviceId } from '../../services/fingerprint';

/**
 * CORE VALIDATION ENGINE
 * Executes the secure login protocol, hardware fingerprinting, and seat assignment.
 */
export const validateLicense = async (licenseKey) => {
  try {
    const deviceId = await generateDeviceId();
    
    // Secure ping prevents empty/spam database calls
    const pingResult = await secureActivationPing(licenseKey, deviceId);
    if (!pingResult.success) return { success: false, message: pingResult.error };

    const license = pingResult.data;

    // 1. Check Gumroad Status
    if (!license.is_active) {
      return { success: false, message: 'Subscription is Inactive or Canceled. Please renew via Gumroad.' };
    }

    // 2. Check if this specific device already owns a seat
    const isDevice1 = license.device_1 === deviceId;
    const isDevice2 = license.device_2 === deviceId;

    if (isDevice1 || isDevice2) {
      return { success: true, license, deviceId, financialData: license.financial_data }; 
    }

    // 3. Assign an empty seat if available
    if (license.seats_used === 0 || !license.device_1) {
      const { error } = await supabase.from('licenses').update({ device_1: deviceId, seats_used: Math.max(1, license.seats_used + 1) }).eq('license_key', licenseKey);
      if (error) throw error;
      return { success: true, license, deviceId, financialData: license.financial_data };
    }

    if (license.seats_used === 1 || !license.device_2) {
      const { error } = await supabase.from('licenses').update({ device_2: deviceId, seats_used: 2 }).eq('license_key', licenseKey);
      if (error) throw error;
      return { success: true, license, deviceId, financialData: license.financial_data };
    }

    // 4. No seats available
    return { success: false, message: 'LIMIT_REACHED' };
  } catch (error) {
    return { success: false, message: 'Connection Error during validation.' };
  }
};

/**
 * THE SILENT AUTO-LOGIN PIPELINE (New Override)
 * Resumes the session from persistent memory on browser refresh.
 */
export const resumeSession = async () => {
  const savedKey = localStorage.getItem('pbi_license_key');
  if (!savedKey) return { success: false };
  
  const result = await validateLicense(savedKey);
  if (result.success) {
    return { success: true, licenseKey: savedKey, deviceId: result.deviceId, financialData: result.financialData };
  } else {
    localStorage.removeItem('pbi_license_key'); // Wipe if invalid
    return { success: false };
  }
};

/**
 * OTP EMAIL TRIGGER
 * Pings the Brevo server to email the recovery code.
 */
export const triggerOtpEmail = async (licenseKey) => {
  try {
    const response = await fetch('/.netlify/functions/sendBrevoOtp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey })
    });
    
    if (!response.ok) throw new Error('Failed to dispatch email.');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Failed to send recovery code. Check connection.' };
  }
};

/**
 * OTP VERIFICATION & SEAT WIPE
 * Clears device_1 and device_2 so the user can securely log back in.
 */
export const verifyOtpAndReset = async (licenseKey, otpCode) => {
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('otp_code, otp_expiry')
      .eq('license_key', licenseKey)
      .single();

    if (error || !data) throw new Error('Verification failed.');
    
    if (data.otp_code !== otpCode) return { success: false, message: 'Invalid Code.' };
    if (new Date() > new Date(data.otp_expiry)) return { success: false, message: 'Code Expired.' };

    // Wipe Seats
    const { error: resetError } = await supabase
      .from('licenses')
      .update({ device_1: null, device_2: null, seats_used: 0, otp_code: null, otp_expiry: null })
      .eq('license_key', licenseKey);
        
    if (resetError) throw resetError;
    
    return { success: true, message: 'All device seats released successfully. You may now log in.' };
  } catch (error) {
    return { success: false, message: 'Verification failed.' };
  }
};

/**
 * THE TACTICAL HEARTBEAT ENGINE
 * Pings every 15 minutes to verify status and trigger the Kill Signal if a 3rd device stole the seat.
 */
export const startSessionHeartbeat = (licenseKey, deviceId, onKillSignal) => {
  const heartbeatInterval = setInterval(async () => {
    const result = await checkSubscriptionStatus(licenseKey, deviceId);
    
    if (!result.success || !result.isActive || !result.isAuthorized) {
      clearInterval(heartbeatInterval);
      onKillSignal('Security Override: Session terminated. Seat reallocated or subscription ended.');
    }
  }, 15 * 60 * 1000); 

  return () => clearInterval(heartbeatInterval); 
};

/**
 * THE ASSET VAULT PIPELINE
 * Receives the CashFlowEngine data and securely saves it to the user's Supabase row.
 */
export const syncDataToCloud = async (licenseKey, data) => {
  if (!licenseKey) return;
  try {
    const { error } = await supabase
      .from('licenses')
      .update({ financial_data: data })
      .eq('license_key', licenseKey);
      
    if (error) throw error;
  } catch (error) {
    console.error('Data Sync Error:', error);
  }
};