import type { OperationMode } from '../types';

export function supportsQueue(mode?: OperationMode | null): boolean {
  return mode === 'QUEUE_ONLY' || mode === 'HYBRID' || mode == null;
}

export function supportsAppointments(mode?: OperationMode | null): boolean {
  return mode === 'APPOINTMENTS_ONLY' || mode === 'HYBRID' || mode == null;
}

export function operationModeLabel(mode?: OperationMode | null): string {
  switch (mode) {
    case 'QUEUE_ONLY': return 'Somente fila';
    case 'APPOINTMENTS_ONLY': return 'Somente agenda';
    case 'HYBRID': return 'Fila e agenda';
    default: return 'Fila e agenda';
  }
}
