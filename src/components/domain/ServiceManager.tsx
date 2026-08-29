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
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">Gerenciar ServiÃ§os</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-xs font-bold text-accent transition-all hover:bg-accent-hover hover:text-black"
        >
          <Plus size={14} /> Novo ServiÃ§o
        </button>
      </div>

      <div className="space-y-3">
        {services.map(service => (
          <div
            key={service.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 transition-all hover:border-border-strong sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-text-secondary">
                <DynamicIcon name={service.icon} size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-text-primary">{service.name}</h4>
                <p className="break-words text-xs text-text-secondary">
                  {service.avgTimeMinutes} min â€¢ R$ {service.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex self-end gap-2 sm:self-auto">
              <button
                onClick={() => setEditingId(service.id)}
                className="min-h-10 min-w-10 rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-accent"
                title="Editar"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir este serviÃ§o?')) {
                    onDelete(service.id);
                  }
                }}
                className="min-h-10 min-w-10 rounded-lg p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
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
          onSave={data => {
            onAdd(data);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {editingId && (
        <ServiceForm
          initialService={services.find(s => s.id === editingId)}
          onSave={data => {
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
