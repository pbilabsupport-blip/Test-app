import React from 'react';
import { useAppContext } from '../context/AppContext';
import { FaSun, FaMoon, FaAdjust } from 'react-icons/fa';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppContext();

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button 
        onClick={() => toggleTheme('light')}
        style={{ 
          background: theme === 'light' ? 'var(--border-color)' : 'transparent', 
          border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-color)' 
        }}
        title="Light Mode"
      >
        <FaSun size={14} />
      </button>
      <button 
        onClick={() => toggleTheme('dark')}
        style={{ 
          background: theme === 'dark' ? 'var(--border-color)' : 'transparent', 
          border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-color)' 
        }}
        title="Dark Mode"
      >
        <FaMoon size={14} />
      </button>
      <button 
        onClick={() => toggleTheme('grayscale')}
        style={{ 
          background: theme === 'grayscale' ? 'var(--border-color)' : 'transparent', 
          border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-color)' 
        }}
        title="Grayscale Mode"
      >
        <FaAdjust size={14} />
      </button>
    </div>
  );
}

export default ThemeToggle;