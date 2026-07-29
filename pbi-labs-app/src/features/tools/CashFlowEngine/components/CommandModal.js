import React, { useState } from 'react';
import { useAppContext } from '../../../../context/AppContext';

export const CommandModal = ({ onClose, setIncomes, incomes, setExpenses, expenses, setAssets, assets, setLiabilities, liabilities, showToast }) => {
  const { language } = useAppContext();
  const isEs = language === 'es';
  const [entryType, setEntryType] = useState('income');
  const [form, setForm] = useState({ name: '', amount: '', category: 'General', putsMoney: null, yieldAmount: '', frequency: 'monthly', nextDate: '', requiresPayments: null, isOneTime: false });

  const handleAddItem = () => {
    if (!form.name || !form.amount) return;
    const baseId = Date.now();
    const itemValue = Number(form.amount);

    if (entryType === 'income') setIncomes([...incomes, { id: baseId, name: form.name, amount: itemValue, category: form.category }]);
    else if (entryType === 'expense') setExpenses([...expenses, { id: baseId, name: form.name, amount: itemValue, category: form.category }]);
    else if (entryType === 'asset') {
      if (form.putsMoney === true) {
        setAssets([...assets, { id: baseId, name: form.name, amount: itemValue, yieldAmount: Number(form.yieldAmount), frequency: form.frequency, nextDate: form.nextDate }]);
        setIncomes([...incomes, { id: baseId + 1, name: `${form.name} (Yield)`, amount: Number(form.yieldAmount), category: 'Passive', isPassive: true, linkedAssetId: baseId }]);
      } else {
        showToast(isEs ? 'Regla de Padre Rico: Los activos que no pagan son Pasivos. Movido automáticamente.' : 'Rich Dad Rule: Assets that do not pay you are Liabilities. Moved automatically.');
        setLiabilities([...liabilities, { id: baseId, name: form.name, amount: itemValue, requiresPayments: false, isOneTime: false }]);
      }
    }
    else if (entryType === 'liability') {
      if (form.requiresPayments === true) {
        setLiabilities([...liabilities, { id: baseId, name: form.name, amount: itemValue, requiresPayments: true, paymentAmount: Number(form.yieldAmount), frequency: form.frequency, nextDate: form.nextDate }]);
        setExpenses([...expenses, { id: baseId + 1, name: `${form.name} (Payment)`, amount: Number(form.yieldAmount), category: 'Debt', linkedLiabilityId: baseId }]);
      } else {
        setLiabilities([...liabilities, { id: baseId, name: form.name, amount: itemValue, requiresPayments: false, isOneTime: form.isOneTime }]);
      }
    }
    onClose();
  };

  const inputStyle = { width: '100%', padding: '12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', marginBottom: '15px', fontSize: '1rem', outline: 'none' };
  const toggleBtnStyle = (active, color) => ({ flex: 1, padding: '10px', border: `1px solid ${color}`, background: active ? color : 'transparent', color: active ? '#fff' : color, borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '450px', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        
        <h2 style={{ marginTop: 0, color: 'var(--primary-color)', marginBottom: '20px' }}>{isEs ? 'Centro de Comando' : 'Command Center'}</h2>
        
        <select value={entryType} onChange={(e) => { setEntryType(e.target.value); setForm({...form, putsMoney: null, requiresPayments: null, isOneTime: false}); }} style={inputStyle}>
          <option value="income">{isEs ? 'Ingreso (Income)' : 'Income'}</option>
          <option value="expense">{isEs ? 'Gasto (Expense)' : 'Expense'}</option>
          <option value="asset">{isEs ? 'Activo (Asset)' : 'Asset'}</option>
          <option value="liability">{isEs ? 'Pasivo (Liability)' : 'Liability'}</option>
        </select>

        <input type="text" placeholder={isEs ? 'Nombre del registro' : 'Name of entry'} value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} style={inputStyle} />
        <input type="number" placeholder={isEs ? 'Valor Total ($)' : 'Total Value ($)'} value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} style={inputStyle} />

        {entryType === 'asset' && (
          <div style={{ padding: '15px', background: 'var(--bg-color)', borderRadius: '8px', marginBottom: '15px', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '0.9rem' }}>{isEs ? '¿Pone dinero en su bolsillo?' : 'Does it put money in your pocket?'}</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button style={toggleBtnStyle(form.putsMoney === true, 'var(--success-color)')} onClick={() => setForm({...form, putsMoney: true})}>{isEs ? 'Sí' : 'Yes'}</button>
              <button style={toggleBtnStyle(form.putsMoney === false, 'var(--danger-color)')} onClick={() => setForm({...form, putsMoney: false})}>No</button>
            </div>
            {form.putsMoney === true && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                  <input type="number" placeholder={isEs ? 'Rendimiento en Día de Pago ($)' : 'Yield on Payday ($)'} value={form.yieldAmount} onChange={(e) => setForm({...form, yieldAmount: e.target.value})} style={inputStyle} />
                  <select value={form.frequency} onChange={(e) => setForm({...form, frequency: e.target.value})} style={inputStyle}>
                    <option value="monthly">{isEs ? 'Mensual' : 'Monthly'}</option>
                    <option value="weekly">{isEs ? 'Semanal' : 'Weekly'}</option>
                  </select>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{isEs ? 'Próximo Día de Pago:' : 'Next Payday:'}</p>
                  <input type="date" value={form.nextDate} onChange={(e) => setForm({...form, nextDate: e.target.value})} style={inputStyle} />
              </div>
            )}
          </div>
        )}

        {entryType === 'liability' && (
          <div style={{ padding: '15px', background: 'var(--bg-color)', borderRadius: '8px', marginBottom: '15px', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '0.9rem' }}>{isEs ? '¿Requiere pagos recurrentes?' : 'Does this require payments?'}</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button style={toggleBtnStyle(form.requiresPayments === true, 'var(--danger-color)')} onClick={() => setForm({...form, requiresPayments: true, isOneTime: false})}>{isEs ? 'Sí' : 'Yes'}</button>
              <button style={toggleBtnStyle(form.requiresPayments === false, 'var(--success-color)')} onClick={() => setForm({...form, requiresPayments: false})}>No</button>
            </div>
            {form.requiresPayments === true && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                  <input type="number" placeholder={isEs ? 'Costo del Pago ($)' : 'Payment Cost ($)'} value={form.yieldAmount} onChange={(e) => setForm({...form, yieldAmount: e.target.value})} style={inputStyle} />
                  <select value={form.frequency} onChange={(e) => setForm({...form, frequency: e.target.value})} style={inputStyle}>
                    <option value="monthly">{isEs ? 'Mensual' : 'Monthly'}</option>
                    <option value="weekly">{isEs ? 'Semanal' : 'Weekly'}</option>
                  </select>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{isEs ? 'Próxima Fecha de Pago:' : 'Next Payment Date:'}</p>
                  <input type="date" value={form.nextDate} onChange={(e) => setForm({...form, nextDate: e.target.value})} style={inputStyle} />
              </div>
            )}
            {form.requiresPayments === false && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', border: '1px solid var(--warning-color)', borderRadius: '8px', animation: 'fadeIn 0.3s' }}>
                <input type="checkbox" checked={form.isOneTime} onChange={(e) => setForm({...form, isOneTime: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-color)' }}>{isEs ? 'Compra Única (Sube % Desperdicio)' : '1-Time Purchase (Adds to Waste %)'}</span>
              </label>
            )}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={handleAddItem} style={{ flex: 1, padding: '14px', backgroundColor: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>{isEs ? 'Ejecutar' : 'Execute'}</button>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>{isEs ? 'Cancelar' : 'Cancel'}</button>
        </div>

      </div>
    </div>
  );
};