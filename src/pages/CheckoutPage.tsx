import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// MercadoPago SDK removido — pagamento exclusivo via Asaas
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  QrCode,
  CreditCard,
  Copy,
  CheckCircle2,
  Clock,
  PartyPopper,
  Landmark,
} from 'lucide-react';
import { plansApi, Plan, pickPlanForCheckout } from '../infra/plansApi';
import { subscriptionsApi, SubscribePayload } from '../infra/subscriptionsApi';
import { paymentsApi, Payment } from '../infra/paymentsApi';
import { getErrorMessage } from '../utils/errorMessage';
import { trialCampaign } from '../marketing/trialCampaign';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Logo } from '../components/ui/Logo';
import { CreditCardForm } from '../components/ui/credit-card-form';
import {
  normalizeDocument,
  maskCpf,
  maskCnpj,
  maskPhone,
  normalizePhoneBR,
  isValidDocument,
} from '../utils/documentUtils';

const PIX_POLL_INTERVAL_MS = 5_000;

const formatPrice = (price: number) =>
  price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Mensagens amigáveis para os status_detail mais comuns de recusa do MP. */
const REJECTION_MESSAGES: Record<string, string> = {
  cc_rejected_insufficient_amount: 'Cartão sem limite suficiente. Tente outro cartão.',
  cc_rejected_bad_filled_card_number: 'Número do cartão inválido. Confira os dados.',
  cc_rejected_bad_filled_date: 'Data de validade inválida. Confira os dados.',
  cc_rejected_bad_filled_security_code: 'Código de segurança (CVV) inválido.',
  cc_rejected_bad_filled_other: 'Dados do cartão inválidos. Confira e tente novamente.',
  cc_rejected_call_for_authorize: 'O banco emissor não autorizou. Entre em contato com seu banco.',
  cc_rejected_card_disabled: 'Cartão desabilitado. Entre em contato com seu banco.',
  cc_rejected_duplicated_payment: 'Pagamento duplicado. Aguarde alguns minutos.',
  cc_rejected_high_risk: 'Pagamento recusado por segurança. Tente outro meio de pagamento.',
  cc_rejected_other_reason: 'Pagamento recusado pelo emissor do cartão. Tente outro cartão.',
};

const rejectionMessage = (statusDetail?: string) =>
  (statusDetail && REJECTION_MESSAGES[statusDetail]) ||
  'Pagamento recusado. Verifique os dados ou tente outro meio de pagamento.';

const inputClass =
  'w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm outline-none transition-colors placeholder:text-text-muted focus:border-accent/60 hover:border-border-strong';

export interface SubscriptionCheckoutProps {
  planId?: string | null;
  billing?: 'MONTHLY' | 'YEARLY';
  setupTrial?: boolean;
  variant?: 'page' | 'embedded';
  onBack?: () => void;
}

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  planId: planIdProp,
  billing = 'YEARLY',
  setupTrial = false,
  variant = 'page',
  onBack,
}) => {
  const navigate = useNavigate();
  const planId = planIdProp ?? null;
  const billingParam = billing;
  const isTrialSetup = setupTrial;
  const { user } = useAuth();
  const { data: subscriptionData, refresh: refreshSubscription } = useSubscription();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [asaasBillingType, setAsaasBillingType] = useState<'PIX' | 'CREDIT_CARD'>(
    isTrialSetup ? 'CREDIT_CARD' : 'PIX'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const idempotencyKeys = useRef({
    PIX: crypto.randomUUID(),
    CREDIT_CARD: crypto.randomUUID(),
    TRIAL: crypto.randomUUID(),
  });

  // Dados do pagador
  const [payerEmail, setPayerEmail] = useState(user?.email ?? '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [docType, setDocType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [docNumber, setDocNumber] = useState('');

  // Cartão Asaas: o fluxo atual envia os dados ao backend sem persistência/log.
  const [asaasCardName, setAsaasCardName] = useState('');
  const [asaasCardNumber, setAsaasCardNumber] = useState('');
  const [asaasCardExpiry, setAsaasCardExpiry] = useState('');
  const [asaasCardCvv, setAsaasCardCvv] = useState('');
  const [asaasPostalCode, setAsaasPostalCode] = useState('');
  const [asaasAddressNumber, setAsaasAddressNumber] = useState('');
  const [asaasPhone, setAsaasPhone] = useState('');

  // PIX
  const [pixPayment, setPixPayment] = useState<Payment | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [pixExpired, setPixExpired] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!cancelled) {
        setLoadingPlan(true);
        setError(null);
      }
      try {
        if (planId) {
          try {
            const found = await plansApi.get(planId);
            if (!cancelled) setPlan(found);
            return;
          } catch {
            /* cai no fallback da lista / GET /me */
          }
        }
        let list: Plan[] = [];
        try {
          list = await plansApi.list();
        } catch {
          list = [];
        }
        if (list.length === 0) {
          list = (subscriptionData?.plans ?? []).filter(p => p.active !== false);
        }
        const chosen = pickPlanForCheckout(list, billingParam);
        if (!chosen) {
          if (!cancelled) {
            setError('Nenhum plano disponível no momento. Tente de novo em instantes.');
            setPlan(null);
          }
          return;
        }
        if (!cancelled) setPlan(chosen);
      } catch {
        if (!cancelled) setError('Plano não encontrado. Volte e escolha novamente.');
      } finally {
        if (!cancelled) setLoadingPlan(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [planId, billingParam, subscriptionData?.plans]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handleApproved = useCallback(() => {
    stopPolling();
    setSuccess(true);
    sessionStorage.removeItem('agendai:access-block-info');
    refreshSubscription();
  }, [stopPolling, refreshSubscription]);

  // Polling do status do pagamento PIX
  useEffect(() => {
    if (!pixPayment || success || pixExpired) return;

    pollRef.current = setInterval(async () => {
      try {
        const updated = await paymentsApi.getStatus(pixPayment.id);
        if (updated.status === 'approved') {
          handleApproved();
        } else if (['rejected', 'cancelled'].includes(updated.status)) {
          stopPolling();
          setPixPayment(null);
          setError(rejectionMessage(updated.statusDetail));
        }
      } catch {
        // Falha transitória de rede — o próximo tick tenta de novo
      }
    }, PIX_POLL_INTERVAL_MS);

    return stopPolling;
  }, [pixPayment, success, pixExpired, handleApproved, stopPolling]);

  // Contagem regressiva de expiração do PIX
  useEffect(() => {
    if (!pixPayment?.pixQrCode?.expirationDate || success) return;
    const expiresAt = new Date(pixPayment.pixQrCode.expirationDate).getTime();
    if (Number.isNaN(expiresAt)) return;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        setPixExpired(true);
        stopPolling();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [pixPayment, success, stopPolling]);

  const validatePayerForm = (): string | null => {
    if (!payerEmail || !/\S+@\S+\.\S+/.test(payerEmail)) return 'Informe um e-mail válido.';
    const asaasCard = asaasBillingType === 'CREDIT_CARD';
    const doc = normalizeDocument(docNumber);
    if (asaasCard || doc) {
      if (!isValidDocument(docType, doc)) return `${docType} inválido. Confira o número.`;
    }
    return null;
  };

  const validateAsaasCard = (): string | null => {
    if (!asaasCardName.trim()) return 'Informe o nome impresso no cartão.';
    const digits = asaasCardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19)
      return 'Número do cartão inválido. Confira os dados.';
    const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(asaasCardExpiry.trim());
    if (!m) return 'Validade inválida. Use o formato MM/AA.';
    const month = Number(m[1]);
    const year = 2000 + Number(m[2]);
    const now = new Date();
    if (
      month < 1 ||
      month > 12 ||
      year < now.getFullYear() ||
      (year === now.getFullYear() && month < now.getMonth() + 1)
    ) {
      return 'Validade do cartão vencida. Confira os dados.';
    }
    if (!/^\d{3,4}$/.test(asaasCardCvv.trim())) return 'Código de segurança (CVV) inválido.';
    if (normalizeDocument(asaasPostalCode).length !== 8)
      return 'Informe um CEP válido (8 dígitos).';
    if (!asaasAddressNumber.trim()) return 'Informe o número do endereço do titular.';
    const phoneDigits = normalizePhoneBR(asaasPhone);
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return 'Informe um telefone válido com DDD.';
    }
    return null;
  };

  const buildBasePayload = (): SubscribePayload => {
    const doc = normalizeDocument(docNumber);
    return {
      planId: plan!.id,
      paymentMethod: 'asaas',
      payerEmail: payerEmail.trim(),
      payerFirstName: firstName.trim() || undefined,
      payerLastName: lastName.trim() || undefined,
      payerIdentification: doc ? { type: docType, number: doc } : undefined,
    };
  };

  const submitAsaasPix = async (newAttempt = false) => {
    const validationError = validatePayerForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (newAttempt) idempotencyKeys.current.PIX = crypto.randomUUID();
      const subscription = await subscriptionsApi.subscribe({
        ...buildBasePayload(),
        asaasBillingType: 'PIX',
      }, idempotencyKeys.current.PIX);
      const payment = subscription.payment;
      if (!payment?.pixQrCode?.qrCode) {
        throw new Error(
          'O pagamento PIX foi criado, mas o QR Code não foi retornado. Tente novamente.'
        );
      }
      setPixExpired(false);
      setPixPayment(payment);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Erro ao gerar o PIX.'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitAsaasCard = async () => {
    const validationError = validatePayerForm() || validateAsaasCard();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const [mm, yy] = asaasCardExpiry.split('/');
      const card = {
        holderName: asaasCardName.trim(),
        number: asaasCardNumber.replace(/\D/g, ''),
        expiryMonth: mm.trim(),
        expiryYear: `20${yy.trim()}`,
        ccv: asaasCardCvv.trim(),
        postalCode: normalizeDocument(asaasPostalCode),
        addressNumber: asaasAddressNumber.trim(),
        phone: normalizePhoneBR(asaasPhone),
      };
      const doc = normalizeDocument(docNumber);

      if (isTrialSetup) {
        if (!doc || !isValidDocument(docType, doc)) {
          setError(`${docType} inválido. Confira o número.`);
          setSubmitting(false);
          return;
        }
        const sub = await subscriptionsApi.setupTrialCard({
          planId: plan!.id,
          payerEmail: payerEmail.trim(),
          payerFirstName: firstName.trim() || undefined,
          payerLastName: lastName.trim() || undefined,
          payerIdentification: { type: docType, number: doc },
          asaasCreditCard: card,
        }, idempotencyKeys.current.TRIAL);
        await refreshSubscription();
        if (sub.hasPaymentMethod || sub.status === 'TRIALING') {
          setSuccess(true);
          sessionStorage.removeItem('agendai:access-block-info');
        } else {
          setError('Cartão não foi salvo. Tente novamente.');
        }
        return;
      }

      await subscriptionsApi.subscribe({
        ...buildBasePayload(),
        asaasBillingType: 'CREDIT_CARD',
        asaasCreditCard: card,
      }, idempotencyKeys.current.CREDIT_CARD);
      setError(
        'Pagamento processado. Assim que for confirmado, seu acesso será liberado automaticamente.'
      );
    } catch (err: any) {
      setError(getErrorMessage(err, 'Erro ao processar o cartão.'));
    } finally {
      setSubmitting(false);
    }
  };

  const copyPixCode = async () => {
    if (!pixPayment?.pixQrCode?.qrCode) return;
    await navigator.clipboard.writeText(pixPayment.pixQrCode.qrCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  const formatCountdown = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0
      ? `${h}h ${String(m).padStart(2, '0')}m`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onBack) onBack();
                else navigate(user ? '/app/subscription' : '/planos');
              }}
              className="p-2 rounded-lg text-text-secondary hover:text-accent transition-colors"
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
            <Logo size="sm" />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {loadingPlan && (
          <div className="flex justify-center py-20 text-accent">
            <Loader2 className="animate-spin" size={36} />
          </div>
        )}

        {!loadingPlan && plan && success && (
          <div className="bg-surface border border-success/40 rounded-2xl p-10 text-center">
            <PartyPopper size={48} className="mx-auto text-success mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {isTrialSetup ? 'Trial liberado!' : 'Assinatura ativa!'}
            </h1>
            <p className="text-text-secondary text-sm mb-8">
              {isTrialSetup ? (
                <>
                  Plano <span className="font-bold text-text-primary">{plan.name}</span> com 30 dias
                  de Pro. Experimente o painel completo e veja se faz sentido para o seu negócio.
                </>
              ) : (
                <>
                  O plano <span className="font-bold text-text-primary">{plan.name}</span> foi
                  ativado com sucesso. Bom trabalho!
                </>
              )}
            </p>
            <button
              onClick={() => navigate('/app/queue')}
              className="px-6 py-3 rounded-xl bg-accent text-accent-fg font-bold text-sm hover:bg-accent-hover transition-colors"
            >
              Ir para o painel
            </button>
          </div>
        )}

        {!loadingPlan && plan && !success && (
          <>
            <div className="bg-surface border border-border rounded-2xl p-5 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">
                  Plano escolhido
                </p>
                <h1 className="text-lg font-bold">{plan.name}</h1>
                <p className="mt-1 text-[11px] text-text-secondary leading-relaxed max-w-sm">
                  {trialCampaign.checkoutHint}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-accent">{formatPrice(plan.price)}</span>
                <span className="text-xs text-text-muted block">
                  {plan.billingCycle === 'YEARLY' ? '/ano' : '/mês'}
                </span>
              </div>
            </div>

            {isTrialSetup && (
              <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-xl text-sm text-text-secondary">
                <p className="font-bold text-accent mb-1">{trialCampaign.eyebrow}</p>
                <p>
                  {trialCampaign.checkoutHint} Cadastre um cartão para liberar o painel; a cobrança
                  só acontece depois do trial.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-xl flex items-start gap-2 text-danger text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            {/* Tela do QR Code PIX gerado (Mercado Pago ou Asaas) */}
            {pixPayment?.pixQrCode && !pixExpired && (
              <div className="bg-surface border border-border rounded-2xl p-6 text-center">
                <h2 className="font-bold mb-1">Escaneie para pagar</h2>
                <p className="text-xs text-text-muted mb-4">
                  Abra o app do seu banco e escaneie o QR Code, ou copie o código abaixo.
                </p>

                {pixPayment.pixQrCode.qrCodeBase64 && (
                  <img
                    src={`data:image/png;base64,${pixPayment.pixQrCode.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="mx-auto w-56 h-56 rounded-xl border border-border bg-white p-2 mb-4"
                  />
                )}

                {secondsLeft !== null && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-warning font-medium mb-4">
                    <Clock size={13} /> Expira em {formatCountdown(secondsLeft)}
                  </div>
                )}

                <div className="flex items-center gap-2 bg-bg border border-border rounded-xl p-2 mb-4">
                  <code className="flex-1 text-[10px] text-text-secondary truncate text-left">
                    {pixPayment.pixQrCode.qrCode}
                  </code>
                  <button
                    onClick={copyPixCode}
                    className="px-3 py-2 rounded-lg bg-accent text-accent-fg text-xs font-bold flex items-center gap-1.5 hover:bg-accent-hover transition-colors shrink-0"
                  >
                    {pixCopied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    {pixCopied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                  <Loader2 size={15} className="animate-spin text-accent" />
                  Aguardando confirmação do pagamento...
                </div>
              </div>
            )}

            {/* PIX expirado */}
            {pixExpired && (
              <div className="bg-surface border border-warning/40 rounded-2xl p-8 text-center">
                <Clock size={40} className="mx-auto text-warning mb-3" />
                <h2 className="font-bold mb-1">QR Code expirado</h2>
                <p className="text-sm text-text-secondary mb-6">
                  O tempo para pagamento acabou. Gere um novo código para continuar.
                </p>
                <button
                  onClick={() => {
                    setPixPayment(null);
                    setPixExpired(false);
                    submitAsaasPix(true);
                  }}
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-accent text-accent-fg font-bold text-sm hover:bg-accent-hover transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Gerando...' : 'Gerar novo PIX'}
                </button>
              </div>
            )}

            {/* Formulário (dados do pagador + cartão) */}
            {!(pixPayment && !pixExpired) && !pixExpired && (
              <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-sm uppercase tracking-wider text-text-secondary">
                  Dados do pagador
                </h2>

                <div>
                  <label htmlFor="payer-email" className="text-xs font-bold text-text-secondary block mb-1">
                    E-mail *
                  </label>
                  <input
                    id="payer-email"
                    type="email"
                    className={inputClass}
                    placeholder="seu@email.com"
                    value={payerEmail}
                    onChange={e => setPayerEmail(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="payer-first-name" className="text-xs font-bold text-text-secondary block mb-1">Nome</label>
                    <input
                      id="payer-first-name"
                      className={inputClass}
                      placeholder="Nome"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="payer-last-name" className="text-xs font-bold text-text-secondary block mb-1">
                      Sobrenome
                    </label>
                    <input
                      id="payer-last-name"
                      className={inputClass}
                      placeholder="Sobrenome"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[148px_1fr]">
                  <div>
                    <p className="text-xs font-bold text-text-secondary block mb-1">
                      Documento
                    </p>
                    <div
                      role="group"
                      aria-label="Tipo de documento"
                      className="flex h-[46px] rounded-xl border border-border bg-bg p-1 gap-0.5"
                    >
                      {(['CPF', 'CNPJ'] as const).map(type => {
                        const active = docType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            aria-pressed={active}
                            onClick={() => {
                              if (docType === type) return;
                              setDocType(type);
                              setDocNumber('');
                            }}
                            className={`flex-1 rounded-lg text-sm font-bold transition-all ${
                              active
                                ? 'bg-accent text-accent-fg shadow-sm shadow-accent/20'
                                : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="payer-document" className="text-xs font-bold text-text-secondary block mb-1">
                      Número {asaasBillingType === 'CREDIT_CARD' ? '*' : '(opcional para PIX)'}
                    </label>
                    <input
                      id="payer-document"
                      className={inputClass}
                      placeholder={docType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                      value={docNumber}
                      onChange={e =>
                        setDocNumber(
                          docType === 'CPF' ? maskCpf(e.target.value) : maskCnpj(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                {!isTrialSetup && (
                  <>
                    <div className="flex bg-bg/60 p-1 rounded-xl border border-border gap-0.5">
                      {(
                        [
                          { id: 'PIX', label: 'PIX', icon: QrCode },
                          { id: 'CREDIT_CARD', label: 'Cartão', icon: CreditCard },
                        ] as const
                      ).map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setAsaasBillingType(opt.id);
                            setError(null);
                          }}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                            asaasBillingType === opt.id
                              ? 'bg-accent/15 text-accent'
                              : 'text-text-muted hover:text-text-secondary'
                          }`}
                        >
                          <opt.icon size={13} /> {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-text-muted">
                      Pagamento processado pelo Asaas{' '}
                      {asaasBillingType === 'PIX'
                        ? 'via PIX — o QR Code é gerado aqui mesmo.'
                        : 'via cartão — o pagamento é aprovado em instantes.'}
                    </p>
                  </>
                )}

                {isTrialSetup && (
                  <p className="text-xs text-text-muted">
                    Cartão tokenizado pelo Asaas — sem cobrança até o fim dos 30 dias.
                  </p>
                )}

                {asaasBillingType === 'CREDIT_CARD' && (
                  <>
                    <div className="pt-2">
                      <CreditCardForm
                        maskMiddle
                        showSubmit={false}
                        ring1="#10b981"
                        ring2="#06b6d4"
                        submitLabel={
                          isTrialSetup ? 'Cadastrar cartão' : `Pagar ${formatPrice(plan.price)}`
                        }
                        onChange={state => {
                          setAsaasCardNumber(state.number);
                          setAsaasCardName(state.holder);
                          setAsaasCardExpiry(`${state.month}/${state.year.slice(-2)}`);
                          setAsaasCardCvv(state.cvv);
                        }}
                        onSubmit={() => {
                          if (asaasBillingType === 'CREDIT_CARD') {
                            submitAsaasCard();
                          }
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="billing-postal-code" className="text-xs font-bold text-text-secondary block mb-1">
                          CEP *
                        </label>
                        <input
                          id="billing-postal-code"
                          className={inputClass}
                          placeholder="00000-000"
                          inputMode="numeric"
                          value={asaasPostalCode}
                          onChange={e => {
                            const d = normalizeDocument(e.target.value).slice(0, 8);
                            setAsaasPostalCode(d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d);
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="billing-address-number" className="text-xs font-bold text-text-secondary block mb-1">
                          Nº endereço *
                        </label>
                        <input
                          id="billing-address-number"
                          className={inputClass}
                          placeholder="123"
                          value={asaasAddressNumber}
                          onChange={e => setAsaasAddressNumber(e.target.value.slice(0, 20))}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="billing-phone" className="text-xs font-bold text-text-secondary block mb-1">
                        Telefone do titular *
                      </label>
                      <input
                        id="billing-phone"
                        className={inputClass}
                        placeholder="(00) 00000-0000"
                        inputMode="numeric"
                        value={asaasPhone}
                        onChange={e => setAsaasPhone(maskPhone(e.target.value))}
                      />
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={asaasBillingType === 'CREDIT_CARD' ? submitAsaasCard : () => submitAsaasPix(false)}
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-accent text-accent-fg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processando...
                    </>
                  ) : isTrialSetup ? (
                    <>
                      <Landmark size={16} /> Cadastrar cartão e começar trial
                    </>
                  ) : asaasBillingType === 'PIX' ? (
                    <>
                      <QrCode size={16} /> Gerar QR Code PIX
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} /> Pagar {formatPrice(plan.price)}
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {!loadingPlan && !plan && (
          <div className="text-center py-16">
            <p className="text-text-muted mb-4">{error || 'Plano não encontrado.'}</p>
            <button
              onClick={() => {
                if (onBack) onBack();
                else navigate(`/checkout?billing=${billingParam}`);
              }}
              className="px-5 py-2.5 rounded-xl bg-accent text-accent-fg font-bold text-sm hover:bg-accent-hover transition-colors"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={() => navigate('/planos')}
              className="ml-2 px-5 py-2.5 rounded-xl border border-border text-text-secondary font-bold text-sm hover:border-accent hover:text-accent transition-colors"
            >
              Ver planos
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  return (
    <SubscriptionCheckout
      planId={searchParams.get('planId')}
      billing={searchParams.get('billing') === 'MONTHLY' ? 'MONTHLY' : 'YEARLY'}
      setupTrial={searchParams.get('setup') === 'trial'}
      variant="page"
    />
  );
};

export default CheckoutPage;
