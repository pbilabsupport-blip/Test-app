import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FiHome, FiInfo, FiShield, FiFileText, FiMail, FiLogOut, FiFolder, FiChevronDown, FiChevronUp } from 'react-icons/fi';

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
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', position: 'relative', zIndex: 1000 }}>
      
      {/* Brand Logo */}
      <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: 'var(--primary-color)', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>P.B.I. Labs</span>
        <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary-color)', borderRadius: '4px', border: '1px solid var(--primary-color)' }}>
          OS v2.4
        </span>
      </div>

      {/* Controls & Navigation Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        {/* Language Toggle */}
        <button 
          onClick={() => setLanguage(isEs ? 'en' : 'es')} 
          style={{ padding: '6px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
          {isEs ? 'EN' : 'ES'}
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          style={{ padding: '6px 12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Main Menu Dropdown Container */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>
            <span>{isEs ? 'Menú' : 'Menu'}</span>
            <span>{menuOpen ? '▲' : '▼'}</span>
          </button>

          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: '45px', width: '260px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              
              <button 
                onClick={() => handleNavClick('dashboard')} 
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: 'var(--text-color)', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                <FiHome /> {isEs ? 'Panel Principal' : 'Dashboard'}
              </button>

              <button 
                onClick={() => handleNavClick('about')} 
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: 'var(--text-color)', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                <FiInfo /> {isEs ? 'Acerca de' : 'About Us'}
              </button>

              {/* Legal Collapsible Folder */}
              <div>
                <button 
                  onClick={() => setLegalOpen(!legalOpen)} 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: 'var(--text-color)', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FiFolder /> {isEs ? 'Legal' : 'Legal'}</span>
                  {legalOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                {legalOpen && (
                  <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', margin: '4px 0', borderLeft: '2px solid var(--primary-color)' }}>
                    <button 
                      onClick={() => handleNavClick('privacy')} 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <FiShield /> {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
                    </button>
                    <button 
                      onClick={() => handleNavClick('terms')} 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <FiFileText /> {isEs ? 'Términos de Servicio' : 'Terms of Service'}
                    </button>
                    <button 
                      onClick={() => handleNavClick('contact')} 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'transparent', border: '1px solid var(--border-color)', background: 'rgba(212, 175, 55, 0.05)', color: 'var(--text-color)', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      <FiMail /> {isEs ? 'Contacto Soporte' : 'Contact Support'}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '5px 0' }} />

              <button 
                onClick={handleLogout} 
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger-color)', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                <FiLogOut /> {isEs ? 'Cerrar Sesión Segura' : 'Secure Log Out'}
              </button>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}