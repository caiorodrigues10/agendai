import React, { useEffect, useState } from 'react';
import { Check, ChevronRight, Loader2, Rocket } from 'lucide-react';
import { barbershopApi } from '../../infra/barbershopApi';

interface Props {
  barbershopId: string;
  onNavigate: (tab: string) => void;
}

export const ActivationChecklist: React.FC<Props> = ({ barbershopId, onNavigate }) => {
  const [state, setState] = useState<{ progress: number; completed: boolean } | null>(null);
  useEffect(() => {
    let active = true;
    void barbershopApi.getOnboarding(barbershopId).then(data => { if (active) setState(data); }).catch(() => undefined);
    return () => { active = false; };
  }, [barbershopId]);
  if (!state) return <div className="flex min-h-20 items-center justify-center rounded-xl border border-border bg-surface text-text-muted"><Loader2 className="animate-spin" size={18} /></div>;
  if (state.completed) return null;

  return (
    <section className="rounded-xl border border-accent/40 bg-surface p-4" aria-labelledby="activation-title">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent"><Rocket size={20} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Configuração inicial</p>
          <h2 id="activation-title" className="mt-1 font-bold text-text-primary">Seu salão está {state.progress}% pronto</h2>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg"><div className="h-full rounded-full bg-accent" style={{ width: `${state.progress}%` }} /></div>
        </div>
        <button type="button" onClick={() => onNavigate('onboarding')} className="flex min-h-11 shrink-0 items-center gap-1 rounded-xl bg-accent px-3 text-xs font-bold text-accent-fg">Continuar <ChevronRight size={15} /></button>
      </div>
      <p className="mt-3 flex items-center gap-1 text-xs text-text-muted"><Check size={14} /> Você pode concluir depois sem perder o progresso.</p>
    </section>
  );
};
