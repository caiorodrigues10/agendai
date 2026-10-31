import React, { useEffect, useState } from 'react';
import {
  LuCalendarDays as CalendarDays,
  LuClock as Clock,
  LuGift as Gift,
  LuLoaderCircle as Loader2,
  LuLogOut as LogOut,
  LuPhone as Phone,
  LuStore as Store,
  LuUnlink as Unlink,
  LuUser as User,
} from 'react-icons/lu';
import { PageHeader, SectionError, Tabs } from '../../components/patterns';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SmartSelect } from '../../components/ui/SmartSelect';
import {
  ClientAppointment,
  ClientBenefit,
  ClientIdentity,
  clientPortalApi,
  ClientSalonLink,
} from '../../infra/clientPortalApi';
import { getErrorMessage } from '../../utils/errorMessage';

type PortalTab = 'home' | 'salons' | 'appointments' | 'benefits' | 'account';

const TABS: {
  id: PortalTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: 'home', label: 'Início', icon: Store },
  { id: 'salons', label: 'Meus salões', icon: Store },
  { id: 'appointments', label: 'Agenda', icon: CalendarDays },
  { id: 'benefits', label: 'Benefícios', icon: Gift },
  { id: 'account', label: 'Conta', icon: User },
];

export const ClientPortalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PortalTab>('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [identity, setIdentity] = useState<ClientIdentity | null>(null);
  const [salons, setSalons] = useState<ClientSalonLink[]>([]);
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [benefits, setBenefits] = useState<ClientBenefit[]>([]);
  const [retry, setRetry] = useState(0);
  const [listRetry, setListRetry] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [pendingUnlink, setPendingUnlink] = useState<ClientSalonLink | null>(null);
  const [unlinking, setUnlinking] = useState(false);
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [me, salonLinks] = await Promise.all([
          clientPortalApi.getMe(),
          clientPortalApi.getSalons(),
        ]);
        if (cancelled) return;
        setIdentity(me);
        setSalons(salonLinks);
        if (salonLinks.length > 0) {
          setSelectedSalonId(salonLinks[0].barbershopId);
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Erro ao carregar dados.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [retry]);

  useEffect(() => {
    let cancelled = false;
    setAppointments([]);
    setBenefits([]);
    setListError('');
    if (!selectedSalonId || !['home', 'appointments', 'benefits'].includes(activeTab)) {
      setListLoading(false);
      return;
    }
    setListLoading(true);
    const request =
      activeTab === 'benefits'
        ? clientPortalApi.getBenefits(selectedSalonId).then(rows => {
            if (!cancelled) setBenefits(rows);
          })
        : clientPortalApi.getAppointments(selectedSalonId).then(rows => {
            if (!cancelled) setAppointments(rows);
          });
    void request
      .catch(err => {
        if (!cancelled)
          setListError(getErrorMessage(err, 'Não foi possível carregar os dados deste salão.'));
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSalonId, activeTab, listRetry]);

  const handleLogout = async () => {
    try {
      await clientPortalApi.logout();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  const handleUnlink = async (linkId: string) => {
    if (unlinking) return;
    setUnlinking(true);
    setError('');
    try {
      await clientPortalApi.unlinkSalon(linkId);
      const remaining = salons.filter(s => s.id !== linkId);
      setSalons(remaining);
      if (!remaining.some(salon => salon.barbershopId === selectedSalonId)) {
        setSelectedSalonId(remaining[0]?.barbershopId ?? null);
      }
      setPendingUnlink(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao desvincular.'));
    } finally {
      setUnlinking(false);
    }
  };

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Carregando sua conta"
        className="flex min-h-[400px] items-center justify-center"
      >
        <Loader2 className="animate-spin text-text-muted" size={32} />
      </div>
    );
  }

  const nextAppointment = [...appointments]
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .find(a => a.status === 'CONFIRMED' || a.status === 'PENDING');

  return (
    <div className="mx-auto max-w-2xl space-y-4 py-4">
      <PageHeader
        as="h1"
        title="Minha conta"
        description="Seus salões, agendamentos e benefícios."
      />
      {error && !pendingUnlink && (
        <SectionError message={error} onRetry={() => setRetry(n => n + 1)} />
      )}
      {salons.length > 1 && (
        <SmartSelect
          label="Salão"
          value={selectedSalonId}
          onChange={setSelectedSalonId}
          clearable={false}
          options={salons.map(salon => ({
            value: salon.barbershopId,
            label: salon.barbershopName || salon.barbershopId,
          }))}
        />
      )}
      <Tabs<PortalTab>
        ariaLabel="Áreas da minha conta"
        items={TABS.map(({ id, label }) => ({ id, label }))}
        value={activeTab}
        onChange={setActiveTab}
      >
        <div className="space-y-4">
          {listLoading && (
            <p role="status" className="py-4 text-sm text-text-secondary">
              Carregando dados do salão…
            </p>
          )}
          {listError && (
            <SectionError message={listError} onRetry={() => setListRetry(n => n + 1)} />
          )}
          {/* Home */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-text-muted">
                  Bem-vindo
                </p>
                <h3 className="mt-1 text-lg font-bold text-text-primary">
                  {identity?.name || 'Cliente'}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">{identity?.phone}</p>
              </div>

              {nextAppointment && (
                <div className="rounded-2xl border border-accent/30 bg-selection p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-tertiary">
                    Próximo agendamento
                  </p>
                  <h4 className="mt-1 font-bold text-text-primary">
                    {nextAppointment.serviceName}
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    {nextAppointment.barbershopName} · {dateLabel(nextAppointment.date)} às{' '}
                    {nextAppointment.time}
                  </p>
                  {nextAppointment.staffName && (
                    <p className="mt-0.5 text-xs text-text-muted">
                      com {nextAppointment.staffName}
                    </p>
                  )}
                </div>
              )}

              {salons.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
                  <Store size={32} className="mx-auto text-text-muted" />
                  <p className="mt-2 text-sm text-text-secondary">Nenhum salão vinculado ainda.</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Peça ao salão para vincular seu número.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Salons */}
          {activeTab === 'salons' && (
            <div className="space-y-3">
              {salons.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
                  <p className="text-sm text-text-secondary">Nenhum salão vinculado.</p>
                </div>
              )}
              {salons.map(salon => (
                <div
                  key={salon.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
                >
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      {salon.barbershopName || salon.barbershopId}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Status:{' '}
                      <span
                        className={salon.status === 'CONFIRMED' ? 'text-success' : 'text-warning'}
                      >
                        {statusLabel(salon.status)}
                      </span>
                    </p>
                    {salon.salonClientName && (
                      <p className="text-xs text-text-muted">
                        Nome no salão: {salon.salonClientName}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setPendingUnlink(salon);
                    }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger"
                    aria-label={`Desvincular ${salon.barbershopName || 'salão'}`}
                    title="Desvincular"
                  >
                    <Unlink size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Appointments */}
          {activeTab === 'appointments' && (
            <div className="space-y-3">
              {!listLoading && !listError && appointments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
                  <CalendarDays size={32} className="mx-auto text-text-muted" />
                  <p className="mt-2 text-sm text-text-secondary">Nenhum agendamento.</p>
                </div>
              )}
              {appointments.map(appt => (
                <div key={appt.id} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{appt.serviceName}</p>
                      <p className="mt-0.5 text-xs text-text-secondary">{appt.barbershopName}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        appt.status === 'CONFIRMED'
                          ? 'bg-success/15 text-success'
                          : appt.status === 'PENDING'
                            ? 'bg-warning/15 text-warning'
                            : 'bg-surface-2 text-text-muted'
                      }`}
                    >
                      {statusLabel(appt.status)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {dateLabel(appt.date)} às {appt.time}
                    </span>
                    {appt.staffName && <span>com {appt.staffName}</span>}
                  </div>
                  {appt.price > 0 && (
                    <p className="mt-1 text-sm font-bold text-accent">
                      {appt.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Benefits */}
          {activeTab === 'benefits' && (
            <div className="space-y-3">
              {!listLoading && !listError && benefits.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
                  <Gift size={32} className="mx-auto text-text-muted" />
                  <p className="mt-2 text-sm text-text-secondary">
                    Nenhum benefício disponível neste portal.
                  </p>
                </div>
              )}
              {benefits.map((b, i) => (
                <div key={i} className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-sm font-bold text-text-primary">{b.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-text-secondary">
                    <span>Disponível: {b.available}</span>
                    <span>Usado: {b.used}</span>
                  </div>
                  {b.validUntil && (
                    <p className="mt-1 text-xs text-text-muted">
                      Válido até {dateLabel(b.validUntil)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Account */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-text-muted">
                  Dados da conta
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-text-primary">
                    <User size={14} className="text-text-muted" />
                    {identity?.name || '—'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-primary">
                    <Phone size={14} className="text-text-muted" />
                    {identity?.phone}
                    {identity?.phoneVerified && (
                      <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">
                        Verificado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => void handleLogout()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-bold text-text-secondary hover:bg-surface-2"
              >
                <LogOut size={16} />
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </Tabs>
      <ConfirmDialog
        open={Boolean(pendingUnlink)}
        title="Desvincular salão?"
        message={
          error ||
          `Remover o vínculo com ${pendingUnlink?.barbershopName || 'este salão'}? Você deixará de acompanhar os dados dele nesta conta.`
        }
        confirmLabel="Desvincular"
        variant="danger"
        loading={unlinking}
        onCancel={() => {
          setPendingUnlink(null);
          setError('');
        }}
        onConfirm={() => {
          if (pendingUnlink) void handleUnlink(pendingUnlink.id);
        }}
      />
    </div>
  );
};

function statusLabel(status: string) {
  return (
    (
      {
        CONFIRMED: 'Confirmado',
        PENDING: 'Pendente',
        CANCELLED: 'Cancelado',
        CANCELED: 'Cancelado',
        COMPLETED: 'Concluído',
        NO_SHOW: 'Não compareceu',
        REVOKED: 'Desvinculado',
      } as Record<string, string>
    )[status] ?? status
  );
}
function dateLabel(value: string) {
  const date = value.slice(0, 10).split('-');
  return date.length === 3 ? `${date[2]}/${date[1]}/${date[0]}` : value;
}
