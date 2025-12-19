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
    if (type === 'bot') return <Bot className="text-cyan-400" size={20} />;
    if (type === 'error') return <AlertCircle className="text-red-400" size={20} />;
    return <CheckCircle className="text-green-400" size={20} />;
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in-down w-full max-w-sm px-4">
      <div className="bg-neutral-900 border border-neutral-800 shadow-2xl shadow-cyan-900/20 rounded-xl p-4 flex items-center gap-3">
        <div className={`p-2 rounded-full ${type === 'bot' ? 'bg-cyan-900/30' : 'bg-neutral-800'}`}>
            {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{message}</p>
        </div>
      </div>
    </div>
  );
};