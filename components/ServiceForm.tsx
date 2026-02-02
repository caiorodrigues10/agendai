import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Service } from '../types';
import { DynamicIcon, ICON_OPTIONS } from './DynamicIcon';
import { ServiceSchema, ServiceFormData } from '../schemas';
import { Save, AlertCircle } from 'lucide-react';

interface ServiceFormProps {
  initialService?: Service;
  onSave: (service: Omit<Service, 'id'>) => void;
  onCancel: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ initialService, onSave, onCancel }) => {
  const [selectedIcon, setSelectedIcon] = useState(initialService?.icon || 'Scissors');

  const { register, handleSubmit, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      name: initialService?.name || '',
      price: initialService?.price || 0,
      avgTimeMinutes: initialService?.avgTimeMinutes || 30,
      icon: initialService?.icon || 'Scissors'
    }
  });

  const onSubmit = (data: ServiceFormData) => {
    onSave({
      ...data,
      icon: selectedIcon
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-neutral-800 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">
          {initialService ? 'Editar Serviço' : 'Novo Serviço'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Nome do Serviço</label>
            <input
              type="text"
              className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder-neutral-700 ${errors.name ? 'border-red-500' : 'border-neutral-800'}`}
              placeholder="Ex: Corte Degrade"
              {...register('name')}
            />
            {errors.name && <span className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder-neutral-700 ${errors.price ? 'border-red-500' : 'border-neutral-800'}`}
                placeholder="0.00"
                {...register('price', { valueAsNumber: true })}
              />
               {errors.price && <span className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.price.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5">Tempo (min)</label>
              <input
                type="number"
                className={`w-full bg-neutral-950 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder-neutral-700 ${errors.avgTimeMinutes ? 'border-red-500' : 'border-neutral-800'}`}
                placeholder="30"
                {...register('avgTimeMinutes', { valueAsNumber: true })}
              />
              {errors.avgTimeMinutes && <span className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle size={10} /> {errors.avgTimeMinutes.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Ícone</label>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 max-h-48 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-5 gap-2">
                {ICON_OPTIONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedIcon(i)}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                      selectedIcon === i 
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 scale-105' 
                        : 'bg-neutral-900 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'
                    }`}
                  >
                    <DynamicIcon name={i} size={20} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-neutral-800 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold text-neutral-400 bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};