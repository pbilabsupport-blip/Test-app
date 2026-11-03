import React, { useState, useRef } from 'react';
import { useAppContext } from '../../../../context/AppContext';
import { FiPlus, FiCheckCircle, FiAward, FiCalendar, FiTrash2, FiLock, FiRotateCw, FiCornerDownLeft } from 'react-icons/fi';

// Audio Chime for Manifested Dreams
function playVictoryChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
    osc.frequency.exponentialRampToValueAtTime(554.37, ctx.currentTime + 0.12); // C#5
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.24); // E5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.7);
  } catch (e) {
    // Audio context safely ignored if blocked
  }
}

function getTodayMMDDYYYY() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export function LifeList({ 
  lifeList = [], 
  setLifeList, 
  showToast 
}) {
  const { language, authSession } = useAppContext();
  const isEs = language === 'es';
  const isPro = authSession?.tier === 'pro';

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'victory_wall'

  // Rapid-Fire Inline State
  const [rapidText, setRapidText] = useState('');
  const [rapidCategory, setRapidCategory] = useState('Personal');
  const rapidInputRef = useRef(null);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const buyUrl = process.env.REACT_APP_GUMROAD_URL || 'https://gumroad.com';

  const [claimingItem, setClaimingItem] = useState(null);
  const [claimDate, setClaimDate] = useState(getTodayMMDDYYYY());

  // Filter items by selected year
  const yearItems = lifeList.filter(item => (Number(item.year) || currentYear) === selectedYear);
  const completedItems = yearItems.filter(item => item.isCompleted);
  const pendingItems = yearItems.filter(item => !item.isCompleted);

  // Free Tier Limit: Max 10 items per year on Free
  const freeLimitReached = !isPro && yearItems.length >= 10;

  // RAPID-FIRE INLINE ENTRY: Type dream and press Enter
  const handleRapidAdd = (e) => {
    if (e) e.preventDefault();
    if (!rapidText.trim()) return;

    if (freeLimitReached) {
      setShowUpgradeModal(true);
      return;
    }

    const newItem = {
      id: Date.now(),
      text: rapidText.trim(),
      category: rapidCategory,
      year: selectedYear,
      isCompleted: false,
      completedDate: '',
      createdAt: new Date().toISOString()
    };

    setLifeList([...lifeList, newItem]);
    setRapidText('');
    if (rapidInputRef.current) rapidInputRef.current.focus();

    if (showToast) {
      showToast(isEs ? '✍️ Sueño agregado a la lista.' : '✍️ Dream added to your list.');
    }
  };

  const handleConfirmClaim = () => {
    if (!claimingItem) return;

    setLifeList(lifeList.map(item => {
      if (item.id === claimingItem.id) {
        return {
          ...item,
          isCompleted: true,
          completedDate: claimDate || getTodayMMDDYYYY()
        };
      }
      return item;
    }));

    playVictoryChime();
    setClaimingItem(null);
    if (showToast) {
      showToast(isEs ? '🏆 ¡VICTORIA! Sueño cumplido y guardado en su Muro de la Victoria.' : '🏆 VICTORY! Dream claimed and preserved in your Victory Wall.');
    }
  };

  const handleDelete = (id) => {
    setLifeList(lifeList.filter(item => item.id !== id));
    if (showToast) {
      showToast(isEs ? 'Registro eliminado.' : 'Item removed.');
    }
  };

  // New Year Rollover
  const handleRollover = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    const nextYear = selectedYear + 1;
    const itemsToRollover = pendingItems.map(item => ({
      ...item,
      id: Date.now() + Math.random(),
      year: nextYear,
      isCompleted: false,
      completedDate: ''
    }));

    setLifeList([...lifeList, ...itemsToRollover]);
    setSelectedYear(nextYear);
    if (showToast) {
      showToast(isEs 
        ? `🔄 ${itemsToRollover.length} sueños pendientes transferidos a su lista de ${nextYear}.` 
        : `🔄 ${itemsToRollover.length} uncompleted dreams rolled over to your ${nextYear} list.`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📜</span> {isEs ? `Lista de 100 Sueños (${selectedYear})` : `${selectedYear} 100-Item Life List`}
          </h2>
          <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isEs 
              ? '“Escriba 100 cosas que desea en su vida este año. Léalas con frecuencia y táchelas cuando sucedan.” — Steve Harvey.' 
              : '"Write down 100 things you want in your life this year. Read them often, and cross them off as they happen." — Steve Harvey.'}
          </p>
        </div>

        <button 
          onClick={() => setIsReviewOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'var(--card-bg)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
          <FiAward /> {isEs ? 'Revisión Anual' : 'Annual Review'}
        </button>
      </div>

      {/* Annual Progress Meter */}
      <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {completedItems.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {isPro ? '100' : '10'} {isEs ? 'Victorias Conseguidas' : 'Victories Claimed'}</span>
            </span>
          </div>

          {/* Year Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{isEs ? 'Año:' : 'Year:'}</span>
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(Number(e.target.value))}
              style={{ padding: '6px 12px', background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              <option value={currentYear - 1}>{currentYear - 1}</option>
              <option value={currentYear}>{currentYear}</option>
              <option value={currentYear + 1}>{currentYear + 1}</option>
            </select>
          </div>
        </div>

        <div style={{ width: '100%', height: '10px', background: 'var(--bg-color)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <div style={{ width: `${Math.min(Math.round((completedItems.length / (isPro ? 100 : 10)) * 100), 100)}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)', transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* RAPID-FIRE INLINE ENTRY BAR: Fast, no-popup notepad entry */}
      <form onSubmit={handleRapidAdd} style={{ background: 'var(--card-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '0.9rem', paddingLeft: '6px' }}>
          #{yearItems.length + 1}
        </span>
        <input 
          ref={rapidInputRef}
          type="text" 
          value={rapidText}
          onChange={e => setRapidText(e.target.value)}
          placeholder={isEs ? 'Escriba un sueño y presione Enter (ej: Viajar a París, Comprar una casa)...' : 'Type a dream and press Enter (e.g., Trip to Paris, Buy a house)...'}
          style={{ flex: 1, minWidth: '220px', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
        />
        <select 
          value={rapidCategory} 
          onChange={e => setRapidCategory(e.target.value)}
          style={{ padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
          <option value="Personal">Personal / Lifestyle</option>
          <option value="Financial">Financial / Money</option>
          <option value="Family">Family / Relationships</option>
          <option value="Career">Career / Business</option>
          <option value="Spiritual">Health / Spiritual</option>
        </select>
        <button 
          type="submit" 
          style={{ padding: '12px 20px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <FiCornerDownLeft /> {isEs ? 'Agregar' : 'Add'}
        </button>
      </form>

      {/* Sub Navigation: The Active List vs. Victory Wall */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('list')}
          style={{ padding: '8px 18px', background: activeTab === 'list' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'list' ? '#000' : 'var(--text-color)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          {isEs ? `Lista de Sueños (${pendingItems.length})` : `Dreams in Progress (${pendingItems.length})`}
        </button>

        <button 
          onClick={() => setActiveTab('victory_wall')}
          style={{ padding: '8px 18px', background: activeTab === 'victory_wall' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'victory_wall' ? '#000' : 'var(--text-color)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiAward /> {isEs ? `Muro de la Victoria (${completedItems.length})` : `Victory Wall (${completedItems.length})`}
        </button>
      </div>

      {/* VIEW 1: ACTIVE DREAMS CHECKLIST */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pendingItems.length === 0 ? (
            <div style={{ background: 'var(--card-bg)', padding: '40px 20px', borderRadius: '14px', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                {isEs ? `Use la barra superior para escribir sus sueños para ${selectedYear}.` : `Use the bar above to write your dreams for ${selectedYear}.`}
              </p>
            </div>
          ) : (
            pendingItems.map((item, idx) => (
              <div 
                key={item.id}
                style={{ background: 'var(--card-bg)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 'bold', minWidth: '25px' }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '1rem', color: 'var(--text-color)', fontWeight: '500' }}>{item.text}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-color)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'inline-block', marginTop: '3px' }}>
                      {item.category}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    onClick={() => { setClaimingItem(item); setClaimDate(getTodayMMDDYYYY()); }}
                    style={{ padding: '8px 14px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiCheckCircle /> {isEs ? '¡Cumplido!' : 'Claim Victory'}
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: THE VICTORY WALL (Trophy Room) */}
      {activeTab === 'victory_wall' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {completedItems.length === 0 ? (
            <div style={{ background: 'var(--card-bg)', padding: '40px 20px', borderRadius: '14px', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏆</div>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                {isEs 
                  ? 'Aún no ha marcado sueños cumplidos este año. ¡Cuando suceda, márquelo y se inmortalizará aquí!' 
                  : 'No victories claimed yet this year. When a dream happens, claim it and it will be preserved here forever!'}
              </p>
            </div>
          ) : (
            completedItems.map((item) => (
              <div 
                key={item.id}
                style={{ background: 'var(--card-bg)', padding: '16px 20px', borderRadius: '12px', border: '1px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.2rem', color: '#10b981' }}>🏆</span>
                  <div>
                    <div style={{ fontSize: '1rem', color: 'var(--text-color)', fontWeight: 'bold', textDecoration: 'line-through' }}>
                      {item.text}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '3px' }}>
                      {isEs ? 'Completado el (MM-DD-YYYY):' : 'Manifested on (MM-DD-YYYY):'} <strong>{item.completedDate}</strong>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Claim Victory Date Confirmation */}
      {claimingItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '28px', borderRadius: '16px', maxWidth: '440px', width: '100%', border: '2px solid #10b981', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
            <h3 style={{ color: '#10b981', margin: '0 0 10px 0' }}>
              {isEs ? '¡Reclamar Victoria!' : 'Claim Your Victory!'}
            </h3>
            <p style={{ color: 'var(--text-color)', fontWeight: 'bold', marginBottom: '15px' }}>
              "{claimingItem.text}"
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '15px' }}>
              {isEs ? '¿En qué fecha se cumplió? (Formato MM-DD-YYYY):' : 'What date was this accomplished? (MM-DD-YYYY):'}
            </p>

            <input 
              type="text" 
              value={claimDate} 
              onChange={e => setClaimDate(e.target.value)}
              placeholder="MM-DD-YYYY"
              style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '15px' }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleConfirmClaim}
                style={{ flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isEs ? 'Confirmar Victoria' : 'Confirm Victory'}
              </button>
              <button 
                onClick={() => setClaimingItem(null)}
                style={{ padding: '12px 18px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Annual Review Scorecard & Rollover */}
      {isReviewOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', maxWidth: '520px', width: '100%', border: '2px solid var(--primary-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🌟</div>
            <h2 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0' }}>
              {isEs ? `Balance Anual ${selectedYear}` : `${selectedYear} Annual Review`}
            </h2>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', margin: '15px 0' }}>
              {completedItems.length} / {yearItems.length} {isEs ? 'Victorias Conseguidas' : 'Victories Achieved'}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}>
              {isEs 
                ? `En ${selectedYear}, usted materializó ${completedItems.length} metas de su lista. Todo lo que no se cumplió puede transferirse automáticamente al año siguiente.` 
                : `In ${selectedYear}, you manifested ${completedItems.length} goals from your list. Everything left over can easily roll forward to next year.`}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={handleRollover}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>
                <FiRotateCw /> {isEs ? `Transferir pendientes a ${selectedYear + 1}` : `Roll Over Remaining to ${selectedYear + 1}`}
              </button>
              <button 
                onClick={() => setIsReviewOpen(false)}
                style={{ padding: '12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                {isEs ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal for Unlimited 100-Item List */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', maxWidth: '480px', width: '100%', border: '2px solid var(--primary-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📜</div>
            <h2 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0' }}>
              {isEs ? 'Lista Completa de 100 Sueños' : 'Full 100-Item Life List'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}>
              {isEs 
                ? 'La versión gratis cubre hasta 10 sueños por año. Desbloquee los 100 sueños completos de Steve Harvey, transferencias anuales y Muro de la Victoria ilimitado con Pro ($5.00/mes).'
                : 'Free accounts cover up to 10 dreams per year. Unlock the complete 100-item Steve Harvey list, annual rollovers, and permanent Victory Wall with Pro ($5.00/mo).'}
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
                {isEs ? 'Continuar en Bóveda Gratis' : 'Continue on Free Vault'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default LifeList;