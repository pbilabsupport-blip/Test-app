import React, { useState, useRef } from 'react';
import { useAppContext } from '../../../../context/AppContext';
import { FiPlus, FiTrash2, FiTarget, FiLock, FiCalendar, FiUpload, FiImage, FiCheckCircle } from 'react-icons/fi';

// Clean curated presets with high-res imagery
const PRESET_IMAGES = [
  { label: 'Real Estate / Casa', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80' },
  { label: 'Dream Car / Auto', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80' },
  { label: 'Freedom / Viaje', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80' },
  { label: 'Debt-Free / Cero Deudas', url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Business / Negocio', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80' }
];

export function VisionBoard({ 
  visionCards = [], 
  setVisionCards, 
  cashFlow = 0,
  showToast 
}) {
  const { language, authSession } = useAppContext();
  const isEs = language === 'es';
  const isPro = authSession?.tier === 'pro';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const buyUrl = process.env.REACT_APP_GUMROAD_URL || 'https://gumroad.com';

  // Form State for new SMART Vision Goal
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState(''); // Format: MM-DD-YYYY
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [imageSourceMode, setImageSourceMode] = useState('upload'); // 'upload' | 'preset'
  const fileInputRef = useRef(null);

  // Free Tier Limit: Max 3 vision items on Free
  const freeLimitReached = !isPro && visionCards.length >= 3;

  const handleOpenAdd = () => {
    if (freeLimitReached) {
      setShowUpgradeModal(true);
    } else {
      setIsModalOpen(true);
    }
  };

  // Direct device photo upload handler (Converts to Base64 for safe cloud saving)
  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert(isEs ? 'La foto no debe superar 3MB.' : 'Photo must be under 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImageUrl(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    const target = Number(targetAmount) || 0;
    const current = Number(currentAmount) || 0;

    const newCard = {
      id: Date.now(),
      title: title.trim(),
      targetAmount: target,
      currentAmount: current,
      targetDate: targetDate.trim(), // MM-DD-YYYY
      imageUrl: imageUrl || PRESET_IMAGES[0].url,
      createdAt: new Date().toISOString()
    };

    setVisionCards([newCard, ...visionCards]);
    setIsModalOpen(false);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setImageUrl(PRESET_IMAGES[0].url);

    if (showToast) {
      showToast(isEs ? '✨ Meta del Tablero de Visión agregada.' : '✨ Vision Board Goal added.');
    }
  };

  const handleDelete = (id) => {
    setVisionCards(visionCards.filter(card => card.id !== id));
    if (showToast) {
      showToast(isEs ? 'Meta eliminada del tablero.' : 'Goal removed from board.');
    }
  };

  const handleAddFunds = (id, amountToAdd) => {
    const val = Number(amountToAdd) || 0;
    if (val <= 0) return;

    setVisionCards(visionCards.map(c => {
      if (c.id === id) {
        const updated = Number(c.currentAmount || 0) + val;
        return { ...c, currentAmount: updated };
      }
      return c;
    }));

    if (showToast) {
      showToast(isEs ? `+$${val} asignados a su visión.` : `+$${val} funded toward your vision.`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🌟</span> {isEs ? 'Tablero de Visión y Metas SMART' : 'Vision Board & SMART Goals'}
          </h2>
          <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isEs 
              ? '“Escribe la visión y haz que resalte en tablas.” — Steve Harvey. Asigne su flujo de caja para materializar sus sueños.' 
              : '"Write the vision and make it plain." — Steve Harvey. Back your dreams with real cash flow.'}
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 22px', 
            background: 'var(--primary-color)', 
            color: '#000', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}>
          {freeLimitReached ? <FiLock /> : <FiPlus />} {isEs ? 'Agregar Sueño / Meta' : 'Add Vision Goal'}
        </button>
      </div>

      {/* Free Tier Capacity Indicator */}
      {!isPro && (
        <div style={{ background: 'var(--card-bg)', padding: '12px 18px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isEs ? `Bóveda Gratis: ${visionCards.length} de 3 visiones activas.` : `Free Vault: ${visionCards.length} of 3 active vision cards used.`}
          </span>
          <button 
            onClick={() => setShowUpgradeModal(true)}
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
            {isEs ? 'Desbloquear Visiones Ilimitadas ($5/mes)' : 'Unlock Unlimited Vision Cards ($5/mo)'}
          </button>
        </div>
      )}

      {/* Vision Cards Grid */}
      {visionCards.length === 0 ? (
        <div style={{ background: 'var(--card-bg)', padding: '50px 20px', borderRadius: '16px', border: '2px dashed var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎯</div>
          <h3 style={{ color: 'var(--text-color)', margin: '0 0 8px 0' }}>
            {isEs ? 'Su Tablero de Visión está vacío' : 'Your Vision Board is Empty'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 20px auto' }}>
            {isEs 
              ? 'Suba fotos del hogar que desea, el viaje que sueña o la deuda que liquidará para comenzar a financiarlo.'
              : 'Upload photos of your dream home, the business you want to launch, or the debt you will conquer.'}
          </p>
          <button 
            onClick={handleOpenAdd}
            style={{ padding: '12px 24px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {isEs ? '+ Crear Primer Sueño' : '+ Create First Vision Goal'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
          {visionCards.map(card => {
            const current = Number(card.currentAmount || 0);
            const target = Number(card.targetAmount || 1);
            const percent = Math.min(Math.round((current / target) * 100), 100);
            const isCompleted = percent >= 100;

            const remaining = Math.max(target - current, 0);
            const monthsToAchieve = cashFlow > 0 ? Math.ceil(remaining / cashFlow) : null;

            return (
              <div 
                key={card.id}
                style={{ 
                  background: 'var(--card-bg)', 
                  borderRadius: '16px', 
                  border: isCompleted ? '2px solid #10b981' : '1px solid var(--border-color)', 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}>
                
                {/* Vision Image Header */}
                <div style={{ height: '190px', width: '100%', position: 'relative', overflow: 'hidden', background: '#000' }}>
                  <img 
                    src={card.imageUrl} 
                    alt={card.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isCompleted ? 0.95 : 0.85 }} 
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }} />
                  
                  {/* Delete button */}
                  <button 
                    onClick={() => handleDelete(card.id)}
                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#ef4444', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                    <FiTrash2 />
                  </button>

                  {/* Completion Badge */}
                  {isCompleted && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', padding: '5px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FiCheckCircle /> {isEs ? '¡100% CUMPLIDO!' : '100% ACHIEVED!'}
                    </div>
                  )}

                  <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 'bold' }}>{card.title}</h3>
                  </div>
                </div>

                {/* Card Content & SMART Details */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, justifyContent: 'space-between' }}>
                  
                  {/* Progress Bar & Percentage */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.35rem', fontWeight: 'bold', color: isCompleted ? '#10b981' : 'var(--primary-color)' }}>
                        ${current.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ ${target.toLocaleString()}</span>
                      </span>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isCompleted ? '#10b981' : 'var(--text-color)' }}>
                        {percent}%
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-color)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: isCompleted ? '#10b981' : 'var(--primary-color)', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>

                  {/* SMART Criteria Tags */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {card.targetDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCalendar style={{ color: 'var(--primary-color)' }} />
                        <span>{isEs ? 'Fecha Meta (MM-DD-YYYY):' : 'Target Date (MM-DD-YYYY):'} <strong>{card.targetDate}</strong></span>
                      </div>
                    )}
                    
                    {!isCompleted && monthsToAchieve !== null && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiTarget style={{ color: '#10b981' }} />
                        <span>
                          {isEs 
                            ? `Alcanzable en ~${monthsToAchieve} mes(es) con su flujo actual.` 
                            : `Achievable in ~${monthsToAchieve} mo(s) with your surplus cash flow.`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Funding Actions */}
                  {!isCompleted ? (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        {isEs ? 'Asignar Dinero a Este Sueño:' : 'Fund This Vision Goal:'}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleAddFunds(card.id, 50)}
                          style={{ flex: 1, padding: '9px', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                          +$50
                        </button>
                        <button 
                          onClick={() => handleAddFunds(card.id, 100)}
                          style={{ flex: 1, padding: '9px', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                          +$100
                        </button>
                        <button 
                          onClick={() => handleAddFunds(card.id, 500)}
                          style={{ flex: 1, padding: '9px', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                          +$500
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      {isEs ? '🎉 ¡Felicidades! Meta 100% financiada.' : '🎉 Congratulations! 100% Funded.'}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add New SMART Vision Goal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '28px', borderRadius: '16px', maxWidth: '520px', width: '100%', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--primary-color)', margin: '0 0 8px 0', fontSize: '1.3rem' }}>
              {isEs ? 'Crear Meta SMART de Visión' : 'Create SMART Vision Goal'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              {isEs ? 'Escriba la visión claramente y asígnele una imagen real.' : 'Write down your vision clearly and attach an image to it.'}
            </p>

            <form onSubmit={handleSaveGoal} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  {isEs ? 'S (Específico): Nombre del Sueño o Meta' : 'S (Specific): Name of Dream or Goal'}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder={isEs ? 'Ej: Casa de Playa / Fondo de Emergencia' : 'e.g., Beach House / Emergency Fund'} 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    {isEs ? 'M (Monto Meta $)' : 'M (Target Amount $)'}
                  </label>
                  <input 
                    type="number" 
                    required
                    placeholder="15000" 
                    value={targetAmount} 
                    onChange={e => setTargetAmount(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    {isEs ? 'Ahorro Actual ($)' : 'Current Saved ($)'}
                  </label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={currentAmount} 
                    onChange={e => setCurrentAmount(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  {isEs ? 'T (Tiempo Límite): Formato MM-DD-YYYY' : 'T (Time-Bound): MM-DD-YYYY Format'}
                </label>
                <input 
                  type="text" 
                  placeholder="12-31-2027" 
                  value={targetDate} 
                  onChange={e => setTargetDate(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px' }} 
                />
              </div>

              {/* R (RELEVANT): PHOTO SELECTION SYSTEM */}
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  {isEs ? 'R (Relevante): Foto de Inspiración' : 'R (Relevant): Inspiration Photo'}
                </label>

                {/* Mode Selector Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setImageSourceMode('upload')}
                    style={{ flex: 1, padding: '8px', background: imageSourceMode === 'upload' ? 'var(--primary-color)' : 'var(--bg-color)', color: imageSourceMode === 'upload' ? '#000' : 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}>
                    <FiUpload /> {isEs ? 'Subir de mi Dispositivo' : 'Upload from Device'}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setImageSourceMode('preset')}
                    style={{ flex: 1, padding: '8px', background: imageSourceMode === 'preset' ? 'var(--primary-color)' : 'var(--bg-color)', color: imageSourceMode === 'preset' ? '#000' : 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}>
                    <FiImage /> {isEs ? 'Elegir Ejemplo' : 'Choose Preset'}
                  </button>
                </div>

                {/* Option A: Direct Device Upload */}
                {imageSourceMode === 'upload' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }} 
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      style={{ width: '100%', padding: '16px', background: 'var(--bg-color)', border: '2px dashed var(--primary-color)', borderRadius: '8px', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <FiUpload style={{ fontSize: '1.4rem', color: 'var(--primary-color)' }} />
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {isEs ? 'Tocar para seleccionar foto de su galería o archivos' : 'Click to select photo from your phone or PC'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG (máx. 3MB)</span>
                    </button>
                  </div>
                )}

                {/* Option B: Clean Preset Thumbnails Grid */}
                {imageSourceMode === 'preset' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                    {PRESET_IMAGES.map((preset, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setImageUrl(preset.url)}
                        style={{ 
                          position: 'relative', 
                          height: '70px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          cursor: 'pointer', 
                          border: imageUrl === preset.url ? '3px solid var(--primary-color)' : '1px solid var(--border-color)' 
                        }}>
                        <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', textAlign: 'center' }}>
                          <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>{preset.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Live Preview Box */}
                {imageUrl && (
                  <div style={{ marginTop: '10px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: '6px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>
                      {isEs ? 'Vista previa seleccionada' : 'Selected Preview'}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '14px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {isEs ? 'Guardar en mi Visión' : 'Save to Vision Board'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '14px 20px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade Modal for Unlimited Vision Cards */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', maxWidth: '480px', width: '100%', border: '2px solid var(--primary-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🌟</div>
            <h2 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0' }}>
              {isEs ? 'Tablero de Visión Ilimitado' : 'Unlimited Vision Board'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}>
              {isEs 
                ? 'La versión gratis cubre hasta 3 visiones. Desbloquee visiones ilimitadas, lista de 100 sueños de Steve Harvey y su Asistente AI personal con Pro ($5.00/mes).'
                : 'Free accounts cover up to 3 vision cards. Unlock unlimited vision cards, the full 100-item Steve Harvey life list, and your personal AI CFO with Pro ($5.00/mo).'}
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

export default VisionBoard;