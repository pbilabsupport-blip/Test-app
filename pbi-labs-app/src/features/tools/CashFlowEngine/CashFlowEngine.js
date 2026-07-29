import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { Dashboard } from './components/Dashboard';
import { Statement } from './components/Statement';
import { ActionCenter } from './components/ActionCenter';
import { CommandModal } from './components/CommandModal';

export function CashFlowEngine() {
  const { authSession, language } = useAppContext();
  const isEs = language === 'es';

  // Create a unique storage namespace for this specific user/license key to prevent cross-contamination
  const storageKey = `pbi_vault_data_${authSession?.key || authSession?.email || 'default'}`;

  // Navigation tabs: 'dashboard', 'statement', 'actions'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };
  
  // Financial State with User-Isolated LocalStorage Persistence
  const [incomes, setIncomes] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_incomes`);
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Salary / Salario', category: 'Active', amount: 3000 },
      { id: 2, name: 'Dividends / Dividendos', category: 'Passive', amount: 250, isPassive: true }
    ];
  });
  
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_expenses`);
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Housing / Vivienda', category: 'Necessity', amount: 1200 },
      { id: 2, name: 'Groceries / Comida', category: 'Necessity', amount: 600 },
      { id: 3, name: 'Entertainment / Entretenimiento', category: 'Waste', amount: 200, isOneTime: true }
    ];
  });

  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_assets`);
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Real Estate / Bienes Raíces', amount: 50000, yieldAmount: 250, frequency: 'monthly', nextDate: '2026-08-01' }
    ];
  });

  const [liabilities, setLiabilities] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_liabilities`);
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Car Loan / Préstamo de Auto', amount: 8000, requiresPayments: true, paymentAmount: 350, frequency: 'monthly', nextDate: '2026-08-15' }
    ];
  });

  // Synchronize states to user-namespaced storage on every update
  useEffect(() => {
    localStorage.setItem(`${storageKey}_incomes`, JSON.stringify(incomes));
    localStorage.setItem(`${storageKey}_expenses`, JSON.stringify(expenses));
    localStorage.setItem(`${storageKey}_assets`, JSON.stringify(assets));
    localStorage.setItem(`${storageKey}_liabilities`, JSON.stringify(liabilities));
  }, [incomes, expenses, assets, liabilities, storageKey]);

  // Calculations
  const totalIncome = incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const cashFlow = totalIncome - totalExpense;

  const passiveIncome = incomes.filter(i => i.isPassive || i.category === 'Passive').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const gaugeValue = totalExpense > 0 ? Math.min(Math.round((passiveIncome / totalExpense) * 100), 100) : 0;
  const gaugeColor = gaugeValue >= 100 ? '#10b981' : gaugeValue >= 50 ? '#f59e0b' : '#ef4444';

  const wasteExpenses = expenses.filter(e => e.isOneTime || e.category === 'Waste').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const wastePercentage = totalExpense > 0 ? Math.round((wasteExpenses / totalExpense) * 100) : 0;

  const handleDelete = (type, id) => {
    if (type === 'income') setIncomes(incomes.filter(i => i.id !== id));
    if (type === 'expense') setExpenses(expenses.filter(e => e.id !== id));
    if (type === 'asset') setAssets(assets.filter(a => a.id !== id));
    if (type === 'liability') setLiabilities(liabilities.filter(l => l.id !== id));
    showToast(isEs ? 'Registro eliminado correctamente' : 'Record deleted successfully');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto', position: 'relative', padding: '20px' }}>
      
      {/* Vault Session Indicator Banner */}
      <div style={{ background: 'var(--card-bg)', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
          {isEs ? '🛡️ Bóveda Financiera Segura' : '🛡️ Secure Financial Vault'}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          {isEs ? `Sesión: ${authSession?.email} | Licencia: ${authSession?.key}` : `Session: ${authSession?.email} | License: ${authSession?.key}`}
        </span>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'var(--primary-color)', color: '#000', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s' }}>
          {toastMessage}
        </div>
      )}

      {/* Sub-Navigation Bar for Tools */}
      <div style={{ display: 'flex', gap: '10px', background: 'var(--card-bg)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'dashboard' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'dashboard' ? '#000' : 'var(--text-color)', fontWeight: 'bold', cursor: 'pointer' }}>
          {isEs ? 'Panel Principal' : 'Dashboard'}
        </button>
        <button 
          onClick={() => setActiveTab('statement')} 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'statement' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'statement' ? '#000' : 'var(--text-color)', fontWeight: 'bold', cursor: 'pointer' }}>
          {isEs ? 'Estado Financiero' : 'Statement'}
        </button>
        <button 
          onClick={() => setActiveTab('actions')} 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'actions' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'actions' ? '#000' : 'var(--text-color)', fontWeight: 'bold', cursor: 'pointer' }}>
          {isEs ? 'Centro de Acción' : 'Action Center'}
        </button>
      </div>

      {/* Active Tab View Rendering */}
      {activeTab === 'dashboard' && (
        <Dashboard 
          incomes={incomes}
          expenses={expenses}
          assets={assets}
          liabilities={liabilities}
          cashFlow={cashFlow}
          gaugeValue={gaugeValue}
          gaugeColor={gaugeColor}
          wastePercentage={wastePercentage}
        />
      )}

      {activeTab === 'statement' && (
        <Statement 
          incomes={incomes}
          expenses={expenses}
          assets={assets}
          liabilities={liabilities}
          handleDelete={handleDelete}
          setIsModalOpen={setIsModalOpen}
        />
      )}

      {activeTab === 'actions' && (
        <ActionCenter 
          assets={assets}
          setAssets={setAssets}
          liabilities={liabilities}
          setLiabilities={setLiabilities}
          expenses={expenses}
          setExpenses={setExpenses}
          showToast={showToast}
        />
      )}

      {/* Command Modal for Adding Entries */}
      {isModalOpen && (
        <CommandModal 
          onClose={() => setIsModalOpen(false)}
          incomes={incomes}
          setIncomes={setIncomes}
          expenses={expenses}
          setExpenses={setExpenses}
          assets={assets}
          setAssets={setAssets}
          liabilities={liabilities}
          setLiabilities={setLiabilities}
          showToast={showToast}
        />
      )}
    </div>
  );
}

export default CashFlowEngine;