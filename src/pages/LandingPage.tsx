/* eslint-disable jsx-a11y/media-has-caption -- vídeo demonstrativo pode ser fornecido sem faixa de áudio */
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  PlayCircle,
  Smartphone,
  SquareDashedBottomCode,
  Users,
} from 'lucide-react';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PwaInstallCard } from '../components/pwa/PwaInstallCard';
import { trialCampaign } from '../marketing/trialCampaign';

const screenshots = [
  {
    src: '/screenshots/queue-real.png',
    alt: 'Tela real da fila digital do AgendAI',
    title: 'Fila digital real',
    caption: 'Uma foto fiel da fila em operação, sem mock de marketing.',
  },
  {
    src: '/screenshots/appointments-real.png',
    alt: 'Tela real da agenda do AgendAI',
    title: 'Agenda real',
    caption: 'A agenda do salão com visão clara para equipe e dono.',
  },
  {
    src: '/screenshots/reports-real.png',
    alt: 'Tela real dos relatórios do AgendAI',
    title: 'Relatórios reais',
    caption: 'Dados de operação e performance em uma tela simples.',
  },
];

const highlights = [
  'Fila digital sem atrito',
  'Agenda e equipe no mobile',
  'Pro por 30 dias sem cartão',
  'PWA pronto para instalar',
] as const;

const pricing = [
  {
    name: 'Essencial',
    price: 'R$ 14',
    cycle: '/mês',
    annual: 'R$ 140 / ano',
    description: 'Para operar fila, agenda, equipe e presença digital.',
    features: ['Funcionários ilimitados', 'Fila digital', 'Agenda online', 'Suporte por e-mail'],
    cta: 'Criar conta grátis',
    href: '/cadastro',
    featured: false,
  },
  {
    name: 'Pro',
    price: 'R$ 20',
    cycle: '/mês',
    annual: 'R$ 200 / ano',
    description: 'Para quem quer dashboard, financeiro e visão de dono.',
    features: ['Tudo do Essencial', 'Dashboard', 'Financeiro', 'Insights e relatórios'],
    cta: 'Criar conta grátis',
    href: '/cadastro',
    featured: true,
  },
] as const;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeShot, setActiveShot] = useState(0);
  const productVideoUrl = import.meta.env.VITE_PRODUCT_TOUR_VIDEO_URL as string | undefined;

  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  const activeScreenshot = useMemo(() => screenshots[activeShot] ?? screenshots[0], [activeShot]);

  const openHref = (href: string) => {
    navigate(href);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg text-neutral-100">
      <MarketingNav />

      <main>
        <section className="px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-accent">
                {trialCampaign.heroSubline}
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.06em] sm:text-5xl lg:text-7xl">
                  Seu salão mais organizado, no celular e sem enrolação.
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">
                  Fila, agenda, clientes e financeiro em uma experiência mobile-first. O plano
                  começa com 30 dias de Pro completo, sem cartão.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openHref('/cadastro')}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-black text-black transition hover:bg-accent-hover"
                >
                  {trialCampaign.cta}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openHref('/login')}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Entrar
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {highlights.map(item => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-neutral-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Smartphone className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm font-bold">First mobile</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                    Interface pensada para uso rápido no celular.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Users className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm font-bold">Equipe e fila</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                    Operação clara para equipe, dono e cliente.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <CalendarDays className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm font-bold">30 dias de Pro</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                    Sem cartão. Cobrança só se você continuar depois.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c100e] shadow-[0_28px_100px_rgba(0,0,0,0.45)]">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
                    Prints reais da operação
                  </p>
                </div>
                <img
                  src={activeScreenshot.src}
                  alt={activeScreenshot.alt}
                  className="aspect-[16/11] w-full object-cover"
                  loading="eager"
                />
                <div className="space-y-2 px-4 py-4">
                  <p className="text-sm font-bold">{activeScreenshot.title}</p>
                  <p className="text-sm leading-relaxed text-neutral-400">{activeScreenshot.caption}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {screenshots.map((shot, index) => (
                  <button
                    key={shot.src}
                    type="button"
                    onClick={() => setActiveShot(index)}
                    className={`overflow-hidden rounded-2xl border text-left transition ${
                      activeShot === index
                        ? 'border-accent bg-accent/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <img
                      src={shot.src}
                      alt={shot.alt}
                      className="aspect-[16/11] w-full object-cover"
                      loading="lazy"
                    />
                    <span className="block px-3 py-2 text-[11px] font-bold">{shot.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
                O que mostrar primeiro
              </p>
              <h2 className="text-3xl font-black tracking-[-0.05em] sm:text-4xl">
                Mostre o produto antes de prometer mais texto.
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-neutral-300 sm:text-base">
                A landing ficou menor de propósito: o usuário vê o funcionamento, entende o
                valor e só depois escava detalhes.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => openHref('/funcionalidades')}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Ver funcionalidades
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <SquareDashedBottomCode className="h-5 w-5 text-accent" />
                <p className="mt-3 text-sm font-bold">Login e cadastro separados</p>
                <p className="mt-1 text-sm text-neutral-400">
                  O acesso agora aponta claramente para criar conta ou entrar.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <PlayCircle className="h-5 w-5 text-accent" />
                <p className="mt-3 text-sm font-bold">Vídeo do produto</p>
                <p className="mt-1 text-sm text-neutral-400">
                  O melhor lugar é aqui, antes do pricing, para explicar em 30-45s.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
                <p className="text-sm font-bold">Uso recomendado</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                  Landing: vídeo curto de demonstração. Após entrar na plataforma: tutorial de
                  onboarding e instalação do PWA.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="video" className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
                  VÃ­deo do produto
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
                  Mostre a plataforma em movimento.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                  Aqui entra o vÃ­deo principal da landing. Se ele nÃ£o existir ainda, a tela cai
                  para um poster com o print real da operaÃ§Ã£o.
                </p>
                <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/30 p-3">
                  {productVideoUrl ? (
                    <video
                      className="aspect-video w-full rounded-[1.2rem] bg-black object-cover"
                      controls
                      playsInline
                      preload="metadata"
                      poster="/screenshots/queue-real.png"
                      src={productVideoUrl}
                    >
                      Seu navegador nao reproduz este video.
                    </video>
                  ) : (
                    <img
                      src="/screenshots/queue-real.png"
                      alt="Preview do produto com fila real"
                      className="aspect-video w-full rounded-[1.2rem] object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <PwaInstallCard
                  variant="marketing"
                  videoUrl={import.meta.env.VITE_PWA_INSTALL_VIDEO_URL as string | undefined}
                />
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-300">
              <p className="font-bold text-white">Seção de vídeo pronta</p>
              <p className="mt-1 leading-relaxed">
                Se você me mandar o arquivo do vídeo, eu plugo nessa área sem mudar o restante da
                landing.
              </p>
            </div>
          </div>
        </section>

        <section id="instalar" className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 max-w-2xl space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">PWA</p>
              <h2 className="text-3xl font-black tracking-[-0.05em] sm:text-4xl">
                Primeiro o mobile. Depois o resto.
              </h2>
              <p className="text-sm leading-relaxed text-neutral-300 sm:text-base">
                A instalação no aparelho precisa ser óbvia, curta e repetida nos lugares certos.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
              <PwaInstallCard variant="marketing" />
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-bold text-white">Foco do PWA</p>
                <ul className="mt-4 space-y-3 text-sm text-neutral-300">
                  <li>• Manifesto, ícones e prompt de instalação ativos.</li>
                  <li>• Safe areas e toque grande em telas pequenas.</li>
                  <li>• App shell rápido e leitura fácil no celular.</li>
                  <li>• Vídeo de instalação depois do login, não no lugar do produto.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="precos" className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Preço</p>
              <h2 className="text-3xl font-black tracking-[-0.05em] sm:text-4xl">
                Um trial longo, sem exagerar no texto.
              </h2>
              <p className="text-sm leading-relaxed text-neutral-300 sm:text-base">
                {trialCampaign.body} {trialCampaign.afterTrial}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {pricing.map(plan => (
                <article
                  key={plan.name}
                  className={`rounded-[2rem] border p-6 ${
                    plan.featured
                      ? 'border-accent/40 bg-accent/10 shadow-[0_18px_70px_rgba(16,185,129,0.15)]'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent/80">
                        {plan.featured ? 'Recomendado' : 'Operacao'}
                      </p>
                      <h3 className="mt-2 text-2xl font-black">{plan.name}</h3>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold">
                      {plan.annual}
                    </span>
                  </div>

                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-4xl font-black sm:text-5xl">{plan.price}</span>
                    <span className="pb-1 text-sm text-neutral-400">{plan.cycle}</span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-neutral-300">{plan.description}</p>

                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-neutral-200">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => openHref(plan.href)}
                    className={`mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition ${
                      plan.featured
                        ? 'bg-accent text-black hover:bg-accent-hover'
                        : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-bold text-white">Como eu decidi a colocacao do video</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                Landing: demonstração curta do produto e prints reais. Tutorial: depois do login,
                para ensinar instalação do PWA e o uso inicial. Isso reduz scroll e não compete
                com a conversão.
              </p>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
};

export default LandingPage;
