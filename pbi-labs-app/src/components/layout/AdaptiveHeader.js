import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiHome, FiInfo, FiShield, FiFileText, FiMail, FiLogOut, FiFolder, FiChevronDown, FiChevronUp, FiSun, FiMoon, FiKey, FiEye, FiEyeOff, FiX } from 'react-icons/fi';

export default function AdaptiveHeader({ setCurrentView }) {
  const { language, setLanguage, theme, setTheme, handleLogout, authSession, handleUpdatePassword } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const menuRef = useRef(null);

  // Change Password Modal State (Free Tier users)
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const isEs = language === 'es';
  const isFreeUser = authSession?.tier === 'free';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setMenuOpen(false);
    setLegalOpen(false);
  };

  const openPasswordModal = () => {
    setMenuOpen(false);
    setLegalOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setPwError('');
    setPwSuccess('');
    setPwModalOpen(true);
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

  const pwInputStyle = {
    width: '100%',
    padding: '12px',
    paddingRight: '42px',
    background: 'var(--input-bg)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-color)',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none'
  };

  return (
    <>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: 'var(--card-bg)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 2000,
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
      }}>

        <div style={{ fontWeight: '900', fontSize: '1.4rem', color: 'var(--primary-color)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>P.B.I.</span>
          <span style={{ color: 'var(--text-color)' }}>Labs</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          <button
            onClick={() => setLanguage(isEs ? 'en' : 'es')}
            style={{ padding: '8px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
            {isEs ? 'EN' : 'ES'}
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ padding: '8px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>
              <span>{isEs ? 'Menú' : 'Menu'}</span>
              <span>{menuOpen ? '▲' : '▼'}</span>
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '50px',
                width: '260px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                animation: 'fadeIn 0.2s ease'
              }}>

                <button
                  onClick={() => handleNavClick('dashboard')}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', background: 'var(--bg-color)', border: 'none', color: 'var(--text-color)', textAlign: 'left', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  <FiHome style={{ color: 'var(--primary-color)' }} /> {isEs ? 'Bóveda Principal' : 'Main Vault'}
                </button>

                {isFreeUser && (
                  <button
                    onClick={openPasswordModal}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', color: 'var(--text-color)', textAlign: 'left', borderRadius: '10px', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
                    <FiKey style={{ color: 'var(--primary-color)' }} /> {isEs ? 'Cambiar Contraseña' : 'Change Password'}
                  </button>
                )}

                <button
                  onClick={() => handleNavClick('about')}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', color: 'var(--text-color)', textAlign: 'left', borderRadius: '10px', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
                  <FiInfo style={{ color: 'var(--text-muted)' }} /> {isEs ? 'Acerca de Nosotros' : 'About Us'}
                </button>

                <div style={{ background: 'var(--bg-color)', borderRadius: '10px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setLegalOpen(!legalOpen)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', color: 'var(--text-color)', textAlign: 'left', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FiFolder style={{ color: 'var(--text-muted)' }} /> {isEs ? 'Legal y Soporte' : 'Legal & Support'}
                    </span>
                    {legalOpen ? <FiChevronUp /> : <FiChevronDown />}
                  </button>

                  {legalOpen && (
                    <div style={{ padding: '0 14px 10px 38px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => handleNavClick('privacy')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <FiShield /> {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
                      </button>
                      <button
                        onClick={() => handleNavClick('terms')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <FiFileText /> {isEs ? 'Términos de Servicio' : 'Terms of Service'}
                      </button>
                      <button
                        onClick={() => handleNavClick('contact')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'rgba(212, 175, 55, 0.1)', border: 'none', color: 'var(--text-color)', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <FiMail style={{ color: 'var(--primary-color)' }} /> {isEs ? 'Contacto Soporte' : 'Contact Support'}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />

                <button
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', textAlign: 'left', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  <FiLogOut /> {isEs ? 'Cerrar Sesión Segura' : 'Secure Log Out'}
                </button>

              </div>
            )}
          </div>

        </div>
      </header>

      {/* Change Password Modal (Free Users) */}
      {pwModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--card-bg)', padding: '28px', borderRadius: '16px', maxWidth: '420px', width: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{isEs ? 'Cambiar Contraseña' : 'Change Password'}</h3>
              <button type="button" onClick={() => setPwModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
                <FiX />
              </button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              {isEs ? 'Ingrese una nueva contraseña de al menos 6 caracteres para su cuenta gratuita.' : 'Enter a new password (at least 6 characters) for your free account.'}
            </p>

            {pwError && (
              <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '8px', marginBottom: '14px', fontSize: '0.88rem', fontWeight: 'bold' }}>
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-color)', color: 'var(--success-color)', borderRadius: '8px', marginBottom: '14px', fontSize: '0.88rem', fontWeight: 'bold' }}>
                {pwSuccess}
              </div>
            )}

            <form onSubmit={onChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.15rem', display: 'flex' }}>
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
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.15rem', display: 'flex' }}>
                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={pwSaving}
                style={{ padding: '13px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                {pwSaving ? '...' : (isEs ? 'Guardar Nueva Contraseña' : 'Save New Password')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}