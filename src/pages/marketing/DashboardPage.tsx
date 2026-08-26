import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { trialCampaign } from '../../marketing/trialCampaign';

const weekBars = [
  { day: 'Seg', h: 52, val: 820 },
  { day: 'Ter', h: 78, val: 1140 },
  { day: 'Qua', h: 40, val: 610 },
  { day: 'Qui', h: 92, val: 1290 },
  { day: 'Sex', h: 68, val: 950 },
  { day: 'Sáb', h: 100, val: 1350 },
];

const staffRows = [
  { name: 'Marina', role: 'Cabelo', jobs: 12, revenue: 'R$ 780', share: 86 },
  { name: 'Leo', role: 'Barba', jobs: 15, revenue: 'R$ 690', share: 74 },
  { name: 'Sofia', role: 'Unhas', jobs: 9, revenue: 'R$ 540', share: 58 },
];

const hourHeat = [22, 28, 45, 70, 88, 95, 82, 60, 48, 35];

const comparison = [
  { label: 'Fila e agenda', essential: true, pro: true },
  { label: 'Equipe ilimitada', essential: true, pro: true },
  { label: 'Dashboard e relatórios', essential: false, pro: true },
  { label: 'Financeiro, despesas e fiado', essential: false, pro: true },
  { label: 'Insights de movimento', essential: false, pro: true },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-sans text-neutral-100 selection:bg-emerald-500/30">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-[15%] top-[-12%] h-[55%] w-[55%] rounded-full bg-emerald-900/25 blur-[140px]" />
        <div className="absolute -right-[12%] top-[18%] h-[45%] w-[45%] rounded-full bg-teal-900/15 blur-[130px]" />
        <div className="absolute bottom-[-18%] left-[25%] h-[40%] w-[50%] rounded-full bg-cyan-950/30 blur-[120px]" />
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
      <section className="relative z-10 overflow-hidden px-6 pb-16 pt-36 md:px-10 md:pb-24 md:pt-44 xl:px-12">
        <div className="mx-auto max-w-375">
          <div className="mx-auto max-w-4xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90"
            >
              Dashboard · Plano Pro
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-5xl font-black tracking-[-0.05em] text-white md:text-7xl xl:text-8xl"
            >
              O movimento do salão,
              <br />
              <span className="text-emerald-400">não o feeling.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mx-auto mt-7 max-w-2xl text-lg font-medium leading-relaxed text-neutral-400 md:text-xl"
            >
              Relatórios, financeiro e insights no mesmo painel. Você vê o que vendeu, o que ficou
              em fiado e onde a agenda está vazia — sem planilha no fim do mês.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-emerald-400 px-8 py-4 text-base font-black text-black transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                {trialCampaign.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/planos')}
                className="group inline-flex items-center justify-center gap-2 px-4 py-3 text-base font-bold text-neutral-300 transition hover:text-white"
              >
                Ver planos
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          </div>

          {/* Hero dashboard scene */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.7 }}
            className="relative mx-auto mt-16 max-w-5xl"
          >
            <div className="absolute -inset-6 rounded-[3rem] bg-emerald-400/8 blur-3xl" />
            <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-[#0a100c] shadow-[0_40px_120px_rgba(0,0,0,0.55)] md:rounded-[2.5rem]">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 md:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  </div>
                  <span className="text-xs font-bold text-neutral-500">
                    Relatórios · Barbearia Central
                  </span>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  Pro
                </span>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-12 md:gap-5 md:p-8">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:col-span-12">
                  {[
                    {
                      label: 'Faturamento',
                      value: 'R$ 6.160',
                      meta: '+18% vs sem. ant.',
                      tone: 'text-emerald-300',
                    },
                    {
                      label: 'Atendimentos',
                      value: '84',
                      meta: '6 dias úteis',
                      tone: 'text-white',
                    },
                    {
                      label: 'Ticket médio',
                      value: 'R$ 73',
                      meta: 'Corte + barba lidera',
                      tone: 'text-cyan-300',
                    },
                    {
                      label: 'Fiado aberto',
                      value: 'R$ 320',
                      meta: '3 clientes',
                      tone: 'text-amber-200',
                    },
                  ].map(kpi => (
                    <div
                      key={kpi.label}
                      className="rounded-2xl border border-white/8 bg-black/35 px-4 py-4"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        {kpi.label}
                      </p>
                      <p
                        className={`mt-2 text-2xl font-black tracking-tight md:text-3xl ${kpi.tone}`}
                      >
                        {kpi.value}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">{kpi.meta}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/30 p-5 md:col-span-7">
                  <div className="mb-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Semana
                      </p>
                      <p className="mt-1 text-lg font-black text-white">Faturamento diário</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-300">Pico no sábado</p>
                  </div>
                  <div className="flex h-44 items-end gap-2.5 md:h-52">
                    {weekBars.map(bar => (
                      <div
                        key={bar.day}
                        className="flex h-full min-w-0 flex-1 flex-col items-center gap-2"
                      >
                        <div className="relative flex w-full flex-1 items-end">
                          <div
                            className="w-full rounded-t-md bg-linear-to-t from-emerald-500/30 to-emerald-400"
                            style={{ height: `${bar.h}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-500">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:col-span-5">
                  <div className="rounded-2xl border border-white/8 bg-black/30 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Top serviços
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        { name: 'Corte + barba', pct: 92, value: 'R$ 2.4k' },
                        { name: 'Corte masculino', pct: 70, value: 'R$ 1.8k' },
                        { name: 'Barba', pct: 48, value: 'R$ 960' },
                      ].map(s => (
                        <div key={s.name}>
                          <div className="mb-1.5 flex justify-between text-sm">
                            <span className="font-semibold text-white">{s.name}</span>
                            <span className="font-bold text-emerald-300">{s.value}</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
                            <div
                              className="h-full rounded-full bg-emerald-400"
                              style={{ width: `${s.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-300/20 bg-amber-300/6 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-200/80">
                      Insight
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-white">
                      Terça tem 40% menos movimento — janela boa para promoção de barba.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value strip */}
      <section className="relative z-10 border-y border-white/8 bg-white/2 px-6 py-14 md:px-10 xl:px-12">
        <div className="mx-auto grid max-w-375 gap-8 md:grid-cols-3 md:gap-6">
          {[
            {
              value: '1 tela',
              label: 'Fila, agenda e caixa no mesmo lugar — sem pular de app.',
            },
            {
              value: 'Pro only',
              label: 'Essencial opera. Pro enxerga o negócio com relatórios.',
            },
            {
              value: 'Tempo real',
              label: 'Números atualizam com o movimento do dia, não no fechamento.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.value}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="md:border-r md:border-white/8 md:px-8 md:last:border-r-0 md:first:pl-0 md:last:pr-0"
            >
              <p className="text-3xl font-black tracking-tight text-white md:text-4xl">
                {item.value}
              </p>
              <p className="mt-3 text-base font-medium leading-relaxed text-neutral-400">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bento */}
      <section className="relative z-10 px-6 py-24 md:px-10 md:py-32 xl:px-12">
        <div className="mx-auto max-w-375">
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">
                O que o Pro mostra
              </p>
              <h2 className="mt-4 text-5xl font-black tracking-[-0.04em] text-white md:text-6xl">
                Decisões com número, não com achismo.
              </h2>
            </div>
            <p className="max-w-md text-lg font-medium leading-relaxed text-neutral-400">
              Insights cruzam fila, agenda e financeiro. Você vê pico, ociosidade, serviço que paga
              a conta e cliente em atraso.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            {/* Finance */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[2.25rem] border border-emerald-400/20 bg-[#07110b] p-8 lg:col-span-7 lg:p-10"
            >
              <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-emerald-400/12 blur-[90px]" />
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">
                  Financeiro
                </p>
                <h3 className="mt-3 max-w-lg text-3xl font-black tracking-tight text-white md:text-4xl">
                  Entrada, saída e fiado no mesmo resumo.
                </h3>
                <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-neutral-400">
                  Despesas categorizadas, pagamentos parciais de fiado e saldo do período — sem
                  caderno paralelo.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
                      Entradas
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">R$ 8.4k</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/40 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Despesas
                    </p>
                    <p className="mt-2 text-2xl font-black text-neutral-200">R$ 2.1k</p>
                  </div>
                  <div className="rounded-2xl border border-amber-300/25 bg-amber-300/8 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200/80">
                      Fiado
                    </p>
                    <p className="mt-2 text-2xl font-black text-amber-100">R$ 320</p>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Heat by hour */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 }}
              className="relative overflow-hidden rounded-[2.25rem] border border-cyan-400/20 bg-[#081218] p-8 lg:col-span-5 lg:p-9"
            >
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/90">
                Por horário
              </p>
              <h3 className="mt-3 text-3xl font-black tracking-tight text-white">
                Onde a agenda esfria.
              </h3>
              <p className="mt-3 text-base font-medium text-neutral-400">
                Volume por hora do dia — escala e preço deixam de ser chute.
              </p>
              <div className="mt-8 flex h-36 items-end gap-1.5">
                {hourHeat.map((h, i) => (
                  <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                    <div
                      className="w-full rounded-t-sm bg-cyan-400"
                      style={{ height: `${h}%`, opacity: 0.35 + (h / 100) * 0.65 }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-bold text-neutral-600">
                <span>09h</span>
                <span>13h</span>
                <span>18h</span>
              </div>
            </motion.article>

            {/* Staff */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.04 }}
              className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#0d110e] p-8 lg:col-span-5 lg:p-9"
            >
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-neutral-400">
                Por profissional
              </p>
              <h3 className="mt-3 text-3xl font-black tracking-tight text-white">
                Quem puxa o dia.
              </h3>
              <div className="mt-8 space-y-4">
                {staffRows.map(person => (
                  <div key={person.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-white">{person.name}</p>
                        <p className="text-xs text-neutral-500">
                          {person.role} · {person.jobs} atend.
                        </p>
                      </div>
                      <p className="text-sm font-black text-emerald-300">{person.revenue}</p>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
                      <div
                        className="h-full rounded-full bg-emerald-400/80"
                        style={{ width: `${person.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.article>

            {/* Fiado detail */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-[2.25rem] border border-amber-300/20 bg-[#14100a] lg:col-span-7"
            >
              <div className="grid h-full lg:grid-cols-[1fr_1fr]">
                <div className="p-8 lg:p-9">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200/90">
                    Fiado
                  </p>
                  <h3 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
                    Crediário com histórico, não papel.
                  </h3>
                  <p className="mt-4 text-base font-medium leading-relaxed text-neutral-400">
                    Abra, registre pagamento parcial e veja o saldo. O dashboard mostra o que ainda
                    está na rua.
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-3 border-t border-white/8 bg-black/35 p-8 lg:border-l lg:border-t-0 lg:p-9">
                  {[
                    { name: 'Paulo R.', due: 'R$ 120', status: 'Parcial' },
                    { name: 'Camila S.', due: 'R$ 80', status: 'Aberto' },
                    { name: 'Diego M.', due: 'R$ 120', status: 'Aberto' },
                  ].map(row => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-bold text-white">{row.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200/70">
                          {row.status}
                        </p>
                      </div>
                      <p className="text-sm font-black text-amber-100">{row.due}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Essencial vs Pro */}
      <section className="relative z-10 border-y border-white/8 bg-white/1.5 px-6 py-24 md:px-10 md:py-28 xl:px-12">
        <div className="mx-auto max-w-375">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">
              Planos
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              Essencial opera. Pro enxerga.
            </h2>
            <p className="mt-4 text-lg font-medium leading-relaxed text-neutral-400">
              Dashboard, financeiro e insights ficam no Pro. {trialCampaign.body}{' '}
              {trialCampaign.afterTrial}
            </p>
          </div>

          <div className="overflow-hidden rounded-4xl border border-white/10 bg-[#0a0f0c]">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b border-white/8 px-5 py-4 text-[10px] font-black uppercase tracking-wider text-neutral-500 md:px-8 md:text-xs">
              <span>Recurso</span>
              <span className="text-center">Essencial</span>
              <span className="text-center text-emerald-300">Pro</span>
            </div>
            {comparison.map(row => (
              <div
                key={row.label}
                className="grid grid-cols-[1.4fr_0.8fr_0.8fr] items-center border-b border-white/6 px-5 py-4 last:border-b-0 md:px-8 md:py-5"
              >
                <span className="text-sm font-semibold text-neutral-200 md:text-base">
                  {row.label}
                </span>
                <span className="text-center text-sm font-bold text-neutral-500">
                  {row.essential ? (
                    <CheckCircle2 className="mx-auto h-5 w-5 text-neutral-400" />
                  ) : (
                    '—'
                  )}
                </span>
                <span className="text-center">
                  {row.pro ? <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-400" /> : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24 md:px-10 md:pb-36 xl:px-12">
        <div className="relative mx-auto max-w-375 overflow-hidden rounded-[2.5rem] border border-emerald-400/15 bg-[#0d1510] px-8 py-16 text-center md:rounded-[3.5rem] md:px-16 md:py-24">
          <div className="absolute left-1/2 top-0 h-72 w-2/3 -translate-x-1/2 rounded-full bg-emerald-400/12 blur-[100px]" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300/80">
              {trialCampaign.eyebrow}
            </p>
            <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-[-0.05em] text-white md:text-6xl xl:text-7xl">
              Veja o salão pelos números. Experimente o Pro.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-relaxed text-neutral-400">
              {trialCampaign.body} {trialCampaign.afterTrial}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-base font-black text-black transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                {trialCampaign.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/contato')}
                className="inline-flex items-center justify-center px-4 py-3 text-sm font-bold text-neutral-400 transition hover:text-white"
              >
                Tirar uma dúvida
              </button>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};

export default DashboardPage;
