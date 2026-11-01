import React, { useCallback, useEffect, useState } from 'react';
import { WhatsAppTabs } from './WhatsAppTabs';
import {
  adminWhatsappApi,
  type AiConversationDetail,
  type AiConversationSummary,
  type WhatsAppShop,
} from '../../infra/adminWhatsappApi';
import { ModalShell } from '../../components/patterns/ModalShell';
import { DataTableState } from '../../components/patterns/states/DataTableState';
import { PaginationBar } from '../../components/ui/PaginationBar';
import { AccountActionDialog } from './AccountActionDialog';
import { useAuth } from '../../contexts/AuthContext';
import { INTERNAL_PERMISSIONS, hasInternalPermission } from '../../utils/internalPermissions';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativa' },
  { value: 'TRANSFERRED_TO_HUMAN', label: 'Transferida' },
  { value: 'CLOSED', label: 'Encerrada' },
  { value: 'EXPIRED', label: 'Expirada' },
];

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Não foi possível concluir a ação.';
}

interface ConversationFiltersProps {
  shops: WhatsAppShop[];
  barbershopId: string;
  status: string;
  onShopChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onApply: () => void;
}

function ConversationFilters({
  shops,
  barbershopId,
  status,
  onShopChange,
  onStatusChange,
  onApply,
}: ConversationFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-sm" htmlFor="whatsapp-conversations-shop">Salão</label>
      <select
        id="whatsapp-conversations-shop"
        className="rounded-lg border border-border bg-bg px-2 py-1 text-sm"
        value={barbershopId}
        onChange={(e) => onShopChange(e.target.value)}
      >
        <option value="">Todos</option>
        {shops.map((shop) => (
          <option key={shop.id} value={shop.id}>{shop.name}</option>
        ))}
      </select>

      <label className="text-sm" htmlFor="whatsapp-conversations-status">Status</label>
      <select
        id="whatsapp-conversations-status"
        className="rounded-lg border border-border bg-bg px-2 py-1 text-sm"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">Todos</option>
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>

      <button type="button" className="rounded-lg border border-border px-3 py-1 text-sm" onClick={onApply}>
        Filtrar
      </button>
    </div>
  );
}

interface ConversationTableProps {
  conversations: AiConversationSummary[];
  onOpen: (id: string) => void;
}

function ConversationTable({ conversations, onOpen }: ConversationTableProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b border-border">
          <th className="p-2">Salão</th>
          <th className="p-2">Telefone</th>
          <th className="p-2">Status</th>
          <th className="p-2">Msgs</th>
          <th className="p-2">Ações</th>
        </tr>
      </thead>
      <tbody>
        {conversations.map((conversation) => (
          <tr key={conversation.id} className="border-b border-border">
            <td className="p-2">{conversation.barbershopName ?? conversation.barbershopId}</td>
            <td className="p-2">{conversation.phoneMasked ?? '—'}</td>
            <td className="p-2">{conversation.status}</td>
            <td className="p-2">{conversation.messageCount}</td>
            <td className="p-2">
              <button
                type="button"
                className="rounded bg-accent px-2 py-1 text-xs text-accent-fg"
                onClick={() => onOpen(conversation.id)}
              >
                Ver
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const WhatsAppConversationsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<AiConversationSummary[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [shops, setShops] = useState<WhatsAppShop[]>([]);
  const [page, setPage] = useState(1);
  const [barbershopId, setBarbershopId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AiConversationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  const canManage = hasInternalPermission(user?.internalPermissions, INTERNAL_PERMISSIONS.WHATSAPP_MANAGE);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await adminWhatsappApi.aiConversations({
        page: targetPage,
        limit: 20,
        barbershopId: barbershopId || undefined,
        status: status || undefined,
      });
      setItems(res.data);
      setMeta(res.meta);
      setPage(res.meta.page);
    } catch (e) {
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [barbershopId, status]);

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      await load(1);
    })();
    return () => { active = false; };
  }, [load]);

  useEffect(() => {
    let active = true;
    adminWhatsappApi
      .shops({ limit: 50 })
      .then((res) => { if (active) setShops(res.data); })
      .catch(() => { if (active) setShops([]); });
    return () => { active = false; };
  }, []);

  const openDetail = async (id: string) => {
    setDetail(null);
    setActionError(null);
    setDetailLoading(true);
    try {
      const res = await adminWhatsappApi.aiConversationDetail(id);
      setDetail(res.data);
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setDetailLoading(false);
    }
  };

  const transfer = async (reason: string) => {
    if (!detail) return;
    setTransferLoading(true);
    setActionError(null);
    try {
      await adminWhatsappApi.aiTransfer(detail.id, reason);
      setTransferOpen(false);
      setDetail(null);
      await load(page);
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setTransferLoading(false);
    }
  };

  const showTable = !loading && !loadError && items.length > 0;

  return (
    <div className="p-6 space-y-4">
      <WhatsAppTabs />
      <h1 className="text-xl font-bold">WhatsApp — Conversas (IA)</h1>

      {actionError && !transferOpen && (
        <p role="alert" className="text-sm text-danger">{actionError}</p>
      )}

      <ConversationFilters
        shops={shops}
        barbershopId={barbershopId}
        status={status}
        onShopChange={(value) => { setBarbershopId(value); setPage(1); }}
        onStatusChange={(value) => { setStatus(value); setPage(1); }}
        onApply={() => load(1)}
      />

      <DataTableState
        loading={loading}
        error={loadError}
        onRetry={() => load(page)}
        isEmpty={!loading && !loadError && items.length === 0}
        emptyTitle="Nenhuma conversa encontrada"
        emptyDescription="Ajuste os filtros para ver outras conversas."
        skeletonProps={{ rows: 5, cols: 5 }}
      />

      {showTable && <ConversationTable conversations={items} onOpen={openDetail} />}

      <PaginationBar page={meta.page} totalPages={meta.totalPages} onPageChange={(next) => load(next)} />

      <ModalShell
        open={detailLoading || !!detail}
        title="Conversa"
        titleId="conv-detail"
        onClose={() => { setDetail(null); setTransferOpen(false); }}
      >
        {detail && (
          <div className="space-y-2">
            <p className="text-xs text-text-muted">
              {detail.phoneMasked ?? '—'} — {detail.barbershopName ?? detail.barbershopId}
            </p>
            <div className="max-h-64 space-y-1 overflow-auto">
              {detail.messages.map((message) => (
                <div key={message.id} className={`text-sm ${message.direction === 'INBOUND' ? 'text-left' : 'text-right'}`}>
                  <span className="inline-block rounded border border-border bg-surface px-2 py-1">{message.content}</span>
                </div>
              ))}
            </div>
            {canManage && (
              <button
                type="button"
                className="rounded bg-danger px-3 py-1 text-white"
                onClick={() => { setActionError(null); setTransferOpen(true); }}
              >
                Transferir para humano
              </button>
            )}
          </div>
        )}
      </ModalShell>

      <AccountActionDialog
        open={transferOpen}
        title="Transferir para humano"
        message="A conversa será encerrada e marcada como transferida. O motivo fica registrado na auditoria."
        confirmLabel="Transferir"
        danger
        loading={transferLoading}
        error={actionError}
        onConfirm={transfer}
        onCancel={() => { if (!transferLoading) { setTransferOpen(false); setActionError(null); } }}
      />
    </div>
  );
};
export default WhatsAppConversationsPage;
