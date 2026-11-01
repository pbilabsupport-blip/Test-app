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
  wastePercentage = 0 
}) {
  const { language, authSession } = useAppContext();
  const isEs = language === 'es';
  const isPro = authSession?.tier === 'pro';
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const buyUrl = process.env.REACT_APP_GUMROAD_URL || 'https://gumroad.com';

  // Total Calculations
  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const passiveIncome = incomes
    .filter(i => i.isPassive || i.category === 'Passive')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Pro Feature: Freedom Date Projection Engine
  const calculateFreedomDate = () => {
    if (gaugeValue >= 100) {
      return { isAchieved: true };
    }
    if (cashFlow <= 0) {
      return { isPossible: false, message: isEs ? 'Se requiere flujo de caja positivo para proyectar la fecha.' : 'Positive cash flow required to project date.' };
    }

    // Conservative model: Reinvesting 60% of monthly surplus into 8% annual yield assets (~0.67% monthly yield)
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

      {/* Rich Dad Philosophy Banner */}
      <div style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--primary-color)', padding: '25px', borderRadius: '16px' }}>
        <h3 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0' }}>
          {isEs ? '💡 Regla de Oro Rich Dad' : '💡 Rich Dad Golden Rule'}
        </h3>
        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-color)' }}>
          {isEs 
            ? '"Los ricos compran activos. Los pobres solo tienen gastos. La clase media compra pasivos que piensan que son activos." — Robert Kiyosaki. Utilice este panel para enfocar su capital en la columna de activos.'
            : '"The rich buy assets. The poor only have expenses. The middle class buy liabilities that they think are assets." — Robert Kiyosaki. Use this dashboard to focus your capital on the asset column.'}
        </p>
      </div>

      {/* TASTEFUL NATIVE AD FOR FREE TIER (Unmounts on Pro) */}
      {!isPro && (
        <div style={{ marginTop: '10px' }}>
          <AdSlot slot={process.env.REACT_APP_ADSENSE_SLOT_CARD} />
        </div>
      )}

      {/* Upgrade Modal for Pro Teasers */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', maxWidth: '480px', width: '100%', border: '2px solid var(--primary-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👑</div>
            <h2 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0' }}>
              {isEs ? 'Bóveda Pro ($5.00 / mes)' : 'Vault Pro ($5.00 / mo)'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}>
              {isEs 
                ? 'Desbloquee la proyección de Fecha de Libertad, Asistente AI personalizado, Tablero de Visión ilimitado y una experiencia 100% libre de anuncios.'
                : 'Unlock your exact Freedom Date projection, personal AI CFO Assistant, unlimited Vision Board goals, and a 100% ad-free experience.'}
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