import type { IconType } from 'react-icons';
import {
  LuBuilding2,
  LuCalendarDays,
  LuChartColumn,
  LuCircleHelp,
  LuContact,
  LuCreditCard,
  LuGift,
  LuFolderOpen,
  LuImage,
  LuLayoutDashboard,
  LuLink,
  LuListChecks,
  LuMegaphone,
  LuRocket,
  LuScissors,
  LuSettings,
  LuShoppingBag,
  LuStore,
  LuUsers,
  LuWallet,
} from 'react-icons/lu';
import type { TabIconKey } from './tabRegistry';

/**
 * Componentes dos ícones das abas do painel.
 *
 * Ficam fora de `config/tabRegistry.ts` de propósito: o registry é importado
 * pelo guard de rota e pelos contextos (caminho crítico do app), e puxar os
 * ícones para lá colocava ~80 kB de `react-icons/lu` no chunk principal — o
 * gate R7 exige chunk principal abaixo de 500 kB. Só quem renderiza o ícone
 * (`layouts/app/StaffNavigation.tsx`) importa este mapa.
 */
export const TAB_ICONS: Record<TabIconKey, IconType> = {
  LuBuilding2,
  LuCalendarDays,
  LuChartColumn,
  LuCircleHelp,
  LuContact,
  LuCreditCard,
  LuGift,
  LuFolderOpen,
  LuImage,
  LuLayoutDashboard,
  LuLink,
  LuListChecks,
  LuMegaphone,
  LuRocket,
  LuScissors,
  LuSettings,
  LuShoppingBag,
  LuStore,
  LuUsers,
  LuWallet,
};
