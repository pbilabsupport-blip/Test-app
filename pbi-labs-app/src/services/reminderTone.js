export const REMINDER_PREFS_KEY = 'pbi_reminder_prefs';

export const DEFAULT_REMINDER_PREFS = {
  enabled: false,
  tone: 'direct',
  leadDays: 1,
  sound: true
};

export function loadReminderPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(REMINDER_PREFS_KEY) || 'null');
    if (!saved) return { ...DEFAULT_REMINDER_PREFS };
    const tone = ['gentle', 'direct', 'urgent'].includes(saved.tone) ? saved.tone : 'direct';
    const leadDays = Math.max(0, Math.min(14, Number(saved.leadDays) || 1));
    return {
      enabled: saved.enabled === true,
      tone,
      leadDays,
      sound: saved.sound !== false
    };
  } catch (err) {
    return { ...DEFAULT_REMINDER_PREFS };
  }
}

export function saveReminderPrefs(prefs) {
  localStorage.setItem(REMINDER_PREFS_KEY, JSON.stringify(prefs));
}

export function reminderCopy({ tone, language, name, amount, nextDate, days }) {
  const isEs = language === 'es';
  const money = `$${Number(amount || 0).toFixed(2)}`;
  const when = days <= 0
    ? (isEs ? 'hoy' : 'today')
    : days === 1
      ? (isEs ? 'mañana' : 'tomorrow')
      : (isEs ? `en ${days} días` : `in ${days} days`);
  if (tone === 'gentle') {
    return isEs
      ? `Un recordatorio amable: ${name} (${money}) vence ${when} (${nextDate}).`
      : `A gentle reminder: ${name} (${money}) is due ${when} (${nextDate}).`;
  }
  if (tone === 'urgent') {
    return isEs
      ? `Atención: el pago de ${name} por ${money} vence ${when}. No lo dejes pasar.`
      : `Heads up: your ${name} payment of ${money} is due ${when}. Don't let it slip.`;
  }
  return isEs
    ? `Pago próximo: ${name} por ${money}, vence ${when}.`
    : `Upcoming payment: ${name} for ${money}, due ${when}.`;
}

export function playTone(tone) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  if (tone === 'gentle') {
    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    gain.gain.value = 0.04;
  } else if (tone === 'urgent') {
    oscillator.type = 'square';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.05;
  } else {
    oscillator.type = 'triangle';
    oscillator.frequency.value = 660;
    gain.gain.value = 0.05;
  }
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
  oscillator.stop(ctx.currentTime + 0.4);
  oscillator.onended = () => ctx.close();
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const parts = String(dateStr).split('-').map(Number);
  if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) return null;
  const target = new Date(parts[0], parts[1] - 1, parts[2]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}
