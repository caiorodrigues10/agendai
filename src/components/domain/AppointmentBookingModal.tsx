import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Service, StaffMember, ShopSettings, SalonClient, ClientPackage } from '../../types';
import { AppointmentSchema, AppointmentFormData } from '../../schemas';
import {
  AvailabilitySlot,
  generateTimeSlots,
  getDaySchedule,
  isSlotAvailable,
  addDays,
} from '../../utils/schedulingUtils';
import { maskPhone } from '../../utils/documentUtils';
import { clientsApi } from '../../infra/clientsApi';
import { packagesApi } from '../../infra/packagesApi';
import { X, Calendar, User, Smartphone, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { DynamicIcon } from '../ui/DynamicIcon';
import { ThemedCalendar, toLocalISO } from '../ui/ThemedCalendar';

interface AppointmentBookingModalProps {
  services: Service[];
  staff: StaffMember[];
  settings: ShopSettings;
  occupancy: AvailabilitySlot[];
  defaultDate?: string;
  defaultTime?: string;
  defaultStaffId?: string;
  onBook: (data: AppointmentFormData) => Promise<void>;
  onClose: () => void;
}

const formatPrice = (price: number) =>
  price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fieldClass = (hasError: boolean) =>
  `w-full bg-bg border rounded-xl px-4 py-3 text-text-primary text-sm outline-none transition-all placeholder:text-text-muted focus:ring-2 focus:ring-accent/40 ${
    hasError ? 'border-danger' : 'border-border focus:border-accent/50'
  }`;

const selectedCard =
  'bg-accent/15 border-accent text-text-primary shadow-[0_0_0_1px_var(--color-accent)]';
const idleCard =
  'bg-bg border-border text-text-secondary hover:border-border-strong hover:bg-surface';

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  services,
  staff,
  settings,
  occupancy,
  defaultDate,
  defaultTime,
  defaultStaffId,
  onBook,
  onClose,
}) => {
  const [submitting, setSubmitting] = React.useState(false);
  const [clientHits, setClientHits] = React.useState<SalonClient[]>([]);
  const [selectedClient, setSelectedClient] = React.useState<SalonClient | null>(null);
  const [clientPackages, setClientPackages] = React.useState<ClientPackage[]>([]);
  const [usePackage, setUsePackage] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      staffId: defaultStaffId ?? 'any',
      serviceId: '',
      date: defaultDate ?? toLocalISO(new Date()),
      time: defaultTime ?? '',
      customerName: '',
      whatsapp: '',
    },
  });

  const selectedServiceId = watch('serviceId');
  const selectedStaffId = watch('staffId');
  const date = watch('date');
  const time = watch('time');
  const customerName = watch('customerName');

  const today = toLocalISO(new Date());
  const maxDate = toLocalISO(addDays(new Date(), 30));

  const daySchedule = useMemo(() => {
    if (!date) return null;
    return getDaySchedule(new Date(date + 'T12:00:00'), settings.schedule);
  }, [date, settings.schedule]);

  const isDateClosed = !daySchedule || !daySchedule.isOpen;

  const timeSlots = useMemo(() => {
    if (!date || isDateClosed || !daySchedule) return [];
    const slots = generateTimeSlots(daySchedule.openTime, daySchedule.closeTime);
    return slots.filter(slot => isSlotAvailable(slot, selectedStaffId, occupancy, staff.length));
  }, [date, isDateClosed, daySchedule, selectedStaffId, occupancy, staff.length]);

  useEffect(() => {
    if (time && !timeSlots.includes(time)) {
      setValue('time', '', { shouldValidate: false });
    }
  }, [time, timeSlots, setValue]);

  const selectedService = services.find(s => s.id === selectedServiceId);
  const matchingPackage = clientPackages.find(
    p => p.status === 'ACTIVE' && p.remainingSessions > 0 && p.serviceId === selectedServiceId
  );

  React.useEffect(() => {
    if (selectedClient || (customerName ?? '').trim().length < 2) {
      setClientHits([]);
      return;
    }
    const t = setTimeout(() => {
      clientsApi
        .list({ search: customerName.trim(), limit: 5 })
        .then(res => setClientHits(res.data))
        .catch(() => setClientHits([]));
    }, 300);
    return () => clearTimeout(t);
  }, [customerName, selectedClient]);

  React.useEffect(() => {
    if (!selectedClient) {
      setClientPackages([]);
      setUsePackage(false);
      return;
    }
    packagesApi
      .listSold({ clientId: selectedClient.id, status: 'ACTIVE' })
      .then(setClientPackages)
      .catch(() => setClientPackages([]));
  }, [selectedClient]);

  React.useEffect(() => {
    if (!matchingPackage) setUsePackage(false);
  }, [matchingPackage]);
  const selectedStaffName =
    selectedStaffId === 'any'
      ? 'Qualquer profissional'
      : (staff.find(m => m.id === selectedStaffId)?.name ?? 'Profissional');

  const dateLabel = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      })
    : '';

  const onSubmit = async (data: AppointmentFormData) => {
    setSubmitting(true);
    try {
      await onBook({
        ...data,
        clientId: selectedClient?.id,
        clientPackageId: usePackage && matchingPackage ? matchingPackage.id : undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const FieldError = ({ message }: { message?: string }) =>
    message ? (
      <p className="text-danger text-xs flex items-center gap-1">
        <AlertCircle size={12} className="shrink-0" /> {message}
      </p>
    ) : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-md max-h-[min(88dvh,calc(100dvh-2.5rem))] flex flex-col shadow-2xl animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Novo agendamento</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-1 text-text-secondary hover:text-text-primary hover:bg-bg rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto ag-scroll px-5 py-5 space-y-6">
            <section className="space-y-3">
              <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">
                Serviço
              </label>
              <div
                className={`grid grid-cols-1 gap-2 pr-1 ${
                  services.length > 4 ? 'max-h-56 overflow-y-auto ag-scroll' : ''
                }`}
              >
                {services.map(service => {
                  const selected = selectedServiceId === service.id;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setValue('serviceId', service.id, { shouldValidate: true })}
                      className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all min-h-[56px] ${
                        selected ? selectedCard : idleCard
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          selected ? 'bg-accent/20 text-accent' : 'bg-surface text-text-muted'
                        }`}
                      >
                        <DynamicIcon name={service.icon} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-text-primary text-sm block truncate">
                          {service.name}
                        </span>
                        <p className="text-xs text-text-muted mt-0.5">
                          ~{service.avgTimeMinutes} min · {formatPrice(service.price)}
                        </p>
                      </div>
                      {selected && <CheckCircle size={16} className="text-accent shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.serviceId?.message} />
            </section>

            <section className="space-y-3">
              <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">
                Profissional
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setValue('staffId', 'any', { shouldValidate: true })}
                  className={`px-3.5 py-2.5 rounded-xl border text-sm font-semibold min-h-[44px] transition-all ${
                    selectedStaffId === 'any' ? selectedCard : idleCard
                  }`}
                >
                  Qualquer
                </button>
                {staff.map(member => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setValue('staffId', member.id, { shouldValidate: true })}
                    className={`px-3.5 py-2.5 rounded-xl border text-sm font-semibold min-h-[44px] transition-all ${
                      selectedStaffId === member.id ? selectedCard : idleCard
                    }`}
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={12} /> Data
              </label>
              <p className="text-sm text-text-primary font-medium capitalize -mt-1">
                {dateLabel || 'Selecione um dia'}
              </p>
              <div className="rounded-xl border border-border bg-bg px-2 py-2">
                <ThemedCalendar
                  value={date}
                  min={today}
                  max={maxDate}
                  isDayDisabled={day => !getDaySchedule(day, settings.schedule).isOpen}
                  onChange={iso => setValue('date', iso, { shouldValidate: true })}
                />
              </div>
              <input type="hidden" {...register('date')} />
              <FieldError message={errors.date?.message} />
            </section>

            <section className="space-y-3">
              <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} /> Horário
              </label>
              {isDateClosed ? (
                <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-xl px-3 py-3 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  Fechado neste dia. Escolha outra data.
                </p>
              ) : timeSlots.length === 0 ? (
                <p className="text-sm text-text-muted bg-bg border border-dashed border-border rounded-xl px-3 py-3">
                  Nenhum horário livre neste dia.
                </p>
              ) : (
                <div
                  className={`grid grid-cols-4 gap-2 pr-1 ${
                    timeSlots.length > 12 ? 'max-h-40 overflow-y-auto ag-scroll' : ''
                  }`}
                >
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setValue('time', slot, { shouldValidate: true })}
                      className={`py-2.5 rounded-lg text-xs font-bold border min-h-[40px] transition-all ${
                        time === slot
                          ? 'bg-accent text-accent-fg border-accent'
                          : 'bg-bg text-text-secondary border-border hover:border-border-strong'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
              <FieldError message={errors.time?.message} />
            </section>

            <section className="space-y-3">
              <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">
                Cliente
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Nome completo"
                  className={`${fieldClass(Boolean(errors.customerName))} pl-10`}
                  {...register('customerName', {
                    onChange: () => setSelectedClient(null),
                  })}
                />
              </div>
              <FieldError message={errors.customerName?.message} />
              <div className="relative">
                <Smartphone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="WhatsApp (11) 99999-9999"
                  className={`${fieldClass(Boolean(errors.whatsapp))} pl-10`}
                  value={watch('whatsapp') ?? ''}
                  onChange={e =>
                    setValue('whatsapp', maskPhone(e.target.value), { shouldValidate: true })
                  }
                />
              </div>
              <FieldError message={errors.whatsapp?.message} />
              {clientHits.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden bg-bg">
                  {clientHits.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-2"
                      onClick={() => {
                        setSelectedClient(c);
                        setValue('customerName', c.name, { shouldValidate: true });
                        setValue('whatsapp', maskPhone(c.whatsapp), { shouldValidate: true });
                        setClientHits([]);
                      }}
                    >
                      {c.name} · {maskPhone(c.whatsapp)}
                      {c.remainingSessions > 0 ? ` · ${c.remainingSessions} sessão(ões)` : ''}
                    </button>
                  ))}
                </div>
              )}
              {matchingPackage && (
                <label className="flex items-center gap-2 text-sm text-text-secondary bg-accent/10 border border-accent/30 rounded-xl px-3 py-2">
                  <input
                    type="checkbox"
                    checked={usePackage}
                    onChange={e => setUsePackage(e.target.checked)}
                  />
                  Usar pacote ({matchingPackage.remainingSessions} restante
                  {matchingPackage.remainingSessions === 1 ? '' : 's'})
                </label>
              )}
            </section>
          </div>

          <div className="shrink-0 border-t border-border px-5 py-4 bg-surface">
            {selectedService && time && date && (
              <p className="text-xs text-text-muted mb-3 truncate">
                {selectedService.name} · {selectedStaffName} · {dateLabel} às {time}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-accent-fg bg-accent hover:bg-accent-hover disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px] transition-colors"
            >
              <CheckCircle size={18} />
              {submitting ? 'Salvando…' : 'Confirmar agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
