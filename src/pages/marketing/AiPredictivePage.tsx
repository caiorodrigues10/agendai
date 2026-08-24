import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sparkles,
  ArrowRight,
  Gauge,
  AlertTriangle,
  Bot,
  LineChart,
  Clock,
  Users,
  TrendingUp,
  MessageCircleWarning,
  CalendarCheck,
  BarChart3,
  Zap,
  Target,
  Repeat,
  TrendingDown,
  Lightbulb,
  Activity,
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';

gsap.registerPlugin(ScrollTrigger);

const PhoneMockup = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto w-[280px] h-[560px] rounded-[3rem] border-[3px] border-neutral-700 bg-neutral-950 shadow-[0_0_80px_rgba(16,185,129,0.2)] overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-950 rounded-b-2xl z-20" />
    <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 pt-10">
      {children}
    </div>
  </div>
);

const PredictionPhone = () => {
  const [active, setActive] = useState(0);
  const predictions = [
    { client: 'Lucas S.', risk: 'Alto', reason: 'Cancelou 2x nos últimos 30 dias', color: 'red' },
    { client: 'Pedro M.', risk: 'Baixo', reason: 'Fiel, nunca faltou', color: 'emerald' },
    { client: 'Rafael A.', risk: 'Médio', reason: 'Reagendou ontem, pode desistir', color: 'amber' },
  ];

  return (
    <PhoneMockup>
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-white tracking-wide">IA PREDITIVA</div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-bold">Ativo</span>
          </div>
        </div>
        {predictions.map((p, i) => (
          <div
            key={p.client}
            onClick={() => setActive(i)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              active === i
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-white/5 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-white">{p.client}</div>
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                p.color === 'red' ? 'bg-red-500/20 text-red-400' :
                p.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {p.risk}
              </div>
            </div>
            <div className="text-[10px] text-neutral-500">{p.reason}</div>
            {active === i && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] text-neutral-300">
                    {p.color === 'red' ? 'Enviar WhatsApp reengajamento' :
                     p.color === 'amber' ? 'Confirmar agendamento amanhã' :
                     'Não precisa de ação'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
        <div className="mt-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Previsão da semana</span>
          </div>
          <div className="text-[10px] text-neutral-400">2 cancelamentos prováveis · 1 cliente pode voltar</div>
        </div>
      </div>
    </PhoneMockup>
  );
};

const WaitTimePhone = () => {
  const bars = [
    { client: 'Lucas', min: 25, pct: 100, color: 'bg-emerald-500' },
    { client: 'Pedro', min: 15, pct: 60, color: 'bg-teal-500' },
    { client: 'Rafael', min: 10, pct: 40, color: 'bg-cyan-500' },
  ];

  return (
    <PhoneMockup>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-white tracking-wide">TEMPO ESTIMADO</div>
          <Gauge className="w-4 h-4 text-emerald-400" />
        </div>
        {bars.map((bar) => (
          <div key={bar.client} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-300 font-semibold">{bar.client}</span>
              <span className="text-[10px] text-emerald-400 font-bold">{bar.min} min</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${bar.pct}%` }} />
            </div>
          </div>
        ))}
        <div className="mt-4 p-3 rounded-xl bg-teal-500/5 border border-teal-500/20">
          <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">Precisão</div>
          <div className="text-2xl font-black text-white">92%</div>
          <div className="text-[10px] text-neutral-500">baseado no histórico real</div>
        </div>
      </div>
    </PhoneMockup>
  );
};

const RevenuePhone = () => {
  const insights = [
    { text: 'Sábados faturam 40% mais', icon: TrendingUp, color: 'emerald' },
    { text: 'Barba é o serviço mais lucrativo', icon: BarChart3, color: 'cyan' },
    { text: 'Horário das 14h-16h está ocioso', icon: Clock, color: 'amber' },
  ];

  return (
    <PhoneMockup>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-white tracking-wide">INSIGHTS DE IA</div>
          <Sparkles className="w-4 h-4 text-violet-400" />
        </div>
        {insights.map((insight, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <insight.icon className={`w-3 h-3 text-${insight.color}-400`} />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Insight #{i + 1}</span>
            </div>
            <div className="text-xs text-neutral-300">{insight.text}</div>
          </div>
        ))}
        <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
          <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1">Ação sugerida</div>
          <div className="text-[10px] text-neutral-300">Criar promoção de barba nas terças-feiras (dia mais fraco)</div>
        </div>
      </div>
    </PhoneMockup>
  );
};

const EngagementPhone = () => {
  const messages = [
    { time: 'Ontem 19:00', msg: 'Oi Lucas! Tudo bem? Seu agendamento é amanhã às 14:00. Confirma? ✅', from: 'bot' },
    { time: 'Ontem 19:02', msg: 'Confirmado! Até amanhã.', from: 'user' },
    { time: 'Hoje 12:00', msg: 'Falta 2h! Te esperamos no Barbearia Central 💈', from: 'bot' },
  ];

  return (
    <PhoneMockup>
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-white tracking-wide">REENGAJAMENTO</div>
          <Bot className="w-4 h-4 text-violet-400" />
        </div>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2.5 rounded-xl text-[10px] max-w-[85%] ${
              msg.from === 'bot'
                ? 'bg-violet-500/10 border border-violet-500/20 text-neutral-300 mr-auto'
                : 'bg-blue-500/20 border border-blue-500/20 text-white ml-auto'
            }`}
          >
            <div>{msg.msg}</div>
            <div className="text-[9px] text-neutral-600 mt-1">{msg.time}</div>
          </div>
        ))}
        <div className="mt-2 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
          <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1">Horário otimizado</div>
          <div className="text-[10px] text-neutral-400">Enviado às 19:00 (horário que Lucas costuma responder)</div>
        </div>
      </div>
    </PhoneMockup>
  );
};

export const AiPredictivePage: React.FC = () => {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.hero-badge', { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 })
        .fromTo('.hero-title', { opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 1 }, '-=0.3')
        .fromTo('.hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
        .fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

      // Phone parallax on hero
      gsap.fromTo('.hero-phone', { opacity: 0, y: 80, rotationY: -15, scale: 0.9 }, {
        opacity: 1, y: 0, rotationY: 0, scale: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.hero-phone', start: 'top 95%' },
      });

      // Floating animation for hero phone
      gsap.to('.hero-phone', {
        y: -15, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true,
      });

      // Feature sections
      const featureSections = gsap.utils.toArray<HTMLElement>('.feature-block');
      featureSections.forEach((section, i) => {
        const text = section.querySelector('.feature-text');
        const visual = section.querySelector('.feature-visual');
        const badge = section.querySelector('.feature-badge');
        const title = section.querySelector('.feature-title');
        const bullets = section.querySelectorAll('.bullet-item');

        const stl = gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top 75%' },
        });

        if (badge) stl.fromTo(badge, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' });
        if (title) stl.fromTo(title, { opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'power4.out' }, '-=0.3');
        if (text) stl.fromTo(text.querySelectorAll('.section-subtitle, .section-desc'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');
        bullets.forEach((b) => {
          stl.fromTo(b.children, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.1 }, '-=0.2');
        });

        if (visual) {
          gsap.fromTo(visual, { opacity: 0, x: i % 2 === 0 ? 60 : -60, rotationY: i % 2 === 0 ? 8 : -8, scale: 0.95 }, {
            opacity: 1, x: 0, rotationY: 0, scale: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: section, start: 'top 75%' },
          });
        }
      });

      // Phone mockups float
      gsap.utils.toArray<HTMLElement>('.phone-float').forEach((el) => {
        gsap.to(el, {
          y: -12, duration: 2.5 + Math.random() * 1, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: Math.random() * 2,
        });
      });

      // How it works steps
      gsap.fromTo('.step-card', { opacity: 0, y: 40, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.step-card', start: 'top 85%' },
      });

      // Stat numbers count up
      gsap.utils.toArray<HTMLElement>('.stat-number').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, scale: 0.5 }, {
          opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });

      // CTA section
      gsap.fromTo('.cta-section', { opacity: 0, scale: 0.95, y: 30 }, {
        opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.cta-section', start: 'top 80%' },
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-black text-neutral-100 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
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
              IA Preditiva
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-bold uppercase tracking-wider">Novo</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.05] opacity-0">
              <span className="bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent">Inteligência que trabalha</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">antes de você perceber o problema.</span>
            </h1>
            <p className="hero-sub text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed mb-10 opacity-0">
              Disponível no plano Pro: analisamos o comportamento da sua fila e agenda para prever gargalos, evitar faltas e sugerir os melhores horários.
            </p>
            <div className="hero-cta flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 opacity-0">
              <button onClick={() => navigate('/planos')} className="bg-emerald-500 text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                Ver planos
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/queue')} className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                Ver demonstração
              </button>
            </div>
          </div>
          <div className="hero-phone flex-1 flex justify-center opacity-0">
            <PredictionPhone />
          </div>
        </div>
      </section>

      {/* Feature 1: Previsão de Espera */}
      <section className="feature-block py-24 md:py-36 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="feature-text flex-1">
            <div className="feature-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-0">
              <Gauge className="w-3.5 h-3.5" />
              Previsão de Espera
            </div>
            <h2 className="feature-title text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.05] opacity-0">
              <span className="text-white">Tempo de espera preciso.</span>
              <br />
              <span className="text-emerald-400">Não chute.</span>
            </h2>
            <p className="section-subtitle text-neutral-400 text-lg leading-relaxed font-light mb-8 max-w-lg">
              Em vez de "mais ou menos 20 minutos", o cliente recebe um número real. A IA calcula o tempo de cada profissional por tipo de serviço, baseado no histórico real — e atualiza a cada movimentação.
            </p>
            <div className="section-desc space-y-4">
              {[
                { icon: Clock, text: 'Previsão baseada no ritmo real de cada profissional' },
                { icon: TrendingUp, text: 'Atualizada a cada entrada e saída da fila' },
                { icon: Target, text: 'Diferente por serviço: corte rápido ≠ barba completa' },
                { icon: Users, text: 'Cliente acompanha no celular sem perguntar' },
              ].map((item) => (
                <div key={item.text} className="bullet-item flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm text-neutral-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="feature-visual flex-1 flex justify-center phone-float">
            <WaitTimePhone />
          </div>
        </div>
      </section>

      {/* Feature 2: Alerta de Cancelamento */}
      <section className="feature-block py-24 md:py-36 px-6 relative z-10 bg-neutral-950/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16">
          <div className="feature-visual flex-1 flex justify-center phone-float">
            <PredictionPhone />
          </div>
          <div className="feature-text flex-1">
            <div className="feature-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-0">
              <AlertTriangle className="w-3.5 h-3.5" />
              Alerta de Cancelamento
            </div>
            <h2 className="feature-title text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.05] opacity-0">
              <span className="text-white">Antes que o cliente desista,</span>
              <br />
              <span className="text-amber-400">você já sabe.</span>
            </h2>
            <p className="section-subtitle text-neutral-400 text-lg leading-relaxed font-light mb-8 max-w-lg">
              A IA identifica padrões que precedem faltas: horários que o cliente costuma cancelar, intervalos entre agendamentos, frequência de reagendamento. Quando o risco é alto, avisa.
            </p>
            <div className="section-desc space-y-4">
              {[
                { icon: AlertTriangle, text: 'Detecta sinais de risco antes do cancelamento' },
                { icon: MessageCircleWarning, text: 'Alerta a equipe para agir proativamente' },
                { icon: CalendarCheck, text: 'Sugere reagendamento em vez de perda total' },
                { icon: BarChart3, text: 'Histórico de cancelamentos por cliente' },
              ].map((item) => (
                <div key={item.text} className="bullet-item flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-sm text-neutral-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Reengajamento Automático */}
      <section className="feature-block py-24 md:py-36 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="feature-text flex-1">
            <div className="feature-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-0">
              <Bot className="w-3.5 h-3.5" />
              Reengajamento Automático
            </div>
            <h2 className="feature-title text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.05] opacity-0">
              <span className="text-white">Lembrete certo,</span>
              <br />
              <span className="text-violet-400">no momento certo.</span>
            </h2>
            <p className="section-subtitle text-neutral-400 text-lg leading-relaxed font-light mb-8 max-w-lg">
              Não é só "envia um WhatsApp". A IA escolhe o melhor horário para cada cliente. Quem responde de manhã, quem precisa de aviso mais tarde. Sem parecer spam.
            </p>
            <div className="section-desc space-y-4">
              {[
                { icon: Zap, text: 'Horário de envio personalizado por comportamento' },
                { icon: Repeat, text: 'Tentativa automática se não houver confirmação' },
                { icon: MessageCircleWarning, text: 'Mensagem contextualizada: agendamento, fila ou lembrete' },
                { icon: TrendingUp, text: 'Taxa de confirmação maior que envio genérico' },
              ].map((item) => (
                <div key={item.text} className="bullet-item flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-violet-400" />
                  </div>
                  <span className="text-sm text-neutral-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="feature-visual flex-1 flex justify-center phone-float">
            <EngagementPhone />
          </div>
        </div>
      </section>

      {/* Feature 4: Insights de Faturamento */}
      <section className="feature-block py-24 md:py-36 px-6 relative z-10 bg-neutral-950/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16">
          <div className="feature-visual flex-1 flex justify-center phone-float">
            <RevenuePhone />
          </div>
          <div className="feature-text flex-1">
            <div className="feature-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-0">
              <LineChart className="w-3.5 h-3.5" />
              Insights de Faturamento
            </div>
            <h2 className="feature-title text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.05] opacity-0">
              <span className="text-white">Saiba onde está</span>
              <br />
              <span className="text-cyan-400">o dinheiro.</span>
            </h2>
            <p className="section-subtitle text-neutral-400 text-lg leading-relaxed font-light mb-8 max-w-lg">
              A IA cruza dados de fila, agenda e financeiro para mostrar o que realmente importa: quais serviços dão mais lucro, quais horários estão subutilizados, e quando escalar ou reduzir equipe.
            </p>
            <div className="section-desc space-y-4">
              {[
                { icon: BarChart3, text: 'Serviços mais lucrativos e ticket médio por profissional' },
                { icon: Clock, text: 'Horários de pico e ociosos — ajuste escala e preços' },
                { icon: TrendingUp, text: 'Tendências de faturamento mês a mês' },
                { icon: Target, text: 'Sugestões de ação: escala, preços, promoções' },
              ].map((item) => (
                <div key={item.text} className="bullet-item flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-sm text-neutral-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto bg-white text-black rounded-[3rem] md:rounded-[5rem] overflow-hidden relative">
          <div className="p-10 md:p-24 relative z-10">
            <div className="max-w-2xl mb-16">
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.28em] text-neutral-500">
                Como funciona · Pro
              </p>
              <h2 className="mb-6 text-4xl font-bold leading-[1.05] tracking-tighter md:text-6xl">
                Sem configuração complicada.
              </h2>
              <p className="text-lg text-neutral-600 font-light leading-relaxed">
                A IA Preditiva já vem ativa nos salões do plano Pro. Ela aprende com o histórico de fila, agenda e atendimentos — quanto mais você usa, mais precisa fica.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0">
              {[
                {
                  step: '01',
                  title: 'Você opera normalmente',
                  text: 'Fila, agendamentos e financeiro seguem funcionando como sempre.',
                  accent: 'text-emerald-700',
                  rule: 'bg-emerald-700',
                },
                {
                  step: '02',
                  title: 'Os dados alimentam o modelo',
                  text: 'Cada atendimento concluído refina as previsões do seu salão.',
                  accent: 'text-emerald-600',
                  rule: 'bg-emerald-600',
                },
                {
                  step: '03',
                  title: 'Você recebe os insights',
                  text: 'Alertas e recomendações aparecem direto no seu painel, sem esforço extra.',
                  accent: 'text-teal-700',
                  rule: 'bg-teal-700',
                },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className={`step-card opacity-0 md:px-8 ${index === 0 ? 'md:pl-0' : ''} ${
                    index === 2 ? 'md:pr-0' : ''
                  } ${index > 0 ? 'md:border-l md:border-neutral-200' : ''}`}
                >
                  <div className={`mb-5 h-1 w-10 rounded-full ${item.rule}`} />
                  <span className={`text-5xl font-black tracking-tighter ${item.accent}`}>
                    {item.step}
                  </span>
                  <h3 className="mt-4 mb-2 text-xl font-bold tracking-tight text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="font-light leading-relaxed text-neutral-500">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative z-10 border-y border-white/5 bg-neutral-950 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/80">
              Resultado esperado · Pro
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              Números que o salão sente no caixa.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                value: '92%',
                label: 'Precisão na previsão',
                detail: 'Espera estimada vs. tempo real do atendimento',
                tone: 'emerald' as const,
                visual: 'ring' as const,
                amount: 92,
              },
              {
                value: '-35%',
                label: 'Menos cancelamentos',
                detail: 'Com alerta de risco e lembrete no horário certo',
                tone: 'amber' as const,
                visual: 'spark' as const,
                amount: 35,
              },
              {
                value: '85%',
                label: 'Confirmação no WhatsApp',
                detail: 'Clientes que respondem ao lembrete automático',
                tone: 'violet' as const,
                visual: 'bar' as const,
                amount: 85,
              },
              {
                value: '+20%',
                label: 'Faturamento recuperado',
                detail: 'Horários ociosos e no-shows convertidos',
                tone: 'cyan' as const,
                visual: 'bars' as const,
                amount: 20,
              },
            ].map((stat) => {
              const stroke =
                stat.tone === 'emerald'
                  ? '#34d399'
                  : stat.tone === 'amber'
                    ? '#fbbf24'
                    : stat.tone === 'violet'
                      ? '#a78bfa'
                      : '#22d3ee';
              const soft =
                stat.tone === 'emerald'
                  ? 'from-emerald-400/15 to-transparent'
                  : stat.tone === 'amber'
                    ? 'from-amber-400/15 to-transparent'
                    : stat.tone === 'violet'
                      ? 'from-violet-400/15 to-transparent'
                      : 'from-cyan-400/15 to-transparent';

              return (
                <div
                  key={stat.label}
                  className={`relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b ${soft} to-neutral-900/80 p-6`}
                >
                  <div className="mb-5 flex h-16 items-end justify-between gap-3">
                    {stat.visual === 'ring' && (
                      <svg viewBox="0 0 72 72" className="h-16 w-16" aria-hidden="true">
                        <circle
                          cx="36"
                          cy="36"
                          r="28"
                          fill="none"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="6"
                        />
                        <circle
                          cx="36"
                          cy="36"
                          r="28"
                          fill="none"
                          stroke={stroke}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${(stat.amount / 100) * 176} 176`}
                          transform="rotate(-90 36 36)"
                        />
                      </svg>
                    )}
                    {stat.visual === 'spark' && (
                      <svg viewBox="0 0 120 56" className="h-14 w-full" aria-hidden="true">
                        <path
                          d="M4 12 L28 18 L48 10 L68 28 L88 22 L116 44"
                          fill="none"
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="2"
                        />
                        <path
                          d="M4 18 L28 24 L48 20 L68 34 L88 30 L116 48"
                          fill="none"
                          stroke={stroke}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="116" cy="48" r="3.5" fill={stroke} />
                      </svg>
                    )}
                    {stat.visual === 'bar' && (
                      <div className="w-full">
                        <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          <span>Antes</span>
                          <span>Com IA</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${stat.amount}%`, backgroundColor: stroke }}
                          />
                        </div>
                        <div className="mt-3 flex gap-1">
                          {[42, 48, 55, 61, 70, 78, 85].map((h) => (
                            <div
                              key={h}
                              className="flex-1 rounded-sm bg-violet-400/25"
                              style={{ height: `${h * 0.35}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {stat.visual === 'bars' && (
                      <div className="flex h-14 w-full items-end gap-1.5">
                        {[28, 34, 30, 42, 48, 45, 58, 66, 72].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm"
                            style={{
                              height: `${h}%`,
                              backgroundColor: i > 5 ? stroke : 'rgba(255,255,255,0.12)',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="stat-number text-4xl font-black tracking-tighter text-white opacity-0 md:text-5xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm font-bold text-white">{stat.label}</div>
                  <p className="mt-1.5 text-xs font-medium leading-relaxed text-neutral-500">
                    {stat.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section py-24 px-6 relative z-10 opacity-0">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">
            Disponível no plano <span className="text-emerald-400">Pro</span>
          </h2>
          <p className="text-lg text-neutral-400 mb-10 max-w-xl mx-auto font-light">
            Faça upgrade a qualquer momento direto do seu painel, sem burocracia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/planos')} className="bg-emerald-500 text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              Ver planos
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/queue')} className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Ver demonstração
            </button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
