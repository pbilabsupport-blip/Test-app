import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import ActivationScreen from './features/auth/ActivationScreen';
import CashFlowEngine from './features/tools/CashFlowEngine/CashFlowEngine';
import AdaptiveHeader from './components/layout/AdaptiveHeader';

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
        return (
          <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>{isEs ? 'Acerca de P.B.I. Labs' : 'About P.B.I. Labs'}</h2>
            <p style={{ lineHeight: '1.6', color: 'var(--text-color)' }}>
              {isEs 
                ? 'P.B.I. Labs es un sistema operativo financiero seguro diseñado bajo la mentalidad de Rich Dad (Robert Kiyosaki) para transformar activos y controlar el flujo de caja hacia la libertad financiera.'
                : 'P.B.I. Labs is a secure financial operating system built under the Rich Dad (Robert Kiyosaki) mindset to transform assets and control cash flow toward financial freedom.'}
            </p>
          </div>
        );
      case 'privacy':
        return (
          <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>{isEs ? 'Política de Privacidad' : 'Privacy Policy'}</h2>
            <p style={{ lineHeight: '1.6', color: 'var(--text-color)' }}>
              {isEs 
                ? 'Sus datos se almacenan de forma segura en Supabase y se procesan localmente en su dispositivo mediante huella digital para proteger su licencia de Gumroad.'
                : 'Your data is securely stored in Supabase and processed locally on your device via digital fingerprinting to protect your Gumroad license.'}
            </p>
          </div>
        );
      case 'terms':
        return (
          <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>{isEs ? 'Términos de Servicio' : 'Terms of Service'}</h2>
            <p style={{ lineHeight: '1.6', color: 'var(--text-color)' }}>
              {isEs 
                ? 'Cada licencia de suscripción de Gumroad admite un máximo de 2 asientos de dispositivos activos con verificación por latido del servidor.'
                : 'Each Gumroad subscription license supports a maximum of 2 active device seats with server-side heartbeat verification.'}
            </p>
          </div>
        );
      case 'contact':
        return (
          <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>{isEs ? 'Contáctenos' : 'Contact Us'}</h2>
            <p style={{ lineHeight: '1.6', color: 'var(--text-color)' }}>
              {isEs 
                ? 'Para asistencia de licencias, utilice la función de recuperación por OTP en la pantalla de activación.'
                : 'For licensing support, use the OTP recovery feature on the activation screen.'}
            </p>
          </div>
        );
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
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}