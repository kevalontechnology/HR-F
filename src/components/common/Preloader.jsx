import React from 'react';
import { Loader2, Building2 } from 'lucide-react';

export const Preloader = ({ message = "Loading Kevalon CRM Data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-erp-primary/20 border-t-erp-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 size={16} className="text-erp-primary animate-pulse" />
        </div>
      </div>
      <span className="text-xs font-semibold text-erp-primary tracking-wide uppercase animate-pulse">
        {message}
      </span>
    </div>
  );
};
