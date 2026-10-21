import getFingerprint from '../../services/fingerprint';
import { verifyLicense, requestDeviceReset, confirmDeviceReset } from '../../services/licenseApi';
import { LICENSE_STORAGE_KEY } from '../../context/AppContext';

export const validateLicense = async (licenseKey, email) => {
  const deviceId = await getFingerprint();
  const result = await verifyLicense({ licenseKey, email, deviceId, mode: 'activate' });
  return { success: true, licenseKey, deviceId, email: result.email, tier: 'pro' };
};

export const resumeSession = async (email) => {
  const savedKey = localStorage.getItem(LICENSE_STORAGE_KEY);
  if (!savedKey || !email) return { success: false };
  const deviceId = await getFingerprint();
  try {
    await verifyLicense({ licenseKey: savedKey, email, deviceId, mode: 'heartbeat' });
    return { success: true, tier: 'pro', deviceId };
  } catch (error) {
    return { success: false, message: error.code || error.message };
  }
};

export const triggerOtpEmail = (email, language) => requestDeviceReset({ email, language });

export const verifyOtpAndReset = (email, otpCode) => confirmDeviceReset({ email, code: otpCode });

export const startSessionHeartbeat = () => () => {};
