import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuCheck, LuLoader } from 'react-icons/lu';
import { ModalShell } from '../../components/patterns/ModalShell';
import { FORM_FOOTER } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { adminApi, BarbershopListItem } from '../../infra/adminApi';
import { plansApi, Plan } from '../../infra/plansApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { ShopCreatedPanel, CreatedState } from './ShopCreatedPanel';
import {
  shopSchema,
  ShopFormData,
  STEP_FIELDS,
  StepIndicator,
  WizardFormBody,
} from './ShopWizardSteps';

const DEFAULT_VALUES: ShopFormData = {
  name: '',
  whatsapp: '',
  cnpj: '',
  address: '',
  active: true,
  ownerName: '',
  ownerEmail: '',
  planId: '',
  trialDays: 30,
};

export interface ShopCreateWizardProps {
  open: boolean;
  onClose: () => void;
  onCreated: (shop: BarbershopListItem) => void;
}

export const ShopCreateWizard: React.FC<ShopCreateWizardProps> = ({ open, onClose, onCreated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState<CreatedState | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeState, setActiveState] = useState(true);
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    let active = true;
    plansApi
      .list()
      .then((list) => {
        if (!active) return;
        setPlans(list);
        if (list.length > 0 && !getValues('planId')) setValue('planId', list[0].id);
      })
      .catch(() => {
        if (active) setPlansError('Não foi possível carregar os planos.');
      });
    return () => {
      active = false;
    };
  }, [getValues, setValue]);

  const resetWizard = () => {
    reset(DEFAULT_VALUES);
    setActiveState(true);
    setStep(0);
    setCreated(null);
    setSubmitError(null);
  };

  const close = () => {
    if (isSubmitting) return;
    resetWizard();
    onClose();
  };

  const goToStep = async (next: number) => {
    setSubmitError(null);
    const fields = next > step ? STEP_FIELDS[step] : [];
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
        owner: { name: data.ownerName, email: data.ownerEmail },
        planId: data.planId,
        trialDays: data.trialDays,
      });
      setCreated({
        shop: res.data,
        ownerEmail: data.ownerEmail,
        inviteSent: res.inviteSent === true,
      });
      onCreated(res.data);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Não foi possível criar o salão.'));
    }
  };

  const planName =
    plans?.find((plan) => plan.id === getValues('planId'))?.name ?? '—';

  if (created) {
    return (
      <ModalShell
        open={open}
        title="Salão criado"
        titleId="shop-wizard-title"
        onClose={close}
        icon={<LuCheck size={20} />}
        iconClassName="bg-success/15 text-success"
        body={<ShopCreatedPanel created={created} onInviteSent={() => setCreated({ ...created, inviteSent: true })} />}
        footer={
          <div className={FORM_FOOTER}>
            <Button type="button" variant="secondary" className="flex-1" onClick={resetWizard}>
              Criar outro
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() =>
                navigate(`/master/accounts/${created.shop.id}`, {
                  state: { from: location.pathname + location.search },
                })
              }
            >
              Ver detalhes
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
          <StepIndicator step={step} />
          <WizardFormBody
            step={step}
            errors={errors}
            register={register}
            getValues={getValues}
            activeState={activeState}
            onActiveChange={setActiveState}
            submitError={submitError}
            onSubmit={handleSubmit(onSubmit)}
            plans={plans}
            plansError={plansError}
            planName={planName}
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
          {step < 4 ? (
            <Button
              key="wizard-next"
              type="button"
              className="flex-1"
              disabled={isSubmitting}
              onClick={() => void goToStep(step + 1)}
            >
              Avançar
            </Button>
          ) : (
            <Button
              key="wizard-submit"
              type="submit"
              form="shop-wizard-form"
              className="flex-1"
              loading={isSubmitting}
            >
              {isSubmitting ? <LuLoader className="animate-spin" size={14} /> : 'Criar salão'}
            </Button>
          )}
        </div>
      }
    />
  );
};

export default ShopCreateWizard;
