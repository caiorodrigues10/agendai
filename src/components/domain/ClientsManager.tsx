import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  RiAddLine,
  RiLoader4Line,
  RiSearchLine,
  RiUserAddLine,
} from 'react-icons/ri';
import { SalonClient } from '../../types';
import { clientsApi, ListMeta } from '../../infra/clientsApi';
import { maskPhone, normalizePhoneBR } from '../../utils/documentUtils';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR, FORM_GRID } from '../ui/Field';
import { ClientCreateSchema, ClientCreateFormData } from '../../schemas';

function clientPhoneLabel(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, '');
  if (digits.length >= 10 && digits.length <= 11) return maskPhone(whatsapp);
  return 'Sem WhatsApp';
}

interface ClientsManagerProps {
  selectedId: string | null;
  onSelectClient: (id: string | null) => void;
  refreshSignal?: number;
}

export const ClientsManager: React.FC<ClientsManagerProps> = ({
  selectedId,
  onSelectClient,
  refreshSignal = 0,
}) => {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<SalonClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<ListMeta>({ total: 0, page: 1, limit: 15, totalPages: 1 });

  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientCreateFormData>({
    resolver: zodResolver(ClientCreateSchema),
    defaultValues: { name: '', whatsapp: '' },
  });

  const requestSeq = useRef(0);

  const loadList = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const result = await clientsApi.list({ search: search.trim() || undefined, page, limit: 15 });
      if (seq !== requestSeq.current) return; // resposta obsoleta (corrida de buscas)
      // Página além do total (ex.: após filtro/exclusão): volta para a última válida
      if (page > result.meta.totalPages) {
        setPage(result.meta.totalPages);
        return;
      }
      setClients(result.data);
      setMeta(result.meta);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setError(getErrorMessage(err));
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [search, page]);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(loadList, 300);
    return () => clearTimeout(t);
  }, [loadList, refreshSignal, reloadKey]);

  const handleCreate = async (data: ClientCreateFormData) => {
    setSaving(true);
    setError(null);
    try {
      const created = await clientsApi.create({
        name: data.name.trim(),
        whatsapp: normalizePhoneBR(data.whatsapp),
      });
      reset();
      setShowCreate(false);
      setPage(1);
      setReloadKey(k => k + 1);
      onSelectClient(created.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Clientes</h3>
          <p className="text-xs text-text-muted">Cadastro, pacotes e histórico</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1 rounded-lg border border-accent/50 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent"
        >
          <RiAddLine size={14} /> Cadastrar
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {showCreate && (
        <form
          onSubmit={handleSubmit(handleCreate)}
          className="space-y-4 rounded-xl border border-border bg-surface p-4"
        >
          <div className={FORM_GRID}>
            <Field label="Nome" error={errors.name?.message}>
              <input
                className={errors.name ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                placeholder="Nome do cliente"
                {...register('name')}
              />
            </Field>
            <Field label="WhatsApp" error={errors.whatsapp?.message}>
              <input
                className={errors.whatsapp ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                placeholder="(00) 00000-0000"
                {...register('whatsapp', {
                  onChange: e => {
                    e.target.value = maskPhone(e.target.value);
                  },
                })}
              />
            </Field>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-bold text-accent-fg disabled:opacity-50"
          >
            <RiUserAddLine size={16} /> {saving ? 'Salvando…' : 'Salvar cliente'}
          </button>
        </form>
      )}

      <div className="relative">
        <RiSearchLine
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text-primary"
          placeholder="Buscar por nome ou WhatsApp"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-text-muted">
          <RiLoader4Line size={18} className="animate-spin text-accent" />
          Carregando…
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-text-muted">Nenhum cliente cadastrado.</p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="mt-3 text-sm font-bold text-accent"
          >
            Cadastrar primeiro cliente
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {clients.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectClient(c.id)}
                className={`w-full rounded-xl border bg-surface px-4 py-3 text-left transition-colors ${
                  selectedId === c.id
                    ? 'border-accent ring-1 ring-accent/30'
                    : 'border-border hover:border-border-strong'
                }`}
              >
                <p className="font-medium text-text-primary">{c.name}</p>
                <p className="text-xs text-text-muted">
                  {clientPhoneLabel(c.whatsapp)} · {c.remainingSessions} sessão(ões) ·{' '}
                  {c.activePackageCount} pacote(s)
                </p>
              </button>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
              >
                Anterior
              </button>
              <span>
                Página {meta.page} de {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
