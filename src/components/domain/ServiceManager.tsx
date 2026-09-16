import { useCategories } from '../../hooks/useCategories';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { CategoryManager } from './CategoryManager';
import React, { useState } from 'react';
import { Service } from '../../types';
import { ServiceForm } from './ServiceForm';
import { DynamicIcon } from '../ui/DynamicIcon';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { RiAddLine, RiPencilLine, RiDeleteBin6Line } from 'react-icons/ri';
import { PackageCatalog } from './PackageCatalog';
import { Button } from '../ui/Button';

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
  const categoryState = useCategories('service');
  const { updateServiceCategory } = useBarbershop();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">Gerenciar Serviços</h3>
        <Button
          onClick={() => setIsAdding(true)}
        >
          <RiAddLine size={16} /> Novo Serviço
        </Button>
      </div>

      <CategoryManager key={categoryState.barbershopId || 'global'} title="Categorias de serviços" linkedLabel="Os serviços vinculados" state={categoryState} onChanged={(id, category) => updateServiceCategory(id, category?.name ?? null)} />
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
                  {service.avgTimeMinutes} min • R$ {service.price.toFixed(2)}
                </p>
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  {categoryState.categories.find(c => c.id === service.categoryId)?.color && <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: categoryState.categories.find(c => c.id === service.categoryId)?.color || undefined }} />}
                  {categoryState.categories.find(c => c.id === service.categoryId)?.name || service.categoryName || 'Sem categoria'}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center self-end gap-2 sm:self-auto">
              <button
                onClick={() => setEditingId(service.id)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-bg p-2 text-text-secondary transition-all hover:border-accent/30 hover:bg-selection hover:text-accent"
                title="Editar"
              >
                <RiPencilLine size={18} />
              </button>
              <button
                onClick={() => setServiceToDelete(service)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-bg p-2 text-text-secondary transition-all hover:border-danger/30 hover:bg-danger/10 hover:text-danger"
                title="Excluir"
              >
                <RiDeleteBin6Line size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <ServiceForm
          categories={categoryState.categories}
          categoriesLoading={categoryState.loading}
          categoriesError={categoryState.error}
          onSave={data => {
            onAdd(data);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {editingId && (
        <ServiceForm
          categories={categoryState.categories}
          categoriesLoading={categoryState.loading}
          categoriesError={categoryState.error}
          initialService={services.find(s => s.id === editingId)}
          onSave={data => {
            onEdit(editingId, data);
            setEditingId(null);
          }}
          onCancel={() => setEditingId(null)}
        />
      )}

      <PackageCatalog services={services} canManage={canManagePackages} />

      <ConfirmDialog
        open={serviceToDelete !== null}
        title="Excluir serviço"
        message={
          serviceToDelete
            ? `Tem certeza que deseja excluir "${serviceToDelete.name}"? Essa ação não pode ser desfeita.`
            : ''
        }
        variant="danger"
        onConfirm={() => {
          if (serviceToDelete) {
            onDelete(serviceToDelete.id);
            setServiceToDelete(null);
          }
        }}
        onCancel={() => setServiceToDelete(null)}
      />
    </div>
  );
};
