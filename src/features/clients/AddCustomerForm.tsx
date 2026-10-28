import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  LuCircleAlert as AlertCircle,
  LuLoaderCircle as Loader2,
  LuPawPrint as Paw,
  LuScissors as Scissors,
} from 'react-icons/lu';
import { ModalShell } from '../../components/patterns';
import { ClientPet, clientsApi } from '../../infra/clientsApi';
import {
  CustomerQueueFormData,
  CustomerQueueSchema,
  CustomerQueueStaffFormData,
  CustomerQueueStaffSchema,
} from '../../schemas';
import { Service } from '../../types';
import { maskPhone, normalizePhoneBR } from '../../utils/documentUtils';
import { getErrorMessage } from '../../utils/errorMessage';
import { ServiceCard } from './ServiceCard';

/** Enviado ao backend somente quando o staff não informa WhatsApp do cliente. */
const STAFF_PLACEHOLDER_WHATSAPP = '00000000000';

interface AddCustomerFormProps {
  services: Service[];
  onJoin: (
    name: string,
    whatsapp: string,
    serviceId: string,
    isManualEntry?: boolean,
    petId?: string
  ) => void | Promise<void>;
  onCancel: () => void;
  isStaffMode?: boolean;
  isAdditionalPerson?: boolean;
  /** Mostra o seletor de pet quando o WhatsApp casa com um cliente que tem pets (petshop). */
  showPetSelector?: boolean;
}

export const AddCustomerForm: React.FC<AddCustomerFormProps> = ({
  services,
  onJoin,
  onCancel,
  isStaffMode = false,
  isAdditionalPerson = false,
  showPetSelector = false,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [clientPets, setClientPets] = React.useState<ClientPet[]>([]);
  const [selectedPetId, setSelectedPetId] = React.useState('');

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
  const whatsappValue = watch('whatsapp') ?? '';

  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setValue('serviceId', services[0].id);
    }
  }, [services, setValue, selectedServiceId]);

  // Petshop: quando o WhatsApp digitado casa com um cliente que tem pets
  // ativos, oferece o seletor de pet (o backend grava o snapshot na fila).
  useEffect(() => {
    if (!showPetSelector || !isStaffMode) return;
    const digits = whatsappValue.replace(/\D/g, '');
    if (digits.length < 10) {
      setClientPets([]);
      setSelectedPetId('');
      return;
    }
    const t = setTimeout(() => {
      clientsApi
        .list({ search: digits, limit: 1 })
        .then(async res => {
          const hit = res.data[0];
          if (!hit) {
            setClientPets([]);
            setSelectedPetId('');
            return;
          }
          const pets = await clientsApi.listPets(hit.id);
          setClientPets(pets.filter(p => p.active));
          setSelectedPetId('');
        })
        .catch(() => {
          setClientPets([]);
          setSelectedPetId('');
        });
    }, 300);
    return () => clearTimeout(t);
  }, [whatsappValue, showPetSelector, isStaffMode]);

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
      await onJoin(
        data.name,
        whatsapp,
        data.serviceId,
        isStaffMode || isAdditionalPerson,
        selectedPetId || undefined
      );
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
    <ModalShell
      open
      titleId="join-queue-title"
      variant="sheet"
      loading={loading}
      onClose={onCancel}
      title={
        <h2 className="text-lg font-bold text-text-primary">
          {isStaffMode
            ? 'Adicionar cliente'
            : isAdditionalPerson
              ? 'Adicionar dependente'
              : 'Entrar na fila'}
        </h2>
      }
      body={
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="queue-client-name"
              className="mb-2 block text-sm font-semibold text-text-secondary"
            >
              {isAdditionalPerson ? 'Nome do dependente' : 'Nome do Cliente'}
            </label>
            <input
              id="queue-client-name"
              autoComplete="name"
              type="text"
              aria-invalid={Boolean(errors.name)}
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
            <label
              htmlFor="queue-client-phone"
              className="mb-2 block text-sm font-semibold text-text-secondary"
            >
              WhatsApp {isStaffMode || isAdditionalPerson ? '(opcional)' : '(para aviso)'}
            </label>
            <input
              id="queue-client-phone"
              autoComplete="tel-national"
              type="tel"
              aria-invalid={Boolean(errors.whatsapp)}
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

          {clientPets.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
                <Paw size={14} /> Pet
              </p>
              <div className="flex flex-wrap gap-2">
                {clientPets.map(pet => (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => setSelectedPetId(prev => (prev === pet.id ? '' : pet.id))}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                      selectedPetId === pet.id
                        ? 'border-accent bg-accent/15 text-text-primary'
                        : 'border-border bg-bg text-text-secondary hover:border-border-strong'
                    }`}
                  >
                    {pet.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            {submitError && (
              <p role="alert" className="mb-3 flex items-center gap-1 text-sm text-danger">
                <AlertCircle size={12} /> {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || services.length === 0}
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
                <>Adicionar à Fila</>
              ) : (
                'Entrar na fila'
              )}
            </button>
            {!isStaffMode && !isAdditionalPerson && (
              <p className="mt-4 text-center text-xs text-text-muted">
                Ao entrar, você será redirecionado para o WhatsApp do salão.
              </p>
            )}
          </div>
        </form>
      }
    />
  );
};
