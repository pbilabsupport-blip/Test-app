import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function AboutUs() {
  const { language } = useAppContext();
  const isEs = language === 'es';

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>
        {isEs ? 'Acerca de P.B.I. Labs' : 'About P.B.I. Labs'}
      </h2>
      <p style={{ lineHeight: '1.6', color: 'var(--text-color)', marginBottom: '15px' }}>
        {isEs 
          ? 'P.B.I. Labs es un sistema operativo financiero seguro diseñado bajo la mentalidad de Rich Dad (Robert Kiyosaki) para transformar activos, controlar el flujo de caja y alcanzar la libertad financiera.'
          : 'P.B.I. Labs is a secure financial operating system built under the Rich Dad (Robert Kiyosaki) mindset to transform assets, master cash flow, and achieve financial freedom.'}
      </p>
      <p style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
        {isEs 
          ? 'Nuestra arquitectura opera bajo un modelo de eficiencia total de cero costos generales, protegiendo sus datos y licencias de manera profesional.'
          : 'Our architecture operates under a zero-overhead efficiency model, professionally safeguarding your data and licenses.'}
      </p>
    </div>
  );
}