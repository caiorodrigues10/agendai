import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Loader2,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { qualityApi, QualityProtocol, QualityAudit, QualityOverview } from '../../infra/qualityApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { SmartSelect } from '../ui/SmartSelect';

export const QualityPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [protocols, setProtocols] = useState<QualityProtocol[]>([]);
  const [audits, setAudits] = useState<QualityAudit[]>([]);
  const [overview, setOverview] = useState<QualityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'protocols' | 'audits' | 'overview'>('protocols');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // Audit form
  const [showAudit, setShowAudit] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [auditProtocolId, setAuditProtocolId] = useState('');
  const [auditScore, setAuditScore] = useState(80);
  const [auditNotes, setAuditNotes] = useState('');

  useEffect(() => {
    if (!barbershopId) return;
    setLoading(true);
    Promise.all([
      qualityApi.listProtocols(barbershopId),
      qualityApi.listAudits(barbershopId),
      qualityApi.getOverview(barbershopId),
    ])
      .then(([p, a, o]) => { setProtocols(p); setAudits(a); setOverview(o); })
      .catch(err => setError(getErrorMessage(err, 'Erro ao carregar qualidade.')))
      .finally(() => setLoading(false));
  }, [barbershopId]);

  const handleCreateProtocol = async () => {
    if (!barbershopId || !newTitle.trim() || !newCategory.trim()) return;
    setCreating(true);
    setError('');
    try {
      const p = await qualityApi.createProtocol(barbershopId, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory.trim(),
      });
      setProtocols(prev => [...prev, p]);
      setShowCreate(false);
      setNewTitle('');
      setNewDescription('');
      setNewCategory('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar protocolo.'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProtocol = async (protocolId: string) => {
    if (!barbershopId) return;
    try {
      await qualityApi.deleteProtocol(barbershopId, protocolId);
      setProtocols(prev => prev.filter(p => p.id !== protocolId));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao remover.'));
    }
  };

  const handleRunAudit = async () => {
    if (!barbershopId || !auditProtocolId) return;
    setAuditing(true);
    setError('');
    try {
      const a = await qualityApi.runAudit(barbershopId, {
        protocolId: auditProtocolId,
        score: auditScore,
        notes: auditNotes.trim() || undefined,
      });
      setAudits(prev => [a, ...prev]);
      setShowAudit(false);
      setAuditNotes('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao executar auditoria.'));
    } finally {
      setAuditing(false);
    }
  };

  const trendIcon = (t: string) => {
    if (t === 'UP') return <TrendingUp size={14} className="text-success" />;
    if (t === 'DOWN') return <TrendingDown size={14} className="text-error" />;
    return <Minus size={14} className="text-text-muted" />;
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
        <h3 className="text-lg font-bold text-text-primary">Qualidade</h3>
        <div className="flex gap-2">
          {tab === 'protocols' && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg"
            >
              <Plus size={16} /> Protocolo
            </button>
          )}
          {tab === 'audits' && (
            <button
              onClick={() => setShowAudit(!showAudit)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg"
            >
              <ClipboardCheck size={16} /> Auditoria
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      <div className="flex gap-2 overflow-x-auto">
        {(['protocols', 'audits', 'overview'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
              tab === t ? 'bg-accent text-accent-fg' : 'bg-surface text-text-secondary hover:bg-surface-2'
            }`}
          >
            {t === 'protocols' ? 'Protocolos' : t === 'audits' ? 'Auditorias' : 'Painel'}
          </button>
        ))}
      </div>

      {tab === 'protocols' && showCreate && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <input
            type="text"
            placeholder="Título do protocolo"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <textarea
            placeholder="Descrição"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none resize-none"
          />
          <input
            type="text"
            placeholder="Categoria (ex: Higiene, Atendimento)"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => void handleCreateProtocol()}
              disabled={creating || !newTitle.trim() || !newCategory.trim()}
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

      {tab === 'audits' && showAudit && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <SmartSelect
            value={auditProtocolId || null}
            onChange={val => setAuditProtocolId(val ?? '')}
            options={protocols.map(p => ({ value: p.id, label: p.title }))}
            placeholder="Selecionar protocolo"
          />
          <div>
            <label className="text-xs text-text-muted">Pontuação: {auditScore}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={auditScore}
              onChange={e => setAuditScore(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <textarea
            placeholder="Notas (opcional)"
            value={auditNotes}
            onChange={e => setAuditNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => void handleRunAudit()}
              disabled={auditing || !auditProtocolId}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {auditing ? <Loader2 className="animate-spin" size={14} /> : <ClipboardCheck size={14} />}
              Executar
            </button>
            <button
              onClick={() => setShowAudit(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {tab === 'overview' && overview && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface p-4 text-center">
              <p className="text-2xl font-bold text-accent">{overview.averageScore.toFixed(1)}</p>
              <p className="text-xs text-text-muted">Média</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 text-center">
              <p className="text-2xl font-bold text-text-primary">{overview.totalAudits}</p>
              <p className="text-xs text-text-muted">Auditorias</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 text-center">
              <p className="text-2xl font-bold text-text-primary">{overview.protocolsActive}</p>
              <p className="text-xs text-text-muted">Protocolos</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 text-center flex flex-col items-center">
              {trendIcon(overview.recentTrend)}
              <p className="text-xs text-text-muted mt-1">Tendência</p>
            </div>
          </div>
          {overview.breakdownByCategory.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-4 space-y-2">
              <p className="text-xs font-bold text-text-secondary">Por Categoria</p>
              {overview.breakdownByCategory.map(c => (
                <div key={c.category} className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">{c.category}</span>
                  <span className="text-sm font-bold text-accent">{c.avgScore.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'protocols' && (
        protocols.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <ShieldCheck size={32} className="mx-auto text-text-muted" />
            <p className="mt-2 text-sm text-text-secondary">Nenhum protocolo criado.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {protocols.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text-primary">{p.title}</p>
                  <p className="text-xs text-text-muted">{p.category} · {p.description}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.isActive ? 'bg-success/15 text-success' : 'bg-surface-2 text-text-muted'}`}>
                  {p.isActive ? 'Ativo' : 'Inativo'}
                </span>
                <button
                  onClick={() => void handleDeleteProtocol(p.id)}
                  className="rounded-lg p-2 text-text-muted hover:bg-error/10 hover:text-error"
                  title="Remover"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'audits' && (
        audits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <ClipboardCheck size={32} className="mx-auto text-text-muted" />
            <p className="mt-2 text-sm text-text-secondary">Nenhuma auditoria registrada.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {audits.map(a => (
              <div key={a.id} className="rounded-2xl border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text-primary">{a.protocolTitle}</span>
                  <span className={`text-sm font-bold ${a.score >= 70 ? 'text-success' : a.score >= 40 ? 'text-warning' : 'text-error'}`}>
                    {a.score}
                  </span>
                </div>
                <p className="text-xs text-text-muted">{a.auditorName} · {new Date(a.createdAt).toLocaleDateString('pt-BR')}</p>
                {a.notes && <p className="mt-1 text-xs text-text-secondary">{a.notes}</p>}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
