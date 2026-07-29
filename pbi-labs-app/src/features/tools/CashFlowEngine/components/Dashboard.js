import React from 'react';
import { useAppContext } from '../../../../context/AppContext';

export function Dashboard({ incomes, expenses, assets, liabilities, cashFlow, gaugeValue, gaugeColor, wastePercentage }) {
  const { language } = useAppContext();
  const isEs = language === 'es';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        
        {/* Cash Flow Card */}
        <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isEs ? 'Flujo de Caja Mensual' : 'Monthly Cash Flow'}
          </h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: cashFlow >= 0 ? '#10b981' : '#ef4444' }}>
            ${cashFlow.toLocaleString()}
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isEs ? 'Ingresos menos Gastos Totales' : 'Total Income minus Expenses'}
          </p>
        </div>

        {/* Financial Freedom Gauge Card */}
        <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isEs ? 'Libertad Financiera (Pasivo / Gastos)' : 'Financial Freedom (Passive / Expenses)'}
          </h4>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: gaugeColor }}>
              {gaugeValue}%
            </div>
            <div style={{ flex: 1, height: '8px', background: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div style={{ width: `${gaugeValue}%`, height: '100%', background: gaugeColor, transition: 'width 0.4s ease' }} />
            </div>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {gaugeValue >= 100 ? (isEs ? '¡Libertad Financiera Alcanzada!' : 'Financial Freedom Achieved!') : (isEs ? 'Meta: 100% cubierto por pasivos' : 'Goal: 100% covered by passive income')}
          </p>
        </div>

        {/* Waste Index Card */}
        <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isEs ? 'Índice de Gastos Hormiga / Lujos' : 'Waste / Luxury Expense Index'}
          </h4>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: wastePercentage > 20 ? '#ef4444' : '#10b981' }}>
            {wastePercentage}%
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isEs ? 'Porcentaje de gastos no esenciales' : 'Percentage of non-essential spending'}
          </p>
        </div>

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

    </div>
  );
}

export default Dashboard;