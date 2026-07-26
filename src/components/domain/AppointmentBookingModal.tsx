import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Service, StaffMember, ShopSettings } from '../../types';
import { AppointmentSchema, AppointmentFormData } from '../../schemas';
import { AvailabilitySlot, generateTimeSlots, getDaySchedule, isSlotAvailable, formatDateISO } from '../../utils/schedulingUtils';
import { X, Calendar, User, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { DynamicIcon } from '../ui/DynamicIcon';

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

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  services,
  staff,
  settings,
  occupancy,
  defaultDate,
  defaultTime,
  defaultStaffId,
  onBook,
  onClose
}) => {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AppointmentFormData>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      staffId: defaultStaffId ?? 'any',
      serviceId: '',
      date: defaultDate ?? formatDateISO(new Date()),
      time: defaultTime ?? '',
      customerName: '',
      whatsapp: ''
    }
  });

  const selectedServiceId = watch('serviceId');
  const selectedStaffId = watch('staffId');
  const date = watch('date');
  const time = watch('time');

  const today = formatDateISO(new Date());
  const maxDate = formatDateISO(new Date(Date.now() + 30 * 86400000));

  const daySchedule = useMemo(() => {
    if (!date) return null;
    return getDaySchedule(new Date(date + 'T12:00:00'), settings.schedule);
  }, [date, settings.schedule]);

  const isDateClosed = !daySchedule || !daySchedule.isOpen;

  const timeSlots = useMemo(() => {
    if (!date || isDateClosed || !daySchedule) return [];
    const slots = generateTimeSlots(daySchedule.openTime, daySchedule.closeTime);
    return slots.filter((slot) =>
      isSlotAvailable(slot, selectedStaffId, occupancy, staff.length)
    );
  }, [date, isDateClosed, daySchedule, selectedStaffId, occupancy, staff.length]);

  const onSubmit = async (data: AppointmentFormData) => {
    setSubmitting(true);
    try {
      await onBook(data);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
        <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Novo Agendamento</h3>
          <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-5">
          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-bold uppercase">Serviço</label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setValue('serviceId', service.id, { shouldValidate: true })}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    selectedServiceId === service.id
                      ? 'bg-accent/15 border-accent'
                      : 'bg-bg border-border hover:border-border-strong'
                  }`}
                >
                  <DynamicIcon name={service.icon} size={20} />
                  <div>
                    <span className="font-bold text-text-primary text-sm">{service.name}</span>
                    <p className="text-xs text-text-muted">~{service.avgTimeMinutes} min • R$ {service.price.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
            {errors.serviceId && <p className="text-danger text-xs">{errors.serviceId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-bold uppercase">Profissional</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue('staffId', 'any', { shouldValidate: true })}
                className={`p-2 rounded-xl border text-xs font-bold ${
                  selectedStaffId === 'any' ? 'bg-accent/15 border-accent text-text-primary' : 'bg-bg border-border text-text-secondary'
                }`}
              >
                Qualquer
              </button>
              {staff.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setValue('staffId', member.id, { shouldValidate: true })}
                  className={`p-2 rounded-xl border text-xs font-bold ${
                    selectedStaffId === member.id ? 'bg-accent/15 border-accent text-text-primary' : 'bg-bg border-border text-text-secondary'
                  }`}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-text-secondary font-bold uppercase flex items-center gap-1">
                <Calendar size={12} /> Data
              </label>
              <input
                type="date"
                min={today}
                max={maxDate}
                className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm"
                {...register('date')}
              />
              {errors.date && <p className="text-danger text-xs">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-secondary font-bold uppercase">Horário</label>
              <select
                className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm"
                {...register('time')}
              >
                <option value="">Selecione</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              {isDateClosed && date && (
                <p className="text-danger text-xs flex items-center gap-1"><AlertCircle size={12} /> Fechado neste dia</p>
              )}
              {errors.time && <p className="text-danger text-xs">{errors.time.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-bold uppercase flex items-center gap-1">
              <User size={12} /> Cliente
            </label>
            <input
              type="text"
              placeholder="Nome completo"
              className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm"
              {...register('customerName')}
            />
            {errors.customerName && <p className="text-danger text-xs">{errors.customerName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs text-text-secondary font-bold uppercase flex items-center gap-1">
              <Smartphone size={12} /> WhatsApp
            </label>
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm"
              {...register('whatsapp')}
            />
            {errors.whatsapp && <p className="text-danger text-xs">{errors.whatsapp.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-bold text-text-primary bg-accent hover:bg-accent-hover disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            {submitting ? 'Salvando...' : 'Confirmar Agendamento'}
          </button>
        </form>
      </div>
    </div>
  );
};
