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

function MainRouter() {
  const { authSession, loading, language, recoveryMode, handleUpdatePassword } = useAppContext();
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Password Recovery State
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    setIsUpdating(true);
    try {
      await handleUpdatePassword(newPassword);
    } catch (err) {
      setUpdateError(err.message || 'Error updating password.');
    } finally {
      setIsUpdating(false);
    }
  };

  // STRESS PATH 1 FIX: The un-skippable password recovery modal
  const renderRecoveryModal = () => {
    if (!recoveryMode) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(6px)' }}>
        <div style={{ background: 'var(--card-bg)', padding: '40px 30px', borderRadius: '16px', maxWidth: '440px', width: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ fontSize: '3rem', color: 'var(--primary-color)', textAlign: 'center', marginBottom: '10px' }}>
            <FiLock />
          </div>
          <h2 style={{ color: 'var(--text-color)', textAlign: 'center', margin: '0 0 10px 0' }}>
            {isEs ? 'Establecer Nueva Contraseña' : 'Set New Password'}
          </h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '20px' }}>
            {isEs ? 'Bienvenido de nuevo. Por favor, escriba su nueva contraseña abajo.' : 'Welcome back. Please type your secure new password below.'}
          </p>

          {updateError && (
            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
              {updateError}
            </div>
          )}

          <form onSubmit={submitNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                placeholder={isEs ? 'Nueva contraseña...' : 'New password...'}
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={{ width: '100%', padding: '14px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '1rem', outline: 'none', paddingRight: '45px' }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            
            <button type="submit" disabled={isUpdating} style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer' }}>
              {isUpdating ? '...' : (isEs ? 'Actualizar y Entrar' : 'Update & Enter')}
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

  // We render the recovery modal on top of everything so it works even if they are on the activation screen
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