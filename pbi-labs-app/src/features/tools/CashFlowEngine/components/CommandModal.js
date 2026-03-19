import React, { useState } from 'react';
import { useAppContext } from '../../../../context/AppContext';

export const CommandModal = ({ onClose, setIncomes, incomes, setExpenses, expenses, setAssets, assets, setLiabilities, liabilities, showToast }) => {
  const { language } = useAppContext();
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
        showToast(language === 'es' ? 'Regla de Padre Rico: Los activos que no pagan son Pasivos. Movido automáticamente.' : 'Rich Dad Rule: Assets that do not pay you are Liabilities. Moved automatically.');
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

  return (
    <div className="modal-overlay">
      <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '450px', border: '1px solid var(--border-color)', maxHeight: '85vh', overflowY: 'auto' }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary-color)' }}>{language === 'es' ? 'Centro de Comando' : 'Command Center'}</h2>
        
        <select value={entryType} onChange={(e) => { setEntryType(e.target.value); setForm({...form, putsMoney: null, requiresPayments: null, isOneTime: false}); }} className="premium-input">
          <option value="income">{language === 'es' ? 'Ingreso (Income)' : 'Income'}</option>
          <option value="expense">{language === 'es' ? 'Gasto (Expense)' : 'Expense'}</option>
          <option value="asset">{language === 'es' ? 'Activo (Asset)' : 'Asset'}</option>
          <option value="liability">{language === 'es' ? 'Pasivo (Liability)' : 'Liability'}</option>
        </select>

        <input type="text" placeholder={language === 'es' ? 'Nombre del registro' : 'Name of entry'} value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="premium-input" />
        <input type="number" placeholder={language === 'es' ? 'Valor Total ($)' : 'Total Value ($)'} value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="premium-input" />

        {entryType === 'asset' && (
          <div style={{ padding: '15px', background: 'var(--toggle-bg)', borderRadius: '8px', marginBottom: '15px' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '0.9rem' }}>{language === 'es' ? '¿Pone dinero en su bolsillo?' : 'Does it put money in your pocket?'}</p>
            <div className="radio-group">
              <button className={`radio-btn ${form.putsMoney === true ? 'active yes' : ''}`} onClick={() => setForm({...form, putsMoney: true})}>{language === 'es' ? 'Sí' : 'Yes'}</button>
              <button className={`radio-btn ${form.putsMoney === false ? 'active no' : ''}`} onClick={() => setForm({...form, putsMoney: false})}>No</button>
            </div>
            {form.putsMoney === true && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                  <input type="number" placeholder={language === 'es' ? 'Rendimiento en Día de Pago ($)' : 'Yield on Payday ($)'} value={form.yieldAmount} onChange={(e) => setForm({...form, yieldAmount: e.target.value})} className="premium-input" />
                  <select value={form.frequency} onChange={(e) => setForm({...form, frequency: e.target.value})} className="premium-input">
                    <option value="monthly">{language === 'es' ? 'Mensual' : 'Monthly'}</option>
                    <option value="weekly">{language === 'es' ? 'Semanal' : 'Weekly'}</option>
                  </select>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'es' ? 'Próximo Día de Pago:' : 'Next Payday:'}</p>
                  <input type="date" value={form.nextDate} onChange={(e) => setForm({...form, nextDate: e.target.value})} className="premium-input" />
              </div>
            )}
          </div>
        )}

        {entryType === 'liability' && (
          <div style={{ padding: '15px', background: 'var(--toggle-bg)', borderRadius: '8px', marginBottom: '15px' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '0.9rem' }}>{language === 'es' ? '¿Requiere pagos recurrentes?' : 'Does this require payments?'}</p>
            <div className="radio-group">
              <button className={`radio-btn ${form.requiresPayments === true ? 'active no' : ''}`} onClick={() => setForm({...form, requiresPayments: true, isOneTime: false})}>{language === 'es' ? 'Sí' : 'Yes'}</button>
              <button className={`radio-btn ${form.requiresPayments === false ? 'active yes' : ''}`} onClick={() => setForm({...form, requiresPayments: false})}>No</button>
            </div>
            {form.requiresPayments === true && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                  <input type="number" placeholder={language === 'es' ? 'Costo del Pago ($)' : 'Payment Cost ($)'} value={form.yieldAmount} onChange={(e) => setForm({...form, yieldAmount: e.target.value})} className="premium-input" />
                  <select value={form.frequency} onChange={(e) => setForm({...form, frequency: e.target.value})} className="premium-input">
                    <option value="monthly">{language === 'es' ? 'Mensual' : 'Monthly'}</option>
                    <option value="weekly">{language === 'es' ? 'Semanal' : 'Weekly'}</option>
                  </select>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'es' ? 'Próxima Fecha de Pago:' : 'Next Payment Date:'}</p>
                  <input type="date" value={form.nextDate} onChange={(e) => setForm({...form, nextDate: e.target.value})} className="premium-input" />
              </div>
            )}
            {form.requiresPayments === false && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', border: '1px solid var(--danger-color)', borderRadius: '8px', animation: 'fadeIn 0.3s' }}>
                <input type="checkbox" checked={form.isOneTime} onChange={(e) => setForm({...form, isOneTime: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{language === 'es' ? 'Compra Única (Se añadirá al % Desperdicio)' : '1-Time Purchase (Adds to Waste %)'}</span>
              </label>
            )}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={handleAddItem} style={{ flex: 1, padding: '14px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{language === 'es' ? 'Ejecutar' : 'Execute'}</button>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{language === 'es' ? 'Cancelar' : 'Cancel'}</button>
        </div>
      </div>
    </div>
  );
};