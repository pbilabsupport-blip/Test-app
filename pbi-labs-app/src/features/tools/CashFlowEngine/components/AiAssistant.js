import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../../../context/AppContext';
import { FiX, FiSend, FiMic, FiMicOff, FiSettings, FiVolume2, FiVolumeX, FiLock, FiExternalLink, FiZap } from 'react-icons/fi';

// Provider Definitions & Free Daily Limits
const PROVIDERS = {
  groq: {
    name: 'GroqCloud',
    badge: '100% Free Forever (14,400/day)',
    model: 'llama-3.3-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    keyLink: 'https://console.groq.com/keys',
    keyPrefix: 'gsk_...',
    infoEs: '⚡ Recomendado: 14,400 preguntas gratis que se recargan cada 24 horas. Regístrese con Google, sin tarjeta de crédito.',
    infoEn: '⚡ Recommended: 14,400 free questions reset every 24 hours. Sign in with Google, zero credit card required.'
  },
  gemini: {
    name: 'Google Gemini',
    badge: '100% Free Forever (1,500/day)',
    model: 'gemini-1.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    keyLink: 'https://aistudio.google.com/app/apikey',
    keyPrefix: 'AIzaSy...',
    infoEs: '🧠 Google AI Studio: 1,500 preguntas gratis cada 24 horas sin tarjeta de crédito.',
    infoEn: '🧠 Google AI Studio: 1,500 free questions reset every 24 hours, zero credit card needed.'
  },
  openai: {
    name: 'OpenAI',
    badge: 'Bring Your Own Key',
    model: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    keyLink: 'https://platform.openai.com/api-keys',
    keyPrefix: 'sk-proj-...',
    infoEs: '🤖 Clave estándar de OpenAI (se consumen créditos de su cuenta de desarrollador).',
    infoEn: '🤖 Standard OpenAI developer key (consumes credits from your OpenAI account).'
  }
};

export function AiAssistant({ 
  isOpen, 
  onClose, 
  incomes = [], 
  expenses = [], 
  assets = [], 
  liabilities = [], 
  cashFlow = 0, 
  gaugeValue = 0,
  freedomDateStr = '',
  visionCards = [], 
  lifeList = [] 
}) {
  const { language, authSession } = useAppContext();
  const isEs = language === 'es';
  const isPro = authSession?.tier === 'pro';
  const buyUrl = process.env.REACT_APP_GUMROAD_URL || 'https://gumroad.com';

  // Assistant Configuration (Stored locally on user device for 100% privacy)
  const [provider, setProvider] = useState(() => localStorage.getItem('pbi_ai_provider') || 'groq');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('pbi_ai_api_key') || '');
  const [nickname, setNickname] = useState(() => localStorage.getItem('pbi_ai_nickname') || (isEs ? 'Mi Asesor CFO' : 'My AI CFO'));
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(() => localStorage.getItem('pbi_ai_voice_out') === 'true');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: isEs
        ? `Hola, soy tu estratega financiero personal y coach de vida. Conozco tus números, tus deudas y tus metas en el Tablero de Visión. ¿En qué te puedo asesorar hoy?`
        : `Hello, I am your personal financial strategist and life coach. I have full visibility of your cash flow, debts, and Vision Board goals. How can I guide you today?`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('pbi_ai_provider', provider);
    localStorage.setItem('pbi_ai_api_key', apiKey.trim());
    localStorage.setItem('pbi_ai_nickname', nickname.trim());
    localStorage.setItem('pbi_ai_voice_out', isVoiceOutputEnabled.toString());
    setIsSettingsOpen(false);
  };

  // Browser Text-to-Speech (Speaks aloud)
  const speakAloud = (text) => {
    if (!isVoiceOutputEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isEs ? 'es-ES' : 'en-US';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // Browser Speech-to-Text (Listens via Microphone)
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isEs ? 'Su navegador no soporta reconocimiento de voz.' : 'Voice recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isEs ? 'es-ES' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
    };

    recognition.start();
  };

  // Build the Grounded Vault Context for the AI
  const constructSystemPrompt = () => {
    const totalIncome = incomes.reduce((acc, c) => acc + Number(c.amount || 0), 0);
    const totalExpense = expenses.reduce((acc, c) => acc + Number(c.amount || 0), 0);
    const totalAssets = assets.reduce((acc, c) => acc + Number(c.amount || 0), 0);
    const totalDebts = liabilities.reduce((acc, c) => acc + Number(c.amount || 0), 0);

    const debtSummary = liabilities.map(l => 
      `- ${l.name}: $${Number(l.amount).toLocaleString()} balance (Payment: $${l.paymentAmount || 0}/mo, Due: ${l.nextDate || 'N/A'})`
    ).join('\n') || 'No active debts.';

    const visionSummary = visionCards.map(v => 
      `- ${v.title}: Target $${Number(v.targetAmount).toLocaleString()} (Saved: $${Number(v.currentAmount || 0).toLocaleString()}, Target Date: ${v.targetDate || 'N/A'})`
    ).join('\n') || 'No vision goals yet.';

    const dreamsSummary = lifeList.filter(d => !d.isCompleted).slice(0, 5).map(d => 
      `- ${d.text} (${d.category})`
    ).join('\n') || 'No active dreams.';

    return `
You are ${nickname}, an elite executive financial strategist and personal life coach inside the P.B.I. Labs Vault.
Your purpose: Help the user build cash flow, eliminate debt strategically, and achieve their life vision inspired by Robert Kiyosaki and Steve Harvey.

LANGUAGE RULE: Answer fluently in ${isEs ? 'SPANISH' : 'ENGLISH'}.
TONE: Confident, encouraging, highly analytical, and direct. Keep responses structured and concise.

LIVE FINANCIAL PROFILE OF THIS USER:
- Monthly Net Cash Flow: $${cashFlow.toLocaleString()}
- Total Monthly Income: $${totalIncome.toLocaleString()}
- Total Monthly Expenses: $${totalExpense.toLocaleString()}
- Freedom Index: ${gaugeValue}% of expenses covered by passive income
- Projected Freedom Date: ${freedomDateStr || 'Under calculation'}
- Total Assets Value: $${totalAssets.toLocaleString()}
- Total Liabilities / Debts: $${totalDebts.toLocaleString()}

ACTIVE DEBTS:
${debtSummary}

TOP VISION BOARD GOALS:
${visionSummary}

100-ITEM LIFE LIST GOALS IN PROGRESS:
${dreamsSummary}

STRICT INSTRUCTIONS:
1. Ground your advice directly in the numbers above.
2. If asked if they can afford something, analyze their current $${cashFlow.toLocaleString()} monthly cash flow and upcoming debt payments.
3. If asked about debts, recommend the Snowball or Avalanche method based on their specific debts.
4. Keep answers under 3 concise paragraphs or bullet points. Do not answer off-topic general trivia.
`;
  };

  // Send Message to Selected Provider
  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    if (!apiKey.trim()) {
      setIsSettingsOpen(true);
      return;
    }

    const currentProviderConfig = PROVIDERS[provider] || PROVIDERS.groq;

    const userMsg = { role: 'user', content: textToSend.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(currentProviderConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: currentProviderConfig.model,
          messages: [
            { role: 'system', content: constructSystemPrompt() },
            ...updatedMessages.slice(-6) // Keep last 6 exchanges for context
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'API error');
      }

      const aiReply = data.choices[0].message.content;
      setMessages([...updatedMessages, { role: 'assistant', content: aiReply }]);
      speakAloud(aiReply);
    } catch (err) {
      const errorMsg = isEs
        ? `Error de conexión con ${currentProviderConfig.name}: Verifique su clave API en la configuración (⚙️). Detalle: ${err.message}`
        : `Connection error with ${currentProviderConfig.name}: Please check your API key in settings (⚙️). Detail: ${err.message}`;
      setMessages([...updatedMessages, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000, padding: '15px' }}>
      
      {/* Main Assistant Modal */}
      <div style={{ background: 'var(--card-bg)', width: '100%', maxWidth: '640px', height: '88vh', borderRadius: '18px', border: '2px solid var(--primary-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'fadeIn 0.25s ease' }}>
        
        {/* Header Bar */}
        <div style={{ background: 'var(--bg-color)', padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-color)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
              🤖
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {nickname}
                <span style={{ fontSize: '0.7rem', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--primary-color)', padding: '2px 6px', borderRadius: '8px', fontWeight: 'bold' }}>PRO</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {PROVIDERS[provider]?.name} · {isEs ? 'Recarga Gratis Diaria' : 'Free Daily Resets'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isPro && (
              <>
                <button 
                  onClick={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)} 
                  title={isVoiceOutputEnabled ? 'Voice output on' : 'Voice output muted'}
                  style={{ background: 'none', border: 'none', color: isVoiceOutputEnabled ? 'var(--primary-color)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '6px' }}>
                  {isVoiceOutputEnabled ? <FiVolume2 /> : <FiVolumeX />}
                </button>
                <button 
                  onClick={() => setIsSettingsOpen(true)} 
                  title="Configure API key and nickname"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '6px' }}>
                  <FiSettings />
                </button>
              </>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.3rem', padding: '6px' }}>
              <FiX />
            </button>
          </div>
        </div>

        {/* PRO GATING CHECK */}
        {!isPro ? (
          <div style={{ flex: 1, padding: '40px 25px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
            <div style={{ fontSize: '3rem', color: 'var(--primary-color)' }}><FiLock /></div>
            <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>
              {isEs ? 'Asistente Personal AI CFO (Función Pro)' : 'Personal AI CFO Assistant (Pro Feature)'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', lineHeight: '1.6', margin: 0 }}>
              {isEs 
                ? 'Conéctese con su estratega financiero personal. Utilice claves de IA gratuitas que se recargan cada 24 horas (sin costo de API para usted), hable con su voz y reciba consejos basados en sus números reales por $5.00/mes.'
                : 'Connect with your private financial strategist. Use 100% free daily AI keys that reset every 24 hours (zero extra API cost for you), talk with your voice, and get actionable coaching grounded in your vault for $5.00/mo.'}
            </p>
            <a 
              href={buyUrl} 
              target="_blank" 
              rel="noreferrer"
              style={{ marginTop: '10px', padding: '14px 28px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem' }}>
              {isEs ? 'Desbloquear Pro por $5/mes' : 'Unlock Pro for $5/mo'}
            </a>
          </div>
        ) : (
          <>
            {/* Chat Messages Body */}
            <div style={{ flex: 1, padding: '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Notice if API key is missing */}
              {!apiKey && (
                <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary-color)', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span>
                    🔑 {isEs ? 'Obtenga su clave gratuita que se recarga cada 24 horas en ajustes.' : 'Get your free 24-hour renewing key in settings.'}
                  </span>
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    style={{ background: 'var(--primary-color)', color: '#000', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>
                    {isEs ? 'Obtener Clave Gratis' : 'Get Free Key'}
                  </button>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' 
                  }}>
                  <div style={{ 
                    maxWidth: '82%', 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    background: msg.role === 'user' ? 'var(--primary-color)' : 'var(--bg-color)', 
                    color: msg.role === 'user' ? '#000' : 'var(--text-color)', 
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                    fontSize: '0.92rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <span>🤖 {nickname} ({PROVIDERS[provider]?.name}) {isEs ? 'está analizando su bóveda...' : 'is analyzing your vault...'}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestion Pills */}
            <div style={{ padding: '8px 16px', display: 'flex', gap: '8px', overflowX: 'auto', background: 'var(--bg-color)', borderTop: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => handleSendMessage(isEs ? '¿Cómo puedo pagar mis deudas más rápido?' : 'Which debt should I attack first?')}
                style={{ whiteSpace: 'nowrap', padding: '6px 12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '14px', fontSize: '0.75rem', cursor: 'pointer' }}>
                💡 {isEs ? '¿Qué deuda pago primero?' : 'Which debt first?'}
              </button>
              <button 
                onClick={() => handleSendMessage(isEs ? '¿Puedo permitirme gastar $200 este fin de semana?' : 'Can I afford to spend $200 this weekend?')}
                style={{ whiteSpace: 'nowrap', padding: '6px 12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '14px', fontSize: '0.75rem', cursor: 'pointer' }}>
                💳 {isEs ? '¿Puedo gastar $200 hoy?' : 'Can I spend $200 today?'}
              </button>
              <button 
                onClick={() => handleSendMessage(isEs ? '¿Cómo acelero mi fecha de libertad financiera?' : 'How do I speed up my Freedom Date?')}
                style={{ whiteSpace: 'nowrap', padding: '6px 12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '14px', fontSize: '0.75rem', cursor: 'pointer' }}>
                ⏳ {isEs ? 'Acelerar libertad' : 'Speed up Freedom Date'}
              </button>
            </div>

            {/* Input Bar */}
            <div style={{ padding: '14px 16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                type="button"
                onClick={handleToggleVoiceInput}
                title="Speak to Assistant"
                style={{ padding: '12px', background: isListening ? '#ef4444' : 'var(--input-bg)', color: isListening ? '#fff' : 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isListening ? <FiMicOff /> : <FiMic />}
              </button>

              <input 
                type="text" 
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={isListening ? (isEs ? 'Escuchando tu voz...' : 'Listening to your voice...') : (isEs ? `Pregúntale a ${nickname}...` : `Ask ${nickname}...`)}
                style={{ flex: 1, padding: '12px 14px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '10px', fontSize: '0.95rem', outline: 'none' }}
              />

              <button 
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                style={{ padding: '12px 18px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiSend />
              </button>
            </div>
          </>
        )}

      </div>

      {/* Settings Modal (Multi-Provider: Groq Free / Gemini Free / OpenAI) */}
      {isSettingsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, padding: '20px' }}>
          <div style={{ background: 'var(--card-bg)', padding: '28px', borderRadius: '16px', maxWidth: '480px', width: '100%', border: '2px solid var(--primary-color)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSettings /> {isEs ? 'Configuración de Asistente AI' : 'AI Assistant Settings'}
            </h3>
            
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Nickname Input */}
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  {isEs ? 'Apodo de su Asistente' : 'Assistant Nickname'}
                </label>
                <input 
                  type="text" 
                  value={nickname} 
                  onChange={e => setNickname(e.target.value)}
                  placeholder="e.g. Coach Steve, Jarvis, My CFO"
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px' }}
                />
              </div>

              {/* Provider Selector Tabs */}
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  {isEs ? 'Proveedor de Inteligencia Artificial' : 'AI Engine Provider'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  {Object.keys(PROVIDERS).map((key) => {
                    const p = PROVIDERS[key];
                    const isSelected = provider === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setProvider(key); setApiKey(''); }}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-color)',
                          color: isSelected ? 'var(--primary-color)' : 'var(--text-color)',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}>
                        {p.name}
                        {key === 'groq' && <div style={{ fontSize: '0.65rem', color: '#10b981' }}>⚡ 100% Free Daily</div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Provider Info Alert Box */}
              <div style={{ background: 'var(--bg-color)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {isEs ? PROVIDERS[provider]?.infoEs : PROVIDERS[provider]?.infoEn}
              </div>

              {/* API Key Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {PROVIDERS[provider]?.name} API Key
                  </label>
                  <a 
                    href={PROVIDERS[provider]?.keyLink} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                    {isEs ? 'Obtener clave gratis aquí' : 'Get free key here'} <FiExternalLink />
                  </a>
                </div>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={PROVIDERS[provider]?.keyPrefix}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', fontFamily: 'monospace' }}
                />
              </div>

              {/* Voice Output Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem' }}>
                  🗣️ {isEs ? 'Respuesta con Voz (Hablar en voz alta)' : 'Voice Audio Response'}
                </span>
                <input 
                  type="checkbox" 
                  checked={isVoiceOutputEnabled} 
                  onChange={e => setIsVoiceOutputEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '12px', background: 'var(--primary-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {isEs ? 'Guardar Configuración' : 'Save Settings'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsSettingsOpen(false)}
                  style={{ padding: '12px 16px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AiAssistant;