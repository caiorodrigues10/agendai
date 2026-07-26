import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CardNumber,
  ExpirationDate,
  SecurityCode,
  createCardToken,
  getPaymentMethods
} from '@mercadopago/sdk-react';
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
  ExternalLink,
  RefreshCcw
} from 'lucide-react';
import { plansApi, Plan } from '../infra/plansApi';
import { subscriptionsApi, SubscribePayload } from '../infra/subscriptionsApi';
import { paymentsApi, Payment } from '../infra/paymentsApi';
import { ensureMercadoPago } from '../infra/mercadoPago';
import { ApiError } from '../infra/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Logo } from '../components/ui/Logo';
import { normalizeDocument, maskCpf, maskCnpj, isValidDocument } from '../utils/documentUtils';

type PayMethod = 'pix' | 'credit_card' | 'payment_link';

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
  cc_rejected_other_reason: 'Pagamento recusado pelo emissor do cartão. Tente outro cartão.'
};

const rejectionMessage = (statusDetail?: string) =>
  (statusDetail && REJECTION_MESSAGES[statusDetail]) ||
  'Pagamento recusado. Verifique os dados ou tente outro meio de pagamento.';

const inputClass =
  'w-full bg-bg border border-border rounded-xl py-3 px-4 text-text-primary text-sm outline-none transition-colors placeholder:text-text-muted focus:border-accent/60 hover:border-border-strong';

const secureFieldContainerClass =
  'w-full bg-bg border border-border rounded-xl px-4 text-sm transition-colors focus-within:border-accent/60 hover:border-border-strong h-[46px]';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const planId = searchParams.get('planId');
  const returnStatus = searchParams.get('status');
  const { user } = useAuth();
  const { refresh: refreshSubscription, data: subscriptionData } = useSubscription();
  const { theme } = useTheme();

  const mpReady = useMemo(() => ensureMercadoPago(), []);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [method, setMethod] = useState<PayMethod>('payment_link');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [awaitingLinkConfirm, setAwaitingLinkConfirm] = useState(false);
  const [checkingReturn, setCheckingReturn] = useState(false);

  // Dados do pagador
  const [payerEmail, setPayerEmail] = useState(user?.email ?? '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [docType, setDocType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [docNumber, setDocNumber] = useState('');

  // Cartão
  const [cardholderName, setCardholderName] = useState('');
  const [cardPaymentMethodId, setCardPaymentMethodId] = useState<string | null>(null);

  // PIX
  const [pixPayment, setPixPayment] = useState<Payment | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [pixExpired, setPixExpired] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!planId) {
      navigate('/planos', { replace: true });
      return;
    }
    plansApi
      .get(planId)
      .then(setPlan)
      .catch(() => setError('Plano não encontrado. Volte e escolha novamente.'))
      .finally(() => setLoadingPlan(false));
  }, [planId, navigate]);

  // Retorno do checkout hospedado AbacatePay (?status=success|back)
  useEffect(() => {
    if (!returnStatus || loadingPlan) return;

    if (returnStatus === 'back') {
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev);
          next.delete('status');
          return next;
        },
        { replace: true }
      );
      setMethod('payment_link');
      return;
    }

    if (returnStatus !== 'success') return;

    let cancelled = false;
    setAwaitingLinkConfirm(true);
    setCheckingReturn(true);

    (async () => {
      try {
        await refreshSubscription();
        if (cancelled) return;
        const me = await subscriptionsApi.me();
        if (me.subscription?.status === 'ACTIVE') {
          setSuccess(true);
          setAwaitingLinkConfirm(false);
          sessionStorage.removeItem('bq:access-block-info');
        }
      } catch {
        // Mantém tela de aguardando — usuário pode atualizar manualmente
      } finally {
        if (!cancelled) setCheckingReturn(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [returnStatus, loadingPlan, refreshSubscription, setSearchParams]);

  useEffect(() => {
    if (awaitingLinkConfirm && subscriptionData?.subscription?.status === 'ACTIVE') {
      setSuccess(true);
      setAwaitingLinkConfirm(false);
      sessionStorage.removeItem('bq:access-block-info');
    }
  }, [awaitingLinkConfirm, subscriptionData?.subscription?.status]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handleApproved = useCallback(() => {
    stopPolling();
    setSuccess(true);
    sessionStorage.removeItem('bq:access-block-info');
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
    const doc = normalizeDocument(docNumber);
    if (method === 'credit_card' || doc) {
      if (!isValidDocument(docType, doc)) return `${docType} inválido. Confira o número.`;
    }
    if (method === 'credit_card' && !cardholderName.trim()) {
      return 'Informe o nome impresso no cartão.';
    }
    return null;
  };

  const buildBasePayload = (): SubscribePayload => {
    const doc = normalizeDocument(docNumber);
    return {
      planId: planId!,
      paymentMethod: method,
      payerEmail: payerEmail.trim(),
      payerFirstName: firstName.trim() || undefined,
      payerLastName: lastName.trim() || undefined,
      payerIdentification: doc ? { type: docType, number: doc } : undefined
    };
  };

  const submitPix = async () => {
    const validationError = validatePayerForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const subscription = await subscriptionsApi.subscribe(buildBasePayload());
      const payment = (subscription as any).payment as Payment | undefined;
      if (!payment?.pixQrCode?.qrCode) {
        throw new Error('O pagamento PIX foi criado, mas o QR Code não foi retornado. Tente novamente.');
      }
      setPixExpired(false);
      setPixPayment(payment);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : err?.message ?? 'Erro ao gerar o PIX.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitCard = async () => {
    const validationError = validatePayerForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!cardPaymentMethodId) {
      setError('Não foi possível identificar a bandeira do cartão. Confira o número digitado.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // Tokenização no browser — o número do cartão nunca passa pelo nosso backend
      let token;
      try {
        token = await createCardToken({
          cardholderName: cardholderName.trim(),
          identificationType: docType,
          identificationNumber: normalizeDocument(docNumber)
        });
      } catch (tokenErr: any) {
        const details = Array.isArray(tokenErr?.cause)
          ? tokenErr.cause.map((c: any) => c?.description).filter(Boolean).join(' ')
          : '';
        throw new Error(
          `Dados do cartão inválidos. Confira número, validade e CVV. ${details}`.trim()
        );
      }
      if (!token?.id) {
        throw new Error('Não foi possível validar o cartão. Confira os dados e tente novamente.');
      }

      const subscription = await subscriptionsApi.subscribe({
        ...buildBasePayload(),
        cardToken: token.id,
        cardPaymentMethodId
      });

      const payment = (subscription as any).payment as Payment | undefined;
      if (subscription.status === 'ACTIVE') {
        handleApproved();
      } else if (payment && payment.status === 'rejected') {
        setError(rejectionMessage(payment.statusDetail));
      } else if (payment && ['pending', 'in_process'].includes(payment.status)) {
        setError(
          'O pagamento está em análise pelo emissor. Assim que for aprovado, seu acesso será liberado automaticamente.'
        );
      } else {
        setError('O pagamento não foi aprovado. Tente novamente ou use PIX.');
      }
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : err?.message ?? 'Erro ao processar o cartão.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitPaymentLink = async () => {
    const validationError = validatePayerForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const sub = await subscriptionsApi.subscribe({
        ...buildBasePayload(),
        paymentMethod: 'payment_link'
      });
      const payment = sub.payment;
      if (!payment?.checkoutUrl) {
        throw new Error(
          'O link de pagamento foi criado, mas a URL não foi retornada. Tente novamente.'
        );
      }
      window.location.assign(payment.checkoutUrl);
    } catch (err: any) {
      setError(
        err instanceof ApiError
          ? err.message
          : err?.message ?? 'Erro ao gerar o link de pagamento.'
      );
      setSubmitting(false);
    }
  };

  const refreshAfterLinkReturn = async () => {
    setCheckingReturn(true);
    setError(null);
    try {
      await refreshSubscription();
      const me = await subscriptionsApi.me();
      if (me.subscription?.status === 'ACTIVE') {
        setSuccess(true);
        setAwaitingLinkConfirm(false);
        sessionStorage.removeItem('bq:access-block-info');
      } else {
        setError(
          'Pagamento ainda não confirmado. Se você já pagou, aguarde alguns segundos e tente de novo.'
        );
      }
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível verificar o status.');
    } finally {
      setCheckingReturn(false);
    }
  };

  const copyPixCode = async () => {
    if (!pixPayment?.pixQrCode?.qrCode) return;
    await navigator.clipboard.writeText(pixPayment.pixQrCode.qrCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  const secureFieldStyle = useMemo(
    () => ({
      color: theme === 'dark' ? '#fafafa' : '#171717',
      placeholderColor: '#737373',
      fontSize: '14px'
    }),
    [theme]
  );

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
              onClick={() => navigate('/planos')}
              className="p-2 rounded-lg text-text-secondary hover:text-accent transition-colors"
              title="Voltar aos planos"
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
            <h1 className="text-2xl font-bold mb-2">Assinatura ativa!</h1>
            <p className="text-text-secondary text-sm mb-8">
              O plano <span className="font-bold text-text-primary">{plan.name}</span> foi ativado com
              sucesso. Bom trabalho!
            </p>
            <button
              onClick={() => navigate('/app/queue')}
              className="px-6 py-3 rounded-xl bg-accent text-accent-fg font-bold text-sm hover:bg-accent-hover transition-colors"
            >
              Ir para o painel
            </button>
          </div>
        )}

        {!loadingPlan && plan && !success && awaitingLinkConfirm && (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center">
            <Loader2 size={40} className="mx-auto text-accent mb-4 animate-spin" />
            <h1 className="text-xl font-bold mb-2">Confirmando pagamento…</h1>
            <p className="text-text-secondary text-sm mb-6">
              Se você concluiu o pagamento no link, a assinatura será liberada em instantes.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-xl text-warning text-sm">
                {error}
              </div>
            )}
            <button
              onClick={refreshAfterLinkReturn}
              disabled={checkingReturn}
              className="px-6 py-3 rounded-xl bg-accent text-accent-fg font-bold text-sm hover:bg-accent-hover transition-colors disabled:opacity-60 inline-flex items-center gap-2"
            >
              {checkingReturn ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Verificando…
                </>
              ) : (
                <>
                  <RefreshCcw size={16} /> Atualizar status
                </>
              )}
            </button>
          </div>
        )}

        {!loadingPlan && plan && !success && !awaitingLinkConfirm && (
          <>
            <div className="bg-surface border border-border rounded-2xl p-5 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Plano escolhido</p>
                <h1 className="text-lg font-bold">{plan.name}</h1>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-accent">{formatPrice(plan.price)}</span>
                <span className="text-xs text-text-muted block">/mês</span>
              </div>
            </div>

            {/* Abas: Link / PIX / Cartão */}
            <div className="flex bg-surface p-1 rounded-xl mb-6 border border-border gap-0.5">
              {(
                [
                  { id: 'payment_link', label: 'Link', icon: ExternalLink },
                  { id: 'pix', label: 'PIX', icon: QrCode },
                  { id: 'credit_card', label: 'Cartão', icon: CreditCard }
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setMethod(tab.id);
                    setError(null);
                  }}
                  disabled={!!pixPayment && !pixExpired}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    method === tab.id
                      ? 'bg-accent/15 text-accent'
                      : 'text-text-muted hover:text-text-secondary'
                  } disabled:opacity-50`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-xl flex items-start gap-2 text-danger text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            {/* Tela do QR Code PIX gerado */}
            {method === 'pix' && pixPayment?.pixQrCode && !pixExpired && (
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
            {method === 'pix' && pixExpired && (
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
                    submitPix();
                  }}
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-accent text-accent-fg font-bold text-sm hover:bg-accent-hover transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Gerando...' : 'Gerar novo PIX'}
                </button>
              </div>
            )}

            {/* Formulário (dados do pagador + cartão) */}
            {!(method === 'pix' && pixPayment && !pixExpired) && !pixExpired && (
              <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-sm uppercase tracking-wider text-text-secondary">
                  Dados do pagador
                </h2>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">E-mail *</label>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="seu@email.com"
                    value={payerEmail}
                    onChange={e => setPayerEmail(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-secondary block mb-1">Nome</label>
                    <input
                      className={inputClass}
                      placeholder="Nome"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-secondary block mb-1">Sobrenome</label>
                    <input
                      className={inputClass}
                      placeholder="Sobrenome"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-secondary block mb-1">Documento</label>
                    <select
                      className={inputClass}
                      value={docType}
                      onChange={e => {
                        setDocType(e.target.value as 'CPF' | 'CNPJ');
                        setDocNumber('');
                      }}
                    >
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-secondary block mb-1">
                      Número{' '}
                      {method === 'credit_card'
                        ? '*'
                        : method === 'payment_link'
                          ? '(recomendado)'
                          : '(opcional para PIX)'}
                    </label>
                    <input
                      className={inputClass}
                      placeholder={docType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                      value={docNumber}
                      onChange={e =>
                        setDocNumber(docType === 'CPF' ? maskCpf(e.target.value) : maskCnpj(e.target.value))
                      }
                    />
                  </div>
                </div>

                {method === 'payment_link' && (
                  <p className="text-xs text-text-muted">
                    Você será redirecionado para uma página segura (AbacatePay) para pagar com PIX ou
                    cartão. Ao concluir, volte aqui — a assinatura ativa automaticamente.
                  </p>
                )}

                {method === 'credit_card' && !mpReady && (
                  <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl text-warning text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    Pagamento com cartão indisponível: a variável VITE_MERCADOPAGO_PUBLIC_KEY não está
                    configurada. Use link de pagamento, PIX ou contate o suporte.
                  </div>
                )}

                {method === 'credit_card' && mpReady && (
                  <>
                    <h2 className="font-bold text-sm uppercase tracking-wider text-text-secondary pt-2">
                      Dados do cartão
                    </h2>
                    <p className="text-[11px] text-text-muted -mt-2">
                      Os dados do cartão são enviados diretamente ao Mercado Pago — nunca passam pelos
                      nossos servidores.
                    </p>

                    <div>
                      <label className="text-xs font-bold text-text-secondary block mb-1">
                        Número do cartão *
                      </label>
                      <div className={secureFieldContainerClass}>
                        <CardNumber
                          placeholder="0000 0000 0000 0000"
                          style={secureFieldStyle}
                          onBinChange={async ({ bin }) => {
                            if (!bin) {
                              setCardPaymentMethodId(null);
                              return;
                            }
                            try {
                              const methods = await getPaymentMethods({ bin });
                              setCardPaymentMethodId(methods?.results?.[0]?.id ?? null);
                            } catch {
                              setCardPaymentMethodId(null);
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-text-secondary block mb-1">Validade *</label>
                        <div className={secureFieldContainerClass}>
                          <ExpirationDate placeholder="MM/AA" mode="short" style={secureFieldStyle} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-secondary block mb-1">CVV *</label>
                        <div className={secureFieldContainerClass}>
                          <SecurityCode placeholder="123" style={secureFieldStyle} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-secondary block mb-1">
                        Nome impresso no cartão *
                      </label>
                      <input
                        className={inputClass}
                        placeholder="Como aparece no cartão"
                        value={cardholderName}
                        onChange={e => setCardholderName(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={
                    method === 'pix'
                      ? submitPix
                      : method === 'payment_link'
                        ? submitPaymentLink
                        : submitCard
                  }
                  disabled={submitting || (method === 'credit_card' && !mpReady)}
                  className="w-full py-4 rounded-xl bg-accent text-accent-fg font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processando...
                    </>
                  ) : method === 'pix' ? (
                    <>
                      <QrCode size={16} /> Gerar QR Code PIX
                    </>
                  ) : method === 'payment_link' ? (
                    <>
                      <ExternalLink size={16} /> Ir para o pagamento {formatPrice(plan.price)}
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
            <p className="text-text-muted mb-4">Plano não encontrado.</p>
            <button
              onClick={() => navigate('/planos')}
              className="px-5 py-2.5 rounded-xl bg-accent text-accent-fg font-bold text-sm hover:bg-accent-hover transition-colors"
            >
              Ver planos
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
