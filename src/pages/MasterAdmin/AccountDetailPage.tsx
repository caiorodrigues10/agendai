import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  LuLoader,
  LuTriangleAlert,
  LuArrowLeft,
  LuUsers,
  LuCalendarCheck,
  LuScissors,
  LuPackage,
  LuTicket,
  LuCreditCard,
} from 'react-icons/lu';
import { adminInternalApi, AccountDetail } from '../../infra/adminInternalApi';
import { AccountActionsPanel } from './AccountActionsPanel';
import { OwnerInvitePanel } from './OwnerInvitePanel';

const brl = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });

const APPROVAL_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
};

const SUBSCRIPTION_LABEL: Record<string, string> = {
  TRIALING: 'Em trial',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Em atraso',
  PENDING: 'Pendente',
  CANCELED: 'Cancelada',
  UNPAID: 'Não paga',
};

const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
  CHECKED_IN: 'Check-in',
  NO_SHOW: 'Faltou',
};

const ROLE_LABEL: Record<string, string> = {
  MASTER_ADMIN: 'Master',
  OWNER: 'Donos',
  EMPLOYEE: 'Funcionários',
  CUSTOMER: 'Clientes',
};

const severityTone: Record<string, string> = {
  danger: 'border-danger/40 bg-danger/10 text-danger',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  info: 'border-accent/40 bg-accent/10 text-accent',
};

interface StatCard {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}

const Stat: React.FC<StatCard> = ({ label, value, sub, icon }) => (
  <div className="bg-surface border border-border rounded-xl p-4">
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</span>
      <span className="text-accent">{icon}</span>
    </div>
    <p className="text-2xl font-bold mt-2">{value}</p>
    {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
  </div>
);

export const AccountDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  /** Rota de origem (ex.: lista de contas com filtros) enviada por `state.from`. */
  const backTo = (location.state as { from?: string } | null)?.from ?? '/master/accounts';
  const [data, setData] = useState<AccountDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    adminInternalApi
      .getAccount(id)
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Não foi possível carregar os dados da conta.');
      });
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  if (!data && !error) {
    return (
      <div className="flex justify-center py-20">
        <LuLoader className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-20">
        <LuTriangleAlert className="mx-auto mb-2 text-warning" size={24} />
        <p className="text-sm text-text-secondary">{error}</p>
        <button
          onClick={() => setReloadKey((key) => key + 1)}
          className="text-accent text-sm mt-2 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { shop, members, subscription, billing, usage, attention, invite } = data;

  const stats: StatCard[] = [
    {
      label: 'Membros',
      value: String(members.total),
      sub: `${members.active} ativo(s)`,
      icon: <LuUsers size={16} />,
    },
    {
      label: 'Agendamentos (30d)',
      value: String(usage.appointments30d),
      sub: `${usage.appointments} no total`,
      icon: <LuCalendarCheck size={16} />,
    },
    {
      label: 'Concluídos (30d)',
      value: String(usage.completed30d),
      sub: `${usage.clients} clientes`,
      icon: <LuCalendarCheck size={16} />,
    },
    {
      label: 'Serviços ativos',
      value: String(usage.servicesActive),
      sub: `${usage.productsActive} produtos ativos`,
      icon: <LuScissors size={16} />,
    },
    {
      label: 'Fila',
      value: String(usage.queueEntries),
      sub: 'registros no histórico',
      icon: <LuPackage size={16} />,
    },
    {
      label: 'Chamados',
      value: String(usage.tickets),
      sub: 'atendimentos internos',
      icon: <LuTicket size={16} />,
    },
  ];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(backTo)}
        className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
      >
        <LuArrowLeft size={14} /> Voltar para contas
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">{shop.name}</h1>
          <p className="text-sm text-text-muted">
            {shop.whatsapp}
            {shop.city ? ` · ${shop.city}` : ''}
            {shop.cnpj ? ` · CNPJ ${shop.cnpj}` : ''} · criada em {formatDate(shop.createdAt)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                shop.active ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
              }`}
            >
              {shop.active ? 'Ativa' : 'Inativa'}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                shop.approvalStatus === 'APPROVED'
                  ? 'text-success bg-success/10'
                  : shop.approvalStatus === 'PENDING'
                    ? 'text-warning bg-warning/10'
                    : 'text-danger bg-danger/10'
              }`}
            >
              {APPROVAL_LABEL[shop.approvalStatus]}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          <LuTriangleAlert size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
          {success}
        </div>
      )}

      <AccountActionsPanel
        shop={shop}
        subscription={subscription}
        onDone={() => {
          setSuccess('Ação executada com sucesso.');
          setReloadKey((key) => key + 1);
        }}
      />

      {attention.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold">Pontos de atenção</h2>
          {attention.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
                severityTone[item.severity] ?? severityTone.info
              }`}
            >
              <LuTriangleAlert size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs opacity-80">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <OwnerInvitePanel
          shopId={shop.id}
          invite={invite ?? null}
          onReload={() => setReloadKey((key) => key + 1)}
        />

        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <LuCreditCard size={16} className="text-accent" /> Assinatura
          </h2>
          {subscription ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-text-muted">Plano</span>
                <span className="font-medium">{subscription.plan.name}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-text-muted">Status</span>
                <span className="font-medium">{SUBSCRIPTION_LABEL[subscription.status] ?? subscription.status}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-text-muted">Valor</span>
                <span className="font-medium">
                  {brl(subscription.plan.price)} /{' '}
                  {subscription.plan.billingCycle === 'YEARLY' ? 'ano' : 'mês'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-text-muted">Início</span>
                <span>{formatDate(subscription.startDate)}</span>
              </div>
              {subscription.endDate && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-text-muted">Término</span>
                  <span>{formatDate(subscription.endDate)}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-muted">Sem assinatura registrada.</p>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <LuCreditCard size={16} className="text-accent" /> Faturamento
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-muted">Faturas</span>
              <span className="font-medium">{billing.invoicesTotal}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-muted">Pagas</span>
              <span className="font-medium text-success">{billing.paid}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-muted">Vencidas</span>
              <span className={`font-medium ${billing.overdue > 0 ? 'text-danger' : ''}`}>
                {billing.overdue}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-muted">Pendentes</span>
              <span className="font-medium">{billing.pending}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-muted">Total recebido</span>
              <span className="font-medium">{brl(billing.sumPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <LuUsers size={16} className="text-accent" /> Equipe
        </h2>
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries(members.byRole).length === 0 && (
            <span className="text-text-muted">Nenhum membro vinculado.</span>
          )}
          {Object.entries(members.byRole).map(([role, count]) => (
            <span key={role} className="text-text-secondary">
              <span className="font-bold text-text-primary">{count}</span>{' '}
              {ROLE_LABEL[role] ?? role}
            </span>
          ))}
        </div>
        {usage.lastAppointment && (
          <p className="text-xs text-text-muted">
            Último agendamento:{' '}
            {formatDateTime(
              `${usage.lastAppointment.date.slice(0, 10)}T${usage.lastAppointment.time}:00`,
            )}{' '}
            · {APPOINTMENT_STATUS_LABEL[usage.lastAppointment.status] ?? usage.lastAppointment.status}
          </p>
        )}
      </div>
    </div>
  );
};

export default AccountDetailPage;
