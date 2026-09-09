import React, { useEffect, useState } from 'react';
import {
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  BarChart3,
  Image as ImageIcon,
  Film,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { showcaseApi, ShowcaseEntry } from '../../infra/showcaseApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { getErrorMessage } from '../../utils/errorMessage';

export const ShowcasePanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const { services, staff } = useBarbershop();
  const [entries, setEntries] = useState<ShowcaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'HIDDEN'>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMode, setNewMode] = useState('standard');
  const [newServiceId, setNewServiceId] = useState('');
  const [newStaffId, setNewStaffId] = useState('');

  useEffect(() => {
    if (!barbershopId) return;
    setLoading(true);
    showcaseApi
      .listEntries(barbershopId, filter !== 'ALL' ? { status: filter } : undefined)
      .then(setEntries)
      .catch(err => setError(getErrorMessage(err, 'Erro ao carregar showcase.')))
      .finally(() => setLoading(false));
  }, [barbershopId, filter]);

  const handleCreate = async () => {
    if (!barbershopId || !newTitle.trim()) return;
    setCreating(true);
    setError('');
    try {
      const entry = await showcaseApi.createEntry(barbershopId, {
        postId: '',
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        mode: newMode,
        serviceId: newServiceId || undefined,
        staffId: newStaffId || undefined,
      });
      setEntries(prev => [entry, ...prev]);
      setShowCreate(false);
      setNewTitle('');
      setNewDescription('');
      setNewServiceId('');
      setNewStaffId('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar resultado.'));
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (entry: ShowcaseEntry) => {
    if (!barbershopId) return;
    const newStatus = entry.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED';
    try {
      const updated = await showcaseApi.updateEntry(barbershopId, entry.id, { status: newStatus });
      setEntries(prev => prev.map(e => (e.id === entry.id ? updated : e)));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao alterar status.'));
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!barbershopId) return;
    try {
      await showcaseApi.updateEntry(barbershopId, entryId, { status: 'DELETED' } as any);
      setEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao remover.'));
    }
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...entries];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setEntries(reordered);
    setDragIdx(idx);
  };

  const handleDragEnd = async () => {
    setDragIdx(null);
    if (!barbershopId) return;
    const order = entries.map((e, i) => ({ id: e.id, position: i }));
    try {
      await showcaseApi.reorder(barbershopId, order);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao reordenar.'));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">Showcase / Resultados</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg"
        >
          <Plus size={16} />
          Criar resultado
        </button>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      {/* Create form */}
      {showCreate && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <input
            type="text"
            placeholder="Título do resultado"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newServiceId}
              onChange={e => setNewServiceId(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary"
            >
              <option value="">Serviço (opcional)</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={newStaffId}
              onChange={e => setNewStaffId(e.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary"
            >
              <option value="">Profissional (opcional)</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void handleCreate()}
              disabled={creating || !newTitle.trim()}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {creating ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
              Criar
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {(['ALL', 'DRAFT', 'PUBLISHED', 'HIDDEN'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
              filter === s ? 'bg-accent text-accent-fg' : 'bg-surface text-text-secondary hover:bg-surface-2'
            }`}
          >
            {s === 'ALL' ? 'Todos' : s}
          </button>
        ))}
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <ImageIcon size={32} className="mx-auto text-text-muted" />
          <p className="mt-2 text-sm text-text-secondary">Nenhum resultado no showcase.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, idx) => (
            <div
              key={entry.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => void handleDragOver(e, idx)}
              onDragEnd={() => void handleDragEnd()}
              className={`flex items-center gap-3 rounded-2xl border bg-surface p-3 transition-colors ${
                dragIdx === idx ? 'border-accent bg-accent/5' : 'border-border'
              }`}
            >
              <GripVertical size={16} className="shrink-0 cursor-grab text-text-muted" />

              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                {entry.mediaType?.startsWith('video') ? (
                  <div className="flex h-full items-center justify-center"><Film size={16} className="text-text-muted" /></div>
                ) : entry.mediaUrl ? (
                  <img src={entry.mediaUrl} alt={entry.altText || entry.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><ImageIcon size={16} className="text-text-muted" /></div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-text-primary">{entry.title}</p>
                <p className="text-xs text-text-muted">
                  {entry.serviceName || 'Sem serviço'} · {entry.mode}
                </p>
              </div>

              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                entry.status === 'PUBLISHED' ? 'bg-success/15 text-success' :
                entry.status === 'DRAFT' ? 'bg-warning/15 text-warning' :
                'bg-surface-2 text-text-muted'
              }`}>
                {entry.status}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => void handleToggleStatus(entry)}
                  className="rounded-lg p-2 text-text-muted hover:bg-surface-2"
                  title={entry.status === 'PUBLISHED' ? 'Ocultar' : 'Publicar'}
                >
                  {entry.status === 'PUBLISHED' ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => void handleDelete(entry.id)}
                  className="rounded-lg p-2 text-text-muted hover:bg-error/10 hover:text-error"
                  title="Remover"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
