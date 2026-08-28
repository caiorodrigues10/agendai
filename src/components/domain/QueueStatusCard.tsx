import React from 'react';
import { Clock, Sparkles, Users, CheckCircle2, Scissors, Store } from 'lucide-react';
import { AIInsight } from '../../types';

type BusyLevel = AIInsight['busyLevel'];

function busyCopy(isOpen: boolean, level?: BusyLevel) {
  if (!isOpen) return 'Fechado';
  if (level === 'high') return 'Movimento alto';
  if (level === 'medium') return 'Movimento médio';
  return 'Movimento tranquilo';
}

function busyStyles(isOpen: boolean, level?: BusyLevel) {
  if (!isOpen) {
    return {
      bar: 'bg-text-muted',
      glow: 'bg-text-muted/10',
      badge: 'bg-surface-2 text-text-secondary border-border-strong',
    };
  }
  if (level === 'high') {
    return {
      bar: 'bg-danger',
      glow: 'bg-danger/15',
      badge: 'bg-danger/10 text-danger border-danger/30',
    };
  }
  if (level === 'medium') {
    return {
      bar: 'bg-warning',
      glow: 'bg-warning/15',
      badge: 'bg-warning/10 text-warning border-warning/30',
    };
  }
  return {
    bar: 'bg-success',
    glow: 'bg-success/15',
    badge: 'bg-success/10 text-success border-success/30',
  };
}

interface QueueStatusCardProps {
  shopName?: string;
  isOpen: boolean;
  insight: AIInsight | null;
  peopleWaiting?: number;
  completedCount?: number;
  inChairName?: string | null;
  /** Inclui espera / fila / cadeira no próprio card (painel da equipe). */
  showStaffStats?: boolean;
}

export const QueueStatusCard: React.FC<QueueStatusCardProps> = ({
  shopName,
  isOpen,
  insight,
  peopleWaiting = 0,
  completedCount = 0,
  inChairName = null,
  showStaffStats = false,
}) => {
  const tone = busyStyles(isOpen, insight?.busyLevel);
  const wait = insight?.estimatedWait || (showStaffStats ? '--' : '0 min');

  return (
    <div className="mb-6 relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className={`absolute inset-y-0 left-0 w-1.5 ${tone.bar}`} />
      <div
        className={`pointer-events-none absolute -top-12 -right-8 h-36 w-36 rounded-full blur-3xl ${tone.glow}`}
      />

      <div className="relative pl-5 pr-5 pt-5 pb-5 sm:pl-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
              Fila ao vivo
            </p>
            <h2 className="text-xl font-bold text-text-primary tracking-tight truncate">
              {shopName || 'Salão'}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
              <Store size={13} className="text-accent shrink-0" />
              {isOpen ? 'Aberto agora' : 'Fechado agora'}
            </p>
          </div>
          <span
            className={`shrink-0 text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${tone.badge}`}
          >
            {busyCopy(isOpen, insight?.busyLevel)}
          </span>
        </div>

        {showStaffStats ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-xl bg-bg border border-border px-3 py-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">
                <Clock size={12} /> Espera
              </div>
              <p className="text-lg font-bold text-text-primary leading-none">{wait}</p>
            </div>
            <div className="rounded-xl bg-bg border border-border px-3 py-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">
                <Users size={12} /> Fila
              </div>
              <p className="text-lg font-bold text-text-primary leading-none">{peopleWaiting}</p>
            </div>
            <div className="rounded-xl bg-bg border border-border px-3 py-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">
                {inChairName ? <Scissors size={12} /> : <CheckCircle2 size={12} />}
                {inChairName ? 'Cadeira' : 'Hoje'}
              </div>
              <p className="text-lg font-bold text-text-primary leading-none truncate">
                {inChairName ? inChairName.split(' ')[0] : completedCount}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-end gap-2">
              <Clock size={28} className="text-accent mb-1" />
              <span className="text-4xl font-bold text-text-primary tracking-tight leading-none">
                {wait}
              </span>
            </div>
            <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
              Tempo estimado de espera
            </p>
          </div>
        )}

        <div className="rounded-xl bg-bg/80 border border-border px-3.5 py-3 flex gap-2.5">
          <Sparkles size={16} className="text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary leading-relaxed">
            {insight?.message ||
              (isOpen
                ? 'O salão está pronto para atender.'
                : 'Fora do horário de funcionamento.')}
          </p>
        </div>
      </div>
    </div>
  );
};
