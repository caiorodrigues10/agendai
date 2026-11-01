import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LuScale as Scale, LuPlus as Plus, LuPencil as Pencil, LuTrash2 as Trash } from 'react-icons/lu';
import { clientsApi, ClientCase } from '../../infra/clientsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR } from '../../components/ui/Field';

const CaseFormSchema = z.object({
  nickname: z.string().min(1, 'Informe o apelido do caso').max(120),
  practiceArea: z.string().max(80).optional(),
  caseNumber: z.string().max(30).optional(),
  notes: z.string().max(500).optional(),
});

type CaseFormData = z.infer<typeof CaseFormSchema>;

function caseFormDefaults(editing: ClientCase | null): CaseFormData {
  return {
    nickname: editing?.nickname ?? '',
    practiceArea: editing?.practiceArea ?? '',
    caseNumber: editing?.caseNumber ?? '',
    notes: editing?.notes ?? '',
  };
}

interface CaseFormProps {
  clientId: string;
  editing: ClientCase | null;
  practiceAreas: string[];
  onSaved: () => void;
  onCancel: () => void;
}

const CaseForm: React.FC<CaseFormProps> = ({ clientId, editing, practiceAreas, onSaved, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CaseFormData>({
    resolver: zodResolver(CaseFormSchema),
    defaultValues: caseFormDefaults(editing),
  });

  useEffect(() => {
    reset(caseFormDefaults(editing));
  }, [editing, reset]);

  const onSubmit = async (data: CaseFormData) => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        nickname: data.nickname.trim(),
        practiceArea: data.practiceArea?.trim() || null,
        caseNumber: data.caseNumber?.trim() || null,
        notes: data.notes?.trim() || null,
      };
      if (editing) await clientsApi.updateCase(clientId, editing.id, body);
      else await clientsApi.createCase(clientId, body);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 rounded-xl border border-accent/30 bg-accent/5 p-3">
      <p className="text-xs font-bold text-text-primary">{editing ? 'Editar caso' : 'Novo caso'}</p>
      {error && (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}
      <Field label="Apelido do caso" error={errors.nickname?.message}>
        <input
          className={errors.nickname ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
          placeholder="Ex: Ação de cobrança"
          {...register('nickname')}
        />
      </Field>
      {practiceAreas.length > 0 && (
        <Field label="Área de atuação" error={errors.practiceArea?.message}>
          <select className={FIELD_CONTROL} {...register('practiceArea')}>
            <option value="">Não informar</option>
            {practiceAreas.map(area => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field
        label="Número do processo"
        hint="Padrão CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO (opcional)."
        error={errors.caseNumber?.message}
      >
        <input
          className={errors.caseNumber ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
          placeholder="0000000-00.0000.0.00.0000"
          {...register('caseNumber')}
        />
      </Field>
      <Field label="Observações" error={errors.notes?.message}>
        <textarea
          className={`${FIELD_CONTROL} resize-none`}
          rows={2}
          placeholder="Andamento, prazos, strategy..."
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

interface ClientCasesPanelProps {
  clientId: string;
  /** Áreas configuradas no estabelecimento (tags de Settings). */
  practiceAreas?: string[];
  onChanged?: () => void;
}

export const ClientCasesPanel: React.FC<ClientCasesPanelProps> = ({
  clientId,
  practiceAreas = [],
  onChanged,
}) => {
  const [cases, setCases] = useState<ClientCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClientCase | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ClientCase | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCases(await clientsApi.listCases(clientId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial da lista (mesmo padrão do painel de pets)
    if (clientId) void load();
  }, [clientId, load]);

  const startForm = (clientCase?: ClientCase) => {
    setEditing(clientCase ?? null);
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
      await clientsApi.deleteCase(clientId, confirmDelete.id);
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
          <Scale size={12} /> Casos
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
        <CaseForm
          key={editing?.id ?? 'new'}
          clientId={clientId}
          editing={editing}
          practiceAreas={practiceAreas}
          onSaved={() => void handleSaved()}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-4 text-text-muted">
          <span className="animate-pulse text-xs">Carregando casos…</span>
        </div>
      ) : cases.length === 0 && !showForm ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-xs text-text-muted">
          Nenhum caso cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {cases.map(clientCase => (
            <li key={clientCase.id} className="flex items-start justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text-primary">
                  {clientCase.nickname}
                  {!clientCase.active && <span className="ml-2 text-[10px] font-bold text-text-muted">(inativo)</span>}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {[clientCase.practiceArea, clientCase.caseNumber].filter(Boolean).join(' · ')}
                </p>
                {clientCase.notes && <p className="mt-0.5 truncate text-xs text-text-secondary">{clientCase.notes}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => startForm(clientCase)}
                  aria-label={`Editar ${clientCase.nickname}`}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-primary"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(clientCase)}
                  aria-label={`Remover ${clientCase.nickname}`}
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
            Remover <strong>{confirmDelete.nickname}</strong>? O histórico já gravado no agendamento é mantido.
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
