import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function PrivacyPolicy() {
  const { language } = useAppContext();
  const isEs = language === 'es';

  return (
    <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px' }}>
        {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
        {isEs ? 'Última actualización: Julio 2026' : 'Last Updated: July 2026'}
      </p>
      <p style={{ marginBottom: '12px' }}>
        {isEs 
          ? 'Bienvenido a P.B.I. Labs. Utilizamos Google AdSense para mostrar anuncios en nuestra versión gratuita. Los proveedores externos, incluido Google, utilizan cookies para publicar anuncios basados en las visitas anteriores de un usuario a este sitio web u otros sitios web.' 
          : 'Welcome to P.B.I. Labs. We use Google AdSense to display ads on our free tier. Third-party vendors, including Google, use cookies to serve ads based on a user\'s prior visits to this website or other websites.'}
      </p>
      <p style={{ marginBottom: '12px' }}>
        {isEs 
          ? 'El uso de cookies de publicidad por parte de Google permite que este y sus socios publiquen anuncios a sus usuarios basándose en las visitas a sus sitios y/o otros sitios en Internet.' 
          : 'Google\'s use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.'}
      </p>
      <p>
        {isEs 
          ? 'Los usuarios pueden optar por no recibir publicidad personalizada visitando la Configuración de Anuncios de Google. Si tiene alguna pregunta, comuníquese con nosotros.' 
          : 'Users may opt out of personalized advertising by visiting Google\'s Ads Settings. If you have any questions, please contact us.'}
      </p>
    </div>
  );
}