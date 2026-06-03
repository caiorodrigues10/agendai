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
          ? 'bg-cyan-950/30 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)] scale-[1.02]' 
          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/80'
      }`}
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
        selected 
          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 rotate-3' 
          : 'bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700 group-hover:text-neutral-300'
      }`}>
        <DynamicIcon name={service.icon} size={24} />
      </div>
      
      <div className="flex-1">
        <h3 className={`font-bold text-base transition-colors duration-200 ${selected ? 'text-white' : 'text-neutral-200'}`}>
          {service.name}
        </h3>
        <p className="text-sm text-neutral-500 font-medium">
          ~{service.avgTimeMinutes} min • <span className={`transition-colors ${selected ? 'text-cyan-400' : ''}`}>R$ {service.price.toFixed(2)}</span>
        </p>
      </div>

      <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ease-out ${
        selected 
          ? 'bg-cyan-500 text-white scale-100 opacity-100 rotate-0' 
          : 'bg-transparent text-transparent scale-50 opacity-0 -rotate-180'
      }`}>
        <Check size={16} strokeWidth={3} />
      </div>
      
      {/* Efeito de brilho no fundo quando selecionado */}
      {selected && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
};
