import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function ContactUs() {
  const { language } = useAppContext();
  const isEs = language === 'es';

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>
        {isEs ? 'Contacto y Soporte' : 'Contact & Support'}
      </h2>
      <p style={{ lineHeight: '1.6', color: 'var(--text-color)', marginBottom: '15px' }}>
        {isEs 
          ? 'Para asistencia con su licencia de Gumroad o problemas de dispositivos, utilice la función de recuperación por código OTP directamente en la pantalla de activación para autoservicio instantáneo.'
          : 'For Gumroad license assistance or device seat management, use the OTP recovery feature directly on the activation screen for instant self-service.'}
      </p>
    </div>
  );
}