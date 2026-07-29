import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function ContactUs() {
  const { language } = useAppContext();
  const isEs = language === 'es';
  return (
    <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px' }}>{isEs ? 'Soporte de Contacto' : 'Contact Support'}</h2>
      <p style={{ marginBottom: '12px' }}>{isEs ? '¿Tiene preguntas o necesita asistencia con su licencia? Comuníquese con nuestro equipo de soporte dedicado:' : 'Have questions or need assistance with your license? Reach out to our dedicated support team:'}</p>
      <p style={{ fontWeight: 'bold', color: '#2563eb' }}>Email: pbilabssupport@gmail.com</p>
    </div>
  );
}