import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const ERPLayout = ({ activeTab, setActiveTab, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-erp-bg text-erp-text">
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="flex flex-1 relative">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};
