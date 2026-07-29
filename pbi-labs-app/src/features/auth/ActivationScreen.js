import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { verifyGumroadLicense, createDeviceSeat } from '../../services/supabase';
import { triggerOtpEmail, verifyOtpAndReset } from './SessionManager';
import getFingerprint from '../../services/fingerprint';
import ToolHelpModal from '../../components/ToolHelpModal';
import CookieConsent from '../../components/legal/CookieConsent';
import { FaKey, FaShoppingCart, FaQuestionCircle, FaLock, FaSpinner, FaEnvelope, FaShieldAlt } from 'react-icons/fa';

export default function ActivationScreen({ onLoginSuccess }) {
  const { language } = useAppContext();
  const [authMode, setAuthMode] = useState('pro'); // 'pro' or 'free'
  const [licenseInput, setLicenseInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const isEs = language === 'es';

  const handleActivation = async (e) => {
    e.preventDefault();
    if (authMode === 'pro' && !licenseInput.trim()) return;
    if (authMode === 'free' && !emailInput.trim()) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const devId = await getFingerprint();
      
      if (authMode === 'free') {
        // Free Tier Email Login
        onLoginSuccess(null, devId, null, 'free');
        return;
      }

      // Pro Tier License Verification
      const verification = await verifyGumroadLicense(licenseInput.trim());
      if (!verification.valid) {
        setErrorMessage(verification.message || (isEs ? 'Licencia inválida o expirada.' : 'Invalid or expired license key.'));
        setLoading(false);
        return;
      }

      const seatResult = await createDeviceSeat(licenseInput.trim(), devId, 'pro');
      if (!seatResult.success) {
        setErrorMessage(seatResult.message);
        setLoading(false);
        return;
      }

      onLoginSuccess(licenseInput.trim(), devId, seatResult.userData, 'pro');
    } catch (err) {
      setErrorMessage(isEs ? 'Error de conexión. Intente de nuevo.' : 'Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!licenseInput.trim()) {
      setErrorMessage(isEs ? 'Ingrese su clave de licencia primero.' : 'Enter your license key first.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    const res = await triggerOtpEmail(licenseInput.trim());
    setLoading(false);
    if (res.success) {
      setSuccessMessage(isEs ? 'Código OTP enviado a su correo registrado.' : 'OTP sent to your registered email.');
      setIsRecoveryMode(true);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) return;
    setLoading(true);
    setErrorMessage('');
    const res = await verifyOtpAndReset(licenseInput.trim(), otpInput.trim());
    setLoading(false);
    if (res.success) {
      setSuccessMessage(res.message);
      setIsRecoveryMode(false);
      setOtpInput('');
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', backgroundColor: 'var(--card-bg, #ffffff)', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid var(--border-color, #e5e7eb)', position: 'relative', boxSizing: 'border-box' }}>
        
        <button onClick={() => setShowHelpModal(true)} style={{ position: 'absolute', top: '16px', left: '16px', background: 'none', border: 'none', color: 'var(--text-muted, #6b7280)', cursor: 'pointer', fontSize: '1.2rem' }} title={isEs ? 'Ayuda' : 'Help'}>
          <FaQuestionCircle />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-color, #111827)' }}>
            P.B.I. <span style={{ color: '#d97706' }}>Labs</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #6b7280)', margin: 0 }}>
            {isEs ? 'Sistema Operativo Financiero Seguro' : 'Secure Financial Operating System'}
          </p>
        </div>

        {/* Tier Selector Tabs */}
        <div style={{ display: 'flex', marginBottom: '20px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', padding: '4px', border: '1px solid var(--border-color)' }}>
          <button type="button" onClick={() => { setAuthMode('pro'); setIsRecoveryMode(false); setErrorMessage(''); setSuccessMessage(''); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: authMode === 'pro' ? 'var(--card-bg)' : 'transparent', color: authMode === 'pro' ? 'var(--text-color)' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', boxShadow: authMode === 'pro' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none' }}>
            {isEs ? 'Acceso Pro (Licencia)' : 'Pro Access (License)'}
          </button>
          <button type="button" onClick={() => { setAuthMode('free'); setIsRecoveryMode(false); setErrorMessage(''); setSuccessMessage(''); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: authMode === 'free' ? 'var(--card-bg)' : 'transparent', color: authMode === 'free' ? 'var(--text-color)' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', boxShadow: authMode === 'free' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none' }}>
            {isEs ? 'Versión Gratuita (AdSense)' : 'Free Tier (AdSense)'}
          </button>
        </div>

        {!isRecoveryMode ? (
          <form onSubmit={handleActivation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {authMode === 'pro' ? (
              <div style={{ position: 'relative' }}>
                <FaKey style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input 
                  type="text"
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  placeholder={isEs ? 'Clave de Licencia (Gumroad)' : 'Gumroad License Key'}
                  required
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '8px', border: '1px solid var(--border-color, #d1d5db)', backgroundColor: 'var(--bg-color, #ffffff)', color: 'var(--text-color, #111827)', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input 
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={isEs ? 'Su Correo Electrónico' : 'Your Email Address'}
                  required
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '8px', border: '1px solid var(--border-color, #d1d5db)', backgroundColor: 'var(--bg-color, #ffffff)', color: 'var(--text-color, #111827)', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {errorMessage && (
              <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div style={{ padding: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>
                {successMessage}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || (authMode === 'pro' && !licenseInput.trim()) || (authMode === 'free' && !emailInput.trim())}
              style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#6b7280' : '#4b5563', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {loading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaLock />}
              {authMode === 'pro' ? (isEs ? 'Desencriptar Bóveda' : 'Decrypt Vault') : (isEs ? 'Entrar Gratis' : 'Enter Free Tier')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {isEs ? 'Ingrese el código de 6 dígitos enviado a su correo para liberar todos los dispositivos.' : 'Enter the 6-digit code sent to your email to release all devices.'}
            </div>
            <div style={{ position: 'relative' }}>
              <FaShieldAlt style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input 
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.1rem', letterSpacing: '4px', textAlign: 'center', boxSizing: 'border-box' }}
              />
            </div>
            {errorMessage && <div style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>{errorMessage}</div>}
            {successMessage && <div style={{ padding: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>{successMessage}</div>}
            <button type="submit" disabled={loading || !otpInput.trim()} style={{ width: '100%', padding: '12px', backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {isEs ? 'Verificar y Liberar Dispositivos' : 'Verify & Release Devices'}
            </button>
            <button type="button" onClick={() => setIsRecoveryMode(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>
              {isEs ? '← Volver al inicio' : '← Back to Login'}
            </button>
          </form>
        )}

        {authMode === 'pro' && !isRecoveryMode && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
            <a href="https://gumroad.com" target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '10px', border: '1px solid #d97706', borderRadius: '8px', color: '#d97706', textDecoration: 'none', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <FaShoppingCart /> {isEs ? 'Comprar Pro' : 'Purchase Pro'}
            </a>
            <button type="button" onClick={handleSendOtp} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--text-color)', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
              {isEs ? '¿Dispositivo Perdido?' : 'Lost Device?'}
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.7rem', color: '#9ca3af', fontWeight: 'bold' }}>
          POWERED BY P.B.I. LABS
        </div>
      </div>

      {showHelpModal && <ToolHelpModal onClose={() => setShowHelpModal(false)} />}
      <CookieConsent />
    </div>
  );
}