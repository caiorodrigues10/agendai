import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  LuUsers as Users,
  LuTrendingUp as TrendingUp,
  LuCalendarCheck as CalendarCheck,
  LuShieldCheck as ShieldCheck,
  LuWallet as Wallet,
} from 'react-icons/lu';
import { Logo } from '../../components/ui/Logo';

/**
 * Painel de marca do `/login` e `/cadastro` (desktop, ≥ lg).
 *
 * Sticky em `h-screen`: enquanto o formulário da direita rola, o painel
 * permanece completo e centralizado. Os números são mockados de propósito —
 * marketing estático, sem chamada de API.
 */

const QUEUE_MOCK = [
  { name: 'Mariana C.', service: 'Coloração', status: 'Na cadeira' },
  { name: 'Rafael S.', service: 'Corte + Barba', status: '~12 min' },
  { name: 'Júlia A.', service: 'Escova', status: '~25 min' },
] as const;

const AGENDA_MOCK = [
  { time: '09:00', name: 'Mariana', service: 'Coloração', status: 'confirmed' },
  { time: '10:30', name: 'Rafael', service: 'Corte + Barba', status: 'confirmed' },
  { time: '11:15', name: 'Júlia', service: 'Escova', status: 'pending' },
  { time: '13:40', name: 'Pedro', service: 'Barboterapia', status: 'confirmed' },
] as const;

/** Faturamento mockado + sparkline (alturas em % da barra). */
const REVENUE_MOCK = { total: 'R$ 1.840', bars: [38, 55, 42, 68, 58, 86, 74] } as const;

/**
 * Prova social — texto genérico de propósito; ajuste aqui se quiser trocar a
 * frase, sem tocar no restante do componente.
 */
const SOCIAL_PROOF = { text: '+2.000 salões já usam o Agenda Já' } as const;

const HIGHLIGHTS = [
  { icon: CalendarCheck, label: 'Agenda inteligente' },
  { icon: Users, label: 'Fila em tempo real' },
  { icon: ShieldCheck, label: 'Dados protegidos' },
] as const;

function BackgroundDecor({ reduceMotion }: { reduceMotion: boolean | null }) {
  const drift = (duration: number, x: number[], y: number[]) =>
    reduceMotion
      ? {}
      : { animate: { x, y }, transition: { duration, repeat: Infinity, ease: 'easeInOut' as const } };

  return (
    <>
      <motion.div
        aria-hidden
        className="absolute -top-28 -left-28 w-[520px] h-[520px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'rgba(16,185,129,0.18)' }}
        {...drift(22, [0, 60, -25, 0], [0, -35, 40, 0])}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-40 -right-24 w-[480px] h-[480px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'color-mix(in srgb, var(--ag-tertiary) 15%, transparent)' }}
        {...drift(26, [0, -50, 35, 0], [0, 40, -25, 0])}
      />
      {/* Vinheta + noise leve para dar corpo ao fundo escuro. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 35%, color-mix(in srgb, var(--ag-bg) 55%, transparent) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.09] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
    </>
  );
}

function CardShell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/6 backdrop-blur-xl p-4 shadow-2xl shadow-black/40 ${className}`}
    >
      {children}
    </div>
  );
}

function QueueCard() {
  return (
    <CardShell>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          Fila ao vivo
        </span>
        <Users size={13} className="text-neutral-500" aria-hidden />
      </div>
      <div className="space-y-2.5">
        {QUEUE_MOCK.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-[10px] font-bold text-tertiary">
              {item.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-100 truncate">{item.name}</p>
              <p className="text-[10px] text-neutral-500 truncate">{item.service}</p>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                i === 0 ? 'bg-accent/15 text-accent' : 'bg-white/5 text-text-muted'
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function AgendaCard() {
  return (
    <CardShell className="ml-6 xl:ml-10 -mt-2 relative z-10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
          Agenda de hoje
        </span>
        <CalendarCheck size={13} className="text-neutral-500" aria-hidden />
      </div>
      <div className="space-y-2">
        {AGENDA_MOCK.map((slot) => (
          <div key={slot.time} className="flex items-center gap-3">
            <span className="text-[11px] font-black text-accent tabular-nums w-10 shrink-0">
              {slot.time}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-100 truncate">
                {slot.name} <span className="text-neutral-500 font-medium">— {slot.service}</span>
              </p>
            </div>
            <span
              aria-hidden
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                slot.status === 'confirmed' ? 'bg-accent' : 'bg-amber-400/80'
              }`}
            />
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function RevenueCard() {
  return (
    // Em telas baixas (≤820px de altura) a pilha de cards invade o rodapé:
    // o card de faturamento é o primeiro a sair, depois o de agenda.
    <CardShell className="hidden xl:block [@media(max-height:820px)]:hidden ml-3 -mt-2 relative z-20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
          Faturamento do dia
        </span>
        <Wallet size={13} className="text-neutral-500" aria-hidden />
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-black text-white tabular-nums leading-none">
            {REVENUE_MOCK.total}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1.5 flex items-center gap-1">
            <TrendingUp size={11} className="text-accent" aria-hidden /> hoje, até agora
          </p>
        </div>
        {/* Sparkline em SVG, sem lib: barras proporcionais à lista mockada. */}
        <svg
          aria-hidden
          viewBox="0 0 96 36"
          className="w-24 h-9 shrink-0"
          preserveAspectRatio="none"
        >
          {REVENUE_MOCK.bars.map((h, i) => (
            <rect
              key={i}
              x={i * 14}
              y={36 - (h / 100) * 36}
              width="8"
              height={(h / 100) * 36}
              rx="2"
              fill="var(--ag-accent)"
              opacity={i === REVENUE_MOCK.bars.length - 1 ? 1 : 0.45}
            />
          ))}
        </svg>
      </div>
    </CardShell>
  );
}

function GrowthBadge() {
  // Flutua acima do card: -top-11 (44px) >= altura do badge (46px - 2px de
  // folga) tira a badge da área de conteúdo — não cobre nem o ícone de
  // usuários nem o rótulo do cabeçalho; -right-3 mantém o canto alinhado.
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.9, type: 'spring', bounce: 0.4 }}
      className="absolute -top-11 -right-3 z-10"
    >
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 backdrop-blur-xl px-3 py-2 shadow-xl shadow-black/40">
        <div className="w-6 h-6 rounded-lg bg-accent/15 flex items-center justify-center">
          <TrendingUp size={12} className="text-accent" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-black text-white leading-none">+32%</p>
          <p className="text-[9px] text-neutral-400 mt-0.5">agendamentos</p>
        </div>
      </div>
    </motion.div>
  );
}

const AVATAR_TONES = ['bg-accent/30 text-accent', 'bg-tertiary/30 text-tertiary', 'bg-sky-400/25 text-sky-300', 'bg-amber-400/25 text-amber-300'] as const;

function SocialProof() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2" aria-hidden>
        {AVATAR_TONES.map((tone, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full border border-bg text-[9px] font-black flex items-center justify-center ${tone}`}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-text-muted font-medium">{SOCIAL_PROOF.text}</p>
    </div>
  );
}

function Highlights() {
  return (
    <div className="flex items-center gap-x-5 gap-y-2 text-text-muted text-[11px] font-medium">
      {HIGHLIGHTS.map(({ icon: Icon, label }) => (
        <span key={label} className="flex items-center gap-1.5 whitespace-nowrap">
          <Icon size={12} className="text-tertiary" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

export const BrandPanel: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="relative hidden lg:flex flex-col overflow-hidden bg-bg text-white lg:sticky lg:top-0 lg:h-screen self-start"
    >
      <BackgroundDecor reduceMotion={reduceMotion} />
      {/* Divisor sutil entre o painel e o formulário. */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-px pointer-events-none bg-gradient-to-b from-transparent via-border to-transparent"
      />

      <div className="relative z-10 flex flex-col h-full p-8 xl:p-12 justify-between">
        <Logo size="md" className="text-white" />

        <section className="flex-1 flex flex-col justify-center gap-6 py-6 min-h-0">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 className="font-sans text-3xl xl:text-4xl font-extrabold leading-[1.08] tracking-tight">
              Seu salão,{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-accent/80 via-accent to-accent">
                no controle.
              </span>
            </h1>
            <p className="mt-3 text-text-secondary text-sm max-w-md leading-relaxed font-light">
              Fila digital, agenda, financeiro e clientes — tudo em um painel que trabalha por
              você, em tempo real.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="relative max-w-sm"
          >
            <QueueCard />
            <AgendaCard />
            <RevenueCard />
            <GrowthBadge />
          </motion.div>
        </section>

        <footer className="space-y-4">
          <SocialProof />
          <div className="h-px bg-gradient-to-r from-border via-border/40 to-transparent" aria-hidden />
          <Highlights />
        </footer>
      </div>
    </div>
  );
};
