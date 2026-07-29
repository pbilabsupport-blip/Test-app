// File: src/components/layout/AdaptiveHeader.js
import React from 'react';
import { ThemeToggle } from '../ThemeToggle'; // Fixed: Named import wrapped in curly braces
import PublicMenu from './PublicMenu';
import DashboardMenu from './DashboardMenu';

export default function AdaptiveHeader({ isAuthenticated, onLogout, onNavigate }) {
  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '12px 20px', 
      borderBottom: '1px solid var(--border-color, #e5e7eb)',
      backgroundColor: 'var(--bg-color, #ffffff)'
    }}>
      {/* Brand Watermark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-color, #111827)' }}>
          P.B.I. Labs
        </span>
      </div>

      {/* Controls & Adaptive Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ThemeToggle />
        
        {/* Swaps menus seamlessly depending on activation state */}
        {isAuthenticated ? (
          <DashboardMenu onNavigate={onNavigate} onLogout={onLogout} />
        ) : (
          <PublicMenu onNavigate={onNavigate} />
        )}
      </div>
    </header>
  );
}