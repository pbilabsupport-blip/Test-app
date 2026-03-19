import React from 'react';
import { useAppContext } from '../context/AppContext';
import { FaSun, FaMoon, FaAdjust } from 'react-icons/fa';

export const ThemeToggle = () => {
  const { theme, setTheme } = useAppContext();

  const containerStyle = {
    display: 'flex', background: 'var(--toggle-bg, rgba(128, 128, 128, 0.15))',
    borderRadius: '30px', padding: '4px', position: 'relative',
    width: 'fit-content', gap: '2px' 
  };

  const buttonStyle = (isActive) => ({
    border: 'none', background: isActive ? 'var(--text-color)' : 'transparent',
    color: isActive ? 'var(--bg-color)' : 'var(--text-muted)',
    padding: '8px 16px', cursor: 'pointer', borderRadius: '25px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', fontSize: '1.1rem',
    boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.2)' : 'none',
    minWidth: '44px', minHeight: '44px'
  });

  return (
    <div style={containerStyle}>
      <button type="button" onClick={() => setTheme('light')} style={buttonStyle(theme === 'light')} aria-label="Light Mode"><FaSun /></button>
      <button type="button" onClick={() => setTheme('dark')} style={buttonStyle(theme === 'dark')} aria-label="Dark Mode"><FaMoon /></button>
      <button type="button" onClick={() => setTheme('grayscale')} style={buttonStyle(theme === 'grayscale')} aria-label="Grayscale Mode"><FaAdjust /></button>
    </div>
  );
};