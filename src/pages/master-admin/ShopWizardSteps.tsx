import React from 'react';
import { z } from 'zod';
import type { UseFormGetValues, UseFormRegister } from 'react-hook-form';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR } from '../../components/ui/Field';
import { SectionError } from '../../components/patterns';
import type { Plan } from '../../infra/plansApi';

export const shopSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do salão.'),
  whatsapp: z
    .string()
    .trim()
    .min(10, 'Informe o WhatsApp com DDD.')
    .max(20, 'WhatsApp muito longo.')
    .regex(/^[0-9()+\-\s]+$/, 'Use apenas números, parênteses, +, - ou espaço.'),
  cnpj: z
    .string()
    .trim()
    .regex(/^$|^[0-9]{14}$/, 'O CNPJ deve ter 14 dígitos, sem pontuação.'),
  address: z.string().trim().max(500, 'Endereço muito longo.').optional(),
  active: z.boolean(),
  ownerName: z.string().trim().min(2, 'Informe o nome do dono.'),
  ownerEmail: z
    .string()
    .trim()
    .min(1, 'Informe o e-mail do dono.')
    .email('E-mail inválido.'),
  planId: z.string().min(1, 'Selecione um plano.'),
  trialDays: z.coerce
    .number({ invalid_type_error: 'Informe os dias de trial.' })
    .int('Informe um número inteiro de dias.')
    .min(1, 'Trial mínimo: 1 dia.')
    .max(60, 'Trial máximo: 60 dias.'),
});

export type ShopFormData = z.infer<typeof shopSchema>;

export const STEP_TITLES = ['Salão', 'Endereço e ajustes', 'Dono', 'Plano e trial', 'Revisão', 'Sucesso'];

/** Campos validados ao sair de cada etapa. */
export const STEP_FIELDS: (keyof ShopFormData)[][] = [
  ['name', 'whatsapp', 'cnpj'],
  ['address'],
  ['ownerName', 'ownerEmail'],
  ['planId', 'trialDays'],
  [],
];

export const StepIndicator: React.FC<{ step: number }> = ({ step }) => (
  <ol className="mb-4 flex gap-2" aria-label="Etapas">
    {STEP_TITLES.map((title, index) => (
      <li
        key={title}
        aria-current={index === step ? 'step' : undefined}
        className={`flex-1 rounded-lg px-2 py-1.5 text-center text-xs font-medium ${
          index === step
            ? 'bg-accent/15 text-accent'
            : index < step
              ? 'bg-success/10 text-success'
              : 'bg-hover-bg text-text-muted'
        }`}
      >
        {index + 1}. {title}
      </li>
    ))}
  </ol>
);

interface StepProps {
  errors: Partial<Record<keyof ShopFormData, { message?: string }>>;
  register: UseFormRegister<ShopFormData>;
  getValues: UseFormGetValues<ShopFormData>;
}

export const ShopStep: React.FC<StepProps> = ({ errors, register }) => (
  <>
    <Field label="Nome do salão" error={errors.name?.message}>
      <input
        type="text"
        autoComplete="off"
        className={errors.name ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
        {...register('name')}
      />
    </Field>
    <Field label="WhatsApp" hint="Somente números, com DDD." error={errors.whatsapp?.message}>
      <input
        type="tel"
        autoComplete="off"
        placeholder="11999990000"
        className={errors.whatsapp ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
        {...register('whatsapp')}
      />
    </Field>
    <Field label="CNPJ (opcional)" hint="14 dígitos, sem pontuação." error={errors.cnpj?.message}>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className={errors.cnpj ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
        {...register('cnpj')}
      />
    </Field>
  </>
);

export const AddressStep: React.FC<
  StepProps & { activeState: boolean; onActiveChange: (checked: boolean) => void }
> = ({ errors, register, activeState, onActiveChange }) => (
  <>
    <Field label="Endereço (opcional)" error={errors.address?.message}>
      <input
        type="text"
        autoComplete="off"
        className={errors.address ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
        {...register('address')}
      />
    </Field>
    <label className="flex items-center gap-2 text-sm text-text-secondary">
      <input
        type="checkbox"
        checked={activeState}
        onChange={(event) => {
          onActiveChange(event.target.checked);
          register('active').onChange(event);
        }}
      />
      Conta ativa desde a criação
    </label>
  </>
);

export const OwnerStep: React.FC<StepProps> = ({ errors, register }) => (
  <>
    <p className="text-xs text-text-muted">
      Criamos o usuário dono e enviamos um convite por e-mail para ele definir a senha.
    </p>
    <Field label="Nome do dono" error={errors.ownerName?.message}>
      <input
        type="text"
        autoComplete="off"
        className={errors.ownerName ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
        {...register('ownerName')}
      />
    </Field>
    <Field label="E-mail do dono" hint="Para onde vai o convite de acesso." error={errors.ownerEmail?.message}>
      <input
        type="email"
        autoComplete="off"
        className={errors.ownerEmail ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
        {...register('ownerEmail')}
      />
    </Field>
  </>
);

export const PlanStep: React.FC<StepProps & { plans: Plan[] | null; plansError: string | null }> = ({
  errors,
  register,
  plans,
  plansError,
}) => (
  <>
    <Field label="Plano" error={errors.planId?.message ?? plansError ?? undefined}>
      <select
        className={errors.planId ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
        {...register('planId')}
      >
        <option value="">
          {plans === null ? 'Carregando planos…' : 'Selecione um plano'}
        </option>
        {plans?.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name} — R$ {plan.price}/{plan.billingCycle === 'YEARLY' ? 'ano' : 'mês'}
          </option>
        ))}
      </select>
    </Field>
    <Field
      label="Dias de trial"
      hint="1 a 60 dias. O trial termina na data informada."
      error={errors.trialDays?.message}
    >
      <input
        type="number"
        min={1}
        max={60}
        className={errors.trialDays ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
        {...register('trialDays')}
      />
    </Field>
  </>
);

const ReviewRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between gap-3">
    <dt className="text-text-muted">{label}</dt>
    <dd className="text-right font-medium">{value}</dd>
  </div>
);

interface WizardFormBodyProps extends StepProps {
  step: number;
  submitError: string | null;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  activeState: boolean;
  onActiveChange: (checked: boolean) => void;
  plans: Plan[] | null;
  plansError: string | null;
  planName: string;
}

/** Formulário do wizard com um bloco por etapa. */
export const WizardFormBody: React.FC<WizardFormBodyProps> = ({
  step,
  errors,
  register,
  getValues,
  activeState,
  onActiveChange,
  submitError,
  onSubmit,
  plans,
  plansError,
  planName,
}) => (
  <form id="shop-wizard-form" onSubmit={onSubmit} noValidate className="space-y-4">
    {submitError && <SectionError message={submitError} />}
    {step === 0 && <ShopStep errors={errors} register={register} getValues={getValues} />}
    {step === 1 && (
      <AddressStep
        errors={errors}
        register={register}
        getValues={getValues}
        activeState={activeState}
        onActiveChange={onActiveChange}
      />
    )}
    {step === 2 && <OwnerStep errors={errors} register={register} getValues={getValues} />}
    {step === 3 && (
      <PlanStep
        errors={errors}
        register={register}
        getValues={getValues}
        plans={plans}
        plansError={plansError}
      />
    )}
    {step === 4 && (
      <ReviewStep
        errors={errors}
        register={register}
        getValues={getValues}
        activeState={activeState}
        planName={planName}
      />
    )}
  </form>
);

export const ReviewStep: React.FC<StepProps & { activeState: boolean; planName: string }> = ({
  getValues,
  activeState,
  planName,
}) => (
  <dl className="space-y-2 rounded-xl border border-border bg-surface-2 p-4 text-sm">
    <ReviewRow label="Nome" value={getValues('name')} />
    <ReviewRow label="WhatsApp" value={getValues('whatsapp')} />
    <ReviewRow label="CNPJ" value={getValues('cnpj') || '—'} />
    <ReviewRow label="Endereço" value={getValues('address') || '—'} />
    <ReviewRow label="Dono" value={`${getValues('ownerName')} · ${getValues('ownerEmail')}`} />
    <ReviewRow label="Plano" value={planName} />
    <ReviewRow label="Trial" value={`${getValues('trialDays')} dias`} />
    <ReviewRow label="Status" value={activeState ? 'Ativo' : 'Inativo'} />
  </dl>
);
