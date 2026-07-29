import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function TermsOfService() {
  const { language } = useAppContext();
  const isEs = language === 'es';

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>
        {isEs ? 'Términos de Servicio' : 'Terms of Service'}
      </h2>
      <p style={{ lineHeight: '1.6', color: 'var(--text-color)', marginBottom: '15px' }}>
        {isEs 
          ? 'Cada licencia de suscripción de Gumroad admite un límite estricto de 2 asientos de dispositivos activos con verificación automática por latido del servidor y validación de suscripción en tiempo real.'
          : 'Each Gumroad subscription license enforces a strict maximum limit of 2 active device seats with automated server-side heartbeat verification and real-time subscription validation.'}
      </p>
    </div>
  );
}