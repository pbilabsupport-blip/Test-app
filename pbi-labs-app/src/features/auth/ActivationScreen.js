import React, { useState } from 'react';
import { validateLicense, triggerOtpEmail, verifyOtpAndReset } from './SessionManager';
import { useAppContext } from '../../context/AppContext';
import { ThemeToggle } from '../../components/ThemeToggle'; 
import { FaQuestionCircle, FaGlobe, FaKey, FaUnlockAlt, FaShoppingCart } from 'react-icons/fa';

export const ActivationScreen = ({ onLoginSuccess }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [mode, setMode] = useState('login'); 
  
  const { language, toggleLanguage } = useAppContext();

  const isActionDisabled = isLoading || !licenseKey.trim();

  const handleActivate = async () => {
    setIsLoading(true); setError('');
    const result = await validateLicense(licenseKey);
    if (result.success) {
      onLoginSuccess(licenseKey, result.deviceId, result.financialData); 
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleRequestOtp = async () => {
    setIsLoading(true); setError('');
    const result = await triggerOtpEmail(licenseKey);
    if (result.success) {
      setMode('verify_otp');
      setError(''); 
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) return;
    setIsLoading(true); setError('');
    const result = await verifyOtpAndReset(licenseKey, otpCode);
    if (result.success) {
      setMode('login');
      setOtpCode('');
      setError(result.message); 
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  // The Help Modal UI
  const renderHelpModal = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '90%', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: 'var(--primary-color)', marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          {language === 'es' ? 'Protocolos del Sistema' : 'System Protocols'}
        </h2>
        <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          {language === 'es' 
            ? 'Esta bóveda financiera está diseñada bajo la mentalidad empresarial de Robert Kiyosaki para proteger y automatizar sus activos. P.B.I. Labs garantiza seguridad de grado militar para sus datos.' 
            : 'This financial vault is engineered under the Robert Kiyosaki business mindset to protect and automate your assets. P.B.I. Labs ensures military-grade security for your data.'}
        </p>
        <ul style={{ fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '20px' }}>
          <li><strong>{language === 'es' ? 'Límite de Asientos:' : 'Seat Limit:'}</strong> {language === 'es' ? '2 dispositivos activos por licencia.' : '2 active devices per license.'}</li>
          <li><strong>{language === 'es' ? 'Dispositivo Perdido:' : 'Lost Device:'}</strong> {language === 'es' ? 'Utilice esta función para enviar un código (OTP) a su correo de Gumroad. Ingresarlo desconectará todos los demás dispositivos.' : 'Use this function to send an OTP to your Gumroad email. Entering it will forcefully log out all other devices.'}</li>
        </ul>
        <button onClick={() => setIsHelpOpen(false)} style={{ width: '100%', padding: '12px', marginTop: '20px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          {language === 'es' ? 'Cerrar' : 'Close'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', transition: 'all 0.3s ease' }}>
      
      {/* Top Controls */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <ThemeToggle />
        <button onClick={toggleLanguage} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <FaGlobe /> {language === 'es' ? 'ES' : 'EN'}
        </button>
      </div>

      {isHelpOpen && renderHelpModal()}

      {/* Main Activation Card */}
      <div style={{ width: '100%', maxWidth: '420px', padding: '40px 30px', backgroundColor: 'var(--bg-color)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)', textAlign: 'center', position: 'relative' }}>
        
        <button onClick={() => setIsHelpOpen(true)} style={{ position: 'absolute', top: '15px', left: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>
          <FaQuestionCircle />
        </button>

        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
          P.B.I. <span style={{ color: 'var(--primary-color)' }}>Labs</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '30px' }}>
          {language === 'es' ? 'Ingrese su llave de acceso para desencriptar la bóveda.' : 'Enter your access key to decrypt the vault.'}
        </p>

        {/* Dynamic Form Modes */}
        {mode === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <FaKey style={{ position: 'absolute', top: '14px', left: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder={language === 'es' ? "Llave de Licencia (Gumroad)" : "License Key (Gumroad)"}
                value={licenseKey} 
                onChange={(e) => setLicenseKey(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-color)', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>
            
            <button onClick={handleActivate} disabled={isActionDisabled} style={{ width: '100%', padding: '14px', backgroundColor: 'var(--text-color)', color: 'var(--bg-color)', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: isActionDisabled ? 'not-allowed' : 'pointer', opacity: isActionDisabled ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: '0.2s' }}>
              <FaUnlockAlt /> {isLoading ? (language === 'es' ? 'Verificando...' : 'Verifying...') : (language === 'es' ? 'Activar Bóveda' : 'Activate Vault')}
            </button>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => window.open('https://pbilabs.gumroad.com/l/uuffyy', '_blank')} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                <FaShoppingCart /> {language === 'es' ? 'Comprar' : 'Purchase'}
              </button>
              <button onClick={() => { setMode('request_otp'); setError(''); }} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                {language === 'es' ? '¿Dispositivo Perdido?' : 'Lost Device?'}
              </button>
            </div>
          </div>
        )}

        {mode === 'request_otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left' }}>
              {language === 'es' ? 'Ingrese su licencia para recibir un código de recuperación en su correo.' : 'Enter your license to receive a recovery code via email.'}
            </p>
            <input 
              type="text" 
              placeholder={language === 'es' ? "Llave de Licencia" : "License Key"}
              value={licenseKey} 
              onChange={(e) => setLicenseKey(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-color)', fontSize: '1rem', boxSizing: 'border-box' }}
            />
            <button onClick={handleRequestOtp} disabled={isActionDisabled} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isActionDisabled ? 'not-allowed' : 'pointer', opacity: isActionDisabled ? 0.7 : 1 }}>
              {isLoading ? '...' : (language === 'es' ? 'Enviar Código OTP' : 'Send OTP Code')}
            </button>
            <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginTop: '10px' }}>
              {language === 'es' ? 'Volver al Inicio' : 'Back to Login'}
            </button>
          </div>
        )}

        {mode === 'verify_otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left' }}>
              {language === 'es' ? 'Ingrese el código de 6 dígitos enviado a su correo para liberar los asientos.' : 'Enter the 6-digit code sent to your email to release seats.'}
            </p>
            <input 
              type="text" 
              placeholder="000000"
              value={otpCode} 
              onChange={(e) => setOtpCode(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-color)', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '5px', boxSizing: 'border-box' }}
            />
            <button onClick={handleVerifyOtp} disabled={isLoading || !otpCode} style={{ width: '100%', padding: '12px', backgroundColor: '#ff4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (isLoading || !otpCode) ? 'not-allowed' : 'pointer' }}>
              {isLoading ? '...' : (language === 'es' ? 'Verificar y Liberar' : 'Verify & Release')}
            </button>
             <button onClick={() => { setMode('login'); setError(''); setOtpCode(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginTop: '10px' }}>
              {language === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
          </div>
        )}

        {/* Global Error/Success Messaging */}
        {error && (
          <div style={{ marginTop: '20px', padding: '12px', border: '1px solid', borderColor: error.includes('success') ? '#00e676' : '#ff4444', borderRadius: '8px', background: error.includes('success') ? 'rgba(0, 230, 118, 0.05)' : 'rgba(255, 68, 68, 0.05)', color: error.includes('success') ? '#00e676' : '#ff4444', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}
        
      </div>
      
      {/* Watermark */}
      <div style={{ position: 'fixed', bottom: '20px', opacity: 0.5, fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
        POWERED BY P.B.I. LABS
      </div>
    </div>
  );
};