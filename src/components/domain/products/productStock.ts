/**
 * Frontend helpers for product stock display.
 */

import type { StockUnit, Product } from '../../../infra/productsApi';

/** Short pt-BR labels for StockUnit. */
export const STOCK_UNIT_LABELS: Record<StockUnit, string> = {
  UNIT: 'un',
  ML: 'ml',
  L: 'L',
  G: 'g',
  KG: 'kg',
  BOX: 'cx',
  PACK: 'pct',
  OTHER: '',
};

/** Options for SmartSelect stock unit. */
export const STOCK_UNIT_OPTIONS = [
  { value: 'UNIT', label: 'Unidade' },
  { value: 'ML', label: 'Mililitro' },
  { value: 'L', label: 'Litro' },
  { value: 'G', label: 'Grama' },
  { value: 'KG', label: 'Quilo' },
  { value: 'BOX', label: 'Caixa' },
  { value: 'PACK', label: 'Pacote' },
  { value: 'OTHER', label: 'Outra' },
] as const;

/**
 * Format stock quantity with unit abbreviation.
 * Fractional values only shown when unit != UNIT.
 * UNIT displays as integer (e.g. "5 un"), no decimals.
 */
export function formatStockQty(qty: number, unit: StockUnit): string {
  if (unit === 'UNIT') {
    return `${Math.round(qty)} ${STOCK_UNIT_LABELS.UNIT}`;
  }
  const label = STOCK_UNIT_LABELS[unit] || '';
  const display = qty % 1 === 0 ? qty.toString() : qty.toFixed(1);
  return `${display} ${label}`.trim();
}

/**
 * Format a "YYYY-MM-DD" ISO string as dd/mm/yyyy for display.
 * Uses only the first 10 chars — no Date conversion, no timezone shift.
 */
export function formatDateOnlyBR(iso: string | null | undefined): string {
  if (!iso || iso.length < 10) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Check if a product is low stock (same rule as backend).
 */
export function isLowStock(product: Product): boolean {
  return product.trackStock && product.minStock > 0 && product.stockQty <= product.minStock;
}
