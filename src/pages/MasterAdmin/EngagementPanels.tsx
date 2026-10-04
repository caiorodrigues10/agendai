import React from 'react';
import {
  EngagementSummary,
  EngagementFunnelStep,
  EngagementFeature,
  EngagementChurnRisk,
} from '../../infra/adminEngagementApi';

interface CardProps {
  title: string;
  hint?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, hint, children }) => (
  <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
    <div>
      <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      {hint && <p className="text-xs text-text-muted mt-0.5">{hint}</p>}
    </div>
    {children}
  </div>
);

const Tile: React.FC<{ label: string; value: string; tone?: string }> = ({
  label,
  value,
  tone,
}) => (
  <div className="bg-bg border border-border rounded-lg p-3">
    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</p>
    <p className={`text-lg font-bold mt-1 ${tone ?? 'text-text-primary'}`}>{value}</p>
  </div>
);

const Bar: React.FC<{ pct: number; tone?: string }> = ({ pct, tone }) => (
  <div className="h-2.5 rounded-full bg-bg overflow-hidden">
    <div
      className={`h-full rounded-full ${tone ?? 'bg-accent/70'}`}
      style={{ width: `${Math.min(pct, 100)}%` }}
    />
  </div>
);

const FunnelCard: React.FC<{ funnel: EngagementFunnelStep[] }> = ({ funnel }) => (
  <Card title="Funil de ativação" hint="Etapas dos salões ativos na plataforma">
    <div className="space-y-2.5">
      {funnel.map((step) => (
        <div key={step.key} className="grid grid-cols-[1fr_auto] gap-1 text-xs">
          <span className="font-bold text-text-secondary">{step.label}</span>
          <span className="text-text-primary font-medium tabular-nums">
            {step.count} <span className="text-text-muted">({step.pct}%)</span>
          </span>
          <div className="col-span-2">
            <Bar pct={step.pct} />
          </div>
        </div>
      ))}
    </div>
  </Card>
);

const FeaturesCard: React.FC<{ features: EngagementFeature[] }> = ({ features }) => (
  <Card
    title="Adoção por recurso"
    hint="Agenda, fila, vendas e fiado: uso nos últimos 30 dias"
  >
    <div className="space-y-2.5">
      {features.map((feature) => (
        <div key={feature.key} className="grid grid-cols-[1fr_auto] gap-1 text-xs">
          <span className="font-bold text-text-secondary">{feature.label}</span>
          <span className="text-text-primary font-medium tabular-nums">
            {feature.shops} <span className="text-text-muted">({feature.pct}%)</span>
          </span>
          <div className="col-span-2">
            <Bar pct={feature.pct} tone="bg-success/70" />
          </div>
        </div>
      ))}
    </div>
  </Card>
);

const npsTone = (score: number | null): string => {
  if (score === null) return 'text-text-muted';
  if (score >= 50) return 'text-success';
  if (score >= 0) return 'text-warning';
  return 'text-danger';
};

const NpsCard: React.FC<{ nps: EngagementSummary['nps'] }> = ({ nps }) => (
  <Card
    title="NPS"
    hint={`Pesquisas NPS respondidas nos últimos ${nps.windowDays} dias (promotores − detratores)`}
  >
    {nps.insufficient && (
      <div
        data-testid="nps-insufficient"
        className="rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text-muted"
      >
        Sem dados suficientes — mínimo de 10 respostas na janela de{' '}
        {nps.windowDays} dias ({nps.responses}{' '}
        {nps.responses === 1 ? 'resposta' : 'respostas'} até agora).
      </div>
    )}
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <Tile
        label="NPS"
        value={nps.score !== null ? String(nps.score) : '—'}
        tone={npsTone(nps.score)}
      />
      <Tile label="Respostas" value={String(nps.responses)} />
      <Tile label="Promotores" value={String(nps.promoters)} tone="text-success" />
      <Tile label="Neutros" value={String(nps.passives)} tone="text-warning" />
      <Tile label="Detratores" value={String(nps.detractors)} tone="text-danger" />
    </div>
  </Card>
);

const hours = (value: number | null): string =>
  value !== null
    ? `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} h`
    : '—';

const SupportCard: React.FC<{ support: EngagementSummary['support'] }> = ({ support }) => (
  <Card title="Suporte e SLA" hint="Tickets abertos e tempos dos últimos 30 dias">
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <Tile label="Em aberto" value={String(support.open)} />
      <Tile
        label="Aberto > 24h"
        value={String(support.openOver24h)}
        tone={support.openOver24h > 0 ? 'text-danger' : 'text-success'}
      />
      <Tile label="Resolvidos (30d)" value={String(support.resolved30d)} />
      <Tile label="Tempo de resolução" value={hours(support.avgResolutionH)} />
      <Tile label="1ª resposta" value={hours(support.avgFirstResponseH)} />
    </div>
  </Card>
);

const ChurnRiskCard: React.FC<{ churnRisk: EngagementChurnRisk[] }> = ({ churnRisk }) => (
  <Card
    title="Risco de churn"
    hint="Top salões com sinais de risco: atraso, trial a terminar ou inatividade"
  >
    {churnRisk.length === 0 ? (
      <p className="text-xs text-text-muted">Nenhum salão em risco no momento.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-text-muted uppercase tracking-widest font-bold">
            <tr>
              <th className="py-2 pr-4">Salão</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2">Motivos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {churnRisk.map((shop) => (
              <tr key={shop.id}>
                <td className="py-2 pr-4 font-bold text-text-primary">{shop.name}</td>
                <td className="py-2 pr-4 tabular-nums">
                  <span
                    className={`font-bold ${shop.score > 1 ? 'text-danger' : 'text-warning'}`}
                  >
                    {shop.score}
                  </span>
                </td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {shop.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full bg-bg border border-border px-2 py-0.5 text-[10px] text-text-secondary"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);

export { FunnelCard, FeaturesCard, NpsCard, SupportCard, ChurnRiskCard };
