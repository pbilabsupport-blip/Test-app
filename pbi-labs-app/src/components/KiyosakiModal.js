import React from 'react';
import { useAppContext } from '../context/AppContext';

export const KiyosakiModal = ({ isOpen, onClose }) => {
  const { language } = useAppContext();

  if (!isOpen) return null;

  // Simple bilingual dictionary fallback
  const text = {
    en: {
      title: "Financial Education & Security",
      body1: "This tool is built on the financial principles taught by Robert Kiyosaki in 'Rich Dad Poor Dad'. Our goal is to empower your financial independence.",
      body2: "Security Notice: Your license is strictly limited to 2 devices. If you lose a device or need to log in elsewhere, you will be prompted to request a 6-digit OTP code to your email. Entering this code will instantly clear all previous sessions and grant you access.",
      close: "Understood"
    },
    es: {
      title: "Educación Financiera y Seguridad",
      body1: "Esta herramienta se basa en los principios financieros enseñados por Robert Kiyosaki en 'Padre Rico, Padre Pobre'. Nuestro objetivo es potenciar su independencia financiera.",
      body2: "Aviso de Seguridad: Su licencia está estrictamente limitada a 2 dispositivos. Si pierde un dispositivo, se le pedirá un código OTP de 6 dígitos. Al ingresarlo, se cerrarán las sesiones anteriores para darle acceso.",
      close: "Entendido"
    }
  };

  const content = text[language] || text['en'];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{content.title}</h2>
        <p>{content.body1}</p>
        <p>{content.body2}</p>
        <button onClick={onClose} className="btn-primary">
          {content.close}
        </button>
      </div>
    </div>
  );
};