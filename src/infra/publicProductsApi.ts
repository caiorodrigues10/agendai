import { apiClient } from './apiClient';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

export type ReservationStatus = 'RESERVED' | 'PICKED_UP' | 'CANCELED';

/** Endereço do salão para a mensagem de retirada. */
export interface PublicShop {
  name: string;
  address: string | null;
  city: string | null;
  whatsapp: string | null;
}

/** DTO público: custo, SKU, código de barras e lote nunca chegam aqui. */
export interface PublicProduct {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  unitLabel: string;
  category: string | null;
  /** `null` = produto sem controle de estoque (sempre reservável). */
  available: number | null;
}

export interface PublicReservation {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  status: ReservationStatus;
  expiresAt: string;
}

export const publicProductsApi = {
  list: (barbershopId: string) =>
    apiClient<{ success: boolean; data: { shop: PublicShop; products: PublicProduct[] } }>(
      `/api/barbershops/${barbershopId}/public-products`,
      'GET'
    ).then(res => unwrap<{ shop: PublicShop; products: PublicProduct[] }>(res)),

  get: (barbershopId: string, productId: string) =>
    apiClient<{ success: boolean; data: { shop: PublicShop; product: PublicProduct } }>(
      `/api/barbershops/${barbershopId}/public-products/${productId}`,
      'GET'
    ).then(res => unwrap<{ shop: PublicShop; product: PublicProduct }>(res)),

  reserve: (
    barbershopId: string,
    productId: string,
    payload: { customerName: string; whatsapp: string; quantity: number }
  ) =>
    apiClient<{ success: boolean; data: { shop: PublicShop; reservation: PublicReservation } }>(
      `/api/barbershops/${barbershopId}/public-products/${productId}/reservations`,
      'POST',
      payload
    ).then(res => unwrap<{ shop: PublicShop; reservation: PublicReservation }>(res)),
};
