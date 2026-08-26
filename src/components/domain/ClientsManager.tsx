import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Loader2, Package, Plus, Search, UserPlus } from 'lucide-react';
import {
  ClientPackage,
  PackagePaymentMethod,
  SalonClient,
  Service,
  ShopSettings,
  StaffMember,
} from '../../types';
import { clientsApi } from '../../infra/clientsApi';
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

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);

  const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof packagesApi.listCatalog>>>([]);
  const [sellPackageId, setSellPackageId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PackagePaymentMethod>('pix');
  const [selling, setSelling] = useState(false);

  const [bookingPkg, setBookingPkg] = useState<ClientPackage | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await clientsApi.list({ search: search.trim() || undefined, limit: 50 });
      setClients(result.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search]);

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
      await loadList();
      await openDetail(created.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
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

  return (
    <div className="mt-2 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">Clientes</h3>
        <button
          type="button"
          onClick={() => setShowCreate(v => !v)}
          className="px-3 py-1.5 bg-accent/10 text-accent border border-accent/50 rounded-lg text-xs font-bold flex items-center gap-1"
        >
          <Plus size={14} /> Cadastrar
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
            <UserPlus size={16} /> {saving ? 'Salvando…' : 'Salvar cliente'}
          </button>
        </form>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary"
          placeholder="Buscar por nome ou WhatsApp"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-text-muted gap-2">
          <Loader2 size={18} className="animate-spin text-accent" />
          Carregando...
        </div>
      ) : clients.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">Nenhuma cliente cadastrada.</p>
      ) : (
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
                {maskPhone(c.whatsapp)} · {c.remainingSessions} sessão(ões) · {c.activePackageCount}{' '}
                pacote(s)
              </p>
            </button>
          ))}
        </div>
      )}

      {detail && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
          <div>
            <h4 className="font-bold text-text-primary">{detail.name}</h4>
            <p className="text-xs text-text-muted">{maskPhone(detail.whatsapp)}</p>
          </div>

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
              <Package size={16} /> {selling ? 'Registrando…' : 'Fechar pacote'}
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
                        <CalendarDays size={14} /> Agendar
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

          {(detail.appointments ?? []).length > 0 && (
            <div>
              <p className="text-[11px] uppercase font-bold tracking-wider text-text-muted mb-2">
                Próximos horários
              </p>
              <ul className="text-xs text-text-secondary space-y-1">
                {(detail.appointments ?? [])
                  .filter(a => a.status === 'CONFIRMED')
                  .map(a => (
                    <li key={a.id}>
                      {new Date(a.date).toLocaleDateString('pt-BR')} {a.time} · {a.serviceName}
                    </li>
                  ))}
              </ul>
            </div>
          )}
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
