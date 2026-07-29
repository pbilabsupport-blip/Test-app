import React from 'react';
import { useAppContext } from '../../../../context/AppContext';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export function Statement({ incomes, expenses, assets, liabilities, handleDelete, setIsModalOpen }) {
  const { language } = useAppContext();
  const isEs = language === 'es';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--text-color)' }}>
          {isEs ? 'Estado Financiero (Income Statement & Balance Sheet)' : 'Financial Statement (Income & Balance Sheet)'}
        </h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          <FiPlus /> {isEs ? 'Agregar Registro' : 'Add Entry'}
        </button>
      </div>

      {/* Grid of Financial Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Incomes Table */}
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: '#10b981', marginTop: 0 }}>{isEs ? 'Ingresos (Income)' : 'Incomes'}</h4>
          {incomes.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{isEs ? 'Sin registros' : 'No records'}</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incomes.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>+${item.amount}</span>
                    <button onClick={() => handleDelete('income', item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses Table */}
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: '#ef4444', marginTop: 0 }}>{isEs ? 'Gastos (Expenses)' : 'Expenses'}</h4>
          {expenses.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{isEs ? 'Sin registros' : 'No records'}</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {expenses.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: 'bold', color: '#ef4444' }}>-${item.amount}</span>
                    <button onClick={() => handleDelete('expense', item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assets Table */}
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: 'var(--primary-color)', marginTop: 0 }}>{isEs ? 'Activos (Assets)' : 'Assets'}</h4>
          {assets.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{isEs ? 'Sin registros' : 'No records'}</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {assets.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isEs ? `Rendimiento: $${item.yieldAmount}/mes` : `Yield: $${item.yieldAmount}/mo`}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>${item.amount}</span>
                    <button onClick={() => handleDelete('asset', item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liabilities Table */}
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ color: '#f59e0b', marginTop: 0 }}>{isEs ? 'Pasivos (Liabilities)' : 'Liabilities'}</h4>
          {liabilities.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{isEs ? 'Sin registros' : 'No records'}</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {liabilities.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isEs ? `Pago: $${item.paymentAmount}/mes` : `Payment: $${item.paymentAmount}/mo`}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>${item.amount}</span>
                    <button onClick={() => handleDelete('liability', item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default Statement;