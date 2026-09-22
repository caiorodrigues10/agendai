import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LuArrowLeft, LuLoader, LuTriangleAlert, LuSend, LuClock, LuUser, LuTag, LuMessageSquare
} from 'react-icons/lu';
import { adminInternalApi, Ticket } from '../../infra/adminInternalApi';
import { useAuth } from '../../contexts/AuthContext';

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'text-danger bg-danger/10',
  HIGH: 'text-warning bg-warning/10',
  NORMAL: 'text-accent bg-accent/10',
  LOW: 'text-text-muted bg-surface-2',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'text-support bg-support/10',
  IN_PROGRESS: 'text-accent bg-accent/10',
  WAITING_SHOP: 'text-warning bg-warning/10',
  RESOLVED: 'text-success bg-success/10',
  CANCELLED: 'text-text-muted bg-surface-2',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberto', IN_PROGRESS: 'Em atendimento', WAITING_SHOP: 'Aguardando salão',
  RESOLVED: 'Resolvido', CANCELLED: 'Cancelado',
};

const CHANNEL_LABELS: Record<string, string> = {
  WHATSAPP: 'WhatsApp', EMAIL: 'E-mail', PHONE: 'Telefone', OTHER: 'Outro',
};

const CATEGORY_LABELS: Record<string, string> = {
  ACCESS: 'Acesso', BILLING: 'Cobrança', SCHEDULE: 'Agenda',
  ERROR: 'Erro', QUESTION: 'Dúvida',
};

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminInternalApi.getTicket(id);
      setTicket(data);
    } catch {
      setError('Chamado não encontrado.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    setActionError(null);
    try {
      const updated = await adminInternalApi.updateTicket(ticket.id, {
        status: newStatus,
        version: ticket.version!,
      });
      setTicket({ ...ticket, ...updated });
    } catch (err: any) {
      setActionError(err?.message ?? 'Erro ao atualizar status.');
    }
  };

  const handleAssign = async () => {
    if (!ticket || !user) return;
    setActionError(null);
    try {
      const updated = await adminInternalApi.updateTicket(ticket.id, {
        assignedToId: user.id,
        status: 'IN_PROGRESS',
        version: ticket.version!,
      });
      setTicket({ ...ticket, ...updated });
    } catch (err: any) {
      setActionError(err?.message ?? 'Erro ao assumir chamado.');
    }
  };

  const handleAddComment = async () => {
    if (!ticket || !commentText.trim()) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const comment = await adminInternalApi.addTicketComment(ticket.id, commentText.trim());
      setTicket({
        ...ticket,
        comments: [...(ticket.comments ?? []), comment],
      });
      setCommentText('');
    } catch (err: any) {
      setActionError(err?.message ?? 'Erro ao adicionar comentário.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LuLoader className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-20">
        <LuTriangleAlert className="mx-auto mb-3 text-warning" size={32} />
        <p className="text-text-secondary mb-3">{error ?? 'Chamado não encontrado.'}</p>
        <button onClick={() => navigate('/master/tickets')} className="text-accent text-sm hover:underline">
          Voltar para a lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/master/tickets')} className="mt-1 p-1 rounded hover:bg-surface-2">
          <LuArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-text-muted">{ticket.protocol}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${PRIORITY_COLORS[ticket.priority]}`}>
              {ticket.priority}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[ticket.status]}`}>
              {STATUS_LABELS[ticket.status]}
            </span>
          </div>
          <h1 className="text-lg font-bold mt-1">{ticket.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
            <span className="flex items-center gap-1"><LuTag size={12} /> {CHANNEL_LABELS[ticket.channel] ?? ticket.channel}</span>
            <span className="flex items-center gap-1"><LuClock size={12} /> {new Date(ticket.createdAt).toLocaleString('pt-BR')}</span>
            {ticket.barbershop && <span>{ticket.barbershop.name}</span>}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        {!ticket.assignedTo?.id && ticket.status === 'OPEN' && (
          <button onClick={handleAssign} className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover">
            Assumir chamado
          </button>
        )}
        {ticket.status === 'OPEN' && (
          <button onClick={() => handleStatusChange('IN_PROGRESS')} className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-surface-2">
            Iniciar atendimento
          </button>
        )}
        {ticket.status === 'IN_PROGRESS' && (
          <>
            <button onClick={() => handleStatusChange('WAITING_SHOP')} className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-surface-2">
              Aguardar salão
            </button>
            <button onClick={() => handleStatusChange('RESOLVED')} className="px-3 py-1.5 bg-success/10 text-success border border-success/30 rounded-lg text-sm hover:bg-success/20">
              Resolver
            </button>
          </>
        )}
        {ticket.status === 'WAITING_SHOP' && (
          <button onClick={() => handleStatusChange('IN_PROGRESS')} className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-surface-2">
            Retomar atendimento
          </button>
        )}
        {['OPEN', 'IN_PROGRESS', 'WAITING_SHOP'].includes(ticket.status) && (
          <button onClick={() => handleStatusChange('CANCELLED')} className="px-3 py-1.5 border border-danger/30 text-danger rounded-lg text-sm hover:bg-danger/10">
            Cancelar
          </button>
        )}
      </div>

      {actionError && (
        <p className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{actionError}</p>
      )}

      {/* Description */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="text-sm font-bold mb-2">Descrição</h2>
        <p className="text-sm text-text-secondary whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetaItem label="Categoria" value={CATEGORY_LABELS[ticket.category] ?? ticket.category} />
        <MetaItem label="Criado por" value={ticket.createdBy.name} />
        <MetaItem label="Responsável" value={ticket.assignedTo?.name ?? '—'} />
        <MetaItem label="Prioridade" value={ticket.priority} />
      </div>

      {/* Comments */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <LuMessageSquare size={14} /> Comentários ({ticket.comments?.length ?? 0})
          </h2>
        </div>
        <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
          {(ticket.comments ?? []).length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-text-muted">Nenhum comentário ainda.</p>
          ) : (
            (ticket.comments ?? []).map((c) => (
              <div key={c.id} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold">
                    {c.author.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium">{c.author.name}</span>
                  <span className="text-xs text-text-muted">
                    {new Date(c.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-text-secondary ml-8 whitespace-pre-wrap">{c.text}</p>
              </div>
            ))
          )}
        </div>
        {/* New comment */}
        <div className="p-3 border-t border-border flex gap-2">
          <input
            type="text"
            placeholder="Adicionar comentário..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim() || submitting}
            className="px-3 py-2 bg-accent text-white rounded-lg text-sm disabled:opacity-40"
          >
            <LuSend size={14} />
          </button>
        </div>
      </div>

      {/* History */}
      {(ticket.history ?? []).length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <h2 className="text-sm font-bold mb-3">Histórico</h2>
          <div className="space-y-2">
            {(ticket.history ?? []).map((h) => (
              <div key={h.id} className="flex items-start gap-3 text-xs">
                <span className="text-text-muted shrink-0">
                  {new Date(h.createdAt).toLocaleString('pt-BR')}
                </span>
                <span className="font-medium">{h.actor.name}</span>
                <span className="text-text-muted">
                  alterou <span className="font-medium text-accent">{h.field}</span>
                  {h.oldValue && <span> de "{h.oldValue}"</span>}
                  {h.newValue && <span> para "{h.newValue}"</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MetaItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-surface border border-border rounded-xl p-3">
    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

export default TicketDetailPage;
