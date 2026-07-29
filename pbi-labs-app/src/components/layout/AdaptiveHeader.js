import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { ThemeToggle } from '../ThemeToggle';
import PublicMenu from './PublicMenu';
import DashboardMenu from './DashboardMenu';

export default function AdaptiveHeader({ isAuthenticated, onLogout }) {
  const { language, setLanguage } = useAppContext();

  const toggleLanguage = () => {
    const nextLang = language === 'es' ? 'en' : 'es';
    if (setLanguage) setLanguage(nextLang);
  };

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '12px 24px', 
      borderBottom: '1px solid var(--border-color, #e5e7eb)',
      backgroundColor: 'var(--card-bg, #ffffff)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      {/* Brand Identification */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-color, #111827)', letterSpacing: '0.5px' }}>
          P.B.I. Labs
        </span>
      </div>

      {/* Control Cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Language Toggle Button */}
        <button 
          onClick={toggleLanguage}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color, #d1d5db)',
            backgroundColor: 'var(--bg-color, #ffffff)',
            color: 'var(--text-color, #111827)',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🌐 {language === 'es' ? 'ES' : 'EN'}
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Adaptive Navigation Menu */}
        {isAuthenticated ? (
          <DashboardMenu onLogout={onLogout} />
        ) : (
          <PublicMenu />
        )}
      </div>
    </header>
  );
}