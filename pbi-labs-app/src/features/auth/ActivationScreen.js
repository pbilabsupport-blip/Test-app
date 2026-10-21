import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import AdSlot from '../../components/ads/AdSlot';
import { confirmDeviceReset, requestDeviceReset } from '../../services/licenseApi';

const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'temp-mail.org', 'guerrillamail.com',
  'mailinator.com', 'yopmail.com', 'throwawaymail.com',
  'tempmail.com', 'dropmail.me', 'fakeinbox.com'
];

function describeAuthError(code, isEs) {
  if (code === 'SEAT_LIMIT') {
    return isEs
      ? 'Esta licencia ya tiene 2 dispositivos. Use “Dispositivo perdido” para liberar uno.'
      : 'This license already has 2 devices. Use Lost Device to free one.';
  }
  if (code === 'EMAIL_MISMATCH') {
    return isEs ? 'Esa licencia pertenece a otro correo.' : 'That license is registered to a different email.';
  }
  if (code === 'MISSING_CONFIG') {
    return isEs
      ? 'Falta configurar Gumroad o Supabase en el servidor.'
      : 'Gumroad or Supabase is not configured on the server yet.';
  }
  if (code === 'NETWORK') {
    return isEs ? 'No se pudo contactar al servidor de licencias.' : 'Could not reach the license server.';
  }
  if (code === 'INVALID_LICENSE') {
    return isEs ? 'Licencia inválida o vencida.' : 'That license is invalid or no longer active.';
  }
  return null;
}

export default function ActivationScreen() {
  const {
    handleFreeSignUp,
    handleFreeLogin,
    handleActivate,
    language,
    setLanguage,
    authNotice,
    clearAuthNotice
  } = useAppContext();

  const [proEmail, setProEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [freeEmail, setFreeEmail] = useState('');
  const [freePassword, setFreePassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDeviceOtpOpen, setIsDeviceOtpOpen] = useState(false);
  const [deviceOtpEmail, setDeviceOtpEmail] = useState('');
  const [deviceOtpCode, setDeviceOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState('email');
  const [otpMessage, setOtpMessage] = useState('');

  const isEs = language === 'es';
  const buyUrl = process.env.REACT_APP_GUMROAD_URL || 'https://gumroad.com';

  useEffect(() => {
    if (!authNotice) return;
    setError(describeAuthError(authNotice, isEs) || authNotice);
    clearAuthNotice();
  }, [authNotice, clearAuthNotice, isEs]);

  const validateEmailDomain = (email) => {
    const domain = email.split('@')[1];
    return !DISPOSABLE_DOMAINS.includes(domain);
  };

  const onFreeSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!freeEmail.trim() || !freePassword.trim()) {
      setError(isEs ? 'Por favor ingrese correo y contraseña.' : 'Please enter email and password.');
      return;
    }
    if (isSignUpMode && !validateEmailDomain(freeEmail.trim())) {
      setError(isEs ? 'Correos temporales no permitidos. Use un correo válido.' : 'Temporary emails are not allowed. Please use a valid email.');
      return;
    }
    if (freePassword.length < 6) {
      setError(isEs ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.');
      return;
    }
    try {
      if (isSignUpMode) await handleFreeSignUp(freeEmail.trim(), freePassword);
      else await handleFreeLogin(freeEmail.trim(), freePassword);
    } catch (err) {
      setError(err.message || (isEs ? 'Error de autenticación.' : 'Authentication error.'));
    }
  };

  const onProSubmit = async (event) => {
    event.preventDefault();
    if (!licenseKey.trim() || !proEmail.trim()) {
      setError(isEs ? 'Ingrese correo y clave de licencia.' : 'Enter email and license key.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await handleActivate(licenseKey.trim(), proEmail.trim());
    } catch (err) {
      setError(describeAuthError(err.code, isEs) || err.message || (isEs ? 'Error de activación.' : 'Activation failed.'));
    } finally {
      setLoading(false);
    }
  };

  const sendRecoveryCode = async () => {
    if (!deviceOtpEmail.trim()) {
      setOtpMessage(isEs ? 'Ingrese su correo primero.' : 'Enter your email first.');
      return;
    }
    setLoading(true);
    setOtpMessage('');
    try {
      const result = await requestDeviceReset({ email: deviceOtpEmail.trim(), language });
      setOtpStep('code');
      setOtpMessage(result.message);
    } catch (err) {
      setOtpMessage(describeAuthError(err.code, isEs) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmRecoveryCode = async () => {
    setLoading(true);
    setOtpMessage('');
    try {
      const result = await confirmDeviceReset({ email: deviceOtpEmail.trim(), code: deviceOtpCode.trim() });
      setOtpMessage(result.message);
      setOtpStep('done');
    } catch (err) {
      setOtpMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '14px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '1rem', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '950px', margin: '0 auto', paddingTop: '10px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: 'var(--primary-color)', letterSpacing: '1px' }}>P.B.I. Labs</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => setLanguage(isEs ? 'en' : 'es')} style={{ padding: '8px 16px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{isEs ? 'EN' : 'ES'}</button>
          <button type="button" onClick={() => setIsHelpOpen(true)} style={{ padding: '8px 16px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{isEs ? 'Ayuda y Glosario' : 'Help & Glossary'}</button>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '950px', margin: '20px auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AdSlot slot={process.env.REACT_APP_ADSENSE_SLOT_BANNER} />

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-color)', margin: '0 0 10px 0' }}>{isEs ? 'Sistema Operativo Financiero' : 'Financial Operating System'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            {isEs ? 'Cree su cuenta o active su Licencia Pro para gestionar activos y pasivos.' : 'Create your account or activate your Pro License to master assets and liabilities.'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '35px 30px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: 'var(--text-color)', marginTop: 0, marginBottom: '10px', textAlign: 'center' }}>
              {isSignUpMode ? (isEs ? 'Crear Cuenta' : 'Create Account') : (isEs ? 'Iniciar Sesión' : 'Log In')}
            </h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '20px' }}>
              {isEs ? 'Su bóveda se guarda en este dispositivo. Pro cubre hasta 2 dispositivos.' : 'Your vault is saved on this device. Pro covers up to 2 devices.'}
            </p>
            <div style={{ display: 'flex', background: 'var(--bg-color)', padding: '4px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
              <button type="button" onClick={() => { setIsSignUpMode(true); setError(null); }} style={{ flex: 1, padding: '10px', background: isSignUpMode ? 'var(--primary-color)' : 'transparent', color: isSignUpMode ? '#000' : 'var(--text-color)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{isEs ? 'Registrarse' : 'Sign Up'}</button>
              <button type="button" onClick={() => { setIsSignUpMode(false); setError(null); }} style={{ flex: 1, padding: '10px', background: !isSignUpMode ? 'var(--primary-color)' : 'transparent', color: !isSignUpMode ? '#000' : 'var(--text-color)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{isEs ? 'Iniciar Sesión' : 'Log In'}</button>
            </div>
            <form onSubmit={onFreeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
              <input type="email" required placeholder="name@example.com" value={freeEmail} onChange={(event) => setFreeEmail(event.target.value)} style={inputStyle} />
              <input type="password" required placeholder="••••••••" value={freePassword} onChange={(event) => setFreePassword(event.target.value)} style={inputStyle} />
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                {isSignUpMode ? (isEs ? 'Crear Cuenta' : 'Create Account') : (isEs ? 'Acceder al Sistema' : 'Access System')}
              </button>
            </form>
            <div style={{ marginTop: 20 }}>
              <AdSlot slot={process.env.REACT_APP_ADSENSE_SLOT_CARD} />
            </div>
          </div>

          <div style={{ background: 'var(--card-bg)', padding: '35px 30px', borderRadius: '16px', border: '2px solid var(--primary-color)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary-color)', color: '#000', padding: '4px 15px', fontSize: '0.75rem', fontWeight: 'bold', borderBottomLeftRadius: '10px' }}>{isEs ? 'MÁS POPULAR' : 'BEST VALUE'}</div>
            <h2 style={{ color: 'var(--primary-color)', marginTop: 0, textAlign: 'center' }}>{isEs ? 'Licencia Pro' : 'Pro License'}</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>{isEs ? 'Sin anuncios y límite de 2 dispositivos.' : 'No ads, and a limit of 2 devices.'}</p>
            <a href={buyUrl} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center', marginBottom: 20 }}>
              {isEs ? 'Comprar Licencia Pro' : 'Get Your Pro License'}
            </a>
            <form onSubmit={onProSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="email" required placeholder={isEs ? 'Correo de Gumroad' : 'Gumroad email'} value={proEmail} onChange={(event) => setProEmail(event.target.value)} style={inputStyle} />
              <input type="text" required placeholder="XXXX-XXXX-XXXX-XXXX" value={licenseKey} onChange={(event) => setLicenseKey(event.target.value)} style={inputStyle} />
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                {loading ? (isEs ? 'Verificando...' : 'Verifying...') : (isEs ? 'Activar Dispositivo Pro' : 'Activate Pro Device')}
              </button>
            </form>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
              <button type="button" onClick={() => { setIsDeviceOtpOpen(true); setOtpStep('email'); setOtpMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>
                {isEs ? '¿Dispositivo perdido?' : 'Lost Device?'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '15px 0' }}>powered by P.B.I. Labs</footer>

      {isHelpOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: 20 }}>
          <div style={{ background: 'var(--card-bg)', padding: 28, borderRadius: 16, maxWidth: 560, width: '100%', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>{isEs ? 'Glosario Rich Dad' : 'Rich Dad Glossary'}</h3>
            <p>{isEs ? 'Un activo pone dinero en su bolsillo. Un pasivo lo saca. El flujo de caja es ingresos menos gastos.' : 'An asset puts money in your pocket. A liability takes it out. Cash flow is income minus expenses.'}</p>
            <button type="button" onClick={() => setIsHelpOpen(false)} style={{ padding: '10px 16px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>{isEs ? 'Cerrar' : 'Close'}</button>
          </div>
        </div>
      )}

      {isDeviceOtpOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: 20 }}>
          <div style={{ background: 'var(--card-bg)', padding: 28, borderRadius: 16, maxWidth: 440, width: '100%', border: '1px solid var(--border-color)' }}>
            <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>{isEs ? 'Recuperar dispositivo' : 'Recover a device'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {isEs ? 'Enviaremos un código a el correo de la licencia. El código no aparece en esta pantalla.' : 'We email a code to the license address. The code is never shown on this screen.'}
            </p>
            <input type="email" placeholder={isEs ? 'Correo de la licencia' : 'License email'} value={deviceOtpEmail} onChange={(event) => setDeviceOtpEmail(event.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
            {otpStep !== 'email' && (
              <input type="text" inputMode="numeric" placeholder="123456" value={deviceOtpCode} onChange={(event) => setDeviceOtpCode(event.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
            )}
            {otpMessage && <p style={{ fontSize: '0.9rem' }}>{otpMessage}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              {otpStep === 'email' ? (
                <button type="button" disabled={loading} onClick={sendRecoveryCode} style={{ flex: 1, padding: 12, background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>{isEs ? 'Enviar código' : 'Send code'}</button>
              ) : otpStep === 'code' ? (
                <button type="button" disabled={loading} onClick={confirmRecoveryCode} style={{ flex: 1, padding: 12, background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>{isEs ? 'Liberar dispositivos' : 'Release devices'}</button>
              ) : null}
              <button type="button" onClick={() => setIsDeviceOtpOpen(false)} style={{ flex: 1, padding: 12, background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer' }}>{isEs ? 'Cerrar' : 'Close'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
