import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface ServiceVariation {
  id: string;
  serviceId: string;
  name: string;
  price: number;
  avgTimeMinutes: number;
  isPublic: boolean;
  sortOrder: number;
}

export interface ServiceAddon {
  id: string;
  serviceId: string;
  name: string;
  price: number;
  avgTimeMinutes: number;
  isPublic: boolean;
}

export interface ServiceCombo {
  id: string;
  name: string;
  description?: string;
  comboPrice: number;
  isActive: boolean;
  items: {
    serviceId: string;
    serviceName: string;
    variationId?: string;
    originalPrice: number;
    discountedPrice: number;
    sortOrder: number;
  }[];
}

export const catalogApi = {
  listVariations: (barbershopId: string, serviceId: string) =>
    apiClient<{ data: ServiceVariation[] }>(
      `/api/barbershops/${barbershopId}/services/${serviceId}/variations`,
      'GET', undefined, token()
    ).then(r => unwrap<ServiceVariation[]>(r)),

  createVariation: (barbershopId: string, serviceId: string, data: { name: string; price: number; avgTimeMinutes: number }) =>
    apiClient<{ data: ServiceVariation }>(
      `/api/barbershops/${barbershopId}/services/${serviceId}/variations`,
      'POST', data, token()
    ).then(r => unwrap<ServiceVariation>(r)),

  updateVariation: (barbershopId: string, serviceId: string, variationId: string, data: Partial<ServiceVariation>) =>
    apiClient<{ data: ServiceVariation }>(
      `/api/barbershops/${barbershopId}/services/${serviceId}/variations/${variationId}`,
      'PATCH', data, token()
    ).then(r => unwrap<ServiceVariation>(r)),

  listAddons: (barbershopId: string, serviceId: string) =>
    apiClient<{ data: ServiceAddon[] }>(
      `/api/barbershops/${barbershopId}/services/${serviceId}/addons`,
      'GET', undefined, token()
    ).then(r => unwrap<ServiceAddon[]>(r)),

  createAddon: (barbershopId: string, serviceId: string, data: { name: string; price: number; avgTimeMinutes: number }) =>
    apiClient<{ data: ServiceAddon }>(
      `/api/barbershops/${barbershopId}/services/${serviceId}/addons`,
      'POST', data, token()
    ).then(r => unwrap<ServiceAddon>(r)),

  listCombos: (barbershopId: string) =>
    apiClient<{ data: ServiceCombo[] }>(
      `/api/barbershops/${barbershopId}/combos`,
      'GET', undefined, token()
    ).then(r => unwrap<ServiceCombo[]>(r)),

  createCombo: (barbershopId: string, data: { name: string; description?: string; comboPrice: number; items: any[] }) =>
    apiClient<{ data: ServiceCombo }>(
      `/api/barbershops/${barbershopId}/combos`,
      'POST', data, token()
    ).then(r => unwrap<ServiceCombo>(r)),

  updateCombo: (barbershopId: string, comboId: string, data: Partial<ServiceCombo>) =>
    apiClient<{ data: ServiceCombo }>(
      `/api/barbershops/${barbershopId}/combos/${comboId}`,
      'PATCH', data, token()
    ).then(r => unwrap<ServiceCombo>(r)),
};
