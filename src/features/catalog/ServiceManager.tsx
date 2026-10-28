import React, { useState } from 'react';
import { LuTrash2 as RiDeleteBin6Line, LuPencil as RiPencilLine } from 'react-icons/lu';
import { PageHeader } from '../../components/patterns';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DynamicIcon } from '../../components/ui/DynamicIcon';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { useCategories } from '../../hooks/useCategories';
import { Service } from '../../types';
import { getErrorMessage } from '../../utils/errorMessage';
import { CategoryManager } from './CategoryManager';
import { PackageCatalog } from './PackageCatalog';
import { ServiceForm } from './ServiceForm';

interface ServiceManagerProps {
  services: Service[];
  onAdd: (service: Omit<Service, 'id'>) => void | Promise<void>;
  onEdit: (id: string, service: Omit<Service, 'id'>) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
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
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Serviços"
        description="Organize os serviços, preços e pacotes do salão."
        actions={<Button onClick={() => setIsAdding(true)}>Novo Serviço</Button>}
      />

      <CategoryManager
        key={categoryState.barbershopId || 'global'}
        title="Categorias de serviços"
        linkedLabel="Os serviços vinculados"
        state={categoryState}
        onChanged={(id, category) => updateServiceCategory(id, category?.name ?? null)}
      />
      <div className="space-y-3">
        {services.map(service => (
          <div
            key={service.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 transition-all hover:border-border-strong sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-text-secondary">
                <DynamicIcon name={service.icon} size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-text-primary">{service.name}</h4>
                <p className="break-words text-xs text-text-secondary">
                  {service.avgTimeMinutes} min • R$ {service.price.toFixed(2)}
                </p>
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  {categoryState.categories.find(c => c.id === service.categoryId)?.color && (
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          categoryState.categories.find(c => c.id === service.categoryId)?.color ||
                          undefined,
                      }}
                    />
                  )}
                  {categoryState.categories.find(c => c.id === service.categoryId)?.name ||
                    service.categoryName ||
                    'Sem categoria'}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center self-end gap-2 sm:self-auto">
              <button
                onClick={() => setEditingId(service.id)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg p-2 text-text-secondary transition-all hover:border-accent/30 hover:bg-selection hover:text-accent"
                aria-label={`Editar ${service.name}`}
                title="Editar"
              >
                <RiPencilLine size={18} />
              </button>
              <button
                onClick={() => {
                  setDeleteError('');
                  setServiceToDelete(service);
                }}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-bg p-2 text-text-secondary transition-all hover:border-danger/30 hover:bg-danger/10 hover:text-danger"
                aria-label={`Excluir ${service.name}`}
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
          onSave={async data => {
            await onAdd(data);
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
          onSave={async data => {
            await onEdit(editingId, data);
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
          deleteError ||
          (serviceToDelete
            ? `Tem certeza que deseja excluir "${serviceToDelete.name}"? Essa ação não pode ser desfeita.`
            : '')
        }
        variant="danger"
        loading={deleting}
        onConfirm={async () => {
          if (!serviceToDelete || deleting) return;
          setDeleting(true);
          setDeleteError('');
          try {
            await onDelete(serviceToDelete.id);
            setServiceToDelete(null);
          } catch (error) {
            setDeleteError(getErrorMessage(error, 'Não foi possível excluir o serviço.'));
          } finally {
            setDeleting(false);
          }
        }}
        onCancel={() => setServiceToDelete(null)}
      />
    </div>
  );
};
