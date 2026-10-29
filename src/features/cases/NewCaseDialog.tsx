import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LuArrowLeft as ArrowLeft } from 'react-icons/lu';
import { clientsApi } from '../../infra/clientsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR } from '../../components/ui/Field';

const NewCaseSchema = z.object({
  clientId: z.string().min(1, 'Selecione o cliente'),
  nickname: z.string().trim().min(1, 'Informe o apelido do processo').max(120),
  practiceArea: z.string().trim().max(80).optional(),
  caseNumber: z.string().trim().max(30).optional(),
});

type NewCaseData = z.infer<typeof NewCaseSchema>;

interface NewCaseDialogProps {
  practiceAreas: string[];
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}

/** Diálogo de criação de processo: escolhe o cliente e os dados do processo. */
export const NewCaseDialog: React.FC<NewCaseDialogProps> = ({
  practiceAreas,
  onClose,
  onCreated,
}) => {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [clientOptions, setClientOptions] = useState<{ id: string; name: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NewCaseData>({
    resolver: zodResolver(NewCaseSchema),
    defaultValues: { clientId: '', nickname: '', practiceArea: '', caseNumber: '' },
  });

  useEffect(() => {
    let active = true;
    const run = async () => {
      setSearching(true);
      try {
        const result = await clientsApi.list({ search: clientSearch || undefined, limit: 20 });
        if (!active) return;
        setClientOptions(result.data.map(client => ({ id: client.id, name: client.name })));
      } catch {
        if (active) setClientOptions([]);
      } finally {
        if (active) setSearching(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [clientSearch]);

  const chooseClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setValue('clientId', clientId, { shouldValidate: true });
  };

  const onSubmit = async (data: NewCaseData) => {
    setSaving(true);
    setFormError(null);
    try {
      await clientsApi.createCase(data.clientId, {
        nickname: data.nickname.trim(),
        practiceArea: data.practiceArea?.trim() || null,
        caseNumber: data.caseNumber?.trim() || null,
      });
      await onCreated();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-4 sm:items-center">
      <div className="w-full max-w-lg space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-text-primary">Novo processo</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 text-xs font-bold text-text-muted hover:text-text-primary"
          >
            <ArrowLeft size={14} /> Fechar
          </button>
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
            {formError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field label="Cliente" error={errors.clientId?.message}>
            <input
              className={FIELD_CONTROL}
              placeholder="Buscar cliente pelo nome"
              value={clientSearch}
              onChange={event => setClientSearch(event.target.value)}
              aria-label="Buscar cliente"
            />
          </Field>
          <div className="max-h-32 space-y-1 overflow-y-auto rounded-xl border border-border p-1">
            {searching && <p className="px-2 py-1 text-[11px] text-text-muted">Buscando…</p>}
            {!searching && clientOptions.length === 0 && (
              <p className="px-2 py-1 text-[11px] text-text-muted">Nenhum cliente encontrado.</p>
            )}
            {clientOptions.map(client => (
              <button
                key={client.id}
                type="button"
                onClick={() => chooseClient(client.id)}
                className={`block w-full rounded-lg px-2 py-1 text-left text-xs ${
                  selectedClientId === client.id
                    ? 'bg-accent/15 font-bold text-accent'
                    : 'text-text-secondary hover:bg-bg'
                }`}
              >
                {client.name}
              </button>
            ))}
          </div>

          <Field label="Apelido do processo" error={errors.nickname?.message}>
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

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-surface-2 py-2.5 text-xs font-bold text-text-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-accent py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {saving ? 'Criando…' : 'Criar processo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
