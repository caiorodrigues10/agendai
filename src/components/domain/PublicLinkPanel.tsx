import React, { useState } from 'react';
import { CalendarDays, Check, Copy, ExternalLink, QrCode, Store, Users } from 'lucide-react';
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
  return <section className="space-y-4">
    <header className="rounded-2xl border border-border bg-surface p-4 sm:p-5"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">Links públicos</p><h3 className="mt-1 text-lg font-bold text-text-primary">Compartilhe o destino certo</h3><p className="mt-1 text-sm text-text-secondary">Cada link tem um QR Code próprio, pronto para imprimir ou divulgar.</p></header>
    <div className="grid gap-4 xl:grid-cols-3">{destinations.map(item => { const Icon = item.icon; const isCopied = copied === item.id; return <article key={item.id} className="rounded-2xl border border-border bg-surface p-4 shadow-lg">
      <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent"><Icon size={19} /></span><div><h4 className="text-sm font-bold text-text-primary">{item.label}</h4><p className="mt-1 text-xs text-text-secondary">{item.description}</p></div></div>
      <div className="mt-4 flex justify-center rounded-2xl bg-white p-3"><img src={qrUrl(item.url)} alt={`QR Code para ${item.label}`} width={180} height={180} className="h-44 w-44 rounded-lg" /></div><p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-text-muted"><QrCode size={12} /> QR Code preto e branco</p>
      <code className="mt-3 block truncate rounded-xl border border-border bg-bg px-3 py-2 text-[11px] text-text-secondary">{item.url}</code>
      <div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={() => void handleCopy(item.id, item.url)} className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-bg px-3 py-2.5 text-xs font-bold text-text-primary">{isCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}{isCopied ? 'Copiado' : 'Copiar'}</button><a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 rounded-xl bg-accent px-3 py-2.5 text-xs font-bold text-accent-fg"><ExternalLink size={14} /> Abrir</a></div>
    </article>; })}</div>
  </section>;
};
