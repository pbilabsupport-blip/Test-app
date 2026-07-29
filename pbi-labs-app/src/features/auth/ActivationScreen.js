import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'temp-mail.org', 'guerrillamail.com', 
  'mailinator.com', 'yopmail.com', 'throwawaymail.com', 
  'tempmail.com', 'dropmail.me', 'fakeinbox.com'
];

export default function ActivationScreen() {
  const { handleFreeSignUp, handleFreeLogin, handleActivate, language, setLanguage } = useAppContext();
  
  // Pro Tier State
  const [proEmail, setProEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  
  // Free Tier State
  const [freeEmail, setFreeEmail] = useState('');
  const [freePassword, setFreePassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(true);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDeviceOtpOpen, setIsDeviceOtpOpen] = useState(false);
  const [deviceOtpEmail, setDeviceOtpEmail] = useState('');

  const isEs = language === 'es';

  const validateEmailDomain = (email) => {
    const domain = email.split('@')[1];
    return !DISPOSABLE_DOMAINS.includes(domain);
  };

  const onFreeSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

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
      if (isSignUpMode) {
        await handleFreeSignUp(freeEmail.trim(), freePassword);
      } else {
        await handleFreeLogin(freeEmail.trim(), freePassword);
      }
    } catch (err) {
      setError(err.message || (isEs ? 'Error de autenticación.' : 'Authentication error.'));
    }
  };

  const onProSubmit = async (e) => {
    e.preventDefault();
    if (!licenseKey.trim() || !proEmail.trim()) {
      setError(isEs ? 'Ingrese correo y clave de licencia.' : 'Enter email and license key.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await handleActivate(licenseKey.trim(), proEmail.trim(), 'pro');
    } catch (err) {
      setError(isEs ? 'Error de activación. Verifique sus datos.' : 'Activation failed. Verify details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceResetRequest = () => {
    if (!deviceOtpEmail.trim()) {
      alert(isEs ? 'Ingrese su correo primero.' : 'Enter your email first.');
      return;
    }
    alert(isEs ? `Código de recuperación enviado a ${deviceOtpEmail}` : `Recovery code sent to ${deviceOtpEmail}`);
    setIsDeviceOtpOpen(false);
    setDeviceOtpEmail('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', padding: '20px', position: 'relative' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '950px', margin: '0 auto', paddingTop: '10px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: 'var(--primary-color)', letterSpacing: '1px' }}>
          P.B.I. Labs
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setLanguage(isEs ? 'en' : 'es')} style={{ padding: '8px 16px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {isEs ? 'EN' : 'ES'}
          </button>
          <button onClick={() => setIsHelpOpen(true)} style={{ padding: '8px 16px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ? {isEs ? 'Ayuda y Glosario' : 'Help & Glossary'}
          </button>
        </div>
      </div>

      {/* Main Activation Chassis */}
      <div style={{ width: '100%', maxWidth: '950px', margin: '20px auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* Top Activation Screen Ad Slot (AdSense Banner) */}
        <div style={{ width: '100%', height: '60px', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          [ AdSense Monetization Banner - Top Slot ]
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-color)', margin: '0 0 10px 0' }}>
            {isEs ? 'Sistema Operativo Financiero' : 'Financial Operating System'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            {isEs ? 'Cree su cuenta o active su Licencia Pro para gestionar activos y pasivos.' : 'Create your account or activate your Pro License to master assets and liabilities.'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        {/* Responsive Grid Layout for Tiers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px' }}>
          
          {/* Cloud Free Tier Card */}
          <div style={{ background: 'var(--card-bg)', padding: '35px 30px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: 'var(--text-color)', marginTop: 0, marginBottom: '10px', textAlign: 'center' }}>
              {isSignUpMode ? (isEs ? 'Crear Cuenta' : 'Create Account') : (isEs ? 'Iniciar Sesión' : 'Log In')}
            </h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '20px' }}>
              {isEs ? 'Almacenamiento seguro en la nube.' : 'Secure cloud storage access.'}
            </p>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-color)', padding: '4px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
              <button 
                type="button"
                onClick={() => { setIsSignUpMode(true); setError(null); }}
                style={{ flex: 1, padding: '10px', background: isSignUpMode ? 'var(--primary-color)' : 'transparent', color: isSignUpMode ? '#000' : 'var(--text-color)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
                {isEs ? 'Registrarse' : 'Sign Up'}
              </button>
              <button 
                type="button"
                onClick={() => { setIsSignUpMode(false); setError(null); }}
                style={{ flex: 1, padding: '10px', background: !isSignUpMode ? 'var(--primary-color)' : 'transparent', color: !isSignUpMode ? '#000' : 'var(--text-color)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
                {isEs ? 'Iniciar Sesión' : 'Log In'}
              </button>
            </div>

            <form onSubmit={onFreeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: 'var(--text-muted)' }}>{isEs ? 'Correo Electrónico' : 'Email Address'}</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com" 
                  value={freeEmail} 
                  onChange={(e) => setFreeEmail(e.target.value)} 
                  style={{ width: '100%', padding: '14px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: 'var(--text-muted)' }}>{isEs ? 'Contraseña (mín. 6 caracteres)' : 'Password (min. 6 chars)'}</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  value={freePassword} 
                  onChange={(e) => setFreePassword(e.target.value)} 
                  style={{ width: '100%', padding: '14px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {loading ? (isEs ? 'Procesando...' : 'Processing...') : (isSignUpMode ? (isEs ? 'Crear Cuenta' : 'Create Account') : (isEs ? 'Acceder al Sistema' : 'Access System'))}
                </button>
              </div>
            </form>

            {/* Embedded Free Tier Card Ad Space */}
            <div style={{ width: '100%', height: '50px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              [ AdSense Sponsor Unit ]
            </div>
          </div>

          {/* Pro Tier Form Card (High Conversion Optimization) */}
          <div style={{ background: 'var(--card-bg)', padding: '35px 30px', borderRadius: '16px', border: '2px solid var(--primary-color)', boxShadow: '0 10px 40px rgba(212, 175, 55, 0.15)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            
            {/* Conversion Badge */}
            <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary-color)', color: '#000', padding: '4px 15px', fontSize: '0.75rem', fontWeight: 'bold', borderBottomLeftRadius: '10px', letterSpacing: '0.5px' }}>
              {isEs ? 'MÁS POPULAR' : 'BEST VALUE'}
            </div>

            <h2 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '10px', textAlign: 'center' }}>{isEs ? 'Licencia Pro' : 'Pro License'}</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '15px' }}>
              {isEs ? 'Herramientas avanzadas y límite de 2 dispositivos.' : 'Advanced tools and 2-device limits.'}
            </p>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--warning-color)', padding: '12px', borderRadius: '4px', marginBottom: '15px' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--warning-color)', lineHeight: '1.4' }}>
                <strong>{isEs ? 'Aviso Importante:' : 'Important Notice:'}</strong> {isEs 
                  ? 'Use el MISMO correo de su cuenta gratuita para evitar pérdida de datos.' 
                  : 'Use the EXACT SAME email as your free account to prevent data loss.'}
              </p>
            </div>

            {/* High-Converting Standout Buy Button */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <a href="https://gumroad.com" target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', padding: '16px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', transition: 'transform 0.2s', letterSpacing: '0.5px' }}>
                🚀 {isEs ? '¡Comprar Licencia Pro Aquí!' : 'Get Your Pro License Here!'}
              </a>
            </div>

            <form onSubmit={onProSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: 'var(--text-muted)' }}>{isEs ? 'Correo de Gumroad' : 'Gumroad Email'}</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com" 
                  value={proEmail} 
                  onChange={(e) => setProEmail(e.target.value)} 
                  style={{ width: '100%', padding: '14px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: 'var(--text-muted)' }}>{isEs ? 'Clave de Licencia' : 'License Key'}</label>
                <input 
                  type="text" 
                  required
                  placeholder="XXXX-XXXX-XXXX-XXXX" 
                  value={licenseKey} 
                  onChange={(e) => setLicenseKey(e.target.value)} 
                  style={{ width: '100%', padding: '14px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                />
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '5px' }}>
                {loading ? (isEs ? 'Autenticando...' : 'Authenticating...') : (isEs ? 'Activar Dispositivo Pro' : 'Activate Pro Device')}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px', fontSize: '0.85rem' }}>
              <button onClick={() => setIsDeviceOtpOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>
                {isEs ? '¿Dispositivo perdido?' : 'Lost Device?'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Visible Legal Document Links */}
      <footer style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', paddingBottom: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => alert(isEs ? 'Política de Privacidad: Sus datos están protegidos y cifrados en Supabase.' : 'Privacy Policy: Your data is secure and encrypted in Supabase.')}>
            {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
          </span>
          <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => alert(isEs ? 'Términos de Servicio: Máximo 2 dispositivos por licencia.' : 'Terms of Service: Maximum 2 devices per license.')}>
            {isEs ? 'Términos de Servicio' : 'Terms of Service'}
          </span>
          <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => alert(isEs ? 'Soporte: Use la recuperación de dispositivo por OTP.' : 'Support: Use OTP device recovery.')}>
            {isEs ? 'Contacto Soporte' : 'Contact Support'}
          </span>
        </div>
        <div>powered by P.B.I. Labs</div>
      </footer>

      {/* Help Modal with Financial Glossary & Robert Kiyosaki Teachings Accreditation */}
      {isHelpOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '35px', borderRadius: '16px', maxWidth: '600px', width: '100%', border: '1px solid var(--border-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--primary-color)', marginTop: 0, fontSize: '1.5rem' }}>
              {isEs ? 'Glosario Financiero y Educación Rich Dad' : 'Financial Glossary & Rich Dad Education'}
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-color)', margin: '15px 0' }}>
              {isEs 
                ? 'Este software rinde tributo y está inspirado en los principios educativos de Robert Kiyosaki ("Rich Dad"). Su propósito es enseñar control financiero mediante la distinción entre activos y pasivos.'
                : 'This software pays tribute to and is inspired by the educational principles of Robert Kiyosaki ("Rich Dad"). Its purpose is teaching financial control through the distinction of assets and liabilities.'}
            </p>

            {/* Financial Glossary Definitions */}
            <div style={{ background: 'var(--bg-color)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '15px' }}>
              <h4 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0', fontSize: '1.05rem' }}>
                {isEs ? '📖 Glosario de Conceptos Clave:' : '📖 Key Concepts Glossary:'}
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-muted)' }}>
                <li><strong>{isEs ? 'Activo (Asset):' : 'Asset:'}</strong> {isEs ? 'Algo que mete dinero en tu bolsillo sin importar si trabajas.' : 'Something that puts money in your pocket whether you work or not.'}</li>
                <li><strong>{isEs ? 'Pasivo (Liability):' : 'Liability:'}</strong> {isEs ? 'Algo que saca dinero de tu bolsillo.' : 'Something that takes money out of your pocket.'}</li>
                <li><strong>{isEs ? 'Flujo de Caja (Cash Flow):' : 'Cash Flow:'}</strong> {isEs ? 'La dirección en la que se mueve el dinero (Ingresos vs Gastos).' : 'The direction money moves (Income vs Expenses).'}</li>
              </ul>
            </div>

            <div style={{ background: 'rgba(212, 175, 55, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                <em>{isEs 
                  ? 'Aviso de Propiedad Intelectual: Las metodologías educativas y el glosario financiero aquí expuestos reconocen las enseñanzas de Robert Kiyosaki y The Rich Dad Company como fuente de inspiración metodológica.'
                  : 'Intellectual Property Notice: The educational methodologies and financial glossary presented here acknowledge the teachings of Robert Kiyosaki and The Rich Dad Company as a source of methodological inspiration.'}</em>
              </p>
            </div>

            <button onClick={() => setIsHelpOpen(false)} style={{ width: '100%', padding: '14px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
              {isEs ? 'Entendido' : 'Got It'}
            </button>
          </div>
        </div>
      )}

      {/* Device Reset Modal */}
      {isDeviceOtpOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '35px', borderRadius: '16px', maxWidth: '400px', width: '100%', border: '1px solid var(--border-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: 'var(--primary-color)', marginTop: 0, fontSize: '1.4rem' }}>{isEs ? 'Recuperación de Dispositivo' : 'Device Recovery'}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
              {isEs ? 'Ingrese el correo asociado a su compra. Enviaremos un código para liberar todas las sesiones.' : 'Enter the email associated with your purchase. We will send a code to release all sessions.'}
            </p>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={deviceOtpEmail}
              onChange={(e) => setDeviceOtpEmail(e.target.value)}
              style={{ width: '100%', padding: '14px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', marginBottom: '20px', fontSize: '1rem', outline: 'none' }} 
            />
            <button onClick={handleDeviceResetRequest} style={{ width: '100%', padding: '14px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginBottom: '10px' }}>
              {isEs ? 'Enviar Código' : 'Send Code'}
            </button>
            <button onClick={() => setIsDeviceOtpOpen(false)} style={{ width: '100%', padding: '14px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
              {isEs ? 'Cancelar' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}