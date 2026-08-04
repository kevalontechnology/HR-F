import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className={`bg-white rounded-xs shadow-xl w-full ${maxWidth} overflow-hidden border border-erp-border animate-fadeIn`}>
        {/* Header */}
        <div className="bg-erp-primary text-white px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-sm tracking-wide uppercase">{title}</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-300 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
