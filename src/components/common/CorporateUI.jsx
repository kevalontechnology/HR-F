import React, { useState, useEffect } from 'react';
import { 
  X, Check, AlertTriangle, Info, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Search 
} from 'lucide-react';

/**
 * CORPORATE BUTTONS (Apple + Stripe + Microsoft Inspired)
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button'
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "bg-[#034665] hover:bg-[#023249] text-white shadow-sm hover:shadow focus:ring-[#034665]",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 focus:ring-slate-400",
    outline: "bg-white hover:bg-slate-50 text-[#034665] border-2 border-[#034665] focus:ring-[#034665]",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-semibold gap-1.5",
    md: "px-4 py-2.5 text-xs sm:text-sm font-semibold gap-2",
    lg: "px-6 py-3 text-sm font-bold gap-2.5"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      {children}
    </button>
  );
};

/**
 * STATUS BADGES
 */
export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold",
    warning: "bg-amber-50 text-amber-800 border border-amber-200 font-bold",
    danger: "bg-rose-50 text-rose-800 border border-rose-200 font-bold",
    info: "bg-sky-50 text-sky-800 border border-sky-200 font-bold",
    primary: "bg-blue-50 text-blue-900 border border-blue-200 font-bold",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200 font-medium"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * LOADING SKELETON
 */
export const Skeleton = ({ className = "h-4 w-full" }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`}></div>
  );
};

/**
 * EMPTY STATE COMPONENT
 */
export const EmptyState = ({ 
  icon: Icon = Info, 
  title = "No Data Found", 
  description = "There are no records matching your request at this time.", 
  action 
}) => {
  return (
    <div className="p-8 sm:p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3 my-4 shadow-sm">
      <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
        <Icon size={24} />
      </div>
      <h4 className="text-base font-bold text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

/**
 * PAGINATION CONTROL
 */
export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-4 px-2 text-xs">
      <div className="text-slate-500 font-medium">
        Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

/**
 * BREADCRUMB COMPONENT
 */
export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex text-xs text-slate-500 font-medium space-x-2 items-center mb-4">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="text-slate-300">/</span>}
          {item.active ? (
            <span className="font-bold text-[#034665]">{item.label}</span>
          ) : (
            <a href={item.href || '#'} onClick={item.onClick} className="hover:text-slate-900 transition">
              {item.label}
            </a>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

/**
 * TOAST NOTIFICATION
 */
export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <Check size={18} className="text-emerald-600" />,
    error: <AlertTriangle size={18} className="text-rose-600" />,
    info: <Info size={18} className="text-sky-600" />
  };

  const bgStyles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    error: "bg-rose-50 border-rose-200 text-rose-900",
    info: "bg-sky-50 border-sky-200 text-sky-900"
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 p-4 border rounded-xl shadow-lg flex items-center gap-3 text-xs font-bold ${bgStyles[type]} animate-fadeIn`}>
      {icons[type]}
      <span>{message}</span>
      <button onClick={onClose} className="p-1 hover:opacity-70">
        <X size={14} />
      </button>
    </div>
  );
};

/**
 * CONFIRMATION DIALOG MODAL
 */
export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", danger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${danger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-[#034665]'}`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} size="sm" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
