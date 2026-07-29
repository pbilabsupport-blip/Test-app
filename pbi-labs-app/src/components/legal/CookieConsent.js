import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user already accepted cookies
    const consent = localStorage.getItem('pbi_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('pbi_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex justify-between items-center z-50">
      <p className="text-sm">
        We use cookies to serve targeted Google AdSense ads and improve your experience. 
        By continuing to use this software, you consent to our use of cookies.
      </p>
      <button 
        onClick={handleAccept} 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4"
      >
        Accept
      </button>
    </div>
  );
}