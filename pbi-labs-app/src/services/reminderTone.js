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
    const rawLead = Number(saved.leadDays);
    const leadDays = Number.isFinite(rawLead) ? Math.max(0, Math.min(14, Math.round(rawLead))) : 1;
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

export function parseDateParts(dateStr) {
  if (!dateStr) return null;
  const cleaned = String(dateStr).trim().replace(/\//g, '-');
  const rawParts = cleaned.split('-');
  if (rawParts.length !== 3) return null;

  const nums = rawParts.map(Number);
  if (nums.some((n) => Number.isNaN(n))) return null;

  let year;
  let month;
  let day;

  if (rawParts[0].length === 4) {
    // YYYY-MM-DD
    [year, month, day] = nums;
  } else if (rawParts[2].length === 4) {
    // MM-DD-YYYY
    [month, day, year] = nums;
  } else {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) return null;
  return { year, month, day };
}

export function toIsoDate(dateStr) {
  const parts = parseDateParts(dateStr);
  if (!parts) return null;
  const mm = String(parts.month).padStart(2, '0');
  const dd = String(parts.day).padStart(2, '0');
  return `${parts.year}-${mm}-${dd}`;
}

export function daysUntil(dateStr) {
  const parts = parseDateParts(dateStr);
  if (!parts) return null;
  const target = new Date(parts.year, parts.month - 1, parts.day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}