import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { supabase } from '../../../services/supabase';
import { Dashboard } from './components/Dashboard';
import { Statement } from './components/Statement';
import { ActionCenter } from './components/ActionCenter';
import { VisionBoard } from './components/VisionBoard';
import { LifeList } from './components/LifeList';
import { CommandModal } from './components/CommandModal';
import AdSlot from '../../../components/ads/AdSlot';
import usePaymentReminders from '../../../hooks/usePaymentReminders';
import { useReminderPrefsState } from '../../../components/reminders/ReminderSettings';

export function CashFlowEngine() {
  const { authSession, language } = useAppContext();
  const isEs = language === 'es';
  const isPro = authSession?.tier === 'pro';

  // Local storage namespace fallback
  const storageKey = `pbi_vault_data_${authSession?.email || 'default'}`;

  // Navigation tabs: 'dashboard' | 'statement' | 'actions' | 'vision' | 'lifelist'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Financial States initialized with Local Storage for instant startup
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

  // Phase 2: Vision Board & 100-Item Life List States
  const [visionCards, setVisionCards] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_vision_cards`);
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        title: 'First Rental Property / Primera Propiedad',
        targetAmount: 25000,
        currentAmount: 4500,
        targetDate: '12-31-2027',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [lifeList, setLifeList] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_life_list`);
    const currentYear = new Date().getFullYear();
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        text: 'Achieve 100% Financial Freedom / Libertad Financiera',
        category: 'Financial',
        year: currentYear,
        isCompleted: false,
        completedDate: '',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [reminderPrefs, setReminderPrefs] = useReminderPrefsState();
  usePaymentReminders(liabilities, reminderPrefs);

  // 1. CLOUD HYDRATION: Pull safe cloud records from Supabase on start
  useEffect(() => {
    let isMounted = true;
    const hydrateFromSupabase = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_vault')
          .select('incomes, expenses, assets, liabilities, vision_board, life_list')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('Cloud vault read warning:', error.message);
          return;
        }

        if (data && isMounted) {
          if (Array.isArray(data.incomes)) setIncomes(data.incomes);
          if (Array.isArray(data.expenses)) setExpenses(data.expenses);
          if (Array.isArray(data.assets)) setAssets(data.assets);
          if (Array.isArray(data.liabilities)) setLiabilities(data.liabilities);
          if (Array.isArray(data.vision_board)) setVisionCards(data.vision_board);
          if (Array.isArray(data.life_list)) setLifeList(data.life_list);
          setIsCloudSynced(true);
        } else if (!data && user) {
          await supabase.from('user_vault').insert([{
            user_id: user.id,
            incomes,
            expenses,
            assets,
            liabilities,
            vision_board: visionCards,
            life_list: lifeList,
            updated_at: new Date().toISOString()
          }]);
          if (isMounted) setIsCloudSynced(true);
        }
      } catch (err) {
        console.warn('Cloud sync unavailable, running local mode:', err);
      }
    };

    hydrateFromSupabase();
    return () => { isMounted = false; };
  }, [authSession?.email]);

  // 2. CLOUD & LOCAL SYNC: Save on every state update (debounced by 800ms)
  const isFirstRender = useRef(true);
  useEffect(() => {
    localStorage.setItem(`${storageKey}_incomes`, JSON.stringify(incomes));
    localStorage.setItem(`${storageKey}_expenses`, JSON.stringify(expenses));
    localStorage.setItem(`${storageKey}_assets`, JSON.stringify(assets));
    localStorage.setItem(`${storageKey}_liabilities`, JSON.stringify(liabilities));
    localStorage.setItem(`${storageKey}_vision_cards`, JSON.stringify(visionCards));
    localStorage.setItem(`${storageKey}_life_list`, JSON.stringify(lifeList));

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('user_vault').upsert({
          user_id: user.id,
          incomes,
          expenses,
          assets,
          liabilities,
          vision_board: visionCards,
          life_list: lifeList,
          updated_at: new Date().toISOString()
        });
        setIsCloudSynced(true);
      } catch (err) {
        console.warn('Cloud backup pending:', err);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [incomes, expenses, assets, liabilities, visionCards, lifeList, storageKey]);

  // Calculations
  const totalIncome = incomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const cashFlow = totalIncome - totalExpense;

  const passiveIncome = incomes
    .filter(i => i.isPassive || i.category === 'Passive')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    
  const gaugeValue = totalExpense > 0 ? Math.min(Math.round((passiveIncome / totalExpense) * 100), 100) : 0;
  const gaugeColor = gaugeValue >= 100 ? '#10b981' : gaugeValue >= 50 ? '#f59e0b' : '#ef4444';

  const wasteExpenses = expenses
    .filter(e => e.isOneTime || e.category === 'Waste')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const wastePercentage = totalExpense > 0 ? Math.round((wasteExpenses / totalExpense) * 100) : 0;

  const handleDelete = (type, id) => {
    if (type === 'income') setIncomes(incomes.filter(i => i.id !== id));
    if (type === 'expense') setExpenses(expenses.filter(e => e.id !== id));
    if (type === 'asset') {
      setAssets(assets.filter(a => a.id !== id));
      setIncomes(incomes.filter(i => i.linkedAssetId !== id));
    }
    if (type === 'liability') {
      setLiabilities(liabilities.filter(l => l.id !== id));
      setExpenses(expenses.filter(e => e.linkedLiabilityId !== id));
    }
    showToast(isEs ? 'Registro eliminado correctamente' : 'Record deleted successfully');
  };

  const navButtonStyle = (tabName) => ({
    flex: '1 1 auto', // Allows buttons to grow and shrink smoothly
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    background: activeTab === tabName ? 'var(--primary-color)' : 'transparent',
    color: activeTab === tabName ? '#000' : 'var(--text-color)',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto', position: 'relative', padding: '20px' }}>
      
      {/* Vault Session Indicator Banner */}
      <div style={{ background: 'var(--card-bg)', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
            {isEs ? '🛡️ Bóveda Financiera' : '🛡️ Financial Vault'}
          </span>
          {isCloudSynced && (
            <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
              {isEs ? '☁️ Respaldo en Nube Activo' : '☁️ Cloud Safe'}
            </span>
          )}
        </div>
        <span style={{ color: 'var(--text-muted)' }}>
          {isEs ? `Sesión: ${authSession?.email} · ${isPro ? 'Pro' : 'Gratis'}` : `Session: ${authSession?.email} · ${isPro ? 'Pro' : 'Free'}`}
        </span>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'var(--primary-color)', color: '#000', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s' }}>
          {toastMessage}
        </div>
      )}

      {/* Only show AdSense banner if the user is on the Free Tier */}
      {!isPro && (
        <AdSlot slot={process.env.REACT_APP_ADSENSE_SLOT_BANNER} />
      )}

      {/* UPGRADED NAVIGATION BAR: Flex Wrap prevents mobile scrolling & hiding */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: 'var(--card-bg)', padding: '8px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <button onClick={() => setActiveTab('dashboard')} style={navButtonStyle('dashboard')}>
          {isEs ? '📊 Panel' : '📊 Dashboard'}
        </button>
        <button onClick={() => setActiveTab('statement')} style={navButtonStyle('statement')}>
          {isEs ? '📑 Estado' : '📑 Statement'}
        </button>
        <button onClick={() => setActiveTab('actions')} style={navButtonStyle('actions')}>
          {isEs ? '⚡ Acción' : '⚡ Action'}
        </button>
        <button onClick={() => setActiveTab('vision')} style={navButtonStyle('vision')}>
          {isEs ? '🌟 Visión' : '🌟 Vision'}
        </button>
        <button onClick={() => setActiveTab('lifelist')} style={navButtonStyle('lifelist')}>
          {isEs ? '📜 100 Sueños' : '📜 100 Dreams'}
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
          incomes={incomes}
          setIncomes={setIncomes}
          showToast={showToast}
          reminderPrefs={reminderPrefs}
          setReminderPrefs={setReminderPrefs}
        />
      )}

      {activeTab === 'vision' && (
        <VisionBoard 
          visionCards={visionCards}
          setVisionCards={setVisionCards}
          cashFlow={cashFlow}
          showToast={showToast}
        />
      )}

      {activeTab === 'lifelist' && (
        <LifeList 
          lifeList={lifeList}
          setLifeList={setLifeList}
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