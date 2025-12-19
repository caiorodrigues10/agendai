import React, { useState } from 'react';
import { Service } from '../types';
import { DynamicIcon, ICON_OPTIONS } from './DynamicIcon';
import { Save, X } from 'lucide-react';

interface ServiceFormProps {
  initialService?: Service;
  onSave: (service: Omit<Service, 'id'>) => void;
  onCancel: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ initialService, onSave, onCancel }) => {
  const [name, setName] = useState(initialService?.name || '');
  const [price, setPrice] = useState(initialService?.price.toString() || '');
  const [time, setTime] = useState(initialService?.avgTimeMinutes.toString() || '30');
  const [icon, setIcon] = useState(initialService?.icon || 'Scissors');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !time) return;

    onSave({
      name,
      price: parseFloat(price),
      avgTimeMinutes: parseInt(time),
      icon
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-neutral-800 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">
          {initialService ? 'Editar Serviço' : 'Novo Serviço'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Nome do Serviço</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder-neutral-700"
              placeholder="Ex: Corte Degrade"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder-neutral-700"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5">Tempo (min)</label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder-neutral-700"
                placeholder="30"
                required
              />
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
                    onClick={() => setIcon(i)}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                      icon === i 
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