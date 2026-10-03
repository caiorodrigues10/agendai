import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuSearch, LuLoader, LuTriangleAlert, LuArrowRight, LuBuilding2 } from 'react-icons/lu';
import { apiClient } from '../../infra/apiClient';
import { authStorage } from '../../infra/authStorage';

interface Barbershop {
  id: string;
  name: string;
  whatsapp: string;
  active: boolean;
  approvalStatus: string;
  createdAt: string;
  _count: { users: number; tickets: number };
}

export const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ limit: '50' });
      if (search) q.set('search', search);
      const res = await apiClient<{ success: boolean; data: Barbershop[] }>(
        `/api/admin/barbershops?${q.toString()}`, 'GET', undefined, authStorage.getAccessToken() || ''
      );
      setShops(res.data);
    } catch {
      setError('Não foi possível carregar as contas.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <div className="flex justify-center py-20"><LuLoader className="animate-spin text-accent" size={32} /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <LuTriangleAlert className="mx-auto mb-2 text-warning" size={24} />
        <p className="text-sm text-text-secondary">{error}</p>
        <button onClick={load} className="text-accent text-sm mt-2 hover:underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <LuBuilding2 size={20} /> Contas dos salões
      </h1>

      <div className="relative">
        <LuSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text" placeholder="Buscar salão..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border/50">
        {shops.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-text-muted">Nenhum salão encontrado.</p>
        ) : (
          shops.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-2 transition-colors">
              <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-xs text-text-muted">{s.whatsapp}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
                <span>{s._count.users} membros</span>
                <span>{s._count.tickets} chamados</span>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                s.active ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
              }`}>
                {s.active ? 'Ativo' : 'Inativo'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AccountsPage;
