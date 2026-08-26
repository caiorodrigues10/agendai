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
      className={`relative cursor-pointer rounded-xl p-4 border transition-all duration-300 flex items-center gap-4 group overflow-hidden ${
        selected
          ? 'bg-accent/10 border-accent shadow-lg shadow-accent/10 scale-[1.02]'
          : 'bg-surface border-border hover:border-border-strong hover:bg-surface-2/80'
      }`}
    >
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
          selected
            ? 'bg-accent text-accent-fg shadow-lg shadow-accent/25 rotate-3'
            : 'bg-surface-2 text-text-secondary group-hover:bg-border-strong group-hover:text-text-primary'
        }`}
      >
        <DynamicIcon name={service.icon} size={24} />
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-base transition-colors duration-200 text-text-primary">
          {service.name}
        </h3>
        <p className="text-sm text-text-muted font-medium">
          ~{service.avgTimeMinutes} min •{' '}
          <span className={`transition-colors ${selected ? 'text-accent' : ''}`}>
            R$ {service.price.toFixed(2)}
          </span>
        </p>
      </div>

      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ease-out ${
          selected
            ? 'bg-accent text-accent-fg scale-100 opacity-100 rotate-0'
            : 'bg-transparent text-transparent scale-50 opacity-0 -rotate-180'
        }`}
      >
        <Check size={16} strokeWidth={3} />
      </div>

      {/* Efeito de brilho no fundo quando selecionado */}
      {selected && (
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
};
