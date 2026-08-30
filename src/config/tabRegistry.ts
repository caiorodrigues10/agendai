import type { IconType } from 'react-icons';
import {
  RiDashboardLine,
  RiListCheck2,
  RiCalendarScheduleLine,
  RiContactsLine,
  RiScissorsLine,
  RiTeamLine,
  RiBarChartBoxLine,
  RiBankCardLine,
  RiWalletLine,
  RiGiftLine,
  RiMegaphoneLine,
  RiLinkM,
  RiSettings4Line,
  RiStore2Line,
} from 'react-icons/ri';

export type TabRole = 'OWNER' | 'EMPLOYEE' | 'MASTER_ADMIN';

export interface TabDef {
  id: string;
  label: string;
  icon: IconType;
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
      { id: 'overview', label: 'Visão Geral', icon: RiDashboardLine },
      { id: 'queue', label: 'Fila', icon: RiListCheck2 },
      { id: 'appointments', label: 'Agenda', icon: RiCalendarScheduleLine },
      { id: 'clients', label: 'Clientes', icon: RiContactsLine },
    ],
  },
  {
    id: 'gestao',
    label: 'Gestão',
    tabs: [
      { id: 'services', label: 'Serviços', icon: RiScissorsLine, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'team', label: 'Equipe', icon: RiTeamLine, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'reports', label: 'Relatórios', icon: RiBarChartBoxLine, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'finance', label: 'Financeiro', icon: RiBankCardLine, roles: ['OWNER', 'MASTER_ADMIN'] },
    ],
  },
  {
    id: 'crescimento',
    label: 'Crescimento',
    tabs: [
      { id: 'posts', label: 'Posts', icon: RiMegaphoneLine, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'link', label: 'Link Público', icon: RiLinkM, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'referrals', label: 'Indicações', icon: RiGiftLine, roles: ['OWNER', 'MASTER_ADMIN'] },
    ],
  },
  {
    id: 'conta',
    label: 'Conta',
    tabs: [
      { id: 'settings', label: 'Configurações', icon: RiSettings4Line },
      { id: 'subscription', label: 'Plano', icon: RiWalletLine, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'profile', label: 'Perfil', icon: RiStore2Line },
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
