import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, ExternalLink, Rocket } from 'lucide-react';
import { barbershopApi } from '../../infra/barbershopApi';
import { getErrorMessage } from '../../utils/errorMessage';

interface Step { key: string; label: string; completed: boolean; required: boolean }
interface Props { barbershopId: string; shopName: string; onNavigate: (tab: string) => void; onDone?: () => void }

const destinations: Record<string, string> = { PROFILE: 'settings', SEGMENT: 'settings', SCHEDULE: 'settings', SERVICES: 'services', OPERATION_MODE: 'settings', PUBLIC_LINK: 'link' };
const titles: Record<string, string> = {
  PROFILE: 'Confirme os dados do seu salão', SEGMENT: 'Qual é o tipo do seu espaço?', SCHEDULE: 'Diga quando você atende', SERVICES: 'Cadastre o que seus clientes podem escolher',
  OPERATION_MODE: 'Escolha como seus clientes serão atendidos', PUBLIC_LINK: 'Coloque seu salão no ar',
};

export const OnboardingMissions: React.FC<Props> = ({ barbershopId, shopName, onNavigate, onDone }) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const required = useMemo(() => steps.filter(s => s.required), [steps]);
  const next = required.find(s => !s.completed);

  const load = async () => {
    setLoading(true); setError(null);
    try { const data = await barbershopApi.getOnboarding(barbershopId); setSteps(data.steps); setProgress(data.progress); }
    catch (err) { setError(getErrorMessage(err, 'Não foi possível carregar sua configuração inicial.')); }
    finally { setLoading(false); }
  };
  useEffect(() => { void barbershopApi.markOnboardingWelcomeSeen(barbershopId).catch(() => undefined); void load(); }, [barbershopId]);

  const confirm = async (step: Step) => {
    setBusy(true); setError(null);
    try { await barbershopApi.updateOnboardingStep(barbershopId, step.key); await load(); }
    catch (err) { setError(getErrorMessage(err, 'Conclua a configuração indicada antes de confirmar.')); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="rounded-2xl border border-border bg-surface p-6 text-text-secondary">Carregando suas missões…</div>;
  return <div className="mx-auto max-w-3xl space-y-5">
    <section className="rounded-2xl border border-accent/40 bg-surface p-5 sm:p-7">
      <div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent"><Rocket size={24} /></span><div><p className="text-xs font-bold uppercase tracking-[.2em] text-accent">Primeiro acesso</p><h1 className="mt-1 text-2xl font-black text-text-primary">Vamos colocar {shopName || 'seu salão'} no ar</h1><p className="mt-2 text-sm leading-relaxed text-text-secondary">São cinco missões rápidas para deixar fila, agenda e link público prontos. WhatsApp e instalação do aplicativo são opcionais.</p></div></div>
      <div className="mt-5"><div className="mb-2 flex justify-between text-xs font-bold text-text-secondary"><span>{required.filter(s => s.completed).length} de {required.length} concluídas</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-bg"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} /></div></div>
    </section>
    {error && <div role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</div>}
    <section className="space-y-3" aria-label="Missões de configuração">
      {required.map((step, index) => <div key={step.key} className={`rounded-2xl border p-4 transition ${step.completed ? 'border-success/30 bg-success/5' : step === next ? 'border-accent/50 bg-surface shadow-lg shadow-accent/5' : 'border-border bg-surface'}`}>
        <div className="flex items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${step.completed ? 'bg-success text-white' : 'bg-bg text-text-muted'}`}>{step.completed ? <Check size={18} /> : index + 1}</span><div className="min-w-0 flex-1"><h2 className="font-bold text-text-primary">{titles[step.key] || step.label}</h2><p className="mt-1 text-xs text-text-secondary">{step.completed ? 'Missão concluída' : step.label}</p></div>{!step.completed && <button type="button" disabled={busy} onClick={() => onNavigate(destinations[step.key] || 'settings')} className="flex min-h-11 items-center gap-1 rounded-xl bg-accent px-3 text-xs font-bold text-accent-fg">Configurar <ChevronRight size={15} /></button>}</div>
        {!step.completed && <div className="mt-3 flex justify-end"><button type="button" disabled={busy} onClick={() => confirm(step)} className="min-h-11 rounded-xl border border-border px-3 text-xs font-bold text-text-secondary hover:border-accent">Já configurei</button></div>}
      </div>)}
    </section>
    {required.every(s => s.completed) && <section className="rounded-2xl border border-success/40 bg-success/10 p-5 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success text-white"><Check /></div><h2 className="mt-3 text-xl font-black text-text-primary">Salão no ar 🎉</h2><p className="mt-1 text-sm text-text-secondary">Seu espaço está pronto para receber clientes.</p><div className="mt-4 flex flex-wrap justify-center gap-2"><button type="button" onClick={() => onNavigate('link')} className="min-h-11 rounded-xl bg-accent px-4 text-sm font-bold text-accent-fg">Compartilhar link</button><button type="button" onClick={onDone} className="min-h-11 rounded-xl border border-border px-4 text-sm font-bold text-text-secondary"><ExternalLink size={15} className="mr-1 inline" />Ir para o painel</button></div></section>}
    {required.every(s => s.completed) && <section className="rounded-2xl border border-border bg-surface p-5"><h2 className="font-bold text-text-primary">Deixe o AgendAI ainda melhor</h2><p className="mt-1 text-sm text-text-secondary">Estas melhorias são opcionais e podem ser feitas quando quiser.</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => onNavigate('settings')} className="min-h-11 rounded-xl border border-border px-3 text-left text-sm font-semibold text-text-primary">🔔 Configure um alerta de fila cheia</button><button type="button" onClick={() => onNavigate('settings')} className="min-h-11 rounded-xl border border-border px-3 text-left text-sm font-semibold text-text-primary">📱 Instale o AgendAI no celular</button><button type="button" onClick={() => onNavigate('team')} className="min-h-11 rounded-xl border border-border px-3 text-left text-sm font-semibold text-text-primary">👥 Cadastre sua equipe</button><button type="button" onClick={() => onNavigate('settings')} className="min-h-11 rounded-xl border border-border px-3 text-left text-sm font-semibold text-text-primary">⚙️ Personalize suas preferências</button></div></section>}
    <div className="text-center"><button type="button" onClick={() => { void barbershopApi.dismissOnboarding(barbershopId).finally(onDone); }} className="min-h-11 px-4 text-sm text-text-muted underline">Continuar depois</button></div>
  </div>;
};
