async function postJson(path, payload) {
  let response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    const error = new Error('Could not reach the license server.');
    error.code = 'NETWORK';
    throw error;
  }
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export async function verifyLicense({ licenseKey, email, deviceId, mode }) {
  const { response, data } = await postJson('/.netlify/functions/verifyGumroad', {
    licenseKey,
    email,
    deviceId,
    mode: mode || 'activate'
  });
  if (mode === 'release') return data;
  if (!response.ok || !data.success) {
    const error = new Error(data.error || 'License verification failed.');
    error.code = data.code || 'INVALID_LICENSE';
    throw error;
  }
  return data;
}

export async function requestDeviceReset({ email, language }) {
  const { response, data } = await postJson('/.netlify/functions/sendBrevoOtp', { email, language });
  if (!response.ok || data.success === false) {
    const error = new Error(data.error || 'Could not send the recovery code.');
    error.code = data.code || 'EMAIL_FAILED';
    throw error;
  }
  return data;
}

export async function confirmDeviceReset({ email, code }) {
  const { response, data } = await postJson('/.netlify/functions/verifyDeviceOtp', { email, code });
  if (!response.ok || !data.success) {
    const error = new Error(data.error || 'That code is invalid or expired.');
    error.code = data.code || 'BAD_CODE';
    throw error;
  }
  return data;
}

export async function syncReminders(payload) {
  const { response, data } = await postJson('/.netlify/functions/syncReminders', payload);
  if (!response.ok || data.success === false) {
    const error = new Error(data.error || 'Could not save reminders.');
    error.code = data.code || 'SYNC_FAILED';
    throw error;
  }
  return data;
}

export async function savePushSubscription(payload) {
  const { response, data } = await postJson('/.netlify/functions/savePushSubscription', payload);
  if (!response.ok || data.success === false) {
    const error = new Error(data.error || 'Could not save this device for push.');
    error.code = data.code || 'PUSH_FAILED';
    throw error;
  }
  return data;
}
