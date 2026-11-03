import React, { useState } from 'react';
import { useAppContext } from '../../../../context/AppContext';
import { FiX, FiCheck } from 'react-icons/fi';

function getTodayMMDDYYYY() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export function CommandModal({
  onClose,
  incomes = [],
  setIncomes,
  expenses = [],
  setExpenses,
  assets = [],
  setAssets,
  liabilities = [],
  setLiabilities,
  showToast
}) {
  const { language } = useAppContext();
  const isEs = language === 'es';

  // Entry Type: 'income' | 'expense' | 'asset' | 'liability'
  const [entryType, setEntryType] = useState('income');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  // Income Specific
  const [isPassive, setIsPassive] = useState(false);

  // Expense Specific
  const [expenseCategory, setExpenseCategory] = useState('Necessity');

  // Asset Specific
  const [yieldAmount, setYieldAmount] = useState('');

  // Liability Specific
  const [paymentAmount, setPaymentAmount] = useState('');
  const [nextDate, setNextDate] = useState(getTodayMMDDYYYY());
  const [frequency, setFrequency] = useState('monthly');
  const [isPersonalLoan, setIsPersonalLoan] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    const numAmount = Number(amount) || 0;
    const newId = Date.now();

    if (entryType === 'income') {
      const newIncome = {
        id: newId,
        name: name.trim(),
        amount: numAmount,
        category: isPassive ? 'Passive' : 'Active',
        isPassive: isPassive
      };
      setIncomes([newIncome, ...incomes]);
    } else if (entryType === 'expense') {
      const newExpense = {
        id: newId,
        name: name.trim(),
        amount: numAmount,
        category: expenseCategory,
        isOneTime: expenseCategory === 'Waste'
      };
      setExpenses([newExpense, ...expenses]);
    } else if (entryType === 'asset') {
      const newAsset = {
        id: newId,
        name: name.trim(),
        amount: numAmount,
        yieldAmount: Number(yieldAmount) || 0,
        frequency: 'monthly',
        nextDate: getTodayMMDDYYYY()
      };
      setAssets([newAsset, ...assets]);
      // If it generates passive income, link it to the income statement automatically!
      if (Number(yieldAmount) > 0) {
        const linkedIncome = {
          id: Date.now() + 1,
          name: `${name.trim()} (Yield)`,
          amount: Number(yieldAmount),
          category: 'Passive',
          isPassive: true,
          linkedAssetId: newId
        };
        setIncomes([linkedIncome, ...incomes]);
      }
    } else if (entryType === 'liability') {
      const newLiability = {
        id: newId,
        name: name.trim(),
        amount: numAmount,
        paymentAmount: Number(paymentAmount) || 0,
        requiresPayments: Number(paymentAmount) > 0,
        nextDate: nextDate.trim() || getTodayMMDDYYYY(),
        frequency: frequency,
        category: isPersonalLoan ? 'Personal' : 'General',
        isPersonalLoan: isPersonalLoan
      };
      setLiabilities([newLiability, ...liabilities]);
      // If it requires a monthly payment, record in recurring expenses automatically!
      if (Number(paymentAmount) > 0) {
        const linkedExpense = {
          id: Date.now() + 1,
          name: `${name.trim()} (Payment)`,
          amount: Number(paymentAmount),
          category: 'Necessity',
          linkedLiabilityId: newId
        };
        setExpenses([linkedExpense, ...expenses]);
      }
    }

    if (showToast) {
      showToast(isEs ? '✅ Registro guardado exitosamente.' : '✅ Entry saved successfully.');
    }
    onClose();
  };

  const tabStyle = (type, color) => ({
    flex: 1,
    padding: '12px 8px',
    borderRadius: '8px',
    border: entryType === type ? `2px solid ${color}` : '1px solid var(--border-color)',
    background: entryType === type ? `${color}20` : 'var(--bg-color)',
    color: entryType === type ? color : 'var(--text-color)',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
      <div style={{ background: 'var(--card-bg)', padding: '28px', borderRadius: '16px', maxWidth: '520px', width: '100%', border: '1px solid var(--border-color)', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.3rem' }}>
            {isEs ? 'Centro de Comando (Nuevo Registro)' : 'Command Center (New Entry)'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
            <FiX />
          </button>
        </div>

        {/* 4 Clean Category Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button type="button" onClick={() => setEntryType('income')} style={tabStyle('income', '#10b981')}>
            💰 {isEs ? 'Ingreso' : 'Income'}
          </button>
          <button type="button" onClick={() => setEntryType('expense')} style={tabStyle('expense', '#ef4444')}>
            💸 {isEs ? 'Gasto' : 'Expense'}
          </button>
          <button type="button" onClick={() => setEntryType('asset')} style={tabStyle('asset', 'var(--primary-color)')}>
            🏠 {isEs ? 'Activo' : 'Asset'}
          </button>
          <button type="button" onClick={() => setEntryType('liability')} style={tabStyle('liability', '#f59e0b')}>
            📄 {isEs ? 'Deuda' : 'Debt'}
          </button>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Concept Name */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              {isEs ? 'Nombre del Registro' : 'Entry Name'}
            </label>
            <input 
              type="text" 
              required
              placeholder={
                entryType === 'income' ? (isEs ? 'Ej: Salario / Dividendos' : 'e.g., Salary / Dividends') :
                entryType === 'expense' ? (isEs ? 'Ej: Supermercado / Electricidad' : 'e.g., Groceries / Electric Bill') :
                entryType === 'asset' ? (isEs ? 'Ej: Casa de Renta / Acciones' : 'e.g., Rental Duplex / Stock Portfolio') :
                (isEs ? 'Ej: Préstamo de Auto / Préstamo Familiar' : 'e.g., Car Loan / Family Handshake Loan')
              }
              value={name} 
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '1rem', outline: 'none' }} 
            />
          </div>

          {/* Amount */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              {entryType === 'income' ? (isEs ? 'Monto Mensual ($)' : 'Monthly Income ($)') :
               entryType === 'expense' ? (isEs ? 'Monto del Gasto ($)' : 'Expense Amount ($)') :
               entryType === 'asset' ? (isEs ? 'Valor Total del Activo ($)' : 'Total Asset Value ($)') :
               (isEs ? 'Saldo Total de la Deuda ($)' : 'Total Debt Balance ($)')}
            </label>
            <input 
              type="number" 
              required
              placeholder="0.00" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', outline: 'none' }} 
            />
          </div>

          {/* TYPE-SPECIFIC DETAILS */}
          
          {/* 1. INCOME: Passive vs Active Toggle */}
          {entryType === 'income' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {isEs ? '¿Es Ingreso Pasivo?' : 'Is this Passive Income?'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isEs ? 'Cuenta para su medidor de libertad financiera.' : 'Counts toward your freedom gauge.'}
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={isPassive} 
                onChange={e => setIsPassive(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }} 
              />
            </div>
          )}

          {/* 2. EXPENSE: Necessity vs Waste Toggle */}
          {entryType === 'expense' && (
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isEs ? 'Clasificación del Gasto' : 'Expense Category'}
              </label>
              <select 
                value={expenseCategory} 
                onChange={e => setExpenseCategory(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '0.95rem' }}>
                <option value="Necessity">{isEs ? 'Necesidad Vital (Vivienda, Comida, Salud)' : 'Essential Necessity (Housing, Food, Health)'}</option>
                <option value="Waste">{isEs ? 'Gasto Hormiga / Lujo (No Esencial)' : 'Waste / Non-Essential (Luxury, Entertainment)'}</option>
              </select>
            </div>
          )}

          {/* 3. ASSET: Monthly Yield (Passive Cash Flow) */}
          {entryType === 'asset' && (
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                {isEs ? 'Flujo de Caja Mensual que Produce ($ / mes - Opcional)' : 'Monthly Passive Yield ($ / mo - Optional)'}
              </label>
              <input 
                type="number" 
                placeholder={isEs ? 'Ej: 250 (si genera dividendos o renta)' : 'e.g. 250 (if yields rental/dividends)'} 
                value={yieldAmount} 
                onChange={e => setYieldAmount(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px' }} 
              />
            </div>
          )}

          {/* 4. LIABILITY: Monthly Payment & Due Date in MM-DD-YYYY */}
          {entryType === 'liability' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    {isEs ? 'Cuota Mensual ($)' : 'Monthly Payment ($)'}
                  </label>
                  <input 
                    type="number" 
                    placeholder="350.00" 
                    value={paymentAmount} 
                    onChange={e => setPaymentAmount(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    {isEs ? 'Frecuencia' : 'Frequency'}
                  </label>
                  <select 
                    value={frequency} 
                    onChange={e => setFrequency(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px' }}>
                    <option value="monthly">{isEs ? 'Mensual' : 'Monthly'}</option>
                    <option value="weekly">{isEs ? 'Semanal' : 'Weekly'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  {isEs ? 'Fecha del Próximo Pago (Formato MM-DD-YYYY)' : 'Next Due Date (MM-DD-YYYY Format)'}
                </label>
                <input 
                  type="text" 
                  placeholder="MM-DD-YYYY"
                  value={nextDate} 
                  onChange={e => setNextDate(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontWeight: 'bold' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem' }}>
                  🤝 {isEs ? '¿Es un préstamo personal o informal?' : 'Is this a personal handshake loan?'}
                </span>
                <input 
                  type="checkbox" 
                  checked={isPersonalLoan} 
                  onChange={e => setIsPersonalLoan(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                />
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              type="submit" 
              style={{ flex: 1, padding: '14px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FiCheck /> {isEs ? 'Guardar en mi Bóveda' : 'Save to Vault'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '14px 20px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
              {isEs ? 'Cancelar' : 'Cancel'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default CommandModal;