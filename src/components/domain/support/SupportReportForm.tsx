import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { IconType } from 'react-icons';
import {
  LuBug,
  LuCalendarDays,
  LuCircleAlert,
  LuCircleHelp,
  LuCreditCard,
  LuKeyRound,
  LuLightbulb,
  LuLoaderCircle as Loader2,
  LuMapPin,
  LuSend,
} from 'react-icons/lu';
import { SupportReportSchema, SupportReportFormData } from '../../../schemas';
import { supportApi, SupportReport, SupportPriority } from '../../../infra/supportApi';
import { getErrorMessage } from '../../../utils/errorMessage';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR } from '../../ui/Field';
import {
  SUPPORT_FORM_CATEGORIES,
  SUPPORT_PRIORITY_LABELS,
  SupportFormCategory,
  toSupportCategory,
} from './supportLabels';

const CATEGORY_ICONS: Record<SupportFormCategory, IconType> = {
  BUG: LuBug,
  WRONG_DATA: LuCircleAlert,
  SUGGESTION: LuLightbulb,
  QUESTION: LuCircleHelp,
  BILLING: LuCreditCard,
  ACCESS: LuKeyRound,
  SCHEDULE: LuCalendarDays,
};

const PRIORITIES: SupportPriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

const LEGEND = 'text-sm font-semibold text-text-secondary';
const CARD = 'rounded-xl border border-border bg-bg px-3 py-2.5 text-left cursor-pointer transition-colors hover:border-border-strong has-[input:checked]:border-accent has-[input:checked]:bg-accent/10';

interface SupportReportFormProps {
  onCreated: (report: SupportReport) => void;
}

export const SupportReportForm: React.FC<SupportReportFormProps> = ({ onCreated }) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SupportReportFormData>({
    resolver: zodResolver(SupportReportSchema),
    defaultValues: { priority: 'NORMAL', title: '', description: '' },
  });

  const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
  const description = watch('description') ?? '';

  const onSubmit = async (values: SupportReportFormData) => {
    setSubmitError(null);
    try {
      const report = await supportApi.createReport({
        title: values.title,
        description: values.description,
        category: toSupportCategory(values.category),
        priority: values.priority,
        page: pagePath ? pagePath.slice(0, 200) : undefined,
        userAgent:
          typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 300) : undefined,
      });
      reset({ priority: 'NORMAL', title: '', description: '' });
      onCreated(report);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Não foi possível enviar o relatório.'));
    }
  };

  return (
    <section className="bg-surface border border-border rounded-xl p-5">
      <h2 className="font-bold text-text-primary">Novo relatório</h2>
      <p className="mt-1 text-xs text-text-muted mb-4">
        Descreva o que aconteceu — quanto mais detalhes, mais rápido resolvemos.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <fieldset className="border-0 p-0 m-0">
          <legend className={`${LEGEND} mb-2`}>Categoria</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SUPPORT_FORM_CATEGORIES.map(option => {
              const Icon = CATEGORY_ICONS[option.value];
              return (
                <label key={option.value} className={CARD}>
                  <input
                    type="radio"
                    value={option.value}
                    className="sr-only"
                    {...register('category')}
                  />
                  <span className="flex items-center gap-1.5 font-semibold text-sm text-text-primary has-[input:checked]:text-accent">
                    <Icon size={14} aria-hidden="true" />
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-text-muted">
                    {option.description}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.category && (
            <p role="alert" className="mt-1.5 text-xs text-danger">
              {errors.category.message}
            </p>
          )}
        </fieldset>

        <fieldset className="border-0 p-0 m-0">
          <legend className={`${LEGEND} mb-2`}>
            Prioridade <span className="font-normal text-text-muted">(opcional)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map(priority => (
              <label
                key={priority}
                className="px-3 py-1.5 rounded-full text-xs font-bold border border-border bg-bg text-text-secondary cursor-pointer transition-colors has-[input:checked]:border-accent has-[input:checked]:bg-accent/10 has-[input:checked]:text-accent"
              >
                <input
                  type="radio"
                  value={priority}
                  className="sr-only"
                  {...register('priority')}
                />
                {SUPPORT_PRIORITY_LABELS[priority]}
              </label>
            ))}
          </div>
          {errors.priority && (
            <p role="alert" className="mt-1.5 text-xs text-danger">
              {errors.priority.message}
            </p>
          )}
        </fieldset>

        <Field label="Título" error={errors.title?.message}>
          <input
            type="text"
            maxLength={200}
            placeholder="Ex.: Fila não atualiza após check-in"
            className={errors.title ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
            {...register('title')}
          />
        </Field>

        <div>
          <label htmlFor="support-description" className="mb-1.5 block text-sm font-medium text-text-secondary">
            Descrição
          </label>
          <textarea
            id="support-description"
            rows={5}
            maxLength={4000}
            placeholder="Conte o que aconteceu, passo a passo, e o que você esperava que acontecesse."
            className={
              errors.description
                ? `${FIELD_CONTROL_ERROR} min-h-[120px] resize-y`
                : `${FIELD_CONTROL} min-h-[120px] resize-y`
            }
            {...register('description')}
          />
          <div className="mt-1 flex items-start justify-between gap-3">
            <p className="text-xs text-danger" role={errors.description ? 'alert' : undefined}>
              {errors.description?.message}
            </p>
            <span className="shrink-0 text-[11px] text-text-muted">{description.length}/4000</span>
          </div>
        </div>

        {pagePath && (
          <p className="text-[11px] text-text-muted flex items-start gap-1.5">
            <LuMapPin size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Página atual (<code className="font-mono">{pagePath}</code>) anexada ao relatório
              para ajudar a equipe.
            </span>
          </p>
        )}

        {submitError && (
          <p role="alert" className="text-sm text-danger">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-11 rounded-xl bg-accent hover:bg-accent-hover text-accent-fg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <LuSend size={16} />}
          {isSubmitting ? 'Enviando...' : 'Enviar relatório'}
        </button>
      </form>
    </section>
  );
};
