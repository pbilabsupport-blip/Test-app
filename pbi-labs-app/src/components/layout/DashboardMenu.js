import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import PrivacyPolicy from '../legal/PrivacyPolicy';
import TermsOfService from '../legal/TermsOfService';
import AboutUs from '../legal/AboutUs';
import ContactUs from '../legal/ContactUs';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function DashboardMenu({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const { language, authSession, handleUpdatePassword } = useAppContext();

  // Change Password State (for logged-in Free tier users)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const isEs = language === 'es';
  const isFreeUser = authSession?.tier === 'free';

  const labels = {
    tools: isEs ? '☰ Herramientas' : '☰ Tools',
    sectionAccount: isEs ? 'CUENTA' : 'ACCOUNT',
    changePassword: isEs ? 'Cambiar Contraseña' : 'Change Password',
    sectionSupport: isEs ? 'SOPORTE Y LEGAL' : 'SUPPORT & LEGAL',
    about: isEs ? 'Sobre Nosotros' : 'About Us',
    privacy: isEs ? 'Privacidad y Términos' : 'Privacy & Terms',
    terms: isEs ? 'Términos de Servicio' : 'Terms of Service',
    contact: isEs ? 'Contacto' : 'Contact Us',
    logout: isEs ? 'Cerrar Sesión' : 'Log Out',
    close: isEs ? 'Cerrar' : 'Close'
  };

  const closeModal = () => {
    setActiveModal(null);
    setNewPassword('');
    setConfirmPassword('');
    setPwError('');
    setPwSuccess('');
  };

  const onChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword.length < 6) {
      setPwError(isEs ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError(isEs ? 'Las contraseñas no coinciden.' : 'Passwords do not match.');
      return;
    }

    setPwSaving(true);
    try {
      await handleUpdatePassword(newPassword);
      setPwSuccess(isEs ? '¡Contraseña actualizada con éxito!' : 'Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('different from')) {
        setPwError(isEs ? 'La nueva contraseña debe ser diferente a la anterior.' : 'New password must be different from your current password.');
      } else {
        setPwError(msg || (isEs ? 'Error al actualizar contraseña.' : 'Could not update password.'));
      }
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '8px 14px', backgroundColor: 'var(--card-bg, #ffffff)', color: 'var(--text-color, #111827)', border: '1px solid var(--border-color, #d1d5db)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
      >
        {labels.tools}
      </button>

      {isOpen && (
        <div style={{ position: 'absolute', right: 0, top: '110%', width: '220px', backgroundColor: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {isFreeUser && (
            <>
              <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af', backgroundColor: 'var(--bg-color, #f9fafb)' }}>
                {labels.sectionAccount}
              </div>
              <button onClick={() => { setActiveModal('password'); setIsOpen(false); }} style={menuItemStyle}>
                {labels.changePassword}
              </button>
            </>
          )}

          <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af', backgroundColor: 'var(--bg-color, #f9fafb)' }}>
            {labels.sectionSupport}
          </div>
          <button onClick={() => { setActiveModal('about'); setIsOpen(false); }} style={menuItemStyle}>{labels.about}</button>
          <button onClick={() => { setActiveModal('privacy'); setIsOpen(false); }} style={menuItemStyle}>{labels.privacy}</button>
          <button onClick={() => { setActiveModal('terms'); setIsOpen(false); }} style={menuItemStyle}>{labels.terms}</button>
          <button onClick={() => { setActiveModal('contact'); setIsOpen(false); }} style={menuItemStyle}>{labels.contact}</button>

          <div style={{ borderTop: '1px solid var(--border-color, #e5e7eb)', marginTop: '4px' }}>
            <button onClick={() => { setIsOpen(false); if (onLogout) onLogout(); }} style={{ ...menuItemStyle, color: '#ef4444', fontWeight: 'bold' }}>
              {labels.logout}
            </button>
          </div>
        </div>
      )}

      {activeModal && (
        <div style={modalBackdropStyle} onClick={closeModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
              <button onClick={closeModal} style={closeButtonStyle}>{labels.close} ✕</button>
            </div>
            {activeModal === 'about' && <AboutUs />}
            {activeModal === 'privacy' && <PrivacyPolicy />}
            {activeModal === 'terms' && <TermsOfService />}
            {activeModal === 'contact' && <ContactUs />}
            {activeModal === 'password' && (
              <form onSubmit={onChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h2 style={{ margin: '0 0 4px 0', color: 'var(--primary-color)' }}>{labels.changePassword}</h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted, #6b7280)' }}>
                  {isEs
                    ? 'Ingrese una nueva contraseña de al menos 6 caracteres para su cuenta gratuita.'
                    : 'Enter a new password (at least 6 characters) for your free account.'}
                </p>

                {pwError && (
                  <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 'bold' }}>
                    {pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 'bold' }}>
                    {pwSuccess}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                    {isEs ? 'Nueva contraseña' : 'New password'}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder={isEs ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={pwInputStyle}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} style={eyeButtonStyle}>
                      {showNew ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                    {isEs ? 'Confirmar nueva contraseña' : 'Confirm new password'}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder={isEs ? 'Repita la contraseña' : 'Re-enter password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={pwInputStyle}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={eyeButtonStyle}>
                      {showConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pwSaving}
                  style={{ padding: '12px', backgroundColor: 'var(--primary-color, #f59e0b)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                >
                  {pwSaving ? '...' : (isEs ? 'Guardar Nueva Contraseña' : 'Save New Password')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const menuItemStyle = { padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color, #f3f4f6)', color: 'var(--text-color, #111827)', cursor: 'pointer', fontSize: '0.85rem', width: '100%' };
const modalBackdropStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' };
const modalContentStyle = { backgroundColor: 'var(--card-bg, #ffffff)', color: 'var(--text-color, #111827)', padding: '24px', borderRadius: '12px', maxWidth: '650px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const closeButtonStyle = { backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const pwInputStyle = { width: '100%', padding: '12px', paddingRight: '42px', backgroundColor: 'var(--input-bg, #f9fafb)', color: 'var(--text-color, #111827)', border: '1px solid var(--border-color, #d1d5db)', borderRadius: '8px', fontSize: '1rem', outline: 'none' };
const eyeButtonStyle = { position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted, #6b7280)', cursor: 'pointer', fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center' };