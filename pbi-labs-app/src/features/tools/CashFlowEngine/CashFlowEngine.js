import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { FaChartLine, FaEdit, FaCheckCircle } from 'react-icons/fa';
import { syncDataToCloud } from '../../auth/SessionManager';

// Importing our newly structured components
import { Dashboard } from './components/Dashboard';
import { Statement } from './components/Statement';
import { ActionCenter } from './components/ActionCenter';
import { CommandModal } from './components/CommandModal';

export const CashFlowEngine = ({ licenseKey, initialData, onDataChange }) => {
  const { language } = useAppContext();
  
  // THE MASTER MEMORY
  const [incomes, setIncomes] = useState(initialData?.incomes || []);
  const [expenses, setExpenses] = useState(initialData?.expenses || []);
  const [assets, setAssets] = useState(initialData?.assets || []);
  const [liabilities, setLiabilities] = useState(initialData?.liabilities || []);
  
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [richDadToast, setRichDadToast] = useState('');

  // Auto-Save Pipeline
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    const currentData = { incomes, expenses, assets, liabilities };
    const timer = setTimeout(() => {
      syncDataToCloud(licenseKey, currentData);
      if (onDataChange) onDataChange(currentData);
    }, 1500);
    return () => clearTimeout(timer);
  }, [incomes, expenses, assets, liabilities, licenseKey, onDataChange]);

  const showToast = (msg) => { setRichDadToast(msg); setTimeout(() => setRichDadToast(''), 4500); };

  // Core Calculations (Calculated once here, sent down to components)
  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
  const passiveIncome = incomes.filter(i => i.isPassive).reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const cashFlow = totalIncome - totalExpenses;
  
  const totalOneTimeWaste = liabilities.filter(l => l.isOneTime).reduce((sum, item) => sum + Number(item.amount), 0);
  const wastePercentage = totalIncome > 0 ? ((totalOneTimeWaste / totalIncome) * 100).toFixed(1) : 0;
  
  const freedomRatio = totalExpenses > 0 ? (passiveIncome / totalExpenses) * 100 : (passiveIncome > 0 ? 100 : 0);
  const gaugeValue = Math.min(freedomRatio, 100).toFixed(1);
  const gaugeColor = freedomRatio >= 100 ? 'var(--success-color)' : (freedomRatio > 50 ? 'var(--primary-color)' : 'var(--danger-color)');

  const handleDelete = (type, id) => {
    if (type === 'income') setIncomes(incomes.filter(i => i.id !== id));
    if (type === 'expense') setExpenses(expenses.filter(i => i.id !== id));
    if (type === 'asset') {
      setAssets(assets.filter(a => a.id !== id));
      setIncomes(incomes.filter(i => i.linkedAssetId !== id)); 
    }
    if (type === 'liability') {
      setLiabilities(liabilities.filter(l => l.id !== id));
      setExpenses(expenses.filter(e => e.linkedLiabilityId !== id)); 
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
      
      {richDadToast && <div style={{ background: 'var(--success-color)', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center', animation: 'fadeIn 0.3s' }}>{richDadToast}</div>}

      {/* RENDER THE EXTRACTED COMPONENTS */}
      {activeTab === 'dashboard' && (
        <Dashboard incomes={incomes} expenses={expenses} assets={assets} liabilities={liabilities} cashFlow={cashFlow} gaugeValue={gaugeValue} gaugeColor={gaugeColor} wastePercentage={wastePercentage} />
      )}
      
      {activeTab === 'statement' && (
        <Statement incomes={incomes} expenses={expenses} assets={assets} liabilities={liabilities} handleDelete={handleDelete} setIsModalOpen={setIsModalOpen} />
      )}
      
      {activeTab === 'action' && (
        <ActionCenter assets={assets} setAssets={setAssets} liabilities={liabilities} setLiabilities={setLiabilities} expenses={expenses} setExpenses={setExpenses} showToast={showToast} />
      )}
      
      {/* Mobile Navigation Footer */}
      <div className="mobile-nav-footer">
        <div onClick={() => setActiveTab('dashboard')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: activeTab === 'dashboard' ? 'var(--primary-color)' : 'var(--text-muted)', transition: '0.2s' }}>
          <FaChartLine size={24} />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '5px' }}>{language === 'es' ? 'Tablero' : 'Dashboard'}</span>
        </div>
        <div onClick={() => setActiveTab('statement')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: activeTab === 'statement' ? 'var(--primary-color)' : 'var(--text-muted)', transition: '0.2s' }}>
          <FaEdit size={24} />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '5px' }}>{language === 'es' ? 'Estado' : 'Statement'}</span>
        </div>
        <div onClick={() => setActiveTab('action')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', color: activeTab === 'action' ? 'var(--primary-color)' : 'var(--text-muted)', transition: '0.2s' }}>
          <FaCheckCircle size={24} />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '5px' }}>{language === 'es' ? 'Acción' : 'Action'}</span>
        </div>
      </div>

      {isModalOpen && (
        <CommandModal 
          onClose={() => setIsModalOpen(false)} 
          setIncomes={setIncomes} incomes={incomes}
          setExpenses={setExpenses} expenses={expenses}
          setAssets={setAssets} assets={assets}
          setLiabilities={setLiabilities} liabilities={liabilities}
          showToast={showToast}
        />
      )}
    </div>
  );
};