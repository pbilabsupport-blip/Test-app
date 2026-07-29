import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import PrivacyPolicy from '../legal/PrivacyPolicy';
import TermsOfService from '../legal/TermsOfService';
import AboutUs from '../legal/AboutUs';
import ContactUs from '../legal/ContactUs';

export default function PublicMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'privacy', 'terms', 'about', 'contact'
  const { language } = useAppContext();

  const labels = {
    menu: language === 'es' ? '☰ Menú' : '☰ Menu',
    about: language === 'es' ? 'Sobre Nosotros' : 'About Us',
    privacy: language === 'es' ? 'Política de Privacidad' : 'Privacy Policy',
    terms: language === 'es' ? 'Términos de Servicio' : 'Terms of Service',
    contact: language === 'es' ? 'Contacto' : 'Contact Us',
    close: language === 'es' ? 'Cerrar' : 'Close'
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{
          padding: '8px 14px',
          backgroundColor: 'var(--card-bg, #ffffff)',
          color: 'var(--text-color, #111827)',
          border: '1px solid var(--border-color, #d1d5db)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}
      >
        {labels.menu}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '110%',
          width: '200px',
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e5e7eb)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <button 
            onClick={() => { setActiveModal('about'); setIsOpen(false); }}
            style={menuItemStyle}
          >
            {labels.about}
          </button>
          <button 
            onClick={() => { setActiveModal('privacy'); setIsOpen(false); }}
            style={menuItemStyle}
          >
            {labels.privacy}
          </button>
          <button 
            onClick={() => { setActiveModal('terms'); setIsOpen(false); }}
            style={menuItemStyle}
          >
            {labels.terms}
          </button>
          <button 
            onClick={() => { setActiveModal('contact'); setIsOpen(false); }}
            style={menuItemStyle}
          >
            {labels.contact}
          </button>
        </div>
      )}

      {/* Legal Content Overlay Modals */}
      {activeModal && (
        <div style={modalBackdropStyle} onClick={closeModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
              <button onClick={closeModal} style={closeButtonStyle}>
                {labels.close} ✕
              </button>
            </div>
            {activeModal === 'about' && <AboutUs />}
            {activeModal === 'privacy' && <PrivacyPolicy />}
            {activeModal === 'terms' && <TermsOfService />}
            {activeModal === 'contact' && <ContactUs />}
          </div>
        </div>
      )}
    </div>
  );
}

const menuItemStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid var(--border-color, #f3f4f6)',
  color: 'var(--text-color, #111827)',
  cursor: 'pointer',
  fontSize: '0.9rem',
  width: '100%'
};

const modalBackdropStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10000,
  padding: '20px'
};

const modalContentStyle = {
  backgroundColor: 'var(--card-bg, #ffffff)',
  color: 'var(--text-color, #111827)',
  padding: '24px',
  borderRadius: '12px',
  maxWidth: '650px',
  width: '100%',
  maxHeight: '80vh',
  overflowY: 'auto',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
};

const closeButtonStyle = {
  backgroundColor: '#ef4444',
  color: '#ffffff',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
};