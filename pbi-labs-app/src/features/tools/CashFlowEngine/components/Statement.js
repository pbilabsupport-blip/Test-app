import React, { useState } from 'react';
import { useAppContext } from '../../../../context/AppContext';
import { FiPlus, FiTrash2, FiDownload, FiLock } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AdSlot from '../../../../components/ads/AdSlot';

// Helper: Converts any date to MM-DD-YYYY format
function formatDateMMDDYYYY(dateInput) {
  if (!dateInput) return '';
  const str = String(dateInput).trim();
  // If already MM-DD-YYYY, return as is
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return str;

  // If in YYYY-MM-DD format (from standard HTML date inputs)
  const parts = str.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[1]}-${parts[2]}-${parts[0]}`;
  }

  // Fallback for Date objects or timestamps
  const d = new Date(dateInput);
  if (!Number.isNaN(d.getTime())) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  }
  return str;
}

export function Statement({ incomes = [], expenses = [], assets = [], liabilities = [], handleDelete, setIsModalOpen }) {
  const { language, authSession } = useAppContext();
  const isEs = language === 'es';
  const isPro = authSession?.tier === 'pro';

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const buyUrl = process.env.REACT_APP_GUMROAD_URL || 'https://gumroad.com';

  // Executive Totals
  const totalIncome = incomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalAssets = assets.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalLiabilities = liabilities.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const netCashFlow = totalIncome - totalExpense;

  // Pro Feature: Export to Excel Engine (Formatted to MM-DD-YYYY)
  const handleExportExcel = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    const todayMMDDYYYY = formatDateMMDDYYYY(new Date());
    const wb = XLSX.utils.book_new();

    // 1. Summary Sheet
    const summaryData = [
      ['P.B.I. LABS VAULT - FINANCIAL STATEMENT'],
      ['Export Date (MM-DD-YYYY)', todayMMDDYYYY],
      [],
      ['METRIC', 'AMOUNT ($)'],
      ['Total Monthly Income', totalIncome],
      ['Total Monthly Expenses', totalExpense],
      ['Net Monthly Cash Flow', netCashFlow],
      ['Total Assets', totalAssets],
      ['Total Liabilities', totalLiabilities],
      ['Net Worth', netWorth]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // 2. Cash Flow Sheet (Incomes & Expenses)
    const cashFlowData = [
      ['TYPE', 'NAME', 'CATEGORY', 'AMOUNT ($)', 'PASSIVE / RECURRING'],
      ...incomes.map(i => ['Income', i.name, i.category || 'Active', Number(i.amount), i.isPassive ? 'Yes (Passive)' : 'No']),
      ...expenses.map(e => ['Expense', e.name, e.category || 'General', Number(e.amount), e.isOneTime ? 'One-time' : 'Recurring'])
    ];
    const wsCashFlow = XLSX.utils.aoa_to_sheet(cashFlowData);
    XLSX.utils.book_append_sheet(wb, wsCashFlow, 'Cash Flow');

    // 3. Balance Sheet (Assets & Liabilities with MM-DD-YYYY Dates)
    const balanceSheetData = [
      ['TYPE', 'NAME', 'TOTAL AMOUNT ($)', 'YIELD / PAYMENT ($)', 'FREQUENCY', 'NEXT DATE (MM-DD-YYYY)'],
      ...assets.map(a => ['Asset', a.name, Number(a.amount), Number(a.yieldAmount || 0), a.frequency || 'Monthly', formatDateMMDDYYYY(a.nextDate)]),
      ...liabilities.map(l => ['Liability', l.name, Number(l.amount), Number(l.paymentAmount || 0), l.frequency || 'Monthly', formatDateMMDDYYYY(l.nextDate)])
    ];
    const wsBalance = XLSX.utils.aoa_to_sheet(balanceSheetData);
    XLSX.utils.book_append_sheet(wb, wsBalance, 'Balance Sheet');

    // Generate Excel File with MM-DD-YYYY in filename
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `PBI_Financial_Statement_${todayMMDDYYYY}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Executive Net Worth & Cash Flow Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
        <div style={{ background: 'var(--card-bg)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {isEs ? 'Patrimonio Neto (Activos - Pasivos)' : 'Net Worth (Assets - Debts)'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: netWorth >= 0 ? 'var(--primary-color)' : '#ef4444', marginTop: '6px' }}>
            ${netWorth.toLocaleString()}
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {isEs ? 'Flujo de Caja Neto' : 'Net Cash Flow'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: netCashFlow >= 0 ? '#10b981' : '#ef4444', marginTop: '6px' }}>
            ${netCashFlow.toLocaleString()}
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {isEs ? 'Total Activos' : 'Total Assets'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '6px' }}>
            ${totalAssets.toLocaleString()}
          </div>
        </div>

        <div style={{ background: 'var(--card-bg)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {isEs ? 'Total Deudas / Pasivos' : 'Total Liabilities'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '6px' }}>
            ${totalLiabilities.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.2rem' }}>
            {isEs ? 'Estado Financiero Integral' : 'Comprehensive Financial Statement'}
          </h3>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {isEs ? 'Su balance general y flujo de caja sincronizado en tiempo real.' : 'Your real-time balance sheet and income statement.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Export to Excel Button (Pro Feature) */}
          <button 
            onClick={handleExportExcel}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 18px', 
              background: 'var(--card-bg)', 
              color: isPro ? 'var(--primary-color)' : 'var(--text-muted)', 
              border: isPro ? '1px solid var(--primary-color)' : '1px dashed var(--border-color)', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '0.9rem' 
            }}>
            {isPro ? <FiDownload /> : <FiLock />} {isEs ? 'Exportar a Excel' : 'Export Excel'}
          </button>

          {/* Add Entry Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 18px', 
              background: 'var(--primary-color)', 
              color: '#000', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '0.9rem' 
            }}>
            <FiPlus /> {isEs ? 'Agregar Registro' : 'Add Entry'}
          </button>
        </div>
      </div>

      {/* Grid of Financial Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Incomes Table */}
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ color: '#10b981', margin: 0 }}>{isEs ? 'Ingresos (Income)' : 'Incomes'}</h4>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981' }}>+${totalIncome.toLocaleString()}</span>
          </div>
          {incomes.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{isEs ? 'Sin ingresos registrados' : 'No income records'}</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incomes.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category || (isEs ? 'Activo' : 'Active')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>+${Number(item.amount).toLocaleString()}</span>
                    <button onClick={() => handleDelete('income', item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses Table */}
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ color: '#ef4444', margin: 0 }}>{isEs ? 'Gastos (Expenses)' : 'Expenses'}</h4>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ef4444' }}>-${totalExpense.toLocaleString()}</span>
          </div>
          {expenses.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{isEs ? 'Sin gastos registrados' : 'No expense records'}</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {expenses.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category || (isEs ? 'General' : 'General')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 'bold', color: '#ef4444' }}>-${Number(item.amount).toLocaleString()}</span>
                    <button onClick={() => handleDelete('expense', item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assets Table */}
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>{isEs ? 'Activos (Assets)' : 'Assets'}</h4>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>${totalAssets.toLocaleString()}</span>
          </div>
          {assets.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{isEs ? 'Sin activos registrados' : 'No asset records'}</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {assets.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.yieldAmount ? (isEs ? `Rendimiento: +$${item.yieldAmount}/mes` : `Yield: +$${item.yieldAmount}/mo`) : (isEs ? 'Sin rendimiento' : 'No yield')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>${Number(item.amount).toLocaleString()}</span>
                    <button onClick={() => handleDelete('asset', item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liabilities Table */}
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ color: '#f59e0b', margin: 0 }}>{isEs ? 'Pasivos / Deudas' : 'Liabilities & Debts'}</h4>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f59e0b' }}>${totalLiabilities.toLocaleString()}</span>
          </div>
          {liabilities.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{isEs ? 'Sin pasivos registrados' : 'No liabilities records'}</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {liabilities.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.paymentAmount ? (isEs ? `Pago: $${item.paymentAmount}/mes` : `Payment: $${item.paymentAmount}/mo`) : (isEs ? 'Sin pago recurrente' : 'No recurring payment')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>${Number(item.amount).toLocaleString()}</span>
                    <button onClick={() => handleDelete('liability', item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* TASTEFUL NATIVE AD AT THE BOTTOM (Free Tier Only) */}
      {!isPro && (
        <div style={{ marginTop: '20px' }}>
          <AdSlot slot={process.env.REACT_APP_ADSENSE_SLOT_BANNER} />
        </div>
      )}

      {/* Upgrade Modal for Excel Export Teaser */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', maxWidth: '480px', width: '100%', border: '2px solid var(--primary-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊</div>
            <h2 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0' }}>
              {isEs ? 'Exportación a Excel (Función Pro)' : 'Excel Export (Pro Feature)'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}>
              {isEs 
                ? 'Descargue hojas de cálculo profesionales con formato MM-DD-YYYY listas para su contador, preparación de impuestos y respaldos completos con Pro ($5.00/mes).'
                : 'Download multi-sheet financial workbooks formatted in MM-DD-YYYY ready for your accountant, tax prep, and complete personal backups with Pro ($5.00/mo).'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a 
                href={buyUrl} 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'block', padding: '14px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem' }}>
                {isEs ? 'Desbloquear Pro por $5/mes' : 'Unlock Pro for $5/mo'}
              </a>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                style={{ padding: '12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                {isEs ? 'Continuar en Bóveda' : 'Continue in Vault'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Statement;