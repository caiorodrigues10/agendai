import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../infra/authApi';
import { Logo } from '../components/ui/Logo';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {
  ArrowRight,
  LockKeyhole,
  AlertCircle,
  Loader2,
  MessageCircle,
  RotateCcw,
} from 'lucide-react';

const OTP_LENGTH = 6;

export const VerifyResetCodePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId') ?? '';
  const maskedPhone = searchParams.get('maskedPhone') ?? '';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      navigate('/esqueci-senha');
      return;
    }
    inputRefs.current[0]?.focus();
  }, [requestId, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = value.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = next;
    setDigits(newDigits);

    if (next && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every(d => d !== '')) {
      submitCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newDigits = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
    setDigits(newDigits);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (newDigits.every(d => d !== '')) {
      submitCode(newDigits.join(''));
    }
  };

  const submitCode = async (code: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const { token } = await authApi.verifyWhatsAppResetCode(requestId, code);
      navigate(`/reset-password?token=${token}`);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Código inválido';
      setError(msg);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
        <div
          className="h-1 w-full opacity-80"
          style={{
            background: 'linear-gradient(to right, transparent, #00c2b3, transparent)',
          }}
        />
        <div className="p-8 flex flex-col items-center">
          <div className="mb-6 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/esqueci-senha')}
              className="cursor-pointer"
            >
              <Logo size="md" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg border border-border">
              <MessageCircle size={10} className="text-text-muted" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Verificar código
              </span>
            </div>
          </div>

          {error && (
            <div className="w-full mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2 text-danger text-xs font-medium">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="w-full space-y-6">
            <div className="space-y-4">
              <p className="text-[11px] text-text-muted text-center leading-relaxed">
                Digite o código de 6 dígitos enviado para{' '}
                <strong className="text-text-secondary">{maskedPhone || 'seu WhatsApp'}</strong>
              </p>

              <div className="flex justify-center gap-3">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={submitting}
                    className="w-12 h-14 text-center text-lg font-bold bg-bg border border-border rounded-xl
                      text-text-primary outline-none transition-all
                      focus:border-accent/50 focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]
                      disabled:opacity-60"
                  />
                ))}
              </div>
            </div>

            {submitting && (
              <div className="flex justify-center">
                <Loader2 size={20} className="animate-spin text-accent" />
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/esqueci-senha')}
              className="w-full text-[11px] text-text-muted hover:text-accent transition-colors text-center flex items-center justify-center gap-2"
            >
              <RotateCcw size={12} />
              Solicitar novo código
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-4 text-[11px] text-text-muted hover:text-accent transition-colors"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetCodePage;
