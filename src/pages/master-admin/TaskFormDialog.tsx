import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModalShell } from '../../components/patterns/ModalShell';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR, FORM_FOOTER } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { adminInternalApi, TeamMember } from '../../infra/adminInternalApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { SUPPORT_PRIORITY_LABELS } from '../../features/support/supportLabels';

const TASK_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título.').max(200, 'Máximo de 200 caracteres.'),
  description: z.string().trim().max(5000, 'Máximo de 5000 caracteres.').optional(),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Data inválida.'),
  assignedToId: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

export interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onError?: (message: string) => void;
}

export const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  open,
  onClose,
  onSaved,
  onError,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMember[] | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: '', description: '', priority: 'NORMAL', dueDate: '', assignedToId: '' },
  });

  useEffect(() => {
    if (!open) return;
    let active = true;
    adminInternalApi
      .listTeam({ limit: 100 })
      .then((res) => {
        if (active) setMembers(res.users.filter((member) => member.active));
      })
      .catch(() => {
        if (active) setMembers([]);
      });
    return () => {
      active = false;
    };
  }, [open]);

  const handleClose = () => {
    setSubmitError(null);
    reset();
    onClose();
  };

  const onSubmit = async (data: TaskFormData) => {
    setSubmitError(null);
    try {
      const payload: Parameters<typeof adminInternalApi.createTask>[0] = {
        title: data.title,
        priority: data.priority,
      };
      if (data.description) payload.description = data.description;
      if (data.dueDate) payload.dueDate = new Date(`${data.dueDate}T00:00:00.000Z`).toISOString();
      if (data.assignedToId) payload.assignedToId = data.assignedToId;

      await adminInternalApi.createTask(payload);
      reset();
      onSaved();
    } catch (err) {
      const message = getErrorMessage(err);
      setSubmitError(message);
      onError?.(message);
    }
  };

  const inputClass = (hasError: boolean) => (hasError ? FIELD_CONTROL_ERROR : FIELD_CONTROL);

  return (
    <ModalShell
      open={open}
      title="Nova tarefa"
      titleId="task-form-dialog-title"
      loading={isSubmitting}
      onClose={handleClose}
      body={
        <form id="task-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {submitError && (
            <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {submitError}
            </p>
          )}
          <Field label="Título" error={errors.title?.message}>
            <input
              type="text"
              autoComplete="off"
              className={inputClass(Boolean(errors.title))}
              {...register('title')}
            />
          </Field>
          <Field label="Descrição" hint="Opcional." error={errors.description?.message}>
            <textarea
              rows={4}
              className={inputClass(Boolean(errors.description))}
              {...register('description')}
            />
          </Field>
          <Field label="Prioridade" error={errors.priority?.message}>
            <select className={inputClass(Boolean(errors.priority))} {...register('priority')}>
              {TASK_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {SUPPORT_PRIORITY_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Prazo" error={errors.dueDate?.message}>
            <input
              type="date"
              className={inputClass(Boolean(errors.dueDate))}
              {...register('dueDate')}
            />
          </Field>
          <Field label="Responsável" error={errors.assignedToId?.message}>
            {members === null ? (
              <p className="text-sm text-text-muted">Carregando equipe…</p>
            ) : (
              <select
                className={inputClass(Boolean(errors.assignedToId))}
                {...register('assignedToId')}
              >
                <option value="">Sem responsável</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </form>
      }
      footer={
        <div className={FORM_FOOTER}>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button type="submit" form="task-form" className="flex-1" loading={isSubmitting}>
            Criar tarefa
          </Button>
        </div>
      }
    />
  );
};

export default TaskFormDialog;
