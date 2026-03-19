import React, { useState, useEffect } from 'react';
import { FaDownload, FaTimes, FaApple } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

export const PwaInstallPrompt = () => {
  const { language } = useAppContext();
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isIos, setIsIos] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Detect Apple iOS (Because Apple blocks standard PWA prompts)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      setIsVisible(true);
    }

    // 2. Intercept Android/Windows Install Prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Stop the ugly default browser bar
      setInstallPromptEvent(e); // Save it so we can trigger it with our beautiful button
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!isVisible) return null;

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
  };

  const containerStyle = {
    position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
    width: '90%', maxWidth: '400px', backgroundColor: 'var(--card-bg)',
    color: 'var(--text-color)', padding: '20px', borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)', border: '1px solid var(--primary-color)',
    zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '15px'
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
            {language === 'es' ? 'Instalar App P.B.I. Labs' : 'Install P.B.I. Labs App'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Acceso rápido y seguro desde su pantalla de inicio.' : 'Fast, secure access directly from your home screen.'}
          </p>
        </div>
        <button onClick={() => setIsVisible(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
          <FaTimes />
        </button>
      </div>

      {isIos ? (
        <div style={{ fontSize: '0.9rem', padding: '10px', backgroundColor: 'var(--toggle-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaApple size={18} /> <strong>Apple iOS:</strong>
          </p>
          <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.5' }}>
            <li>{language === 'es' ? 'Toque el botón "Compartir" en su navegador.' : 'Tap the "Share" button in your browser menu.'}</li>
            <li>{language === 'es' ? 'Seleccione "Agregar a inicio".' : 'Select "Add to Home Screen".'}</li>
          </ol>
        </div>
      ) : (
        <button onClick={handleInstallClick} style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <FaDownload /> {language === 'es' ? 'Instalar Ahora' : 'Install Now'}
        </button>
      )}
    </div>
  );
};