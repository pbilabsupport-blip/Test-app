import React from 'react';
import { FaTimes, FaGlobe, FaSignOutAlt, FaBookOpen, FaLanguage } from 'react-icons/fa';
import { ThemeToggle } from '../ThemeToggle';
import { useAppContext } from '../../context/AppContext';

export const SlideOutMenu = ({ isOpen, onClose, onLogout, exportButtons, onOpenGlossary }) => {
  const { language, toggleLanguage } = useAppContext();

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100dvh', // The DVH Mobile Fix
    backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 10000,
    display: 'flex', justifyContent: 'flex-end'
  };

  const drawerStyle = {
    width: '85%', maxWidth: '350px', height: '100%',
    backgroundColor: 'var(--bg-color)', color: 'var(--text-color)',
    boxShadow: '-5px 0 20px rgba(0,0,0,0.2)', 
    display: 'flex', flexDirection: 'column', // Flexbox ensures header, body, and footer are distinct
    padding: '0'
  };

  const listButtonStyle = {
    display: 'flex', alignItems: 'center', gap: '15px', width: '100%',
    padding: '15px 20px', background: 'transparent', border: 'none',
    color: 'var(--text-color)', fontSize: '1.1rem', fontWeight: 'bold',
    cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border-color)'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={drawerStyle} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Section (Fixed at top) */}
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary-color)' }}>P.B.I. Labs</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', color: 'var(--text-color)', cursor: 'pointer' }}>
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Navigation Section */}
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
             <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Theme / Tema</p>
             <ThemeToggle />
          </div>

          <button onClick={() => { onOpenGlossary(); onClose(); }} style={listButtonStyle}>
            <FaBookOpen style={{ color: 'var(--primary-color)' }} /> 
            {language === 'es' ? 'Glosario Financiero' : 'Financial Glossary'}
          </button>
          
          <button onClick={() => { toggleLanguage(); onClose(); }} style={listButtonStyle}>
            <FaLanguage style={{ color: 'var(--primary-color)' }} /> 
            {language === 'es' ? 'English' : 'Español'}
          </button>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Export / Exportar</p>
            {exportButtons}
          </div>
        </div>

        {/* Fixed Logout Section (Will NEVER scroll off screen) */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', flexShrink: 0, backgroundColor: 'var(--bg-color)' }}>
          <button onClick={onLogout} style={{ width: '100%', padding: '15px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
            <FaSignOutAlt /> {language === 'es' ? 'Cerrar Sesión' : 'Log Out'}
          </button>
        </div>

      </div>
    </div>
  );
};