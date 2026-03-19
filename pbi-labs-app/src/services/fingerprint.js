import fpPromise from '@fingerprintjs/fingerprintjs';

/**
 * Generates an ironclad Device ID using FingerprintJS (Free Tier).
 * P.B.I. Labs Protocol: Includes an Auto-Heal Fallback for Ad-Blockers.
 */
export const generateDeviceId = async () => {
  try {
    // Attempt to load the free tier fingerprinting agent
    const fp = await fpPromise.load();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.warn('P.B.I. Labs Alert: Ad-blocker detected. Deploying Auto-Heal Fallback ID.');
    
    // Auto-Heal Fix: If blocked, create a local backup ID so the app boots safely
    let backupId = localStorage.getItem('pbi_backup_device_id');
    if (!backupId) {
      backupId = 'fallback-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('pbi_backup_device_id', backupId);
    }
    return backupId;
  }
};