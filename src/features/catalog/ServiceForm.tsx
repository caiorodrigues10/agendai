import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ModalShell, SectionError } from '../../components/patterns';
import { DynamicIcon, ICON_OPTIONS } from '../../components/ui/DynamicIcon';
import {
  Field,
  FIELD_CONTROL,
  FIELD_CONTROL_ERROR,
  FORM_FOOTER,
  FORM_GRID,
} from '../../components/ui/Field';
import { SmartSelect } from '../../components/ui/SmartSelect';
import { Category } from '../../infra/categoriesApi';
import { ServiceFormData, ServiceSchema } from '../../schemas';
import { Service } from '../../types';
import { getErrorMessage } from '../../utils/errorMessage';

interface ServiceFormProps {
  initialService?: Service;
  categories?: Category[];
  categoriesLoading?: boolean;
  categoriesError?: string | null;
  onSave: (service: Omit<Service, 'id'>) => void | Promise<void>;
  onCancel: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  initialService,
  onSave,
  onCancel,
  categories = [],
  categoriesLoading = false,
  categoriesError,
}) => {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(initialService?.icon || 'Scissors');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      categoryId: initialService?.categoryId ?? null,
      name: initialService?.name || '',
      price: initialService?.price || 0,
      avgTimeMinutes: initialService?.avgTimeMinutes || 30,
      icon: initialService?.icon || 'Scissors',
      commissionPercent: initialService?.commissionPercent ?? 0,
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    if (saving) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSave({ ...data, icon: selectedIcon } as Omit<Service, 'id'>);
    } catch (error) {
      setSaveError(
        getErrorMessage(error, 'Não foi possível salvar o serviço. Seus dados foram mantidos.')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      open
      variant="sheet"
      titleId="service-form-title"
      loading={saving}
      onClose={onCancel}
      title={
        <h2 className="text-lg font-bold">{initialService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
      }
      body={
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {saveError && <SectionError message={saveError} />}
          <Field label="Nome do Serviço" error={errors.name?.message}>
            <input
              type="text"
              className={errors.name ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
              placeholder="Ex: Corte Degrade"
              {...register('name')}
            />
          </Field>

          <Field label="Categoria" error={categoriesError || errors.categoryId?.message}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <SmartSelect
                  aria-label="Categoria"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  loading={categoriesLoading}
                  disabled={categoriesLoading || !!categoriesError}
                  placeholder="Sem categoria"
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                />
              )}
            />
          </Field>
          <div className={FORM_GRID}>
            <Field label="Preço (R$)" error={errors.price?.message}>
              <input
                type="number"
                step="0.01"
                className={errors.price ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                placeholder="0.00"
                {...register('price', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Tempo (min)" error={errors.avgTimeMinutes?.message}>
              <input
                type="number"
                className={errors.avgTimeMinutes ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                placeholder="30"
                {...register('avgTimeMinutes', { valueAsNumber: true })}
              />
            </Field>
          </div>

          <Field
            label="Comissão do serviço (%)"
            hint="Percentual total para distribuir entre as profissionais."
            error={errors.commissionPercent?.message}
          >
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              className={errors.commissionPercent ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
              placeholder="Ex.: 40"
              {...register('commissionPercent', { valueAsNumber: true })}
            />
          </Field>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Ícone</label>
            <div className="bg-bg p-3 rounded-xl border border-border max-h-48 overflow-y-auto ag-scroll">
              <div className="grid grid-cols-5 gap-2">
                {ICON_OPTIONS.map(i => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Ícone ${i}`}
                    aria-pressed={selectedIcon === i}
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

          <div className={FORM_FOOTER}>
            <button
              type="button"
              disabled={saving}
              onClick={onCancel}
              className="min-h-11 flex-1 rounded-xl font-bold text-text-secondary bg-surface-2 hover:bg-border-strong transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 flex-1 rounded-xl font-bold text-accent-fg bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20 transition-colors"
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      }
    />
  );
};
