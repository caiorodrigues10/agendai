import React, { useState } from 'react';
import { Loader2, Phone, KeyRound, ArrowRight, LogOut } from 'lucide-react';
import { clientPortalApi } from '../../infra/clientPortalApi';
import { getErrorMessage } from '../../utils/errorMessage';

interface ClientPortalLoginProps {
  onAuthenticated: () => void;
}

export const ClientPortalLogin: React.FC<ClientPortalLoginProps> = ({ onAuthenticated }) => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhone = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleRequestCode = async () => {
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Informe um telefone válido com DDD.');
      return;
    }
    setLoading(true);
    try {
      await clientPortalApi.requestCode(digits);
      setStep('code');
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível enviar o código.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    if (code.length !== 6) {
      setError('O código deve ter 6 dígitos.');
      return;
    }
    setLoading(true);
    try {
      await clientPortalApi.verifyCode(phone.replace(/\D/g, ''), code);
      onAuthenticated();
    } catch (err) {
      setError(getErrorMessage(err, 'Código inválido ou expirado.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6 py-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/12 text-accent">
          <Phone size={28} />
        </div>
        <h2 className="mt-4 text-xl font-bold text-text-primary">Minha Conta</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Acesse seus agendamentos, benefícios e histórico.
        </p>
      </div>

      {step === 'phone' && (
        <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">Telefone (WhatsApp)</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(formatPhone(e.target.value)); setError(''); }}
                placeholder="(11) 99999-9999"
                className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <button
            onClick={() => void handleRequestCode()}
            disabled={loading || !phone}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-accent-fg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
            Enviar código
          </button>
        </div>
      )}

      {step === 'code' && (
        <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs text-text-secondary">
            Código enviado para <span className="font-bold text-text-primary">{phone}</span>
          </p>

          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">Código de 6 dígitos</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                placeholder="000000"
                className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-center text-lg tracking-[0.3em] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <button
            onClick={() => void handleVerifyCode()}
            disabled={loading || code.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-accent-fg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
            Entrar
          </button>

          <button
            onClick={() => { setStep('phone'); setCode(''); setError(''); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
          >
            <LogOut size={14} />
            Voltar
          </button>
        </div>
      )}
    </div>
  );
};
