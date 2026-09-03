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
  RiRocketLine,
  RiShoppingBag3Line,
} from 'react-icons/ri';
import type { OperationMode } from '../types';

export type TabRole = 'OWNER' | 'EMPLOYEE' | 'MASTER_ADMIN';

export interface TabDef {
  id: string;
  label: string;
  icon: IconType;
  /** If empty → visible to all authenticated users */
  roles?: TabRole[];
  /** If empty → visible in all operation modes */
  modes?: OperationMode[];
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
      { id: 'onboarding', label: 'Configuração inicial', icon: RiRocketLine, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'queue', label: 'Fila', icon: RiListCheck2, modes: ['HYBRID', 'QUEUE_ONLY'] },
      { id: 'appointments', label: 'Agenda', icon: RiCalendarScheduleLine, modes: ['HYBRID', 'APPOINTMENTS_ONLY'] },
      { id: 'clients', label: 'Clientes', icon: RiContactsLine },
      { id: 'products', label: 'Produtos', icon: RiShoppingBag3Line },
    ],
  },
  {
    id: 'gestao',
    label: 'Gestão',
    tabs: [
      { id: 'services', label: 'Serviços', icon: RiScissorsLine, roles: ['OWNER', 'MASTER_ADMIN'] },
      { id: 'team', label: 'Equipe', icon: RiTeamLine, roles: ['OWNER', 'MASTER_ADMIN'] },
      {
        id: 'reports',
        label: 'Relatórios',
        icon: RiBarChartBoxLine,
        roles: ['OWNER', 'MASTER_ADMIN'],
      },
      {
        id: 'finance',
        label: 'Financeiro',
        icon: RiBankCardLine,
        roles: ['OWNER', 'MASTER_ADMIN'],
      },
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

/** Primary destinations kept visible in the compact bottom navigation. */
export const MOBILE_PRIMARY_TAB_IDS = ['overview', 'queue', 'appointments', 'clients'] as const;

/** Flat lookup of all tab IDs */
export const ALL_TAB_IDS = TAB_GROUPS.flatMap(g => g.tabs.map(t => t.id));

/** Check if a tab is valid and accessible */
export function canAccessTab(
  tabId: string,
  userRole?: string,
  extras?: { hasDashboard?: boolean; permissions?: string[] }
): boolean {
  for (const group of TAB_GROUPS) {
    const tab = group.tabs.find(t => t.id === tabId);
    if (!tab) continue;
    if (tabId === 'products') {
      const privileged = userRole === 'OWNER' || userRole === 'MASTER_ADMIN';
      const permitted = extras?.permissions?.some(perm =>
        ['RETAIL_SELL', 'PRODUCTS_VIEW', 'PRODUCTS_MANAGE', 'INVENTORY_MANAGE'].includes(perm)
      );
      return Boolean(extras?.hasDashboard && (privileged || permitted));
    }
    if (!tab.roles) return true;
    return tab.roles.includes(userRole as TabRole);
  }
  return false;
}

/** Check if a tab is accessible for the given operation mode */
export function canAccessTabByMode(tabId: string, mode?: OperationMode): boolean {
  for (const group of TAB_GROUPS) {
    const tab = group.tabs.find(t => t.id === tabId);
    if (!tab) continue;
    if (!tab.modes) return true;
    return tab.modes.includes(mode ?? 'HYBRID');
  }
  return false;
}

/** Returns the first tab the user can access for the given mode */
export function getDefaultTab(userRole?: string, mode?: OperationMode): string {
  for (const group of TAB_GROUPS) {
    for (const tab of group.tabs) {
      if (tab.roles && !tab.roles.includes(userRole as TabRole)) continue;
      if (tab.modes && !tab.modes.includes(mode ?? 'HYBRID')) continue;
      return tab.id;
    }
  }
  return 'overview';
}
