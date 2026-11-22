import React, { useState } from 'react';
import { useAppContext } from './context/AppContext';
import ActivationScreen from './features/auth/ActivationScreen';
import CashFlowEngine from './features/tools/CashFlowEngine/CashFlowEngine';
import AdaptiveHeader from './components/layout/AdaptiveHeader';
import AboutUs from './components/legal/AboutUs';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import ContactUs from './components/legal/ContactUs';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

function describeRecoveryError(message, isEs) {
  if (!message) return isEs ? 'Error al actualizar la contraseña.' : 'Error updating password.';
  if (message.includes('New password should be different')) {
    return isEs ? 'La nueva contraseña debe ser diferente a la anterior.' : 'New password must be different from your previous password.';
  }
  if (message.includes('Auth session missing') || message.includes('expired')) {
    return isEs ? 'El enlace de recuperación expiró. Solicite uno nuevo.' : 'This recovery link has expired. Please request a new one.';
  }
  if (message.includes('at least 6 characters')) {
    return isEs ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.';
  }
  return message;
}

function MainRouter() {
  const {
    authSession,
    loading,
    language,
    recoveryMode,
    handleUpdatePassword,
    cancelRecoveryMode
  } = useAppContext();

  const [currentView, setCurrentView] = useState('dashboard');

  // Password Recovery State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const isEs = language === 'es';

  const submitNewPassword = async (e) => {
    e.preventDefault();
    setUpdateError('');
    if (newPassword.length < 6) {
      setUpdateError(isEs ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setUpdateError(isEs ? 'Las contraseñas no coinciden.' : 'Passwords do not match.');
      return;
    }
    setIsUpdating(true);
    try {
      await handleUpdatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setUpdateError(describeRecoveryError(err.message, isEs));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelRecovery = async () => {
    setNewPassword('');
    setConfirmPassword('');
    setUpdateError('');
    await cancelRecoveryMode();
  };

  const renderRecoveryModal = () => {
    if (!recoveryMode) return null;

    const inputStyle = {
      width: '100%',
      padding: '14px',
      paddingRight: '45px',
      background: 'var(--input-bg)',
      border: '1px solid var(--border-color)',
      color: 'var(--text-color)',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none'
    };

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(6px)' }}>
        <div style={{ background: 'var(--card-bg)', padding: '36px 28px', borderRadius: '16px', maxWidth: '440px', width: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ fontSize: '2.6rem', color: 'var(--primary-color)', textAlign: 'center', marginBottom: '10px' }}>
            <FiLock />
          </div>
          <h2 style={{ color: 'var(--text-color)', textAlign: 'center', margin: '0 0 8px 0' }}>
            {isEs ? 'Establecer Nueva Contraseña' : 'Set New Password'}
          </h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '20px' }}>
            {isEs
              ? 'Cree una contraseña segura de al menos 6 caracteres para acceder a su cuenta.'
              : 'Create a secure password (at least 6 characters) to access your account.'}
          </p>

          {updateError && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
              {updateError}
            </div>
          )}

          <form onSubmit={submitNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-color)' }}>
                {isEs ? 'Nueva contraseña' : 'New password'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder={isEs ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
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
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-color)' }}>
                {isEs ? 'Confirmar nueva contraseña' : 'Confirm new password'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder={isEs ? 'Repita su nueva contraseña' : 'Re-enter your new password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', marginTop: '4px' }}
            >
              {isUpdating ? '...' : (isEs ? 'Actualizar y Entrar' : 'Update & Enter')}
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={handleCancelRecovery}
              style={{ width: '100%', padding: '10px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              {isEs ? 'Cancelar y volver' : 'Cancel & Back to Login'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <h2>{isEs ? 'Cargando Bóveda de P.B.I. Labs...' : 'Loading P.B.I. Labs Vault...'}</h2>
      </div>
    );
  }

  if (!authSession || !authSession.success) {
    return (
      <>
        {renderRecoveryModal()}
        <ActivationScreen />
      </>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'about': return <AboutUs />;
      case 'privacy': return <PrivacyPolicy />;
      case 'terms': return <TermsOfService />;
      case 'contact': return <ContactUs />;
      case 'dashboard':
      default: return <CashFlowEngine />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {renderRecoveryModal()}
      <AdaptiveHeader setCurrentView={setCurrentView} />
      <main style={{ flex: 1, padding: '20px' }}>
        {renderView()}
      </main>
      <footer style={{ textAlign: 'center', padding: '15px', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
        powered by P.B.I. Labs
      </footer>
    </div>
  );
}

export default function App() {
  return <MainRouter />;
}