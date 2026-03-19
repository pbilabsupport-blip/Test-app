import React from 'react';
import { useAppContext } from '../context/AppContext';

export const ToolHelpModal = ({ isOpen, onClose }) => {
  const { language } = useAppContext();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'var(--bg-color)', color: 'var(--text-color)',
        padding: '30px', borderRadius: '12px', maxWidth: '450px', width: '100%', 
        border: '1px solid var(--border-color)', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        
        <h2 style={{ marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>
          {language === 'es' ? 'Ayuda de la Bóveda' : 'Vault Help'}
        </h2>
        
        <div style={{ marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>
          
          {/* NEW: License Acquisition Section */}
          <p style={{ marginBottom: '15px' }}>
            <strong>{language === 'es' ? 'Adquisición de Licencia:' : 'License Acquisition:'}</strong><br/>
            {language === 'es' 
              ? 'Si aún no posees una clave de acceso, o si deseas adquirir una licencia adicional, puedes realizar tu compra de forma segura haciendo clic en el botón Comprar Aquí en la pantalla de activación' 
              : 'Should you not yet possess an access key, or if you wish to acquire an additional license, you may securely purchase one by clicking the Purchase Here button on the activation screen.'}
          </p>

          {/* UPGRADED: Device Management Section */}
          <p style={{ marginBottom: '15px' }}>
            <strong>{language === 'es' ? 'Gestión de Dispositivos:' : 'Device Management:'}</strong><br/>
            {language === 'es' 
              ? 'Su clave autorizada desbloquea el acceso para hasta 2 dispositivos. Si alcanza su límite (por ejemplo, al adquirir un equipo nuevo), simplemente ingrese su clave y utilice el botón rojo "Restablecer Asientos" para reasignar su acceso.' 
              : 'Your authorized key unlocks access for up to 2 devices. Should you reach your limit (e.g., upon acquiring a new computer), simply enter your key and utilize the red "Reset Seats" button to reallocate your access.'}
          </p>

          {/* UPGRADED: Privacy Section */}
          <p style={{ marginBottom: '0' }}>
            <strong>{language === 'es' ? 'Su Privacidad:' : 'Your Privacy:'}</strong><br/>
            {language === 'es'
              ? 'Valoramos profundamente su privacidad. Utilizamos una "huella digital" matemática anónima de su hardware estrictamente para gestionar su límite de dispositivos. No rastreamos su ubicación, historial de navegación ni identidad personal. Sus datos siguen siendo exclusivamente suyos.'
              : 'We deeply value your privacy. We utilize an anonymous mathematical hardware "fingerprint" strictly to manage your device allocation. We do not monitor your location, browsing history, or personal identity. Your data remains exclusively your own.'}
          </p>
        </div>

        <button onClick={onClose} className="btn-primary" style={{ width: '100%', padding: '12px', cursor: 'pointer', borderRadius: '6px', fontWeight: 'bold' }}>
          {language === 'es' ? 'Cerrar' : 'Close'}
        </button>

        {/* Kiyosaki Tribute Footer */}
        <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #666', textAlign: 'center' }}>
          <p style={{ fontStyle: 'italic', fontSize: '0.8rem', margin: 0, opacity: 0.7 }}>
            {language === 'es'
              ? 'Todas las herramientas creadas por P.B.I. Labs están inspiradas en Robert Kiyosaki y sus enseñanzas de "Padre Rico".'
              : 'All tools created by P.B.I. Labs are inspired by Robert Kiyosaki and his "Rich Dad" teachings.'}
          </p>
        </div>

      </div>
    </div>
  );
};