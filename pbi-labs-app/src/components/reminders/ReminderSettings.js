import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { loadReminderPrefs, playTone, reminderCopy, saveReminderPrefs } from '../../services/reminderTone';
import { FiBell, FiBellOff, FiAlertCircle } from 'react-icons/fi';

export function useReminderPrefsState() {
  const [prefs, setPrefs] = useState(() => loadReminderPrefs());
  return [prefs, setPrefs];
}

export default function ReminderSettings({ prefs, onChange }) {
  const { language } = useAppContext();
  const isEs = language === 'es';
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const update = (patch) => {
    const next = { ...prefs, ...patch };
    saveReminderPrefs(next);
    onChange(next);
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert(isEs ? 'Su navegador no soporta notificaciones push.' : 'Your browser does not support push notifications.');
      return;
    }
    
    try {
      const status = await Notification.requestPermission();
      setPermissionStatus(status);
      if (status === 'granted') {
        update({ enabled: true });
      } else {
        update({ enabled: false });
      }
    } catch (error) {
      console.error('Permission request failed', error);
    }
  };

  const handleToggle = () => {
    if (prefs.enabled) {
      update({ enabled: false });
    } else {
      if (permissionStatus === 'granted') {
        update({ enabled: true });
      } else {
        requestPermission();
      }
    }
  };

  const sendTest = () => {
    const sampleDate = new Date();
    sampleDate.setDate(sampleDate.getDate() + Number(prefs.leadDays || 0));
    
    // Format to MM-DD-YYYY
    const mm = String(sampleDate.getMonth() + 1).padStart(2, '0');
    const dd = String(sampleDate.getDate()).padStart(2, '0');
    const yyyy = sampleDate.getFullYear();
    const nextDate = `${mm}-${dd}-${yyyy}`;
    
    const body = reminderCopy({
      tone: prefs.tone,
      language,
      name: isEs ? 'Préstamo de Auto (Ejemplo)' : 'Car Loan (Sample)',
      amount: 350,
      nextDate,
      days: Number(prefs.leadDays || 0)
    });
    
    if (prefs.sound !== false) playTone(prefs.tone);
    
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(isEs ? 'P.B.I. Labs: Pago Próximo' : 'P.B.I. Labs: Payment Due', { body, icon: '/logo192.png' });
    }
  };

  return (
    <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '25px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
            {prefs.enabled ? <FiBell style={{ color: '#10b981' }}/> : <FiBellOff style={{ color: 'var(--text-muted)' }}/>}
            {isEs ? 'Notificaciones Push Inteligentes' : 'Smart Push Notifications'}
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', lineHeight: '1.5' }}>
            {isEs 
              ? 'Reciba alertas en el fondo de su teléfono cuando una deuda esté por vencer, incluso si la aplicación está cerrada.' 
              : 'Receive background alerts directly to your device when a bill is due, even if the vault is closed.'}
          </p>
        </div>

        <button 
          onClick={handleToggle}
          style={{
            padding: '12px 24px',
            background: prefs.enabled ? 'rgba(16, 185, 129, 0.1)' : 'var(--primary-color)',
            color: prefs.enabled ? '#10b981' : '#000',
            border: prefs.enabled ? '1px solid #10b981' : 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '0.95rem'
          }}>
          {prefs.enabled ? (isEs ? 'Desactivar Alertas' : 'Disable Alerts') : (isEs ? 'Activar Alertas' : 'Enable Alerts')}
        </button>
      </div>

      {/* SMART PERMISSION HANDLING: Tells user exactly how to fix blocked notifications */}
      {permissionStatus === 'denied' && (
        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <FiAlertCircle style={{ color: '#ef4444', fontSize: '1.5rem', marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.9rem', color: '#ef4444', lineHeight: '1.5' }}>
            <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.95rem' }}>
              {isEs ? 'Permiso Denegado por el Navegador' : 'Permission Denied by Browser'}
            </strong>
            {isEs 
              ? 'Su navegador bloqueó las notificaciones. Haga clic en el candado 🔒 junto a la barra de direcciones web arriba, cambie Notificaciones a "Permitir", y recargue la página.' 
              : 'Your browser blocked notifications. Click the lock icon 🔒 next to the web address bar above, set Notifications to "Allow", and reload the page.'}
          </div>
        </div>
      )}
      
      {prefs.enabled && (
         <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
               <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                 {isEs ? 'Tono del Mensaje' : 'Message Tone'}
               </label>
               <select 
                 value={prefs.tone} 
                 onChange={e => update({ tone: e.target.value })}
                 style={{ width: '100%', padding: '12px 14px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer', outline: 'none' }}>
                 <option value="gentle">{isEs ? 'Amable (Recordatorio suave)' : 'Gentle (Soft reminder)'}</option>
                 <option value="direct">{isEs ? 'Directo (Estándar)' : 'Direct (Standard)'}</option>
                 <option value="urgent">{isEs ? 'Urgente (Alta prioridad)' : 'Urgent (High priority)'}</option>
               </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
               <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                 {isEs ? 'Aviso Previo' : 'Lead Time'}
               </label>
               <select 
                 value={prefs.leadDays} 
                 onChange={e => update({ leadDays: Number(e.target.value) })}
                 style={{ width: '100%', padding: '12px 14px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer', outline: 'none' }}>
                 <option value={1}>{isEs ? '1 Día antes' : '1 Day before'}</option>
                 <option value={2}>{isEs ? '2 Días antes' : '2 Days before'}</option>
                 <option value={3}>{isEs ? '3 Días antes' : '3 Days before'}</option>
               </select>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={prefs.sound !== false} 
                  onChange={e => update({ sound: e.target.checked })} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
                  {isEs ? 'Reproducir sonido al notificar' : 'Play audio chime on notification'}
                </span>
              </label>

              <button 
                type="button" 
                onClick={sendTest} 
                style={{ padding: '10px 18px', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                {isEs ? 'Probar Alerta' : 'Test Alert'}
              </button>
            </div>
         </div>
      )}
    </div>
  );
}