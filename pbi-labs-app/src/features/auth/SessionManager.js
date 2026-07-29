import { supabase, checkSubscriptionStatus, verifyGumroadLicense } from '../../services/supabase';
import getFingerprint from '../../services/fingerprint';

export const validateLicense = async (licenseKey) => {
  try {
    const deviceId = await getFingerprint();
    const verification = await verifyGumroadLicense(licenseKey);
    
    if (!verification.valid) return { success: false, message: verification.message };

    const license = verification.data;

    const { data: seats, error: seatError } = await supabase
      .from('device_seats')
      .select('*')
      .eq('license_key', licenseKey.trim());

    if (seatError) throw seatError;

    const existingSeat = (seats || []).find(s => s.device_id === deviceId);
    if (existingSeat) {
      return { success: true, licenseKey, deviceId, financialData: license.financial_data, tier: 'pro' }; 
    }

    if ((seats || []).length < 2) {
      const { error: insertError } = await supabase
        .from('device_seats')
        .insert([{ license_key: licenseKey.trim(), device_id: deviceId, last_seen: new Date() }]);
      if (insertError) throw insertError;
      return { success: true, licenseKey, deviceId, financialData: license.financial_data, tier: 'pro' };
    }

    return { success: false, message: 'LIMIT_REACHED' };
  } catch (error) {
    return { success: false, message: 'Connection Error during validation.' };
  }
};

export const resumeSession = async () => {
  const savedKey = localStorage.getItem('pbi_license_key');
  const savedTier = localStorage.getItem('pbi_user_tier') || 'free';
  const deviceId = await getFingerprint();

  if (savedTier === 'free') {
    return { success: true, tier: 'free', deviceId, financialData: null };
  }

  if (!savedKey) return { success: false };
  
  const result = await validateLicense(savedKey);
  if (result.success) {
    return { success: true, tier: 'pro', licenseKey: savedKey, deviceId: result.deviceId, financialData: result.financialData };
  } else {
    localStorage.removeItem('pbi_license_key');
    localStorage.removeItem('pbi_user_tier');
    return { success: false };
  }
};

export const syncDataToCloud = async (identifier, financialData) => {
  try {
    if (!identifier) return { success: false, error: 'No identifier provided' };

    const { error } = await supabase
      .from('licenses')
      .update({ financial_data: financialData, updated_at: new Date() })
      .eq('license_key', identifier.trim());

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Cloud sync error:', err.message);
    return { success: false, error: err.message };
  }
};

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

export const verifyOtpAndReset = async (licenseKey, otpCode) => {
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('otp_code, otp_expiry')
      .eq('license_key', licenseKey.trim())
      .single();

    if (error || !data) throw new Error('Verification failed.');
    
    if (data.otp_code !== otpCode) return { success: false, message: 'Invalid Code.' };
    if (new Date() > new Date(data.otp_expiry)) return { success: false, message: 'Code Expired.' };

    const { error: resetError } = await supabase
      .from('device_seats')
      .delete()
      .eq('license_key', licenseKey.trim());
        
    if (resetError) throw resetError;

    await supabase
      .from('licenses')
      .update({ otp_code: null, otp_expiry: null })
      .eq('license_key', licenseKey.trim());
    
    return { success: true, message: 'All device seats released successfully. You may now log in.' };
  } catch (error) {
    return { success: false, message: 'Verification failed.' };
  }
};

export const startSessionHeartbeat = (licenseKey, deviceId, userTier, onKillSignal) => {
  const heartbeatInterval = setInterval(async () => {
    const result = await checkSubscriptionStatus(licenseKey, deviceId, userTier);
    
    if (!result.success || !result.isActive || !result.isAuthorized) {
      clearInterval(heartbeatInterval);
      onKillSignal('Security Override: Session terminated. Seat reallocated or subscription ended.');
    }
  }, 15 * 60 * 1000); 

  return () => clearInterval(heartbeatInterval); 
};