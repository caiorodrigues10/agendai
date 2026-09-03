import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopSettings, DaySchedule, OperationMode, BusinessSegment } from '../../types';
import { barbershopApi, ShopWhatsAppStatus } from '../../infra/barbershopApi';
import { ApiError } from '../../infra/apiClient';
import { maskPhone, normalizePhoneBR } from '../../utils/documentUtils';
import { getErrorMessage } from '../../utils/errorMessage';
import { AccountPrivacyPanel } from './AccountPrivacyPanel';
import { OwnerNotificationsPanel } from './OwnerNotificationsPanel';
import { QueueAlertSettings } from './QueueAlertSettings';
import { ShopFloorControls } from './ShopFloorControls';
import { ThemedCalendar, toLocalISO } from '../ui/ThemedCalendar';
import { addDays } from '../../utils/schedulingUtils';
import {
  Save,
  Clock,
  CalendarDays,
  Upload,
  Smartphone,
  Loader2,
  QrCode,
  Copy,
  KeyRound,
  Unplug,
  Wallet,
  Users,
  CalendarCheck,
  LayoutGrid,
  Trash2,
} from 'lucide-react';
import { useBarbershop } from '../../contexts/BarbershopContext';
import type { AppointmentPolicy } from '../../infra/barbershopApi';

const WA_POLL_MS = 2000;
const WA_POLL_TIMEOUT_MS = 90_000;

const DEFAULT_APPOINTMENT_POLICY: AppointmentPolicy = {
  bookingNoticeMinutes: 60,
  cancelNoticeMinutes: 120,
  rescheduleNoticeMinutes: 120,
  bookingHorizonDays: 60,
  allowPublicCancellation: true,
  allowPublicReschedule: true,
  requestReview: true,
};

const AppointmentPolicySection: React.FC<{ barbershopId: string; onNotify: SettingsManagerProps['onNotify'] }> = ({ barbershopId, onNotify }) => {
  const [policy, setPolicy] = useState<AppointmentPolicy>(DEFAULT_APPOINTMENT_POLICY);
  const [saving, setSaving] = useState(false);
  useEffect(() => { barbershopApi.getAppointmentPolicy(barbershopId).then(setPolicy).catch(() => undefined); }, [barbershopId]);
  const update = (field: keyof AppointmentPolicy, value: number | boolean) => setPolicy(current => ({ ...current, [field]: value }));
  const save = async () => { setSaving(true); try { const next = await barbershopApi.updateAppointmentPolicy(barbershopId, policy); setPolicy(next); onNotify('Regras da agenda atualizadas.', 'success'); } catch (err) { onNotify(getErrorMessage(err, 'Não foi possível salvar as regras da agenda.'), 'error'); } finally { setSaving(false); } };
  return <div className="bg-surface border border-border rounded-xl p-5"><h3 className="text-lg font-bold text-text-primary mb-1">Regras da agenda pública</h3><p className="text-xs text-text-muted mb-4">Defina até quando o cliente pode reservar, cancelar ou remarcar.</p><div className="grid gap-3 sm:grid-cols-3">{([['bookingNoticeMinutes', 'Antecedência para reservar'], ['cancelNoticeMinutes', 'Prazo para cancelar'], ['rescheduleNoticeMinutes', 'Prazo para remarcar']] as const).map(([field, label]) => <label key={field} className="text-xs text-text-secondary">{label}<input type="number" min={0} max={10080} value={policy[field]} onChange={event => update(field, Number(event.target.value))} className="mt-1 w-full rounded-lg bg-bg border border-border p-2 text-text-primary" /><span className="text-[10px] text-text-muted">minutos</span></label>)}</div><label className="block text-xs text-text-secondary mt-3">Reservas até<input type="number" min={1} max={365} value={policy.bookingHorizonDays} onChange={event => update('bookingHorizonDays', Number(event.target.value))} className="mt-1 w-32 rounded-lg bg-bg border border-border p-2 text-text-primary" /> <span className="text-[10px] text-text-muted">dias no futuro</span></label><div className="grid gap-2 sm:grid-cols-3 mt-4">{([['allowPublicCancellation', 'Permitir cancelamento'], ['allowPublicReschedule', 'Permitir remarcação'], ['requestReview', 'Pedir avaliação']] as const).map(([field, label]) => <label key={field} className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={policy[field]} onChange={event => update(field, event.target.checked)} />{label}</label>)}</div><button type="button" disabled={saving} onClick={() => void save()} className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-fg disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar regras'}</button></div>;
};

function platformWhatsAppUnavailable(err: unknown): boolean {
  return (
    err instanceof ApiError &&
    (err.statusCode === 503 || err.code === 'EVOLUTION_NOT_CONFIGURED')
  );
}

const SalonWhatsAppConnection: React.FC<{
  barbershopId: string;
  whatsapp: string;
  onWhatsappChange: (value: string) => void;
}> = ({ barbershopId, whatsapp, onWhatsappChange }) => {
  const [data, setData] = useState<ShopWhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<'qr' | 'pairing_code'>('pairing_code');
  const [phoneNumber, setPhoneNumber] = useState(() => maskPhone(whatsapp));
  const [copied, setCopied] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const applyStatus = useCallback(
    (next: ShopWhatsAppStatus) => {
      setData(next);
      if (next.connected) stopPoll();
    },
    [stopPoll]
  );

  const loadStatus = useCallback(async () => {
    try {
      const next = await barbershopApi.getWhatsAppStatus(barbershopId);
      applyStatus(next);
      setError(null);
      return next;
    } catch (err) {
      setError(
        platformWhatsAppUnavailable(err)
          ? 'WhatsApp da plataforma indisponível.'
          : getErrorMessage(err, 'Não foi possível consultar o WhatsApp do salão.')
      );
      return null;
    }
  }, [barbershopId, applyStatus]);

  const startPoll = useCallback(() => {
    stopPoll();
    const deadline = Date.now() + WA_POLL_TIMEOUT_MS;
    pollRef.current = setInterval(() => {
      if (Date.now() > deadline) {
        stopPoll();
        return;
      }
      void loadStatus();
    }, WA_POLL_MS);
  }, [loadStatus, stopPoll]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const next = await loadStatus();
      if (!cancelled && next && !next.connected && next.status === 'connecting') {
        startPoll();
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
      stopPoll();
    };
  }, [loadStatus, startPoll, stopPoll]);

  useEffect(() => {
    if (data?.connected) {
      void barbershopApi.updateOnboardingStep(barbershopId, 'WHATSAPP').catch(() => undefined);
    }
  }, [barbershopId, data?.connected]);

  const handleConnect = async (selectedMethod: 'qr' | 'pairing_code' = method) => {
    setBusy(true);
    setError(null);
    setData(prev => prev ? { ...prev, qrcodeBase64: null, pairingCode: null } : prev);
    try {
      if (selectedMethod === 'pairing_code' && !phoneNumber.trim()) {
        setError('Informe o número do WhatsApp que será conectado.');
        return;
      }
      const next = await barbershopApi.connectWhatsApp(
        barbershopId,
        selectedMethod === 'qr'
          ? { method: 'qr' }
          : { method: 'pairing_code', phoneNumber: normalizePhoneBR(phoneNumber) }
      );
      applyStatus(next);
      if (!next.connected) startPoll();
    } catch (err) {
      setError(
        platformWhatsAppUnavailable(err)
          ? 'WhatsApp da plataforma indisponível.'
          : getErrorMessage(err, 'Não foi possível conectar o WhatsApp.')
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    setError(null);
    try {
      const next = await Promise.race([
        barbershopApi.disconnectWhatsApp(barbershopId),
        new Promise<never>((_, reject) => {
          window.setTimeout(
            () => reject(new Error('Tempo esgotado ao desconectar. Tente novamente.')),
            20_000
          );
        }),
      ]);
      stopPoll();
      applyStatus(next);
      setShowDisconnectModal(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível desconectar o WhatsApp.'));
    } finally {
      setBusy(false);
    }
  };

  const connected = Boolean(data?.connected);
  const qr = data?.qrcodeBase64;
  const pairingCode = data?.pairingCode;
  const platformDown = error === 'WhatsApp da plataforma indisponível.';

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-lg font-bold text-text-primary mb-1">WhatsApp</h3>

      <div className="border-2 border-accent/40 rounded-xl p-5 mb-4">
        <h4 className="text-sm font-bold text-text-primary mb-1">WhatsApp do salão</h4>
        <p className="text-sm text-text-secondary mb-4">
          Este é o número que <span className="font-semibold text-text-primary">envia</span> as
          mensagens (fila, lembretes, posts).
        </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={16} className="animate-spin" /> Consultando sessão...
        </div>
      ) : platformDown ? null : connected ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-success/10 text-success">
            Conectado
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setError(null);
              setShowDisconnectModal(true);
            }}
            className="px-4 py-3 text-sm font-bold rounded-xl border border-danger/30 text-danger bg-danger/10 hover:bg-danger/20 disabled:opacity-50 flex items-center gap-2"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Unplug size={16} />}
            Desconectar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-bg p-1">
            <button type="button" onClick={() => { setMethod('pairing_code'); setError(null); setData(prev => prev ? { ...prev, qrcodeBase64: null, pairingCode: null } : prev); }} className={`rounded-lg px-3 py-3 text-sm font-bold flex items-center justify-center gap-2 ${method === 'pairing_code' ? 'bg-accent text-accent-fg' : 'text-text-secondary'}`}><KeyRound size={17} /> Código</button>
            <button type="button" onClick={() => { setMethod('qr'); setError(null); setData(prev => prev ? { ...prev, qrcodeBase64: null, pairingCode: null } : prev); }} className={`rounded-lg px-3 py-3 text-sm font-bold flex items-center justify-center gap-2 ${method === 'qr' ? 'bg-accent text-accent-fg' : 'text-text-secondary'}`}><QrCode size={17} /> QR Code</button>
          </div>
          {method === 'pairing_code' && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-text-secondary" htmlFor="whatsapp-pairing-phone">Número do WhatsApp que será conectado</label>
              <input id="whatsapp-pairing-phone" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(maskPhone(e.target.value))} placeholder="(11) 99999-9999" className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-accent" />
              <p className="text-xs text-text-muted">Usado somente para gerar o código de pareamento.</p>
            </div>
          )}
          {qr && method === 'qr' && (
            <div className="flex flex-col items-center gap-2">
              <img
                src={qr}
                alt="QR Code para conectar o WhatsApp"
                className="w-56 h-56 rounded-xl border border-border bg-white p-3"
              />
              <p className="text-sm text-text-secondary text-center">
                Abra o WhatsApp no celular → Aparelhos conectados → Conectar um aparelho.
              </p>
            </div>
          )}
          {pairingCode && method === 'pairing_code' && (
            <div className="rounded-xl bg-bg border border-accent/40 p-5 text-center space-y-3">
              <p className="text-sm font-semibold text-text-secondary">Digite este código no WhatsApp</p>
              <p className="text-3xl sm:text-4xl tracking-[0.28em] font-black text-accent break-all">{pairingCode}</p>
              <button type="button" onClick={() => { void navigator.clipboard?.writeText(pairingCode).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1800); }); }} className="mx-auto px-4 py-2.5 rounded-lg border border-accent/40 text-accent font-bold flex items-center gap-2"><Copy size={16} /> {copied ? 'Código copiado' : 'Copiar código'}</button>
              <p className="text-xs text-text-muted">WhatsApp → Aparelhos conectados → Conectar um aparelho → Conectar com número de telefone.</p>
            </div>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleConnect(method)}
            className="w-full py-3.5 bg-accent hover:bg-accent-hover text-accent-fg font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50 text-base"
          >
            {busy ? <Loader2 size={20} className="animate-spin" /> : method === 'qr' ? <QrCode size={20} /> : <KeyRound size={20} />}
            {method === 'qr' ? (qr ? 'Gerar QR novamente' : 'Conectar com QR Code') : (pairingCode ? 'Gerar novo código' : 'Conectar com código')}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1.5">
          Receber avisos em outro número (opcional)
        </label>
        <div className="relative">
          <input
            type="tel"
            value={whatsapp}
            onChange={e => onWhatsappChange(maskPhone(e.target.value))}
            className="w-full bg-bg border border-border rounded-lg pl-10 pr-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-accent"
            placeholder="(11) 99999-9999"
          />
          <Smartphone
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            size={16}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-text-muted">
          Deixe em branco para usar o mesmo número conectado acima.
        </p>
      </div>

      {showDisconnectModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => {
            if (!busy) setShowDisconnectModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="disconnect-whatsapp-title"
            className="w-full max-w-md rounded-2xl bg-surface border border-border p-5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h4 id="disconnect-whatsapp-title" className="text-lg font-bold text-text-primary">Desconectar WhatsApp?</h4>
            <p className="mt-2 text-sm text-text-secondary">Fila, agenda, lembretes e campanhas deixarão de enviar mensagens até uma nova conexão.</p>
            {error && (
              <p className="mt-3 text-sm text-danger" role="alert">
                {error}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowDisconnectModal(false)}
                className="px-4 py-3 rounded-xl text-sm font-bold text-text-secondary disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDisconnect()}
                className="px-4 py-3 rounded-xl bg-danger text-white text-sm font-bold disabled:opacity-50 flex items-center gap-2"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : null}
                Desconectar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SEGMENT_OPTIONS: { value: BusinessSegment; label: string }[] = [
  { value: 'BARBERSHOP', label: 'Barbearia' },
  { value: 'HAIR_SALON', label: 'Salão de cabelo' },
  { value: 'BEAUTY_STUDIO', label: 'Studio de beleza' },
  { value: 'NAIL_STUDIO', label: 'Unhas' },
  { value: 'LASH_BROW_STUDIO', label: 'Cílios e sobrancelhas' },
  { value: 'AESTHETICS', label: 'Estética' },
  { value: 'SPA', label: 'Spa' },
  { value: 'OTHER', label: 'Outro' },
];

const BusinessSegmentSection: React.FC<{
  settings: ShopSettings;
  onNotify: (message: string, type: 'success' | 'error') => void;
  onSave: (settings: ShopSettings) => void;
}> = ({ settings, onNotify, onSave }) => {
  const [saving, setSaving] = useState(false);
  const current = settings.businessSegment ?? 'OTHER';
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-lg font-bold text-text-primary mb-1">Tipo do estabelecimento</h3>
      <p className="text-xs text-text-muted mb-4">
        Só orienta sugestões de catálogo. Não altera plano, URL pública, fila ou agenda.
      </p>
      <select
        disabled={saving}
        value={current}
        onChange={async event => {
          const businessSegment = event.target.value as BusinessSegment;
          setSaving(true);
          try {
            await onSave({ ...settings, businessSegment });
            onNotify('Tipo do estabelecimento atualizado.', 'success');
          } catch (err) {
            onNotify(getErrorMessage(err, 'Não foi possível salvar o tipo.'), 'error');
          } finally {
            setSaving(false);
          }
        }}
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary"
      >
        {SEGMENT_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};

interface OperationModeSectionProps {
  settings: ShopSettings;
  barbershopId?: string;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

const MODE_OPTIONS: {
  value: OperationMode;
  icon: React.ReactNode;
  title: string;
  description: string;
}[] = [
  {
    value: 'HYBRID',
    icon: <LayoutGrid size={20} />,
    title: 'Híbrido',
    description: 'Fila + agenda. Flexível para o cliente escolher.',
  },
  {
    value: 'QUEUE_ONLY',
    icon: <Users size={20} />,
    title: 'Somente Fila',
    description: 'Clientes entram na fila. Sem agendamento.',
  },
  {
    value: 'APPOINTMENTS_ONLY',
    icon: <CalendarCheck size={20} />,
    title: 'Somente Agenda',
    description: 'Clientes agendam horários. Sem fila.',
  },
];

const OperationModeSection: React.FC<OperationModeSectionProps> = ({
  settings,
  barbershopId,
  onNotify,
}) => {
  const { setOperationMode } = useBarbershop();
  const [saving, setSaving] = useState(false);
  const currentMode = settings.operationMode ?? 'HYBRID';

  const handleSelect = async (mode: OperationMode) => {
    if (mode === currentMode || !barbershopId) return;
    setSaving(true);
    try {
      await setOperationMode(mode);
      onNotify('Modo de atendimento atualizado.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível alterar o modo.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-lg font-bold text-text-primary mb-1">Modo de Atendimento</h3>
      <p className="text-xs text-text-muted mb-4">
        Define como seus clientes entram: pela fila, pela agenda ou ambos.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {MODE_OPTIONS.map(opt => {
          const active = currentMode === opt.value;
          return (
            <button
              key={opt.value}
              disabled={saving || active}
              onClick={() => handleSelect(opt.value)}
              className={`flex flex-col items-center text-center gap-2 rounded-xl border-2 p-4 transition-all ${
                active
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-bg text-text-secondary hover:border-accent/40'
              } ${saving ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface">
                {opt.icon}
              </div>
              <span className="text-sm font-bold">{opt.title}</span>
              <span className="text-[11px] leading-tight text-text-muted">{opt.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ScheduleExceptionsSection: React.FC<{
  onNotify: (message: string, type: 'success' | 'error') => void;
}> = ({ onNotify }) => {
  const { settings, addScheduleExceptions, removeScheduleException } = useBarbershop();
  const [from, setFrom] = useState(toLocalISO(new Date()));
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const exceptions = (settings?.scheduleExceptions ?? []).filter(item => !item.isOpen);
  const today = toLocalISO(new Date());
  const maxDate = toLocalISO(addDays(new Date(), 90));

  const add = async () => {
    setSaving(true);
    try {
      await addScheduleExceptions(from, to || undefined, reason.trim() || undefined);
      setReason('');
      setTo('');
      onNotify('Data de fechamento adicionada.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível salvar a data de fechamento.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-lg font-bold text-text-primary mb-1">Datas de fechamento</h3>
      <p className="text-xs text-text-muted mb-4">
        Feriados, férias ou folgas planejadas. Bloqueia fila pública e agendamento nesses dias.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">De</p>
          <div className="rounded-xl border border-border bg-bg px-2 py-2">
            <ThemedCalendar value={from} min={today} max={maxDate} onChange={setFrom} />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Até (opcional)</p>
          <div className="rounded-xl border border-border bg-bg px-2 py-2">
            <ThemedCalendar value={to || from} min={from} max={maxDate} onChange={setTo} />
          </div>
          {to && (
            <button type="button" onClick={() => setTo('')} className="mt-2 text-xs text-text-muted hover:underline">
              Usar só um dia
            </button>
          )}
        </div>
      </div>
      <label className="block text-xs text-text-secondary mt-4">
        Motivo (opcional)
        <input
          value={reason}
          onChange={e => setReason(e.target.value)}
          maxLength={200}
          placeholder="Feriado, férias..."
          className="mt-1 w-full rounded-lg bg-bg border border-border p-2 text-text-primary"
        />
      </label>
      <button
        type="button"
        disabled={saving}
        onClick={() => void add()}
        className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-fg disabled:opacity-50"
      >
        {saving ? 'Salvando...' : 'Adicionar fechamento'}
      </button>
      <ul className="mt-4 space-y-2">
        {exceptions.length === 0 && (
          <li className="text-xs text-text-muted">Nenhuma data de fechamento cadastrada.</li>
        )}
        {exceptions.map(item => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg px-3 py-2"
          >
            <div>
              <p className="text-sm font-bold text-text-primary">
                {new Date(`${item.date.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR')}
              </p>
              {item.reason && <p className="text-xs text-text-muted">{item.reason}</p>}
            </div>
            <button
              type="button"
              onClick={() =>
                void removeScheduleException(item.id).then(
                  () => onNotify('Data removida.', 'success'),
                  err => onNotify(getErrorMessage(err, 'Não foi possível remover.'), 'error')
                )
              }
              className="p-2 rounded-lg text-danger hover:bg-danger/10"
              aria-label="Remover data"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface SettingsManagerProps {
  settings: ShopSettings;
  barbershopId?: string;
  onSave: (settings: ShopSettings) => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
  showNotifications?: boolean;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  barbershopId,
  onSave,
  onNotify,
  showNotifications = false,
}) => {
  const navigate = useNavigate();
  const [shopName, setShopName] = useState(settings.shopName);
  const [whatsapp, setWhatsapp] = useState(() => maskPhone(settings.whatsapp || ''));
  const [schedule, setSchedule] = useState<DaySchedule[]>(settings.schedule || []);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(settings.logoUrl);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [address, setAddress] = useState(settings.address || '');
  const [city, setCity] = useState(settings.city || '');

  const handleDayChange = (index: number, field: keyof DaySchedule, value: string | boolean) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !barbershopId) return;

    setLogoUploading(true);
    setLogoError(null);
    try {
      const { logoUrl: newLogoUrl } = await barbershopApi.uploadLogoDirect(barbershopId, file);
      setLogoUrl(newLogoUrl);
    } catch (err) {
      setLogoUrl(settings.logoUrl);
      setLogoError(getErrorMessage(err, 'Não foi possível enviar a logo. Tente novamente.'));
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = () => {
    for (const day of schedule) {
      if (day.isOpen && day.openTime >= day.closeTime) {
        onNotify(
          `${day.dayName}: horário de abertura deve ser anterior ao de fechamento.`,
          'error'
        );
        return;
      }
    }
    onSave({
      ...settings,
      shopName,
      whatsapp: normalizePhoneBR(whatsapp),
      address,
      city,
      schedule,
      logoUrl,
    });
  };

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-4">Configurações Gerais</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Nome do Salão</label>
            <input
              type="text"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Endereço</label>
              <input value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-accent" placeholder="Rua, número e bairro" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Cidade</label>
              <input value={city} onChange={e => setCity(e.target.value)} className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-accent" placeholder="São Paulo" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Logo do Salão</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-bg border border-border flex items-center justify-center overflow-hidden">
                {logoUploading ? (
                  <Loader2 className="text-accent animate-spin" size={20} />
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="text-text-muted" size={20} />
                )}
              </div>
              <label
                className={`px-3 py-2 text-xs bg-surface-2 text-text-secondary rounded-lg border border-border-strong cursor-pointer hover:bg-border-strong ${logoUploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {logoUploading ? 'Enviando...' : 'Escolher arquivo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={logoUploading}
                />
              </label>
            </div>
            {logoError && (
              <p className="mt-2 text-xs text-danger" role="alert">
                {logoError}
              </p>
            )}
          </div>
        </div>
      </div>

      {barbershopId && (
        <SalonWhatsAppConnection
          barbershopId={barbershopId}
          whatsapp={whatsapp}
          onWhatsappChange={setWhatsapp}
        />
      )}

      <OperationModeSection settings={settings} barbershopId={barbershopId} onNotify={onNotify} />
      <BusinessSegmentSection settings={settings} onNotify={onNotify} onSave={onSave} />

      {barbershopId && <ShopFloorControls variant="full" onNotify={onNotify} />}
      {barbershopId && <ScheduleExceptionsSection onNotify={onNotify} />}

      {barbershopId && <AppointmentPolicySection barbershopId={barbershopId} onNotify={onNotify} />}

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-4">Horários de Funcionamento</h3>

        <div className="space-y-3">
          {schedule.map((day, index) => (
            <div key={day.dayName} className="bg-bg border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-text-muted" size={16} />
                  <span className="text-sm font-bold text-text-primary">{day.dayName}</span>
                </div>
                <button
                  onClick={() => handleDayChange(index, 'isOpen', !day.isOpen)}
                  className={`px-2 py-1 text-[10px] rounded-full font-bold ${
                    day.isOpen ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  }`}
                >
                  {day.isOpen ? 'Aberto' : 'Fechado'}
                </button>
              </div>

              {day.isOpen && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Clock
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
                      size={14}
                    />
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={e => handleDayChange(index, 'openTime', e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg pl-8 pr-2 py-2 text-text-primary text-xs outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Clock
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
                      size={14}
                    />
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={e => handleDayChange(index, 'closeTime', e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg pl-8 pr-2 py-2 text-text-primary text-xs outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-lg font-bold text-text-primary mb-4">Localização</h3>
        <p className="text-sm text-text-secondary mb-4">
          Necessária para previsão de demanda baseada no clima.
        </p>
        <div className="space-y-4">
          <p className="text-[11px] text-text-muted">
            Informe a cidade e o sistema localizará automaticamente as coordenadas necessárias para a previsão do tempo.
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-accent hover:bg-accent-hover text-accent-fg font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
      >
        <Save size={16} /> Salvar Configurações
      </button>

      <button
        type="button"
        onClick={() => navigate('/app/subscription')}
        className="w-full py-3 bg-accent/15 hover:bg-accent/25 text-accent font-bold rounded-xl flex items-center justify-center gap-2 border border-accent/40"
      >
        <Wallet size={16} /> Pagar ou gerenciar plano
      </button>

      <AccountPrivacyPanel onNotify={onNotify} />
      {showNotifications && barbershopId && <OwnerNotificationsPanel onNotify={onNotify} />}
      {showNotifications && barbershopId && <QueueAlertSettings barbershopId={barbershopId} onNotify={onNotify} />}
    </div>
  );
};
