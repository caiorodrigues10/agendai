import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Service } from '../../types';
import { DynamicIcon, ICON_OPTIONS } from '../ui/DynamicIcon';
import { ServiceSchema, ServiceFormData } from '../../schemas';
import { AlertCircle } from 'lucide-react';

interface ServiceFormProps {
  initialService?: Service;
  onSave: (service: Omit<Service, 'id'>) => void;
  onCancel: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ initialService, onSave, onCancel }) => {
  const [selectedIcon, setSelectedIcon] = useState(initialService?.icon || 'Scissors');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      name: initialService?.name || '',
      price: initialService?.price || 0,
      avgTimeMinutes: initialService?.avgTimeMinutes || 30,
      icon: initialService?.icon || 'Scissors',
      commissionPercent: initialService?.commissionPercent ?? 0,
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    onSave({
      ...data,
      icon: selectedIcon,
    } as Omit<Service, 'id'>);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-text-primary mb-6">
          {initialService ? 'Editar Serviço' : 'Novo Serviço'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Comissão do serviço (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-accent outline-none"
              placeholder="Ex.: 40"
              {...register('commissionPercent', { valueAsNumber: true })}
            />
            <p className="text-[11px] text-text-muted mt-1">Percentual total para distribuir entre as profissionais.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Nome do Serviço
            </label>
            <input
              type="text"
              className={`w-full bg-bg border rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-text-muted ${errors.name ? 'border-danger' : 'border-border'}`}
              placeholder="Ex: Corte Degrade"
              {...register('name')}
            />
            {errors.name && (
              <span className="text-danger text-xs flex items-center gap-1 mt-1">
                <AlertCircle size={10} /> {errors.name.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                className={`w-full bg-bg border rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-text-muted ${errors.price ? 'border-danger' : 'border-border'}`}
                placeholder="0.00"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <span className="text-danger text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={10} /> {errors.price.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Tempo (min)
              </label>
              <input
                type="number"
                className={`w-full bg-bg border rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-text-muted ${errors.avgTimeMinutes ? 'border-danger' : 'border-border'}`}
                placeholder="30"
                {...register('avgTimeMinutes', { valueAsNumber: true })}
              />
              {errors.avgTimeMinutes && (
                <span className="text-danger text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={10} /> {errors.avgTimeMinutes.message}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Ícone</label>
            <div className="bg-bg p-3 rounded-xl border border-border max-h-48 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-5 gap-2">
                {ICON_OPTIONS.map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedIcon(i)}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                      selectedIcon === i
                        ? 'bg-accent text-accent-fg shadow-lg shadow-accent/20 scale-105'
                        : 'bg-surface text-text-muted hover:bg-surface-2 hover:text-text-secondary'
                    }`}
                  >
                    <DynamicIcon name={i} size={20} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold text-text-secondary bg-surface-2 hover:bg-border-strong transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl font-bold text-text-primary bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
