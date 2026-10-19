import type { OperationMode } from '../types';

export type PublicTab = 'queue' | 'appointments' | 'profile';

/** Abas visíveis da página pública (/queue/:id) conforme o modo de atendimento. */
export function visiblePublicTabs(mode?: OperationMode): PublicTab[] {
  const tabs: PublicTab[] = [];
  if (!mode || mode === 'QUEUE_ONLY' || mode === 'HYBRID') tabs.push('queue');
  if (!mode || mode === 'APPOINTMENTS_ONLY' || mode === 'HYBRID') tabs.push('appointments');
  tabs.push('profile');
  return tabs;
}
