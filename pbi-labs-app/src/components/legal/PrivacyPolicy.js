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
          ? 'Sus datos financieros se almacenan de forma segura y privada en Supabase mediante nombres de espacio cifrados y huellas digitales de dispositivos, garantizando que ninguna información sea compartida o cruzada con otros usuarios.'
          : 'Your financial data is securely and privately stored in Supabase using encrypted namespaces and device digital fingerprints, ensuring zero information cross-contamination between users.'}
      </p>
    </div>
  );
}