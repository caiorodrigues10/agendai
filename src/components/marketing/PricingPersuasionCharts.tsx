import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../ui/chart';
import { trialCampaign } from '../../marketing/trialCampaign';

const AVG_TICKET = 55;
const ESSENTIAL_MONTHLY = 14;
const PRO_MONTHLY = 20;
const ESSENTIAL_YEARLY = 140;
const PRO_YEARLY = 200;
const LOST_NOSHOWS_MONTH = 3;

type PricingPersuasionChartsProps = {
  variant?: 'dark' | 'app';
};

export const PricingPersuasionCharts: React.FC<PricingPersuasionChartsProps> = ({
  variant = 'dark',
}) => {
  const isDark = variant === 'dark';
  const card = isDark
    ? 'border-white/10 bg-neutral-900/60 backdrop-blur-xl'
    : 'border-border bg-surface';
  const title = isDark ? 'text-white' : 'text-text-primary';
  const muted = isDark ? 'text-neutral-300' : 'text-text-secondary';
  const faint = isDark ? 'text-neutral-500' : 'text-text-muted';
  const shell = isDark ? 'border-white/10 bg-white/5' : 'border-border bg-bg';

  const accent = isDark ? '#34d399' : 'var(--chart-1)';
  const mutedBar = isDark ? '#6b7280' : 'var(--chart-5)';
  const violet = isDark ? '#a78bfa' : 'var(--chart-2)';
  const amber = isDark ? '#fbbf24' : 'var(--chart-4)';
  const red = isDark ? '#f87171' : '#ef4444';

  const essentialBreakEven = Math.ceil(ESSENTIAL_MONTHLY / AVG_TICKET);
  const proBreakEven = Math.ceil(PRO_MONTHLY / AVG_TICKET);
  const lostRevenue = LOST_NOSHOWS_MONTH * AVG_TICKET;

  const valueCompareData = useMemo(
    () => [
      { name: '1 cliente', value: AVG_TICKET, fill: accent },
      { name: 'Essencial', value: ESSENTIAL_MONTHLY, fill: mutedBar },
      { name: 'Pro', value: PRO_MONTHLY, fill: mutedBar },
      { name: '3 faltas', value: lostRevenue, fill: red },
    ],
    [accent, mutedBar, amber, lostRevenue],
  );

  const yearlyCompareData = useMemo(
    () => [
      { name: 'Ess. 12×', value: ESSENTIAL_MONTHLY * 12, fill: mutedBar },
      { name: 'Ess. anual', value: ESSENTIAL_YEARLY, fill: accent },
      { name: 'Pro 12×', value: PRO_MONTHLY * 12, fill: mutedBar },
      { name: 'Pro anual', value: PRO_YEARLY, fill: violet },
    ],
    [accent, mutedBar, violet],
  );

  const featureCompareData = useMemo(
    () => [
      { feature: 'Fila + agenda', essential: 100, pro: 100 },
      { feature: 'Equipe ∞', essential: 100, pro: 100 },
      { feature: 'Relatórios', essential: 0, pro: 100 },
      { feature: 'Financeiro', essential: 0, pro: 100 },
      { feature: 'Insights', essential: 10, pro: 100 },
    ],
    [],
  );

  const lossData = useMemo(
    () => [
      { name: 'Caderno', value: 100, fill: red },
      { name: 'Só WhatsApp', value: 85, fill: amber },
      { name: 'Essencial', value: 45, fill: accent },
      { name: 'Pro', value: 18, fill: violet },
    ],
    [accent, mutedBar, violet, amber, red],
  );

  const valueConfig: ChartConfig = {
    value: { label: 'Valor (R$)', color: accent },
  };
  const yearlyConfig: ChartConfig = {
    value: { label: 'Custo anual (R$)', color: accent },
  };
  const featureConfig: ChartConfig = {
    essential: { label: 'Essencial', color: mutedBar },
    pro: { label: 'Pro', color: accent },
  };
  const lossConfig: ChartConfig = {
    value: { label: 'Risco / atrito', color: amber },
  };

  return (
    <div className="space-y-10">
      <div className="mx-auto max-w-2xl text-center">
        <p
          className={`mb-4 text-xs font-bold uppercase tracking-[0.28em] ${
            isDark ? 'text-emerald-400/90' : 'text-accent'
          }`}
        >
          Conta de guardanapo
        </p>
        <h3 className={`mb-4 text-3xl font-black tracking-tight md:text-4xl ${title}`}>
          O plano se paga. A falta, não.
        </h3>
        <p className={`text-base font-medium leading-relaxed ${muted}`}>
          Ticket médio de R$ {AVG_TICKET}. Compare o custo do software com o que some
          quando o cliente não aparece.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`rounded-3xl border p-8 ${card}`}
        >
          <h4 className={`mb-1.5 text-xl font-black ${title}`}>1 cliente a mais = mês pago</h4>
          <p className={`mb-6 text-sm ${faint}`}>
            Custo do plano vs. valor de um atendimento típico.
          </p>
          <ChartContainer config={valueConfig} className="aspect-auto h-60 w-full">
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
                width={80}
                tick={{ fontSize: 13, fill: isDark ? '#d1d5db' : undefined, fontWeight: 600 }}
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
              <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={28}>
                {valueCompareData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <p className={`mt-4 text-sm leading-relaxed ${muted}`}>
            Essencial se paga com{' '}
            <span className={isDark ? 'font-bold text-emerald-400' : 'font-bold text-accent'}>
              {essentialBreakEven} cliente
            </span>
            . Pro com{' '}
            <span className={isDark ? 'font-bold text-emerald-400' : 'font-bold text-accent'}>
              {proBreakEven} clientes
            </span>
            . Três faltas evitadas no mês cobrem o Pro e ainda sobra.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className={`rounded-3xl border p-8 ${card}`}
        >
          <h4 className={`mb-1.5 text-xl font-black ${title}`}>Mensal vs anual em 12 meses</h4>
          <p className={`mb-6 text-sm ${faint}`}>
            Anual = pague 10, use 12. Dois meses de graça.
          </p>
          <ChartContainer config={yearlyConfig} className="aspect-auto h-60 w-full">
            <BarChart data={yearlyCompareData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[10px]"
              />
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
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                {yearlyCompareData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className={`rounded-xl border px-4 py-3 ${shell}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${faint}`}>
                Economia Essencial
              </p>
              <p className={`text-xl font-black ${isDark ? 'text-emerald-400' : 'text-accent'}`}>
                R$ {ESSENTIAL_MONTHLY * 12 - ESSENTIAL_YEARLY}
              </p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${shell}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${faint}`}>
                Economia Pro
              </p>
              <p className={`text-xl font-black ${isDark ? 'text-emerald-400' : 'text-accent'}`}>
                R$ {PRO_MONTHLY * 12 - PRO_YEARLY}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`rounded-3xl border p-8 ${card}`}
        >
          <h4 className={`mb-1.5 text-xl font-black ${title}`}>
            Onde o dinheiro escorre
          </h4>
          <p className={`mb-6 text-sm ${faint}`}>
            Atrito operacional relativo — quanto mais baixo, menos cadeira vazia.
          </p>
          <ChartContainer config={lossConfig} className="aspect-auto h-60 w-full">
            <BarChart data={lossData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: isDark ? '#a1a1aa' : undefined, fontWeight: 500 }} />
              <YAxis hide domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                {lossData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <p className={`mt-4 text-sm leading-relaxed ${muted}`}>
            Caderno e WhatsApp não lembram o cliente. Pro lembra, mostra risco e recupera
            horário.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className={`rounded-3xl border p-8 ${card}`}
        >
          <h4 className={`mb-1.5 text-xl font-black ${title}`}>
            Essencial vs Pro — o que R$ 6 liberam
          </h4>
          <p className={`mb-6 text-sm ${faint}`}>
            Menos que um café por semana. Diferença de controle: total.
          </p>
          <ChartContainer config={featureConfig} className="aspect-auto h-60 w-full">
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
              <Bar
                dataKey="essential"
                fill="var(--color-essential)"
                radius={[0, 4, 4, 0]}
                maxBarSize={14}
              />
              <Bar
                dataKey="pro"
                fill="var(--color-pro)"
                radius={[0, 4, 4, 0]}
                maxBarSize={14}
              />
            </BarChart>
          </ChartContainer>
          <p
            className={`mt-4 text-center text-sm font-semibold ${
              isDark ? 'text-emerald-400' : 'text-accent'
            }`}
          >
            {trialCampaign.body} Se não precisar do dashboard, fique no Essencial depois.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
