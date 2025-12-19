import React from 'react';
import { Service } from '../types';
import { DynamicIcon } from './DynamicIcon';
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
      className={`relative cursor-pointer rounded-xl p-4 border transition-all duration-200 flex items-center space-x-4 ${
        selected 
          ? 'bg-cyan-950/30 border-cyan-500 ring-1 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
      }`}
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-full shadow-inner ${selected ? 'bg-cyan-900/50 text-cyan-200' : 'bg-neutral-800 text-neutral-400'}`}>
        <DynamicIcon name={service.icon} size={24} />
      </div>
      <div className="flex-1">
        <h3 className={`font-semibold ${selected ? 'text-cyan-400' : 'text-neutral-200'}`}>
          {service.name}
        </h3>
        <p className="text-sm text-neutral-400">
          ~{service.avgTimeMinutes} min • R$ {service.price.toFixed(2)}
        </p>
      </div>
      {selected && (
        <div className="absolute top-4 right-4 text-cyan-400">
          <Check size={20} />
        </div>
      )}
    </div>
  );
};