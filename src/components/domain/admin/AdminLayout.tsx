import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LuBriefcase, LuTicket, LuListTodo, LuUsers, LuBuilding2, LuActivity,
  LuShield, LuCreditCard, LuGift, LuRefreshCcw, LuChevronLeft, LuMenu, LuLogOut
} from 'react-icons/lu';
import { useAuth } from '../../../contexts/AuthContext';
import { ThemeToggle } from '../../ui/ThemeToggle';

const NAV_ITEMS = [
  { to: '/master/work', icon: LuBriefcase, label: 'Meu trabalho' },
  { to: '/master/tickets', icon: LuTicket, label: 'Atendimento' },
  { to: '/master/tasks', icon: LuListTodo, label: 'Tarefas' },
  { to: '/master/team', icon: LuUsers, label: 'Equipe' },
  { to: '/master/accounts', icon: LuBuilding2, label: 'Contas' },
  { to: '/master/operations', icon: LuActivity, label: 'Operação' },
  { to: '/master/audit', icon: LuShield, label: 'Auditoria' },
  { to: '/master/billing', icon: LuCreditCard, label: 'Faturamento' },
  { to: '/master/referrals', icon: LuGift, label: 'Indicações' },
  { to: '/master/crm', icon: LuRefreshCcw, label: 'CRM' },
];

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-bg text-text-primary overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-60 bg-surface border-r border-border
          transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-border">
            <NavLink to="/master/work" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <span className="font-display font-bold text-sm">AgendAI</span>
            </NavLink>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded hover:bg-surface-2"
            >
              <LuChevronLeft size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User footer */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user?.name}</p>
                <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:bg-surface-2 hover:text-danger transition-colors"
              >
                <LuLogOut size={14} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center h-12 px-4 border-b border-border bg-surface/50 backdrop-blur-sm shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-surface-2 mr-3"
          >
            <LuMenu size={18} />
          </button>
          <h1 className="text-sm font-medium text-text-secondary">
            Painel Interno
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
