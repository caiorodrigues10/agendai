import React from 'react';
import { Header } from './Header';
import { StaffNavigation } from './StaffNavigation';
import type { OperationMode, StaffMember } from '../../types';

export interface AppLayoutProps {
  user: StaffMember | null;
  logoUrl?: string;
  onLogin: () => void;
  onLogout: () => void;
  toast?: React.ReactNode;
  activeTab: string;
  userRole?: string;
  hasDashboard?: boolean;
  permissions?: string[];
  operationMode?: OperationMode;
  onboardingCompleted?: boolean;
  onNavigate: (tabId: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  user,
  logoUrl,
  onLogin,
  onLogout,
  toast,
  activeTab,
  userRole,
  hasDashboard,
  permissions,
  operationMode,
  onboardingCompleted,
  onNavigate,
  children,
}) => (
  <div className="min-h-screen bg-bg pb-[max(5.5rem,env(safe-area-inset-bottom))] text-text-primary lg:pb-0">
    <a
      href="#main-content"
      className="sr-only fixed left-4 top-4 z-[90] rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-fg focus:not-sr-only"
    >
      Pular para o conteúdo
    </a>
    <Header currentUser={user} onOpenLogin={onLogin} onLogout={onLogout} logoUrl={logoUrl} />
    {toast}
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 lg:px-6">
      <StaffNavigation
        activeTab={activeTab}
        userRole={userRole}
        hasDashboard={hasDashboard}
        permissions={permissions}
        operationMode={operationMode}
        onboardingCompleted={onboardingCompleted}
        onNavigate={onNavigate}
      />
      <main id="main-content" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  </div>
);
