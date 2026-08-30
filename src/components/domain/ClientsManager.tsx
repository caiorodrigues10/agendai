import React, { useCallback, useEffect, useState } from 'react';
import {
  RiCalendarScheduleLine,
  RiEditLine,
  RiFileTextLine,
  RiHistoryLine,
  RiLoader4Line,
  RiBox3Line,
  RiAddLine,
  RiSearchLine,
  RiDeleteBin6Line,
  RiUserAddLine,
} from 'react-icons/ri';
import {
  ClientPackage,
  PackagePaymentMethod,
  SalonClient,
  Service,
  ShopSettings,
  StaffMember,
} from '../../types';
import { clientsApi, ListMeta } from '../../infra/clientsApi';
import { packagesApi } from '../../infra/packagesApi';
import { maskPhone } from '../../utils/documentUtils';
import { getErrorMessage } from '../../utils/errorMessage';
import { BookPackageSessionsModal } from './BookPackageSessionsModal';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const PAYMENT_LABEL: Record<PackagePaymentMethod, string> = {
  cash: 'Dinheiro',
  pix: 'PIX',
  card: 'Cartão',
  other: 'Outro',
};

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  COMPLETED: 'bg-green-500/15 text-green-400 border border-green-500/30',
  CANCELLED: 'bg-red-500/15 text-red-400 border border-red-500/30',
  NO_SHOW: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
};

function clientPhoneLabel(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, '');
  if (digits.length >= 10 && digits.length <= 11) return maskPhone(whatsapp);
  return 'Sem WhatsApp';
}

interface ClientsManagerProps {
  services: Service[];
  staff: StaffMember[];
  settings: ShopSettings;
  canCancelSale: boolean;
}

export const ClientsManager: React.FC<ClientsManagerProps> = ({
  services,
  staff,
  settings,
  canCancelSale,
}) => {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<SalonClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SalonClient | null>(null);

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<ListMeta>({ total: 0, page: 1, limit: 15, totalPages: 1 });

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', whatsapp: '', notes: '' });

  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof packagesApi.listCatalog>>>([]);
  const [sellPackageId, setSellPackageId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PackagePaymentMethod>('pix');
  const [selling, setSelling] = useState(false);

  const [bookingPkg, setBookingPkg] = useState<ClientPackage | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await clientsApi.list({ search: search.trim() || undefined, page, limit: 15 });
      setClients(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(loadList, 300);
    return () => clearTimeout(t);
  }, [loadList]);

  useEffect(() => {
    packagesApi
      .listCatalog({ active: true })
      .then(setCatalog)
      .catch(() => setCatalog([]));
  }, []);

  const openDetail = async (id: string) => {
    setSelectedId(id);
    setEditing(false);
    setError(null);
    try {
      const data = await clientsApi.get(id);
      setDetail(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const refreshDetail = async () => {
    if (!selectedId) return;
    const data = await clientsApi.get(selectedId);
    setDetail(data);
    await loadList();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return;
    setSaving(true);
    setError(null);
    try {
      const created = await clientsApi.create({
        name: name.trim(),
        whatsapp: whatsapp.replace(/\D/g, ''),
      });
      setName('');
      setWhatsapp('');
      setShowCreate(false);
      setPage(1);
      await loadList();
      await openDetail(created.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      await clientsApi.update(detail.id, {
        name: editForm.name.trim(),
        whatsapp: editForm.whatsapp.replace(/\D/g, ''),
        notes: editForm.notes.trim() || null,
      });
      setEditing(false);
      await refreshDetail();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!detail) return;
    if (!confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) return;
    setError(null);
    try {
      await clientsApi.delete(detail.id);
      setSelectedId(null);
      setDetail(null);
      await loadList();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = () => {
    if (!detail) return;
    setEditForm({ name: detail.name, whatsapp: detail.whatsapp, notes: detail.notes ?? '' });
    setEditing(true);
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
      await refreshDetail();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSelling(false);
    }
  };

  const handleConsume = async (packageId: string) => {
    if (!confirm('Registrar 1 sessão usada agora (sem agendar)?')) return;
    setError(null);
    try {
      await packagesApi.consume(packageId);
      await refreshDetail();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCancelSale = async (packageId: string) => {
    if (!confirm('Cancelar esta venda? Só funciona se nenhuma sessão foi usada.')) return;
    setError(null);
    try {
      await packagesApi.cancel(packageId);
      await refreshDetail();
    } catch (err) {
      setError(getErrorMessage(err));
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
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="mt-2 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">Clientes</h3>
        <button
          type="button"
          onClick={() => setShowCreate(v => !v)}
          className="px-3 py-1.5 bg-accent/10 text-accent border border-accent/50 rounded-lg text-xs font-bold flex items-center gap-1"
        >
          <RiAddLine size={14} /> Cadastrar
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-surface border border-border rounded-xl p-4 space-y-3"
        >
          <input
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-primary"
            placeholder="Nome da cliente"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-primary"
            placeholder="WhatsApp"
            value={whatsapp}
            onChange={e => setWhatsapp(maskPhone(e.target.value))}
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl font-bold text-accent-fg bg-accent disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RiUserAddLine size={16} /> {saving ? 'Salvando…' : 'Salvar cliente'}
          </button>
        </form>
      )}

      <div className="relative">
        <RiSearchLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary"
          placeholder="Buscar por nome ou WhatsApp"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-text-muted gap-2">
          <RiLoader4Line size={18} className="animate-spin text-accent" />
          Carregando...
        </div>
      ) : clients.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">Nenhuma cliente cadastrada.</p>
      ) : (
        <>
          <div className="space-y-2">
            {clients.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => openDetail(c.id)}
                className={`w-full text-left bg-surface border rounded-xl px-4 py-3 ${
                  selectedId === c.id ? 'border-accent' : 'border-border'
                }`}
              >
                <p className="font-medium text-text-primary">{c.name}</p>
                <p className="text-xs text-text-muted">
                  {clientPhoneLabel(c.whatsapp)} · {c.remainingSessions} sessão(ões) · {c.activePackageCount}{' '}
                  pacote(s)
                </p>
              </button>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
              >
                Anterior
              </button>
              <span>
                Página {meta.page} de {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {detail && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
          {editing ? (
            <div className="space-y-3">
              <input
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-primary"
                placeholder="Nome"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
              />
              <input
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-primary"
                placeholder="WhatsApp"
                value={editForm.whatsapp}
                onChange={e => setEditForm(f => ({ ...f, whatsapp: maskPhone(e.target.value) }))}
              />
              <textarea
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text-primary resize-none"
                placeholder="Notas sobre o cliente"
                rows={3}
                value={editForm.notes}
                onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleEdit}
                  className="flex-1 py-2.5 rounded-xl font-bold text-accent-fg bg-accent disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? 'Salvando…' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2.5 rounded-xl font-bold border border-border text-text-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-text-primary">{detail.name}</h4>
                  <p className="text-xs text-text-muted">{clientPhoneLabel(detail.whatsapp)}</p>
                </div>
                <button
                  type="button"
                  onClick={startEdit}
                  className="p-1.5 rounded-lg text-text-muted hover:text-accent border border-border hover:border-accent/50"
                >
                  <RiEditLine size={14} />
                </button>
              </div>

              <div className="mt-3">
                {detail.notes ? (
                  <div className="bg-bg border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <RiFileTextLine size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Notas</span>
                      </div>
                      <button
                        type="button"
                        onClick={startEdit}
                        className="text-[11px] text-accent font-bold"
                      >
                        Editar
                      </button>
                    </div>
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{detail.notes}</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startEdit}
                    className="w-full bg-bg border border-dashed border-border rounded-lg p-3 text-sm text-text-muted hover:text-accent hover:border-accent/50 text-left"
                  >
                    Adicionar notas...
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-[11px] uppercase font-bold tracking-wider text-text-muted">
              Vender pacote
            </p>
            <select
              className="w-full bg-bg border border-border rounded-xl px-3 py-3 text-sm text-text-primary"
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
                  className={`py-2 rounded-lg text-[11px] font-bold border ${
                    paymentMethod === method
                      ? 'bg-accent/15 border-accent text-text-primary'
                      : 'bg-bg border-border text-text-secondary'
                  }`}
                >
                  {PAYMENT_LABEL[method]}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!sellPackageId || selling}
              onClick={handleSell}
              className="w-full py-3 rounded-xl font-bold text-accent-fg bg-accent disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RiBox3Line size={16} /> {selling ? 'Registrando…' : 'Fechar pacote'}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase font-bold tracking-wider text-text-muted">
              Pacotes
            </p>
            {(detail.packages ?? []).length === 0 ? (
              <p className="text-sm text-text-muted">Nenhum pacote vendido.</p>
            ) : (
              (detail.packages ?? []).map(p => (
                <div key={p.id} className="border border-border rounded-xl p-3 space-y-2">
                  <p className="text-sm font-medium text-text-primary">{p.packageName}</p>
                  <p className="text-xs text-text-muted">
                    {p.remainingSessions}/{p.totalSessions} sessões · {p.status} ·{' '}
                    {brl.format(p.pricePaid)}
                  </p>
                  {p.status === 'ACTIVE' && p.remainingSessions > 0 && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setBookingPkg(toClientPackage(p))}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-accent/10 text-accent border border-accent/30 flex items-center justify-center gap-1"
                      >
                        <RiCalendarScheduleLine size={14} /> Agendar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConsume(p.id)}
                        className="px-3 py-2 rounded-lg text-xs font-bold border border-border text-text-secondary"
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
                        onClick={() => handleCancelSale(p.id)}
                        className="text-xs text-danger"
                      >
                        Cancelar venda
                      </button>
                    )}
                </div>
              ))
            )}
          </div>

          {sortedAppointments.length > 0 && (
            <div>
              <p className="text-[11px] uppercase font-bold tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                <RiHistoryLine size={12} /> Histórico
              </p>
              <ul className="text-xs space-y-1.5">
                {sortedAppointments.map(a => (
                  <li
                    key={a.id}
                    className="bg-bg border border-border rounded-lg px-3 py-2 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-text-primary font-medium">{a.serviceName}</p>
                      <p className="text-text-muted">
                        {new Date(a.date).toLocaleDateString('pt-BR')} {a.time}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        STATUS_STYLE[a.status] ?? 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      {STATUS_LABEL[a.status] ?? a.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full py-2.5 rounded-xl font-bold text-danger border border-danger/30 hover:bg-danger/10 flex items-center justify-center gap-2 text-sm"
            >
              <RiDeleteBin6Line size={14} /> Excluir cliente
            </button>
          </div>
        </div>
      )}

      {bookingPkg && (
        <BookPackageSessionsModal
          pkg={bookingPkg}
          staff={staff}
          settings={settings}
          onClose={() => setBookingPkg(null)}
          onBooked={refreshDetail}
        />
      )}
    </div>
  );
};
