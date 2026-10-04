import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LuCheck, LuLoader } from 'react-icons/lu';
import { ModalShell } from '../../components/patterns/ModalShell';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR, FORM_FOOTER } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { adminApi, BarbershopListItem } from '../../infra/adminApi';
import { getErrorMessage } from '../../utils/errorMessage';

const shopSchema = z.object({
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
});

export type ShopFormData = z.infer<typeof shopSchema>;

export interface ShopCreateWizardProps {
  open: boolean;
  onClose: () => void;
  onCreated: (shop: BarbershopListItem) => void;
}

const STEP_TITLES = ['Identificação', 'Endereço e ajustes', 'Revisão'];

interface WizardFormBodyProps {
  step: number;
  errors: Partial<Record<keyof ShopFormData, { message?: string }>>;
  register: ReturnType<typeof useForm<ShopFormData>>['register'];
  getValues: ReturnType<typeof useForm<ShopFormData>>['getValues'];
  activeState: boolean;
  onActiveChange: (checked: boolean) => void;
  submitError: string | null;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

const WizardFormBody: React.FC<WizardFormBodyProps> = ({
  step,
  errors,
  register,
  getValues,
  activeState,
  onActiveChange,
  submitError,
  onSubmit,
}) => (
  <form id="shop-wizard-form" onSubmit={onSubmit} noValidate className="space-y-4">
    {submitError && (
      <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
        {submitError}
      </p>
    )}
    {step === 0 && (
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
    )}
    {step === 1 && (
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
            {...register('active')}
            onChange={(event) => {
              onActiveChange(event.target.checked);
              register('active').onChange(event);
            }}
          />
          Conta ativa desde a criação
        </label>
      </>
    )}
    {step === 2 && (
      <dl className="space-y-2 rounded-xl border border-border bg-surface-2 p-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Nome</dt>
          <dd className="text-right font-medium">{getValues('name')}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">WhatsApp</dt>
          <dd className="text-right font-medium">{getValues('whatsapp')}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">CNPJ</dt>
          <dd className="text-right font-medium">{getValues('cnpj') || '—'}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Endereço</dt>
          <dd className="text-right font-medium">{getValues('address') || '—'}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Status</dt>
          <dd className="text-right font-medium">{activeState ? 'Ativo' : 'Inativo'}</dd>
        </div>
      </dl>
    )}
  </form>
);

export const ShopCreateWizard: React.FC<ShopCreateWizardProps> = ({ open, onClose, onCreated }) => {
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState<BarbershopListItem | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeState, setActiveState] = useState(true);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: { name: '', whatsapp: '', cnpj: '', address: '', active: true },
  });

  const close = () => {
    if (isSubmitting) return;
    reset({ name: '', whatsapp: '', cnpj: '', address: '', active: true });
    setActiveState(true);
    setStep(0);
    setCreated(null);
    setSubmitError(null);
    onClose();
  };

  const goToStep = async (next: number) => {
    setSubmitError(null);
    const fields: (keyof ShopFormData)[] =
      next > step ? (step === 0 ? ['name', 'whatsapp', 'cnpj'] : ['address']) : [];
    if (fields.length > 0) {
      const ok = await trigger(fields);
      if (!ok) return;
    }
    setStep(next);
  };

  const onSubmit = async (data: ShopFormData) => {
    setSubmitError(null);
    try {
      const res = await adminApi.createBarbershop({
        name: data.name,
        whatsapp: data.whatsapp.replace(/\D/g, '') || data.whatsapp,
        cnpj: data.cnpj ? data.cnpj.replace(/\D/g, '') : null,
        address: data.address || undefined,
        active: data.active,
      });
      setCreated(res.data);
      onCreated(res.data);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Não foi possível criar o salão.'));
    }
  };

  if (created) {
    return (
      <ModalShell
        open={open}
        title="Salão criado"
        titleId="shop-wizard-title"
        onClose={close}
        icon={<LuCheck size={20} />}
        iconClassName="bg-success/15 text-success"
        body={
          <div className="space-y-2 text-sm">
            <p>
              <strong>{created.name}</strong> foi criado com sucesso.
            </p>
            <p className="text-text-muted">
              O salão já aparece na lista de contas. Usuários podem ser vinculados na tela de
              Usuários.
            </p>
          </div>
        }
        footer={
          <div className={FORM_FOOTER}>
            <Button type="button" variant="secondary" className="flex-1" onClick={close}>
              Fechar
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <ModalShell
      open={open}
      title="Novo salão"
      titleId="shop-wizard-title"
      loading={isSubmitting}
      onClose={close}
      body={
        <>
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
          <WizardFormBody
            step={step}
            errors={errors}
            register={register}
            getValues={getValues}
            activeState={activeState}
            onActiveChange={setActiveState}
            submitError={submitError}
            onSubmit={handleSubmit(onSubmit)}
          />
        </>
      }
      footer={
        <div className={FORM_FOOTER}>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            disabled={isSubmitting || step === 0}
            onClick={() => void goToStep(step - 1)}
          >
            Voltar
          </Button>
          {step < 2 ? (
            <Button
              type="button"
              className="flex-1"
              disabled={isSubmitting}
              onClick={() => void goToStep(step + 1)}
            >
              Avançar
            </Button>
          ) : (
            <Button type="submit" form="shop-wizard-form" className="flex-1" loading={isSubmitting}>
              {isSubmitting ? <LuLoader className="animate-spin" size={14} /> : 'Criar salão'}
            </Button>
          )}
        </div>
      }
    />
  );
};

export default ShopCreateWizard;
