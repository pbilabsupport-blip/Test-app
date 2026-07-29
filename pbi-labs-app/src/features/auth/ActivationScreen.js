import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { verifyGumroadLicense, createDeviceSeat } from '../../services/supabase';
import getFingerprint from '../../services/fingerprint';
import KiyosakiModal from '../../components/KiyosakiModal';
import ToolHelpModal from '../../components/ToolHelpModal';
import CookieConsent from '../../components/legal/CookieConsent';
import { FaKey, FaShoppingCart, FaQuestionCircle, FaLock, FaSpinner } from 'react-icons/fa';

export default function ActivationScreen({ onLoginSuccess }) {
  const { language } = useAppContext();
  const [licenseInput, setLicenseInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showKiyosakiModal, setShowKiyosakiModal] = useState(false);

  const isEs = language === 'es';

  const handleActivation = async (e) => {
    e.preventDefault();
    if (!licenseInput.trim()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const devId = await getFingerprint();
      
      // 1. Check Gumroad / Database Verification
      const verification = await verifyGumroadLicense(licenseInput.trim());
      if (!verification.valid) {
        setErrorMessage(isEs ? 'Licencia inválida o expirada.' : 'Invalid or expired license key.');
        setLoading(false);
        return;
      }

      // 2. Seat Management
      const seatResult = await createDeviceSeat(licenseInput.trim(), devId);
      if (!seatResult.success) {
        setErrorMessage(seatResult.message);
        setLoading(false);
        return;
      }

      // 3. Success -> Send to App
      onLoginSuccess(licenseInput.trim(), devId, seatResult.userData);
    } catch (err) {
      setErrorMessage(isEs ? 'Error de conexión. Intente de nuevo.' : 'Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '420px',
      margin: '0 auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Vault Card */}
      <div style={{
        width: '100%',
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '16px',
        padding: '32px 24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        border: '1px solid var(--border-color, #e5e7eb)',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        {/* Help Icon */}
        <button 
          onClick={() => setShowHelpModal(true)}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #6b7280)',
            cursor: 'pointer',
            fontSize: '1.2rem'
          }}
          title={isEs ? 'Ayuda' : 'Help'}
        >
          <FaQuestionCircle />
        </button>

        {/* Title & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-color, #111827)' }}>
            P.B.I. <span style={{ color: '#d97706' }}>Labs</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #6b7280)', margin: 0 }}>
            {isEs ? 'Ingrese su clave de acceso para desencriptar la bóveda.' : 'Enter your access key to decrypt the vault.'}
          </p>
        </div>

        {/* Activation Form */}
        <form onSubmit={handleActivation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <FaKey style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text"
              value={licenseInput}
              onChange={(e) => setLicenseInput(e.target.value)}
              placeholder={isEs ? 'Clave de Licencia (Gumroad)' : 'License Key (Gumroad)'}
              required
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #d1d5db)',
                backgroundColor: 'var(--bg-color, #ffffff)',
                color: 'var(--text-color, #111827)',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {errorMessage && (
            <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>
              {errorMessage}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || !licenseInput.trim()}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading || !licenseInput.trim() ? '#6b7280' : '#4b5563',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: loading || !licenseInput.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaLock />}
            {isEs ? 'Activar Bóveda' : 'Activate Vault'}
          </button>
        </form>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <a 
            href="https://gumroad.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #d97706',
              borderRadius: '8px',
              color: '#d97706',
              textDecoration: 'none',
              textAlign: 'center',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <FaShoppingCart /> {isEs ? 'Comprar' : 'Purchase'}
          </a>

          <button 
            onClick={() => setShowHelpModal(true)}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid var(--border-color, #d1d5db)',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: 'var(--text-color, #111827)',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isEs ? '¿Dispositivo Perdido?' : 'Lost Device?'}
          </button>
        </div>

        {/* Footer Branding */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold' }}>
          POWERED BY P.B.I. LABS
        </div>
      </div>

      {/* Modals */}
      {showHelpModal && <ToolHelpModal onClose={() => setShowHelpModal(false)} />}
      {showKiyosakiModal && <KiyosakiModal onClose={() => setShowKiyosakiModal(false)} />}
      
      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}