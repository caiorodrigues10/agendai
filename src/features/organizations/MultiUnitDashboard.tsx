import { useState } from 'react';
import { LuLogIn as LogIn, LuPlus as Plus, LuStore as Store, LuUnlink as Unlink } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { useOrganizationDashboard } from '@/hooks/useOrganizationDashboard';
import { AvailableBarbershop, organizationsApi, OrganizationDashboardShop } from '@/infra/organizationsApi';
import { getErrorMessage } from '@/utils/errorMessage';
import { useAuth } from '@/contexts/AuthContext';
import { useBarbershopFilters } from '@/contexts/BarbershopFiltersContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SectionError } from '../../components/patterns';

const primary =
  'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-50';
const secondary =
  'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-bg px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-2 disabled:opacity-50';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function ShopCard({
  shop,
  isCurrent,
  onDetach,
  onAccess,
}: {
  shop: OrganizationDashboardShop;
  isCurrent: boolean;
  onDetach: () => void;
  onAccess: () => Promise<void>;
}) {
  const [accessing, setAccessing] = useState(false);
  const [accessError, setAccessError] = useState('');

  async function access() {
    setAccessing(true);
    setAccessError('');
    try {
      await onAccess();
    } catch (err) {
      setAccessError(getErrorMessage(err, 'Não foi possível acessar este salão.'));
    } finally {
      setAccessing(false);
    }
  }

  return (
    <li data-testid="shop-card" className="rounded-xl border border-border bg-bg p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="min-w-0 truncate font-semibold">{shop.name}</span>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              shop.isOpen ? 'bg-success/15 text-success' : 'bg-surface-2 text-text-muted'
            }`}
          >
            {shop.isOpen ? 'Aberto' : 'Fechado'}
          </span>
          {shop.accessLevel === 'FULL' && (
            <button
              type="button"
              disabled={isCurrent || accessing}
              onClick={() => void access()}
              aria-label={isCurrent ? `${shop.name} é o salão atual` : `Acessar ${shop.name}`}
              title={isCurrent ? 'Você já está operando este salão' : 'Operar este salão'}
              className={primary}
            >
              <LogIn size={14} />
              {isCurrent ? 'Salão atual' : accessing ? 'Acessando…' : 'Acessar'}
            </button>
          )}
          <button
            type="button"
            onClick={onDetach}
            aria-label={`Desanexar ${shop.name}`}
            title="Desanexar da organização"
            className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger"
          >
            <Unlink size={14} />
          </button>
        </div>
      </div>
      {accessError && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {accessError}
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-surface-2 p-3 text-center">
          <p className="text-[11px] text-text-muted">Na fila</p>
          <p className="text-xl font-bold">{shop.waitingCount}</p>
        </div>
        <div className="rounded-lg bg-surface-2 p-3 text-center">
          <p className="text-[11px] text-text-muted">Em atendimento</p>
          <p className="text-xl font-bold">{shop.inServiceCount}</p>
        </div>
      </div>
      {shop.accessLevel === 'FULL' && shop.revenue && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-sm text-text-secondary">
          <span>
            Hoje: <strong className="text-text-primary">{brl.format(shop.revenue.today)}</strong>
          </span>
          <span>
            Mês: <strong className="text-text-primary">{brl.format(shop.revenue.month)}</strong>
          </span>
        </div>
      )}
    </li>
  );
}

function AddShopControl({ orgId, onAdded }: { orgId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState<AvailableBarbershop[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    setAvailable(null); // reseta o cache da lista anterior para não piscar antes do novo fetch
    setOpen(true);
    try {
      setAvailable(await organizationsApi.listAvailableBarbershops(orgId));
    } catch (err) {
      setAvailable([]);
      setError(getErrorMessage(err, 'Não foi possível carregar os salões disponíveis.'));
    }
  }

  async function attach(id: string) {
    setBusyId(id);
    setError('');
    try {
      await organizationsApi.attachBarbershop(orgId, id);
      setOpen(false);
      setAvailable(null);
      onAdded();
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível adicionar o salão.'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : void load())}
        className={secondary}
      >
        <Plus size={14} /> Adicionar salão
      </button>
      {open && (
        <div className="mt-2 w-full rounded-xl border border-border bg-bg p-3" role="group" aria-label="Salões disponíveis">
          {error && (
            <p role="alert" className="mb-2 text-xs text-danger">
              {error}
            </p>
          )}
          {available === null ? (
            <p role="status" className="text-xs text-text-secondary">
              Carregando salões…
            </p>
          ) : available.length === 0 ? (
            <p className="text-xs text-text-secondary">Nenhum salão disponível para anexar.</p>
          ) : (
            <ul className="space-y-2">
              {available.map(shop => (
                <li key={shop.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm">{shop.name}</span>
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => void attach(shop.id)}
                    className={primary}
                  >
                    {busyId === shop.id ? 'Adicionando…' : 'Adicionar'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Dashboard multiunidades de uma organização: um card por salão com fila e
 * atendimento como números separados, faturamento só para acesso FULL e
 * atualização ao vivo via WS (orquestrada pelo useOrganizationDashboard — não
 * reimplementar WS/poll aqui).
 */
export function MultiUnitDashboard({ orgId }: { orgId: string }) {
  const { shops, loading, error, refetch } = useOrganizationDashboard(orgId);
  const { switchShop, user } = useAuth();
  const { barbershopId } = useBarbershopFilters();
  const navigate = useNavigate();
  const [detachTarget, setDetachTarget] = useState<OrganizationDashboardShop | null>(null);
  const [detaching, setDetaching] = useState(false);
  const [detachError, setDetachError] = useState('');

  const activeShopId = barbershopId ?? user?.barbershopId ?? null;

  /** Passa a operar no salão e leva o usuário para o início do painel (/app → /app/overview). */
  async function handleAccess(shop: OrganizationDashboardShop) {
    const result = await switchShop(orgId, shop.barbershopId);
    if (!result.ok) throw new Error(result.message);
    navigate('/app');
  }

  async function confirmDetach() {
    if (!detachTarget) return;
    setDetaching(true);
    setDetachError('');
    try {
      await organizationsApi.detachBarbershop(orgId, detachTarget.barbershopId);
      setDetachTarget(null);
      void refetch();
    } catch (err) {
      setDetachError(getErrorMessage(err, 'Não foi possível desanexar o salão.'));
      setDetachTarget(null);
    } finally {
      setDetaching(false);
    }
  }

  if (loading) {
    return (
      <p role="status" className="py-4 text-sm text-text-secondary">
        Carregando salões…
      </p>
    );
  }

  if (error) {
    return <SectionError message={error} onRetry={() => void refetch()} />;
  }

  if (shops.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-strong bg-bg px-4 py-6 text-center">
        <Store size={24} className="mx-auto mb-2 text-text-muted" />
        <p className="text-sm text-text-secondary">Nenhum salão nesta organização ainda.</p>
        <div className="mt-3 flex justify-center">
          <AddShopControl orgId={orgId} onAdded={() => void refetch()} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <AddShopControl orgId={orgId} onAdded={() => void refetch()} />
      </div>
      {detachError && <SectionError message={detachError} />}
      <ul className="grid gap-3 sm:grid-cols-2">
        {shops.map(shop => (
          <ShopCard
            key={shop.barbershopId}
            shop={shop}
            isCurrent={activeShopId === shop.barbershopId}
            onAccess={() => handleAccess(shop)}
            onDetach={() => {
              setDetachError('');
              setDetachTarget(shop);
            }}
          />
        ))}
      </ul>
      <ConfirmDialog
        open={detachTarget !== null}
        title="Desanexar salão da organização"
        message="O salão continuará ativo, apenas deixará de fazer parte desta organização. Você poderá anexá-lo novamente depois."
        confirmLabel="Desanexar"
        variant="danger"
        loading={detaching}
        onConfirm={() => void confirmDetach()}
        onCancel={() => {
          if (!detaching) {
            setDetachTarget(null);
            setDetachError('');
          }
        }}
      />
    </div>
  );
}
