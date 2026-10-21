import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { loadReminderPrefs, playTone, reminderCopy, saveReminderPrefs } from '../../services/reminderTone';

export default function ReminderSettings({ prefs, onChange }) {
  const { language } = useAppContext();
  const isEs = language === 'es';
  const [status, setStatus] = useState('');
  const pushReady = Boolean(process.env.REACT_APP_VAPID_PUBLIC_KEY);

  const update = (patch) => {
    const next = { ...prefs, ...patch };
    saveReminderPrefs(next);
    onChange(next);
  };

  const enable = async (checked) => {
    if (!checked) {
      update({ enabled: false });
      setStatus(isEs ? 'Recordatorios apagados.' : 'Reminders are off.');
      return;
    }
    if (typeof Notification === 'undefined') {
      setStatus(isEs ? 'Este navegador no acepta notificaciones.' : 'This browser does not support notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      update({ enabled: false });
      setStatus(isEs ? 'Permiso de notificaciones denegado.' : 'Notification permission was denied.');
      return;
    }
    update({ enabled: true });
    setStatus(isEs ? 'Recordatorios activados.' : 'Reminders are on.');
  };

  const sendTest = () => {
    const sampleDate = new Date();
    sampleDate.setDate(sampleDate.getDate() + Number(prefs.leadDays || 0));
    const nextDate = sampleDate.toISOString().slice(0, 10);
    const body = reminderCopy({
      tone: prefs.tone,
      language,
      name: isEs ? 'Pago de ejemplo' : 'Sample payment',
      amount: 120,
      nextDate,
      days: Number(prefs.leadDays || 0)
    });
    if (prefs.sound !== false) playTone(prefs.tone);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(isEs ? 'Pago próximo' : 'Payment coming up', { body, icon: '/logo192.png' });
    }
    setStatus(body);
  };

  const label = { display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 };
  const field = { width: '100%', padding: '10px', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: 8 };

  return (
    <div style={{ background: 'var(--card-bg)', padding: 20, borderRadius: 12, border: '1px solid var(--border-color)', marginBottom: 20 }}>
      <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>
        {isEs ? 'Recordatorios de pago' : 'Payment reminders'}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
        {isEs
          ? 'Elige el tono del mensaje. Con la app abierta suena en este dispositivo. Con las claves push configuradas, también llega cuando la app está cerrada.'
          : 'Pick the tone of the message. While this app is open, this device chimes. Once push keys are configured, the same reminder also arrives when the app is closed.'}
      </p>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <input type="checkbox" checked={prefs.enabled} onChange={(event) => enable(event.target.checked)} />
        <span>{isEs ? 'Avisarme de los pagos próximos' : 'Remind me about upcoming payments'}</span>
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div>
          <span style={label}>{isEs ? 'Tono' : 'Tone'}</span>
          <select value={prefs.tone} onChange={(event) => update({ tone: event.target.value })} style={field}>
            <option value="gentle">{isEs ? 'Amable' : 'Gentle'}</option>
            <option value="direct">{isEs ? 'Directo' : 'Direct'}</option>
            <option value="urgent">{isEs ? 'Urgente' : 'Urgent'}</option>
          </select>
        </div>
        <div>
          <span style={label}>{isEs ? 'Días de anticipación' : 'Days ahead'}</span>
          <input
            type="number"
            min="0"
            max="14"
            value={prefs.leadDays}
            onChange={(event) => update({ leadDays: Math.max(0, Math.min(14, Number(event.target.value) || 0)) })}
            style={field}
          />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
        <input type="checkbox" checked={prefs.sound !== false} onChange={(event) => update({ sound: event.target.checked })} />
        <span>{isEs ? 'Reproducir un sonido con el tono elegido' : 'Play a sound that matches the tone'}</span>
      </label>

      <button type="button" onClick={sendTest} style={{ padding: '10px 16px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
        {isEs ? 'Probar recordatorio' : 'Test reminder'}
      </button>

      {!pushReady && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 0 }}>
          {isEs
            ? 'Los avisos con la app cerrada se encienden cuando agregues REACT_APP_VAPID_PUBLIC_KEY en Netlify.'
            : 'Closed-app alerts turn on after you add REACT_APP_VAPID_PUBLIC_KEY in Netlify.'}
        </p>
      )}
      {status && <p style={{ color: 'var(--text-color)', fontSize: '0.85rem' }}>{status}</p>}
    </div>
  );
}

export function useReminderPrefsState() {
  const [prefs, setPrefs] = useState(() => loadReminderPrefs());
  return [prefs, setPrefs];
}
