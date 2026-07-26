import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../ui/chart'

const AVG_TICKET = 55
const ESSENTIAL_MONTHLY = 14
const PRO_MONTHLY = 20
const ESSENTIAL_YEARLY = 140
const PRO_YEARLY = 200
const LOST_NOSHOWS_MONTH = 3

type PricingPersuasionChartsProps = {
  variant?: 'dark' | 'app'
}

export const PricingPersuasionCharts: React.FC<PricingPersuasionChartsProps> = ({
  variant = 'dark',
}) => {
  const isDark = variant === 'dark'
  const card = isDark
    ? 'bg-neutral-900/50 border-white/10 backdrop-blur-xl'
    : 'bg-surface border-border'
  const title = isDark ? 'text-white' : 'text-text-primary'
  const muted = isDark ? 'text-neutral-400' : 'text-text-secondary'
  const faint = isDark ? 'text-neutral-500' : 'text-text-muted'
  const shell = isDark ? 'border-white/5 bg-black/20' : 'border-border bg-bg'

  const accent = isDark ? '#10b981' : 'var(--chart-1)'
  const mutedBar = isDark ? '#525252' : 'var(--chart-5)'
  const violet = isDark ? '#a78bfa' : 'var(--chart-2)'
  const cyan = isDark ? '#22d3ee' : 'var(--chart-3)'

  const essentialBreakEven = Math.ceil(ESSENTIAL_MONTHLY / AVG_TICKET)
  const proBreakEven = Math.ceil(PRO_MONTHLY / AVG_TICKET)
  const lostRevenue = LOST_NOSHOWS_MONTH * AVG_TICKET

  const valueCompareData = useMemo(
    () => [
      { name: '1 cliente', value: AVG_TICKET, fill: accent },
      { name: 'Essencial', value: ESSENTIAL_MONTHLY, fill: mutedBar },
      { name: 'Pro', value: PRO_MONTHLY, fill: mutedBar },
      { name: '3 faltas', value: lostRevenue, fill: accent },
    ],
    [accent, mutedBar, lostRevenue]
  )

  const yearlyCompareData = useMemo(
    () => [
      { name: 'Ess. 12×', value: ESSENTIAL_MONTHLY * 12, fill: mutedBar },
      { name: 'Ess. anual', value: ESSENTIAL_YEARLY, fill: accent },
      { name: 'Pro 12×', value: PRO_MONTHLY * 12, fill: mutedBar },
      { name: 'Pro anual', value: PRO_YEARLY, fill: violet },
    ],
    [accent, mutedBar, violet]
  )

  const featureCompareData = useMemo(
    () => [
      { feature: 'Fila + agenda', essential: 100, pro: 100 },
      { feature: 'Relatórios', essential: 0, pro: 100 },
      { feature: 'Financeiro', essential: 0, pro: 100 },
      { feature: 'Insights', essential: 15, pro: 100 },
      { feature: 'Crescimento', essential: 35, pro: 100 },
    ],
    []
  )

  const valueConfig: ChartConfig = {
    value: { label: 'Valor (R$)', color: accent },
  }
  const yearlyConfig: ChartConfig = {
    value: { label: 'Custo anual (R$)', color: accent },
  }
  const featureConfig: ChartConfig = {
    essential: { label: 'Essencial', color: mutedBar },
    pro: { label: 'Pro', color: accent },
  }

  const strategies = [
    {
      title: 'Trial sem cartão',
      score: 95,
      pitch:
        '30 dias do Pro completo. Você entra sem fricção, vicia no dashboard e decide depois.',
      tag: 'Captura',
      color: accent,
    },
    {
      title: 'Essencial R$14',
      score: 80,
      pitch:
        'Barreira baixa para ficar. Equipe ilimitada, fila e agenda — o “pé na porta” após o trial.',
      tag: 'Conversão',
      color: cyan,
    },
    {
      title: 'Pro anual',
      score: 90,
      pitch:
        '2 meses grátis + dashboard. Quem assina o ano fica — menor churn, melhor LTV.',
      tag: 'Retenção',
      color: violet,
    },
  ]

  const strategyData = strategies.map((s) => ({
    name: s.tag,
    score: s.score,
    fill: s.color,
  }))
  const strategyConfig: ChartConfig = {
    score: { label: 'Score', color: accent },
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <p
          className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-emerald-400' : 'text-accent'} mb-3`}
        >
          Comparativo de valor
        </p>
        <h3 className={`text-2xl md:text-4xl font-black tracking-tight ${title} mb-3`}>
          Quanto custa… e quanto você deixa na mesa
        </h3>
        <p className={`text-sm md:text-base font-light leading-relaxed ${muted}`}>
          Números pensados para dono de salão: ticket médio de R$ {AVG_TICKET}, faltas
          evitáveis e o preço real de cada plano.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`rounded-[2rem] border p-8 ${card}`}
        >
          <h4 className={`text-lg font-bold ${title} mb-1`}>1 cliente a mais = plano pago</h4>
          <p className={`text-xs ${faint} mb-6`}>
            Comparando o custo do software com o valor de um atendimento típico.
          </p>
          <ChartContainer config={valueConfig} className="aspect-auto h-56 w-full">
            <BarChart
              data={valueCompareData}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={72}
                className="text-[11px]"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      `R$ ${Number(value).toLocaleString('pt-BR')}`
                    }
                  />
                }
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {valueCompareData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <p className={`mt-4 text-sm leading-relaxed ${muted}`}>
            Com ticket de R$ {AVG_TICKET}, o Essencial se paga com{' '}
            <span className={isDark ? 'text-emerald-400 font-semibold' : 'text-accent font-semibold'}>
              {essentialBreakEven} cliente
            </span>
            ; o Pro com{' '}
            <span className={isDark ? 'text-emerald-400 font-semibold' : 'text-accent font-semibold'}>
              {proBreakEven} cliente
            </span>
            . Três faltas recuperadas no mês já cobrem o Pro e ainda sobra.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className={`rounded-[2rem] border p-8 ${card}`}
        >
          <h4 className={`text-lg font-bold ${title} mb-1`}>
            Mensal vs anual — gasto em 12 meses
          </h4>
          <p className={`text-xs ${faint} mb-6`}>
            Anual = pague 10, use 12. Menos churn, mais previsibilidade.
          </p>
          <ChartContainer config={yearlyConfig} className="aspect-auto h-56 w-full">
            <BarChart data={yearlyCompareData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} className="text-[10px]" />
              <YAxis hide />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      `R$ ${Number(value).toLocaleString('pt-BR')}`
                    }
                  />
                }
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {yearlyCompareData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className={`rounded-xl border px-4 py-3 ${shell}`}>
              <p className={`text-[10px] uppercase tracking-widest ${faint}`}>Economia Essencial</p>
              <p className={`text-xl font-black ${isDark ? 'text-emerald-400' : 'text-accent'}`}>
                R$ {ESSENTIAL_MONTHLY * 12 - ESSENTIAL_YEARLY}
              </p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${shell}`}>
              <p className={`text-[10px] uppercase tracking-widest ${faint}`}>Economia Pro</p>
              <p className={`text-xl font-black ${isDark ? 'text-emerald-400' : 'text-accent'}`}>
                R$ {PRO_MONTHLY * 12 - PRO_YEARLY}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`rounded-[2rem] border p-8 lg:col-span-2 ${card}`}
        >
          <h4 className={`text-lg font-bold ${title} mb-1`}>Qual estratégia combina com você?</h4>
          <p className={`text-xs ${faint} mb-6`}>
            Mesmas ferramentas de aquisição que grandes SaaS usam — adaptadas ao seu salão.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6 items-center">
            <ChartContainer config={strategyConfig} className="aspect-auto h-48 w-full">
              <BarChart data={strategyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-[11px]" />
                <YAxis domain={[0, 100]} hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {strategyData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="grid gap-3">
              {strategies.map((s) => (
                <div key={s.title} className={`rounded-2xl border p-4 ${shell}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        isDark
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                          : 'border-accent/30 text-accent bg-accent/10'
                      }`}
                    >
                      {s.tag}
                    </span>
                    <span className={`text-xs font-bold tabular-nums ${muted}`}>{s.score}/100</span>
                  </div>
                  <p className={`font-bold mb-1 ${title}`}>{s.title}</p>
                  <p className={`text-sm font-light leading-relaxed ${muted}`}>{s.pitch}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`rounded-[2rem] border p-8 lg:col-span-2 ${card}`}
        >
          <h4 className={`text-lg font-bold ${title} mb-1`}>
            Essencial vs Pro — o que os R$ 6 a mais liberam
          </h4>
          <p className={`text-xs ${faint} mb-6`}>
            Diferença de preço menor que um café por semana. Diferença de controle: total.
          </p>
          <ChartContainer config={featureConfig} className="aspect-auto h-64 w-full">
            <BarChart
              data={featureCompareData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="feature"
                tickLine={false}
                axisLine={false}
                width={88}
                className="text-[11px]"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="essential" fill="var(--color-essential)" radius={[0, 4, 4, 0]} maxBarSize={14} />
              <Bar dataKey="pro" fill="var(--color-pro)" radius={[0, 4, 4, 0]} maxBarSize={14} />
            </BarChart>
          </ChartContainer>
          <p
            className={`mt-6 text-center text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-accent'}`}
          >
            Teste o Pro 30 dias grátis. Se não precisar do dashboard, desça para o Essencial — sem drama.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
