import React, { useEffect } from 'react';
import {
  LuCircleCheck as CheckCircle,
  LuCircleAlert as AlertCircle,
  LuBot as Bot,
} from 'react-icons/lu';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'bot';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 4000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    if (type === 'bot') return <Bot className="text-support" size={20} />;
    if (type === 'error') return <AlertCircle className="text-danger" size={20} />;
    return <CheckCircle className="text-success" size={20} />;
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in-down w-full max-w-sm px-4">
      <div
        className={`bg-surface border shadow-2xl rounded-xl p-4 flex items-center gap-3 ${
          type === 'error' ? 'border-danger/40 shadow-danger/10' : type === 'bot' ? 'border-border shadow-black/5' : 'border-success/30 shadow-success/10'
        }`}
      >
        <div
          className={`p-2 rounded-full ${
            type === 'error' ? 'bg-danger/10' : type === 'bot' ? 'bg-surface-2' : 'bg-success/10'
          }`}
        >
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">{message}</p>
        </div>
      </div>
    </div>
  );
};
