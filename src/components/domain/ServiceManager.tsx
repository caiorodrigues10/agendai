import React, { useState } from 'react';
import { Service } from '../../types';
import { ServiceForm } from './ServiceForm';
import { DynamicIcon } from '../ui/DynamicIcon';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { PackageCatalog } from './PackageCatalog';

interface ServiceManagerProps {
  services: Service[];
  onAdd: (service: Omit<Service, 'id'>) => void;
  onEdit: (id: string, service: Omit<Service, 'id'>) => void;
  onDelete: (id: string) => void;
  canManagePackages?: boolean;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  services,
  onAdd,
  onEdit,
  onDelete,
  canManagePackages = true,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-text-primary">Gerenciar Serviços</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-1.5 bg-accent/10 text-accent border border-accent/50 rounded-lg text-xs font-bold hover:bg-accent-hover hover:text-black transition-all flex items-center gap-1"
        >
          <Plus size={14} /> Novo Serviço
        </button>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.id} className="bg-surface p-3 rounded-lg border border-border flex items-center justify-between hover:border-border-strong transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary">
                <DynamicIcon name={service.icon} size={20} />
              </div>
              <div>
                <h4 className="font-medium text-text-primary">{service.name}</h4>
                <p className="text-xs text-text-secondary">
                  {service.avgTimeMinutes} min • R$ {service.price.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingId(service.id)}
                className="p-2 text-text-secondary hover:text-accent transition-colors"
                title="Editar"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => {
                    if(confirm('Tem certeza que deseja excluir este serviço?')) {
                        onDelete(service.id);
                    }
                }}
                className="p-2 text-text-secondary hover:text-danger transition-colors"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <ServiceForm
          onSave={(data) => {
            onAdd(data);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {editingId && (
        <ServiceForm
          initialService={services.find(s => s.id === editingId)}
          onSave={(data) => {
            onEdit(editingId, data);
            setEditingId(null);
          }}
          onCancel={() => setEditingId(null)}
        />
      )}

      <PackageCatalog services={services} canManage={canManagePackages} />
    </div>
  );
};
