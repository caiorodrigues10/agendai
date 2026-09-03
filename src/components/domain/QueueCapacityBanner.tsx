import React, { useEffect, useState } from 'react';
import { AlertTriangle, Settings } from 'lucide-react';
import { barbershopApi, QueueAlertSettings } from '../../infra/barbershopApi';

export const QueueCapacityBanner: React.FC<{ barbershopId?: string; waiting: number; onNavigate: (tab: string) => void; canConfigure?: boolean }> = ({ barbershopId, waiting, onNavigate, canConfigure }) => {
  const [config, setConfig] = useState<QueueAlertSettings | null>(null);
  useEffect(() => { if (barbershopId) void barbershopApi.getQueueAlert(barbershopId).then(setConfig).catch(() => undefined); }, [barbershopId]);
  if (!config?.enabled || waiting <= config.threshold) return null;
  return <div className="mb-4 rounded-xl border border-warning/40 bg-warning/10 p-3" role="status"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-warning" size={18} /><div className="min-w-0 flex-1"><p className="text-sm font-bold text-warning">Fila acima do limite configurado</p><p className="mt-1 text-xs text-text-secondary">{waiting} clientes aguardando (limite: {config.threshold}).</p>{!config.whatsappConnected && <p className="mt-1 text-xs text-text-muted">Alerta no painel ativo; WhatsApp não conectado.</p>}<div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => onNavigate('queue')} className="min-h-10 rounded-lg bg-warning px-3 text-xs font-bold text-black">Ver fila</button>{canConfigure && <button type="button" onClick={() => onNavigate('settings')} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-warning/40 px-3 text-xs font-bold text-warning"><Settings size={14} /> Ajustar alerta</button>}</div></div></div></div>;
};
