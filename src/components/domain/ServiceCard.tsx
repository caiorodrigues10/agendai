import React from 'react';
import { Service } from '../../types';
import { DynamicIcon } from '../ui/DynamicIcon';
import { Check } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, selected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 active:scale-[0.99] ${
        selected
          ? 'border-accent/60 bg-gradient-to-r from-accent/15 via-accent/10 to-transparent shadow-[0_12px_30px_rgba(0,0,0,0.18)]'
          : 'border-border bg-bg/80 hover:border-border-strong hover:bg-surface-2/90'
      }`}
    >
      {selected && (
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-accent" />
      )}

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
          selected
            ? 'bg-accent text-accent-fg shadow-lg shadow-accent/20'
            : 'bg-surface-2 text-text-secondary group-hover:bg-border-strong group-hover:text-text-primary'
        }`}
      >
        <DynamicIcon name={service.icon} size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-extrabold tracking-tight text-text-primary transition-colors duration-200">
          {service.name}
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-text-muted">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${
              selected ? 'border-accent/20 bg-accent/10 text-accent' : 'border-border bg-bg'
            }`}
          >
            ~{service.avgTimeMinutes} min
          </span>
          <span className={`font-bold ${selected ? 'text-accent' : 'text-text-secondary'}`}>
            R$ {service.price.toFixed(2)}
          </span>
        </p>
      </div>

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-500 ease-out ${
          selected
            ? 'border-accent bg-accent text-accent-fg scale-100 opacity-100 rotate-0'
            : 'border-border bg-bg text-transparent scale-75 opacity-0 -rotate-90'
        }`}
      >
        <Check size={16} strokeWidth={3} />
      </div>

      {/* Efeito de brilho no fundo quando selecionado */}
      {selected && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent" />
      )}
    </div>
  );
};
