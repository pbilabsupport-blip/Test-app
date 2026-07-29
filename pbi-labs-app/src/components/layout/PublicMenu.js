import React, { useState } from 'react';

export default function PublicMenu({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* The Hamburger Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 focus:outline-none">
        ☰ Menu
      </button>

      {/* The Dropdown Links */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-xl z-50">
          <ul className="py-1">
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => onNavigate('AboutUs')}>About Us</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => onNavigate('PrivacyPolicy')}>Privacy Policy</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => onNavigate('TermsOfService')}>Terms of Service</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => onNavigate('ContactUs')}>Contact Us</li>
          </ul>
        </div>
      )}
    </div>
  );
}