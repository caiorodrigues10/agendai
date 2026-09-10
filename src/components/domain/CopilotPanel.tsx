import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { copilotApi, CopilotSuggestion } from '../../infra/copilotApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';

const priorityLabel = (p: number) => {
  if (p >= 80) return { label: 'Alta', color: 'bg-error/15 text-error' };
  if (p >= 50) return { label: 'Média', color: 'bg-warning/15 text-warning' };
  return { label: 'Baixa', color: 'bg-surface-2 text-text-muted' };
};

export const CopilotPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [suggestions, setSuggestions] = useState<CopilotSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  useEffect(() => {
    if (!barbershopId) return;
    setLoading(true);
    copilotApi
      .listSuggestions(barbershopId, statusFilter !== 'ALL' ? { status: statusFilter } : undefined)
      .then(setSuggestions)
      .catch(err => setError(getErrorMessage(err, 'Erro ao carregar sugestões.')))
      .finally(() => setLoading(false));
  }, [barbershopId, statusFilter]);

  const handleGenerate = async () => {
    if (!barbershopId) return;
    setGenerating(true);
    setError('');
    try {
      const newSuggestions = await copilotApi.generate(barbershopId);
      setSuggestions(prev => [...newSuggestions, ...prev]);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao gerar sugestões.'));
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const updated = await copilotApi.accept(id);
      setSuggestions(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao aceitar.'));
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const updated = await copilotApi.dismiss(id);
      setSuggestions(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao dispensar.'));
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const updated = await copilotApi.markRead(id);
      setSuggestions(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao marcar lida.'));
    }
  };

  const sorted = [...suggestions].sort((a, b) => b.priority - a.priority);

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
        <h3 className="text-lg font-bold text-text-primary">Copilot</h3>
        <button
          onClick={() => void handleGenerate()}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
        >
          {generating ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
          Gerar Sugestões
        </button>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      <div className="flex gap-2 overflow-x-auto">
        {['PENDING', 'ACCEPTED', 'DISMISSED', 'ALL'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
              statusFilter === s ? 'bg-accent text-accent-fg' : 'bg-surface text-text-secondary hover:bg-surface-2'
            }`}
          >
            {s === 'ALL' ? 'Todas' : s === 'PENDING' ? 'Pendentes' : s === 'ACCEPTED' ? 'Aceitas' : 'Dispensadas'}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <Sparkles size={32} className="mx-auto text-text-muted" />
          <p className="mt-2 text-sm text-text-secondary">Nenhuma sugestão disponível.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(sug => {
            const pri = priorityLabel(sug.priority);
            return (
              <div key={sug.id} className="rounded-2xl border border-border bg-surface p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-text-primary">{sug.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pri.color}`}>
                        {pri.label}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">{sug.description}</p>
                    <p className="text-[10px] text-text-muted">{sug.type} · {new Date(sug.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                {sug.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleAccept(sug.id)}
                      className="flex items-center gap-1 rounded-xl bg-success/10 px-3 py-1.5 text-xs font-bold text-success hover:bg-success/20"
                    >
                      <CheckCircle2 size={12} /> Aceitar
                    </button>
                    <button
                      onClick={() => void handleDismiss(sug.id)}
                      className="flex items-center gap-1 rounded-xl bg-error/10 px-3 py-1.5 text-xs font-bold text-error hover:bg-error/20"
                    >
                      <XCircle size={12} /> Dispensar
                    </button>
                    <button
                      onClick={() => void handleMarkRead(sug.id)}
                      className="flex items-center gap-1 rounded-xl bg-surface-2 px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-surface"
                    >
                      <Eye size={12} /> Lida
                    </button>
                  </div>
                )}
                {sug.status !== 'PENDING' && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    sug.status === 'ACCEPTED' ? 'bg-success/15 text-success' : 'bg-surface-2 text-text-muted'
                  }`}>
                    {sug.status === 'ACCEPTED' ? 'Aceita' : 'Dispensada'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
