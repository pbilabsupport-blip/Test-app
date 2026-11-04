import React, { useState } from 'react';
import { useAppContext } from '../../../../context/AppContext';
import AdSlot from '../../../../components/ads/AdSlot';

export function Dashboard({ 
  incomes = [], 
  expenses = [], 
  assets = [], 
  liabilities = [], 
  cashFlow = 0, 
  gaugeValue = 0, 
  gaugeColor = '#ef4444', 
  wastePercentage = 0,
  visionCards = [] 
}) {
  const { language, authSession } = useAppContext();
  const isEs = language === 'es';
  const isPro = authSession?.tier === 'pro';
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const buyUrl = process.env.REACT_APP_GUMROAD_URL || 'https://gumroad.com';

  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const passiveIncome = incomes
    .filter(i => i.isPassive || i.category === 'Passive')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // ============================================================================
  // "SMART MOVES" ALGORITHMIC CFO ENGINE
  // ============================================================================
  const generateSmartMove = () => {
    const surplus = cashFlow;
    
    // SCENARIO 1: Deficit (Bleeding Money)
    if (surplus < 0) {
      const deficit = Math.abs(surplus);
      const waste = expenses
        .filter(e => e.category === 'Waste' || e.isOneTime)
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        
      if (waste >= deficit) {
        return {
          icon: '⚠️', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)',
          title: isEs ? 'Alerta de Sangrado' : 'Bleeding Alert',
          text: isEs
            ? `Sus gastos superan sus ingresos por $${deficit.toLocaleString()}. Recorte $${deficit.toLocaleString()} de sus gastos "No Esenciales" este mes para volver a estar en verde.`
            : `Your expenses exceed your income by $${deficit.toLocaleString()}. Cut $${deficit.toLocaleString()} from your "Non-Essential" spending this month to get back in the green.`
        };
      } else {
        return {
          icon: '🚨', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)',
          title: isEs ? 'Déficit Crítico' : 'Critical Deficit',
          text: isEs
            ? `Tiene un déficit de $${deficit.toLocaleString()}. Necesita reducir gastos de vivienda/comida o encontrar una nueva fuente de ingresos urgentemente.`
            : `You are running a $${deficit.toLocaleString()} deficit. You need to reduce essential expenses or find a new income source urgently.`
        };
      }
    } 
    
    // SCENARIO 2: Breaking Even
    if (surplus === 0) {
      return {
        icon: '⚖️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)',
        title: isEs ? 'Punto de Equilibrio' : 'Breaking Even',
        text: isEs
          ? `Está en punto de equilibrio exacto ($0). Busque recortar gastos no esenciales para generar capital de inversión.`
          : `You are exactly breaking even ($0). Look to cut non-essential expenses so you can build investment capital.`
      };
    }

    // SCENARIO 3: Surplus (Extra Money)
    // Priority A: Debt Snowball Method
    const activeDebts = liabilities.filter(l => Number(l.amount) > 0).sort((a, b) => Number(a.amount) - Number(b.amount));
    if (activeDebts.length > 0) {
      const targetDebt = activeDebts[0];
      const minPayment = Number(targetDebt.paymentAmount) || 0;
      const currentMonths = minPayment > 0 ? Math.ceil(targetDebt.amount / minPayment) : 0;
      const newPayment = minPayment + surplus;
      const newMonths = Math.ceil(targetDebt.amount / newPayment);
      const savedMonths = currentMonths > 0 ? currentMonths - newMonths : 0;

      if (savedMonths > 0) {
        return {
          icon: '💡', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)',
          title: isEs ? 'Movimiento Inteligente' : 'Smart Move',
          text: isEs
            ? `Tiene $${surplus.toLocaleString()} extra. Si lo destina a "${targetDebt.name}", liquidará esa deuda ${savedMonths} meses más rápido.`
            : `You have $${surplus.toLocaleString()} extra. If you put that toward "${targetDebt.name}", you will be completely debt-free of it ${savedMonths} months faster.`
        };
      } else {
        return {
          icon: '💡', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)',
          title: isEs ? 'Movimiento Inteligente' : 'Smart Move',
          text: isEs
            ? `¡Use su excedente de $${surplus.toLocaleString()} para liquidar "${targetDebt.name}" hoy mismo!`
            : `Use your $${surplus.toLocaleString()} surplus to completely pay off "${targetDebt.name}" today!`
        };
      }
    }

    // Priority B: Fund Vision Board Dreams
    const activeVision = visionCards.find(c => Number(c.currentAmount || 0) < Number(c.targetAmount || 1));
    if (activeVision) {
      const remaining = Number(activeVision.targetAmount) - Number(activeVision.currentAmount || 0);
      const months = Math.ceil(remaining / surplus);
      return {
        icon: '🌟', color: 'var(--primary-color)', bg: 'rgba(212, 175, 55, 0.1)',
        title: isEs ? 'Objetivo a la Vista' : 'Vision Target',
        text: isEs
          ? `¡Siga ahorrando sus $${surplus.toLocaleString()} extra! A este ritmo, financiará completamente su "${activeVision.title}" en solo ${months} mes(es).`
          : `Keep saving your $${surplus.toLocaleString()} surplus! At this pace, you will fully fund "${activeVision.title}" in just ${months} month(s).`
      };
    }

    // Priority C: Wealth Building
    return {
      icon: '👑', color: 'var(--primary-color)', bg: 'rgba(212, 175, 55, 0.1)',
      title: isEs ? 'Creación de Riqueza' : 'Wealth Building',
      text: isEs
        ? `¡Excelente! Tiene $${surplus.toLocaleString()} extra y cero deudas. Es el momento perfecto para comprar un activo que genere flujo de caja pasivo.`
        : `Excellent! You have $${surplus.toLocaleString()} extra and zero active debts. This is the perfect time to buy a cash-flowing asset.`
    };
  };

  const smartMove = generateSmartMove();

  // ============================================================================
  // FREEDOM DATE PROJECTION ENGINE (PRO)
  // ============================================================================
  const calculateFreedomDate = () => {
    if (gaugeValue >= 100) return { isAchieved: true };
    if (cashFlow <= 0) {
      return { isPossible: false, message: isEs ? 'Se requiere flujo de caja positivo para proyectar la fecha.' : 'Positive cash flow required to project date.' };
    }

    const monthlyDeficit = totalExpense - passiveIncome;
    const monthlyYieldAddition = (cashFlow * 0.6) * (0.08 / 12);
    
    if (monthlyYieldAddition <= 0) {
      return { isPossible: false, message: isEs ? 'Adquiera más activos para calcular su fecha.' : 'Acquire more yielding assets to project date.' };
    }

    const monthsNeeded = Math.ceil(monthlyDeficit / monthlyYieldAddition);
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsNeeded);

    const monthName = targetDate.toLocaleDateString(isEs ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });
    const years = Math.floor(monthsNeeded / 12);
    const remainingMonths = monthsNeeded % 12;

    const timeHorizon = isEs
      ? `${years > 0 ? `${years} año(s) y ` : ''}${remainingMonths} mes(es)`
      : `${years > 0 ? `${years} yr(s) and ` : ''}${remainingMonths} mo(s)`;

    return {
      isPossible: true,
      targetDate: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      timeHorizon,
      monthsNeeded
    };
  };

  const freedomProjection = calculateFreedomDate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Top Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        
        {/* Cash Flow Card */}
        <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isEs ? 'Flujo de Caja Mensual' : 'Monthly Cash Flow'}
            </h4>
            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: cashFlow >= 0 ? '#10b981' : '#ef4444' }}>
              ${cashFlow.toLocaleString()}
            </div>
          </div>
          <p style={{ margin: '12px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {cashFlow >= 0 
              ? (isEs ? 'Excedente listo para comprar activos.' : 'Surplus ready to acquire assets.')
              : (isEs ? 'Déficit mensual: recorte pasivos de inmediato.' : 'Monthly deficit: cut liabilities immediately.')}
          </p>
        </div>

        {/* Financial Freedom Gauge Card */}
        <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isEs ? 'Índice de Libertad Financiera' : 'Freedom Index (Passive / Expenses)'}
            </h4>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: gaugeColor }}>
                {gaugeValue}%
              </div>
              <div style={{ flex: 1, height: '10px', background: 'var(--bg-color)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div style={{ width: `${Math.min(gaugeValue, 100)}%`, height: '100%', background: gaugeColor, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          </div>
          <p style={{ margin: '12px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {gaugeValue >= 100 
              ? (isEs ? '🏆 ¡100% Financieramente Libre!' : '🏆 100% Financially Free!')
              : (isEs ? `Meta: Cubrir $${totalExpense.toLocaleString()} con ingresos pasivos.` : `Goal: Cover $${totalExpense.toLocaleString()} with passive income.`)}
          </p>
        </div>

        {/* Waste Index Card */}
        <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isEs ? 'Gastos Hormiga y Lujos' : 'Waste / Non-Essential Index'}
            </h4>
            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: wastePercentage > 20 ? '#ef4444' : '#10b981' }}>
              {wastePercentage}%
            </div>
          </div>
          <p style={{ margin: '12px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {wastePercentage > 20
              ? (isEs ? 'Atención: Sus gastos hormiga reducen su capacidad de inversión.' : 'Warning: High waste limits asset acquisition.')
              : (isEs ? 'Excelente disciplina de gastos.' : 'Excellent spending discipline.')}
          </p>
        </div>
      </div>

      {/* THE SMART MOVES ALGORITHMIC CFO CARD */}
      <div style={{ background: smartMove.bg, border: `1px solid ${smartMove.color}`, padding: '20px', borderRadius: '16px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div style={{ fontSize: '2.5rem' }}>{smartMove.icon}</div>
        <div>
          <h3 style={{ margin: '0 0 5px 0', color: smartMove.color, fontSize: '1.1rem' }}>{smartMove.title}</h3>
          <p style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            {smartMove.text}
          </p>
        </div>
      </div>

      {/* STRATEGIC FREEDOM DATE COUNTDOWN CARD (PRO ENGINE) */}
      <div style={{ 
        background: 'var(--card-bg)', 
        padding: '25px', 
        borderRadius: '16px', 
        border: isPro ? '2px solid var(--primary-color)' : '1px dashed var(--primary-color)',
        position: 'relative'
      }}>
        {isPro ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                ⏳ {isEs ? 'Fecha Proyectada de Libertad Financiera' : 'Projected Financial Freedom Date'}
              </h3>
              <span style={{ fontSize: '0.75rem', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                PRO FEATURE
              </span>
            </div>

            {freedomProjection.isAchieved ? (
              <p style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: 'bold', margin: '10px 0 0 0' }}>
                🎉 {isEs ? '¡Felicidades! Sus ingresos pasivos ya superan sus gastos.' : 'Congratulations! Your passive income already exceeds all expenses.'}
              </p>
            ) : freedomProjection.isPossible ? (
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-color)', margin: '10px 0' }}>
                  {freedomProjection.targetDate}
                </div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {isEs 
                    ? `A su ritmo actual, su flujo de caja reemplazará su trabajo en aproximadamente ${freedomProjection.timeHorizon}.`
                    : `At your current pace, your cash flow will replace your working expenses in approximately ${freedomProjection.timeHorizon}.`}
                </p>
              </div>
            ) : (
              <p style={{ margin: '10px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {freedomProjection.message}
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <span>🔒</span> {isEs ? 'Calculadora de Fecha de Libertad (Función Pro)' : 'Freedom Date Countdown (Pro Feature)'}
              </div>
              <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '650px' }}>
                {isEs 
                  ? 'Descubra el mes y año exacto en que sus ingresos pasivos cubrirán el 100% de su vida.'
                  : 'Calculate the exact month and year your passive income will cover 100% of your lifestyle.'}
              </p>
            </div>
            <button 
              onClick={() => setShowUpgradeModal(true)}
              style={{ padding: '10px 20px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {isEs ? 'Desbloquear Pro ($5/mes)' : 'Unlock with Pro ($5/mo)'}
            </button>
          </div>
        )}
      </div>

      {/* TASTEFUL NATIVE AD FOR FREE TIER (Unmounts on Pro) */}
      {!isPro && (
        <div style={{ marginTop: '10px' }}>
          <AdSlot slot={process.env.REACT_APP_ADSENSE_SLOT_CARD} />
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', maxWidth: '480px', width: '100%', border: '2px solid var(--primary-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👑</div>
            <h2 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0' }}>
              {isEs ? 'Bóveda Pro ($5.00 / mes)' : 'Vault Pro ($5.00 / mo)'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}>
              {isEs 
                ? 'Desbloquee la proyección de Fecha de Libertad, notificaciones push automáticas, Tablero de Visión ilimitado y una experiencia libre de anuncios.'
                : 'Unlock your exact Freedom Date projection, background push notifications, unlimited Vision Board goals, and a 100% ad-free experience.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a 
                href={buyUrl} 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'block', padding: '14px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem' }}>
                {isEs ? 'Obtener Licencia en Gumroad' : 'Get License on Gumroad'}
              </a>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                style={{ padding: '12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                {isEs ? 'Continuar en Bóveda Gratis' : 'Continue on Free Vault'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;