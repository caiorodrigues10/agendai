import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBarbershopFilters } from '../contexts/BarbershopFiltersContext';
import { Category, serviceCategoriesApi, expenseCategoriesApi } from '../infra/categoriesApi';
import { getErrorMessage } from '../utils/errorMessage';

export function useCategories(kind: 'service' | 'expense') {
  const { user } = useAuth();
  const { barbershopId: selectedShop } = useBarbershopFilters();
  const barbershopId = user?.role === 'MASTER_ADMIN' ? selectedShop : user?.barbershopId;
  const api = kind === 'service' ? serviceCategoriesApi : expenseCategoriesApi;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);
  const reload = useCallback(async () => {
    const version = ++request.current;
    setLoading(true);
    setError(null);
    try {
      const items = await api.list(barbershopId || undefined);
      if (version === request.current) setCategories(items);
    } catch (err) {
      if (version === request.current) setError(getErrorMessage(err));
    } finally {
      if (version === request.current) setLoading(false);
    }
  }, [api, barbershopId]);
  useEffect(() => {
    setCategories([]);
    void reload();
    return () => { request.current++; };
  }, [reload]);
  const canCreate = user?.role === 'MASTER_ADMIN' || (user?.role === 'OWNER' && !!barbershopId);
  const canEdit = (category: Category) => user?.role === 'MASTER_ADMIN' ||
    (user?.role === 'OWNER' && !!barbershopId && category.barbershopId === barbershopId);
  const changed = (id: string, category: Category | null) => {
    request.current++;
    setLoading(false);
    setCategories(items => [...items.filter(item => item.id !== id), ...(category ? [category] : [])].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
  };
  return { categories, loading, error, reload, api, barbershopId, canCreate, canEdit, changed };
}
