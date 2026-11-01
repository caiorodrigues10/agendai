import React, { useEffect, useState } from 'react';
import { LuLoader, LuRefreshCw, LuWifiOff } from 'react-icons/lu';
import {
  adminWhatsappApi,
  type WhatsAppInstance,
  type WhatsAppInstanceState,
} from '../../infra/adminWhatsappApi';
import { WhatsAppTabs } from './WhatsAppTabs';
import { SectionError, Tooltip } from '../../components/patterns';
import { PaginationBar } from '../../components/ui/PaginationBar';
import { AccountActionDialog } from './AccountActionDialog';
import { useAuth } from '../../contexts/AuthContext';
import { INTERNAL_PERMISSIONS, hasInternalPermission } from '../../utils/internalPermissions';

type InstanceAction = 'reconnect' | 'logout';

const KIND_LABEL: Record<string, string> = {
  ai: 'IA',
  platform: 'Plataforma',
  shop: 'Salão',
};

const STATE_LABEL: Record<WhatsAppInstanceState, string> = {
  open: 'Aberta',
  connecting: 'Conectando',
  close: 'Fechada',
  unreachable: 'Inacessível',
};

const STATE_STYLE: Record<WhatsAppInstanceState, string> = {
  open: 'bg-success/15 text-success',
  connecting: 'bg-warning/15 text-warning',
  close: 'bg-border text-text-muted',
  unreachable: 'bg-danger/15 text-danger',
};

const ACTION_COPY: Record<InstanceAction, { title: string; message: string; confirm: string; danger: boolean }> = {
  reconnect: {
    title: 'Reconectar instância',
    message: 'A instância será reconectada. Se ainda não estiver aberta, um QR code será exibido para leitura.',
    confirm: 'Reconectar',
    danger: false,
  },
  logout: {
    title: 'Deslogar instância',
    message: 'O WhatsApp desta instância será desconectado. Os envios param até uma nova conexão.',
    confirm: 'Deslogar',
    danger: true,
  },
};

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Não foi possível concluir a ação.';
}

function StateBadge({ item }: { item: WhatsAppInstance }) {
  const badge = (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATE_STYLE[item.state]}`}
      data-state={item.state}
    >
      {item.state === 'unreachable' && <LuWifiOff size={12} aria-hidden="true" />}
      {STATE_LABEL[item.state]}
    </span>
  );

  if (item.state !== 'unreachable' || !item.error) return badge;

  return (
    <Tooltip label={item.error}>
      <span className="inline-flex">{badge}</span>
    </Tooltip>
  );
}

export const WhatsAppInstancesPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<WhatsAppInstance[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<{ item: WhatsAppInstance; kind: InstanceAction } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<{ name: string; data: string } | null>(null);

  const canManage = hasInternalPermission(user?.internalPermissions, INTERNAL_PERMISSIONS.WHATSAPP_MANAGE);

  const load = async (page = meta.page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminWhatsappApi.instances({ page, limit: 20 });
      setItems(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const openAction = (item: WhatsAppInstance, kind: InstanceAction) => {
    setActionError(null);
    setAction({ item, kind });
  };

  const closeAction = () => {
    if (actionLoading) return;
    setAction(null);
    setActionError(null);
  };

  const runAction = async (reason: string) => {
    if (!action?.item.shopId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      if (action.kind === 'reconnect') {
        const res = await adminWhatsappApi.reconnect(action.item.shopId, reason);
        if (res.data.qrcodeBase64) {
          setQrCode({ name: action.item.name, data: res.data.qrcodeBase64 });
        }
      } else {
        await adminWhatsappApi.logout(action.item.shopId, reason);
      }
      setAction(null);
      await load(meta.page);
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && items.length === 0) {
    return <div className="p-6 text-text-muted"><LuLoader className="animate-spin" /></div>;
  }
  if (error) return <SectionError message={error} onRetry={() => load(meta.page)} />;

  const copy = action ? ACTION_COPY[action.kind] : null;

  return (
    <div className="p-6 space-y-4">
      <WhatsAppTabs />
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">WhatsApp — Instâncias</h1>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-2"
          onClick={() => load(meta.page)}
        >
          <LuRefreshCw size={14} aria-hidden="true" /> Atualizar
        </button>
      </div>

      {actionError && !action && (
        <p role="alert" className="text-sm text-danger">{actionError}</p>
      )}

      {items.length === 0 ? (
        <p className="text-text-muted">Nenhuma instância configurada.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-border">
              <th className="p-2">Tipo</th>
              <th className="p-2">Nome</th>
              <th className="p-2">Estado</th>
              {canManage && <th className="p-2">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.kind}-${item.shopId ?? item.name}`} className="border-b border-border">
                <td className="p-2">{KIND_LABEL[item.kind] ?? item.kind}</td>
                <td className="p-2">
                  {item.shopName ? `${item.shopName} · ${item.name}` : item.name}
                </td>
                <td className="p-2"><StateBadge item={item} /></td>
                {canManage && (
                  <td className="p-2">
                    {item.kind === 'shop' && item.shopId ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-2 py-1 rounded text-xs border border-border hover:bg-surface-2"
                          onClick={() => openAction(item, 'reconnect')}
                        >
                          Reconectar
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 rounded text-xs bg-danger text-danger-fg hover:bg-danger/90"
                          onClick={() => openAction(item, 'logout')}
                        >
                          Deslogar
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted">Gerenciada pela plataforma</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <PaginationBar page={meta.page} totalPages={meta.totalPages} onPageChange={(page) => load(page)} />

      {qrCode && (
        <section className="rounded-xl border border-border p-4 space-y-2" aria-label="QR code de reconexão">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">QR code — {qrCode.name}</h2>
            <button
              type="button"
              className="text-xs text-text-muted hover:text-text-primary"
              onClick={() => setQrCode(null)}
            >
              Fechar
            </button>
          </div>
          <img src={qrCode.data} alt={`QR code para reconectar ${qrCode.name}`} className="h-56 w-56 bg-white p-2" />
          <p className="text-xs text-text-muted">Abra o WhatsApp, vá em Dispositivos conectados e leia o código.</p>
        </section>
      )}

      <AccountActionDialog
        open={!!action && !!copy}
        title={copy?.title ?? ''}
        message={copy?.message ?? ''}
        confirmLabel={copy?.confirm}
        danger={copy?.danger}
        loading={actionLoading}
        error={actionError}
        onConfirm={runAction}
        onCancel={closeAction}
      />
    </div>
  );
};
export default WhatsAppInstancesPage;
