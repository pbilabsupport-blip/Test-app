import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiHome, FiInfo, FiShield, FiFileText, FiMail, FiLogOut, FiFolder, FiChevronDown, FiChevronUp, FiSun, FiMoon } from 'react-icons/fi';

export default function AdaptiveHeader({ setCurrentView }) {
  const { language, setLanguage, theme, setTheme, handleLogout } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const menuRef = useRef(null);

  const isEs = language === 'es';

  // Close menu when clicking outside
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

  return (
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
      
      {/* Brand Logo */}
      <div style={{ fontWeight: '900', fontSize: '1.4rem', color: 'var(--primary-color)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>P.B.I.</span>
        <span style={{ color: 'var(--text-color)' }}>Labs</span>
      </div>

      {/* Controls & Navigation Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Language Toggle */}
        <button 
          onClick={() => setLanguage(isEs ? 'en' : 'es')} 
          style={{ padding: '8px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
          {isEs ? 'EN' : 'ES'}
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          style={{ padding: '8px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
        </button>

        {/* Main Menu Dropdown Container */}
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

              <button 
                onClick={() => handleNavClick('about')} 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', color: 'var(--text-color)', textAlign: 'left', borderRadius: '10px', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
                <FiInfo style={{ color: 'var(--text-muted)' }} /> {isEs ? 'Acerca de Nosotros' : 'About Us'}
              </button>

              {/* Legal Collapsible Folder */}
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
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--text-color)', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
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
  );
}