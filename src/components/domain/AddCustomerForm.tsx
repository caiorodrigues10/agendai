import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Service } from '../../types';
import { ServiceCard } from './ServiceCard';
import {
  CustomerQueueSchema,
  CustomerQueueStaffSchema,
  CustomerQueueFormData,
  CustomerQueueStaffFormData,
} from '../../schemas';

/** Enviado ao backend quando o staff não informa WhatsApp do cliente. */
const STAFF_PLACEHOLDER_WHATSAPP = '00000000000';
import { maskPhone, normalizeDocument } from '../../utils/documentUtils';
import { X, Loader2, UserCheck, AlertCircle } from 'lucide-react';

interface AddCustomerFormProps {
  services: Service[];
  onJoin: (name: string, whatsapp: string, serviceId: string, isManualEntry?: boolean) => void;
  onCancel: () => void;
  isStaffMode?: boolean;
}

export const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ services, onJoin, onCancel, isStaffMode = false }) => {
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<
    CustomerQueueFormData | CustomerQueueStaffFormData
  >({
    resolver: zodResolver(isStaffMode ? CustomerQueueStaffSchema : CustomerQueueSchema),
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
    try {
      const raw = data.whatsapp.trim();
      const whatsapp =
        isStaffMode && !raw
          ? STAFF_PLACEHOLDER_WHATSAPP
          : normalizeDocument(raw);
      await onJoin(data.name, whatsapp, data.serviceId, isStaffMode);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('whatsapp', maskPhone(e.target.value), { shouldValidate: true });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className={`bg-surface w-full max-w-md rounded-2xl p-6 shadow-2xl border ${isStaffMode ? 'border-accent/40' : 'border-border'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
             {isStaffMode && <UserCheck className="text-accent" size={24} />}
             <h2 className="text-2xl font-bold text-text-primary">
                {isStaffMode ? 'Adicionar Cliente Manual' : 'Entrar na Fila'}
             </h2>
          </div>
          <button onClick={onCancel} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Nome do Cliente</label>
            <input
              type="text"
              placeholder="Ex: João Silva"
              className={`w-full bg-bg border rounded-xl px-4 py-3 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-text-muted ${errors.name ? 'border-danger' : 'border-border'}`}
              autoFocus
              {...register('name')}
            />
            {errors.name && <p className="text-danger text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
                WhatsApp {isStaffMode ? '(opcional)' : '(para aviso)'}
            </label>
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              className={`w-full bg-bg border rounded-xl px-4 py-3 text-text-primary focus:ring-2 focus:ring-accent outline-none transition-all placeholder:text-text-muted ${errors.whatsapp ? 'border-danger' : 'border-border'}`}
              value={watch('whatsapp')}
              onChange={handlePhoneChange}
            />
             {errors.whatsapp && !isStaffMode && <p className="text-danger text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.whatsapp.message}</p>}
             
             {!isStaffMode && <p className="text-xs text-text-muted mt-1">
              *O dono será notificado e te avisaremos quando faltar 15min.
            </p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Serviço</label>
            {services.length === 0 ? (
                <div className="text-center p-4 bg-bg rounded-xl text-text-muted">
                    Nenhum serviço disponível no momento.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                {services.map((service) => (
                    <ServiceCard
                    key={service.id}
                    service={service}
                    selected={selectedServiceId === service.id}
                    onSelect={() => setValue('serviceId', service.id, { shouldValidate: true })}
                    />
                ))}
                </div>
            )}
            {errors.serviceId && <p className="text-danger text-xs mt-1">Selecione um serviço</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                loading
                  ? 'bg-surface-2 text-text-muted cursor-not-allowed'
                  : 'bg-accent text-accent-fg hover:bg-accent-hover hover:shadow-accent/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processando...
                </>
              ) : (
                isStaffMode ? 'Adicionar à Fila' : 'Confirmar e Avisar Dono'
              )}
            </button>
            {!isStaffMode && <p className="text-center text-xs text-text-muted mt-4">
              Ao entrar, você será redirecionado para o WhatsApp do salão.
            </p>}
          </div>
        </form>
      </div>
    </div>
  );
};
