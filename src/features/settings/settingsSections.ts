import type { ElementType } from 'react';
import {
  LuUserRound as UserRound,
  LuStore as Store,
  LuAtSign as AtSign,
  LuSmartphone as Smartphone,
  LuClock as Clock,
  LuMail as Mail,
  LuFileSpreadsheet as FileSpreadsheet,
  LuDownload as Download,
  LuShieldCheck as ShieldCheck,
  LuCircleHelp as CircleHelp,
} from 'react-icons/lu';

export type SettingsSection =
  | 'account'
  | 'shop'
  | 'social'
  | 'whatsapp'
  | 'operation'
  | 'email'
  | 'import'
  | 'export'
  | 'privacy'
  | 'help';

export type SettingsSectionGroupId = 'general' | 'channels' | 'data' | 'accountHelp';

export interface SettingsSectionItem {
  id: SettingsSection;
  label: string;
  icon: ElementType;
  group: SettingsSectionGroupId;
}

export interface SettingsSectionGroup {
  id: SettingsSectionGroupId;
  label: string;
}

/**
 * Cabeçalhos da navegação de Configurações. Os ids das seções são os mesmos de
 * sempre (`?section=import` continua válido) — só a ordem de exibição mudou,
 * agora por assunto, para dar hierarquia às 10 seções.
 */
export const SETTINGS_SECTION_GROUPS: SettingsSectionGroup[] = [
  { id: 'general', label: 'Geral' },
  { id: 'channels', label: 'Canais' },
  { id: 'data', label: 'Dados' },
  { id: 'accountHelp', label: 'Conta e ajuda' },
];

export const SETTINGS_SECTIONS: SettingsSectionItem[] = [
  { id: 'account', label: 'Conta', icon: UserRound, group: 'general' },
  { id: 'shop', label: 'Estabelecimento', icon: Store, group: 'general' },
  { id: 'operation', label: 'Funcionamento', icon: Clock, group: 'general' },
  { id: 'social', label: 'Redes sociais', icon: AtSign, group: 'channels' },
  { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone, group: 'channels' },
  { id: 'email', label: 'E-mail e notificações', icon: Mail, group: 'channels' },
  { id: 'import', label: 'Importar dados', icon: FileSpreadsheet, group: 'data' },
  { id: 'export', label: 'Exportar dados', icon: Download, group: 'data' },
  { id: 'privacy', label: 'Privacidade', icon: ShieldCheck, group: 'accountHelp' },
  { id: 'help', label: 'Ajuda e suporte', icon: CircleHelp, group: 'accountHelp' },
];
