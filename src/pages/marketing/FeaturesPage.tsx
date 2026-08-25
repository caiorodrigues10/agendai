import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Clock,
  Calendar,
  BarChart3,
  Users,
  Bell,
  ShieldCheck,
  Smartphone,
  Wallet,
  ArrowRight,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Eye,
  UserCog,
  CreditCard,
  Receipt,
  Store,
  Play,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { trialCampaign } from '../../marketing/trialCampaign';

gsap.registerPlugin(ScrollTrigger);

const PainSolution = ({
  pain,
  solution,
  delay,
}: {
  pain: string;
  solution: string;
  delay: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        delay,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, [delay]);
  return (
    <div ref={ref} className="flex items-center gap-4 py-3 opacity-0">
      <div className="flex items-center gap-2 flex-1">
        <X className="w-4 h-4 text-red-400 shrink-0" />
        <span className="text-neutral-500 text-sm line-through">{pain}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
      <div className="flex items-center gap-2 flex-1">
        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-white text-sm font-medium">{solution}</span>
      </div>
    </div>
  );
};

const PhoneMockup = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto w-[280px] h-[560px] rounded-[3rem] border-[3px] border-neutral-700 bg-neutral-950 shadow-[0_0_80px_rgba(16,185,129,0.2)] overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-950 rounded-b-2xl z-20" />
    <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 pt-10">
      {children}
    </div>
  </div>
);

const QueueSimulation = () => {
  const [active, setActive] = useState(0);
  const clients = [
    { name: 'Lucas S.', service: 'Corte + Barba', time: '25 min', position: 1 },
    { name: 'Pedro M.', service: 'Corte Degradê', time: '15 min', position: 2 },
    { name: 'Rafael A.', service: 'Barba', time: '10 min', position: 3 },
  ];

  return (
    <PhoneMockup>
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-white tracking-wide">FILA AO VIVO</div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold">3 na fila</span>
          </div>
        </div>
        {clients.map((client, i) => (
          <div
            key={client.name}
            onClick={() => setActive(i)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              active === i ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    active === i ? 'bg-emerald-500 text-white' : 'bg-white/10 text-neutral-400'
                  }`}
                >
                  {client.position}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{client.name}</div>
                  <div className="text-[10px] text-neutral-500">{client.service}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-emerald-400">{client.time}</div>
                <div className="text-[10px] text-neutral-600">estimado</div>
              </div>
            </div>
          </div>
        ))}
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Próximo aviso
            </span>
          </div>
          <div className="text-[10px] text-neutral-400">
            Lucas será notificado quando faltar 5 min
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
};

const DashboardMini = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const bars = [
    { h: 60, label: 'Seg', val: 'R$ 820' },
    { h: 85, label: 'Ter', val: 'R$ 1.140' },
    { h: 45, label: 'Qua', val: 'R$ 610' },
    { h: 95, label: 'Qui', val: 'R$ 1.290' },
    { h: 70, label: 'Sex', val: 'R$ 950' },
    { h: 100, label: 'Sáb', val: 'R$ 1.350' },
  ];

  useEffect(() => {
    if (!chartRef.current) return;
    const barEls = chartRef.current.querySelectorAll('.chart-bar');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        barEls,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: chartRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, chartRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={chartRef}
      className="rounded-[2rem] border border-white/10 bg-neutral-900/60 p-8 backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Faturamento da semana
          </div>
          <div className="mt-1 text-3xl font-black text-white">R$ 6.160</div>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-bold">+18%</span>
        </div>
      </div>
      <div className="flex h-36 items-end gap-3">
        {bars.map((bar, i) => (
          <div
            key={bar.label}
            className="flex h-full min-w-0 flex-1 flex-col items-center gap-2"
            onMouseEnter={() => setHoveredBar(i)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <div className="relative flex w-full flex-1 items-end">
              {hoveredBar === i && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-emerald-400">
                  {bar.val}
                </div>
              )}
              <div
                className={`chart-bar w-full origin-bottom rounded-t-md transition-colors ${
                  hoveredBar === i ? 'bg-emerald-400' : 'bg-emerald-500/40'
                }`}
                style={{ height: `${bar.h}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-600">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.3'
        )
        .fromTo(
          heroSubRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        )
        .fromTo(
          heroCtaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.3'
        );

      // Phone mockup parallax on hero
      gsap.fromTo(
        '.hero-phone',
        { opacity: 0, y: 60, rotationY: -10 },
        {
          opacity: 1,
          y: 0,
          rotationY: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.hero-phone', start: 'top 90%' },
        }
      );

      // Parallax for phone mockups on scroll
      gsap.utils.toArray<HTMLElement>('.phone-parallax').forEach(el => {
        gsap.fromTo(
          el,
          { y: 80 },
          {
            y: -40,
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
          }
        );
      });

      // Feature sections reveal
      gsap.utils.toArray<HTMLElement>('.feature-section').forEach(section => {
        const textEl = section.querySelector('.feature-text');
        const visualEl = section.querySelector('.feature-visual');
        if (textEl) {
          gsap.fromTo(
            textEl,
            { opacity: 0, x: -50 },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: { trigger: section, start: 'top 75%' },
            }
          );
        }
        if (visualEl) {
          gsap.fromTo(
            visualEl,
            { opacity: 0, x: 50, scale: 0.95 },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.8,
              ease: 'power3.out',
              delay: 0.2,
              scrollTrigger: { trigger: section, start: 'top 75%' },
            }
          );
        }
      });

      // Staff cards stagger
      gsap.fromTo(
        '.staff-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.staff-card', start: 'top 85%' },
        }
      );

      // Security cards stagger
      gsap.fromTo(
        '.security-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.security-card', start: 'top 85%' },
        }
      );

      // CTA section scale
      gsap.fromTo(
        '.cta-section',
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.cta-section', start: 'top 80%' },
        }
      );

      // Feature badge pulse
      gsap.utils.toArray<HTMLElement>('.feature-badge').forEach(el => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'back.out(1.7)',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });

      // Section titles dramatic entrance
      gsap.utils.toArray<HTMLElement>('.section-title').forEach(el => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' },
          {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0% 0 0 0)',
            duration: 0.9,
            ease: 'power4.out',
            scrollTrigger: { trigger: el, start: 'top 80%' },
          }
        );
      });

      // Subtitle fade in
      gsap.utils.toArray<HTMLElement>('.section-subtitle').forEach(el => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            delay: 0.2,
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });

      // Bullet points stagger
      gsap.utils.toArray<HTMLElement>('.bullet-item').forEach(container => {
        gsap.fromTo(
          container.children,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: container, start: 'top 85%' },
          }
        );
      });

      // Metric number count-up effect
      gsap.utils.toArray<HTMLElement>('.metric-value').forEach(el => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.5, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.7,
            ease: 'back.out(1.4)',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-black text-neutral-100 selection:bg-emerald-500/30 font-sans overflow-x-hidden"
    >
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/10 rounded-full blur-[120px]" />
      </div>

      <MarketingNav />

      {/* Hero */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-28 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 text-center lg:text-left">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-0">
              <Sparkles className="w-3.5 h-3.5" />
              Para quem não para
            </div>
            <h1
              ref={heroTitleRef}
              className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.05] opacity-0"
            >
              <span className="bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent">
                Seu salão para de perder cliente por falta de controle.
              </span>
            </h1>
            <p
              ref={heroSubRef}
              className="text-lg md:text-xl text-neutral-400 max-w-xl font-light leading-relaxed mb-10 mx-auto lg:mx-0 opacity-0"
            >
              Fila digital, agendamento 24/7, financeiro, equipe e WhatsApp — tudo num só lugar. Sem
              planilha. Sem caderno. Sem dor de cabeça.
            </p>
            <div
              ref={heroCtaRef}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-0"
            >
              <button
                onClick={() => navigate('/login')}
                className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                Começar grátis
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/queue')}
                className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Ver fila ao vivo
              </button>
            </div>
          </div>
          <div className="hero-phone flex-1 flex justify-center opacity-0">
            <QueueSimulation />
          </div>
        </div>
      </section>

      {/* Pain → Solution strip */}
      <section className="py-16 px-6 relative z-10 border-y border-white/5 bg-neutral-950/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
              O que muda
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-1">
            <PainSolution
              pain="Cliente fica parado na fila sem saber quanto falta"
              solution="Acompanha tempo real no celular"
              delay={0}
            />
            <PainSolution
              pain="Dupla marcação e horários conflitantes"
              solution="Agenda calcula tudo automaticamente"
              delay={0.05}
            />
            <PainSolution
              pain="Ligando para confirmar cada agendamento"
              solution="WhatsApp envia lembrete sozinho"
              delay={0.1}
            />
            <PainSolution
              pain="Fim do mês e não sabe quanto lucrou"
              solution="Dashboard com faturamento diário"
              delay={0.15}
            />
            <PainSolution
              pain="Crediário em caderno, sem controle"
              solution="Fiado digital com pagamentos parciais"
              delay={0.2}
            />
            <PainSolution
              pain="Funcionário sem horário definido"
              solution="Escalas, férias e folgas organizadas"
              delay={0.25}
            />
          </div>
        </div>
      </section>

      {/* Feature 1: Fila */}
      <section className="feature-section py-24 md:py-36 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="feature-text flex-1">
            <div className="feature-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-0">
              <Clock className="w-3.5 h-3.5" />
              Fila Digital
            </div>
            <h2 className="section-title text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.05]">
              <span className="text-white">O cliente entra na fila</span>
              <br />
              <span className="text-emerald-400">de qualquer lugar.</span>
            </h2>
            <p className="section-subtitle text-neutral-400 text-lg leading-relaxed font-light mb-8 max-w-lg">
              De casa, do trabalho, do bar. Ele abre o link, escolhe o serviço e pronto — sabe
              exatamente quando chegar. Sem ligar. Sem perguntar. Sem ficar no escuro.
            </p>
            <div className="bullet-item space-y-4">
              {[
                { icon: Smartphone, text: 'Link único, sem app. Funciona em qualquer celular.' },
                { icon: Eye, text: 'Posição na fila + tempo estimado ao vivo.' },
                { icon: Bell, text: '"Sua vez!" no WhatsApp — automático.' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm text-neutral-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="feature-visual flex-1 flex justify-center phone-parallax">
            <QueueSimulation />
          </div>
        </div>
      </section>

      {/* Feature 2: Agendamento */}
      <section className="feature-section py-24 md:py-36 px-6 relative z-10 bg-neutral-950/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16">
          <div className="feature-visual flex-1 flex justify-center phone-parallax">
            <PhoneMockup>
              <div className="space-y-4">
                <div className="text-xs font-bold text-white tracking-wide">AGENDAR HORÁRIO</div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-neutral-500 mb-1">Serviço</div>
                  <div className="text-xs font-semibold text-white">Corte + Barba</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-neutral-500 mb-1">Profissional</div>
                  <div className="text-xs font-semibold text-white">Carlos</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['09:00', '10:30', '14:00'].map((time, i) => (
                    <div
                      key={time}
                      className={`p-2 rounded-lg text-center text-[10px] font-bold ${
                        i === 1 ? 'bg-emerald-500 text-white' : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      {time}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['15:30', '16:00', '17:30'].map(time => (
                    <div
                      key={time}
                      className="p-2 rounded-lg text-center text-[10px] font-bold bg-white/5 text-neutral-400"
                    >
                      {time}
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-emerald-500 text-white text-center text-xs font-bold">
                  Confirmar agendamento
                </div>
              </div>
            </PhoneMockup>
          </div>
          <div className="feature-text flex-1">
            <div className="feature-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-0">
              <Calendar className="w-3.5 h-3.5" />
              Agendamento 24/7
            </div>
            <h2 className="section-title text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.05]">
              <span className="text-white">Sua agenda trabalha</span>
              <br />
              <span className="text-teal-400">enquanto você dorme.</span>
            </h2>
            <p className="section-subtitle text-neutral-400 text-lg leading-relaxed font-light mb-8 max-w-lg">
              3 da manhã, cliente marca horário. Sistema calcula disponibilidade, evita conflito e
              confirma no WhatsApp. Você só vê o agendamento pronto na manhã seguinte.
            </p>
            <div className="bg-neutral-900/60 rounded-2xl border border-white/5 p-6">
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-4">
                O que acontece em 3 segundos
              </div>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Cliente escolhe serviço e profissional' },
                  { step: '2', text: 'Sistema verifica slots disponíveis' },
                  { step: '3', text: 'Confirma + envia lembrete 24h antes' },
                ].map(item => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-[10px] font-bold text-teal-400 shrink-0">
                      {item.step}
                    </div>
                    <span className="text-sm text-neutral-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Financeiro */}
      <section className="feature-section py-24 md:py-36 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="feature-text flex-1">
            <div className="feature-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-0">
              <Wallet className="w-3.5 h-3.5" />
              Financeiro
            </div>
            <h2 className="section-title text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.05]">
              <span className="text-white">Não é só caixa.</span>
              <br />
              <span className="text-cyan-400">É intelligence.</span>
            </h2>
            <p className="section-subtitle text-neutral-400 text-lg leading-relaxed font-light mb-8 max-w-lg">
              Sabe quanto cada profissional faturou. Qual serviço dá mais lucro. Quando o fiado está
              atrasado. Tudo em tempo real — sem esperar o fim do mês pra contar.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: CreditCard, label: 'Entradas', desc: 'Por serviço e profissional' },
                { icon: Receipt, label: 'Fiado', desc: 'Pagamentos parciais' },
                { icon: BarChart3, label: 'Relatórios', desc: 'Prontos, automáticos' },
                { icon: TrendingUp, label: 'Insights', desc: 'Tendências e alertas' },
              ].map(item => (
                <div
                  key={item.label}
                  className="bg-neutral-900/60 rounded-xl border border-white/5 p-4"
                >
                  <item.icon className="w-5 h-5 text-cyan-400 mb-2" />
                  <div className="text-sm font-bold text-white">{item.label}</div>
                  <div className="text-[11px] text-neutral-500">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="feature-visual flex-1">
            <DashboardMini />
          </div>
        </div>
      </section>

      {/* Feature 4: Equipe */}
      <section className="py-24 md:py-36 px-6 relative z-10 bg-neutral-950/50 border-y border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <div className="feature-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-0">
            <Users className="w-3.5 h-3.5" />
            Equipe
          </div>
          <h2 className="section-title text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.05]">
            <span className="text-white">Cada profissional no seu</span>
            <br />
            <span className="text-blue-400">time, sem bagunça.</span>
          </h2>
          <p className="section-subtitle text-neutral-400 text-lg leading-relaxed font-light max-w-xl mx-auto mb-12">
            Dono vê tudo. Funcionário vê só o seu. Horários, férias, produtividade — tudo organizado
            sem WhatsApp de grupo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                name: 'Carlos',
                role: 'Barbeiro',
                today: '8 atendimentos',
                revenue: 'R$ 480',
                avatar: 'C',
              },
              {
                name: 'Ana',
                role: 'Cabeleireira',
                today: '6 atendimentos',
                revenue: 'R$ 420',
                avatar: 'A',
              },
              {
                name: 'Pedro',
                role: 'Barbeiro',
                today: '10 atendimentos',
                revenue: 'R$ 560',
                avatar: 'P',
              },
            ].map(person => (
              <div
                key={person.name}
                className="staff-card bg-neutral-900/60 rounded-2xl border border-white/5 p-6 text-left opacity-0"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center text-sm font-bold text-white">
                    {person.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{person.name}</div>
                    <div className="text-[11px] text-neutral-500">{person.role}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-[10px] text-neutral-500 mb-1">Hoje</div>
                    <div className="text-sm font-bold text-white">{person.today}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-[10px] text-neutral-500 mb-1">Faturamento</div>
                    <div className="text-sm font-bold text-emerald-400">{person.revenue}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature 5: WhatsApp */}
      <section className="feature-section py-24 md:py-36 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="feature-visual flex-1 flex justify-center phone-parallax">
            <PhoneMockup>
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Mensagens automáticas
                </div>
                {[
                  {
                    time: 'Ontem 18:00',
                    msg: 'Olá Lucas! Seu agendamento é amanhã às 14:00 com Carlos. Confirma? ✅',
                    from: 'bot',
                    status: 'Entregue',
                  },
                  { time: 'Ontem 18:02', msg: 'Confirmado! Obrigado.', from: 'user' },
                  {
                    time: 'Hoje 12:00',
                    msg: 'Oi Lucas! Falta 2h para seu horário. Te esperamos! 💈',
                    from: 'bot',
                    status: 'Entregue',
                  },
                  {
                    time: 'Hoje 13:55',
                    msg: 'Lucas, sua vez! Pode ir pro salão. Carlos está esperando.',
                    from: 'bot',
                    status: 'Entregue',
                  },
                ].map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl text-[10px] max-w-[85%] ${
                      msg.from === 'bot'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-neutral-300 mr-auto'
                        : 'bg-blue-500/20 border border-blue-500/20 text-white ml-auto'
                    }`}
                  >
                    <div>{msg.msg}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-neutral-600">{msg.time}</span>
                      {msg.status && <span className="text-emerald-500/60">{msg.status}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </PhoneMockup>
          </div>
          <div className="feature-text flex-1">
            <div className="feature-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-0">
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Automático
            </div>
            <h2 className="section-title text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.05]">
              <span className="text-white">Não é só lembrete.</span>
              <br />
              <span className="text-amber-400">É conversa.</span>
            </h2>
            <p className="section-subtitle text-neutral-400 text-lg leading-relaxed font-light mb-8 max-w-lg">
              O cliente recebe mensagem como se fosse do salão. Confirmação, lembrete, "sua vez" —
              tudo automático, tudo no WhatsApp que ele já usa. Sem app. Sem link estranho.
            </p>
            <div className="bg-neutral-900/60 rounded-2xl border border-white/5 p-6">
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-4">
                Automatizações
              </div>
              <div className="space-y-3">
                {[
                  { trigger: 'Agendamento criado', action: 'Confirmação + opção cancelar' },
                  { trigger: '24h antes', action: 'Lembrete com detalhes do horário' },
                  { trigger: '1h antes', action: 'Aviso de preparação' },
                  { trigger: 'Cliente é o próximo', action: '"Sua vez!" + endereço do salão' },
                ].map(item => (
                  <div key={item.trigger} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-white">{item.trigger}</span>
                      <span className="text-xs text-neutral-500"> → {item.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 6: Perfil Público */}
      <section className="feature-section relative z-10 border-y border-white/5 bg-neutral-950/50 px-6 py-24 md:py-36">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row-reverse">
          <div className="feature-text flex-1">
            <div className="feature-badge mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-green-400 opacity-0">
              <Store className="h-3.5 w-3.5" />
              Perfil Público
            </div>
            <h2 className="section-title mb-6 text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
              <span className="text-white">Um link. O salão</span>
              <br />
              <span className="text-green-400">inteiro no celular.</span>
            </h2>
            <p className="section-subtitle mb-8 max-w-lg text-lg font-light leading-relaxed text-neutral-400">
              Página pública com serviços, horários, fila e agenda. O cliente abre, escolhe e entra
              — sem baixar app e sem ligar para o balcão.
            </p>
            <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-6">
              <div className="mb-4 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                O que o cliente vê
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: 'Nome, status e horário de hoje',
                    detail: 'Aberto / fechado em tempo real',
                  },
                  { label: 'Lista de serviços com preço', detail: 'Transparente antes de entrar' },
                  { label: 'Entrar na fila ou agendar', detail: 'Dois caminhos no mesmo link' },
                  { label: 'Feed e fotos do salão', detail: 'Prova social sem Instagram embutido' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-400" />
                    <div>
                      <span className="text-xs font-semibold text-white">{item.label}</span>
                      <span className="text-xs text-neutral-500"> — {item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="feature-visual phone-parallax flex flex-1 justify-center">
            <PhoneMockup>
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-white/8 bg-gradient-to-br from-emerald-500/25 via-neutral-900 to-neutral-950">
                  <div className="flex items-center gap-3 p-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-sm font-black text-black">
                      BC
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-bold text-white">Barbearia Central</div>
                      <div className="text-[10px] text-neutral-400">Unissex · Centro</div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[9px] font-bold text-emerald-300">Aberto</span>
                    </div>
                  </div>
                  <div className="border-t border-white/8 px-3 py-2 text-[10px] text-neutral-400">
                    Hoje · 09:00–19:00
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 rounded-lg bg-emerald-400 px-2 py-2.5 text-center text-[10px] font-black text-black">
                    Entrar na fila
                  </div>
                  <div className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-2.5 text-center text-[10px] font-bold text-white">
                    Agendar
                  </div>
                </div>

                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Serviços
                </div>
                {[
                  { name: 'Corte masculino', price: 'R$ 45', time: '30 min' },
                  { name: 'Barba', price: 'R$ 30', time: '20 min' },
                  { name: 'Corte + barba', price: 'R$ 65', time: '50 min' },
                ].map(service => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2.5"
                  >
                    <div>
                      <div className="text-[11px] font-semibold text-white">{service.name}</div>
                      <div className="text-[9px] text-neutral-500">{service.time}</div>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-300">{service.price}</div>
                  </div>
                ))}

                <div className="rounded-xl border border-white/5 bg-white/4 px-3 py-2.5">
                  <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                    Link do salão
                  </div>
                  <div className="truncate text-[10px] font-medium text-neutral-300">
                    agendai.app/queue/barbearia-central
                  </div>
                </div>
              </div>
            </PhoneMockup>
          </div>
        </div>
      </section>

      {/* Feature 7: Segurança */}
      <section className="py-24 md:py-36 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="feature-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            Segurança
          </div>
          <h2 className="section-title text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.05]">
            <span className="text-white">Cada salão é um</span>
            <br />
            <span className="text-teal-400">mundo isolado.</span>
          </h2>
          <p className="section-subtitle text-neutral-400 text-lg leading-relaxed font-light max-w-xl mx-auto mb-12">
            Dados de cada barbearia completamente separados. Autenticação por papéis, senhas
            criptografadas, assinatura validada por CPF.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: 'Multi-tenant', desc: 'Dados isolados por salão' },
              { icon: UserCog, title: 'Papéis', desc: 'Owner, Employee, Master' },
              { icon: CreditCard, title: 'Bloqueio', desc: 'Inadimplência via CPF' },
            ].map(item => (
              <div
                key={item.title}
                className="security-card bg-neutral-900/60 rounded-2xl border border-white/5 p-6 opacity-0"
              >
                <item.icon className="w-8 h-8 text-teal-400 mb-3 mx-auto" />
                <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                <div className="text-[11px] text-neutral-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section py-32 px-6 relative z-10 opacity-0">
        <div className="max-w-7xl mx-auto bg-white text-black rounded-[3rem] md:rounded-[5rem] overflow-hidden relative">
          <div className="p-10 md:p-20 relative z-10 flex flex-col md:flex-row items-center gap-12 justify-between">
            <div className="max-w-xl">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-neutral-500">
                {trialCampaign.eyebrow}
              </p>
              <h2 className="mb-6 text-4xl font-bold leading-[1.05] tracking-tighter md:text-6xl">
                Seu salão merece mais que um caderno.
              </h2>
              <p className="text-lg text-neutral-600 font-light leading-relaxed">
                {trialCampaign.body} {trialCampaign.afterTrial}
              </p>
            </div>
            <div className="flex w-full flex-col items-stretch gap-3 sm:items-start md:w-auto md:min-w-64">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-black px-8 py-4 text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:text-black"
              >
                {trialCampaign.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/queue')}
                className="group inline-flex items-center justify-center gap-2 px-2 py-3 text-sm font-bold text-neutral-600 transition hover:text-black sm:justify-start sm:px-3"
              >
                Ver demonstração
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
