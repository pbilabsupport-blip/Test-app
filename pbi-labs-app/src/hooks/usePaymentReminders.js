import { useEffect } from 'react';
import { useAppContext, LICENSE_STORAGE_KEY } from '../context/AppContext';
import { syncReminders, savePushSubscription } from '../services/licenseApi';
import { daysUntil, playTone, reminderCopy } from '../services/reminderTone';

const NOTIFIED_KEY = 'pbi_notified_days';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function dueItems(liabilities, leadDays) {
  return (liabilities || []).filter((item) => {
    if (!item.requiresPayments || !item.nextDate) return false;
    const days = daysUntil(item.nextDate);
    return days !== null && days >= 0 && days <= leadDays;
  });
}

export default function usePaymentReminders(liabilities, prefs) {
  const { authSession, language, getAccessToken } = useAppContext();
  const email = authSession?.email;

  useEffect(() => {
    if (!prefs?.enabled || !email || typeof Notification === 'undefined') return undefined;
    if (Notification.permission !== 'granted') return undefined;

    const tick = () => {
      const lead = Number(prefs.leadDays) || 0;
      let notified = {};
      try {
        notified = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}');
      } catch (err) {
        notified = {};
      }
      const today = new Date().toISOString().slice(0, 10);
      dueItems(liabilities, lead).forEach((item) => {
        const stamp = `${item.id}:${item.nextDate}:${today}`;
        if (notified[stamp]) return;
        notified[stamp] = true;
        const days = daysUntil(item.nextDate);
        const body = reminderCopy({
          tone: prefs.tone,
          language,
          name: item.name,
          amount: item.paymentAmount,
          nextDate: item.nextDate,
          days
        });
        try {
          new Notification(language === 'es' ? 'Pago próximo' : 'Payment coming up', {
            body,
            icon: '/logo192.png',
            tag: `pbi-${item.id}-${item.nextDate}`
          });
        } catch (err) {
          // Some browsers only allow notifications from a service worker.
        }
        if (prefs.sound !== false) {
          try { playTone(prefs.tone); } catch (err) { /* sound is optional */ }
        }
      });
      localStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified));
    };

    tick();
    const timer = setInterval(tick, 60 * 1000);
    return () => clearInterval(timer);
  }, [liabilities, prefs, email, language]);

  useEffect(() => {
    if (!email) return undefined;
    let cancelled = false;

    const sync = async () => {
      const licenseKey = localStorage.getItem(LICENSE_STORAGE_KEY);
      const accessToken = authSession?.tier === 'free' ? await getAccessToken() : null;
      const items = prefs?.enabled
        ? (liabilities || []).filter((item) => item.requiresPayments && item.nextDate).map((item) => ({
          itemKey: String(item.id),
          name: item.name,
          amount: Number(item.paymentAmount) || 0,
          nextDate: item.nextDate
        }))
        : [];

      try {
        await syncReminders({
          email,
          accessToken,
          licenseKey,
          tone: prefs?.tone || 'direct',
          leadDays: prefs?.leadDays ?? 1,
          language,
          items
        });
      } catch (err) {
        return;
      }

      const vapid = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      if (cancelled || !prefs?.enabled || !vapid || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

      try {
        await navigator.serviceWorker.register('/service-worker.js');
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapid)
          });
        }
        if (cancelled) return;
        await savePushSubscription({
          email,
          accessToken,
          licenseKey,
          subscription: subscription.toJSON(),
          tone: prefs.tone,
          leadDays: prefs.leadDays,
          language
        });
      } catch (err) {
        // Push stays off until the VAPID key and service worker are accepted.
      }
    };

    const timer = setTimeout(sync, 700);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [liabilities, prefs, email, authSession?.tier, language, getAccessToken]);
}
