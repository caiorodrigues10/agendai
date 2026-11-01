import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModalShell } from './ModalShell';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR } from '../ui/Field';

const schema = z.object({ reason: z.string().trim().min(10, 'Mínimo 10 caracteres').max(500) });
type Form = z.infer<typeof schema>;

interface ReasonActionDialogProps {
  open: boolean;
  title: string;
  message: string;
  danger?: boolean;
  loading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (reason: string) => void | Promise<void>;
  onCancel: () => void;
}

export const ReasonActionDialog: React.FC<ReasonActionDialogProps> = ({
  open,
  title,
  message,
  danger,
  loading,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { reason: '' },
  });

  React.useEffect(() => { if (open) reset({ reason: '' }); }, [open, reset]);

  const submit = async (values: Form) => {
    await onConfirm(values.reason);
  };

  return (
    <ModalShell open={open} title={title} titleId="reason-action-dialog" onClose={onCancel} footer={
      <>
        <button type="button" onClick={onCancel} disabled={loading} className="flex-1 min-h-11 rounded-xl border border-border font-bold text-text-secondary disabled:opacity-50">{cancelLabel}</button>
        <button type="submit" form="reason-action-form" disabled={loading} className={`flex-1 min-h-11 rounded-xl font-bold disabled:opacity-50 ${danger ? 'bg-danger text-danger-fg' : 'bg-accent text-accent-fg'}`}>{loading ? 'Aguarde…' : confirmLabel}</button>
      </>
    }>
      <p className="mt-2 text-sm text-text-secondary">{message}</p>
      <form id="reason-action-form" onSubmit={handleSubmit(submit)} className="mt-3">
        <Field label="Motivo" error={errors.reason?.message}>
          <textarea {...register('reason')} className={errors.reason ? FIELD_CONTROL_ERROR : FIELD_CONTROL} rows={3} />
        </Field>
      </form>
    </ModalShell>
  );
};
