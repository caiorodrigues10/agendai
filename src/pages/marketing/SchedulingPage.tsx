import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, CalendarCheck, CheckCircle2, Repeat, UserCheck } from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { trialCampaign } from '../../marketing/trialCampaign';

const daySlots = [
  { time: '08:00', status: 'free' as const },
  { time: '09:00', status: 'busy' as const, client: 'Ana · Corte', pro: 'Marina' },
  { time: '10:00', status: 'free' as const },
  { time: '11:00', status: 'busy' as const, client: 'Rafa · Barba', pro: 'Leo' },
  { time: '13:00', status: 'selected' as const },
  { time: '14:00', status: 'free' as const },
  { time: '15:00', status: 'busy' as const, client: 'Clara · Escova', pro: 'Marina' },
  { time: '16:00', status: 'free' as const },
];

const pros = [
  { name: 'Marina', role: 'Cabelo', color: 'bg-emerald-400' },
  { name: 'Leo', role: 'Barba', color: 'bg-cyan-400' },
  { name: 'Sofia', role: 'Unhas', color: 'bg-amber-300' },
];

const flowSteps = [
  {
    step: '01',
    title: 'Cliente abre o link',
    description: 'Escolhe serviço e profissional no celular — sem app e sem ficar no WhatsApp.',
    accent: 'emerald' as const,
    hint: 'Link público',
    chips: ['Corte', 'Leo', '14:00'],
  },
  {
    step: '02',
    title: 'Só vê horário livre',
    description: 'A disponibilidade respeita expediente, duração do serviço e agenda de cada um.',
    accent: 'cyan' as const,
    hint: 'Sem conflito',
    chips: ['Livre', 'Ocupado', 'Livre'],
  },
  {
    step: '03',
    title: 'No dia, entra na fila',
    description:
      'Check-in vira posição na fila. Você não digita o nome de novo nem perde o horário.',
    accent: 'amber' as const,
    hint: 'Check-in',
    chips: ['Agendado', '→', '2ª na fila'],
  },
];

export const SchedulingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-sans text-neutral-100 selection:bg-emerald-500/30">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-[15%] top-[-12%] h-[55%] w-[55%] rounded-full bg-emerald-900/25 blur-[140px]" />
        <div className="absolute -right-[10%] top-[20%] h-[45%] w-[45%] rounded-full bg-teal-900/15 blur-[130px]" />
        <div className="absolute bottom-[-15%] left-[20%] h-[40%] w-[50%] rounded-full bg-emerald-950/40 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at top, black, transparent 70%)',
          }}
        />
      </div>

      <MarketingNav />

      {/* Hero */}
      <section className="relative z-10 overflow-hidden px-6 pb-20 pt-36 md:px-10 md:pb-28 md:pt-44 xl:px-12">
        <div className="mx-auto grid max-w-375 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-emerald-400/25 bg-emerald-400/8 px-5 py-2.5 text-sm font-black uppercase tracking-[0.16em] text-emerald-300 md:text-base"
            >
              <CalendarCheck className="h-4 w-4 md:h-5 md:w-5" />
              Agendamento
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-7 text-5xl font-black leading-[1.06] tracking-[-0.05em] text-white md:text-7xl xl:text-8xl"
            >
              O telefone para.
              <span className="mt-2 block text-emerald-300">A agenda continua enchendo.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-7 max-w-xl text-xl font-medium leading-relaxed text-neutral-300 md:text-2xl"
            >
              Cliente marca serviço, profissional e horário pelo link do salão. Você vê tudo num
              calendário só — e no dia o atendimento cai direto na fila.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-base font-black text-black transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                {trialCampaign.cta}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/queue')}
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/3 px-8 py-4 text-base font-bold text-white transition hover:bg-white/8"
              >
                Ver experiência pública
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-base font-semibold text-neutral-300 md:text-lg"
            >
              <span className="inline-flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Sem instalar app
              </span>
              <span className="inline-flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Por profissional
              </span>
              <span className="inline-flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Sync com a fila
              </span>
            </motion.div>
          </div>

          {/* Day board mock */}
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[3rem] bg-emerald-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#0c1210]/90 shadow-[0_40px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/8 px-6 py-5 md:px-7">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-400">
                    Quinta · 09 jul
                  </p>
                  <p className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">
                    Dia da equipe
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-2.5 text-right">
                  <p className="text-2xl font-black text-emerald-300">6</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-300/70">
                    livres
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 overflow-x-auto border-b border-white/8 px-5 py-4 md:px-6">
                {pros.map((pro, i) => (
                  <div
                    key={pro.name}
                    className={`flex min-w-max items-center gap-2.5 rounded-full border px-4 py-2.5 ${
                      i === 0
                        ? 'border-emerald-400/35 bg-emerald-400/12'
                        : 'border-white/8 bg-white/3'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${pro.color}`} />
                    <div>
                      <p className="text-base font-bold text-white">{pro.name}</p>
                      <p className="text-xs uppercase tracking-wider text-neutral-500">
                        {pro.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 p-5 md:p-6">
                {daySlots.map((slot, i) => (
                  <motion.div
                    key={slot.time}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.04 }}
                    className={`flex items-center gap-4 rounded-2xl border px-4 py-4 ${
                      slot.status === 'selected'
                        ? 'border-emerald-400/40 bg-emerald-400/12 shadow-[0_0_30px_rgba(52,211,153,0.12)]'
                        : slot.status === 'busy'
                          ? 'border-white/6 bg-white/3'
                          : 'border-white/8 bg-black/25'
                    }`}
                  >
                    <p
                      className={`w-16 shrink-0 text-base font-black tabular-nums ${
                        slot.status === 'busy' ? 'text-neutral-500' : 'text-white'
                      }`}
                    >
                      {slot.time}
                    </p>
                    {slot.status === 'busy' ? (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-bold text-neutral-300">
                            {slot.client}
                          </p>
                          <p className="text-sm text-neutral-500">{slot.pro}</p>
                        </div>
                        <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-black uppercase tracking-wider text-neutral-500">
                          Ocupado
                        </span>
                      </>
                    ) : slot.status === 'selected' ? (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold text-emerald-200">Horário escolhido</p>
                          <p className="text-sm text-emerald-300/70">Corte + escova · Marina</p>
                        </div>
                        <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black uppercase tracking-wider text-black">
                          Livre
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-semibold text-neutral-400">Disponível</p>
                        </div>
                        <span className="rounded-full border border-emerald-400/25 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-400">
                          Abrir
                        </span>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 border-y border-white/8 bg-white/1.5 px-6 py-20 md:px-10 md:py-28 xl:px-12">
        <div className="mx-auto max-w-375">
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">
                Como funciona
              </p>
              <h2 className="mt-4 text-5xl font-black tracking-[-0.04em] text-white md:text-6xl xl:text-7xl">
                Três passos. Zero caderno.
              </h2>
            </div>
            <p className="max-w-sm text-base font-medium leading-relaxed text-neutral-400 md:text-lg">
              Do link do cliente até a cadeira — sem WhatsApp de grupo e sem planilha.
            </p>
          </div>

          <div className="relative grid gap-4 md:grid-cols-3 md:gap-0">
            {flowSteps.map((item, i) => {
              const border =
                item.accent === 'emerald'
                  ? 'border-emerald-400/20 hover:border-emerald-400/40'
                  : item.accent === 'cyan'
                    ? 'border-cyan-400/20 hover:border-cyan-400/40'
                    : 'border-amber-300/20 hover:border-amber-300/40';
              const number =
                item.accent === 'emerald'
                  ? 'text-emerald-400'
                  : item.accent === 'cyan'
                    ? 'text-cyan-300'
                    : 'text-amber-200';
              const glow =
                item.accent === 'emerald'
                  ? 'bg-emerald-400/12'
                  : item.accent === 'cyan'
                    ? 'bg-cyan-400/12'
                    : 'bg-amber-300/12';
              const pill =
                item.accent === 'emerald'
                  ? 'bg-emerald-400/15 text-emerald-300'
                  : item.accent === 'cyan'
                    ? 'bg-cyan-400/15 text-cyan-300'
                    : 'bg-amber-300/15 text-amber-200';
              const chipTone = (idx: number) => {
                if (item.accent === 'cyan') {
                  return idx === 1
                    ? 'bg-white/4 text-neutral-600 line-through'
                    : 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/20';
                }
                if (item.accent === 'amber') {
                  return idx === 1
                    ? 'bg-transparent text-amber-200/70'
                    : idx === 2
                      ? 'bg-amber-300 text-black'
                      : 'bg-white/6 text-neutral-300';
                }
                return idx === 2
                  ? 'bg-emerald-400 text-black'
                  : 'bg-emerald-400/12 text-emerald-200 ring-1 ring-emerald-400/20';
              };

              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative flex flex-col overflow-hidden rounded-[2rem] border bg-[#0a0f0c] p-7 transition-colors md:rounded-none md:border-y md:border-l-0 md:border-r md:border-white/8 md:bg-transparent md:p-8 md:first:rounded-l-[2rem] md:first:border-l md:last:rounded-r-[2rem] md:last:border-r ${border} md:hover:bg-white/2`}
                >
                  <div
                    className={`absolute -right-10 -top-10 h-36 w-36 rounded-full ${glow} blur-[60px]`}
                  />

                  <div className="relative z-10 flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-sm font-black ${number}`}
                    >
                      {item.step}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${pill}`}
                    >
                      {item.hint}
                    </span>
                  </div>

                  <h3 className="relative z-10 mt-7 text-2xl font-black tracking-tight text-white md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="relative z-10 mt-3 flex-1 text-base font-medium leading-relaxed text-neutral-400 md:text-lg">
                    {item.description}
                  </p>

                  <div className="relative z-10 mt-8 flex flex-wrap items-center gap-2 border-t border-white/8 pt-5">
                    {item.chips.map((chip, idx) => (
                      <span
                        key={`${item.step}-${chip}`}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${chipTone(idx)}`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature bento */}
      <section className="relative z-10 px-6 py-24 md:px-10 md:py-32 xl:px-12">
        <div className="mx-auto max-w-375">
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-base font-black uppercase tracking-[0.18em] text-emerald-400">
                Na prática
              </p>
              <h2 className="mt-4 text-5xl font-black tracking-[-0.04em] text-white md:text-6xl xl:text-7xl">
                Menos mensagem. Mais horário confirmado.
              </h2>
            </div>
            <p className="max-w-md text-lg font-medium leading-relaxed text-neutral-300 md:text-xl">
              O agendamento não é um calendário isolado — ele conversa com a fila, com a equipe e
              com o lembrete do cliente.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            {/* 1 — Day board / slots (editorial + timeline) */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative min-h-100 overflow-hidden rounded-[2.25rem] border border-emerald-400/15 bg-[#07110b] lg:col-span-7"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/50 to-transparent" />
              <div className="absolute -right-16 -top-20 h-80 w-80 rounded-full bg-emerald-400/12 blur-[100px]" />

              <div className="relative z-10 flex h-full flex-col p-8 lg:p-10">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/8 pb-6">
                  <div className="max-w-md">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">
                      Disponibilidade real
                    </p>
                    <h3 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
                      O horário some quando alguém marca.
                    </h3>
                  </div>
                  <p className="max-w-xs text-sm font-medium leading-relaxed text-neutral-400 md:text-base">
                    Expediente + duração + agenda de cada profissional. Sem double booking.
                  </p>
                </div>

                <div className="mt-8 flex-1 space-y-4">
                  {[
                    {
                      pro: 'Marina',
                      slots: [
                        { t: '09:00', s: 'busy' },
                        { t: '10:00', s: 'free' },
                        { t: '11:00', s: 'free' },
                        { t: '14:00', s: 'selected' },
                        { t: '15:00', s: 'busy' },
                      ],
                    },
                    {
                      pro: 'Leo',
                      slots: [
                        { t: '09:00', s: 'free' },
                        { t: '10:00', s: 'busy' },
                        { t: '11:00', s: 'busy' },
                        { t: '14:00', s: 'free' },
                        { t: '15:00', s: 'free' },
                      ],
                    },
                  ].map(row => (
                    <div key={row.pro} className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-xs font-bold text-neutral-500">
                        {row.pro}
                      </span>
                      <div className="grid min-w-0 flex-1 grid-cols-5 gap-1.5">
                        {row.slots.map(slot => (
                          <div
                            key={`${row.pro}-${slot.t}`}
                            className={`rounded-lg py-2.5 text-center text-[11px] font-black ${
                              slot.s === 'selected'
                                ? 'bg-emerald-400 text-black shadow-[0_0_24px_rgba(52,211,153,0.35)]'
                                : slot.s === 'busy'
                                  ? 'bg-white/4 text-neutral-600 line-through'
                                  : 'bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/20'
                            }`}
                          >
                            {slot.t}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.article>

            {/* 2 — Phone booking flow */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="group relative overflow-hidden rounded-[2.25rem] border border-cyan-400/20 bg-linear-to-b from-[#0a1520] to-[#070b0e] p-8 lg:col-span-5 lg:p-9"
            >
              <div className="absolute bottom-0 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[70px]" />

              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/90">
                  No celular do cliente
                </p>
                <h3 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
                  Link do salão. Pronto.
                </h3>
                <p className="mt-3 text-base font-medium leading-relaxed text-neutral-400">
                  Sem instalar nada e sem “tem vaga amanhã?”.
                </p>
              </div>

              <div className="relative z-10 mx-auto mt-8 max-w-[220px]">
                <div className="rounded-[1.75rem] border border-cyan-400/25 bg-black/50 p-3 shadow-[0_20px_60px_rgba(34,211,238,0.12)]">
                  <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/15" />
                  <div className="space-y-2">
                    {[
                      { n: '01', label: 'Corte masculino', done: true },
                      { n: '02', label: 'Leo', done: true },
                      { n: '03', label: 'Quinta · 14:00', done: false },
                    ].map(step => (
                      <div
                        key={step.n}
                        className={`rounded-xl px-3 py-2.5 ${
                          step.done
                            ? 'bg-cyan-400/15 ring-1 ring-cyan-400/25'
                            : 'bg-cyan-400 text-black'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-black ${
                              step.done ? 'text-cyan-300/70' : 'text-black/50'
                            }`}
                          >
                            {step.n}
                          </span>
                          {step.done ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" />
                          ) : (
                            <span className="text-[10px] font-black uppercase">agora</span>
                          )}
                        </div>
                        <p
                          className={`mt-1 text-sm font-bold ${
                            step.done ? 'text-white' : 'text-black'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>

            {/* 3 — WhatsApp thread */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.04 }}
              className="group relative overflow-hidden rounded-[2.25rem] border border-amber-300/20 bg-[#14100a] p-8 lg:col-span-5 lg:p-9"
            >
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, #fbbf24 1px, transparent 0)',
                  backgroundSize: '18px 18px',
                }}
              />
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200/90">
                  Lembretes
                </p>
                <h3 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
                  Menos “esqueci”.
                </h3>
                <p className="mt-3 text-base font-medium leading-relaxed text-neutral-400">
                  Aviso antes do horário. A cadeira fica ocupada por quem realmente vem.
                </p>

                <div className="mt-8 space-y-3">
                  <div className="ml-0 mr-8 rounded-2xl rounded-tl-md border border-amber-200/20 bg-amber-200/10 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-200/70">
                      Salão · ontem 20:12
                    </p>
                    <p className="mt-1.5 text-sm font-semibold leading-relaxed text-white">
                      Oi Ana — horário com a Marina amanhã às 09:00. Confirma?
                    </p>
                  </div>
                  <div className="ml-8 mr-0 rounded-2xl rounded-tr-md border border-white/10 bg-white/8 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                      Ana · ontem 20:14
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-white">Confirmado ✅</p>
                  </div>
                  <div className="ml-0 mr-8 rounded-2xl rounded-tl-md border border-amber-200/15 bg-black/30 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-200/60">
                      Salão · hoje 08:00
                    </p>
                    <p className="mt-1.5 text-sm font-semibold leading-relaxed text-neutral-200">
                      Te esperamos em 1h. Até já!
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* 4 — Pipeline transform */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
              className="group relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#0d110e] lg:col-span-7"
            >
              <div className="grid h-full lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative z-10 p-8 lg:p-9">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">
                    Check-in na fila
                  </p>
                  <h3 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl xl:text-5xl">
                    Chegou? Entra na fila com um toque.
                  </h3>
                  <p className="mt-4 text-base font-medium leading-relaxed text-neutral-400 md:text-lg">
                    Agendamento do dia vira posição na fila — sem cadastro duplicado e sem a
                    recepção digitar tudo de novo.
                  </p>
                </div>

                <div className="relative flex flex-col justify-center gap-0 border-t border-white/8 bg-black/40 p-8 lg:border-l lg:border-t-0 lg:p-9">
                  <div className="rounded-2xl border border-white/10 bg-white/4 px-5 py-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                      Agendado
                    </p>
                    <p className="mt-1 text-lg font-bold text-white">Rafa · 11:00</p>
                    <p className="text-xs text-neutral-500">Barba · Leo</p>
                  </div>

                  <div className="flex items-center gap-3 py-3 pl-2">
                    <div className="h-10 w-px bg-linear-to-b from-white/20 via-emerald-400/60 to-emerald-400" />
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                      <Repeat className="h-3 w-3" />
                      Check-in
                    </span>
                  </div>

                  <div className="rounded-2xl border border-emerald-400/35 bg-emerald-400 px-5 py-4 text-black shadow-[0_16px_40px_rgba(52,211,153,0.25)]">
                    <p className="text-[10px] font-black uppercase tracking-wider text-black/60">
                      Na fila · 2ª posição
                    </p>
                    <p className="mt-1 text-lg font-black">Rafa · Barba</p>
                    <p className="text-xs font-semibold text-black/70">~18 min</p>
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-y border-white/8 bg-white/2 px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-375 gap-10 md:grid-cols-3 md:gap-6">
          {[
            { icon: UserCheck, value: 'Menos falta', label: 'Lembrete antes do horário' },
            { icon: Calendar, value: '24 horas', label: 'Marcação sem atender telefone' },
            { icon: CheckCircle2, value: '1 sistema', label: 'Agenda + fila no mesmo fluxo' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center text-center md:border-r md:border-white/8 md:last:border-r-0"
            >
              <stat.icon className="mb-4 h-8 w-8 text-emerald-400" />
              <p className="text-4xl font-black tracking-tight text-white md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-3 max-w-64 text-base font-semibold text-neutral-300 md:text-lg">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24 md:px-10 md:py-32 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-emerald-400/15 bg-[#07110b] px-8 py-16 text-center md:px-16 md:py-24"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(52,211,153,0.22),transparent_65%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(circle at center, black, transparent 72%)',
            }}
          />

          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-black shadow-[0_16px_45px_rgba(52,211,153,0.24)]">
              <CalendarCheck className="h-7 w-7" />
            </div>

            <p className="mt-8 text-base font-black uppercase tracking-[0.18em] text-emerald-300">
              Agenda digital
            </p>
            <h2 className="mt-5 text-5xl font-black leading-[1.08] tracking-[-0.045em] text-white md:text-6xl xl:text-7xl">
              Cliente marca sozinho. Você para de apagar no caderno.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl font-medium leading-relaxed text-neutral-200 md:text-2xl">
              Horários livres por profissional, lembretes antes do atendimento e check-in direto na
              fila do dia — no mesmo sistema. {trialCampaign.eyebrow}, sem cartão. Experimente e
              veja se faz sentido para o seu modelo de negócio.
            </p>

            <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-base font-semibold text-emerald-100/90 md:text-lg">
              <span className="inline-flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Marcação 24h
              </span>
              <span className="inline-flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Menos faltas
              </span>
              <span className="inline-flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Sync com a fila
              </span>
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-base font-black text-black transition duration-300 hover:-translate-y-1 hover:bg-emerald-300"
              >
                {trialCampaign.cta}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/queue')}
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/4 px-8 py-4 text-base font-bold text-white transition hover:bg-white/8"
              >
                Ver fila ao vivo
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <MarketingFooter />
    </div>
  );
};
