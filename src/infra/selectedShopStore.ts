/**
 * Non-React access to the currently selected barbershop.
 * Synced by BarbershopFiltersContext so infra/*Api.ts can resolve MASTER_ADMIN tenant.
 */
let selectedBarbershopId: string | null = null;

export function getSelectedBarbershopId(): string | null {
  return selectedBarbershopId;
}

export function setSelectedBarbershopId(id: string | null): void {
  selectedBarbershopId = id;
}
