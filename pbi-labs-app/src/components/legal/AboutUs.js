import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function AboutUs() {
  const { language } = useAppContext();
  const isEs = language === 'es';
  return (
    <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px' }}>{isEs ? 'Acerca de P.B.I. Labs' : 'About P.B.I. Labs'}</h2>
      <p style={{ marginBottom: '12px' }}>{isEs ? 'P.B.I. Labs desarrolla herramientas de gestión financiera intuitivas y accesibles diseñadas para ayudar a las personas comunes a dominar el flujo de efectivo y lograr la libertad financiera.' : 'P.B.I. Labs develops intuitive, accessible financial management tools designed to help everyday individuals master cash flow and achieve financial freedom.'}</p>
      <p>{isEs ? 'Basado en los principios de educación financiera y construcción sólida de activos, nuestro software permite a los usuarios rastrear ingresos pasivos, controlar gastos y eliminar la deuda.' : 'Grounded in principles of financial literacy and sound asset building, our software enables users to track passive income, control expenses, and eliminate debt overhead.'}</p>
    </div>
  );
}