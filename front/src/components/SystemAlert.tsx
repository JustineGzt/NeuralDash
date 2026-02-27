import React from 'react';

interface AlertProps {
  message: string;
  type: 'info' | 'warning' | 'critical';
  onClose: () => void;
}

export const SystemAlert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const themes = {
    info: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200',
    warning: 'border-orange-500/50 bg-orange-500/10 text-orange-200',
    critical: 'border-red-500/50 bg-red-500/10 text-red-200',
  };

  return (
    <div className={`flex items-center gap-4 border-l-4 p-4 backdrop-blur-md shadow-2xl animate-in slide-in-from-right-full duration-500 ${themes[type]}`}>
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-widest font-black opacity-50">{type}</p>
        <p className="text-sm font-medium tracking-wide">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="text-[10px] border border-white/20 px-2 py-1 hover:bg-white/10 transition-colors"
      >
        DISMISS
      </button>
    </div>
  );
};