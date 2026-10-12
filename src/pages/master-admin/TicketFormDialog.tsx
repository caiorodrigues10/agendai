import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModalShell } from '../../components/patterns/ModalShell';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR, FORM_FOOTER } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { adminInternalApi } from '../../infra/adminInternalApi';
import { getErrorMessage } from '../../utils/errorMessage';
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_PRIORITY_LABELS,
} from '../../features/support/supportLabels';

const TICKET_CATEGORIES = [
  'ERROR',
  'SUGGESTION',
  'FEEDBACK',
  'QUESTION',
  'BILLING',
  'ACCESS',
  'SCHEDULE',
] as const;

const TICKET_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;

export const ticketFormSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título.').max(200, 'Máximo de 200 caracteres.'),
  description: z
    .string()
    .trim()
    .min(1, 'Descreva o problema.')
    .max(5000, 'Máximo de 5000 caracteres.'),
  category: z.enum(TICKET_CATEGORIES),
  priority: z.enum(TICKET_PRIORITIES),
});

export type TicketFormData = z.infer<typeof ticketFormSchema>;

export interface TicketFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onError?: (message: string) => void;
}

export const TicketFormDialog: React.FC<TicketFormDialogProps> = ({
  open,
  onClose,
  onSaved,
  onError,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: { title: '', description: '', category: 'QUESTION', priority: 'NORMAL' },
  });

  const handleClose = () => {
    setSubmitError(null);
    reset();
    onClose();
  };

  const onSubmit = async (data: TicketFormData) => {
    setSubmitError(null);
    try {
      await adminInternalApi.createTicket({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        channel: 'OTHER',
      });
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
      title="Novo chamado"
      titleId="ticket-form-dialog-title"
      loading={isSubmitting}
      onClose={handleClose}
      body={
        <form
          id="ticket-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
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
          <Field label="Descrição" error={errors.description?.message}>
            <textarea
              rows={4}
              className={inputClass(Boolean(errors.description))}
              {...register('description')}
            />
          </Field>
          <Field label="Categoria" error={errors.category?.message}>
            <select
              className={inputClass(Boolean(errors.category))}
              {...register('category')}
            >
              {TICKET_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {SUPPORT_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Prioridade" error={errors.priority?.message}>
            <select
              className={inputClass(Boolean(errors.priority))}
              {...register('priority')}
            >
              {TICKET_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {SUPPORT_PRIORITY_LABELS[value]}
                </option>
              ))}
            </select>
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
          <Button type="submit" form="ticket-form" className="flex-1" loading={isSubmitting}>
            Criar chamado
          </Button>
        </div>
      }
    />
  );
};

export default TicketFormDialog;
