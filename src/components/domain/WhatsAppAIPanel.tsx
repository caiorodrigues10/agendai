import React, { useEffect, useState, useCallback } from 'react';
import {
  MessageSquare,
  Loader2,
  UserCheck,
  BarChart3,
  Phone,
  Clock,
  ArrowLeft,
  Send,
} from 'lucide-react';
import {
  whatsappAiApi,
  AiConversation,
  AiMessage,
  IntentStats,
} from '../../infra/whatsappAiApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';

type View = 'list' | 'detail' | 'analytics';

const statusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-success/15 text-success';
    case 'TRANSFERRED_TO_HUMAN':
      return 'bg-warning/15 text-warning';
    case 'CLOSED':
      return 'bg-surface-2 text-text-muted';
    default:
      return 'bg-surface-2 text-text-muted';
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'Ativa';
    case 'TRANSFERRED_TO_HUMAN':
      return 'Transferida';
    case 'CLOSED':
      return 'Fechada';
    case 'EXPIRED':
      return 'Expirada';
    default:
      return status;
  }
};

const intentLabel = (intent: string) => {
  const map: Record<string, string> = {
    scheduling: 'Agendamento',
    pricing: 'Preço',
    hours: 'Horário',
    location: 'Localização',
    human_transfer: 'Transferência',
    greeting: 'Saudação',
    farewell: 'Despedida',
    unknown: 'Desconhecido',
  };
  return map[intent] ?? intent;
};

const intentColor = (intent: string) => {
  switch (intent) {
    case 'scheduling':
      return 'bg-accent/15 text-accent';
    case 'pricing':
      return 'bg-success/15 text-success';
    case 'hours':
      return 'bg-info/15 text-info';
    case 'location':
      return 'bg-warning/15 text-warning';
    case 'human_transfer':
      return 'bg-error/15 text-error';
    default:
      return 'bg-surface-2 text-text-muted';
  }
};

export const WhatsAppAIPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [view, setView] = useState<View>('list');
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<(AiConversation & { messages: AiMessage[] }) | null>(null);
  const [stats, setStats] = useState<IntentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [transferring, setTransferring] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError('');
    try {
      const result = await whatsappAiApi.listConversations(barbershopId, {
        status: statusFilter || undefined,
        page,
        limit: 20,
      });
      setConversations(result.conversations);
      setTotal(result.total);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar conversas.'));
    } finally {
      setLoading(false);
    }
  }, [barbershopId, statusFilter, page]);

  useEffect(() => {
    if (view === 'list') loadConversations();
  }, [view, loadConversations]);

  const loadDetail = async (id: string) => {
    if (!barbershopId) return;
    setLoading(true);
    setError('');
    try {
      const detail = await whatsappAiApi.getConversationDetail(barbershopId, id);
      setSelectedConversation(detail);
      setView('detail');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar conversa.'));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError('');
    try {
      const s = await whatsappAiApi.getStats(barbershopId);
      setStats(s);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar estatísticas.'));
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (conversationId: string) => {
    if (!barbershopId) return;
    setTransferring(conversationId);
    try {
      await whatsappAiApi.transferToHuman(barbershopId, conversationId);
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, status: 'TRANSFERRED_TO_HUMAN' } : null);
      }
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, status: 'TRANSFERRED_TO_HUMAN' } : c));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao transferir.'));
    } finally {
      setTransferring(null);
    }
  };

  const totalPages = Math.ceil(total / 20);

  if (loading && view === 'list' && conversations.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">WhatsApp AI</h3>
        <div className="flex gap-2">
          <button
            onClick={() => { setView('list'); setSelectedConversation(null); }}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold ${view === 'list' || view === 'detail' ? 'bg-accent text-accent-fg' : 'bg-surface text-text-secondary hover:bg-surface-2'}`}
          >
            <MessageSquare size={14} className="inline mr-1" />
            Conversas
          </button>
          <button
            onClick={() => { setView('analytics'); loadStats(); }}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold ${view === 'analytics' ? 'bg-accent text-accent-fg' : 'bg-surface text-text-secondary hover:bg-surface-2'}`}
          >
            <BarChart3 size={14} className="inline mr-1" />
            Analytics
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      {view === 'list' && (
        <>
          <div className="flex gap-2 overflow-x-auto">
            {['', 'ACTIVE', 'TRANSFERRED_TO_HUMAN', 'CLOSED'].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
                  statusFilter === s ? 'bg-accent text-accent-fg' : 'bg-surface text-text-secondary hover:bg-surface-2'
                }`}
              >
                {s === '' ? 'Todas' : statusLabel(s)}
              </button>
            ))}
          </div>

          {conversations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
              <MessageSquare size={32} className="mx-auto text-text-muted" />
              <p className="mt-2 text-sm text-text-secondary">Nenhuma conversa encontrada.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => void loadDetail(conv.id)}
                  className="w-full rounded-2xl border border-border bg-surface p-4 text-left space-y-1 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-text-muted" />
                      <span className="text-sm font-bold text-text-primary">{conv.phone}</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColor(conv.status)}`}>
                      {statusLabel(conv.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-text-muted">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={10} /> {conv._count?.messages ?? 0} msgs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {new Date(conv.lastMessageAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </button>
              ))}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg bg-surface px-3 py-1 text-xs font-bold text-text-secondary hover:bg-surface-2 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="text-xs text-text-muted self-center">{page}/{totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg bg-surface px-3 py-1 text-xs font-bold text-text-secondary hover:bg-surface-2 disabled:opacity-40"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {view === 'detail' && selectedConversation && (
        <div className="space-y-3">
          <button
            onClick={() => { setView('list'); setSelectedConversation(null); }}
            className="flex items-center gap-1 text-xs font-bold text-accent hover:text-accent/80"
          >
            <ArrowLeft size={14} /> Voltar
          </button>

          <div className="rounded-2xl border border-border bg-surface p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-text-muted" />
                <span className="text-sm font-bold text-text-primary">{selectedConversation.phone}</span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColor(selectedConversation.status)}`}>
                {statusLabel(selectedConversation.status)}
              </span>
            </div>
            {selectedConversation.status === 'ACTIVE' && (
              <button
                onClick={() => void handleTransfer(selectedConversation.id)}
                disabled={transferring === selectedConversation.id}
                className="flex items-center gap-1 rounded-xl bg-warning/10 px-3 py-1.5 text-xs font-bold text-warning hover:bg-warning/20 disabled:opacity-50"
              >
                {transferring === selectedConversation.id ? (
                  <Loader2 className="animate-spin" size={12} />
                ) : (
                  <UserCheck size={12} />
                )}
                Transferir para humano
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {selectedConversation.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.direction === 'OUTBOUND'
                      ? 'bg-accent text-accent-fg'
                      : 'bg-surface-2 text-text-primary'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] opacity-70">
                    <span>{new Date(msg.sentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.intent && (
                      <span className={`rounded-full px-1.5 py-0.5 font-bold ${intentColor(msg.intent)}`}>
                        {intentLabel(msg.intent)}
                      </span>
                    )}
                    {msg.confidence != null && (
                      <span>{Math.round(msg.confidence * 100)}%</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'analytics' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader2 className="animate-spin text-accent" size={28} />
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                  <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                  <p className="text-xs text-text-muted">Total de Intenções</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                  <p className="text-2xl font-bold text-text-primary">{Math.round(stats.avgConfidence * 100)}%</p>
                  <p className="text-xs text-text-muted">Confiança Média</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4 space-y-2">
                <p className="text-sm font-bold text-text-primary">Por Intenção</p>
                {Object.entries(stats.byIntent).sort((a, b) => b[1] - a[1]).map(([intent, count]) => (
                  <div key={intent} className="flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${intentColor(intent)}`}>
                      {intentLabel(intent)}
                    </span>
                    <span className="text-sm font-bold text-text-primary">{count}</span>
                  </div>
                ))}
                {Object.keys(stats.byIntent).length === 0 && (
                  <p className="text-xs text-text-muted">Nenhum dado disponível.</p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4 space-y-2">
                <p className="text-sm font-bold text-text-primary">Por Atendimento</p>
                {Object.entries(stats.byHandledBy).map(([handledBy, count]) => (
                  <div key={handledBy} className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">{handledBy}</span>
                    <span className="text-sm font-bold text-text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
              <BarChart3 size={32} className="mx-auto text-text-muted" />
              <p className="mt-2 text-sm text-text-secondary">Nenhum dado de analytics disponível.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
