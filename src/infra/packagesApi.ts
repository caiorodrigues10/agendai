import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { ClientPackage, PackagePaymentMethod, ServicePackage } from '../types';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

function buildQuery(params?: Record<string, string | number | boolean | undefined>) {
  const qs = new URLSearchParams();
  if (!params) return '';
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export const packagesApi = {
  listCatalog: async (params?: { active?: boolean }) => {
    const res = await apiClient<{ success: boolean; data: ServicePackage[] }>(
      `/api/service-packages${buildQuery(
        params?.active === undefined ? undefined : { active: String(params.active) }
      )}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<ServicePackage[]>(res);
  },

  createCatalog: async (body: {
    name: string;
    serviceId: string;
    sessionCount: number;
    price: number;
    validityDays?: number | null;
  }) => {
    const res = await apiClient<{ success: boolean; data: ServicePackage }>(
      '/api/service-packages',
      'POST',
      body,
      token()
    );
    return unwrap<ServicePackage>(res);
  },

  updateCatalog: async (
    id: string,
    body: {
      name?: string;
      serviceId?: string;
      sessionCount?: number;
      price?: number;
      validityDays?: number | null;
      active?: boolean;
    }
  ) => {
    const res = await apiClient<{ success: boolean; data: ServicePackage }>(
      `/api/service-packages/${id}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<ServicePackage>(res);
  },

  listSold: async (params?: { clientId?: string; status?: string }) => {
    const res = await apiClient<{ success: boolean; data: ClientPackage[] }>(
      `/api/client-packages${buildQuery(params)}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<ClientPackage[]>(res);
  },

  sell: async (body: {
    clientId: string;
    packageId: string;
    paymentMethod: PackagePaymentMethod;
  }) => {
    const res = await apiClient<{ success: boolean; data: ClientPackage }>(
      '/api/client-packages',
      'POST',
      body,
      token()
    );
    return unwrap<ClientPackage>(res);
  },

  book: async (
    id: string,
    slots: { date: string; time: string; staffId?: string | null }[]
  ) => {
    const res = await apiClient<{ success: boolean; data: unknown[] }>(
      `/api/client-packages/${id}/book`,
      'POST',
      { slots },
      token()
    );
    return unwrap<unknown[]>(res);
  },

  consume: async (id: string) => {
    const res = await apiClient<{ success: boolean; data: ClientPackage }>(
      `/api/client-packages/${id}/consume`,
      'POST',
      {},
      token()
    );
    return unwrap<ClientPackage>(res);
  },

  cancel: async (id: string) => {
    const res = await apiClient<{ success: boolean; data: ClientPackage }>(
      `/api/client-packages/${id}/cancel`,
      'POST',
      {},
      token()
    );
    return unwrap<ClientPackage>(res);
  },
};
