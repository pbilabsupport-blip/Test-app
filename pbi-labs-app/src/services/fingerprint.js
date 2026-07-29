import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise = null;

export const getFingerprint = async () => {
  try {
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }
    const fp = await fpPromise;
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('Fingerprint generation failed, falling back to local ID:', error);
    let fallbackId = localStorage.getItem('pbi_fallback_device_id');
    if (!fallbackId) {
      fallbackId = 'dev_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('pbi_fallback_device_id', fallbackId);
    }
    return fallbackId;
  }
};

export default getFingerprint;