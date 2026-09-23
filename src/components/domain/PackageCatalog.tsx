import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuPencil as Pencil, LuPlus as Plus, LuPackage as Package } from 'react-icons/lu';
import { Service, ServicePackage } from '../../types';
import { packagesApi } from '../../infra/packagesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR, FORM_FOOTER, FORM_GRID } from '../ui/Field';
import { SmartSelect } from '../ui/SmartSelect';
import { PackageCatalogSchema, PackageCatalogFormData } from '../../schemas';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface PackageCatalogProps {
  services: Service[];
  canManage: boolean;
}

export const PackageCatalog: React.FC<PackageCatalogProps> = ({ services, canManage }) => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PackageCatalogFormData>({
    resolver: zodResolver(PackageCatalogSchema),
    defaultValues: {
      name: '',
      serviceId: '',
      sessionCount: 5,
      price: 0,
      validityDays: 90,
    },
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await packagesApi.listCatalog();
      setPackages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (pkg: ServicePackage) => {
    setEditingId(pkg.id);
    setIsAdding(false);
    reset({
      name: pkg.name,
      serviceId: pkg.serviceId,
      sessionCount: pkg.sessionCount,
      price: pkg.price,
      validityDays: pkg.validityDays ?? null,
    });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    reset({ name: '', serviceId: services[0]?.id ?? '', sessionCount: 5, price: 0, validityDays: 90 });
  };

  const onSubmit = async (data: PackageCatalogFormData) => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: data.name.trim(),
        serviceId: data.serviceId,
        sessionCount: data.sessionCount,
        price: data.price,
        validityDays: data.validityDays ?? null,
      };
      if (editingId) {
        await packagesApi.updateCatalog(editingId, payload);
      } else {
        await packagesApi.createCatalog(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (pkg: ServicePackage) => {
    setError(null);
    try {
      await packagesApi.updateCatalog(pkg.id, { active: !pkg.active });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Package size={18} className="text-accent" /> Pacotes
        </h3>
        {canManage && (
          <button
            type="button"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              reset({ name: '', serviceId: services[0]?.id ?? '', sessionCount: 5, price: 0, validityDays: 90 });
            }}
            className="px-3 py-1.5 bg-accent/10 text-accent border border-accent/50 rounded-lg text-xs font-bold hover:bg-accent-hover hover:text-black transition-all flex items-center gap-1"
          >
            <Plus size={14} /> Novo pacote
          </button>
        )}
      </div>

      {error && <p className="text-sm text-danger mb-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-text-muted">Carregando pacotes...</p>
      ) : packages.length === 0 && !isAdding ? (
        <p className="text-sm text-text-muted bg-surface border border-dashed border-border rounded-xl px-4 py-6 text-center">
          Nenhum pacote cadastrado. Ex.: 5 cortes com desconto.
        </p>
      ) : (
        <div className="space-y-3">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="bg-surface p-3 rounded-lg border border-border flex items-center justify-between"
            >
              <div>
                <h4 className="font-medium text-text-primary">{pkg.name}</h4>
                <p className="text-xs text-text-secondary">
                  {pkg.sessionCount} sessões · {pkg.serviceName ?? 'Serviço'} ·{' '}
                  {brl.format(pkg.price)}
                  {pkg.validityDays ? ` · ${pkg.validityDays} dias` : ' · sem validade'}
                  {!pkg.active ? ' · inativo' : ''}
                </p>
              </div>
              {canManage && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(pkg)}
                    className="p-2 text-text-secondary hover:text-accent transition-colors"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(pkg)}
                    className="px-2 py-1 text-[11px] font-bold rounded-md border border-border text-text-secondary hover:text-text-primary"
                  >
                    {pkg.active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(isAdding || editingId) && canManage && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 space-y-4 rounded-xl border border-border bg-surface p-4"
        >
          <Field label="Nome" error={errors.name?.message}>
            <input
              className={errors.name ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
              placeholder="Ex.: Pacote 5 cortes"
              {...register('name')}
            />
          </Field>
          <Controller
            control={control}
            name="serviceId"
            render={({ field, fieldState }) => (
              <SmartSelect
                label="Serviço de cada sessão"
                value={field.value || null}
                onChange={value => field.onChange(value ?? '')}
                error={fieldState.error?.message}
                options={[
                  { value: '', label: 'Selecione um serviço' },
                  ...services.map(s => ({ value: s.id, label: s.name })),
                ]}
                searchable="auto"
              />
            )}
          />
          <div className={FORM_GRID}>
            <Field label="Sessões" error={errors.sessionCount?.message}>
              <input
                type="number"
                min={2}
                className={errors.sessionCount ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                placeholder="5"
                {...register('sessionCount')}
              />
            </Field>
            <Field label="Preço (R$)" error={errors.price?.message}>
              <input
                className={errors.price ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                placeholder="0,00"
                {...register('price')}
              />
            </Field>
          </div>
          <Field label="Validade (dias)" hint="Deixe em branco para sem validade" error={errors.validityDays?.message}>
            <input
              type="number"
              min={1}
              className={FIELD_CONTROL}
              placeholder="90"
              {...register('validityDays')}
            />
          </Field>
          <div className={FORM_FOOTER}>
            <button
              type="button"
              onClick={resetForm}
              className="min-h-11 flex-1 rounded-xl bg-surface-2 py-3 text-sm font-bold text-text-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 flex-1 rounded-xl bg-accent py-3 text-sm font-bold text-accent-fg hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? 'Salvando…' : 'Salvar pacote'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
