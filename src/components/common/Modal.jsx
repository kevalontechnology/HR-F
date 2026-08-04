import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className={`bg-white rounded-xs shadow-2xl w-full ${maxWidth} overflow-hidden border border-erp-border animate-fadeIn`}>
        {/* Header */}
        <div className="bg-erp-primary text-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <h3 className="font-semibold text-xs sm:text-sm tracking-wide uppercase truncate pr-2">{title}</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-300 transition p-1"
            aria-label="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-5 max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
