import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LuCar as Car, LuPlus as Plus, LuPencil as Pencil, LuTrash2 as Trash } from 'react-icons/lu';
import { clientsApi, ClientVehicle } from '../../infra/clientsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR } from '../../components/ui/Field';

/** Mesma normalização do backend (Zod): maiúscula, sem espaço/hífen. */
export function normalizePlate(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]/g, '');
}

const VehicleFormSchema = z.object({
  plate: z
    .string()
    .min(1, 'Informe a placa')
    .max(10)
    .transform(normalizePlate)
    .refine(v => /^[A-Z0-9]{7,8}$/.test(v), 'Placa inválida (ex.: ABC1234 ou ABC1D23)'),
  vehicleModel: z.string().min(1, 'Informe marca e modelo').max(120),
  color: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
});

type VehicleFormData = z.infer<typeof VehicleFormSchema>;

function buildVehicleBody(data: VehicleFormData) {
  return {
    plate: data.plate,
    vehicleModel: data.vehicleModel.trim(),
    color: data.color?.trim() || null,
    notes: data.notes?.trim() || null,
  };
}

function vehicleFormDefaults(editing: ClientVehicle | null): VehicleFormData {
  return {
    plate: editing?.plate ?? '',
    vehicleModel: editing?.vehicleModel ?? '',
    color: editing?.color ?? '',
    notes: editing?.notes ?? '',
  };
}

interface VehicleFormProps {
  clientId: string;
  editing: ClientVehicle | null;
  onSaved: () => void;
  onCancel: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ clientId, editing, onSaved, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(VehicleFormSchema),
    defaultValues: vehicleFormDefaults(editing),
  });

  const onSubmit = async (data: VehicleFormData) => {
    setSaving(true);
    setError(null);
    try {
      const body = buildVehicleBody(data);
      if (editing) await clientsApi.updateVehicle(clientId, editing.id, body);
      else await clientsApi.createVehicle(clientId, body);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 rounded-xl border border-accent/30 bg-accent/5 p-3">
      <p className="text-xs font-bold text-text-primary">{editing ? 'Editar veículo' : 'Novo veículo'}</p>
      {error && (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Field label="Placa" error={errors.plate?.message}>
          <input
            className={errors.plate ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
            placeholder="ABC1D23"
            autoCapitalize="characters"
            {...register('plate')}
          />
        </Field>
        <Field label="Cor" error={errors.color?.message}>
          <input className={FIELD_CONTROL} placeholder="Ex: preto" {...register('color')} />
        </Field>
      </div>
      <Field label="Marca e modelo" error={errors.vehicleModel?.message}>
        <input
          className={errors.vehicleModel ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
          placeholder="Ex: Honda CG 160"
          {...register('vehicleModel')}
        />
      </Field>
      <Field label="Observações" error={errors.notes?.message}>
        <textarea
          className={`${FIELD_CONTROL} resize-none`}
          rows={2}
          placeholder="Acessórios, sinais para identificar..."
          {...register('notes')}
        />
      </Field>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg bg-surface-2 py-2 text-xs font-bold text-text-secondary">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-accent py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
        >
          {saving ? 'Salvando…' : editing ? 'Salvar' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
};

interface ClientVehiclesPanelProps {
  clientId: string;
  /** Recarrega a lista após criar/editar/remover (usado pelo sheet para refresh). */
  onChanged?: () => void;
}

export const ClientVehiclesPanel: React.FC<ClientVehiclesPanelProps> = ({ clientId, onChanged }) => {
  const [vehicles, setVehicles] = useState<ClientVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClientVehicle | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ClientVehicle | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVehicles(await clientsApi.listVehicles(clientId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial da lista (mesmo padrão de useOnboardingStatus)
    if (clientId) void load();
  }, [clientId, load]);

  const startForm = (vehicle?: ClientVehicle) => {
    setEditing(vehicle ?? null);
    setShowForm(true);
  };

  const handleSaved = async () => {
    setShowForm(false);
    setEditing(null);
    await load();
    onChanged?.();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setError(null);
    try {
      await clientsApi.deleteVehicle(clientId, confirmDelete.id);
      setConfirmDelete(null);
      await load();
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
          <Car size={12} /> Veículos
        </p>
        <button
          type="button"
          onClick={() => startForm()}
          className="flex items-center gap-1 rounded-lg bg-accent/15 px-2 py-1 text-[11px] font-bold text-accent hover:bg-accent/25"
        >
          <Plus size={12} /> Novo
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}

      {showForm && (
        <VehicleForm
          key={editing?.id ?? 'new'}
          clientId={clientId}
          editing={editing}
          onSaved={() => void handleSaved()}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-4 text-text-muted">
          <span className="animate-pulse text-xs">Carregando veículos…</span>
        </div>
      ) : vehicles.length === 0 && !showForm ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-xs text-text-muted">
          Nenhum veículo cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {vehicles.map(vehicle => (
            <li key={vehicle.id} className="flex items-start justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text-primary">
                  {vehicle.plate}
                  {!vehicle.active && <span className="ml-2 text-[10px] font-bold text-text-muted">(inativo)</span>}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {[vehicle.vehicleModel, vehicle.color].filter(Boolean).join(' · ')}
                </p>
                {vehicle.notes && <p className="mt-0.5 truncate text-xs text-text-secondary">{vehicle.notes}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => startForm(vehicle)}
                  aria-label={`Editar ${vehicle.plate}`}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-primary"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(vehicle)}
                  aria-label={`Remover ${vehicle.plate}`}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {confirmDelete && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-3">
          <p className="text-xs text-text-primary">
            Remover <strong>{confirmDelete.plate}</strong>? O histórico já gravado no agendamento/fila é mantido.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="flex-1 rounded-lg bg-surface-2 py-2 text-xs font-bold text-text-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="flex-1 rounded-lg bg-danger py-2 text-xs font-bold text-white"
            >
              Remover
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
