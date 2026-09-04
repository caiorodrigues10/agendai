import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  RiBox3Line,
  RiCalendarScheduleLine,
  RiDeleteBin6Line,
  RiEditLine,
  RiFileTextLine,
  RiHistoryLine,
  RiLoader4Line,
} from 'react-icons/ri';
import { MessageCircle, X } from 'lucide-react';
import {
  ClientPackage,
  PackagePaymentMethod,
  SalonClient,
  Service,
  ShopSettings,
  StaffMember,
} from '../../types';
import { clientsApi } from '../../infra/clientsApi';
import { crmApi, CrmClientProfile } from '../../infra/crmApi';
import { packagesApi } from '../../infra/packagesApi';
import { maskPhone, normalizePhoneBR } from '../../utils/documentUtils';
import { getErrorMessage } from '../../utils/errorMessage';
import { buildWhatsAppUrl } from '../../utils/whatsappUtils';
import {
  APPOINTMENT_STATUS_LABEL,
  APPOINTMENT_STATUS_STYLE,
  CRM_SEGMENT_LABEL,
  PACKAGE_STATUS_LABEL,
  RISK_LABEL,
} from '../../utils/clientLabels';
import { METRIC_LABEL } from '../../utils/metricLabels';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { BookPackageSessionsModal } from './BookPackageSessionsModal';
import { AppointmentBookingModal } from './AppointmentBookingModal';
import { AppointmentFormData } from '../../schemas';
import { AvailabilitySlot } from '../../utils/schedulingUtils';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const PAYMENT_LABEL: Record<PackagePaymentMethod, string> = {
  cash: 'Dinheiro',
  pix: 'PIX',
  card: 'Cartão',
  other: 'Outro',
};

type ProfileTab = 'geral' | 'pacotes' | 'historico' | 'financeiro';

function clientPhoneLabel(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, '');
  if (digits.length >= 10 && digits.length <= 11) return maskPhone(whatsapp);
  return 'Sem WhatsApp';
}

function shortDate(value: string): string {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

interface ClientProfileSheetProps {
  clientId: string | null;
  onClose: () => void;
  services: Service[];
  staff: StaffMember[];
  settings: ShopSettings;
  canCancelSale: boolean;
  canAnalytics: boolean;
  period?: { from: string; to: string };
  onUpdated: () => void;
  onBook?: (data: AppointmentFormData) => Promise<void>;
  availability?: AvailabilitySlot[];
}

export const ClientProfileSheet: React.FC<ClientProfileSheetProps> = ({
  clientId,
  onClose,
  services,
  staff,
  settings,
  canCancelSale,
  canAnalytics,
  period,
  onUpdated,
  onBook,
  availability = [],
}) => {
  const [tab, setTab] = useState<ProfileTab>('geral');
  const [detail, setDetail] = useState<SalonClient | null>(null);
  const [crmProfile, setCrmProfile] = useState<CrmClientProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', whatsapp: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof packagesApi.listCatalog>>>([]);
  const [sellPackageId, setSellPackageId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PackagePaymentMethod>('pix');
  const [selling, setSelling] = useState(false);

  const [bookingPkg, setBookingPkg] = useState<ClientPackage | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const [confirm, setConfirm] = useState<
    | { type: 'delete' }
    | { type: 'consume'; packageId: string }
    | { type: 'cancelSale'; packageId: string }
    | null
  >(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const tabs = useMemo(
    () =>
      (
        [
          ['geral', 'Geral'],
          ['pacotes', 'Pacotes'],
          ['historico', 'Histórico'],
          ...(canAnalytics ? [['financeiro', 'Financeiro'] as const] : []),
        ] as [ProfileTab, string][]
      ),
    [canAnalytics]
  );

  const loadDetail = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    try {
      const [clientData, analytics] = await Promise.all([
        clientsApi.get(clientId),
        canAnalytics ? crmApi.profile(clientId, period ?? {}) : Promise.resolve(null),
      ]);
      setDetail(clientData);
      setCrmProfile(analytics);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [clientId, canAnalytics, period]);

  useEffect(() => {
    if (!clientId) {
      setDetail(null);
      setCrmProfile(null);
      setEditing(false);
      setTab('geral');
      return;
    }
    void loadDetail();
  }, [clientId, loadDetail]);

  useEffect(() => {
    packagesApi
      .listCatalog({ active: true })
      .then(setCatalog)
      .catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    if (!clientId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [clientId, onClose]);

  const refresh = async () => {
    await loadDetail();
    onUpdated();
  };

  const startEdit = () => {
    if (!detail) return;
    setEditForm({ name: detail.name, whatsapp: detail.whatsapp, notes: detail.notes ?? '' });
    setEditing(true);
  };

  const handleEdit = async () => {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      await clientsApi.update(detail.id, {
        name: editForm.name.trim(),
        whatsapp: normalizePhoneBR(editForm.whatsapp),
        notes: editForm.notes.trim() || null,
      });
      setEditing(false);
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!detail) return;
    setConfirmLoading(true);
    try {
      await clientsApi.delete(detail.id);
      setConfirm(null);
      onClose();
      onUpdated();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleSell = async () => {
    if (!detail || !sellPackageId) return;
    setSelling(true);
    setError(null);
    try {
      await packagesApi.sell({
        clientId: detail.id,
        packageId: sellPackageId,
        paymentMethod,
      });
      setSellPackageId('');
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSelling(false);
    }
  };

  const handleConsume = async (packageId: string) => {
    setConfirmLoading(true);
    setError(null);
    try {
      await packagesApi.consume(packageId);
      setConfirm(null);
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelSale = async (packageId: string) => {
    setConfirmLoading(true);
    setError(null);
    try {
      await packagesApi.cancel(packageId);
      setConfirm(null);
      await refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setConfirmLoading(false);
    }
  };

  const toClientPackage = (row: NonNullable<SalonClient['packages']>[number]): ClientPackage => ({
    id: row.id,
    barbershopId: detail!.barbershopId,
    clientId: detail!.id,
    clientName: detail!.name,
    clientWhatsapp: detail!.whatsapp,
    packageId: row.packageId,
    packageName: row.packageName,
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    serviceDurationMinutes: services.find(s => s.id === row.serviceId)?.avgTimeMinutes ?? 30,
    totalSessions: row.totalSessions,
    remainingSessions: row.remainingSessions,
    pricePaid: row.pricePaid,
    paymentMethod: row.paymentMethod as PackagePaymentMethod,
    status: row.status as ClientPackage['status'],
    purchasedAt: row.purchasedAt,
    expiresAt: row.expiresAt,
  });

  const sortedAppointments = [...(detail?.appointments ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const whatsappUrl = detail ? buildWhatsAppUrl(detail.whatsapp) : null;
  const segmentLabel = crmProfile?.segment
    ? (CRM_SEGMENT_LABEL[crmProfile.segment] ?? crmProfile.segment)
    : null;

  if (!clientId) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Perfil do cliente"
      >
        <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0" />
        <div className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-2xl">
          <header className="shrink-0 border-b border-border px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {loading && !detail ? (
                  <div className="flex items-center gap-2 text-text-muted">
                    <RiLoader4Line className="animate-spin text-accent" size={18} />
                    Carregando…
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-bold text-text-primary">
                        {detail?.name ?? 'Cliente'}
                      </h3>
                      {segmentLabel && (
                        <span className="rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                          {segmentLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">
                      {detail ? clientPhoneLabel(detail.whatsapp) : ''}
                    </p>
                  </>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-border text-accent hover:border-accent/50 hover:bg-accent/10"
                    aria-label="Chamar no WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </a>
                )}
                {onBook && detail && (
                  <button
                    type="button"
                    onClick={() => setShowBooking(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-fg"
                  >
                    <RiCalendarScheduleLine size={14} />
                    Agendar
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-text-muted hover:bg-bg"
                  aria-label="Fechar perfil"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <nav aria-label="Seções do perfil" className="mt-3 flex gap-1 overflow-x-auto">
              {tabs.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`min-h-9 whitespace-nowrap rounded-lg px-3 text-xs font-bold transition-colors ${
                    tab === id
                      ? 'bg-accent/15 text-accent'
                      : 'text-text-muted hover:bg-bg hover:text-text-secondary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </header>

          <div className="flex-1 overflow-y-auto ag-scroll px-4 py-4 sm:px-5">
            {error && (
              <p className="mb-3 rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>
            )}

            {tab === 'geral' && detail && (
              <div className="space-y-4">
                {editing ? (
                  <div className="space-y-3">
                    <input
                      className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text-primary"
                      placeholder="Nome"
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    />
                    <input
                      className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text-primary"
                      placeholder="WhatsApp"
                      value={editForm.whatsapp}
                      onChange={e =>
                        setEditForm(f => ({ ...f, whatsapp: maskPhone(e.target.value) }))
                      }
                    />
                    <textarea
                      className="w-full resize-none rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text-primary"
                      placeholder="Notas sobre o cliente"
                      rows={3}
                      value={editForm.notes}
                      onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void handleEdit()}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-2.5 font-bold text-accent-fg disabled:opacity-50"
                      >
                        {saving ? 'Salvando…' : 'Salvar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="rounded-xl border border-border px-4 py-2.5 font-bold text-text-secondary"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-text-secondary">Dados do cliente</p>
                      <button
                        type="button"
                        onClick={startEdit}
                        className="rounded-lg border border-border p-1.5 text-text-muted hover:border-accent/50 hover:text-accent"
                        aria-label="Editar cliente"
                      >
                        <RiEditLine size={14} />
                      </button>
                    </div>
                    {detail.notes ? (
                      <div className="rounded-lg border border-border bg-bg p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-text-muted">
                          <RiFileTextLine size={12} />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Notas</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-text-secondary">{detail.notes}</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startEdit}
                        className="w-full rounded-lg border border-dashed border-border bg-bg p-3 text-left text-sm text-text-muted hover:border-accent/50 hover:text-accent"
                      >
                        Adicionar notas…
                      </button>
                    )}
                    {crmProfile && (
                      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                        <div className="rounded-lg border border-border bg-bg p-3">
                          <p className="text-xs text-text-muted">Visitas</p>
                          <p className="font-bold text-text-primary">{crmProfile.visits}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-bg p-3">
                          <p className="text-xs text-text-muted">{METRIC_LABEL.LTV}</p>
                          <p className="font-bold text-text-primary">{brl.format(crmProfile.ltv)}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-bg p-3">
                          <p className="text-xs text-text-muted">Risco</p>
                          <p className="font-bold text-text-primary">
                            {RISK_LABEL[crmProfile.risk] ?? crmProfile.risk}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setConfirm({ type: 'delete' })}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 py-2.5 text-sm font-bold text-danger hover:bg-danger/10"
                  >
                    <RiDeleteBin6Line size={14} /> Excluir cliente
                  </button>
                </div>
              </div>
            )}

            {tab === 'pacotes' && detail && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Vender pacote
                  </p>
                  <select
                    className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-primary"
                    value={sellPackageId}
                    onChange={e => setSellPackageId(e.target.value)}
                  >
                    <option value="">Escolher pacote</option>
                    {catalog.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.sessionCount}x {p.serviceName} · {brl.format(p.price)}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(PAYMENT_LABEL) as PackagePaymentMethod[]).map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`rounded-lg border py-2 text-[11px] font-bold ${
                          paymentMethod === method
                            ? 'border-accent bg-accent/15 text-text-primary'
                            : 'border-border bg-bg text-text-secondary'
                        }`}
                      >
                        {PAYMENT_LABEL[method]}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!sellPackageId || selling}
                    onClick={() => void handleSell()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-bold text-accent-fg disabled:opacity-50"
                  >
                    <RiBox3Line size={16} /> {selling ? 'Registrando…' : 'Fechar pacote'}
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Pacotes vendidos
                  </p>
                  {(detail.packages ?? []).length === 0 ? (
                    <p className="text-sm text-text-muted">Nenhum pacote vendido.</p>
                  ) : (
                    (detail.packages ?? []).map(p => (
                      <div key={p.id} className="space-y-2 rounded-xl border border-border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-text-primary">{p.packageName}</p>
                          <span className="rounded-md border border-border bg-bg px-2 py-0.5 text-[10px] font-bold text-text-secondary">
                            {PACKAGE_STATUS_LABEL[p.status] ?? p.status}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          {p.remainingSessions}/{p.totalSessions} sessões · {brl.format(p.pricePaid)}
                        </p>
                        {p.status === 'ACTIVE' && p.remainingSessions > 0 && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setBookingPkg(toClientPackage(p))}
                              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-accent/30 bg-accent/10 py-2 text-xs font-bold text-accent"
                            >
                              <RiCalendarScheduleLine size={14} /> Agendar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirm({ type: 'consume', packageId: p.id })}
                              className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-text-secondary"
                            >
                              Usar agora
                            </button>
                          </div>
                        )}
                        {canCancelSale &&
                          p.status === 'ACTIVE' &&
                          p.remainingSessions === p.totalSessions && (
                            <button
                              type="button"
                              onClick={() => setConfirm({ type: 'cancelSale', packageId: p.id })}
                              className="text-xs text-danger"
                            >
                              Cancelar venda
                            </button>
                          )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === 'historico' && detail && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <RiHistoryLine size={12} /> Agendamentos
                </p>
                {sortedAppointments.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
                    Nenhum agendamento registrado.
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-xs">
                    {sortedAppointments.map(a => (
                      <li
                        key={a.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-bg px-3 py-2"
                      >
                        <div>
                          <p className="font-medium text-text-primary">{a.serviceName}</p>
                          <p className="text-text-muted">
                            {new Date(a.date).toLocaleDateString('pt-BR')} {a.time}
                          </p>
                        </div>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            APPOINTMENT_STATUS_STYLE[a.status] ??
                            'border border-gray-500/30 bg-gray-500/15 text-gray-400'
                          }`}
                        >
                          {APPOINTMENT_STATUS_LABEL[a.status] ?? a.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tab === 'financeiro' && canAnalytics && crmProfile && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    [METRIC_LABEL.LTV, crmProfile.ltv],
                    ['Produzido', crmProfile.grossRevenue],
                    ['Recebido', crmProfile.receivedRevenue],
                    ['Dívida', crmProfile.outstanding],
                  ].map(([label, value]) => (
                    <div key={label as string} className="rounded-xl border border-border bg-bg p-3">
                      <p className="text-xs text-text-muted">{label}</p>
                      <strong className="mt-1 block text-base text-text-primary">
                        {brl.format(Number(value))}
                      </strong>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2 rounded-xl border border-border p-3 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-text-muted">Ticket médio:</span>{' '}
                    {brl.format(crmProfile.avgTicket)}
                  </p>
                  <p>
                    <span className="text-text-muted">Serviço preferido:</span>{' '}
                    {crmProfile.favoriteService ?? '—'}
                  </p>
                  <p>
                    <span className="text-text-muted">Última visita:</span>{' '}
                    {crmProfile.lastVisitAt ? shortDate(crmProfile.lastVisitAt) : '—'}
                  </p>
                  <p>
                    <span className="text-text-muted">Próxima esperada:</span>{' '}
                    {crmProfile.nextExpectedVisitAt
                      ? shortDate(crmProfile.nextExpectedVisitAt)
                      : '—'}
                  </p>
                </div>
                {(crmProfile.fiados ?? []).filter(f => f.outstanding > 0).length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-bold text-text-primary">Fiado em aberto</h4>
                    {(crmProfile.fiados ?? [])
                      .filter(f => f.outstanding > 0)
                      .map(f => (
                        <div
                          key={f.id}
                          className="flex justify-between border-t border-border py-2 text-sm"
                        >
                          <span className="text-text-muted">{shortDate(f.createdAt)}</span>
                          <strong className="text-danger">{brl.format(f.outstanding)}</strong>
                        </div>
                      ))}
                  </div>
                )}
                <div>
                  <h4 className="mb-2 text-sm font-bold text-text-primary">Timeline financeira</h4>
                  {crmProfile.timeline?.length ? (
                    crmProfile.timeline.map(event => (
                      <div
                        key={event.id}
                        className="flex flex-wrap justify-between gap-2 border-t border-border py-2 text-sm"
                      >
                        <span>
                          {event.kind.replaceAll('_', ' ')}
                          <small className="ml-2 text-text-muted">
                            {shortDate(event.occurredAt)}
                          </small>
                        </span>
                        <span className="text-text-secondary">
                          Bruto {brl.format(event.grossAmount)} · Recebido{' '}
                          {brl.format(event.receivedAmount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
                      Sem eventos no período selecionado.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirm?.type === 'delete'}
        title="Excluir cliente"
        message="Tem certeza? Esta ação não pode ser desfeita. Pacotes e histórico serão removidos."
        confirmLabel="Excluir"
        variant="danger"
        loading={confirmLoading}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === 'consume'}
        title="Usar sessão agora"
        message="Registrar 1 sessão usada agora, sem criar agendamento?"
        confirmLabel="Confirmar"
        loading={confirmLoading}
        onConfirm={() => confirm?.type === 'consume' && void handleConsume(confirm.packageId)}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === 'cancelSale'}
        title="Cancelar venda"
        message="Cancelar esta venda? Só funciona se nenhuma sessão foi usada."
        confirmLabel="Cancelar venda"
        variant="danger"
        loading={confirmLoading}
        onConfirm={() => confirm?.type === 'cancelSale' && void handleCancelSale(confirm.packageId)}
        onCancel={() => setConfirm(null)}
      />

      {bookingPkg && (
        <BookPackageSessionsModal
          pkg={bookingPkg}
          staff={staff}
          settings={settings}
          onClose={() => setBookingPkg(null)}
          onBooked={refresh}
        />
      )}

      {showBooking && detail && onBook && (
        <AppointmentBookingModal
          services={services}
          staff={staff}
          settings={settings}
          occupancy={availability}
          defaultClient={{ id: detail.id, name: detail.name, whatsapp: detail.whatsapp }}
          onBook={async data => {
            await onBook(data);
            setShowBooking(false);
            await refresh();
          }}
          onClose={() => setShowBooking(false)}
        />
      )}
    </>,
    document.body
  );
};
