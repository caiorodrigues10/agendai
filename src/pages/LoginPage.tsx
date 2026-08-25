import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginSchema, LoginFormData, RegisterSchema, RegisterFormData } from '../schemas';
import { useAuth } from '../contexts/AuthContext';
import { authStorage } from '../infra/authStorage';
import { Logo } from '../components/ui/Logo';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Toast } from '../components/ui/Toast';
import { ConsentCheckbox } from '../components/ui/ConsentCheckbox';
import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Mail,
  Loader2,
  User,
  Store,
  Smartphone,
  CreditCard,
  Building2,
  CalendarCheck,
  Users,
  TrendingUp,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react';
import {
  normalizeDocument,
  maskCpf,
  maskCnpj,
  maskPhone,
  isValidDocument,
} from '../utils/documentUtils';
import { referralStorage } from '../utils/referralStorage';
import { trialCampaign } from '../marketing/trialCampaign';

type Tab = 'login' | 'register';
type RegisterStep = 1 | 2;

const inputClass = (hasError: boolean) =>
  `w-full bg-bg border rounded-xl py-2.5 pl-10 pr-4 text-text-primary text-sm
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
  <div className="space-y-1">
    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
      {label}
      {optional && <span className="text-text-muted font-normal normal-case"> (opcional)</span>}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <Icon
          size={15}
          className={`transition-colors ${
            error ? 'text-danger' : 'text-text-muted group-focus-within:text-accent'
          }`}
        />
      </div>
      {children}
    </div>
    {error && (
      <span className="text-[10px] font-medium text-danger flex items-center gap-1">
        <AlertCircle size={10} /> {error}
      </span>
    )}
  </div>
);

const QUEUE_MOCK = [
  { name: 'Mariana C.', service: 'Coloração', status: 'Na cadeira' },
  { name: 'Rafael S.', service: 'Corte + Barba', status: '~12 min' },
  { name: 'Júlia A.', service: 'Escova', status: '~25 min' },
] as const;

const BrandPanel: React.FC = () => (
  <div className="relative hidden lg:flex flex-col overflow-hidden bg-[#050d0b] text-white">
    <motion.div
      aria-hidden
      className="absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full blur-[140px] pointer-events-none"
      style={{ background: 'rgba(16,185,129,0.28)' }}
      animate={{ x: [0, 70, -30, 0], y: [0, -40, 50, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      aria-hidden
      className="absolute -bottom-45 -right-30 w-[520px] h-[520px] rounded-full blur-[140px] pointer-events-none"
      style={{ background: 'rgba(0,194,179,0.22)' }}
      animate={{ x: [0, -60, 40, 0], y: [0, 50, -30, 0] }}
      transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
    />
    <div
      aria-hidden
      className="absolute inset-0 opacity-[0.07] pointer-events-none"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      }}
    />

    <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
      <Logo size="md" className="text-white" />

      <div className="flex-1 flex flex-col justify-center gap-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h1 className="font-sans text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight">
            Seu salão,{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-300 via-teal-300 to-emerald-400">
              no controle.
            </span>
          </h1>
          <p className="mt-4 text-neutral-400 text-sm xl:text-base max-w-md leading-relaxed font-light">
            Fila digital, agenda, financeiro e clientes — tudo em um painel que trabalha por você,
            em tempo real.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
          className="relative max-w-sm"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl border border-white/10 bg-white/6 backdrop-blur-xl p-5 shadow-2xl shadow-black/40"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-300 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                Fila ao vivo
              </span>
              <Users size={14} className="text-neutral-500" />
            </div>
            <div className="space-y-3">
              {QUEUE_MOCK.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-400/30 to-teal-500/30 border border-emerald-400/20 flex items-center justify-center text-[11px] font-bold text-emerald-200">
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-100 truncate">{item.name}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{item.service}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                      i === 0 ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/5 text-neutral-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: 'spring', bounce: 0.4 }}
            className="absolute -right-10 -top-5"
          >
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 backdrop-blur-xl px-3.5 py-2.5 shadow-xl shadow-black/40">
              <div className="w-7 h-7 rounded-lg bg-emerald-400/15 flex items-center justify-center">
                <TrendingUp size={14} className="text-emerald-300" />
              </div>
              <div>
                <p className="text-xs font-black text-white leading-none">+32%</p>
                <p className="text-[9px] text-neutral-400 mt-0.5">agendamentos</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-neutral-500 text-[11px] font-medium">
          <span className="flex items-center gap-1.5">
            <CalendarCheck size={13} className="text-emerald-400/70" />
            Agenda inteligente
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} className="text-emerald-400/70" />
            Fila em tempo real
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400/70" />
            Dados protegidos
          </span>
        </div>
      </div>
    </div>
  </div>
);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, loginWithGoogle, register: registerUser } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [pendingReferral, setPendingReferral] = useState<string | null>(() =>
    referralStorage.get()
  );

  const showErrorToast = (message: string) => {
    setToast({ message, type: 'error' });
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  const [googleError, setGoogleError] = useState<string | null>(null);
  const googleRenderedRef = useRef(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const handleGoogleCredential = async (idToken: string) => {
    setGoogleError(null);
    setSubmitting(true);
    const result = await loginWithGoogle(idToken);
    setSubmitting(false);
    if (!result.ok && 'message' in result) {
      setGoogleError(result.message);
      return;
    }
    navigateAfterAuth();
  };

  useEffect(() => {
    if (!googleClientId) return;
    if (window.google?.accounts?.id) {
      setGoogleLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) setGoogleLoaded(true);
    };
    script.onerror = () => setGoogleError('Falha ao carregar script do Google.');
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [googleClientId]);

  useEffect(() => {
    if (!googleClientId || !googleLoaded || tab !== 'login' || googleRenderedRef.current) return;
    try {
      const google = window.google!;
      google.accounts!.id!.initialize({
        client_id: googleClientId,
        callback: ({ credential }: { credential?: string }) => {
          if (credential) handleGoogleCredential(credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      googleRenderedRef.current = true;
    } catch {
      setGoogleError('Erro ao inicializar botão Google.');
    }
  }, [googleClientId, googleLoaded, tab]);

  const handleGoogleClick = () => {
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.prompt(notification => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setGoogleError('Não foi possível abrir o login com Google. Tente novamente.');
      }
    });
  };

  React.useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      referralStorage.save(ref);
      setPendingReferral(ref.trim().toUpperCase());
      setTab('register');
    }
    if (searchParams.get('tab') === 'register') {
      setTab('register');
    }
  }, [searchParams]);

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
      termsVersion: '1.0',
      termsAccepted: false,
      marketingOptIn: false,
      lgpdConsent: false,
    },
    mode: 'onTouched',
  });
  const [registerFieldsUnlocked, setRegisterFieldsUnlocked] = useState(false);

  const handleLogoClick = () => {
    if (!user) {
      navigate('/');
      return;
    }
    const role = user.role.toUpperCase();
    if (role === 'MASTER_ADMIN' || role === 'ADMIN') {
      navigate('/master/dashboard');
      return;
    }
    navigate('/app/queue');
  };

  const navigateAfterAuth = (opts?: { forceCheckout?: boolean }) => {
    const planId = searchParams.get('planId');
    if (planId) {
      const billing = searchParams.get('billing') === 'YEARLY' ? 'YEARLY' : 'MONTHLY';
      navigate(`/checkout?planId=${encodeURIComponent(planId)}&billing=${billing}&setup=trial`);
      return;
    }
    const loggedUser = authStorage.getUser();
    if (loggedUser) {
      const role = loggedUser.role.toUpperCase();
      if (role === 'MASTER_ADMIN' || role === 'ADMIN') {
        navigate('/master/dashboard');
        return;
      }
    }
    if (opts?.forceCheckout) {
      navigate('/planos?setup=trial');
      return;
    }
    // Sem cartão no trial → checkout; StaffDashboard também redireciona
    navigate('/app/queue');
  };

  const handleLogin = async (data: LoginFormData) => {
    setSubmitting(true);
    const result = await login(data.email, data.password);
    setSubmitting(false);
    if (result.ok === false) {
      showErrorToast(result.message);
      return;
    }
    navigateAfterAuth();
  };

  const goToRegisterStep2 = async () => {
    const ok = await registerForm.trigger(['ownerName', 'email', 'cpf', 'password']);
    if (!ok) return;
    const cpf = normalizeDocument(registerForm.getValues('cpf') ?? '');
    if (!isValidDocument('CPF', cpf)) {
      showErrorToast('CPF inválido. Confira o número digitado.');
      return;
    }
    setRegisterStep(2);
  };

  const handleRegister = async (data: RegisterFormData) => {
    const cpf = normalizeDocument(data.cpf);
    if (!isValidDocument('CPF', cpf)) {
      showErrorToast('CPF inválido. Confira o número digitado.');
      setRegisterStep(1);
      return;
    }
    setSubmitting(true);
    const referralCode = referralStorage.get() ?? undefined;
    sessionStorage.setItem('agendai:just-registered', 'true');
    const result = await registerUser({
      ownerName: data.ownerName.trim(),
      email: data.email.trim(),
      password: data.password,
      cpf,
      barbershopName: data.barbershopName.trim(),
      whatsapp: normalizeDocument(data.whatsapp),
      cnpj: data.cnpj ? normalizeDocument(data.cnpj) : undefined,
      referralCode,
      termsVersion: data.termsVersion,
      termsAccepted: data.termsAccepted,
      marketingOptIn: data.marketingOptIn,
      lgpdConsent: data.lgpdConsent,
    });
    setSubmitting(false);
    if (result.ok === false) {
      sessionStorage.removeItem('agendai:just-registered');
      showErrorToast(result.message);
      return;
    }
    referralStorage.clear();
    navigateAfterAuth({ forceCheckout: true });
  };

  const registerPassword = registerForm.watch('password') ?? '';
  const emailField = registerForm.register('email');
  const passwordField = registerForm.register('password');

  const switchTab = (next: Tab) => {
    setTab(next);
    setRegisterStep(1);
    setRegisterFieldsUnlocked(false);
    sessionStorage.removeItem('agendai:just-registered');
    if (next === 'register') {
      registerForm.reset({
        ownerName: '',
        email: '',
        password: '',
        cpf: '',
        barbershopName: '',
        whatsapp: '',
        cnpj: '',
        termsVersion: '1.0',
        termsAccepted: false,
        marketingOptIn: false,
        lgpdConsent: false,
      });
    }
  };

  const primaryBtn =
    'relative w-full py-3.5 bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/25 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60 overflow-hidden group/btn active:scale-[0.98] cursor-pointer';

  return (
    <div className="min-h-screen bg-bg grid lg:grid-cols-2">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <BrandPanel />

      <div className="relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(600px circle at 50% 20%, color-mix(in srgb, var(--ag-accent) 7%, transparent), transparent 70%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-surface/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl overflow-hidden"
        >
          <div
            className="h-1 w-full"
            style={{
              background: 'linear-gradient(to right, transparent, var(--ag-accent), transparent)',
            }}
          />

          <div className="p-5 sm:p-7 flex flex-col items-center">
            <div className="mb-5 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleLogoClick}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <Logo size="md" />
              </button>
              <p className="text-xs text-text-muted text-center">
                {tab === 'login'
                  ? 'Bem-vindo(a) de volta ao seu painel.'
                  : registerStep === 1
                    ? 'Passo 1 de 2 — seus dados'
                    : 'Passo 2 de 2 — dados do salão'}
              </p>
            </div>

            <div className="relative flex w-full p-1 rounded-xl bg-bg border border-border mb-5">
              {(
                [
                  { id: 'login' as const, label: 'Entrar' },
                  { id: 'register' as const, label: 'Criar conta' },
                ] as const
              ).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => switchTab(t.id)}
                  className="relative flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {tab === t.id && (
                    <motion.span
                      layoutId="login-tab-pill"
                      className="absolute inset-0 rounded-lg bg-surface border border-border shadow-sm"
                      transition={{
                        type: 'spring',
                        bounce: 0.2,
                        duration: 0.45,
                      }}
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

            {tab === 'register' && (
              <div className="w-full flex items-center gap-2 mb-4">
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    registerStep >= 1 ? 'bg-accent' : 'bg-border'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    registerStep >= 2 ? 'bg-accent' : 'bg-border'
                  }`}
                />
              </div>
            )}

            {tab === 'register' && pendingReferral && (
              <p className="w-full mb-3 text-[11px] text-center text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
                Indicação ativa · código{' '}
                <strong className="tracking-wider">{pendingReferral}</strong>
              </p>
            )}

            <AnimatePresence mode="wait" initial={false}>
              {tab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={loginForm.handleSubmit(handleLogin)}
                  autoComplete="off"
                  className="w-full space-y-4"
                >
                  <Field
                    label="E-mail"
                    icon={Mail}
                    error={loginForm.formState.errors.email?.message}
                  >
                    <input
                      type="email"
                      autoComplete="new-email"
                      className={inputClass(!!loginForm.formState.errors.email)}
                      placeholder="seu@email.com"
                      autoFocus
                      {...loginForm.register('email')}
                    />
                  </Field>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                      Senha
                    </label>
                    <PasswordInput
                      showPassword={showPassword}
                      onToggleShow={() => setShowPassword(v => !v)}
                      error={loginForm.formState.errors.password?.message}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...loginForm.register('password')}
                    />
                  </div>

                  <button type="submit" disabled={submitting} className={primaryBtn}>
                    {submitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        Entrar
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover/btn:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key={`register-${registerStep}`}
                  initial={{ opacity: 0, x: registerStep === 1 ? 16 : -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: registerStep === 1 ? -16 : 16 }}
                  transition={{ duration: 0.2 }}
                  autoComplete="off"
                  onSubmit={e => {
                    e.preventDefault();
                    if (registerStep === 1) {
                      void goToRegisterStep2();
                      return;
                    }
                    void registerForm.handleSubmit(handleRegister)(e);
                  }}
                  className="w-full space-y-3"
                >
                  {registerStep === 1 ? (
                    <>
                      <p className="text-[11px] text-text-muted text-center leading-relaxed pb-1">
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

                      <div className="space-y-1">
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

                      <button type="submit" className={primaryBtn}>
                        Continuar
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover/btn:translate-x-1"
                        />
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] text-text-muted text-center leading-relaxed pb-1">
                        Quase lá — conte um pouco sobre o salão.
                      </p>

                      <Field
                        label="Nome do salão"
                        icon={Store}
                        error={registerForm.formState.errors.barbershopName?.message}
                      >
                        <input
                          className={inputClass(!!registerForm.formState.errors.barbershopName)}
                          placeholder="Salão Beleza & Estilo"
                          autoFocus
                          {...registerForm.register('barbershopName')}
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

                      <div className="space-y-3 pt-2 border-t border-border">
                        <p className="text-[11px] text-text-muted text-center">
                          Ao criar sua conta, você concorda com nossos termos e políticas.
                        </p>
                        <ConsentCheckbox
                          label="Li e aceito os Termos de Uso"
                          checked={registerForm.watch('termsAccepted')}
                          onChange={v =>
                            registerForm.setValue('termsAccepted', v, { shouldValidate: true })
                          }
                          required
                          helpLink={{ label: 'Ler Termos de Uso', href: '/termos' }}
                        />
                        <ConsentCheckbox
                          label="Consinto com o tratamento dos meus dados pessoais conforme a LGPD (Lei nº 13.709/2018)"
                          checked={registerForm.watch('lgpdConsent')}
                          onChange={v =>
                            registerForm.setValue('lgpdConsent', v, { shouldValidate: true })
                          }
                          required
                          helpLink={{ label: 'Política de Privacidade', href: '/privacidade' }}
                        />
                        <ConsentCheckbox
                          label="Desejo receber comunicações de marketing, novidades e ofertas por e-mail"
                          checked={registerForm.watch('marketingOptIn')}
                          onChange={v => registerForm.setValue('marketingOptIn', v)}
                          helpText="Você pode cancelar a inscrição a qualquer momento."
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setRegisterStep(1);
                          }}
                          className="flex-1 py-3.5 rounded-xl border border-border bg-bg text-text-secondary hover:text-text-primary hover:border-border-strong font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <ArrowLeft size={14} />
                          Voltar
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`${primaryBtn} flex-[1.4]`}
                        >
                          {submitting ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              Criar conta
                              <ArrowRight
                                size={14}
                                className="transition-transform group-hover/btn:translate-x-1"
                              />
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            {tab === 'login' && googleClientId && (
              <div className="w-full mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-text-muted uppercase">ou</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl border border-border bg-bg hover:bg-surface hover:border-border-strong text-text-primary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-60 cursor-pointer"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Entrar com Google
                </button>
                {googleError && (
                  <p className="text-[11px] text-center text-danger mt-2">{googleError}</p>
                )}
              </div>
            )}

            <p className="mt-5 text-[10px] text-text-muted flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-accent" />
              Conexão segura · Seus dados estão protegidos
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
