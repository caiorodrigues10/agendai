import {
  List,
  CalendarDays,
  Contact,
  Scissors,
  Users,
  BarChart3,
  CreditCard,
  Wallet,
  Gift,
  Megaphone,
  Link2,
  Settings,
  Store,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

export type TabRole = 'OWNER' | 'EMPLOYEE' | 'MASTER_ADMIN';

export interface TabDef {
  id: string;
  label: string;
  icon: LucideIcon;
  /** If empty → visible to all authenticated users */
  roles?: TabRole[];
  /** Optional capability required (future use) */
  requires?: string;
}

export interface TabGroup {
  id: string;
  label: string;
  tabs: TabDef[];
}

export const TAB_GROUPS: TabGroup[] = [
  {
    id: 'operacao',
    label: 'Operação',
    tabs: [
      { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
      { id: 'queue', label: 'Fila', icon: List },
      { id: 'appointments', label: 'Agenda', icon: CalendarDays },
      { id: 'clients', label: 'Clientes', icon: Contact },
    ],
  },
  {
    id: 'gestao',
    label: 'Gestão',
    tabs: [
      { id: 'services', label: 'Serviços', icon: Scissors, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'team', label: 'Equipe', icon: Users, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'reports', label: 'Relatórios', icon: BarChart3, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'finance', label: 'Financeiro', icon: CreditCard, roles: ['OWNER', 'MASTER_ADMIN'] },
    ],
  },
  {
    id: 'crescimento',
    label: 'Crescimento',
    tabs: [
      { id: 'posts', label: 'Posts', icon: Megaphone, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'link', label: 'Link Público', icon: Link2, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'referrals', label: 'Indicações', icon: Gift, roles: ['OWNER', 'MASTER_ADMIN'] },
    ],
  },
  {
    id: 'conta',
    label: 'Conta',
    tabs: [
      { id: 'settings', label: 'Configurações', icon: Settings },
      { id: 'subscription', label: 'Plano', icon: Wallet, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'profile', label: 'Perfil', icon: Store },
    ],
  },
];

/** Flat lookup of all tab IDs */
export const ALL_TAB_IDS = TAB_GROUPS.flatMap(g => g.tabs.map(t => t.id));

/** Returns the first tab the user can access, or 'queue' as fallback */
export function getDefaultTab(userRole?: string): string {
  for (const group of TAB_GROUPS) {
    for (const tab of group.tabs) {
      if (!tab.roles || tab.roles.includes(userRole as TabRole)) {
        return tab.id;
      }
    }
  }
  return 'queue';
}

/** Check if a tab is valid and accessible */
export function canAccessTab(tabId: string, userRole?: string): boolean {
  for (const group of TAB_GROUPS) {
    const tab = group.tabs.find(t => t.id === tabId);
    if (!tab) continue;
    if (!tab.roles) return true;
    return tab.roles.includes(userRole as TabRole);
  }
  return false;
}
