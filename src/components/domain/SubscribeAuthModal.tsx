import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Mail,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
  User,
  Store,
  Smartphone,
  CreditCard,
  Check,
} from 'lucide-react';
import { LoginSchema, LoginFormData, RegisterSchema, RegisterFormData } from '../../schemas';
import { useAuth } from '../../contexts/AuthContext';
import { Plan } from '../../infra/plansApi';
import { normalizeDocument, maskCpf, maskCnpj, isValidDocument } from '../../utils/documentUtils';

interface SubscribeAuthModalProps {
  plan: Plan;
  onClose: () => void;
}

type Tab = 'login' | 'register';

const formatPrice = (price: number) =>
  price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const inputClass =
  'w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm outline-none transition-colors placeholder:text-text-muted focus:border-accent/60 hover:border-border-strong';

export const SubscribeAuthModal: React.FC<SubscribeAuthModalProps> = ({ plan, onClose }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { cnpj: '', termsAccepted: false, lgpdConsent: false, marketingOptIn: false },
  });

  const goToCheckout = () => {
    onClose();
    navigate(`/checkout?planId=${plan.id}`);
  };

  const handleLogin = async (data: LoginFormData) => {
    setFormError(null);
    setSubmitting(true);
    const result = await login(data.email, data.password);
    setSubmitting(false);
    if (result.ok === false) {
      setFormError(result.message);
      return;
    }
    goToCheckout();
  };

  const handleRegister = async (data: RegisterFormData) => {
    setFormError(null);
    const cpf = normalizeDocument(data.cpf);
    if (!isValidDocument('CPF', cpf)) {
      setFormError('CPF inválido. Confira o número digitado.');
      return;
    }
    setSubmitting(true);
    const result = await register({
      ownerName: data.ownerName.trim(),
      email: data.email.trim(),
      password: data.password,
      cpf,
      barbershopName: data.barbershopName.trim(),
      whatsapp: normalizeDocument(data.whatsapp),
      cnpj: data.cnpj ? normalizeDocument(data.cnpj) : undefined,
      termsVersion: '1.0',
      termsAccepted: data.termsAccepted,
      lgpdConsent: data.lgpdConsent,
      marketingOptIn: data.marketingOptIn,
    });
    setSubmitting(false);
    if (result.ok === false) {
      setFormError(result.message);
      return;
    }
    goToCheckout();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header com resumo do plano */}
        <div className="p-5 border-b border-border bg-accent/5 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">
                Assinar plano
              </p>
              <h2 className="text-lg font-bold text-text-primary">{plan.name}</h2>
              <p className="text-sm text-text-secondary mt-0.5">
                {formatPrice(plan.price)}
                <span className="text-text-muted"> /mês</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Abas Login / Cadastro */}
        <div className="flex border-b border-border shrink-0">
          {(
            [
              { id: 'register' as const, label: 'Criar conta' },
              { id: 'login' as const, label: 'Já tenho conta' },
            ] as const
          ).map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setFormError(null);
              }}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                tab === t.id
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {formError && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-xl flex items-start gap-2 text-danger text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {formError}
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <p className="text-xs text-text-muted mb-2">
                Entre com sua conta de dono para continuar o pagamento.
              </p>
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    className={`${inputClass} pl-10`}
                    placeholder="seu@email.com"
                    {...loginForm.register('email')}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <span className="text-[10px] text-danger mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {loginForm.formState.errors.email.message}
                  </span>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Senha</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`${inputClass} pl-10 pr-10`}
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <span className="text-[10px] text-danger mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {loginForm.formState.errors.password.message}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-accent text-accent-fg font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Entrar e pagar <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3">
              <p className="text-xs text-text-muted mb-1">
                Crie seu salão e pague em seguida. Você ganha <strong>30 dias grátis</strong> para
                testar.
              </p>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Seu nome</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    className={`${inputClass} pl-10`}
                    placeholder="João Silva"
                    {...registerForm.register('ownerName')}
                  />
                </div>
                {registerForm.formState.errors.ownerName && (
                  <span className="text-[10px] text-danger">{registerForm.formState.errors.ownerName.message}</span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    className={`${inputClass} pl-10`}
                    placeholder="seu@email.com"
                    {...registerForm.register('email')}
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <span className="text-[10px] text-danger">{registerForm.formState.errors.email.message}</span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Senha</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`${inputClass} pl-10 pr-10`}
                    placeholder="Mínimo 6 caracteres"
                    {...registerForm.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <span className="text-[10px] text-danger">{registerForm.formState.errors.password.message}</span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">CPF</label>
                <input
                  className={inputClass}
                  placeholder="000.000.000-00"
                  value={registerForm.watch('cpf') ?? ''}
                  onChange={e =>
                    registerForm.setValue('cpf', maskCpf(e.target.value), { shouldValidate: true })
                  }
                />
                {registerForm.formState.errors.cpf && (
                  <span className="text-[10px] text-danger">{registerForm.formState.errors.cpf.message}</span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Nome do salão</label>
                <div className="relative">
                  <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    className={`${inputClass} pl-10`}
                    placeholder="Salão Beleza & Estilo"
                    {...registerForm.register('barbershopName')}
                  />
                </div>
                {registerForm.formState.errors.barbershopName && (
                  <span className="text-[10px] text-danger">
                    {registerForm.formState.errors.barbershopName.message}
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">WhatsApp do salão</label>
                <div className="relative">
                  <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    className={`${inputClass} pl-10`}
                    placeholder="(11) 99999-9999"
                    {...registerForm.register('whatsapp')}
                  />
                </div>
                {registerForm.formState.errors.whatsapp && (
                  <span className="text-[10px] text-danger">{registerForm.formState.errors.whatsapp.message}</span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">
                  CNPJ <span className="text-text-muted font-normal">(opcional)</span>
                </label>
                <input
                  className={inputClass}
                  placeholder="00.000.000/0000-00"
                  value={registerForm.watch('cnpj') ?? ''}
                  onChange={e =>
                    registerForm.setValue('cnpj', maskCnpj(e.target.value), { shouldValidate: true })
                  }
                />
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={registerForm.watch('termsAccepted') ?? false}
                      onChange={(e) =>
                        registerForm.setValue('termsAccepted', e.target.checked, { shouldValidate: true })
                      }
                    />
                    <div className="w-4 h-4 rounded border border-border bg-bg transition-all peer-checked:bg-accent peer-checked:border-accent flex items-center justify-center">
                      {registerForm.watch('termsAccepted') && <Check size={10} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-[11px] text-text-muted leading-relaxed group-hover:text-text-secondary transition-colors">
                    Li e aceito os{' '}
                    <span className="text-accent font-medium">Termos de Uso</span> e a{' '}
                    <span className="text-accent font-medium">Política de Privacidade</span>
                  </span>
                </label>
                {registerForm.formState.errors.termsAccepted && (
                  <span className="text-[10px] text-danger flex items-center gap-1 -mt-2">
                    <AlertCircle size={10} /> {registerForm.formState.errors.termsAccepted.message}
                  </span>
                )}

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={registerForm.watch('lgpdConsent') ?? false}
                      onChange={(e) =>
                        registerForm.setValue('lgpdConsent', e.target.checked, { shouldValidate: true })
                      }
                    />
                    <div className="w-4 h-4 rounded border border-border bg-bg transition-all peer-checked:bg-accent peer-checked:border-accent flex items-center justify-center">
                      {registerForm.watch('lgpdConsent') && <Check size={10} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-[11px] text-text-muted leading-relaxed group-hover:text-text-secondary transition-colors">
                    Concordo com o tratamento dos meus dados pessoais, conforme a{' '}
                    <span className="text-accent font-medium">LGPD</span>
                  </span>
                </label>
                {registerForm.formState.errors.lgpdConsent && (
                  <span className="text-[10px] text-danger flex items-center gap-1 -mt-2">
                    <AlertCircle size={10} /> {registerForm.formState.errors.lgpdConsent.message}
                  </span>
                )}

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={registerForm.watch('marketingOptIn') ?? false}
                      onChange={(e) =>
                        registerForm.setValue('marketingOptIn', e.target.checked)
                      }
                    />
                    <div className="w-4 h-4 rounded border border-border bg-bg transition-all peer-checked:bg-accent peer-checked:border-accent flex items-center justify-center">
                      {registerForm.watch('marketingOptIn') && <Check size={10} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-[11px] text-text-muted leading-relaxed group-hover:text-text-secondary transition-colors">
                    Quero receber novidades e promoções por e-mail
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-accent text-accent-fg font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors disabled:opacity-60 mt-2"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <CreditCard size={16} />
                    Criar conta e pagar
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
