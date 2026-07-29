// File: src/components/layout/AdaptiveHeader.js
import React from 'react';
import ThemeToggle from '../ThemeToggle';
import PublicMenu from './PublicMenu';
import DashboardMenu from './DashboardMenu';

export default function AdaptiveHeader({ isAuthenticated, onNavigate }) {
  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Brand Watermark */}
      <div className="flex items-center space-x-2">
        <span className="font-bold text-lg text-gray-800 dark:text-white tracking-wide">
          P.B.I. Labs
        </span>
      </div>

      {/* Controls & Adaptive Menu */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        
        {/* Swaps menus based on whether the user has passed activation */}
        {isAuthenticated ? (
          <DashboardMenu onNavigate={onNavigate} />
        ) : (
          <PublicMenu onNavigate={onNavigate} />
        )}
      </div>
    </header>
  );
}