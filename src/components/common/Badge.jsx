import React from 'react';

export const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-300',
    danger: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
    primary: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    default: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold border rounded-xs uppercase tracking-wide ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

export const StageBadge = ({ stage }) => {
  const stageMap = {
    REGISTERED: { label: 'Registered', variant: 'default' },
    RECEPTION_WAITING: { label: 'Reception Queue', variant: 'warning' },
    TECHNICAL_QUEUE: { label: 'Tech Queue', variant: 'info' },
    TECHNICAL_IN_PROGRESS: { label: 'Tech Running', variant: 'primary' },
    TECHNICAL_COMPLETED: { label: 'Tech Passed', variant: 'success' },
    PRACTICAL_QUEUE: { label: 'Practical Queue', variant: 'info' },
    PRACTICAL_IN_PROGRESS: { label: 'Practical Running', variant: 'primary' },
    PRACTICAL_COMPLETED: { label: 'Practical Passed', variant: 'success' },
    HR_QUEUE: { label: 'HR Queue', variant: 'info' },
    HR_IN_PROGRESS: { label: 'HR Running', variant: 'primary' },
    SELECTED: { label: 'Selected', variant: 'success' },
    HOLD: { label: 'On Hold', variant: 'warning' },
    REJECTED: { label: 'Rejected', variant: 'danger' }
  };

  const item = stageMap[stage] || { label: stage, variant: 'default' };

  return <Badge variant={item.variant}>{item.label}</Badge>;
};
