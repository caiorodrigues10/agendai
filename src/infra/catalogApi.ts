import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { unwrapData, unwrapList } from '../utils/apiData';

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
  listVariations: (barbershopId: string, params?: { serviceId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.serviceId) qs.set('serviceId', params.serviceId);
    const query = qs.toString();
    return apiClient<{ data: ServiceVariation[] }>(
      `/api/barbershops/${barbershopId}/variations${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrapList<ServiceVariation>(r));
  },

  createVariation: (barbershopId: string, data: { serviceId: string; name: string; price: number; avgTimeMinutes: number }) =>
    apiClient<{ data: ServiceVariation }>(
      `/api/barbershops/${barbershopId}/variations`,
      'POST', data, token()
    ).then(r => unwrapData<ServiceVariation>(r)),

  updateVariation: (barbershopId: string, variationId: string, data: Partial<ServiceVariation>) =>
    apiClient<{ data: ServiceVariation }>(
      `/api/barbershops/${barbershopId}/variations/${variationId}`,
      'PATCH', data, token()
    ).then(r => unwrapData<ServiceVariation>(r)),

  listAddons: (barbershopId: string, params?: { serviceId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.serviceId) qs.set('serviceId', params.serviceId);
    const query = qs.toString();
    return apiClient<{ data: ServiceAddon[] }>(
      `/api/barbershops/${barbershopId}/addons${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrapList<ServiceAddon>(r));
  },

  createAddon: (barbershopId: string, data: { serviceId: string; name: string; price: number; avgTimeMinutes: number }) =>
    apiClient<{ data: ServiceAddon }>(
      `/api/barbershops/${barbershopId}/addons`,
      'POST', data, token()
    ).then(r => unwrapData<ServiceAddon>(r)),

  listCombos: (barbershopId: string) =>
    apiClient<{ data: ServiceCombo[] }>(
      `/api/barbershops/${barbershopId}/combos`,
      'GET', undefined, token()
    ).then(r => unwrapList<ServiceCombo>(r)),

  createCombo: (barbershopId: string, data: { name: string; description?: string; comboPrice: number; items: any[] }) =>
    apiClient<{ data: ServiceCombo }>(
      `/api/barbershops/${barbershopId}/combos`,
      'POST', { barbershopId, ...data }, token()
    ).then(r => unwrapData<ServiceCombo>(r)),

  updateCombo: (barbershopId: string, comboId: string, data: Partial<ServiceCombo>) =>
    apiClient<{ data: ServiceCombo }>(
      `/api/barbershops/${barbershopId}/combos/${comboId}`,
      'PATCH', data, token()
    ).then(r => unwrapData<ServiceCombo>(r)),
};
