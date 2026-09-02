import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopSettings, DaySchedule } from '../../types';
import { barbershopApi, ShopWhatsAppStatus } from '../../infra/barbershopApi';
import { ApiError } from '../../infra/apiClient';
import { maskPhone } from '../../utils/documentUtils';
import { getErrorMessage } from '../../utils/errorMessage';
import { AccountPrivacyPanel } from './AccountPrivacyPanel';
import { OwnerNotificationsPanel } from './OwnerNotificationsPanel';
import {
  Save,
  Clock,
  CalendarDays,
  Upload,
  Smartphone,
  Loader2,
  QrCode,
  Unplug,
  Wallet,
} from 'lucide-react';

const WA_POLL_MS = 2000;
const WA_POLL_TIMEOUT_MS = 40_000;

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
      if (
        !cancelled &&
        next &&
        !next.connected &&
        (next.qrcodeBase64 || next.status === 'connecting')
      ) {
        startPoll();
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
      stopPoll();
    };
  }, [loadStatus, startPoll, stopPoll]);

  const handleConnect = async () => {
    setBusy(true);
    setError(null);
    try {
      const next = await barbershopApi.connectWhatsApp(barbershopId);
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
    if (
      !confirm(
        'Desconectar o WhatsApp deste salão? As mensagens deixam de ser enviadas até conectar de novo.'
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = await barbershopApi.disconnectWhatsApp(barbershopId);
      applyStatus(next);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível desconectar o WhatsApp.'));
    } finally {
      setBusy(false);
    }
  };

  const connected = Boolean(data?.connected);
  const qr = data?.qrcodeBase64;
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
            onClick={() => void handleDisconnect()}
            className="px-4 py-3 text-sm font-bold rounded-xl border border-danger/30 text-danger bg-danger/10 hover:bg-danger/20 disabled:opacity-50 flex items-center gap-2"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Unplug size={16} />}
            Desconectar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {qr && (
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
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleConnect()}
            className="w-full py-3.5 bg-accent hover:bg-accent-hover text-accent-fg font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50 text-base"
          >
            {busy ? <Loader2 size={20} className="animate-spin" /> : <QrCode size={20} />}
            {qr ? 'Gerar QR novamente' : 'Conectar WhatsApp'}
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
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp || '');
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
      const { uploadUrl, publicUrl } = await barbershopApi.getLogoUploadUrl(
        barbershopId,
        file.type
      );
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!putRes.ok) {
        throw new Error(
          `Falha ao enviar a imagem para o storage (${putRes.status}). Verifique CORS do bucket e as credenciais GCS.`
        );
      }
      await barbershopApi.confirmLogo(barbershopId, publicUrl);
      setLogoUrl(publicUrl);
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
      shopName,
      whatsapp,
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
    </div>
  );
};
