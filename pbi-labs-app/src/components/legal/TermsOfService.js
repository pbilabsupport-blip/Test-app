import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function TermsOfService() {
  const { language } = useAppContext();
  const isEs = language === 'es';
  return (
    <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px' }}>{isEs ? 'Términos de Servicio' : 'Terms of Service'}</h2>
      <p style={{ marginBottom: '12px' }}>{isEs ? 'Al acceder al software proporcionado por P.B.I. Labs, usted acepta cumplir con los términos de licencia activos, incluidas las limitaciones de asientos (máximo 2 dispositivos por suscripción activa).' : 'By accessing software provided by P.B.I. Labs, you agree to abide by active licensing terms, including seat limitations (2 devices maximum per active subscription).'}</p>
      <p>{isEs ? 'La distribución no autorizada o la ingeniería inversa de las claves de acceso resultará en la revocación automatizada del acceso a través de nuestro marco de seguridad.' : 'Unauthorized distribution or reversal of access keys will result in automated revocation of access through our security framework.'}</p>
    </div>
  );
}