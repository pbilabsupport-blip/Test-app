import React from 'react';
import { useAppContext } from '../../../../context/AppContext';
import { recordPayment, recordYield } from '../ledger';
import ReminderSettings from '../../../../components/reminders/ReminderSettings';

// Executive Micro-Reward Audio Chime (VOLUME BOOSTED)
function playSuccessChime(type = 'payment') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (type === 'payoff') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.45); // C6
      
      // Volume increased to 80%
      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      
      // Volume increased to 80%
      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Audio context safely ignored if blocked by browser policy
  }
}

export const ActionCenter = ({
  assets = [],
  setAssets,
  liabilities = [],
  setLiabilities,
  expenses = [],
  setExpenses,
  incomes = [],
  setIncomes,
  showToast,
  reminderPrefs,
  setReminderPrefs
}) => {
  const { language } = useAppContext();
  const isEs = language === 'es';

  const advanceDate = (dateStr, freq) => {
    if (!dateStr) return '';
    const [month, day, year] = dateStr.split('-');
    const d = new Date(year, month - 1, day);
    if (freq === 'weekly') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  };

  const getDueStatus = (dateStr) => {
    if (!dateStr) return { stage: 'future', text: isEs ? 'Sin fecha' : 'No date', color: '#94a3b8', priority: 4 };

    const todayStr = new Date().toISOString().slice(0, 10);
    const [m, d, y] = dateStr.split('-');
    if (!m || !d || !y) return { stage: 'future', text: dateStr, color: '#94a3b8', priority: 4 };
    
    const dueTime = Date.parse(`${y}-${m}-${d}T00:00:00Z`);
    const todayTime = Date.parse(`${todayStr}T00:00:00Z`);

    if (Number.isNaN(dueTime) || Number.isNaN(todayTime)) {
      return { stage: 'future', text: dateStr, color: '#94a3b8', priority: 4 };
    }

    const diffDays = Math.round((dueTime - todayTime) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const daysOverdue = Math.abs(diffDays);
      return {
        stage: 'overdue',
        text: isEs ? `⚠️ Vencido (${daysOverdue}d tarde)` : `⚠️ Overdue (${daysOverdue}d late)`,
        subtext: isEs ? '¿Ya realizó este pago?' : 'Did you make this payment?',
        color: '#ef4444',
        badgeBg: 'rgba(239, 68, 68, 0.15)',
        priority: 1
      };
    }
    if (diffDays === 0) {
      return {
        stage: 'due_today',
        text: isEs ? '⚡ Vence Hoy' : '⚡ Due Today',
        subtext: isEs ? 'Acción requerida' : 'Action required',
        color: '#f59e0b',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        priority: 2
      };
    }
    if (diffDays <= 2) {
      return {
        stage: 'upcoming',
        text: isEs ? `🔔 Vence en ${diffDays} día(s)` : `🔔 Due in ${diffDays} day(s)`,
        subtext: isEs ? 'Prepárese para pagar' : 'Prepare to pay',
        color: 'var(--primary-color)',
        badgeBg: 'rgba(212, 175, 55, 0.15)',
        priority: 3
      };
    }
    return {
      stage: 'future',
      text: isEs ? `Próximo: ${dateStr}` : `Upcoming: ${dateStr}`,
      subtext: isEs ? `En ${diffDays} días` : `In ${diffDays} days`,
      color: 'var(--text-muted)',
      badgeBg: 'var(--card-bg)',
      priority: 4
    };
  };

  const handleProcessPayment = (type, id) => {
    if (type === 'liability') {
      const target = liabilities.find(l => l.id === id);
      if (!target) return;
      const payment = Number(target.paymentAmount) || 0;
      const newAmount = Number(target.amount) - payment;

      if (newAmount <= 0) {
        setLiabilities(liabilities.filter(l => l.id !== id));
        setExpenses(expenses.filter(e => e.linkedLiabilityId !== id));
        playSuccessChime('payoff');
        showToast(isEs ? `🎉 ¡Felicidades! ${target.name} ha sido pagado por completo.` : `🎉 Congratulations! ${target.name} is 100% paid off.`);
      } else {
        setLiabilities(liabilities.map(l => l.id === id ? { ...l, amount: newAmount, nextDate: advanceDate(l.nextDate, l.frequency) } : l));
        setExpenses(recordPayment(expenses, target, payment));
        playSuccessChime('payment');
        showToast(isEs ? `Pago de $${payment.toFixed(2)} registrado. Nuevo saldo: $${newAmount.toFixed(2)}` : `Payment of $${payment.toFixed(2)} posted. New balance: $${newAmount.toFixed(2)}`);
      }
    } else if (type === 'asset') {
      const target = assets.find(a => a.id === id);
      if (!target) return;
      setAssets(assets.map(a => a.id === id ? { ...a, nextDate: advanceDate(a.nextDate, a.frequency) } : a));
      setIncomes(recordYield(incomes, target));
      playSuccessChime('payment');
      showToast(isEs ? '💰 Ingreso pasivo registrado en el estado financiero.' : '💰 Passive income was posted to the statement.');
    }
  };

  const activeAssets = assets.filter(a => Number(a.yieldAmount) > 0);
  
  const sortedLiabilities = [...liabilities]
    .filter(l => l.requiresPayments === true)
    .sort((a, b) => {
      const statusA = getDueStatus(a.nextDate);
      const statusB = getDueStatus(b.nextDate);
      return statusA.priority - statusB.priority;
    });

  return (
    <div style={{ paddingBottom: '90px', animation: 'fadeIn 0.3s ease' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ color: 'var(--text-color)', margin: 0 }}>
            {isEs ? 'Centro de Acción y Pagos' : 'Action Center & Payment Hub'}
          </h2>
          <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {isEs ? 'Supervise deudas, préstamos personales y cobre ingresos pasivos.' : 'Monitor bills, personal loans, and collect passive yields.'}
          </p>
        </div>
      </div>

      <ReminderSettings prefs={reminderPrefs} onChange={setReminderPrefs} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginTop: '20px' }}>
        
        {/* Active Debts & Bills Column */}
        <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: 'var(--danger-color)', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💳 {isEs ? 'Deudas y Facturas Activas' : 'Active Debts & Bills'}
            </h3>
            <span style={{ fontSize: '0.8rem', background: 'var(--bg-color)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>
              {sortedLiabilities.length}
            </span>
          </div>

          {sortedLiabilities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
              {isEs ? '🎉 Sin deudas pendientes por pagar.' : '🎉 No pending debts or bills due.'}
            </p>
          ) : (
            sortedLiabilities.map(l => {
              const dueInfo = getDueStatus(l.nextDate);
              const isPersonalLoan = l.category === 'Personal' || l.isPersonalLoan;

              return (
                <div 
                  key={l.id} 
                  style={{ 
                    background: 'var(--bg-color)', 
                    padding: '18px', 
                    borderRadius: '12px', 
                    marginBottom: '15px', 
                    border: '1px solid var(--border-color)',
                    borderLeft: `5px solid ${dueInfo.color}` 
                  }}>
                  
                  {/* Header: Name and Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{isPersonalLoan ? '🤝' : '📄'}</span> {l.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {isPersonalLoan 
                          ? (isEs ? 'Préstamo personal / informal' : 'Personal / handshake loan')
                          : (isEs ? 'Obligación financiera' : 'Financial bill')}
                      </div>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
                      ${Number(l.amount || 0).toLocaleString()}
                    </div>
                  </div>

                  {/* Urgency Alert Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0', padding: '8px 12px', background: dueInfo.badgeBg, borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: dueInfo.color }}>
                      {dueInfo.text}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                      {isEs ? 'Cuota:' : 'Due:'} ${Number(l.paymentAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Mark as Paid Action */}
                  <button 
                    onClick={() => handleProcessPayment('liability', l.id)} 
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      backgroundColor: dueInfo.stage === 'overdue' ? '#ef4444' : 'var(--card-bg)', 
                      color: dueInfo.stage === 'overdue' ? '#fff' : 'var(--text-color)', 
                      border: `1px solid ${dueInfo.color}`, 
                      borderRadius: '8px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}>
                    <span>✓</span> {isEs ? 'Marcar como Pagado' : 'Mark as Paid'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Passive Income Asset Yields Column */}
        <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: 'var(--success-color)', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🌱 {isEs ? 'Rendimientos de Activos' : 'Asset Yields & Passive Cash'}
            </h3>
            <span style={{ fontSize: '0.8rem', background: 'var(--bg-color)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>
              {activeAssets.length}
            </span>
          </div>

          {activeAssets.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
              {isEs ? 'Sin activos generando ingresos pasivos actualmente.' : 'No assets generating passive cash flow yet.'}
            </p>
          ) : (
            activeAssets.map(a => (
              <div 
                key={a.id} 
                style={{ 
                  background: 'var(--bg-color)', 
                  padding: '18px', 
                  borderRadius: '12px', 
                  marginBottom: '15px', 
                  border: '1px solid var(--border-color)',
                  borderLeft: '5px solid var(--success-color)' 
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem' }}>
                  <span>{a.name}</span>
                  <span style={{ color: 'var(--success-color)' }}>+${Number(a.yieldAmount || 0).toFixed(2)}</span>
                </div>
                
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '12px 0' }}>
                  {isEs ? 'Próximo cobro:' : 'Next collection:'} {a.nextDate || (isEs ? 'Mensual' : 'Monthly')}
                </div>

                <button 
                  onClick={() => handleProcessPayment('asset', a.id)} 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    backgroundColor: 'var(--success-color)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}>
                  {isEs ? '📥 Recibir Ingreso Pasivo' : '📥 Collect Passive Yield'}
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default ActionCenter;