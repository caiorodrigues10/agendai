import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../infra/authApi';
import { Logo } from '../components/ui/Logo';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {
  ArrowRight,
  LockKeyhole,
  AlertCircle,
  Mail,
  MessageCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';

const inputClass = (hasError: boolean) =>
  `w-full bg-bg border rounded-xl py-3 pl-10 pr-4 text-text-primary text-sm
   outline-none transition-all placeholder:text-text-muted
   focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]
   ${
     hasError
       ? 'border-danger/40 text-danger focus:border-danger'
       : 'border-border focus:border-accent/50 hover:border-border-strong'
   }`;

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'email' | 'choose'>('email');

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) return;
    setStep('choose');
  };

  const handleSendEmail = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await authApi.forgotPassword(email.trim());
      setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWhatsApp = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await authApi.requestWhatsAppReset(email.trim());
      if (result.requestId) {
        navigate(
          `/verificar-codigo?requestId=${result.requestId}&maskedPhone=${encodeURIComponent(result.maskedPhone ?? '')}`
        );
      } else {
        setSuccess(true);
      }
    } catch {
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[420px] bg-surface border border-border rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6 flex flex-col items-center gap-4">
            <Logo size="md" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg border border-border">
              <LockKeyhole size={10} className="text-text-muted" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                E-mail enviado
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} className="text-success" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">
            Verifique sua caixa de entrada
          </h2>
          <p className="text-sm text-text-muted leading-relaxed mb-6">
            Se o e-mail <strong className="text-text-secondary">{email}</strong> estiver cadastrado,
            enviaremos instruções para redefinir sua senha.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/20 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300"
          >
            Voltar ao login <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

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
            <button type="button" onClick={() => navigate('/login')} className="cursor-pointer">
              <Logo size="md" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg border border-border">
              <LockKeyhole size={10} className="text-text-muted" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Recuperar senha
              </span>
            </div>
          </div>

          {error && (
            <div className="w-full mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2 text-danger text-xs font-medium">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="w-full space-y-6">
              <div className="space-y-4">
                <p className="text-[11px] text-text-muted text-center leading-relaxed">
                  Informe o e-mail associado à sua conta para recuperar sua senha.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    E-mail
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail
                        size={16}
                        className="text-text-muted group-focus-within:text-accent transition-colors"
                      />
                    </div>
                    <input
                      type="email"
                      className={inputClass(false)}
                      placeholder="seu@email.com"
                      autoFocus
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isValidEmail}
                className="w-full py-4 bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/20 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60"
              >
                Continuar <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            <div className="w-full space-y-6">
              <p className="text-[11px] text-text-muted text-center leading-relaxed">
                Como deseja receber o código de redefinição para{' '}
                <strong className="text-text-secondary">{email}</strong>?
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSendEmail}
                  className="w-full py-4 bg-bg border border-border hover:border-accent/50 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 text-text-primary hover:text-accent disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Mail size={16} />
                      Enviar por e-mail
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSendWhatsApp}
                  className="w-full py-4 bg-[#25d366] hover:bg-[#1da851] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <MessageCircle size={16} />
                      Enviar por WhatsApp
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-[11px] text-text-muted hover:text-accent transition-colors text-center"
              >
                Usar outro e-mail
              </button>
            </div>
          )}

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

export default ForgotPasswordPage;
