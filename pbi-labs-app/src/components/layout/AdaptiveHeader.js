import React, { useState, useEffect } from 'react';
import { FaBars, FaGlobe, FaSignOutAlt } from 'react-icons/fa';
import { SlideOutMenu } from './SlideOutMenu';
import { ThemeToggle } from '../ThemeToggle'; 
import { useAppContext } from '../../context/AppContext'; 
import FinancialGlossaryModal from './FinancialGlossaryModal';

export const AdaptiveHeader = ({ onLogout, exportButtons }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  
  const { language, toggleLanguage } = useAppContext();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const headerStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '15px 20px', background: 'var(--bg-color)',
    borderBottom: '2px solid var(--border-color)',
    position: 'sticky', top: 0, zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  };

  return (
    <header style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
          P.B.I. <span style={{ color: 'var(--primary-color)' }}>Labs</span>
        </h1>
      </div>

      {isMobile ? (
        <>
          <button onClick={() => setIsMenuOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', fontSize: '1.5rem', cursor: 'pointer', padding: '5px' }}>
            <FaBars />
          </button>
          
          <SlideOutMenu 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            onLogout={onLogout}
            exportButtons={exportButtons}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
          />
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* Export Buttons injected here */}
          <div style={{ display: 'flex', gap: '10px', borderRight: '1px solid var(--border-color)', paddingRight: '20px' }}>
            {exportButtons}
          </div>

          <ThemeToggle />
          
          <button onClick={() => setIsGlossaryOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', cursor: 'pointer', fontWeight: 'bold' }}>
            <FaGlobe /> {language === 'es' ? 'Glosario' : 'Glossary'}
          </button>

          <button onClick={toggleLanguage} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)', cursor: 'pointer', fontWeight: 'bold' }}>
            <FaGlobe /> {language === 'es' ? 'ES' : 'EN'}
          </button>

          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            <FaSignOutAlt /> {language === 'es' ? 'Salir' : 'Logout'}
          </button>
        </div>
      )}

      {isGlossaryOpen && (
        <FinancialGlossaryModal language={language} closeModal={() => setIsGlossaryOpen(false)} />
      )}
    </header>
  );
};