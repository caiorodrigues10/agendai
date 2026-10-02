import React, { useCallback, useEffect, useRef, useState } from 'react';
import { barbershopApi, ShopWhatsAppStatus } from '../../infra/barbershopApi';
import { ApiError } from '../../infra/apiClient';
import { maskPhone, normalizePhoneBR } from '../../utils/documentUtils';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL } from '../../components/ui/Field';
import { ModalShell } from '../../components/patterns/ModalShell';
import { Button } from '../../components/ui/Button';
import {
  LuLoaderCircle as Loader2,
  LuQrCode as QrCode,
  LuCopy as Copy,
  LuKeyRound as KeyRound,
  LuSmartphone as Smartphone,
  LuUnplug as Unplug,
} from 'react-icons/lu';

const WA_POLL_MS = 2000;
const WA_POLL_TIMEOUT_MS = 90_000;

function platformWhatsAppUnavailable(err: unknown): boolean {
  return (
    err instanceof ApiError &&
    (err.statusCode === 503 || err.code === 'EVOLUTION_NOT_CONFIGURED')
  );
}

export const SalonWhatsAppConnection: React.FC<{
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
  const pendingCredentialsRef = useRef<{
    pairingCode: string | null;
    qrcodeBase64: string | null;
    method: ShopWhatsAppStatus['method'];
  }>({ pairingCode: null, qrcodeBase64: null, method: null });

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const applyStatus = useCallback(
    (next: ShopWhatsAppStatus, source: 'poll' | 'action' = 'action') => {
      if (next.connected) {
        pendingCredentialsRef.current = { pairingCode: null, qrcodeBase64: null, method: null };
      } else if (source === 'action' && (next.pairingCode || next.qrcodeBase64)) {
        pendingCredentialsRef.current = {
          pairingCode: next.pairingCode,
          qrcodeBase64: next.qrcodeBase64,
          method: next.method,
        };
      }

      setData(prev => {
        if (next.connected) return next;
        const held = pendingCredentialsRef.current;
        if (source !== 'poll') return next;
        return {
          ...next,
          qrcodeBase64: next.qrcodeBase64 ?? prev?.qrcodeBase64 ?? held.qrcodeBase64,
          pairingCode: next.pairingCode ?? prev?.pairingCode ?? held.pairingCode,
          method: next.method ?? prev?.method ?? held.method,
        };
      });
      if (next.connected) stopPoll();
    },
    [stopPoll]
  );

  const loadStatus = useCallback(async () => {
    try {
      const next = await barbershopApi.getWhatsAppStatus(barbershopId);
      applyStatus(next, 'poll');
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
    if (busy) return;
    setBusy(true);
    setError(null);
    pendingCredentialsRef.current = { pairingCode: null, qrcodeBase64: null, method: selectedMethod };
    setData(prev => (prev ? { ...prev, qrcodeBase64: null, pairingCode: null, method: selectedMethod } : prev));
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
      applyStatus(next, 'action');
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
      pendingCredentialsRef.current = { pairingCode: null, qrcodeBase64: null, method: null };
      applyStatus(next, 'action');
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
              <Field label="Número do WhatsApp que será conectado" hint="Usado somente para gerar o código de pareamento.">
                <input id="whatsapp-pairing-phone" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(maskPhone(e.target.value))} placeholder="(11) 99999-9999" className={FIELD_CONTROL} />
              </Field>
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
              <p className="text-xs text-text-secondary">O código permanece visível até o WhatsApp conectar. Não saia desta tela.</p>
            </div>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleConnect(method)}
            className="w-full py-3.5 bg-accent hover:bg-accent-hover text-accent-fg font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50 text-base"
          >
            {busy ? <Loader2 size={20} className="animate-spin" /> : method === 'qr' ? <QrCode size={20} /> : <KeyRound size={20} />}
            {busy
              ? method === 'pairing_code'
                ? 'Gerando código (até ~30s)...'
                : 'Gerando QR...'
              : method === 'qr'
                ? (qr ? 'Gerar QR novamente' : 'Conectar com QR Code')
                : (pairingCode ? 'Gerar novo código' : 'Conectar com código')}
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
        <Field label="Receber avisos em outro número (opcional)" hint="Deixe em branco para usar o mesmo número conectado acima.">
          <div className="relative">
            <input
              type="tel"
              value={whatsapp}
              onChange={e => onWhatsappChange(maskPhone(e.target.value))}
              className={`${FIELD_CONTROL} pl-10`}
              placeholder="(11) 99999-9999"
            />
            <Smartphone
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              size={16}
            />
          </div>
        </Field>
      </div>

      <ModalShell
        open={showDisconnectModal}
        title="Desconectar WhatsApp?"
        titleId="disconnect-whatsapp-title"
        role="alertdialog"
        loading={busy}
        onClose={() => setShowDisconnectModal(false)}
        body={
          <>
            <p className="text-sm text-text-secondary">
              Fila, agenda, lembretes e campanhas deixarão de enviar mensagens até uma nova
              conexão.
            </p>
            {error && (
              <p className="mt-3 text-sm text-danger" role="alert">
                {error}
              </p>
            )}
          </>
        }
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => setShowDisconnectModal(false)}
              className="ml-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={busy}
              onClick={() => void handleDisconnect()}
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              Desconectar
            </Button>
          </>
        }
      />
    </div>
  );
};
