import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  LuCircleAlert as AlertCircle,
  LuArrowRight as ArrowRight,
  LuBadgeDollarSign as BadgeDollarSign,
  LuCircleHelp as HelpCircle,
  LuCircleCheck as CheckCircle2,
  LuClock as Clock,
  LuHeadphones as Headphones,
  LuHandshake as Handshake,
  LuLoaderCircle as Loader2,
  LuMail as Mail,
  LuMessageSquare as MessageSquare,
  LuPhone as Phone,
} from 'react-icons/lu';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { SeoHead } from '../../components/marketing/SeoHead';
import { contactApi, type ContactTopic } from '../../infra/contactApi';
import { maskPhone } from '../../utils/documentUtils';
import { getErrorMessage } from '../../utils/errorMessage';
import { trialCampaign } from '../../marketing/trialCampaign';

const CONTACT_EMAIL = 'contato@agendai.com.br';

const topics: { value: ContactTopic; label: string; hint: string; icon: typeof Headphones }[] = [
  { value: 'planos', label: 'Planos e preços', hint: 'Trial, Essencial, Pro, anual', icon: BadgeDollarSign },
  { value: 'suporte', label: 'Suporte', hint: 'Conta, fila, pagamentos', icon: Headphones },
  { value: 'parceria', label: 'Parceria', hint: 'Franquia, indicação, imprensa', icon: Handshake },
  { value: 'outro', label: 'Outro', hint: 'Qualquer outra dúvida', icon: HelpCircle },
];

const ContactSchema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  topic: z.enum(['planos', 'suporte', 'parceria', 'outro'], {
    required_error: 'Escolha um assunto',
  }),
  message: z.string().min(10, 'Escreva pelo menos 10 caracteres'),
});

type ContactFormData = z.infer<typeof ContactSchema>;

const fieldClass = (hasError: boolean) =>
  `w-full rounded-2xl border bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:ring-1 focus:ring-accent/40 ${
    hasError
      ? 'border-red-500/40 focus:border-red-500'
      : 'border-white/10 hover:border-white/20 focus:border-accent/50'
  }`;

export const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactSchema),
    defaultValues: { topic: 'planos', phone: '' },
  });

  const topic = watch('topic');
  const phoneValue = watch('phone') ?? '';

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    setServerError(null);
    setStatus('idle');
    try {
      const phoneDigits = (data.phone ?? '').replace(/\D/g, '');
      await contactApi.submit({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: phoneDigits.length >= 8 ? phoneDigits : undefined,
        topic: data.topic,
        message: data.message.trim(),
      });
      setStatus('success');
      reset({ topic: data.topic, name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setServerError(getErrorMessage(err, 'Não foi possível enviar. Tente de novo em instantes.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-sans text-neutral-100 selection:bg-accent/30">
      <SeoHead
        title="Contato — Fale com a equipe AgendAI | AgendAI"
        description="Planos, suporte ou parceria — envie sua mensagem e receba retorno em 1 dia útil. Sem mailto, sem caixa de spam perdida."
        path="/contato"
      />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-[15%] top-[-12%] h-[50%] w-[50%] rounded-full bg-accent/25 blur-[140px]" />
        <div className="absolute -right-[10%] bottom-[-10%] h-[45%] w-[45%] rounded-full bg-teal-900/15 blur-[120px]" />
      </div>

      <MarketingNav />

      <section className="relative z-10 px-6 pb-12 pt-36 md:px-10 md:pt-44 xl:px-12">
        <div className="mx-auto grid max-w-375 gap-10 lg:grid-cols-[1fr_22rem] lg:items-end lg:gap-16">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold uppercase tracking-[0.28em] text-accent/90"
            >
              Contato
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-4 text-5xl font-black tracking-[-0.05em] text-white md:text-7xl"
            >
              Fala com a gente.
              <br />
              <span className="text-accent">Resposta em 1 dia útil.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-neutral-400"
            >
              Planos, suporte ou parceria — a mensagem cai no painel da equipe AgendAI. Sem mailto,
              sem caixa de spam perdida.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_-40px_rgba(16,185,129,0.45)] backdrop-blur-sm sm:p-6"
          >
            <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent-light">
                <Headphones size={24} className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-accent-light">
                <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_currentColor]" /> Online
              </span>
            </div>
            <p className="relative mt-5 text-lg font-bold text-white">Estamos por aqui.</p>
            <p className="relative mt-2 text-sm leading-relaxed text-neutral-400">
              Explique o que aconteceu e a equipe assume a conversa com todo o contexto.
            </p>
            <div className="relative mt-5 flex items-center gap-3 border-t border-white/10 pt-4 text-xs font-semibold text-neutral-300">
              <Clock size={24} className="h-4 w-4 text-accent" />
              Retorno em até 1 dia útil
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-28 md:px-10 xl:px-12">
        <div className="mx-auto grid max-w-375 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Side rail */}
          <div className="space-y-4 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-4xl border border-white/10 bg-surface p-6 transition hover:border-accent/25"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl transition group-hover:bg-accent/20" />
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">
                Canal direto
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 inline-flex items-center gap-2 text-lg font-bold text-white transition hover:text-accent-light"
              >
                <Mail size={24} className="h-5 w-5 text-accent" />
                {CONTACT_EMAIL}
              </a>
              <p className="mt-3 text-sm font-medium text-neutral-500">
                Prefere e-mail clássico? Também funciona.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="rounded-4xl border border-white/10 bg-surface p-6"
            >
              <div className="flex items-center gap-2 text-accent-light">
                <Clock size={24} className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wider">Horário</span>
              </div>
              <p className="mt-3 text-base font-semibold text-white">
                Seg–sex · 9h às 18h (Brasília)
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Mensagens fora do horário entram na fila e respondemos no próximo dia útil.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="relative overflow-hidden rounded-4xl border border-accent/25 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent p-6"
            >
              <p className="text-sm font-bold text-accent-light">{trialCampaign.eyebrow}?</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-300">
                {trialCampaign.body} {trialCampaign.afterTrial}
              </p>
              <button
                type="button"
                onClick={() => navigate('/planos')}
                className="group mt-4 inline-flex items-center gap-2 text-sm font-black text-white transition hover:text-accent-light"
              >
                Ver planos
                <ArrowRight size={24} className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-4xl border border-white/10 bg-[#0a100c] p-7 md:p-10 lg:col-span-8"
          >
            <div className="mb-8 flex items-start justify-between gap-5 border-b border-white/10 pb-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Abra uma conversa</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Como podemos ajudar?</h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-500">Escolha um assunto e conte os detalhes. Isso ajuda a gente a responder mais rápido.</p>
              </div>
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-neutral-400 sm:flex">
                <MessageSquare size={24} className="h-5 w-5" />
              </div>
            </div>
            {status === 'success' && (
              <div className="mb-8 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm font-medium text-accent-light">
                <CheckCircle2 size={24} className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold text-accent-light">Mensagem recebida.</p>
                  <p className="mt-1 text-accent-light/80">
                    Nossa equipe já foi notificada. Retorno em até 1 dia útil.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && serverError && (
              <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300">
                <AlertCircle size={24} className="mt-0.5 h-5 w-5 shrink-0" />
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">
                  Assunto
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {topics.map(item => {
                    const active = topic === item.value;
                    const TopicIcon = item.icon;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setValue('topic', item.value, { shouldValidate: true })}
                        className={`group rounded-2xl border px-3 py-3.5 text-left transition ${
                          active
                            ? 'border-accent/40 bg-accent/12 text-white'
                            : 'border-white/8 bg-black/30 text-neutral-400 hover:border-white/15 hover:text-neutral-200'
                        }`}
                      >
                        <span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl transition ${active ? 'bg-accent/15 text-accent-light' : 'bg-white/[0.05] text-neutral-500 group-hover:text-neutral-300'}`}>
                          <TopicIcon className="h-4 w-4" />
                        </span>
                        <span className="block text-sm font-bold">{item.label}</span>
                        <span className="mt-0.5 block text-[10px] font-medium opacity-70">
                          {item.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.topic && (
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-red-400">
                    <AlertCircle size={10} />
                    {errors.topic.message}
                  </p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500"
                  >
                    Nome
                  </label>
                  <input
                    id="contact-name"
                    className={fieldClass(!!errors.name)}
                    placeholder="Como te chamamos"
                    autoComplete="name"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400">
                      <AlertCircle size={10} />
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500"
                  >
                    E-mail
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className={fieldClass(!!errors.email)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400">
                      <AlertCircle size={10} />
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500"
                >
                  WhatsApp{' '}
                  <span className="normal-case tracking-normal text-neutral-600">(opcional)</span>
                </label>
                <div className="relative">
                  <Phone size={24} className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    id="contact-phone"
                    className={`${fieldClass(!!errors.phone)} pl-11`}
                    placeholder="(11) 99999-9999"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phoneValue}
                    onChange={e =>
                      setValue('phone', maskPhone(e.target.value), {
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500"
                >
                  Mensagem
                </label>
                <div className="relative">
                  <MessageSquare size={24} className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-neutral-500" />
                  <textarea
                    id="contact-message"
                    rows={6}
                    className={`${fieldClass(!!errors.message)} resize-none pl-11`}
                    placeholder="Conte o contexto: salão, plano, o que travou…"
                    {...register('message')}
                  />
                </div>
                {errors.message && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-400">
                    <AlertCircle size={10} />
                    {errors.message.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-neutral-500">
                  Seus dados só são usados para responder este contato.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-4 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={24} className="h-4 w-4 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      Enviar mensagem
                      <ArrowRight size={24} className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};

export default ContactPage;
