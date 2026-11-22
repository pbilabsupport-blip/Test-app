import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import AdSlot from '../../components/ads/AdSlot';
import { confirmDeviceReset, requestDeviceReset } from '../../services/licenseApi';
import { FiEye, FiEyeOff, FiCheck, FiAlertCircle, FiMail, FiArrowLeft, FiHelpCircle } from 'react-icons/fi';

const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'temp-mail.org', 'guerrillamail.com',
  'mailinator.com', 'yopmail.com', 'throwawaymail.com',
  'tempmail.com', 'dropmail.me', 'fakeinbox.com'
];

function describeAuthError(code, message, isEs) {
  if (code === 'SEAT_LIMIT') {
    return isEs
      ? 'Esta licencia ya tiene 2 dispositivos activos. Use "¿Dispositivo perdido?" abajo para liberar uno.'
      : 'This license already has 2 active devices. Use "Lost Device?" below to free one.';
  }
  if (code === 'EMAIL_MISMATCH') {
    return isEs
      ? 'Esa licencia pertenece a otro correo electrónico.'
      : 'That license key is registered to a different email address.';
  }
  if (code === 'INVALID_LICENSE') {
    return isEs
      ? 'Licencia inválida o vencida. Verifique su clave de Gumroad.'
      : 'That license is invalid or no longer active. Please check your Gumroad key.';
  }
  if (message?.includes('Email not confirmed')) {
    return isEs
      ? 'Por favor, confirme su correo electrónico primero usando el enlace enviado a su bandeja.'
      : 'Please confirm your email address first using the link sent to your inbox.';
  }
  if (message?.includes('Invalid login credentials')) {
    return isEs
      ? 'Correo o contraseña incorrectos. ¿Olvidó su contraseña? Use la opción de abajo.'
      : 'Incorrect email or password. Forgot your password? Use the reset link below.';
  }
  if (message?.includes('User already registered')) {
    return isEs
      ? 'Este correo ya tiene una cuenta. Cambie a "Iniciar Sesión" para entrar o restablecer su contraseña.'
      : 'This email already has an account. Switch to "Log In" to sign in or reset your password.';
  }
  if (message?.includes('only request this after') || message?.toLowerCase().includes('rate limit')) {
    return isEs
      ? 'Por seguridad, espere 60 segundos antes de solicitar otro correo.'
      : 'For security, please wait 60 seconds before requesting another email.';
  }
  if (message?.includes('Unable to validate email address') || message?.includes('invalid format')) {
    return isEs
      ? 'Por favor ingrese una dirección de correo electrónico válida.'
      : 'Please enter a valid email address.';
  }
  if (message?.includes('at least 6 characters')) {
    return isEs
      ? 'La contraseña debe tener al menos 6 caracteres.'
      : 'Password must be at least 6 characters.';
  }
  return message || (isEs ? 'Error de autenticación.' : 'Authentication error.');
}

export default function ActivationScreen() {
  const {
    handleFreeSignUp,
    handleResendConfirmation,
    handleFreeLogin,
    handleRequestPasswordReset,
    handleActivate,
    language,
    setLanguage,
    authNotice,
    clearAuthNotice
  } = useAppContext();

  // Pro License State
  const [proEmail, setProEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [proLoading, setProLoading] = useState(false);
  const [proError, setProError] = useState(null);

  // Free Account State
  const [freeEmail, setFreeEmail] = useState('');
  const [confirmFreeEmail, setConfirmFreeEmail] = useState('');
  const [freePassword, setFreePassword] = useState('');
  const [freeView, setFreeView] = useState('signup'); // 'signup' | 'login' | 'forgot' | 'forgotSent' | 'confirmSent'
  const [showPassword, setShowPassword] = useState(false);
  const [freeLoading, setFreeLoading] = useState(false);
  const [freeError, setFreeError] = useState(null);
  const [freeSuccess, setFreeSuccess] = useState('');

  // Global Banner State (e.g. session heartbeat notice)
  const [globalError, setGlobalError] = useState(null);

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDeviceOtpOpen, setIsDeviceOtpOpen] = useState(false);
  const [deviceOtpEmail, setDeviceOtpEmail] = useState('');
  const [deviceOtpCode, setDeviceOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState('email'); // 'email' | 'code' | 'done'
  const [otpMessage, setOtpMessage] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const isEs = language === 'es';
  const buyUrl = process.env.REACT_APP_GUMROAD_URL || 'https://gumroad.com';

  useEffect(() => {
    if (!authNotice) return;
    setGlobalError(describeAuthError(authNotice, null, isEs) || authNotice);
    clearAuthNotice();
  }, [authNotice, clearAuthNotice, isEs]);

  const validateEmailDomain = (email) => {
    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2 || !parts[1]) return false;
    return !DISPOSABLE_DOMAINS.includes(parts[1]);
  };

  const switchFreeView = (nextView) => {
    setFreeView(nextView);
    setFreeError(null);
    setFreeSuccess('');
    setGlobalError(null);
    if (nextView === 'forgot' || nextView === 'login') {
      setFreePassword('');
    }
  };

  const onFreeSubmit = async (event) => {
    event.preventDefault();
    setFreeError(null);
    setFreeSuccess('');
    setGlobalError(null);

    const cleanEmail = freeEmail.trim();
    const cleanConfirm = confirmFreeEmail.trim();
    const isSignUp = freeView === 'signup';

    if (!cleanEmail || !freePassword) {
      setFreeError(isEs ? 'Por favor ingrese correo y contraseña.' : 'Please enter your email and password.');
      return;
    }

    if (isSignUp) {
      if (cleanEmail.toLowerCase() !== cleanConfirm.toLowerCase()) {
        setFreeError(isEs ? 'Los correos electrónicos no coinciden. Verifique su ortografía.' : 'Email addresses do not match. Please check your spelling.');
        return;
      }
      if (!validateEmailDomain(cleanEmail)) {
        setFreeError(isEs ? 'Correos temporales no permitidos. Use un correo personal válido.' : 'Temporary emails are not allowed. Please use a valid personal email.');
        return;
      }
    }

    if (freePassword.length < 6) {
      setFreeError(isEs ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.');
      return;
    }

    setFreeLoading(true);
    try {
      if (isSignUp) {
        const result = await handleFreeSignUp(cleanEmail, freePassword);
        if (result?.needsEmailConfirmation) {
          setFreeView('confirmSent');
        }
      } else {
        await handleFreeLogin(cleanEmail, freePassword);
      }
    } catch (err) {
      setFreeError(describeAuthError(null, err.message, isEs));
    } finally {
      setFreeLoading(false);
    }
  };

  const handlePasswordResetRequest = async (e) => {
    e.preventDefault();
    setFreeError(null);
    setFreeSuccess('');
    setGlobalError(null);

    const cleanEmail = freeEmail.trim();
    if (!cleanEmail) {
      setFreeError(isEs ? 'Ingrese su correo electrónico primero.' : 'Please enter your email address first.');
      return;
    }

    setFreeLoading(true);
    try {
      await handleRequestPasswordReset(cleanEmail);
      setFreeView('forgotSent');
    } catch (err) {
      setFreeError(describeAuthError(null, err.message, isEs));
    } finally {
      setFreeLoading(false);
    }
  };

  const onResendConfirmation = async () => {
    setFreeError(null);
    setFreeSuccess('');
    setFreeLoading(true);
    try {
      await handleResendConfirmation(freeEmail.trim());
      setFreeSuccess(isEs ? 'Correo de confirmación reenviado.' : 'Confirmation email resent.');
    } catch (err) {
      setFreeError(describeAuthError(null, err.message, isEs));
    } finally {
      setFreeLoading(false);
    }
  };

  const onProSubmit = async (event) => {
    event.preventDefault();
    setProError(null);
    setGlobalError(null);

    if (!licenseKey.trim() || !proEmail.trim()) {
      setProError(isEs ? 'Ingrese su correo de Gumroad y clave de licencia.' : 'Please enter your Gumroad email and license key.');
      return;
    }

    setProLoading(true);
    try {
      await handleActivate(licenseKey.trim(), proEmail.trim());
    } catch (err) {
      setProError(describeAuthError(err.code, err.message, isEs));
    } finally {
      setProLoading(false);
    }
  };

  const sendRecoveryCode = async () => {
    if (!deviceOtpEmail.trim()) {
      setOtpMessage(isEs ? 'Ingrese el correo de su licencia primero.' : 'Please enter your license email first.');
      return;
    }
    setOtpLoading(true);
    setOtpMessage('');
    try {
      const result = await requestDeviceReset({ email: deviceOtpEmail.trim(), language });
      setOtpStep('code');
      setOtpMessage(result.message);
    } catch (err) {
      setOtpMessage(err.message || describeAuthError(err.code, err.message, isEs));
    } finally {
      setOtpLoading(false);
    }
  };

  const confirmRecoveryCode = async () => {
    if (!deviceOtpCode.trim()) {
      setOtpMessage(isEs ? 'Ingrese el código de 6 dígitos.' : 'Please enter the 6-digit code.');
      return;
    }
    setOtpLoading(true);
    setOtpMessage('');
    try {
      const result = await confirmDeviceReset({ email: deviceOtpEmail.trim(), code: deviceOtpCode.trim() });
      setOtpMessage(result.message);
      setOtpStep('done');
      setProEmail(deviceOtpEmail.trim());
    } catch (err) {
      setOtpMessage(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 14px',
    background: 'var(--input-bg)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-color)',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginBottom: '6px',
    color: 'var(--text-color)'
  };

  const emailsEntered = freeEmail.trim().length > 0 && confirmFreeEmail.trim().length > 0;
  const emailsMatch = emailsEntered && freeEmail.trim().toLowerCase() === confirmFreeEmail.trim().toLowerCase();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', padding: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '980px', margin: '0 auto', paddingTop: '6px' }}>
        <div style={{ fontWeight: '900', fontSize: '1.4rem', color: 'var(--primary-color)', letterSpacing: '0.5px' }}>P.B.I. Labs</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setLanguage(isEs ? 'en' : 'es')}
            style={{ padding: '8px 14px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isEs ? 'EN' : 'ES'}
          </button>
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            style={{ padding: '8px 14px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiHelpCircle /> {isEs ? 'Ayuda' : 'Help'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ width: '100%', maxWidth: '980px', margin: '18px auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AdSlot slot={process.env.REACT_APP_ADSENSE_SLOT_BANNER} />

        <div style={{ textAlign: 'center', margin: '26px 0' }}>
          <h1 style={{ fontSize: '2.15rem', color: 'var(--text-color)', margin: '0 0 10px 0', fontWeight: '900' }}>
            {isEs ? 'Sistema Operativo Financiero' : 'Financial Operating System'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '620px', margin: '0 auto', lineHeight: '1.5' }}>
            {isEs
              ? 'Comience gratis en segundos o active su Licencia Pro para dominar sus ingresos, gastos, activos y pasivos.'
              : 'Start free in seconds or activate your Pro License to master your income, expenses, assets, and liabilities.'}
          </p>
        </div>

        {/* Global System Error Banner (e.g., session expired) */}
        {globalError && (
          <div style={{ padding: '14px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <FiAlertCircle style={{ flexShrink: 0 }} />
            <span>{globalError}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'stretch' }}>

          {/* FREE ACCOUNT CARD */}
          <div style={{ background: 'var(--card-bg)', padding: '30px 28px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-md)' }}>

            {(freeView === 'signup' || freeView === 'login') && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    {isEs ? 'CUENTA GRATUITA' : 'FREE TIER'}
                  </span>
                  <h2 style={{ color: 'var(--text-color)', margin: '0 0 8px 0' }}>
                    {freeView === 'signup' ? (isEs ? 'Crear Cuenta Gratis' : 'Create Free Account') : (isEs ? 'Iniciar Sesión' : 'Log In')}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                    {isEs ? 'Su bóveda financiera sincronizada en la nube.' : 'Your personal financial vault, backed up in the cloud.'}
                  </p>
                </div>

                {/* Clear Free Benefits */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 16px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px', padding: '10px', background: 'var(--bg-color)', borderRadius: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiCheck style={{ color: 'var(--success-color)' }} /> {isEs ? 'Herramienta completa' : 'Full Cash Flow tools'}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiCheck style={{ color: 'var(--success-color)' }} /> {isEs ? 'Respaldo en la nube' : 'Cloud backup'}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiCheck style={{ color: 'var(--success-color)' }} /> {isEs ? 'Gratis con anuncios' : 'Free with ads'}</span>
                </div>

                {/* Sign Up / Log In Switcher */}
                <div style={{ display: 'flex', background: 'var(--bg-color)', padding: '4px', borderRadius: '8px', marginBottom: '18px', border: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => switchFreeView('signup')}
                    style={{ flex: 1, padding: '10px', background: freeView === 'signup' ? 'var(--primary-color)' : 'transparent', color: freeView === 'signup' ? '#000' : 'var(--text-color)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {isEs ? 'Registrarse' : 'Sign Up'}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchFreeView('login')}
                    style={{ flex: 1, padding: '10px', background: freeView === 'login' ? 'var(--primary-color)' : 'transparent', color: freeView === 'login' ? '#000' : 'var(--text-color)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {isEs ? 'Iniciar Sesión' : 'Log In'}
                  </button>
                </div>

                {/* Inline Card Feedback */}
                {freeError && (
                  <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '14px', fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <FiAlertCircle style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{freeError}</span>
                  </div>
                )}

                <form onSubmit={onFreeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                  <div>
                    <label htmlFor="free-email" style={labelStyle}>
                      {isEs ? 'Correo electrónico' : 'Email address'}
                    </label>
                    <input
                      id="free-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={freeEmail}
                      onChange={(e) => setFreeEmail(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  {freeView === 'signup' && (
                    <div>
                      <label htmlFor="free-confirm-email" style={labelStyle}>
                        {isEs ? 'Confirmar correo electrónico' : 'Confirm email address'}
                      </label>
                      <input
                        id="free-confirm-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={confirmFreeEmail}
                        onChange={(e) => setConfirmFreeEmail(e.target.value)}
                        style={inputStyle}
                      />
                      {emailsEntered && (
                        <div style={{ fontSize: '0.78rem', marginTop: '5px', color: emailsMatch ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 'bold' }}>
                          {emailsMatch
                            ? (isEs ? '✓ Los correos coinciden' : '✓ Emails match')
                            : (isEs ? 'Los correos aún no coinciden' : 'Emails do not match yet')}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label htmlFor="free-password" style={{ ...labelStyle, marginBottom: 0 }}>
                        {isEs ? 'Contraseña' : 'Password'}
                      </label>
                      {freeView === 'login' && (
                        <button
                          type="button"
                          onClick={() => switchFreeView('forgot')}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.83rem', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                        >
                          {isEs ? '¿Olvidó su contraseña?' : 'Forgot Password?'}
                        </button>
                      )}
                    </div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        id="free-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete={freeView === 'signup' ? 'new-password' : 'current-password'}
                        placeholder={freeView === 'signup' ? (isEs ? 'Mínimo 6 caracteres' : 'Minimum 6 characters') : '••••••••'}
                        value={freePassword}
                        onChange={(e) => setFreePassword(e.target.value)}
                        style={{ ...inputStyle, paddingRight: '45px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {freeView === 'signup' && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                        {isEs ? 'Debe tener al menos 6 caracteres.' : 'Must be at least 6 characters long.'}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={freeLoading}
                    style={{ width: '100%', padding: '15px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', marginTop: '6px' }}
                  >
                    {freeLoading ? '...' : freeView === 'signup' ? (isEs ? 'Crear Cuenta Gratis' : 'Create Free Account') : (isEs ? 'Entrar al Sistema' : 'Log In to Vault')}
                  </button>

                  {freeView === 'signup' && (
                    <div style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {isEs ? '¿Ya tiene cuenta?' : 'Already have an account?'}{' '}
                      <button
                        type="button"
                        onClick={() => switchFreeView('login')}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: '0.84rem' }}
                      >
                        {isEs ? 'Iniciar sesión' : 'Log in'}
                      </button>
                      {' · '}
                      <button
                        type="button"
                        onClick={() => switchFreeView('forgot')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: '0.84rem' }}
                      >
                        {isEs ? 'Restablecer contraseña' : 'Reset password'}
                      </button>
                    </div>
                  )}
                </form>
              </>
            )}

            {freeView === 'forgot' && (
              <form onSubmit={handlePasswordResetRequest} style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.2rem', color: 'var(--primary-color)', marginBottom: '8px' }}><FiMail /></div>
                  <h2 style={{ color: 'var(--text-color)', margin: '0 0 8px 0' }}>
                    {isEs ? 'Recuperar Contraseña' : 'Reset Your Password'}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: '1.45' }}>
                    {isEs
                      ? 'Ingrese el correo de su cuenta gratuita y le enviaremos un enlace seguro para crear una nueva contraseña.'
                      : 'Enter your free account email and we will send you a secure link to create a new password.'}
                  </p>
                </div>

                {freeError && (
                  <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <FiAlertCircle style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{freeError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="reset-email" style={labelStyle}>
                    {isEs ? 'Correo electrónico' : 'Email address'}
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={freeEmail}
                    onChange={(e) => setFreeEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={freeLoading}
                  style={{ width: '100%', padding: '15px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer' }}
                >
                  {freeLoading ? '...' : (isEs ? 'Enviar Enlace de Recuperación' : 'Send Reset Link')}
                </button>

                <button
                  type="button"
                  onClick={() => switchFreeView('login')}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem', marginTop: '4px' }}
                >
                  <FiArrowLeft /> {isEs ? 'Volver a Iniciar Sesión' : 'Back to Log In'}
                </button>
              </form>
            )}

            {freeView === 'forgotSent' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ fontSize: '2.4rem', color: 'var(--success-color)' }}><FiMail /></div>
                <h2 style={{ color: 'var(--text-color)', margin: 0 }}>
                  {isEs ? 'Revise su Correo' : 'Check Your Inbox'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0, lineHeight: '1.5' }}>
                  {isEs
                    ? `Enviamos un enlace de recuperación a `
                    : `We sent a password reset link to `}
                  <strong style={{ color: 'var(--text-color)' }}>{freeEmail.trim()}</strong>.
                  <br />
                  {isEs
                    ? 'Haga clic en el enlace del correo para crear su nueva contraseña. Si no lo ve, revise Spam o Promociones.'
                    : 'Click the link in the email to set your new password. Check your Spam or Junk folder if you do not see it within a minute.'}
                </p>

                <button
                  type="button"
                  onClick={() => switchFreeView('login')}
                  style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '6px' }}
                >
                  {isEs ? 'Volver a Iniciar Sesión' : 'Back to Log In'}
                </button>

                <button
                  type="button"
                  onClick={() => switchFreeView('forgot')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.88rem' }}
                >
                  {isEs ? 'Intentar con otro correo' : 'Try a different email'}
                </button>
              </div>
            )}

            {freeView === 'confirmSent' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ fontSize: '2.4rem', color: 'var(--success-color)' }}><FiMail /></div>
                <h2 style={{ color: 'var(--text-color)', margin: 0 }}>
                  {isEs ? 'Confirme su Correo' : 'Confirm Your Email'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0, lineHeight: '1.5' }}>
                  {isEs ? 'Enviamos un enlace de confirmación a ' : 'We sent a confirmation link to '}
                  <strong style={{ color: 'var(--text-color)' }}>{freeEmail.trim()}</strong>.
                  <br />
                  {isEs ? 'Confirme su correo y luego inicie sesión.' : 'Click the link in your email, then log in below.'}
                </p>

                {freeError && (
                  <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 'bold' }}>
                    {freeError}
                  </div>
                )}
                {freeSuccess && (
                  <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-color)', color: 'var(--success-color)', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 'bold' }}>
                    {freeSuccess}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => switchFreeView('login')}
                  style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                >
                  {isEs ? 'Ir a Iniciar Sesión' : 'Go to Log In'}
                </button>

                <button
                  type="button"
                  disabled={freeLoading}
                  onClick={onResendConfirmation}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.88rem' }}
                >
                  {freeLoading ? '...' : (isEs ? 'Reenviar correo de confirmación' : 'Resend confirmation email')}
                </button>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <AdSlot slot={process.env.REACT_APP_ADSENSE_SLOT_CARD} />
            </div>
          </div>

          {/* PRO LICENSE CARD */}
          <div style={{ background: 'var(--card-bg)', padding: '30px 28px', borderRadius: '16px', border: '2px solid var(--primary-color)', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary-color)', color: '#000', padding: '6px 16px', fontSize: '0.75rem', fontWeight: 'bold', borderBottomLeftRadius: '12px', borderTopRightRadius: '14px' }}>
              {isEs ? 'MÁS POPULAR' : 'BEST VALUE'}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '6px' }}>
              <h2 style={{ color: 'var(--primary-color)', margin: '0 0 8px 0' }}>{isEs ? 'Licencia Pro' : 'Pro License'}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                {isEs ? 'Experiencia sin distracciones para usuarios serios.' : 'Distraction-free experience for committed builders.'}
              </p>
            </div>

            {/* Clear Pro Benefits */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 16px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px', padding: '10px', background: 'var(--bg-color)', borderRadius: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiCheck style={{ color: 'var(--primary-color)' }} /> {isEs ? '100% Sin Anuncios' : '100% Ad-Free'}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiCheck style={{ color: 'var(--primary-color)' }} /> {isEs ? 'Hasta 2 dispositivos' : 'Up to 2 devices'}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiCheck style={{ color: 'var(--primary-color)' }} /> {isEs ? 'Activación instantánea' : 'Instant activation'}</span>
            </div>

            <a href={buyUrl} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', padding: '15px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.05rem', textAlign: 'center', marginBottom: '18px' }}>
              {isEs ? 'Comprar Licencia Pro en Gumroad' : 'Get Your Pro License'}
            </a>

            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {isEs ? '¿Ya tiene su clave de licencia? Actívela aquí:' : 'Already have a license key? Activate this device:'}
            </div>

            {proError && (
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '14px', fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <FiAlertCircle style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{proError}</span>
              </div>
            )}

            <form onSubmit={onProSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              <div>
                <label htmlFor="pro-email" style={labelStyle}>
                  {isEs ? 'Correo de compra (Gumroad)' : 'Gumroad purchase email'}
                </label>
                <input
                  id="pro-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={isEs ? 'correo@ejemplo.com' : 'you@example.com'}
                  value={proEmail}
                  onChange={(e) => setProEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="pro-license" style={labelStyle}>
                  {isEs ? 'Clave de Licencia' : 'License key'}
                </label>
                <input
                  id="pro-license"
                  type="text"
                  required
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={proLoading}
                style={{ width: '100%', padding: '15px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', marginTop: 'auto' }}
              >
                {proLoading ? '...' : (isEs ? 'Activar Dispositivo Pro' : 'Activate Pro Device')}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              <span>{isEs ? '¿Cambió de teléfono o PC?' : 'Switched phone or PC?'}</span>
              <button
                type="button"
                onClick={() => {
                  setIsDeviceOtpOpen(true);
                  setOtpStep('email');
                  setOtpMessage('');
                  setDeviceOtpCode('');
                  if (proEmail.trim() && !deviceOtpEmail) setDeviceOtpEmail(proEmail.trim());
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold', fontSize: '0.88rem', padding: 0 }}
              >
                {isEs ? '¿Dispositivo perdido?' : 'Lost Device?'}
              </button>
            </div>
          </div>

        </div>
      </div>

      <footer style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '15px 0' }}>
        powered by P.B.I. Labs
      </footer>

      {/* UPGRADED HELP & ONBOARDING MODAL */}
      {isHelpOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, padding: 20 }}>
          <div style={{ background: 'var(--card-bg)', padding: 28, borderRadius: 16, maxWidth: 580, width: '100%', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '16px' }}>
              {isEs ? 'Guía Rápida y Ayuda' : 'Quick Start Guide & Help'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem', lineHeight: '1.5' }}>
              <div style={{ padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--text-color)' }}>{isEs ? '1. Cuenta Gratuita vs. Licencia Pro' : '1. Free Account vs. Pro License'}</strong>
                <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>
                  {isEs
                    ? 'La Cuenta Gratuita le da acceso completo a la herramienta financiera con respaldo en la nube (con anuncios). La Licencia Pro elimina todos los anuncios y le permite activar hasta 2 dispositivos con su clave de Gumroad.'
                    : 'The Free Account gives you full access to the financial engine with cloud backup (ad-supported). The Pro License removes all ads and lets you activate up to 2 devices using your Gumroad key.'}
                </p>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--text-color)' }}>{isEs ? '2. ¿Olvidó su contraseña (Cuenta Gratuita)?' : '2. Forgot your Free Account password?'}</strong>
                <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>
                  {isEs
                    ? 'Haga clic en "Iniciar Sesión" o "Restablecer contraseña" en la tarjeta gratuita. Le enviaremos un enlace seguro a su correo para elegir una nueva contraseña.'
                    : 'Click "Log In" or "Reset password" on the Free Tier card. We will email you a secure link to set a new password right away.'}
                </p>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--text-color)' }}>{isEs ? '3. ¿Límite de dispositivos Pro?' : '3. Pro Device Limit Reached?'}</strong>
                <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>
                  {isEs
                    ? 'Si perdió un dispositivo o cambió de navegador, haga clic en "¿Dispositivo perdido?" en la tarjeta Pro. Le enviaremos un código de 6 dígitos por correo para liberar sus dispositivos.'
                    : 'If you lost a device or switched browsers, click "Lost Device?" on the Pro card. We will email you a 6-digit code to reset your device seats.'}
                </p>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--primary-color)' }}>{isEs ? 'Glosario Rich Dad' : 'Rich Dad Glossary'}</strong>
                <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>
                  {isEs
                    ? 'Un activo pone dinero en su bolsillo. Un pasivo saca dinero de su bolsillo. El flujo de caja es ingresos menos gastos.'
                    : 'An asset puts money in your pocket. A liability takes money out of your pocket. Cash flow is income minus expenses.'}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button type="button" onClick={() => setIsHelpOpen(false)} style={{ padding: '10px 20px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
                {isEs ? 'Entendido' : 'Got It'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOST DEVICE OTP MODAL */}
      {isDeviceOtpOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, padding: 20 }}>
          <div style={{ background: 'var(--card-bg)', padding: 28, borderRadius: 16, maxWidth: 440, width: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>{isEs ? 'Recuperar dispositivo Pro' : 'Recover a Pro device'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '18px', lineHeight: '1.45' }}>
              {isEs
                ? 'Enviaremos un código de verificación al correo de su licencia Gumroad. El código nunca se muestra en pantalla.'
                : 'We email a verification code to your Gumroad license address. For your security, the code is never shown on this screen.'}
            </p>

            <label htmlFor="otp-email" style={labelStyle}>{isEs ? 'Correo de la licencia' : 'License email'}</label>
            <input
              id="otp-email"
              type="email"
              disabled={otpStep === 'done'}
              placeholder="you@example.com"
              value={deviceOtpEmail}
              onChange={(e) => setDeviceOtpEmail(e.target.value)}
              style={{ ...inputStyle, marginBottom: 14 }}
            />

            {otpStep !== 'email' && (
              <>
                <label htmlFor="otp-code" style={labelStyle}>{isEs ? 'Código de 6 dígitos' : '6-digit code'}</label>
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  disabled={otpStep === 'done'}
                  placeholder="123456"
                  value={deviceOtpCode}
                  onChange={(e) => setDeviceOtpCode(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 14 }}
                />
              </>
            )}

            {otpMessage && (
              <p style={{ fontSize: '0.9rem', color: otpStep === 'done' ? 'var(--success-color)' : 'var(--primary-color)', fontWeight: 'bold', marginBottom: 14 }}>
                {otpMessage}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: '8px' }}>
              {otpStep === 'email' && (
                <button type="button" disabled={otpLoading} onClick={sendRecoveryCode} style={{ flex: 1, padding: '13px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
                  {otpLoading ? '...' : (isEs ? 'Enviar código' : 'Send code')}
                </button>
              )}
              {otpStep === 'code' && (
                <button type="button" disabled={otpLoading} onClick={confirmRecoveryCode} style={{ flex: 1, padding: '13px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
                  {otpLoading ? '...' : (isEs ? 'Liberar dispositivos' : 'Release devices')}
                </button>
              )}
              {otpStep === 'done' && (
                <button type="button" onClick={() => setIsDeviceOtpOpen(false)} style={{ flex: 1, padding: '13px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
                  {isEs ? 'Listo — Activar ahora' : 'Done — Activate Now'}
                </button>
              )}
              {otpStep !== 'done' && (
                <button type="button" onClick={() => setIsDeviceOtpOpen(false)} style={{ padding: '13px 18px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer' }}>
                  {isEs ? 'Cerrar' : 'Close'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}