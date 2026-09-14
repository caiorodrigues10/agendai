import { apiClient } from './apiClient';
import { authStorage } from './authStorage';
import { buildQuery } from '../utils/query';

export interface Category {
  id: string;
  barbershopId: string | null;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CategoryInput = Pick<Category, 'name'> & Partial<Pick<Category, 'description' | 'icon' | 'color'>> & { barbershopId?: string };

function categoryApi(path: string) {
  const token = () => authStorage.getAccessToken() || '';
  return {
    list: (barbershopId?: string) => apiClient<{ data: Category[] }>(`${path}${buildQuery({ barbershopId })}`, 'GET', undefined, token()).then(res => res.data),
    create: (body: CategoryInput) => apiClient<{ data: Category }>(path, 'POST', body, token()).then(res => res.data),
    update: (id: string, body: Partial<Omit<CategoryInput, 'barbershopId'>> & { active?: boolean }) => apiClient<{ data: Category }>(`${path}/${id}`, 'PATCH', body, token()).then(res => res.data),
    delete: (id: string) => apiClient<void>(`${path}/${id}`, 'DELETE', undefined, token()),
  };
}

export const serviceCategoriesApi = categoryApi('/api/service-categories');
export const expenseCategoriesApi = categoryApi('/api/expense-categories');
