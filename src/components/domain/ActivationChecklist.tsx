import React, { useMemo, useState } from 'react';
import { Check, Circle, ExternalLink, Rocket } from 'lucide-react';
import { Service, ShopSettings } from '../../types';

interface Props {
  barbershopId: string;
  settings: ShopSettings;
  services: Service[];
  onNavigate: (tab: string) => void;
}

export const ActivationChecklist: React.FC<Props> = ({ barbershopId, settings, services, onNavigate }) => {
  const storageKey = `agendai:onboarding:${barbershopId}:public-link-tested`;
  const [linkTested, setLinkTested] = useState(() => localStorage.getItem(storageKey) === 'yes');
  const steps = useMemo(() => [
    { id: 'shop', label: 'Complete os dados do salão', done: Boolean(settings.shopName.trim() && settings.address?.trim()), tab: 'settings' },
    { id: 'schedule', label: 'Configure os horários de funcionamento', done: settings.schedule.some(day => day.isOpen), tab: 'settings' },
    { id: 'service', label: 'Cadastre o primeiro serviço', done: services.length > 0, tab: 'services' },
    { id: 'link', label: 'Teste o link público como cliente', done: linkTested, tab: 'link' },
    { id: 'whatsapp', label: 'WhatsApp (opcional)', done: settings.whatsapp.replace(/\D/g, '').length >= 10, tab: 'settings', optional: true },
  ], [linkTested, services, settings]);
  const required = steps.filter(step => !step.optional);
  const complete = required.every(step => step.done);

  const openStep = (step: (typeof steps)[number]) => {
    if (step.id === 'link') {
      localStorage.setItem(storageKey, 'yes');
      setLinkTested(true);
      window.open(`${window.location.origin}/queue/${barbershopId}?tab=appointments`, '_blank', 'noopener,noreferrer');
      return;
    }
    onNavigate(step.tab);
  };

  return (
    <section className={`rounded-xl border p-4 sm:p-5 ${complete ? 'border-success/40 bg-success/5' : 'border-accent/40 bg-surface'}`} aria-labelledby="activation-title">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent"><Rocket size={20} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Primeiros passos</p>
          <h2 id="activation-title" className="mt-1 text-lg font-bold text-text-primary">{complete ? 'Seu salão está pronto para receber clientes' : 'Ative seu salão sem depender de suporte'}</h2>
          <p className="mt-1 text-sm text-text-secondary">{required.filter(step => step.done).length} de {required.length} etapas obrigatórias concluídas.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map(step => (
          <button key={step.id} type="button" onClick={() => openStep(step)} className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-bg px-3 py-2 text-left transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            {step.done ? <Check size={18} className="shrink-0 text-success" aria-hidden="true" /> : <Circle size={18} className="shrink-0 text-text-muted" aria-hidden="true" />}
            <span className="min-w-0 flex-1 text-sm font-medium text-text-primary">{step.label}</span>
            {step.id === 'link' && <ExternalLink size={15} className="shrink-0 text-text-muted" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </section>
  );
};
