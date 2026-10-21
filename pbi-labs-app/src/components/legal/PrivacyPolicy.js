import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function PrivacyPolicy() {
  const { language } = useAppContext();
  const isEs = language === 'es';

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>
        {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
      </h2>
      <p style={{ lineHeight: '1.6', color: 'var(--text-color)', marginBottom: '15px' }}>
        {isEs
          ? 'Su estado financiero (ingresos, gastos, activos y pasivos) se guarda en este navegador. No se vende y no se mezcla con la cuenta de otra persona.'
          : 'Your financial statement (income, expenses, assets, and liabilities) stays in this browser. It is not sold, and it is not mixed with another person\'s account.'}
      </p>
      <p style={{ lineHeight: '1.6', color: 'var(--text-color)', marginBottom: '15px' }}>
        {isEs
          ? 'Si activa una licencia Pro, guardamos su correo, la clave de licencia y un identificador de dispositivo en Supabase para aplicar el límite de 2 dispositivos. Si enciende recordatorios, también guardamos el nombre, monto y fecha del pago, más la suscripción push de este dispositivo, únicamente para enviarle ese aviso.'
          : 'If you activate a Pro license, we store your email, license key, and a device id in Supabase so we can enforce the 2-device limit. If you turn on reminders, we also store the payment name, amount, and date, plus this device\'s push subscription, only so we can send that reminder.'}
      </p>
      <p style={{ lineHeight: '1.6', color: 'var(--text-color)' }}>
        {isEs
          ? 'La cuenta Gratis puede mostrar anuncios de Google AdSense. La cuenta Pro no muestra anuncios dentro de la bóveda. AdSense usa sus propias cookies; puede rechazarlas en el aviso de cookies del navegador.'
          : 'The Free account may show Google AdSense ads. Pro does not show ads inside the vault. AdSense uses its own cookies; you can reject non-essential cookies in your browser.'}
      </p>
    </div>
  );
}
