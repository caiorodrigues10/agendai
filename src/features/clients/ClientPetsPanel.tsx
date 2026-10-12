import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LuPawPrint as Paw, LuPlus as Plus, LuPencil as Pencil, LuTrash2 as Trash } from 'react-icons/lu';
import { clientsApi, ClientPet, PetSpecies, PetSize } from '../../infra/clientsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR } from '../../components/ui/Field';
import { SmartSelect } from '../../components/ui/SmartSelect';

const PET_SPECIES_OPTIONS: { value: PetSpecies; label: string }[] = [
  { value: 'DOG', label: 'Cachorro' },
  { value: 'CAT', label: 'Gato' },
  { value: 'OTHER', label: 'Outro' },
];

const PET_SIZE_OPTIONS: { value: PetSize; label: string }[] = [
  { value: 'SMALL', label: 'Pequeno' },
  { value: 'MEDIUM', label: 'Médio' },
  { value: 'LARGE', label: 'Grande' },
  { value: 'EXTRA_LARGE', label: 'Gigante' },
];

const PetFormSchema = z.object({
  name: z.string().min(1, 'Informe o nome do pet').max(120),
  breed: z.string().max(120).optional(),
  coat: z.string().max(120).optional(),
  notes: z.string().max(2000).optional(),
});

type PetFormData = z.infer<typeof PetFormSchema>;

function buildPetBody(data: PetFormData, species: PetSpecies, size: PetSize | '') {
  return {
    name: data.name.trim(),
    species,
    breed: data.breed?.trim() || null,
    size: size === '' ? null : size,
    coat: data.coat?.trim() || null,
    notes: data.notes?.trim() || null,
  };
}

function petFormDefaults(editing: ClientPet | null): PetFormData {
  return {
    name: editing?.name ?? '',
    breed: editing?.breed ?? '',
    coat: editing?.coat ?? '',
    notes: editing?.notes ?? '',
  };
}

interface PetFormProps {
  clientId: string;
  editing: ClientPet | null;
  onSaved: () => void;
  onCancel: () => void;
}

const PetForm: React.FC<PetFormProps> = ({ clientId, editing, onSaved, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [species, setSpecies] = useState<PetSpecies>(editing?.species ?? 'DOG');
  const [size, setSize] = useState<PetSize | ''>(editing?.size ?? '');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PetFormData>({
    resolver: zodResolver(PetFormSchema),
    defaultValues: petFormDefaults(editing),
  });

  const onSubmit = async (data: PetFormData) => {
    setSaving(true);
    setError(null);
    try {
      const body = buildPetBody(data, species, size);
      if (editing) await clientsApi.updatePet(clientId, editing.id, body);
      else await clientsApi.createPet(clientId, body);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 rounded-xl border border-accent/30 bg-accent/5 p-3">
      <p className="text-xs font-bold text-text-primary">{editing ? 'Editar pet' : 'Novo pet'}</p>
      {error && (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}
      <Field label="Nome" error={errors.name?.message}>
        <input
          className={errors.name ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
          placeholder="Ex: Rex"
          {...register('name')}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 text-[11px] font-bold text-text-secondary">Espécie</p>
          <SmartSelect
            options={PET_SPECIES_OPTIONS}
            value={species}
            clearable={false}
            searchable={false}
            aria-label="Espécie"
            onChange={(v: string) => setSpecies(v as PetSpecies)}
          />
        </div>
        <div>
          <p className="mb-1 text-[11px] font-bold text-text-secondary">Porte</p>
          <SmartSelect
            options={[{ value: '', label: 'Não informar' }, ...PET_SIZE_OPTIONS]}
            value={size}
            clearable
            searchable={false}
            aria-label="Porte"
            onChange={(v: string) => setSize(v as PetSize | '')}
          />
        </div>
      </div>
      <Field label="Raça" error={errors.breed?.message}>
        <input className={FIELD_CONTROL} placeholder="Ex: Labrador" {...register('breed')} />
      </Field>
      <Field label="Pelagem" error={errors.coat?.message}>
        <input className={FIELD_CONTROL} placeholder="Ex: curta, longa" {...register('coat')} />
      </Field>
      <Field label="Observações" error={errors.notes?.message}>
        <textarea
          className={`${FIELD_CONTROL} resize-none`}
          rows={2}
          placeholder="Alimentação, comportamento..."
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

interface ClientPetsPanelProps {
  clientId: string;
  /** Recarrega a lista após criar/editar/remover (usado pelo sheet para refresh). */
  onChanged?: () => void;
}

export const ClientPetsPanel: React.FC<ClientPetsPanelProps> = ({ clientId, onChanged }) => {
  const [pets, setPets] = useState<ClientPet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClientPet | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ClientPet | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPets(await clientsApi.listPets(clientId));
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

  const startForm = (pet?: ClientPet) => {
    setEditing(pet ?? null);
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
      await clientsApi.deletePet(clientId, confirmDelete.id);
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
          <Paw size={12} /> Pets
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
        <PetForm
          key={editing?.id ?? 'new'}
          clientId={clientId}
          editing={editing}
          onSaved={() => void handleSaved()}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-4 text-text-muted">
          <span className="animate-pulse text-xs">Carregando pets…</span>
        </div>
      ) : pets.length === 0 && !showForm ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-xs text-text-muted">
          Nenhum pet cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {pets.map(pet => (
            <li key={pet.id} className="flex items-start justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text-primary">
                  {pet.name}
                  {!pet.active && <span className="ml-2 text-[10px] font-bold text-text-muted">(inativo)</span>}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {[
                    PET_SPECIES_OPTIONS.find(o => o.value === pet.species)?.label,
                    pet.breed,
                    pet.size && PET_SIZE_OPTIONS.find(o => o.value === pet.size)?.label,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {pet.notes && <p className="mt-0.5 truncate text-xs text-text-secondary">{pet.notes}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => startForm(pet)}
                  aria-label={`Editar ${pet.name}`}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-primary"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(pet)}
                  aria-label={`Remover ${pet.name}`}
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
            Remover <strong>{confirmDelete.name}</strong>? O histórico já gravado no agendamento/fila é mantido.
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
