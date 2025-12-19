import React from 'react';
import { Logo } from './Logo';
import { Lock, LogOut, UserCog } from 'lucide-react';
import { StaffMember } from '../types';

interface HeaderProps {
  currentUser: StaffMember | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  logoUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onOpenLogin, onLogout, logoUrl }) => {
  return (
    <header className="sticky top-0 z-50 bg-neutral-950/95 backdrop-blur-sm border-b border-cyan-900/30 shadow-lg shadow-cyan-900/10">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        
        <Logo size="sm" customImageUrl={logoUrl} />
        
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-1 pr-3 border border-neutral-800">
               <div className="px-2 py-1 bg-cyan-900/30 rounded text-xs font-bold text-cyan-400 uppercase">
                  {currentUser.role === 'admin' ? 'Gerente' : 'Barbeiro'}
               </div>
               <span className="text-xs font-medium text-white hidden sm:block">{currentUser.name}</span>
               <button 
                onClick={onLogout}
                className="ml-2 text-neutral-500 hover:text-red-400 transition-colors"
                title="Sair"
               >
                 <LogOut size={16} />
               </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-cyan-400 hover:border-cyan-900"
            >
              <Lock size={14} />
              Área da Equipe
            </button>
          )}
        </div>
      </div>
    </header>
  );
};