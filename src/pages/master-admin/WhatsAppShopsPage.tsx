import React, { useCallback, useEffect, useState } from 'react';
import { WhatsAppTabs } from './WhatsAppTabs';
import { LuLoader } from 'react-icons/lu';
import { adminWhatsappApi, type WhatsAppShop } from '../../infra/adminWhatsappApi';
import { SectionError } from '../../components/patterns';
import { PaginationBar } from '../../components/ui/PaginationBar';
import { AccountActionDialog } from './AccountActionDialog';
import { useAuth } from '../../contexts/AuthContext';
import { INTERNAL_PERMISSIONS, hasInternalPermission } from '../../utils/internalPermissions';

type BatchTarget = 'ai' | 'owner';

interface SingleConfirm {
  id: string;
  action: 'ai' | 'owner';
  value: boolean;
}

interface BatchConfirm {
  target: BatchTarget;
  enabled: boolean;
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Não foi possível concluir a ação.';
}

interface BatchBarProps {
  count: number;
  onAction: (target: BatchTarget, enabled: boolean) => void;
  onClear: () => void;
}

function BatchBar({ count, onAction, onClear }: BatchBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
      <span className="font-medium">{count} selecionado(s)</span>
      <button type="button" className="rounded bg-success px-2 py-1 text-xs text-white" onClick={() => onAction('ai', true)}>
        Ligar IA
      </button>
      <button type="button" className="rounded bg-border px-2 py-1 text-xs" onClick={() => onAction('ai', false)}>
        Desligar IA
      </button>
      <button type="button" className="rounded bg-success px-2 py-1 text-xs text-white" onClick={() => onAction('owner', true)}>
        Ligar assistente
      </button>
      <button type="button" className="rounded bg-border px-2 py-1 text-xs" onClick={() => onAction('owner', false)}>
        Desligar assistente
      </button>
      <button type="button" className="ml-auto text-xs text-text-muted hover:text-text-primary" onClick={onClear}>
        Limpar seleção
      </button>
    </div>
  );
}

interface ShopsTableProps {
  shops: WhatsAppShop[];
  canManage: boolean;
  selected: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onSingleAction: (target: SingleConfirm) => void;
}

function ShopsTable({ shops, canManage, selected, onToggle, onToggleAll, onSingleAction }: ShopsTableProps) {
  const allSelected = shops.length > 0 && selected.length === shops.length;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b border-border">
          {canManage && (
            <th className="p-2">
              <input type="checkbox" aria-label="Selecionar todos os salões" checked={allSelected} onChange={onToggleAll} />
            </th>
          )}
          <th className="p-2">Nome</th>
          <th className="p-2">IA</th>
          <th className="p-2">Assistente</th>
          <th className="p-2">Instância</th>
        </tr>
      </thead>
      <tbody>
        {shops.map((shop) => (
          <tr key={shop.id} className="border-b border-border">
            {canManage && (
              <td className="p-2">
                <input
                  type="checkbox"
                  aria-label={`Selecionar ${shop.name}`}
                  checked={selected.includes(shop.id)}
                  onChange={() => onToggle(shop.id)}
                />
              </td>
            )}
            <td className="p-2">{shop.name}</td>
            <td className="p-2">
              <button
                type="button"
                disabled={!canManage}
                className={`rounded px-2 py-1 text-xs ${shop.whatsappAiEnabled ? 'bg-success text-white' : 'bg-border'} disabled:opacity-60`}
                onClick={() => onSingleAction({ id: shop.id, action: 'ai', value: !shop.whatsappAiEnabled })}
              >
                {shop.whatsappAiEnabled ? 'Ligada' : 'Desligada'}
              </button>
            </td>
            <td className="p-2">
              <button
                type="button"
                disabled={!canManage}
                className={`rounded px-2 py-1 text-xs ${shop.ownerBot?.enabled ? 'bg-success text-white' : 'bg-border'} disabled:opacity-60`}
                onClick={() => onSingleAction({ id: shop.id, action: 'owner', value: !(shop.ownerBot?.enabled ?? false) })}
              >
                {shop.ownerBot?.enabled ? 'Ligado' : 'Desligado'}
              </button>
            </td>
            <td className="p-2 text-xs text-text-muted">{shop.evolutionInstanceName ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const WhatsAppShopsPage: React.FC = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState<WhatsAppShop[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<SingleConfirm | null>(null);
  const [batchConfirm, setBatchConfirm] = useState<BatchConfirm | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const canManage = hasInternalPermission(user?.internalPermissions, INTERNAL_PERMISSIONS.WHATSAPP_MANAGE);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminWhatsappApi.shops({ page, limit: 20, search });
      setShops(res.data);
      setMeta(res.meta);
      setSelected((current) => current.filter((id) => res.data.some((shop) => shop.id === id)));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    let active = true;
    void (async () => {
      await Promise.resolve();
      if (!active) return;
      await load(1);
    })();
    return () => { active = false; };
  }, [load]);

  const toggleSelected = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggleAll = () => {
    setSelected((current) =>
      current.length === shops.length ? [] : shops.map((shop) => shop.id),
    );
  };

  const doToggle = async (submittedReason: string) => {
    if (!confirm) return;
    setActionLoading(true);
    setActionError(null);
    try {
      if (confirm.action === 'ai') {
        await adminWhatsappApi.patchShopAi(confirm.id, { enabled: confirm.value, reason: submittedReason });
      } else {
        await adminWhatsappApi.patchShopOwnerBot(confirm.id, { enabled: confirm.value, reason: submittedReason });
      }
      setConfirm(null);
      await load(meta.page);
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const doBatch = async (submittedReason: string) => {
    if (!batchConfirm || selected.length === 0) return;
    setActionLoading(true);
    setActionError(null);
    try {
      if (batchConfirm.target === 'ai') {
        await adminWhatsappApi.batchPatchShopAi(selected, batchConfirm.enabled, submittedReason);
      } else {
        await adminWhatsappApi.batchPatchShopOwnerBot(
          selected,
          { enabled: batchConfirm.enabled },
          submittedReason,
        );
      }
      setBatchConfirm(null);
      setSelected([]);
      await load(meta.page);
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && shops.length === 0) {
    return <div className="p-6 text-text-muted"><LuLoader className="animate-spin" /></div>;
  }
  if (error) return <SectionError message={error} onRetry={() => load(meta.page)} />;

  return (
    <div className="p-6 space-y-4">
      <WhatsAppTabs />
      <h1 className="text-xl font-bold">WhatsApp — Salões</h1>

      {actionError && !confirm && !batchConfirm && (
        <p role="alert" className="text-sm text-danger">{actionError}</p>
      )}

      <input
        className="rounded border border-border bg-bg p-2 text-sm"
        placeholder="Buscar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && load(1)}
      />

      {canManage && selected.length > 0 && (
        <BatchBar
          count={selected.length}
          onAction={(target, enabled) => { setActionError(null); setBatchConfirm({ target, enabled }); }}
          onClear={() => setSelected([])}
        />
      )}

      {shops.length === 0 ? (
        <p className="text-text-muted">Nenhum salão encontrado.</p>
      ) : (
        <ShopsTable
          shops={shops}
          canManage={canManage}
          selected={selected}
          onToggle={toggleSelected}
          onToggleAll={toggleAll}
          onSingleAction={(target) => { setActionError(null); setConfirm(target); }}
        />
      )}

      <PaginationBar page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load(p)} />

      <AccountActionDialog
        open={!!confirm}
        title="Confirmar alteração"
        message="Ação sobre salão."
        confirmLabel="Confirmar"
        loading={actionLoading}
        error={actionError}
        onConfirm={doToggle}
        onCancel={() => { if (!actionLoading) { setConfirm(null); setActionError(null); } }}
      />

      <AccountActionDialog
        open={!!batchConfirm}
        title="Confirmar ação em lote"
        message={
          batchConfirm
            ? `${batchConfirm.enabled ? 'Ligar' : 'Desligar'} ${batchConfirm.target === 'ai' ? 'IA' : 'assistente'} em ${selected.length} salão(ões).`
            : ''
        }
        confirmLabel="Confirmar"
        loading={actionLoading}
        error={actionError}
        onConfirm={doBatch}
        onCancel={() => { if (!actionLoading) { setBatchConfirm(null); setActionError(null); } }}
      />
    </div>
  );
};
export default WhatsAppShopsPage;
