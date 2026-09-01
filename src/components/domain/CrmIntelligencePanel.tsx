import React, { useEffect, useState } from 'react';
import { BarChart3, BrainCircuit, Megaphone, RefreshCw, Users } from 'lucide-react';
import { crmApi, CrmForecast, CrmOverview, CrmSegment } from '../../infra/crmApi';
import { getErrorMessage } from '../../utils/errorMessage';

type Props = { canAnalytics: boolean; canCampaigns: boolean; onNotify?: (message: string, type?: 'success' | 'error' | 'bot') => void };
const money = (value: unknown) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0));

export const CrmIntelligencePanel: React.FC<Props> = ({ canAnalytics, canCampaigns, onNotify }) => {
  const [tab, setTab] = useState<'overview' | 'intelligence' | 'campaigns'>('overview');
  const [overview, setOverview] = useState<CrmOverview | null>(null);
  const [forecast, setForecast] = useState<CrmForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState({ name: 'Reativação de clientes', segment: 'inactive_30' as CrmSegment, message: 'Oi! Sentimos sua falta. Temos horários disponíveis esta semana — quer agendar?' });
  const [preview, setPreview] = useState<number | null>(null);

  const load = async () => {
    if (!canAnalytics) return;
    setLoading(true); setError(null);
    try { const [nextOverview, nextForecast] = await Promise.all([crmApi.overview({ compare: true }), crmApi.forecast(7)]); setOverview(nextOverview); setForecast(nextForecast); }
    catch (err) { setError(getErrorMessage(err, 'Não foi possível carregar a inteligência do CRM.')); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [canAnalytics]);
  if (!canAnalytics) return null;
  const kpis = overview?.kpis ?? {};
  const previewCampaign = async () => { try { const result = await crmApi.previewCampaign(campaign); setPreview(result.eligibleCount); } catch (err) { onNotify?.(getErrorMessage(err, 'Não foi possível calcular o público.'), 'error'); } };
  const confirmCampaign = async () => { try { await crmApi.createCampaign(campaign); setPreview(null); onNotify?.('Campanha confirmada e enviada para a fila.', 'success'); } catch (err) { onNotify?.(getErrorMessage(err, 'Não foi possível confirmar a campanha.'), 'error'); } };
  return <section className="mb-6 overflow-hidden rounded-2xl border border-accent/25 bg-surface shadow-sm">
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Super CRM</p><h2 className="text-lg font-bold text-text-primary">Clientes, receita e previsão no mesmo lugar</h2></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-bold text-text-secondary"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Atualizar</button>
    </div>
    <div className="flex overflow-x-auto border-b border-border px-3"><button onClick={() => setTab('overview')} className={`min-h-11 px-3 text-xs font-bold ${tab === 'overview' ? 'border-b-2 border-accent text-accent' : 'text-text-muted'}`}><BarChart3 className="mr-1 inline" size={14}/>Visão geral</button><button onClick={() => setTab('intelligence')} className={`min-h-11 px-3 text-xs font-bold ${tab === 'intelligence' ? 'border-b-2 border-accent text-accent' : 'text-text-muted'}`}><BrainCircuit className="mr-1 inline" size={14}/>Inteligência</button>{canCampaigns && <button onClick={() => setTab('campaigns')} className={`min-h-11 px-3 text-xs font-bold ${tab === 'campaigns' ? 'border-b-2 border-accent text-accent' : 'text-text-muted'}`}><Megaphone className="mr-1 inline" size={14}/>Campanhas</button>}<span className="min-h-11 px-3 py-3 text-xs font-bold text-text-muted"><Users className="mr-1 inline" size={14}/>Clientes abaixo</span></div>
    {error && <p className="m-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}
    {tab === 'overview' && <div className="p-4"><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Faturamento bruto', kpis.grossRevenue], ['Recebido', kpis.receivedRevenue], ['Fiado em aberto', kpis.outstanding], ['Ticket médio', kpis.avgTicket]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-border bg-bg p-3"><p className="text-xs text-text-muted">{label}</p><strong className="mt-1 block text-base text-text-primary">{money(value)}</strong></div>)}</div><div className="mt-4 grid gap-3 lg:grid-cols-2"><div className="rounded-xl border border-border p-3"><p className="mb-2 text-sm font-bold text-text-primary">Clientes que mais retornam valor</p>{overview?.topClients.slice(0, 5).map(client => <div key={client.clientId} className="flex justify-between border-t border-border py-2 text-sm"><span>{client.name}<small className="ml-2 text-text-muted">{client.visits} visitas</small></span><strong>{money(client.ltv)}</strong></div>) || <p className="text-sm text-text-muted">Carregando dados...</p>}</div><div className="rounded-xl border border-border p-3"><p className="mb-2 text-sm font-bold text-text-primary">Segmentos acionáveis</p>{overview?.segments.slice(0, 5).map(segment => <div key={segment.segment} className="flex justify-between border-t border-border py-2 text-sm"><span>{segment.label}</span><span className="text-text-muted">{segment.count} · {money(segment.potential)}</span></div>)}</div></div></div>}
    {tab === 'intelligence' && <div className="p-4"><div className="mb-3 rounded-xl bg-accent/10 p-3 text-sm text-text-secondary">Modelo {forecast?.maturity === 'trained' ? 'treinado' : forecast?.maturity === 'preliminary' ? 'preliminar' : 'ainda precisa de mais histórico'}. {forecast?.historicalDays ?? 0} dias de dados analisados.</div><div className="space-y-2">{forecast?.predictions.map(item => <div key={item.date} className="rounded-xl border border-border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</strong><span className={item.risk === 'high' ? 'text-danger' : item.risk === 'medium' ? 'text-warning' : 'text-success'}>{item.weather ?? 'Sazonalidade'}</span><strong>{money(item.predictedRevenue)}</strong></div><p className="mt-1 text-xs text-text-muted">{item.predictedVisits} atendimentos · faixa {money(item.confidenceLow)}–{money(item.confidenceHigh)} · {item.factors.join(' · ')}</p></div>)}</div></div>}
    {tab === 'campaigns' && canCampaigns && <div className="space-y-3 p-4"><p className="text-sm text-text-secondary">A campanha só é enviada depois da sua confirmação e apenas para clientes que autorizaram comunicação.</p><input value={campaign.name} onChange={event => setCampaign({ ...campaign, name: event.target.value })} className="w-full rounded-lg border border-border bg-bg p-3 text-sm" placeholder="Nome da campanha"/><select value={campaign.segment} onChange={event => setCampaign({ ...campaign, segment: event.target.value as CrmSegment })} className="w-full rounded-lg border border-border bg-bg p-3 text-sm"><option value="inactive_30">Inativos há 30 dias</option><option value="at_risk">Em risco</option><option value="vip">VIP</option><option value="debtors">Devedores</option></select><textarea value={campaign.message} onChange={event => setCampaign({ ...campaign, message: event.target.value })} className="min-h-24 w-full rounded-lg border border-border bg-bg p-3 text-sm"/><div className="flex flex-wrap gap-2"><button onClick={() => void previewCampaign()} className="min-h-11 rounded-lg border border-accent px-4 text-sm font-bold text-accent">Calcular público</button>{preview !== null && <button onClick={() => void confirmCampaign()} className="min-h-11 rounded-lg bg-accent px-4 text-sm font-bold text-accent-fg">Confirmar para {preview} cliente(s)</button>}</div></div>}
  </section>;
};
