import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Store,
  Clock,
  Gift,
  User,
  Loader2,
  ChevronRight,
  Unlink,
  Phone,
  LogOut,
  Smartphone,
} from 'lucide-react';
import { clientPortalApi, ClientIdentity, ClientSalonLink, ClientAppointment, ClientBenefit } from '../../infra/clientPortalApi';
import { SmartSelect } from '../ui/SmartSelect';
import { getErrorMessage } from '../../utils/errorMessage';

type PortalTab = 'home' | 'salons' | 'appointments' | 'benefits' | 'account';

const TABS: { id: PortalTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
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
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [me, salonLinks] = await Promise.all([
          clientPortalApi.getMe(),
          clientPortalApi.getSalons(),
        ]);
        setIdentity(me);
        setSalons(salonLinks);
        if (salonLinks.length > 0) {
          setSelectedSalonId(salonLinks[0].barbershopId);
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Erro ao carregar dados.'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (!selectedSalonId || (activeTab !== 'appointments' && activeTab !== 'home')) return;
    void clientPortalApi.getAppointments(selectedSalonId).then(setAppointments).catch(() => setAppointments([]));
  }, [selectedSalonId, activeTab]);

  useEffect(() => {
    if (!selectedSalonId || activeTab !== 'benefits') return;
    void clientPortalApi.getBenefits(selectedSalonId).then(setBenefits).catch(() => setBenefits([]));
  }, [selectedSalonId, activeTab]);

  const handleLogout = async () => {
    try {
      await clientPortalApi.logout();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  const handleUnlink = async (linkId: string) => {
    try {
      await clientPortalApi.unlinkSalon(linkId);
      setSalons(prev => prev.filter(s => s.id !== linkId));
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao desvincular.'));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-text-muted" size={32} />
      </div>
    );
  }

  const nextAppointment = appointments.find(a => a.status === 'CONFIRMED' || a.status === 'PENDING');

  return (
    <div className="mx-auto max-w-2xl space-y-4 py-4">
      {error && <div className="rounded-xl border border-error/30 bg-error/10 p-3 text-xs text-error">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border border-accent/30 bg-selection text-accent'
                  : 'text-text-secondary hover:bg-surface-2'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Home */}
      {activeTab === 'home' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-text-muted">Bem-vindo</p>
            <h3 className="mt-1 text-lg font-bold text-text-primary">{identity?.name || 'Cliente'}</h3>
            <p className="mt-1 text-sm text-text-secondary">{identity?.phone}</p>
          </div>

          {nextAppointment && (
            <div className="rounded-2xl border border-accent/30 bg-selection p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-tertiary">Próximo agendamento</p>
              <h4 className="mt-1 font-bold text-text-primary">{nextAppointment.serviceName}</h4>
              <p className="mt-1 text-sm text-text-secondary">
                {nextAppointment.barbershopName} · {nextAppointment.date} às {nextAppointment.time}
              </p>
              {nextAppointment.staffName && (
                <p className="mt-0.5 text-xs text-text-muted">com {nextAppointment.staffName}</p>
              )}
            </div>
          )}

          {salons.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
              <Store size={32} className="mx-auto text-text-muted" />
              <p className="mt-2 text-sm text-text-secondary">Nenhum salão vinculado ainda.</p>
              <p className="mt-1 text-xs text-text-muted">Peça ao salão para vincular seu número.</p>
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
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
            >
              <div>
                <p className="text-sm font-bold text-text-primary">{salon.barbershopName || salon.barbershopId}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  Status: <span className={salon.status === 'CONFIRMED' ? 'text-success' : 'text-warning'}>{salon.status}</span>
                </p>
                {salon.salonClientName && <p className="text-xs text-text-muted">Nome no salão: {salon.salonClientName}</p>}
              </div>
              <button
                onClick={() => void handleUnlink(salon.id)}
                className="rounded-lg p-2 text-text-muted hover:bg-error/10 hover:text-error"
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
          {selectedSalonId && salons.length > 1 && (
            <SmartSelect
              value={selectedSalonId}
              onChange={val => setSelectedSalonId(val)}
              options={salons.map(s => ({ value: s.barbershopId, label: s.barbershopName || s.barbershopId }))}
              clearable={false}
            />
          )}
          {appointments.length === 0 && (
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
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  appt.status === 'CONFIRMED' ? 'bg-success/15 text-success' :
                  appt.status === 'PENDING' ? 'bg-warning/15 text-warning' :
                  'bg-surface-2 text-text-muted'
                }`}>
                  {appt.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1"><Clock size={12} /> {appt.date} às {appt.time}</span>
                {appt.staffName && <span>com {appt.staffName}</span>}
              </div>
              {appt.price > 0 && (
                <p className="mt-1 text-sm font-bold text-accent">R$ {appt.price.toFixed(2)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Benefits */}
      {activeTab === 'benefits' && (
        <div className="space-y-3">
          {selectedSalonId && salons.length > 1 && (
            <SmartSelect
              value={selectedSalonId}
              onChange={val => setSelectedSalonId(val)}
              options={salons.map(s => ({ value: s.barbershopId, label: s.barbershopName || s.barbershopId }))}
              clearable={false}
            />
          )}
          {benefits.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
              <Gift size={32} className="mx-auto text-text-muted" />
              <p className="mt-2 text-sm text-text-secondary">Nenhum benefício disponível neste portal.</p>
            </div>
          )}
          {benefits.map((b, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-sm font-bold text-text-primary">{b.description}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-text-secondary">
                <span>Disponível: {b.available}</span>
                <span>Usado: {b.used}</span>
              </div>
              {b.validUntil && <p className="mt-1 text-xs text-text-muted">Válido até {b.validUntil}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Account */}
      {activeTab === 'account' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-text-muted">Dados da conta</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <User size={14} className="text-text-muted" />
                {identity?.name || '—'}
              </div>
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <Phone size={14} className="text-text-muted" />
                {identity?.phone}
                {identity?.phoneVerified && (
                  <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success">Verificado</span>
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
  );
};
