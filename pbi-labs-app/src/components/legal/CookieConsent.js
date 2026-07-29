import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useAppContext();
  const isEs = language === 'es';

  useEffect(() => {
    const consent = localStorage.getItem('pbi_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('pbi_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#111827', color: '#ffffff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50, boxSizing: 'border-box', flexWrap: 'wrap', gap: '12px' }}>
      <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: '1.4', flex: 1, minWidth: '280px' }}>
        {isEs 
          ? 'Utilizamos cookies para publicar anuncios de Google AdSense y mejorar su experiencia. Al continuar utilizando este software, usted acepta nuestro uso de cookies.' 
          : 'We use cookies to serve targeted Google AdSense ads and improve your experience. By continuing to use this software, you consent to our use of cookies.'}
      </p>
      <button onClick={handleAccept} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 'bold', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
        {isEs ? 'Aceptar' : 'Accept'}
      </button>
    </div>
  );
}