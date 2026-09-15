import React from 'react';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { Clock3, Lock, LogOut, Wallet } from 'lucide-react';
import { StaffMember } from '../../types';
import { ThemeToggle } from './ThemeToggle';
import { Link } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface HeaderProps {
  currentUser: StaffMember | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  logoUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onOpenLogin, onLogout, logoUrl }) => {
  const { data: subscriptionData } = useSubscription();
  const trial = subscriptionData?.trial;
  const trialDays = trial?.daysRemainingInTrial;
  const isTrialActive = Boolean(trial?.isInTrial && !trial.isExpired && typeof trialDays === 'number');
  const trialLabel = trialDays === 0 ? 'Trial termina hoje' : `${trialDays} ${trialDays === 1 ? 'dia' : 'dias'} de trial`;
  const trialTone = trialDays != null && trialDays <= 3
    ? 'border-danger/30 bg-danger/10 text-danger'
    : trialDays != null && trialDays <= 7
      ? 'border-warning/30 bg-warning/10 text-warning'
      : 'border-accent/30 bg-accent/10 text-accent';

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-accent/20 shadow-lg shadow-accent/5">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <Logo size="sm" customImageUrl={logoUrl} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {currentUser && isTrialActive && (
            <span
              aria-label={`Seu acesso de teste termina em ${trialDays} ${trialDays === 1 ? 'dia' : 'dias'}.`}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-bold sm:px-2.5 ${trialTone}`}
            >
              <Clock3 size={13} aria-hidden="true" />
              <span className="sm:hidden">{trialDays}d</span>
              <span className="hidden sm:inline">{trialLabel}</span>
            </span>
          )}
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
