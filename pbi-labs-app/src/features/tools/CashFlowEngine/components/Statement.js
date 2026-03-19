import React from 'react';
import { useAppContext } from '../../../../context/AppContext';
import { FaPlus, FaTrash } from 'react-icons/fa';

export const Statement = ({ incomes, expenses, assets, liabilities, handleDelete, setIsModalOpen }) => {
  const { language } = useAppContext();

  const renderList = (items, type) => {
    if ((items || []).length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>{language === 'es' ? 'Vacio.' : 'Empty.'}</p>;
    return (
      <div style={{ padding: '10px 0' }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-color)', marginBottom: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.nextDate ? `${language === 'es' ? 'Próximo:' : 'Next:'} ${item.nextDate}` : item.category || (item.isOneTime ? '1-Time' : '')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontWeight: 'bold', color: type === 'income' || type === 'asset' ? 'var(--success-color)' : 'var(--danger-color)' }}>${Number(item.amount).toFixed(2)}</div>
              <button onClick={() => handleDelete(type, item.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: '90px', animation: 'fadeIn 0.4s' }}>
      <button onClick={() => setIsModalOpen(true)} style={{ width: '100%', padding: '15px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)' }}>
        <FaPlus /> {language === 'es' ? 'Agregar Nueva Transacción' : 'Add New Transaction'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--success-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: 0 }}>{language === 'es' ? 'Ingresos' : 'Income'}</h3>
          {renderList(incomes, 'income')}
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--danger-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: 0 }}>{language === 'es' ? 'Gastos' : 'Expenses'}</h3>
          {renderList(expenses, 'expense')}
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--success-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: 0 }}>{language === 'es' ? 'Activos' : 'Assets'}</h3>
          {renderList(assets, 'asset')}
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--danger-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: 0 }}>{language === 'es' ? 'Pasivos' : 'Liabilities'}</h3>
          {renderList(liabilities, 'liability')}
        </div>
      </div>
    </div>
  );
};