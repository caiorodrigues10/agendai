import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Bot } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'bot';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    if (type === 'bot') return <Bot className="text-accent" size={20} />;
    if (type === 'error') return <AlertCircle className="text-danger" size={20} />;
    return <CheckCircle className="text-success" size={20} />;
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in-down w-full max-w-sm px-4">
      <div className={`bg-surface border shadow-2xl rounded-xl p-4 flex items-center gap-3 ${
        type === 'error' ? 'border-danger/40 shadow-danger/10' : 'border-border shadow-accent/10'
      }`}>
        <div className={`p-2 rounded-full ${
          type === 'error' ? 'bg-danger/10' : type === 'bot' ? 'bg-accent/15' : 'bg-surface-2'
        }`}>
            {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">{message}</p>
        </div>
      </div>
    </div>
  );
};
