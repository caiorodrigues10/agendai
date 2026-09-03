import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Service } from '../../types';
import { ServiceCard } from './ServiceCard';
import { maskPhone, normalizePhoneBR } from '../../utils/documentUtils';
import { getErrorMessage } from '../../utils/errorMessage';
import {
  X,
  Loader2,
  UserCheck,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Scissors,
} from 'lucide-react';
import {
  CustomerQueueSchema,
  CustomerQueueStaffSchema,
  CustomerQueueFormData,
  CustomerQueueStaffFormData,
} from '../../schemas';

/** Enviado ao backend somente quando o staff não informa WhatsApp do cliente. */
const STAFF_PLACEHOLDER_WHATSAPP = '00000000000';

interface AddCustomerFormProps {
  services: Service[];
  onJoin: (
    name: string,
    whatsapp: string,
    serviceId: string,
    isManualEntry?: boolean
  ) => void | Promise<void>;
  onCancel: () => void;
  isStaffMode?: boolean;
  isAdditionalPerson?: boolean;
}

export const AddCustomerForm: React.FC<AddCustomerFormProps> = ({
  services,
  onJoin,
  onCancel,
  isStaffMode = false,
  isAdditionalPerson = false,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerQueueFormData | CustomerQueueStaffFormData>({
    resolver: zodResolver(
      isStaffMode || isAdditionalPerson ? CustomerQueueStaffSchema : CustomerQueueSchema
    ),
    defaultValues: {
      whatsapp: '',
      serviceId: services.length > 0 ? services[0].id : '',
    },
  });

  const selectedServiceId = watch('serviceId');

  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setValue('serviceId', services[0].id);
    }
  }, [services, setValue, selectedServiceId]);

  const onSubmit = async (data: CustomerQueueFormData | CustomerQueueStaffFormData) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const raw = data.whatsapp.trim();
      const whatsapp =
        isStaffMode && !raw
          ? STAFF_PLACEHOLDER_WHATSAPP
          : isAdditionalPerson && !raw
            ? ''
            : normalizePhoneBR(raw);
      await onJoin(data.name, whatsapp, data.serviceId, isStaffMode || isAdditionalPerson);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Não foi possível entrar na fila. Tente de novo.'));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('whatsapp', maskPhone(e.target.value), { shouldValidate: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-3 backdrop-blur-md animate-fade-in sm:items-center sm:p-4">
      <div
        className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[1.6rem] border bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.45)] ${
          isStaffMode ? 'border-accent/50' : 'border-border'
        }`}
      >
        <div className="relative overflow-hidden border-b border-border/70 px-5 pb-4 pt-5 sm:px-6">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                  isStaffMode ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-text-secondary'
                }`}
              >
                {isStaffMode ? <UserCheck size={22} /> : <MessageCircle size={20} />}
              </div>
              <div>
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                  {isStaffMode ? 'Ação rápida da equipe' : 'Fluxo da fila'}
                </div>
                <h2 className="text-[1.45rem] font-black tracking-tight text-text-primary">
                  {isStaffMode
                    ? 'Adicionar Cliente Manual'
                    : isAdditionalPerson
                      ? 'Adicionar dependente'
                      : 'Entrar na Fila'}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  {isStaffMode
                    ? 'Registre um cliente direto na operação com poucos toques.'
                    : isAdditionalPerson
                      ? 'Adicione outra pessoa ao atendimento rapidamente.'
                      : 'Preencha os dados e escolha o serviço desejado.'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="rounded-full border border-border bg-bg p-2 text-text-muted transition-colors hover:border-border-strong hover:text-text-primary"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-5 py-5 sm:px-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-text-secondary">
              {isAdditionalPerson ? 'Nome do dependente' : 'Nome do Cliente'}
            </label>
            <input
              type="text"
              placeholder="Ex: João Silva"
              className={`w-full rounded-2xl border bg-bg px-4 py-3.5 text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/25 ${
                errors.name ? 'border-danger' : 'border-border'
              }`}
              autoFocus
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-danger">
                <AlertCircle size={10} /> {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-secondary">
              WhatsApp {isStaffMode || isAdditionalPerson ? '(opcional)' : '(para aviso)'}
            </label>
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              className={`w-full rounded-2xl border bg-bg px-4 py-3.5 text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/25 ${
                errors.whatsapp ? 'border-danger' : 'border-border'
              }`}
              value={watch('whatsapp')}
              onChange={handlePhoneChange}
            />
            {errors.whatsapp && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-danger">
                <AlertCircle size={10} /> {errors.whatsapp.message}
              </p>
            )}

            {!isStaffMode && (
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                {isAdditionalPerson
                  ? 'Opcional. Em branco, os avisos e a cobrança usam o telefone do responsável.'
                  : '*O dono será notificado e te avisaremos quando faltar 15min.'}
              </p>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-text-secondary">Serviço</label>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
                <Scissors size={11} />
                Escolha 1
              </span>
            </div>
            {services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-bg p-4 text-center text-text-muted">
                Nenhum serviço disponível no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {services.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={selectedServiceId === service.id}
                    onSelect={() => setValue('serviceId', service.id, { shouldValidate: true })}
                  />
                ))}
              </div>
            )}
            {errors.serviceId && <p className="mt-1 text-xs text-danger">Selecione um serviço</p>}
          </div>

          <div className="pt-2">
            {submitError && (
              <p className="mb-3 flex items-center gap-1 text-xs text-danger">
                <AlertCircle size={12} /> {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black tracking-wide shadow-lg transition-all ${
                loading
                  ? 'cursor-not-allowed bg-surface-2 text-text-muted'
                  : 'cursor-pointer bg-accent text-accent-fg hover:bg-accent-hover hover:shadow-accent/25'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processando...
                </>
              ) : isStaffMode || isAdditionalPerson ? (
                <>
                  <Sparkles size={18} />
                  Adicionar à Fila
                </>
              ) : (
                'Confirmar e Avisar Dono'
              )}
            </button>
            {!isStaffMode && !isAdditionalPerson && (
              <p className="mt-4 text-center text-xs text-text-muted">
                Ao entrar, você será redirecionado para o WhatsApp do salão.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
