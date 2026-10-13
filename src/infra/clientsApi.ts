import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { SalonClient } from '../types';
import { buildQuery } from '../utils/query';
import { getSelectedBarbershopId } from './selectedShopStore';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

/** MASTER_ADMIN precisa indicar a barbearia; o BE responde 400 sem barbershopId. */
function resolveBarbershopId(): string | undefined {
  const user = authStorage.getUser();
  if (user?.role === 'MASTER_ADMIN') {
    return getSelectedBarbershopId() ?? undefined;
  }
  return undefined;
}

export interface ListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProcedureRecord {
  id: string;
  barbershopId: string;
  clientId: string;
  professionalName: string;
  title: string;
  formula: string | null;
  details: string | null;
  serviceName: string | null;
  queueItemId: string | null;
  appointmentId: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export type PetSpecies = 'DOG' | 'CAT' | 'OTHER';
export type PetSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';

export interface ClientPet {
  id: string;
  barbershopId: string;
  clientId: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  size: PetSize | null;
  coat: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPetBody {
  name: string;
  species?: PetSpecies;
  breed?: string | null;
  size?: PetSize | null;
  coat?: string | null;
  notes?: string | null;
}

export interface ClientVehicle {
  id: string;
  barbershopId: string;
  clientId: string;
  plate: string;
  vehicleModel: string;
  color: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientVehicleBody {
  plate: string;
  vehicleModel: string;
  color?: string | null;
  notes?: string | null;
}

export const clientsApi = {
  list: async (params?: { search?: string; page?: number; limit?: number }) => {
    const res = await apiClient<{ success: boolean; data: SalonClient[]; meta: ListMeta }>(
      `/api/clients${buildQuery({ ...params, barbershopId: resolveBarbershopId() })}`,
      'GET',
      undefined,
      token()
    );
    return {
      data: unwrap<SalonClient[]>(res),
      meta: (res as { meta?: ListMeta }).meta ?? {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    };
  },

  get: async (id: string) => {
    const res = await apiClient<{ success: boolean; data: SalonClient }>(
      `/api/clients/${id}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<SalonClient>(res);
  },

  create: async (body: { name: string; whatsapp: string; notes?: string | null }) => {
    const barbershopId = resolveBarbershopId();
    const res = await apiClient<{ success: boolean; data: SalonClient }>(
      '/api/clients',
      'POST',
      barbershopId ? { ...body, barbershopId } : body,
      token()
    );
    return unwrap<SalonClient>(res);
  },

  update: async (id: string, body: { name?: string; whatsapp?: string; notes?: string | null }) => {
    const res = await apiClient<{ success: boolean; data: SalonClient }>(
      `/api/clients/${id}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<SalonClient>(res);
  },

  delete: async (id: string) => {
    await apiClient<void>(`/api/clients/${id}`, 'DELETE', undefined, token());
  },

  // Procedure records
  listProcedures: async (clientId: string, limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    const res = await apiClient<{ success: boolean; data: ProcedureRecord[] }>(
      `/api/clients/${clientId}/procedures${query}`,
      'GET',
      undefined,
      token()
    );
    return unwrap<ProcedureRecord[]>(res);
  },

  getLatestProcedure: async (clientId: string) => {
    const res = await apiClient<{ success: boolean; data: ProcedureRecord | null }>(
      `/api/clients/${clientId}/procedures/latest`,
      'GET',
      undefined,
      token()
    );
    return unwrap<ProcedureRecord | null>(res);
  },

  createProcedure: async (clientId: string, body: {
    professionalName: string;
    title: string;
    formula?: string;
    details?: string;
    serviceName?: string;
    queueItemId?: string;
    appointmentId?: string;
    occurredAt?: string;
  }) => {
    const res = await apiClient<{ success: boolean; data: ProcedureRecord }>(
      `/api/clients/${clientId}/procedures`,
      'POST',
      body,
      token()
    );
    return unwrap<ProcedureRecord>(res);
  },

  updateProcedure: async (clientId: string, recordId: string, body: {
    professionalName?: string;
    title?: string;
    formula?: string | null;
    details?: string | null;
    serviceName?: string | null;
  }) => {
    const res = await apiClient<{ success: boolean; data: ProcedureRecord }>(
      `/api/clients/${clientId}/procedures/${recordId}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<ProcedureRecord>(res);
  },

  deleteProcedure: async (clientId: string, recordId: string) => {
    await apiClient<void>(
      `/api/clients/${clientId}/procedures/${recordId}`,
      'DELETE',
      undefined,
      token()
    );
  },

  listPets: async (clientId: string) => {
    const res = await apiClient<{ success: boolean; data: ClientPet[] }>(
      `/api/clients/${clientId}/pets`,
      'GET',
      undefined,
      token()
    );
    return unwrap<ClientPet[]>(res);
  },

  createPet: async (clientId: string, body: ClientPetBody) => {
    const res = await apiClient<{ success: boolean; data: ClientPet }>(
      `/api/clients/${clientId}/pets`,
      'POST',
      body,
      token()
    );
    return unwrap<ClientPet>(res);
  },

  updatePet: async (clientId: string, petId: string, body: Partial<ClientPetBody> & { active?: boolean }) => {
    const res = await apiClient<{ success: boolean; data: ClientPet }>(
      `/api/clients/${clientId}/pets/${petId}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<ClientPet>(res);
  },

  deletePet: async (clientId: string, petId: string) => {
    await apiClient<void>(
      `/api/clients/${clientId}/pets/${petId}`,
      'DELETE',
      undefined,
      token()
    );
  },

  listVehicles: async (clientId: string) => {
    const res = await apiClient<{ success: boolean; data: ClientVehicle[] }>(
      `/api/clients/${clientId}/vehicles`,
      'GET',
      undefined,
      token()
    );
    return unwrap<ClientVehicle[]>(res);
  },

  createVehicle: async (clientId: string, body: ClientVehicleBody) => {
    const res = await apiClient<{ success: boolean; data: ClientVehicle }>(
      `/api/clients/${clientId}/vehicles`,
      'POST',
      body,
      token()
    );
    return unwrap<ClientVehicle>(res);
  },

  updateVehicle: async (
    clientId: string,
    vehicleId: string,
    body: Partial<ClientVehicleBody> & { active?: boolean }
  ) => {
    const res = await apiClient<{ success: boolean; data: ClientVehicle }>(
      `/api/clients/${clientId}/vehicles/${vehicleId}`,
      'PATCH',
      body,
      token()
    );
    return unwrap<ClientVehicle>(res);
  },

  deleteVehicle: async (clientId: string, vehicleId: string) => {
    await apiClient<void>(
      `/api/clients/${clientId}/vehicles/${vehicleId}`,
      'DELETE',
      undefined,
      token()
    );
  },
};
