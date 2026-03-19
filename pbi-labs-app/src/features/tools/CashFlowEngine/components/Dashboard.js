import React from 'react';
import { useAppContext } from '../../../../context/AppContext';
import { FaFileExcel, FaFileWord } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const Dashboard = ({ incomes, expenses, assets, liabilities, cashFlow, gaugeValue, gaugeColor, wastePercentage }) => {
  const { language } = useAppContext();

  const getFormattedDate = () => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const exportToExcel = () => {
    const dateStr = getFormattedDate();
    const ws_data = [
      ['P.B.I. LABS - EXECUTIVE FINANCIAL STATEMENT'], 
      [`Generated on: ${dateStr}`], [],
      ['--- INCOME ---'], ['Name', 'Category', 'Amount ($)'], ...incomes.map(i => [i.name, i.category, i.amount]), [],
      ['--- EXPENSES ---'], ['Name', 'Category', 'Amount ($)'], ...expenses.map(e => [e.name, e.category, e.amount]), [],
      ['--- ASSETS ---'], ['Name', 'Value ($)', 'Next Yield Date'], ...assets.map(a => [a.name, a.amount, a.nextDate || 'N/A']), [],
      ['--- LIABILITIES ---'], ['Name', 'Remaining Value ($)', 'Next Payment'], ...liabilities.map(l => [l.name, l.amount, l.nextDate || 'N/A']), [],
      ['SUMMARY'], ['Net Cash Flow:', cashFlow], ['Freedom Gauge:', `${gaugeValue}%`], ['Waste Percentage:', `${wastePercentage}%`]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financial_Statement");
    XLSX.writeFile(wb, `PBI_Labs_Statement_${dateStr}.xlsx`);
  };

  const exportToWord = () => {
    const dateStr = getFormattedDate();
    const docHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><style>
        @page { size: 8.5in 11in; margin: 0.5in; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #2b579a; padding-bottom: 10px; margin-bottom: 20px; }
        h1 { font-size: 18pt; color: #2b579a; margin: 0; }
        p.date { font-size: 10pt; color: #666; font-style: italic; }
        h2 { font-size: 12pt; color: #555; background: #f2f2f2; padding: 5px; margin-top: 15pt; border-left: 4px solid #2b579a; }
        table { width: 100%; border-collapse: collapse; margin-top: 5px; }
        th { border-bottom: 2px solid #333; text-align: left; padding: 5px; font-size: 10pt; }
        td { border-bottom: 1px solid #ddd; padding: 5px; font-size: 10pt; }
        .total-box { border: 2px solid #333; padding: 10px; margin-top: 20px; text-align: right; background: #fafafa; }
      </style></head>
      <body>
        <div class="header">
          <h1>P.B.I. Labs - Executive Financial Statement</h1>
          <p class="date">Generated on: ${dateStr}</p>
        </div>
        <h2>Income</h2><table><tr><th>Name</th><th>Amount</th></tr>${incomes.map(i => `<tr><td>${i.name}</td><td>$${i.amount}</td></tr>`).join('')}</table>
        <h2>Expenses</h2><table><tr><th>Name</th><th>Amount</th></tr>${expenses.map(e => `<tr><td>${e.name}</td><td>$${e.amount}</td></tr>`).join('')}</table>
        <h2>Assets</h2><table><tr><th>Name</th><th>Value</th></tr>${assets.map(a => `<tr><td>${a.name}</td><td>$${a.amount}</td></tr>`).join('')}</table>
        <h2>Liabilities</h2><table><tr><th>Name</th><th>Value Remaining</th></tr>${liabilities.map(l => `<tr><td>${l.name}</td><td>$${l.amount}</td></tr>`).join('')}</table>
        <div class="total-box"><strong>Net Cash Flow: $${cashFlow.toFixed(2)}</strong><br><strong>Freedom Gauge: ${gaugeValue}%</strong></div>
      </body></html>
    `;
    const blob = new Blob(['\ufeff', docHTML], { type: 'application/msword' });
    saveAs(blob, `PBI_Labs_Statement_${dateStr}.doc`);
  };

  return (
    <div style={{ paddingBottom: '90px', animation: 'fadeIn 0.4s' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px' }}>
        <button onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', backgroundColor: 'var(--export-excel)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}><FaFileExcel /> {language === 'es' ? 'Excel' : 'Excel'}</button>
        <button onClick={exportToWord} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', backgroundColor: 'var(--export-word)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}><FaFileWord /> {language === 'es' ? 'Word' : 'Word'}</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-muted)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{language === 'es' ? 'Medidor de Libertad' : 'Freedom Gauge'}</h3>
          <svg viewBox="0 0 36 36" className="circular-chart">
            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="circle" strokeDasharray={`${gaugeValue}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke={gaugeColor} />
            <text x="18" y="20.35" className="percentage">{gaugeValue}%</text>
          </svg>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '15px' }}>{language === 'es' ? '(Ingreso Pasivo vs Gastos)' : '(Passive Income vs Expenses)'}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>{language === 'es' ? 'Flujo de Caja Neto' : 'Net Cash Flow'}</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: cashFlow >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>${cashFlow.toFixed(2)}</span>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: `1px solid ${wastePercentage > 15 ? 'var(--danger-color)' : 'var(--border-color)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>{language === 'es' ? '% Desperdicio (Compras Únicas)' : 'Waste % (1-Time Buys)'}</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: wastePercentage > 15 ? 'var(--danger-color)' : 'var(--text-color)' }}>{wastePercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};