import React, { useState } from 'react';
import {
  LuCalendarDays as CalendarDays,
  LuCheck as Check,
  LuCopy as Copy,
  LuExternalLink as ExternalLink,
  LuQrCode as QrCode,
  LuShare2 as Share2,
  LuStore as Store,
  LuUsers as Users,
} from 'react-icons/lu';
import type { OperationMode } from '../../types';

interface PublicLinkPanelProps { barbershopId: string; operationMode?: OperationMode; }

const qrUrl = (url: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000`;

export const PublicLinkPanel: React.FC<PublicLinkPanelProps> = ({ barbershopId, operationMode }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl = `${window.location.origin}/queue/${barbershopId}`;

  const allDestinations = [
    { id: 'profile', label: 'Perfil do salão', description: 'Serviços, horários e publicações.', url: `${baseUrl}?tab=profile`, icon: Store, modes: undefined },
    { id: 'queue', label: 'Entrar na fila', description: 'Fila ao vivo do seu salão.', url: baseUrl, icon: Users, modes: ['HYBRID', 'QUEUE_ONLY'] as OperationMode[] },
    { id: 'appointments', label: 'Agendar horário', description: 'Agenda online para seus clientes.', url: `${baseUrl}?tab=appointments`, icon: CalendarDays, modes: ['HYBRID', 'APPOINTMENTS_ONLY'] as OperationMode[] },
  ] as const;

  const destinations = allDestinations.filter(d => !d.modes || d.modes.includes(operationMode ?? 'HYBRID'));
  const handleCopy = async (id: string, url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 2000);
  };
  const handleShare = async (id: string, label: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${label} — Agenda Já`, text: `Acesse ${label.toLowerCase()}`, url });
        return;
      } catch {
        return;
      }
    }
    await handleCopy(id, url);
  };
  return <section className="space-y-4">
    <header className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-text-muted">Links públicos</p>
      <h3 className="mt-1 text-balance text-xl font-bold text-text-primary sm:text-2xl">Compartilhe o destino certo</h3>
      <p className="mt-1 text-balance text-sm text-text-secondary sm:text-base">Cada link tem um QR Code próprio, pronto para imprimir ou divulgar.</p>
    </header>
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">{destinations.map(item => { const Icon = item.icon; const isCopied = copied === item.id; return <article key={item.id} className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface p-4 shadow-lg">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-text-secondary"><Icon size={19} /></span>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-text-primary">{item.label}</h4>
          <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{item.description}</p>
        </div>
      </div>
      {/* QR exige fundo branco (contraste do código) — a borda separa do card no tema escuro. */}
      <div className="mx-auto mt-4 aspect-square w-full max-w-[220px] rounded-2xl border border-border bg-white p-3 sm:max-w-[240px]"><img src={qrUrl(item.url)} alt={`QR Code para ${item.label}`} loading="lazy" className="h-auto w-full rounded-lg" /></div><p className="mt-2 flex items-center justify-center gap-1 text-xs text-text-muted"><QrCode size={12} className="shrink-0" /> QR Code preto e branco</p>
      <code title={item.url} className="mt-3 block w-full min-w-0 truncate rounded-xl border border-border bg-bg px-3 py-2 font-mono text-xs text-text-secondary sm:text-sm">{item.url}</code>
      <div className="mt-2 grid grid-cols-3 gap-2 max-[399px]:grid-cols-1"><button type="button" onClick={() => void handleCopy(item.id, item.url)} className="inline-flex h-11 min-w-0 items-center justify-center gap-1 rounded-xl border border-border bg-bg px-2 text-xs font-bold text-text-primary">{isCopied ? <Check size={14} className="shrink-0 text-success" /> : <Copy size={14} className="shrink-0" />}<span className="truncate">{isCopied ? 'Copiado' : 'Copiar'}</span></button><button type="button" onClick={() => void handleShare(item.id, item.label, item.url)} className="inline-flex h-11 min-w-0 items-center justify-center gap-1 rounded-xl border border-border bg-bg px-2 text-xs font-bold text-text-primary"><Share2 size={14} className="shrink-0" /><span className="truncate">Compartilhar</span></button><a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 min-w-0 items-center justify-center gap-1 rounded-xl bg-accent px-2 text-xs font-bold text-accent-fg"><ExternalLink size={14} className="shrink-0" /><span className="truncate">Abrir</span></a></div>
    </article>; })}</div>
  </section>;
};
