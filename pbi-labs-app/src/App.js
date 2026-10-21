import React, { useState } from 'react';
import { useAppContext } from './context/AppContext';
import ActivationScreen from './features/auth/ActivationScreen';
import CashFlowEngine from './features/tools/CashFlowEngine/CashFlowEngine';
import AdaptiveHeader from './components/layout/AdaptiveHeader';
import AboutUs from './components/legal/AboutUs';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import ContactUs from './components/legal/ContactUs';

function MainRouter() {
  const { authSession, loading, language } = useAppContext();
  const [currentView, setCurrentView] = useState('dashboard');
  const isEs = language === 'es';

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <h2>{isEs ? 'Cargando Bóveda de P.B.I. Labs...' : 'Loading P.B.I. Labs Vault...'}</h2>
      </div>
    );
  }

  if (!authSession || !authSession.success) {
    return <ActivationScreen />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'about':
        return <AboutUs />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      case 'contact':
        return <ContactUs />;
      case 'dashboard':
      default:
        return <CashFlowEngine />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <AdaptiveHeader setCurrentView={setCurrentView} />
      <main style={{ flex: 1, padding: '20px' }}>
        {renderView()}
      </main>
      <footer style={{ textAlign: 'center', padding: '15px', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
        powered by P.B.I. Labs
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MainRouter />
  );
}
