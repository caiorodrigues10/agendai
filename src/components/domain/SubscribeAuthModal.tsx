import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  AlertCircle,
  ArrowRight,
  Loader2,
  User,
  Store,
  Smartphone,
  CreditCard,
  Building2,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { LoginSchema, LoginFormData, RegisterSchema, RegisterFormData } from '../../schemas';
import { useAuth } from '../../contexts/AuthContext';
import { Plan } from '../../infra/plansApi';
import { PasswordInput } from '../ui/PasswordInput';
import { Toast } from '../ui/Toast';
import { normalizeDocument, maskCpf, maskCnpj, maskPhone, isValidDocument } from '../../utils/documentUtils';
import { referralStorage } from '../../utils/referralStorage';
import { trialCampaign } from '../../marketing/trialCampaign';

interface SubscribeAuthModalProps {
  plan: Plan;
  onClose: () => void;
  billing?: 'MONTHLY' | 'YEARLY';
}

type Tab = 'login' | 'register';

const formatPrice = (price: number) =>
  price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const inputClass = (hasError: boolean) =>
  `w-full bg-bg border rounded-xl py-3 pl-10 pr-4 text-text-primary text-sm
   outline-none transition-all placeholder:text-text-muted
   focus:shadow-[0_0_18px_rgba(16,185,129,0.18)]
   ${
     hasError
       ? 'border-danger/40 text-danger focus:border-danger'
       : 'border-border focus:border-accent/50 hover:border-border-strong'
   }`;

interface FieldProps {
  label: string;
  icon: LucideIcon;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, icon: Icon, error, optional, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
      {label}
      {optional && (
        <span className="text-text-muted font-normal normal-case"> (opcional)</span>
      )}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <Icon
          size={16}
          className={`transition-colors ${
            error ? 'text-danger' : 'text-text-muted group-focus-within:text-accent'
          }`}
        />
      </div>
      {children}
    </div>
    {error && (
      <motion.span
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[10px] font-medium text-danger flex items-center gap-1"
      >
        <AlertCircle size={10} /> {error}
      </motion.span>
    )}
  </div>
);

export const SubscribeAuthModal: React.FC<SubscribeAuthModalProps> = ({
  plan,
  onClose,
  billing = 'MONTHLY',
}) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showErrorToast = (message: string) => {
    setToast({ message, type: 'error' });
  };

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      ownerName: '',
      email: '',
      password: '',
      cpf: '',
      barbershopName: '',
      whatsapp: '',
      cnpj: '',
    },
  });
  const [registerFieldsUnlocked, setRegisterFieldsUnlocked] = useState(false);

  const goToCheckout = () => {
    onClose();
    navigate(`/checkout?planId=${plan.id}&billing=${billing}&setup=trial`);
  };

  const handleLogin = async (data: LoginFormData) => {
    setSubmitting(true);
    const result = await login(data.email, data.password);
    setSubmitting(false);
    if (result.ok === false) {
      showErrorToast(result.message);
      return;
    }
    goToCheckout();
  };

  const handleRegister = async (data: RegisterFormData) => {
    const cpf = normalizeDocument(data.cpf);
    if (!isValidDocument('CPF', cpf)) {
      showErrorToast('CPF inválido. Confira o número digitado.');
      return;
    }
    setSubmitting(true);
    const referralCode = referralStorage.get() ?? undefined;
    const result = await register({
      ownerName: data.ownerName.trim(),
      email: data.email.trim(),
      password: data.password,
      cpf,
      barbershopName: data.barbershopName.trim(),
      whatsapp: normalizeDocument(data.whatsapp),
      cnpj: data.cnpj ? normalizeDocument(data.cnpj) : undefined,
      referralCode,
    });
    if (result.ok) referralStorage.clear();
    setSubmitting(false);
    if (result.ok === false) {
      showErrorToast(result.message);
      return;
    }
    goToCheckout();
  };

  const registerPassword = registerForm.watch('password') ?? '';
  const emailField = registerForm.register('email');
  const passwordField = registerForm.register('password');

  const switchTab = (next: Tab) => {
    setTab(next);
    setRegisterFieldsUnlocked(false);
    if (next === 'register') {
      registerForm.reset({
        ownerName: '',
        email: '',
        password: '',
        cpf: '',
        barbershopName: '',
        whatsapp: '',
        cnpj: '',
      });
    }
  };

  const submitButton = (label: string, icon?: React.ReactNode) => (
    <button
      type="submit"
      disabled={submitting}
      className="relative w-full py-4 bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/25 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60 overflow-hidden group/btn active:scale-[0.98]"
    >
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/25 to-transparent"
      />
      {submitting ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <>
          {icon}
          {label}
          <ArrowRight
            size={14}
            className="transition-transform group-hover/btn:translate-x-1"
          />
        </>
      )}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="h-1 w-full shrink-0"
          style={{
            background: 'linear-gradient(to right, transparent, var(--ag-accent), transparent)',
          }}
        />

        {/* Header com resumo do plano */}
        <div className="p-5 border-b border-border bg-accent/5 shrink-0 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(300px circle at 15% 0%, color-mix(in srgb, var(--ag-accent) 10%, transparent), transparent 70%)',
            }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1.5 flex items-center gap-1.5">
                <Sparkles size={11} />
                Assinar plano
              </p>
              <h2 className="text-lg font-black text-text-primary tracking-tight">{plan.name}</h2>
              <p className="text-sm text-text-secondary mt-0.5">
                <span className="font-bold text-text-primary">{formatPrice(plan.price)}</span>
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

        <div className="p-5 overflow-y-auto flex-1">
          {/* Segmented control animado */}
          <div className="relative flex w-full p-1 rounded-xl bg-bg border border-border mb-5">
            {(
              [
                { id: 'register' as const, label: 'Criar conta' },
                { id: 'login' as const, label: 'Já tenho conta' },
              ] as const
            ).map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                className="relative flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="subscribe-tab-pill"
                    className="absolute inset-0 rounded-lg bg-surface border border-border shadow-sm"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    tab === t.id ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {tab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="space-y-4"
              >
                <p className="text-[11px] text-text-muted text-center leading-relaxed">
                  Entre com sua conta de dono(a) para continuar o pagamento.
                </p>

                <Field
                  label="E-mail"
                  icon={Mail}
                  error={loginForm.formState.errors.email?.message}
                >
                  <input
                    type="email"
                    className={inputClass(!!loginForm.formState.errors.email)}
                    placeholder="seu@email.com"
                    autoFocus
                    {...loginForm.register('email')}
                  />
                </Field>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Senha
                  </label>
                  <PasswordInput
                    showPassword={showPassword}
                    onToggleShow={() => setShowPassword(v => !v)}
                    error={loginForm.formState.errors.password?.message}
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                  />
                </div>

                {submitButton('Entrar e pagar')}
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                autoComplete="off"
                onSubmit={registerForm.handleSubmit(handleRegister)}
                className="space-y-4"
              >
                <p className="text-[11px] text-text-muted text-center leading-relaxed">
                  {trialCampaign.signupHint}
                </p>

                <Field
                  label="Seu nome"
                  icon={User}
                  error={registerForm.formState.errors.ownerName?.message}
                >
                  <input
                    className={inputClass(!!registerForm.formState.errors.ownerName)}
                    placeholder="João Silva"
                    autoFocus
                    {...registerForm.register('ownerName')}
                  />
                </Field>

                <Field
                  label="E-mail"
                  icon={Mail}
                  error={registerForm.formState.errors.email?.message}
                >
                  <input
                    type="email"
                    {...emailField}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    readOnly={!registerFieldsUnlocked}
                    onFocus={e => {
                      setRegisterFieldsUnlocked(true);
                      void emailField.onFocus?.(e);
                    }}
                    className={inputClass(!!registerForm.formState.errors.email)}
                    placeholder="seu@email.com"
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="CPF"
                    icon={CreditCard}
                    error={registerForm.formState.errors.cpf?.message}
                  >
                    <input
                      className={inputClass(!!registerForm.formState.errors.cpf)}
                      placeholder="000.000.000-00"
                      value={registerForm.watch('cpf') ?? ''}
                      onChange={e =>
                        registerForm.setValue('cpf', maskCpf(e.target.value), {
                          shouldValidate: true,
                        })
                      }
                    />
                  </Field>

                  <Field
                    label="WhatsApp do salão"
                    icon={Smartphone}
                    error={registerForm.formState.errors.whatsapp?.message}
                  >
                    <input
                      className={inputClass(!!registerForm.formState.errors.whatsapp)}
                      placeholder="(11) 99999-9999"
                      value={registerForm.watch('whatsapp') ?? ''}
                      onChange={e =>
                        registerForm.setValue('whatsapp', maskPhone(e.target.value), {
                          shouldValidate: true,
                        })
                      }
                    />
                  </Field>
                </div>

                <Field
                  label="Nome do salão"
                  icon={Store}
                  error={registerForm.formState.errors.barbershopName?.message}
                >
                  <input
                    className={inputClass(!!registerForm.formState.errors.barbershopName)}
                    placeholder="Salão Beleza & Estilo"
                    {...registerForm.register('barbershopName')}
                  />
                </Field>

                <Field label="CNPJ" icon={Building2} optional>
                  <input
                    className={inputClass(false)}
                    placeholder="00.000.000/0000-00"
                    value={registerForm.watch('cnpj') ?? ''}
                    onChange={e =>
                      registerForm.setValue('cnpj', maskCnpj(e.target.value), {
                        shouldValidate: true,
                      })
                    }
                  />
                </Field>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Senha
                  </label>
                  <PasswordInput
                    showStrength
                    showPassword={showPassword}
                    onToggleShow={() => setShowPassword(v => !v)}
                    error={registerForm.formState.errors.password?.message}
                    placeholder="Crie uma senha segura"
                    autoComplete="new-password"
                    readOnly={!registerFieldsUnlocked}
                    value={registerPassword}
                    {...passwordField}
                    onFocus={e => {
                      setRegisterFieldsUnlocked(true);
                      void passwordField.onFocus?.(e);
                    }}
                  />
                </div>

                {submitButton('Criar conta e pagar', <CreditCard size={14} />)}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
