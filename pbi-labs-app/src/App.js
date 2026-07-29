import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from './context/AppContext';
import { ActivationScreen } from './features/auth/ActivationScreen';
import { CashFlowEngine } from './features/tools/CashFlowEngine/CashFlowEngine';
import AdaptiveHeader from './components/layout/AdaptiveHeader';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { startSessionHeartbeat, resumeSession } from './features/auth/SessionManager';
import { releaseDeviceSeat } from './services/supabase';
import { FaExclamationTriangle, FaTimes, FaSpinner } from 'react-icons/fa';
import './global.css';

export default function App() {
  const { language, theme } = useAppContext(); 

  // Persistent Memory State
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [financialData, setFinancialData] = useState(null);
  const [killSignalMessage, setKillSignalMessage] = useState('');
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    document.body.className = `${theme}-theme`;
  }, [theme]);

  // PROACTIVE SCANNER (Wrapped in useCallback to naturally pass compilation checks)
  const runAssistantScan = useCallback((data) => {
    if (!data) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const alerts = [];

    const checkDates = (items, typeName) => {
      (items || []).forEach(item => {
        if (item.nextDate) {
          const [year, month, day] = item.nextDate.split('-');
          const targetDate = new Date(year, month - 1, day);
          
          const diffTime = targetDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays <= 3) {
            alerts.push({
              id: item.id,
              message: language === 'es' 
                ? `Atención: ${item.name} (${typeName}) programado para los próximos ${diffDays} días.` 
                : `Attention: ${item.name} (${typeName}) scheduled within the next ${diffDays} days.`,
              type: typeName === 'Payment' ? 'danger' : 'success'
            });
          }
        }
      });
    };

    checkDates(data.liabilities, 'Payment');
    checkDates(data.assets, 'Payday');
    setActiveAlerts(alerts);
  }, [language]);

  // THE SILENT AUTO-LOGIN ENGINE
  useEffect(() => {
    const initializePersistentSession = async () => {
      const result = await resumeSession();
      if (result.success) {
        setLicenseKey(result.licenseKey);
        setDeviceId(result.deviceId);
        setFinancialData(result.financialData);
        setIsAuthenticated(true);
        runAssistantScan(result.financialData);
      }
      setIsInitializing(false); // Drop the loading screen once verified
    };
    initializePersistentSession();
  }, [runAssistantScan]);

  const handleLoginSuccess = (key, devId, data) => {
    localStorage.setItem('pbi_license_key', key); // Write to persistent memory
    setLicenseKey(key);
    setDeviceId(devId);
    setFinancialData(data);
    setIsAuthenticated(true);
    runAssistantScan(data);
  };

  const handleLogout = async (message) => {
    if (licenseKey && deviceId) await releaseDeviceSeat(licenseKey, deviceId);
    localStorage.removeItem('pbi_license_key'); // Wipe from persistent memory
    setIsAuthenticated(false);
    setLicenseKey('');
    setDeviceId('');
    setFinancialData(null);
    window.location.reload();
  };

  useEffect(() => {
    let cleanupHeartbeat;
    if (isAuthenticated && licenseKey && deviceId) {
      cleanupHeartbeat = startSessionHeartbeat(licenseKey, deviceId, (reason) => {
        setKillSignalMessage(reason); 
        handleLogout(reason);
      });
    }
    return () => { if (cleanupHeartbeat) cleanupHeartbeat(); };
  }, [isAuthenticated, licenseKey, deviceId]);

  const dismissAlert = (id) => {
    setActiveAlerts(activeAlerts.filter(a => a.id !== id));
  };

  // The Loading Vault Door (Prevents login screen flash)
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-color)', color: 'var(--primary-color)' }}>
        <FaSpinner className="spin-animation" size={50} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      
      {/* Adaptive Header sits on all screens (Shows PublicMenu before activation, DashboardMenu after) */}
      <AdaptiveHeader isAuthenticated={isAuthenticated} onLogout={() => handleLogout()} />

      {!isAuthenticated ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          {killSignalMessage && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ff4444', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}>
                  {killSignalMessage}
              </div>
          )}
          <ActivationScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <>
          <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '10px 20px', boxSizing: 'border-box' }}>
            {activeAlerts.map(alert => (
              <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: alert.type === 'danger' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 230, 118, 0.1)', borderLeft: `4px solid ${alert.type === 'danger' ? '#ff4444' : '#00e676'}`, color: 'var(--text-color)', padding: '12px 20px', borderRadius: '6px', marginBottom: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  <FaExclamationTriangle color={alert.type === 'danger' ? '#ff4444' : '#00e676'} /> {alert.message}
                </span>
                <button onClick={() => dismissAlert(alert.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><FaTimes /></button>
              </div>
            ))}
          </div>

          <main style={{ flex: 1, padding: '10px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <CashFlowEngine licenseKey={licenseKey} initialData={financialData} onDataChange={runAssistantScan} />
          </main>
        </>
      )}
      <PwaInstallPrompt />
    </div>
  );
}