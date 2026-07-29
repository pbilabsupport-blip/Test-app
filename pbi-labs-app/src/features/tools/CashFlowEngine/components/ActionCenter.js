import React from 'react';
import { useAppContext } from '../../../../context/AppContext';

export const ActionCenter = ({ assets, setAssets, liabilities, setLiabilities, expenses, setExpenses, showToast }) => {
  const { language } = useAppContext();
  const isEs = language === 'es';

  // TIME ENGINE: Safely pushes the date forward
  const advanceDate = (dateStr, freq) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const d = new Date(year, month - 1, day);
    if (freq === 'weekly') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleProcessPayment = (type, id) => {
    if (type === 'liability') {
      const target = liabilities.find(l => l.id === id);
      if (!target) return;
      const newAmount = target.amount - target.paymentAmount;

      if (newAmount <= 0) {
        setLiabilities(liabilities.filter(l => l.id !== id));
        setExpenses(expenses.filter(e => e.linkedLiabilityId !== id));
        showToast(isEs ? `¡Felicidades! ${target.name} ha sido pagado por completo.` : `Congratulations! ${target.name} has been fully paid off.`);
      } else {
        setLiabilities(liabilities.map(l => l.id === id ? { ...l, amount: newAmount, nextDate: advanceDate(l.nextDate, l.frequency) } : l));
        showToast(isEs ? `Pago procesado. Saldo restante: $${newAmount.toFixed(2)}` : `Payment processed. Remaining balance: $${newAmount.toFixed(2)}`);
      }
    } else if (type === 'asset') {
      setAssets(assets.map(a => a.id === id ? { ...a, nextDate: advanceDate(a.nextDate, a.frequency) } : a));
      showToast(isEs ? '¡Ingreso Pasivo recibido!' : 'Passive Income received!');
    }
  };

  const activeAssets = assets.filter(a => a.yieldAmount > 0);
  const activeLiabilities = liabilities.filter(l => l.requiresPayments === true);

  return (
    <div style={{ paddingBottom: '90px', animation: 'fadeIn 0.4s' }}>
      <h2 style={{ color: 'var(--text-color)', marginBottom: '20px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '10px' }}>
        {isEs ? 'Centro de Acción (Pagos)' : 'Action Center (Payments)'}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--danger-color)', marginTop: 0, marginBottom: '15px' }}>{isEs ? 'Deudas Activas' : 'Active Debts'}</h3>
          {activeLiabilities.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{isEs ? 'Sin deudas pendientes.' : 'No pending debts.'}</p> : activeLiabilities.map(l => (
            <div key={l.id} style={{ background: 'var(--bg-color)', padding: '15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid var(--danger-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>{l.name}</span><span>${l.amount.toFixed(2)}</span></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0' }}>{isEs ? 'Próximo Pago:' : 'Next Payment:'} {l.nextDate} (${l.paymentAmount})</div>
              <button onClick={() => handleProcessPayment('liability', l.id)} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--danger-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isEs ? 'Marcar como Pagado' : 'Mark as Paid'}
              </button>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--success-color)', marginTop: 0, marginBottom: '15px' }}>{isEs ? 'Ingresos de Activos' : 'Asset Yields'}</h3>
          {activeAssets.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{isEs ? 'Sin activos generando ingresos.' : 'No active assets yielding.'}</p> : activeAssets.map(a => (
            <div key={a.id} style={{ background: 'var(--bg-color)', padding: '15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid var(--success-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>{a.name}</span></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0' }}>{isEs ? 'Próximo Ingreso:' : 'Next Yield:'} {a.nextDate} (${a.yieldAmount})</div>
              <button onClick={() => handleProcessPayment('asset', a.id)} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--success-color)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isEs ? 'Recibir Ingreso' : 'Receive Yield'}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};