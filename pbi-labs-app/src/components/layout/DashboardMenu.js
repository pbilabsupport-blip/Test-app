import React, { useState } from 'react';

export default function DashboardMenu({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 focus:outline-none">
        ☰ Tools
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-xl z-50 flex flex-col h-full">
          {/* Main Financial Tools */}
          <ul className="py-1 flex-grow">
            <li className="px-4 py-2 font-bold text-gray-400 uppercase text-xs">Financial Tools</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => onNavigate('Dashboard')}>Dashboard</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => onNavigate('ActionCenter')}>Action Center</li>
          </ul>

          {/* Separated Legal Section */}
          <div className="border-t pt-2 pb-1 bg-gray-50">
            <p className="px-4 py-1 font-bold text-gray-400 uppercase text-xs">Support</p>
            <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer list-none text-sm" onClick={() => onNavigate('PrivacyPolicy')}>Legal & Privacy</li>
          </div>
        </div>
      )}
    </div>
  );
}