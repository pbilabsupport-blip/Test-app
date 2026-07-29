import React from 'react';
import { useAppContext } from '../context/AppContext';
import { FaTimes, FaShieldAlt, FaKey, FaDesktop } from 'react-icons/fa';

export default function ToolHelpModal({ onClose }) {
  const { language } = useAppContext();
  const isEs = language === 'es';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        color: 'var(--text-color, #111827)',
        padding: '32px',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        position: 'relative',
        boxSizing: 'border-box',
        textAlign: 'left'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #6b7280)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
        >
          <FaTimes />
        </button>

        {/* Title */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaShieldAlt color="#d97706" /> {isEs ? 'Centro de Ayuda y Manual del Sistema' : 'System Help & Manual'}
        </h2>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #6b7280)', lineHeight: '1.6', marginBottom: '20px' }}>
          {isEs 
            ? 'Este software opera bajo los principios de educación financiera de Robert Kiyosaki (Padre Rico, Padre Pobre), diseñado para automatizar la gestión de activos, pasivos y flujo de efectivo con cero costos operativos.' 
            : 'This software operates under Robert Kiyosaki\'s Rich Dad financial education principles, designed to automate asset, liability, and cash flow management with zero overhead.'}
        </p>

        {/* Instructions Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem', lineHeight: '1.5' }}>
          
          <div style={{ padding: '14px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaKey color="#2563eb" /> {isEs ? '1. Activación y Licenciamiento Pro' : '1. Pro License Activation'}
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {isEs 
                ? 'Ingrese su clave de licencia de Gumroad para desencriptar la bóveda. El sistema restringe automáticamente el uso a un máximo de 2 dispositivos simultáneos.' 
                : 'Enter your Gumroad license key to decrypt the vault. The system automatically restricts usage to a maximum of 2 simultaneous devices.'}
            </p>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaDesktop color="#10b981" /> {isEs ? '2. Recuperación por Dispositivo Perdido' : '2. Lost Device Recovery'}
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              {isEs 
                ? 'Si necesita cambiar de dispositivo, utilice la función "¿Dispositivo Perdido?". Se enviará un código OTP de 6 dígitos a su correo vía Brevo que liberará todos los asientos activos al instante.' 
                : 'If you need to switch devices, use the "Lost Device?" feature. A 6-digit OTP code will be emailed via Brevo to instantly release all active seats.'}
            </p>
          </div>

        </div>

        {/* Footer Action */}
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4b5563',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isEs ? 'Entendido' : 'Got it'}
          </button>
        </div>

      </div>
    </div>
  );
}