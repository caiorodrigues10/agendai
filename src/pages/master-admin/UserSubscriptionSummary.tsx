import { useEffect, useState } from 'react';
import { LuArrowUpRight, LuCalendarDays, LuCreditCard } from 'react-icons/lu';
import { adminInternalApi, type AccountDetail } from '../../infra/adminInternalApi';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ExtendTrialFields } from './ExtendTrialFields';

const labels: Record<string, string> = {
  ACTIVE: 'Ativa',
  TRIALING: 'Em período grátis',
  PENDING: 'Aguardando pagamento',
  PAST_DUE: 'Pagamento em atraso',
  CANCELED: 'Cancelada',
  UNPAID: 'Não paga',
};
const date = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

export function UserSubscriptionSummary({ shopId }: { shopId: string }) {
  const [snapshot, setSnapshot] = useState<{
    id: string;
    data?: AccountDetail;
    error?: boolean;
  } | null>(null);
  const [retry, setRetry] = useState(0);
  const [notice, setNotice] = useState<{ id: string; days: number } | null>(null);
  useEffect(() => {
    if (!shopId) return;
    let active = true;
    setSnapshot(null);
    adminInternalApi
      .getAccount(shopId)
      .then(({ data }) => {
        if (active) setSnapshot({ id: shopId, data });
      })
      .catch(() => {
        if (active) setSnapshot({ id: shopId, error: true });
      });
    return () => {
      active = false;
    };
  }, [shopId, retry]);

  const current = snapshot?.id === shopId ? snapshot : null;
  const data = current?.data;
  const access = data?.access;
  const subscription = data?.subscription;
  const statusLabel = access?.planActive
    ? 'Plano ativo'
    : access && subscription?.status === 'ACTIVE'
      ? 'Plano vencido'
      : access && subscription?.status === 'TRIALING' && access.trialDaysRemaining === 0
        ? 'Período grátis encerrado'
        : subscription
          ? (labels[subscription.status] ?? subscription.status)
          : 'Sem assinatura';
  return (
    <section
      aria-label="Assinatura do salão"
      className="overflow-hidden rounded-2xl border border-border bg-bg/50"
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <LuCreditCard aria-hidden="true" className="text-accent" size={18} />
        <h4 className="text-sm font-semibold text-text-primary">Assinatura do salão</h4>
        {data && (
          <a
            href={`/master/accounts/${shopId}`}
            className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Ver conta <LuArrowUpRight aria-hidden="true" />
          </a>
        )}
      </div>
      {!shopId ? (
        <p className="p-4 text-sm text-text-secondary">
          Sem salão vinculado. A assinatura e o período grátis pertencem ao salão.
        </p>
      ) : !current ? (
        <p role="status" className="p-4 text-sm text-text-secondary">
          Consultando plano e período grátis…
        </p>
      ) : current.error ? (
        <div role="alert" className="space-y-3 p-4">
          <p className="text-sm text-text-secondary">
            Não foi possível consultar a assinatura. Você ainda pode editar o usuário.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSnapshot(null);
              setRetry(value => value + 1);
            }}
          >
            Tentar novamente
          </Button>
        </div>
      ) : data ? (
        <div className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs text-text-muted">Plano de {data.shop.name}</p>
              <p className="mt-1 font-semibold text-text-primary">
                {subscription?.plan.name ?? 'Nenhum plano contratado'}
              </p>
            </div>
            <StatusBadge
              tone={
                access?.planActive
                  ? 'success'
                  : subscription?.status === 'PAST_DUE' || subscription?.status === 'UNPAID'
                    ? 'danger'
                    : 'neutral'
              }
            >
              {statusLabel}
            </StatusBadge>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-3">
              <dt className="flex items-center gap-1.5 text-xs text-text-secondary">
                <LuCalendarDays aria-hidden="true" size={14} />
                Período grátis
              </dt>
              <dd className="mt-1 text-lg font-semibold text-text-primary">
                {access
                  ? `${access.trialDaysRemaining} ${access.trialDaysRemaining === 1 ? 'dia restante' : 'dias restantes'}`
                  : 'Não informado'}
              </dd>
              <dd className="mt-1 text-xs text-text-muted">
                {access
                  ? `${access.trialDaysRemaining > 0 ? 'Termina' : 'Encerrado'} em ${date(access.trialEndDate)}`
                  : 'Não foi possível consultar os dias restantes.'}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <dt className="text-xs text-text-secondary">Acesso por assinatura</dt>
              <dd
                className={`mt-1 text-lg font-semibold ${access?.subscriptionAccessAllowed ? 'text-success' : 'text-text-primary'}`}
              >
                {access
                  ? access.subscriptionAccessAllowed
                    ? 'Liberado'
                    : 'Não liberado'
                  : 'Não informado'}
              </dd>
              <dd className="mt-1 text-xs text-text-muted">
                {subscription?.endDate
                  ? `Validade cadastrada: ${date(subscription.endDate)}`
                  : 'A conta do usuário também precisa estar ativa.'}
              </dd>
            </div>
          </dl>
          <p className="text-xs leading-relaxed text-text-muted">
            Informações do salão selecionado. Alterar o usuário não modifica o plano nem o período
            grátis.
          </p>
        </div>
      ) : null}
      {data && (
        <ExtendTrialFields
          key={shopId}
          shopId={shopId}
          shopName={data.shop.name}
          canExtend={subscription?.status === 'TRIALING'}
          onExtended={days => {
            setNotice({ id: shopId, days });
            setRetry(value => value + 1);
          }}
        />
      )}
      {notice?.id === shopId && (
        <p
          role="status"
          className="border-t border-success/20 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {notice.days} {notice.days === 1 ? 'dia adicionado' : 'dias adicionados'} ao período
          grátis.
        </p>
      )}
    </section>
  );
}
