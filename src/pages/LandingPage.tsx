import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Scissors,
  Smartphone,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { FloatingPathsBackground } from '../components/ui/floating-paths';
import { trialCampaign } from '../marketing/trialCampaign';

gsap.registerPlugin(ScrollTrigger);

const marqueeItems = [
  'Fila digital',
  'Agenda 24h',
  'Equipe ilimitada',
  'Financeiro',
  'Feed do salão',
  'WhatsApp',
];

const queueCustomers = [
  {
    initials: 'AM',
    name: 'Ana Martins',
    service: 'Corte + escova',
    wait: '5 min',
  },
  {
    initials: 'LC',
    name: 'Lucas Costa',
    service: 'Corte masculino',
    wait: '18 min',
  },
  { initials: 'BS', name: 'Bianca Souza', service: 'Manicure', wait: '32 min' },
];

const processSteps = [
  {
    number: '01',
    title: 'O cliente escolhe',
    copy: 'Entra na fila ou consulta a agenda pelo celular, sem baixar aplicativo e sem ligar para o salão.',
    icon: Smartphone,
    meta: 'Experiência pública',
    accent: 'emerald',
  },
  {
    number: '02',
    title: 'Sua equipe executa',
    copy: 'Fila, horários, serviços e profissionais ficam organizados em uma única tela durante todo o dia.',
    icon: Users,
    meta: 'Operação em tempo real',
    accent: 'cyan',
  },
  {
    number: '03',
    title: 'Você acompanha',
    copy: 'No Pro, relatórios e financeiro transformam o movimento do estabelecimento em decisões objetivas.',
    icon: TrendingUp,
    meta: 'Visão de negócio',
    accent: 'amber',
  },
] as const;

const stepAccent = {
  emerald: {
    line: 'via-emerald-400/50',
    meta: 'text-emerald-400',
    glow: 'bg-emerald-400/20',
    num: 'text-emerald-400/55',
    bar: 'bg-emerald-400',
  },
  cyan: {
    line: 'via-cyan-400/50',
    meta: 'text-cyan-300',
    glow: 'bg-cyan-400/20',
    num: 'text-cyan-300/55',
    bar: 'bg-cyan-400',
  },
  amber: {
    line: 'via-amber-300/50',
    meta: 'text-amber-200',
    glow: 'bg-amber-300/20',
    num: 'text-amber-200/55',
    bar: 'bg-amber-300',
  },
} as const;

const planFeatures = {
  essential: [
    'Fila digital e agenda online',
    'Funcionários ilimitados',
    'Serviços, perfil e feed',
    'Suporte por e-mail',
  ],
  pro: [
    'Tudo do Essencial',
    'Dashboard e relatórios',
    'Financeiro, despesas e fiado',
    'Insights de movimento',
  ],
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      ScrollTrigger.refresh();
      return true;
    };

    // GSAP/layout podem atrasar o elemento; tenta algumas vezes.
    if (tryScroll()) return;
    const t1 = window.setTimeout(() => {
      if (!tryScroll()) {
        window.setTimeout(tryScroll, 120);
      }
    }, 100);
    return () => window.clearTimeout(t1);
  }, [location.pathname, location.hash]);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const heroTimeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
        });

        heroTimeline
          .from('[data-hero-badge]', {
            autoAlpha: 0,
            y: 16,
            duration: 0.55,
          })
          .from(
            '[data-hero-line]',
            {
              autoAlpha: 0,
              yPercent: 115,
              duration: 0.9,
              stagger: 0.1,
            },
            '-=0.25'
          )
          .from(
            '[data-hero-copy]',
            {
              autoAlpha: 0,
              y: 22,
              duration: 0.7,
            },
            '-=0.5'
          )
          .from(
            '[data-hero-action]',
            {
              autoAlpha: 0,
              y: 18,
              duration: 0.6,
              stagger: 0.08,
            },
            '-=0.45'
          )
          .from(
            '[data-hero-scene]',
            {
              autoAlpha: 0,
              x: 45,
              rotateY: -7,
              scale: 0.96,
              duration: 1.1,
            },
            '-=0.85'
          )
          .from(
            '[data-hero-card]',
            {
              autoAlpha: 0,
              scale: 0.86,
              y: 24,
              duration: 0.65,
              stagger: 0.12,
            },
            '-=0.5'
          );

        gsap.from('[data-hero-bar]', {
          scaleY: 0,
          transformOrigin: 'bottom',
          duration: 0.9,
          stagger: 0.05,
          delay: 1.15,
          ease: 'back.out(1.5)',
        });

        gsap.to('[data-ambient="one"]', {
          x: 45,
          y: 25,
          scale: 1.15,
          duration: 7,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        gsap.to('[data-ambient="two"]', {
          x: -35,
          y: -30,
          scale: 1.2,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        gsap.to('[data-float="one"]', {
          y: -12,
          rotate: -1.5,
          duration: 3.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        gsap.to('[data-float="two"]', {
          y: 10,
          rotate: 1.5,
          duration: 4.1,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        const marquee = page.querySelector<HTMLElement>('[data-marquee-track]');
        if (marquee) {
          gsap.to(marquee, {
            xPercent: -50,
            duration: 26,
            repeat: -1,
            ease: 'none',
          });
        }

        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(element => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 52 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 86%',
                once: true,
              },
            }
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-stagger-group]').forEach(group => {
          const items = group.querySelectorAll('[data-stagger-item]');
          gsap.fromTo(
            items,
            { autoAlpha: 0, y: 46, scale: 0.97 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.72,
              stagger: 0.11,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: group,
                start: 'top 78%',
                once: true,
              },
            }
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-count]').forEach(element => {
          const target = Number(element.dataset.count ?? 0);
          const prefix = element.dataset.prefix ?? '';
          const suffix = element.dataset.suffix ?? '';
          const state = { value: 0 };

          gsap.to(state, {
            value: target,
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 90%',
              once: true,
            },
            onUpdate: () => {
              element.textContent = `${prefix}${Math.round(state.value)}${suffix}`;
            },
          });
        });

        const insightLine = page.querySelector<SVGPathElement>('[data-insight-line]');
        if (insightLine) {
          const length = insightLine.getTotalLength();
          gsap.fromTo(
            insightLine,
            {
              strokeDasharray: length,
              strokeDashoffset: length,
            },
            {
              strokeDashoffset: 0,
              duration: 2,
              ease: 'power2.inOut',
              scrollTrigger: {
                trigger: insightLine,
                start: 'top 82%',
                once: true,
              },
            }
          );
        }

        const bookingCard = page.querySelector<HTMLElement>('[data-booking-card]');
        if (bookingCard) {
          const bookingDays = bookingCard.querySelectorAll('[data-booking-day]');
          const bookingSlots = bookingCard.querySelectorAll('[data-booking-slot]');
          const bookingConfirm = bookingCard.querySelector('[data-booking-confirm]');

          gsap.set(
            [
              ...Array.from(bookingDays),
              ...Array.from(bookingSlots),
              ...(bookingConfirm ? [bookingConfirm] : []),
            ],
            { autoAlpha: 0 }
          );

          gsap.fromTo(
            bookingDays,
            { autoAlpha: 0, y: 14 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.06,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: bookingCard,
                start: 'top 78%',
                once: true,
              },
            }
          );

          gsap.fromTo(
            bookingSlots,
            { autoAlpha: 0, scale: 0.88 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.4,
              stagger: 0.05,
              delay: 0.18,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: bookingCard,
                start: 'top 78%',
                once: true,
              },
            }
          );

          if (bookingConfirm) {
            gsap.fromTo(
              bookingConfirm,
              { autoAlpha: 0, y: 18 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.55,
                delay: 0.42,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: bookingCard,
                  start: 'top 78%',
                  once: true,
                },
              }
            );
          }
        }

        const queueCard = page.querySelector<HTMLElement>('[data-queue-card]');
        if (queueCard) {
          const queueRows = queueCard.querySelectorAll('[data-queue-row]');
          gsap.set(queueRows, { autoAlpha: 0, x: 18 });
          gsap.fromTo(
            queueRows,
            { autoAlpha: 0, x: 18 },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.5,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: queueCard,
                start: 'top 78%',
                once: true,
              },
            }
          );
        }

        const rolesCard = page.querySelector<HTMLElement>('[data-roles-card]');
        if (rolesCard) {
          const rolePanels = rolesCard.querySelectorAll('[data-role-panel]');
          gsap.set(rolePanels, { autoAlpha: 0, y: 20 });
          gsap.fromTo(
            rolePanels,
            { autoAlpha: 0, y: 20 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.12,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: rolesCard,
                start: 'top 78%',
                once: true,
              },
            }
          );
        }

        const scene = page.querySelector<HTMLElement>('[data-hero-scene]');
        const canUsePointerParallax = window.matchMedia('(pointer: fine)').matches;

        if (scene && canUsePointerParallax) {
          const layers = Array.from(scene.querySelectorAll<HTMLElement>('[data-parallax]'));
          const moveX = layers.map(layer =>
            gsap.quickTo(layer, 'x', { duration: 0.6, ease: 'power3.out' })
          );

          const handlePointerMove = (event: PointerEvent) => {
            const bounds = scene.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;

            layers.forEach((layer, index) => {
              const depth = Number(layer.dataset.depth ?? 1);
              moveX[index](x * 22 * depth);
            });
          };

          const resetPointer = () => {
            moveX.forEach(move => move(0));
          };

          scene.addEventListener('pointermove', handlePointerMove);
          scene.addEventListener('pointerleave', resetPointer);

          return () => {
            scene.removeEventListener('pointermove', handlePointerMove);
            scene.removeEventListener('pointerleave', resetPointer);
          };
        }

        return undefined;
      });

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const stack = page.querySelector<HTMLElement>('[data-stack]');
        const stackItems = gsap.utils.toArray<HTMLElement>('[data-stack-item]');
        const progressFill = page.querySelector<HTMLElement>('[data-stack-progress]');

        if (stack && progressFill) {
          gsap.fromTo(
            progressFill,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: stack,
                start: 'top 70%',
                end: 'bottom 45%',
                scrub: 0.4,
              },
            }
          );
        }

        stackItems.forEach((item, index) => {
          const card = item.querySelector<HTMLElement>('[data-stack-card]');
          const num = item.querySelector<HTMLElement>('[data-stack-num]');
          const dot = item.querySelector<HTMLElement>('[data-stack-dot]');
          if (!card) return;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              once: true,
            },
          });

          tl.fromTo(
            card,
            { autoAlpha: 0, y: 36, x: index % 2 === 0 ? -18 : 18 },
            {
              autoAlpha: 1,
              y: 0,
              x: 0,
              duration: 0.7,
              ease: 'power3.out',
            }
          ).fromTo(
            num,
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' },
            '-=0.4'
          );

          if (dot) {
            tl.fromTo(
              dot,
              { scale: 0.4, autoAlpha: 0 },
              { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(1.6)' },
              '-=0.55'
            );
          }
        });
      });

      media.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(
          '[data-hero-badge], [data-hero-line], [data-hero-copy], [data-hero-action], [data-hero-scene], [data-hero-card], [data-reveal], [data-stagger-item], [data-stack-card], [data-stack-num], [data-stack-progress], [data-stack-dot]',
          { autoAlpha: 1, clearProps: 'transform' }
        );
      });

      const stickyCta = page.querySelector<HTMLElement>('[data-sticky-cta]');
      const stickyAnchor = page.querySelector<HTMLElement>('[data-sticky-cta-anchor]');
      const stickyEnd = page.querySelector<HTMLElement>('[data-sticky-cta-end]');

      if (stickyCta && stickyAnchor) {
        const stickyButton = stickyCta.querySelector<HTMLButtonElement>('button');
        gsap.set(stickyCta, { autoAlpha: 0, y: 56, pointerEvents: 'none' });
        stickyCta.setAttribute('aria-hidden', 'true');
        stickyButton?.setAttribute('tabindex', '-1');

        const showSticky = () => {
          stickyCta.setAttribute('aria-hidden', 'false');
          stickyButton?.removeAttribute('tabindex');
          gsap.to(stickyCta, {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            ease: 'power3.out',
            overwrite: 'auto',
            onStart: () => {
              stickyCta.style.pointerEvents = 'auto';
            },
          });
        };

        const hideSticky = () => {
          gsap.to(stickyCta, {
            autoAlpha: 0,
            y: 40,
            duration: 0.3,
            ease: 'power2.in',
            overwrite: 'auto',
            onComplete: () => {
              stickyCta.style.pointerEvents = 'none';
              stickyCta.setAttribute('aria-hidden', 'true');
              stickyButton?.setAttribute('tabindex', '-1');
            },
          });
        };

        ScrollTrigger.create({
          trigger: stickyAnchor,
          start: 'bottom top+=72',
          endTrigger: stickyEnd ?? undefined,
          end: stickyEnd ? 'top 85%' : 'max',
          onEnter: showSticky,
          onLeave: hideSticky,
          onEnterBack: showSticky,
          onLeaveBack: hideSticky,
        });
      }
    }, page);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return (
    <div
      ref={pageRef}
      className="min-h-screen overflow-x-hidden bg-[#050706] font-sans text-neutral-100 selection:bg-emerald-400/30"
    >
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          data-ambient="one"
          className="absolute -left-[10%] -top-[15%] h-192 w-3xl rounded-full bg-emerald-600/9 blur-[150px]"
        />
        <div
          data-ambient="two"
          className="absolute -bottom-[20%] -right-[12%] h-176 w-176 rounded-full bg-cyan-600/6 blur-[150px]"
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'linear-gradient(to bottom, black, transparent 75%)',
          }}
        />
      </div>

      <MarketingNav />

      <main className="relative z-10">
        <section className="relative flex min-h-screen items-center overflow-hidden px-5 pb-24 pt-28 sm:px-8 md:pt-32 xl:px-12 xl:pb-28 xl:pt-36">
          <FloatingPathsBackground
            position={-1}
            className="pointer-events-none absolute inset-0 z-0 opacity-70"
          />
          <div className="relative z-10 mx-auto grid w-full max-w-400 items-center gap-16 xl:grid-cols-[minmax(0,0.95fr)_minmax(560px,1.05fr)] xl:gap-16 2xl:gap-24">
            <div className="relative z-20 max-w-3xl">
              <p
                data-hero-badge
                className="mb-6 text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-400/90"
              >
                Fila · agenda · financeiro
              </p>

              <h1 className="max-w-200 text-[clamp(3.6rem,4.7vw,5.6rem)] font-black leading-none tracking-[-0.06em] text-white">
                <span className="-mb-[0.12em] block overflow-hidden pb-[0.2em]">
                  <span data-hero-line className="block md:whitespace-nowrap">
                    Fila e agenda
                  </span>
                </span>
                <span className="-mb-[0.12em] block overflow-hidden pb-[0.2em]">
                  <span
                    data-hero-line
                    className="block bg-linear-to-r from-emerald-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent md:whitespace-nowrap"
                  >
                    sem confusão.
                  </span>
                </span>
                <span className="-mb-[0.12em] block overflow-hidden pb-[0.2em]">
                  <span data-hero-line className="block text-white md:whitespace-nowrap">
                    Resultado à vista.
                  </span>
                </span>
              </h1>

              <p
                data-hero-copy
                className="mt-7 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:text-lg xl:text-xl"
              >
                Fila pública com estimativa de espera, agendamento online e financeiro no mesmo
                painel. A equipe opera em tempo real; você acompanha o resultado.
              </p>

              <div
                data-hero-action
                className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-10"
              >
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="group w-fit text-left"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="relative text-[1.35rem] font-black tracking-[-0.04em] text-white sm:text-[1.5rem]">
                      {trialCampaign.cta}
                      <span
                        aria-hidden
                        className="absolute inset-x-0 -bottom-1 h-[2px] origin-left scale-x-100 bg-emerald-400 transition duration-300 group-hover:bg-emerald-300"
                      />
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-emerald-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-emerald-300" />
                  </span>
                  <span className="mt-3 block text-[11px] font-medium tracking-[0.04em] text-neutral-500">
                    {trialCampaign.heroSubline}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={event => scrollToSection(event, 'produto')}
                  className="group inline-flex items-center gap-1.5 pb-1 text-sm font-medium text-neutral-500 transition hover:text-neutral-200"
                >
                  Ver o produto
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              <div data-hero-action className="mt-10 max-w-2xl border-t border-white/10 pt-6">
                <div className="grid gap-6 sm:grid-cols-3 sm:gap-0">
                  {[
                    {
                      value: '30',
                      unit: 'dias',
                      label: trialCampaign.metricLabel,
                    },
                    {
                      value: '∞',
                      unit: 'equipe',
                      label: 'Sem taxa por pessoa no Essencial e no Pro.',
                    },
                    {
                      value: '1',
                      unit: 'link',
                      label: 'Fila e agenda no mesmo endereço público.',
                    },
                  ].map((benefit, index) => (
                    <div
                      key={benefit.unit}
                      className={`sm:px-5 sm:first:pl-0 sm:last:pr-0 ${
                        index > 0 ? 'sm:border-l sm:border-white/10' : ''
                      }`}
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black tracking-tight text-white md:text-4xl">
                          {benefit.value}
                        </span>
                        <span className="text-sm font-bold text-emerald-300">{benefit.unit}</span>
                      </div>
                      <p className="mt-2 max-w-56 text-sm font-medium leading-relaxed text-neutral-400">
                        {benefit.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              data-hero-scene
              className="relative mx-auto w-full max-w-195 perspective-distant xl:justify-self-end"
            >
              <div
                data-parallax
                data-depth="0.35"
                className="absolute -inset-10 rounded-full bg-emerald-500/10 blur-[80px]"
                aria-hidden="true"
              />

              <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-[#0b0e0c]/90 p-3 shadow-[0_35px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-4">
                <div className="rounded-[1.45rem] border border-white/[0.07] bg-[#101411]">
                  <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-black">
                        <Scissors className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Visão de hoje</p>
                        <p className="text-[10px] text-neutral-500">Studio Aurora · sexta-feira</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Aberto
                    </div>
                  </div>

                  <div className="grid gap-3 p-4 sm:grid-cols-3">
                    {[
                      { label: 'Na fila', value: '07', accent: true },
                      { label: 'Espera média', value: '18 min' },
                      { label: 'Agendados', value: '12' },
                    ].map(item => (
                      <div
                        key={item.label}
                        className={`rounded-2xl border p-4 ${
                          item.accent
                            ? 'border-emerald-400/20 bg-emerald-400/[0.07]'
                            : 'border-white/6 bg-white/2.5'
                        }`}
                      >
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-black tracking-tight text-white">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 px-4 pb-4 md:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Fila em tempo real</p>
                          <p className="mt-1 text-[9px] text-neutral-500">Atualizada agora</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-600" />
                      </div>
                      <div className="space-y-2">
                        {queueCustomers.map((customer, index) => (
                          <div
                            key={customer.name}
                            className="flex items-center gap-3 rounded-xl border border-white/4 bg-white/2.5 p-2.5"
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[9px] font-black ${
                                index === 0
                                  ? 'bg-emerald-400 text-black'
                                  : 'bg-white/[0.07] text-neutral-300'
                              }`}
                            >
                              {customer.initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[10px] font-bold text-neutral-200">
                                {customer.name}
                              </p>
                              <p className="truncate text-[8px] text-neutral-600">
                                {customer.service}
                              </p>
                            </div>
                            <span className="text-[9px] font-bold text-emerald-400">
                              {customer.wait}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col rounded-2xl border border-white/6 bg-black/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Movimento</p>
                          <p className="mt-1 text-[9px] text-neutral-500">Atendimentos por hora</p>
                        </div>
                        <BarChart3 className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="mt-6 flex min-h-32 flex-1 items-end gap-2">
                        {[36, 55, 43, 72, 62, 88, 68, 96, 78].map((height, index) => (
                          <div
                            key={index}
                            data-hero-bar
                            className={`flex-1 rounded-t-md ${
                              index === 7
                                ? 'bg-emerald-400'
                                : 'bg-linear-to-t from-emerald-500/35 to-cyan-400/20'
                            }`}
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                      <div className="mt-3 flex justify-between text-[7px] uppercase tracking-widest text-neutral-700">
                        <span>09h</span>
                        <span>13h</span>
                        <span>18h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                data-hero-card
                data-float="one"
                data-parallax
                data-depth="1.25"
                className="absolute -left-4 top-[30%] hidden w-52 rounded-2xl border border-white/10 bg-[#111512]/90 p-4 shadow-2xl backdrop-blur-2xl sm:block lg:-left-16"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white">Nova entrada</p>
                    <p className="text-[9px] text-neutral-500">Cliente entrou na fila</p>
                  </div>
                </div>
              </div>

              <div
                data-hero-card
                data-float="two"
                data-parallax
                data-depth="1.5"
                className="absolute -bottom-7 right-2 hidden w-56 rounded-2xl border border-emerald-400/15 bg-[#111512]/90 p-4 shadow-2xl backdrop-blur-2xl sm:block lg:-right-10"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                    Próximo horário
                  </span>
                  <Calendar className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-white">14:30 · Corte + escova</p>
                <p className="mt-1 text-[9px] text-neutral-500">com Marina Oliveira</p>
              </div>
            </div>
          </div>

          <button
            onClick={event => scrollToSection(event, 'produto')}
            className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[8px] font-bold uppercase tracking-[0.28em] text-neutral-600 transition hover:text-neutral-400 md:flex"
            aria-label="Ir para a próxima seção"
          >
            Explore
            <span className="relative h-10 w-px overflow-hidden bg-white/10">
              <span className="absolute left-0 top-0 h-1/2 w-full animate-pulse bg-emerald-400" />
            </span>
          </button>
        </section>

        <section className="relative overflow-hidden border-y border-white/6 bg-white/[0.018] py-5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-[#050706] to-transparent md:w-48" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-[#050706] to-transparent md:w-48" />
          <div data-marquee-track className="flex w-max items-center">
            {[0, 1].map(group => (
              <div
                key={group}
                className="flex w-screen min-w-max shrink-0 items-center justify-around gap-10 px-8 md:gap-14 md:px-16"
              >
                {marqueeItems.map(item => (
                  <span
                    key={`${group}-${item}`}
                    className="shrink-0 text-xs font-black uppercase tracking-[0.24em] text-neutral-500"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section id="produto" className="relative scroll-mt-20 px-6 py-28 md:py-40">
          <div className="mx-auto max-w-375">
            <div data-reveal className="mb-16 max-w-3xl">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">
                Da chegada ao resultado
              </span>
              <h2 className="mt-5 text-5xl font-black tracking-[-0.05em] text-white md:text-7xl">
                A fila anda. A agenda encaixa. O caixa fecha.
              </h2>
              <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-neutral-400 md:text-xl">
                O link público organiza a chegada, o painel coordena a equipe e o financeiro mostra
                o resultado — sem papel na recepção ou planilha paralela.
              </p>
            </div>

            <div id="recursos" className="scroll-mt-28 space-y-28 md:space-y-36">
              {/* Sessão 1 — Fila */}
              <article
                data-reveal
                data-queue-card
                className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
                    Link público + painel
                  </p>
                  <h3 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                    O cliente espera onde quiser.
                  </h3>
                  <p className="mt-6 max-w-md text-lg font-medium leading-relaxed text-neutral-400">
                    Entra pelo link, vê a posição e a estimativa. No painel, a equipe chama, inicia
                    e conclui — sem gritar nome na porta.
                  </p>
                  <ul className="mt-8 space-y-3">
                    {[
                      'Posição e tempo estimados atualizam ao vivo',
                      'Chamada, início e conclusão no mesmo fluxo',
                      'Cliente acompanha no celular, sem app',
                    ].map(item => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm font-semibold text-neutral-300"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.75rem] border border-white/8 bg-[#0d110e] p-5 md:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-white">Fila ao vivo</p>
                      <p className="mt-0.5 text-sm text-neutral-500">Studio Aurora · hoje</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/12 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-300">
                      3 na fila
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div
                      data-queue-row
                      className="flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-3.5"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-sm font-black text-black">
                        AM
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">Ana Martins</p>
                        <p className="mt-0.5 text-xs text-emerald-100/70">
                          Corte + escova · cadeira 1
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black">
                        Na cadeira
                      </span>
                    </div>

                    {queueCustomers.slice(1).map((customer, index) => (
                      <div
                        key={customer.name}
                        data-queue-row
                        className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/3 p-3.5"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/8 text-sm font-black text-neutral-300">
                          {customer.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{customer.name}</p>
                          <p className="mt-0.5 text-xs text-neutral-500">{customer.service}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
                            {index === 0 ? 'Próxima' : '2ª'}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-600">~{customer.wait}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/6 bg-black/40 px-4 py-3">
                    <span className="text-xs font-semibold text-neutral-400">
                      Próxima chamada estimada
                    </span>
                    <span className="text-sm font-black text-emerald-300">~18 min</span>
                  </div>
                </div>
              </article>

              {/* Sessão 2 — Agenda */}
              <article
                data-reveal
                data-booking-card
                className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16"
              >
                <div className="order-2 lg:order-1">
                  <div className="rounded-[1.75rem] border border-white/8 bg-[#0b0e0c] p-5 md:p-6">
                    <div className="mb-5 flex items-baseline justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-white">Agendar</p>
                        <p className="mt-0.5 text-sm text-neutral-500">Corte + escova · Marina</p>
                      </div>
                      <p className="text-xs font-semibold tabular-nums text-cyan-300">Qui, 15</p>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { day: 'SEG', n: 12 },
                        { day: 'TER', n: 13 },
                        { day: 'QUA', n: 14 },
                        { day: 'QUI', n: 15, active: true },
                        { day: 'SEX', n: 16 },
                      ].map(item => (
                        <div
                          key={item.day}
                          data-booking-day
                          className={`rounded-xl border px-1.5 py-3 text-center ${
                            item.active
                              ? 'border-cyan-400/35 bg-cyan-400/12'
                              : 'border-white/6 bg-white/3'
                          }`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                            {item.day}
                          </p>
                          <p
                            className={`mt-1.5 text-base font-black ${
                              item.active ? 'text-cyan-300' : 'text-neutral-300'
                            }`}
                          >
                            {item.n}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="mb-2.5 mt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                      Horários livres
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { time: '11:00', state: 'free' as const },
                        { time: '14:00', state: 'free' as const },
                        { time: '15:30', state: 'selected' as const },
                        { time: '17:00', state: 'free' as const },
                      ].map(slot => (
                        <div
                          key={slot.time}
                          data-booking-slot
                          className={`rounded-xl border py-2.5 text-center text-xs font-black tabular-nums ${
                            slot.state === 'selected'
                              ? 'border-cyan-400/40 bg-cyan-400 text-black'
                              : 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300'
                          }`}
                        >
                          {slot.time}
                        </div>
                      ))}
                    </div>

                    <div
                      data-booking-confirm
                      className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/8 p-3.5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white">Qui 15 · 15:30</p>
                        <p className="mt-0.5 text-xs text-emerald-100/70">
                          60 min · R$ 85 · lembrete
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black">
                        Ok
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-1 lg:order-2">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                    Agendamento público
                  </p>
                  <h3 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                    Horário livre — e só o livre.
                  </h3>
                  <p className="mt-6 max-w-md text-lg font-medium leading-relaxed text-neutral-400">
                    Expediente, profissional e duração do serviço entram no cálculo. O cliente marca
                    sem “tem vaga?” no WhatsApp.
                  </p>
                  <ul className="mt-8 space-y-3">
                    {[
                      'Passos claros: serviço → profissional → horário',
                      'Só mostra vagas realmente disponíveis',
                      'Confirmação com duração, preço e lembrete',
                    ].map(item => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm font-semibold text-neutral-300"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              {/* Sessão 3 — Financeiro */}
              <article
                data-reveal
                className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">
                    Despesas + fiado
                  </p>
                  <h3 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                    O que sobrou — sem planilha.
                  </h3>
                  <p className="mt-6 max-w-md text-lg font-medium leading-relaxed text-neutral-400">
                    Entradas, custos e fiado no mesmo resumo. Você vê o líquido e o que ainda está
                    na rua.
                  </p>
                  <ul className="mt-8 space-y-3">
                    {[
                      'Líquido do mês sem abrir planilha',
                      'Fiado com vencimento e status',
                      'Despesas e entradas no mesmo painel',
                    ].map(item => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm font-semibold text-neutral-300"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.75rem] border border-white/8 bg-[#0d110e] p-5 md:p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-neutral-500">
                        Líquido do mês
                      </p>
                      <p className="mt-1 text-4xl font-black tracking-tight text-white">R$ 5.840</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/12 px-3 py-1.5 text-xs font-black text-emerald-300">
                      +18% vs mês
                    </span>
                  </div>

                  <div className="mt-6 space-y-3.5">
                    {[
                      {
                        label: 'Entradas',
                        value: 'R$ 8.400',
                        width: '100%',
                        bar: 'bg-emerald-400',
                      },
                      {
                        label: 'Despesas',
                        value: 'R$ 2.100',
                        width: '25%',
                        bar: 'bg-neutral-400',
                      },
                      {
                        label: 'Fiado a receber',
                        value: 'R$ 460',
                        width: '12%',
                        bar: 'bg-amber-300',
                      },
                    ].map(row => (
                      <div key={row.label}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-neutral-300">{row.label}</p>
                          <p className="text-sm font-black text-white">{row.value}</p>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
                          <div
                            className={`h-full rounded-full ${row.bar}`}
                            style={{ width: row.width }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {[
                      {
                        initials: 'JC',
                        name: 'João · fiado parcial',
                        meta: 'Restam R$ 80 · venc. 12/08',
                        badge: 'Pendente',
                        active: true,
                      },
                      {
                        initials: 'MR',
                        name: 'Maria · aluguel',
                        meta: 'Despesa fixa · dia 05',
                        badge: 'Pago',
                        active: false,
                      },
                      {
                        initials: 'PX',
                        name: 'Produtos · semana',
                        meta: 'Shampoo + tip · R$ 210',
                        badge: 'Custo',
                        active: false,
                      },
                    ].map(row => (
                      <div
                        key={row.name}
                        className={`flex items-center gap-3 rounded-2xl border p-3.5 ${
                          row.active
                            ? 'border-amber-300/20 bg-amber-300/8'
                            : 'border-white/6 bg-white/3'
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                            row.active
                              ? 'bg-amber-300/15 text-amber-100'
                              : 'bg-white/8 text-neutral-300'
                          }`}
                        >
                          {row.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{row.name}</p>
                          <p className="text-xs text-neutral-500">{row.meta}</p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                            row.active
                              ? 'bg-black/30 text-amber-200'
                              : 'bg-white/6 text-neutral-400'
                          }`}
                        >
                          {row.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              {/* Sessão 4 — Papéis */}
              <article
                data-reveal
                data-roles-card
                className="grid items-start gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                    Quem vê o quê
                  </p>
                  <h3 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
                    Funcionário opera. Dono decide.
                  </h3>
                  <p className="mt-6 max-w-md text-lg font-medium leading-relaxed text-neutral-400">
                    O login define a tela: a equipe opera fila, agenda e serviços; o dono cuida de
                    caixa, relatórios e assinatura.
                  </p>
                  <p className="mt-4 text-sm font-semibold text-neutral-500">
                    Sem cobrança por pessoa — chama a equipe toda.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div
                      data-role-panel
                      className="rounded-[1.5rem] border border-emerald-400/25 bg-[#0d110e] p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-sm font-black text-black">
                          MO
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">Marina Oliveira</p>
                          <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
                            Dono
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-black text-emerald-300">
                          Online
                        </span>
                      </div>
                      <ul className="mt-5 space-y-2.5">
                        {[
                          'Serviços e equipe',
                          'Financeiro e fiado',
                          'Relatórios Pro',
                          'Assinatura',
                        ].map(item => (
                          <li
                            key={item}
                            className="flex items-center gap-2.5 text-sm font-semibold text-neutral-200"
                          >
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      data-role-panel
                      className="rounded-[1.5rem] border border-white/8 bg-[#0d110e] p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-sm font-black text-white">
                          RC
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">Rafael Costa</p>
                          <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
                            Funcionário
                          </p>
                        </div>
                        <span className="rounded-full bg-white/8 px-2 py-1 text-[10px] font-black text-neutral-400">
                          Na fila
                        </span>
                      </div>
                      <ul className="mt-5 space-y-2.5">
                        {[
                          { label: 'Fila do dia', ok: true },
                          { label: 'Agenda e check-in', ok: true },
                          { label: 'Serviços prestados', ok: true },
                          { label: 'Financeiro / planos', ok: false },
                        ].map(item => (
                          <li
                            key={item.label}
                            className={`flex items-center gap-2.5 text-sm font-semibold ${
                              item.ok ? 'text-neutral-200' : 'text-neutral-600'
                            }`}
                          >
                            <CheckCircle2
                              className={`h-4 w-4 shrink-0 ${
                                item.ok ? 'text-emerald-400' : 'text-neutral-700'
                              }`}
                            />
                            {item.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div
                    data-role-panel
                    className="rounded-[1.5rem] border border-white/8 bg-[#0d110e] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-wider text-neutral-500">
                        Agora no painel
                      </p>
                      <span className="text-[10px] font-bold text-emerald-300">ao vivo</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        {
                          who: 'Rafael',
                          action: 'chamou Ana · cadeira 1',
                          time: 'agora',
                        },
                        {
                          who: 'Lia',
                          action: 'confirmou 15:30 · Marina',
                          time: '2 min',
                        },
                        {
                          who: 'Marina',
                          action: 'abriu resumo do caixa',
                          time: '8 min',
                        },
                      ].map(row => (
                        <div
                          key={row.action}
                          className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-3 py-2.5"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                          <p className="min-w-0 flex-1 truncate text-sm text-neutral-300">
                            <span className="font-bold text-white">{row.who}</span>
                            {' · '}
                            {row.action}
                          </p>
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                            {row.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="relative z-10 border-y border-white/5 bg-[#080a09] px-6 py-24 md:py-32 lg:px-10 xl:px-12">
          <div className="mx-auto grid max-w-375 gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16 xl:gap-20">
            <div data-reveal className="lg:sticky lg:top-32 lg:self-start">
              <span className="text-xs font-black uppercase tracking-[0.28em] text-emerald-400">
                Como funciona
              </span>
              <h2 className="mt-5 max-w-lg text-4xl font-black tracking-[-0.05em] text-white md:text-5xl xl:text-6xl">
                Três passos. Um dia mais leve.
              </h2>
              <p className="mt-6 max-w-md text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                Da chegada ao resultado, cada pessoa vê apenas o que precisa — sem complicar a
                operação.
              </p>
              <button
                type="button"
                onClick={() => navigate('/funcionalidades')}
                className="group mt-8 inline-flex items-center gap-3 text-sm font-bold text-white"
              >
                Explorar funcionalidades
                <ArrowRight className="h-4 w-4 text-emerald-400 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div data-stack className="relative space-y-5 md:space-y-6 md:pl-8">
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-3 left-[0.4rem] top-3 hidden w-px bg-white/10 md:block"
              >
                <div
                  data-stack-progress
                  className="h-full w-full origin-top scale-y-0 bg-linear-to-b from-emerald-400 via-cyan-400 to-amber-300"
                />
              </div>

              {processSteps.map(step => {
                const Icon = step.icon;
                const accent = stepAccent[step.accent];
                return (
                  <div key={step.number} data-stack-item className="relative">
                    <span
                      data-stack-dot
                      aria-hidden
                      className={`absolute left-0 top-8 hidden h-2.5 w-2.5 -translate-x-[0.2rem] rounded-full ring-4 ring-[#080a09] md:block ${accent.bar}`}
                    />
                    <article
                      data-stack-card
                      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101412] p-6 sm:p-7 md:p-8"
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent ${accent.line} to-transparent`}
                      />
                      <div
                        aria-hidden
                        className={`pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full ${accent.glow} blur-[60px]`}
                      />

                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.glow} ${accent.meta}`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p
                                className={`text-[10px] font-medium uppercase tracking-[0.2em] ${accent.meta}`}
                              >
                                {step.meta}
                              </p>
                              <h3 className="mt-1 text-2xl font-black tracking-tight text-white md:text-[1.75rem]">
                                {step.title}
                              </h3>
                            </div>
                          </div>
                          <span
                            data-stack-num
                            className={`shrink-0 pt-0.5 text-3xl font-black tabular-nums leading-none tracking-tight md:text-4xl ${accent.num}`}
                          >
                            {step.number}
                          </span>
                        </div>
                        <p className="text-[15px] font-light leading-relaxed text-neutral-400 md:text-base">
                          {step.copy}
                        </p>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="tecnologia"
          className="relative z-20 scroll-mt-20 bg-[#050706] px-6 py-28 md:rounded-t-[2.75rem] md:py-40 md:shadow-[0_-30px_80px_rgba(0,0,0,0.4)]"
        >
          <div
            data-reveal
            className="relative mx-auto max-w-375 overflow-hidden rounded-[2.75rem] bg-[#ecfdf5] text-[#07110b] md:rounded-[4rem]"
          >
            <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-emerald-300/60 blur-[110px]" />
            <div className="absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-cyan-200/55 blur-[120px]" />

            <div className="relative z-10 grid gap-14 p-8 md:p-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-24">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-800/70">
                  Dados com contexto
                </p>
                <h2 className="mt-8 text-5xl font-black leading-[1.08] tracking-[-0.045em] md:text-6xl xl:text-7xl">
                  Decisões com contexto, não achismo.
                </h2>
                <p className="mt-8 max-w-2xl text-xl font-medium leading-relaxed text-emerald-950/75 md:text-2xl">
                  Acompanhe movimento, tempo de espera e resultado financeiro. A AgendAI transforma
                  a rotina do estabelecimento em uma visão simples para agir.
                </p>

                <div className="mt-10 space-y-5">
                  {[
                    'Estimativas baseadas no movimento real da fila',
                    'Indicadores de atendimento e faturamento no Pro',
                    'Visão centralizada para reduzir decisões no escuro',
                  ].map(item => (
                    <div
                      key={item}
                      className="flex items-start gap-4 text-lg font-semibold text-emerald-950 md:text-xl"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#07110b]">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="rounded-4xl border border-emerald-950/10 bg-white/75 p-6 shadow-[0_30px_80px_rgba(6,78,59,0.12)] backdrop-blur-xl md:p-9">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-800/65">
                        Movimento semanal
                      </p>
                      <p className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
                        128 atendimentos
                      </p>
                      <p className="mt-2 text-base text-emerald-950/55 md:text-lg">
                        Visão ilustrativa do dashboard Pro
                      </p>
                    </div>
                    <p className="shrink-0 pb-1 text-right text-sm font-semibold tabular-nums text-emerald-700">
                      +12%
                      <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-950/45">
                        vs. semana
                      </span>
                    </p>
                  </div>

                  <div className="relative mt-10 h-56">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[0, 1, 2, 3, 4].map(line => (
                        <div key={line} className="h-px w-full bg-emerald-950/10" />
                      ))}
                    </div>
                    <svg
                      className="absolute inset-0 h-full w-full overflow-visible"
                      viewBox="0 0 520 220"
                      preserveAspectRatio="none"
                      aria-label="Gráfico ilustrativo de movimento semanal"
                    >
                      <defs>
                        <linearGradient id="landingChartFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,190 C45,170 68,138 105,150 C145,163 166,104 210,118 C252,131 270,72 315,91 C359,109 378,42 420,63 C461,84 484,38 520,28 L520,220 L0,220 Z"
                        fill="url(#landingChartFill)"
                      />
                      <path
                        data-insight-line
                        d="M0,190 C45,170 68,138 105,150 C145,163 166,104 210,118 C252,131 270,72 315,91 C359,109 378,42 420,63 C461,84 484,38 520,28"
                        fill="none"
                        stroke="#059669"
                        strokeLinecap="round"
                        strokeWidth="5"
                      />
                    </svg>
                    <div className="absolute -bottom-8 flex w-full justify-between text-xs font-black uppercase tracking-widest text-emerald-950/45">
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-14 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-emerald-950/5 p-5">
                      <p className="text-xs font-black uppercase tracking-widest text-emerald-950/50 md:text-sm">
                        Pico de movimento
                      </p>
                      <p className="mt-2 text-2xl font-black md:text-3xl">Sábado · 11h</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-950/5 p-5">
                      <p className="text-xs font-black uppercase tracking-widest text-emerald-950/50 md:text-sm">
                        Espera média
                      </p>
                      <p className="mt-2 text-2xl font-black md:text-3xl">18 minutos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-white/8 bg-[#080a09] px-6 py-24 md:px-10 md:py-32 xl:px-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/40 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-2/3 -translate-x-1/2 rounded-full bg-emerald-500/6 blur-[120px]" />

          <div className="relative z-10 mx-auto max-w-375">
            <div data-reveal className="mb-14 max-w-3xl md:mb-20">
              <span className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
                Por que começar agora
              </span>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] text-white md:text-6xl xl:text-7xl">
                Números que removem a desculpa.
              </h2>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-neutral-400 md:text-xl">
                Trial completo, agenda o dia inteiro, anual com desconto real e entrada acessível.
                Sem cartão na porta — e sem surpresa na saída.
              </p>
            </div>

            <div
              data-stagger-group
              className="grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:pt-0"
            >
              {[
                {
                  value: 30,
                  suffix: '',
                  unit: 'dias',
                  title: 'de Pro no trial',
                  detail:
                    'Qualquer plano começa com Pro completo. Experimente e veja se faz sentido para o seu negócio.',
                  featured: true,
                },
                {
                  value: 24,
                  suffix: '',
                  unit: 'horas',
                  title: 'de agenda aberta',
                  detail: 'Cliente marca sozinho — você para de atender “tem vaga?”.',
                },
                {
                  value: 2,
                  suffix: '',
                  unit: 'meses',
                  title: 'grátis no anual',
                  detail: 'Pague 10 meses, use o ano inteiro. Economia clara.',
                },
                {
                  value: 14,
                  prefix: 'R$ ',
                  suffix: '',
                  unit: '/mês',
                  title: 'pra entrar',
                  detail: 'Essencial com fila, agenda e equipe — sem taxa por cadeira.',
                },
              ].map(fact => (
                <div
                  key={fact.title}
                  data-stagger-item
                  className={`relative flex flex-col border-white/10 lg:border-r lg:px-8 lg:py-12 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0 ${
                    fact.featured ? 'lg:bg-white/[0.015]' : ''
                  }`}
                >
                  {fact.featured && (
                    <span className="mb-4 inline-flex w-fit rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                      Mais pedido
                    </span>
                  )}
                  <div className="flex items-end gap-2.5">
                    <p
                      data-count={fact.value}
                      data-prefix={fact.prefix}
                      data-suffix={fact.suffix}
                      className={`font-black tracking-[-0.06em] text-white ${
                        fact.featured
                          ? 'text-6xl md:text-7xl xl:text-8xl'
                          : 'text-5xl md:text-6xl xl:text-7xl'
                      }`}
                    >
                      {fact.prefix ?? ''}0{fact.suffix ?? ''}
                    </p>
                    <span className="mb-2 text-base font-bold text-emerald-300/90 md:mb-3 md:text-lg">
                      {fact.unit}
                    </span>
                  </div>
                  <p className="mt-4 text-xl font-black tracking-tight text-white md:text-2xl">
                    {fact.title}
                  </p>
                  <p className="mt-3 max-w-xs text-sm font-medium leading-relaxed text-neutral-400 md:text-base">
                    {fact.detail}
                  </p>
                </div>
              ))}
            </div>

            <div
              data-reveal
              className="mt-12 overflow-hidden rounded-[1.75rem] border border-emerald-400/20 bg-linear-to-r from-emerald-400/[0.09] via-white/[0.03] to-transparent p-5 sm:p-6 md:p-8"
            >
              <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-4">
                  <p className="text-xl font-black tracking-tight text-white sm:text-2xl md:text-3xl">
                    Teste o Pro grátis por 30 dias.
                  </p>
                  <p className="text-sm font-medium leading-relaxed text-neutral-400 sm:text-base md:text-lg">
                    {trialCampaign.body} {trialCampaign.afterTrial}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Sem cartão', 'Cancele quando quiser', 'Equipe ilimitada'].map(item => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold text-neutral-300 sm:px-3.5 sm:py-1.5 sm:text-sm"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 sm:h-3.5 sm:w-3.5" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-52">
                  <button
                    type="button"
                    data-sticky-cta-anchor
                    onClick={() => navigate('/login')}
                    className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-sm font-black text-black transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300 sm:px-7 sm:py-4 sm:text-base"
                  >
                    {trialCampaign.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    type="button"
                    onClick={event => scrollToSection(event, 'precos')}
                    className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/3 px-6 py-3 text-xs font-bold text-neutral-400 transition hover:bg-white/8 hover:text-white sm:px-7 sm:py-3.5 sm:text-sm"
                  >
                    Ver planos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="precos" className="relative scroll-mt-16 px-6 py-28 md:py-40">
          <div className="absolute left-1/2 top-0 h-80 w-3/4 -translate-x-1/2 rounded-full bg-emerald-500/6 blur-[130px]" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <div data-reveal className="mx-auto mb-12 max-w-3xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">
                Preço simples
              </span>
              <h2 className="mt-5 text-5xl font-black tracking-[-0.055em] text-white md:text-7xl">
                Escolha o quanto quer enxergar.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-neutral-400">
                {trialCampaign.body} {trialCampaign.afterTrial} A diferença depois é só R$ 6 por
                mês.
              </p>
            </div>

            <p
              data-reveal
              className="mx-auto mb-10 max-w-xl text-center text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-400/85"
            >
              {trialCampaign.eyebrow}
            </p>

            <div data-stagger-group className="grid items-stretch gap-5 lg:grid-cols-2 lg:gap-6">
              {/* Essencial */}
              <article
                data-stagger-item
                className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0c100e] p-8 transition duration-500 hover:border-white/18 md:p-9"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.04),_transparent_55%)]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-[#050706] via-[#050706]/70 to-transparent" />

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">
                      Operação
                    </p>
                    <h3 className="mt-2 text-3xl font-black tracking-tight text-white">
                      Essencial
                    </h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    R$ 14
                  </span>
                </div>

                <div className="relative z-10 mt-8">
                  <div className="flex items-end gap-2">
                    <span className="mb-2 text-base font-bold text-neutral-500">R$</span>
                    <span className="text-6xl font-black tracking-[-0.06em] text-white md:text-7xl">
                      14
                    </span>
                    <span className="mb-3 text-sm text-neutral-500">/mês</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-neutral-400">
                    Anual R$ 140 · 2 meses grátis
                  </p>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-neutral-500">
                    Fila, agenda e equipe ilimitada — o salão rodando sem taxa por cadeira.
                  </p>
                </div>

                <div className="relative z-10 mt-6 rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                  <p className="text-sm font-bold text-neutral-100">{trialCampaign.planIncluded}</p>
                  <p className="mt-1 text-xs font-medium text-neutral-400">
                    {trialCampaign.afterTrialThenEssential}
                  </p>
                </div>

                <ul className="relative z-10 mt-8 flex-1 space-y-3.5">
                  {planFeatures.essential.map(feature => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm font-medium text-neutral-300"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-neutral-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => navigate('/planos')}
                  className="group/btn relative z-10 mt-9 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-4 text-sm font-black text-white transition hover:border-white/25 hover:bg-white/10"
                >
                  {trialCampaign.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </article>

              {/* Pro */}
              <article
                data-stagger-item
                className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-emerald-400/40 bg-[#08140f] p-8 shadow-[0_0_90px_rgba(52,211,153,0.14)] transition duration-500 hover:border-emerald-400/60 hover:shadow-[0_0_110px_rgba(52,211,153,0.22)] md:p-9 lg:-translate-y-1"
              >
                <div className="pointer-events-none absolute -inset-px rounded-[1.75rem] bg-linear-to-br from-emerald-400/25 via-transparent to-cyan-400/15 opacity-80" />
                <div className="pointer-events-none absolute inset-[1px] rounded-[1.7rem] bg-[#08140f]" />
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/18 blur-[90px] transition duration-700 group-hover:bg-emerald-400/28" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#04100a] via-[#04100a]/75 to-transparent" />
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition duration-700 ease-out group-hover:translate-x-full" />

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400/90">
                      Visão de dono
                    </p>
                    <h3 className="mt-2 text-3xl font-black tracking-tight text-white">Pro</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-black">
                    <Zap className="h-3 w-3" />
                    Recomendado
                  </span>
                </div>

                <div className="relative z-10 mt-8">
                  <div className="flex items-end gap-2">
                    <span className="mb-2 text-base font-bold text-emerald-400">R$</span>
                    <span className="text-6xl font-black tracking-[-0.06em] text-white md:text-7xl">
                      20
                    </span>
                    <span className="mb-3 text-sm text-neutral-400">/mês</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-emerald-300">
                    Anual R$ 200 · economize R$ 40
                  </p>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-neutral-300">
                    Tudo do Essencial + dashboard, financeiro, fiado e insights. R$ 6 a mais que o
                    Essencial.
                  </p>
                </div>

                <div className="relative z-10 mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/8 px-4 py-3">
                  <p className="text-sm font-bold text-emerald-100">{trialCampaign.planIncluded}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-200/70">
                    {trialCampaign.afterTrialThenPro}
                  </p>
                </div>

                <ul className="relative z-10 mt-7 flex-1 space-y-3.5">
                  {planFeatures.pro.map(feature => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm font-medium text-neutral-100"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="group/btn relative z-10 mt-9 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-4 text-sm font-black text-black shadow-[0_16px_50px_rgba(52,211,153,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300"
                >
                  {trialCampaign.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </article>
            </div>

            <div data-reveal className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { label: '1 corte', detail: 'paga o mês do plano' },
                { label: 'Equipe ∞', detail: 'sem taxa por pessoa' },
                { label: 'Anual', detail: '2 meses de graça' },
              ].map(item => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/8 bg-white/3 px-5 py-4 text-center"
                >
                  <p className="text-sm font-black text-white">{item.label}</p>
                  <p className="mt-1 text-xs font-medium text-neutral-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section data-sticky-cta-end className="px-6 pb-32 pt-12 md:pb-44">
          <div
            data-reveal
            className="relative mx-auto max-w-375 overflow-hidden rounded-[2.75rem] border border-emerald-400/15 bg-[#0d1510] px-7 py-20 text-center md:rounded-[4rem] md:px-16 md:py-28"
          >
            <div className="absolute left-1/2 top-0 h-80 w-2/3 -translate-x-1/2 rounded-full bg-emerald-400/13 blur-[100px]" />
            <div
              className="absolute inset-0 opacity-[0.045]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)',
                backgroundSize: '46px 46px',
                maskImage: 'radial-gradient(circle at center, black, transparent 72%)',
              }}
            />
            <div className="relative z-10 mx-auto max-w-4xl space-y-6 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300/80">
                {trialCampaign.eyebrow}
              </p>
              <h2 className="text-4xl font-black leading-[1.08] tracking-[-0.05em] text-white sm:text-5xl md:text-7xl xl:text-8xl">
                Teste o Pro grátis por 30 dias.
              </h2>
              <p className="mx-auto max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:text-lg md:text-xl sm:mx-0">
                {trialCampaign.body} {trialCampaign.afterTrial}
              </p>
              <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row sm:justify-start sm:gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-black text-black transition duration-300 hover:-translate-y-1 hover:bg-emerald-300 sm:px-8 sm:py-4"
                >
                  {trialCampaign.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate('/contato')}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/4 px-7 py-3.5 text-sm font-bold text-neutral-400 transition hover:bg-white/8 hover:text-white sm:px-8"
                >
                  Tirar uma dúvida
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />

      <div
        data-sticky-cta
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:justify-end md:px-8 md:pb-6"
        aria-hidden="true"
      >
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-black text-black shadow-[0_16px_50px_rgba(16,185,129,0.45)] ring-1 ring-white/20 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300 md:px-7 md:py-4 md:text-base"
        >
          {trialCampaign.cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
