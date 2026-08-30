import React from 'react';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { Lock, LogOut, Wallet } from 'lucide-react';
import { StaffMember } from '../../types';
import { ThemeToggle } from './ThemeToggle';
import { Link } from 'react-router-dom';

interface HeaderProps {
  currentUser: StaffMember | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  logoUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onOpenLogin, onLogout, logoUrl }) => {
  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-accent/20 shadow-lg shadow-accent/5">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <Logo size="sm" customImageUrl={logoUrl} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {currentUser ? (
            <div className="flex items-center gap-2 bg-surface rounded-lg p-1 pr-3 border border-border">
              {currentUser.role === 'OWNER' && (
                <Link
                  to="/app/subscription"
                  className="px-2.5 py-1.5 rounded-md text-[11px] font-bold bg-accent text-accent-fg hover:bg-accent-hover flex items-center gap-1"
                >
                  <Wallet size={12} /> Plano
                </Link>
              )}
              <Avatar src={currentUser.avatarUrl} name={currentUser.name} size="xs" />
              <div className="px-2 py-1 bg-accent/15 rounded text-xs font-bold text-accent uppercase">
                {currentUser.role === 'MASTER_ADMIN'
                  ? 'Admin'
                  : currentUser.role === 'OWNER'
                    ? 'Dono'
                    : 'Funcionário'}
              </div>
              <span className="text-xs font-medium text-text-primary hidden sm:block">
                {currentUser.name}
              </span>
              <button
                onClick={onLogout}
                className="ml-2 text-text-muted hover:text-danger transition-colors"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-surface text-text-secondary border border-border hover:text-accent hover:border-accent/40"
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
