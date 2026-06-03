import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Service, StaffMember, ShopSettings, Appointment } from '../../types';
import { AppointmentSchema, AppointmentFormData } from '../../schemas';
import { Calendar, Clock, User, CheckCircle, Smartphone, ChevronRight, ChevronLeft, Mail, AlertCircle } from 'lucide-react';
import { DynamicIcon } from '../ui/DynamicIcon';

interface AppointmentSchedulerProps {
  services: Service[];
  staff: StaffMember[];
  settings: ShopSettings;
  appointments?: Appointment[];
  onBook: (data: any) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ services, staff, settings, appointments = [], onBook }) => {
  const [bookingComplete, setBookingComplete] = useState(false);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<AppointmentFormData>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      staffId: 'any',
      serviceId: '',
      date: '',
      time: '',
      customerName: '',
      whatsapp: ''
    }
  });

  const { ref: dateRef, ...dateRest } = register('date');

  const selectedServiceId = watch('serviceId');
  const selectedStaffId = watch('staffId');
  const date = watch('date');
  const time = watch('time');
  const name = watch('customerName');
  const phone = watch('whatsapp');

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const isDateClosed = useMemo(() => {
    if (!date) return false;
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const safeSchedule = settings.schedule[dayOfWeek];
    return !safeSchedule || !safeSchedule.isOpen;
  }, [date, settings.schedule]);

  const selectedService = services.find(s => s.id === selectedServiceId);

  const timeSlots = useMemo(() => {
    if (!date) return [];
    if (isDateClosed) return [];

    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const safeSchedule = settings.schedule[dayOfWeek];

    const slots = [];
    let [currHour, currMinute] = safeSchedule.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = safeSchedule.closeTime.split(':').map(Number);

    // Get appointments for the selected date
    const dayAppointments = appointments.filter(app =>
        app.date === date &&
        app.status !== 'cancelled'
    );

    while (currHour < closeHour || (currHour === closeHour && currMinute < closeMinute)) {
      const timeStr = `${currHour.toString().padStart(2, '0')}:${currMinute.toString().padStart(2, '0')}`;

      // Check availability
      let isAvailable = true;

      if (selectedStaffId && selectedStaffId !== 'any') {
          // Check if specific staff is busy
          const isStaffBusy = dayAppointments.some(app =>
              app.staffId === selectedStaffId &&
              app.time === timeStr
          );
          if (isStaffBusy) isAvailable = false;
      } else {
          // Check if ALL staff are busy (if selecting 'any')
          // Assuming we need at least one staff member free
          // This is a simplification. Ideally we'd check against total staff count vs concurrent appointments
          const busyStaffCount = dayAppointments.filter(app => app.time === timeStr).length;
          if (busyStaffCount >= staff.length) isAvailable = false;
      }

      if (isAvailable) {
          slots.push(timeStr);
      }

      currMinute += 30;
      if (currMinute >= 60) {
        currHour += 1;
        currMinute -= 60;
      }
    }
    return slots;
  }, [date, settings.schedule, appointments, selectedStaffId, staff.length]);

  const onSubmit = (data: AppointmentFormData) => {
    onBook(data);
    setBookingComplete(true);
  };

  const selectedStaff = staff.find(s => s.id === selectedStaffId);

  const getEventDetails = () => {
     if (!selectedService || !date || !time) return null;
     const startTime = new Date(`${date}T${time}`);
     const endTime = new Date(startTime.getTime() + (selectedService.avgTimeMinutes * 60000));
     return {
         start: startTime,
         end: endTime,
         title: `${selectedService.name} - ${settings.shopName}`,
         details: `Agendamento na ${settings.shopName}. Serviço: ${selectedService.name}`,
         location: settings.shopName
     };
  };

  const generateGoogleLink = () => {
    const evt = getEventDetails();
    if (!evt) return '#';
    const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evt.title)}&dates=${fmt(evt.start)}/${fmt(evt.end)}&details=${encodeURIComponent(evt.details)}&location=${encodeURIComponent(evt.location)}`;
  };

  if (bookingComplete) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Agendamento Confirmado!</h2>
        <p className="text-neutral-400 mb-6">
          Te esperamos dia <span className="text-white font-bold">{new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}</span> às <span className="text-white font-bold">{time}</span>.
        </p>
        <div className="space-y-3">
          <a href={generateGoogleLink()} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-neutral-700">
            <Calendar size={16} className="text-blue-400" /> Adicionar ao Google Agenda
          </a>
          <button onClick={() => { setBookingComplete(false); setValue('serviceId', ''); }} className="mt-4 text-cyan-500 text-sm font-bold hover:underline">
            Realizar novo agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* SEÇÃO 1: SERVIÇOS */}
            <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <CheckCircle size={18} className="text-cyan-500" /> Selecione o Serviço
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {services.map(service => (
                        <div
                            key={service.id}
                            onClick={() => setValue('serviceId', service.id, { shouldValidate: true })}
                            className={`cursor-pointer p-4 rounded-xl border transition-all relative overflow-hidden group flex items-center gap-4
                                ${selectedServiceId === service.id
                                    ? 'bg-neutral-800 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'}
                            `}
                        >
                            <div className={`p-2.5 rounded-lg transition-colors ${selectedServiceId === service.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-neutral-900 text-neutral-500 group-hover:text-neutral-400'}`}>
                                <DynamicIcon name={service.icon} size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white text-base">{service.name}</h4>
                                <p className="text-xs text-neutral-500 font-medium">~{service.avgTimeMinutes} min • <span className="text-neutral-400">R$ {service.price.toFixed(2)}</span></p>
                            </div>
                            {selectedServiceId === service.id && (
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
                            )}
                        </div>
                    ))}
                </div>
                {errors.serviceId && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.serviceId.message}</p>}
            </div>

            <div className="border-t border-neutral-800"></div>

            {/* SEÇÃO 2: PROFISSIONAL */}
            <div className="space-y-4 animate-fade-in">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User size={18} className="text-cyan-500" /> Profissional
                 </h3>
                 <div className="grid grid-cols-2 gap-3">
                    <div
                        onClick={() => setValue('staffId', 'any', { shouldValidate: true })}
                        className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center
                            ${selectedStaffId === 'any' ? 'bg-cyan-900/20 border-cyan-500' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'}
                        `}
                    >
                        <User size={20} className="text-neutral-400" />
                        <span className="font-bold text-xs text-white">Qualquer</span>
                    </div>
                    {staff.map(member => (
                        <div
                            key={member.id}
                            onClick={() => setValue('staffId', member.id, { shouldValidate: true })}
                            className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center
                                ${selectedStaffId === member.id ? 'bg-cyan-900/20 border-cyan-500' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'}
                            `}
                        >
                            <span className="text-base font-bold text-white">{member.name.charAt(0)}</span>
                            <span className="font-bold text-xs text-white">{member.name}</span>
                        </div>
                    ))}
                 </div>
            </div>

            <div className="border-t border-neutral-800"></div>

            {/* SEÇÃO 3: DATA E HORA */}
            <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-cyan-500" /> Data e Horário
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Data</label>
                        <div
                            className="relative cursor-pointer group"
                            onClick={() => {
                                try {
                                    dateInputRef.current?.showPicker();
                                } catch (e) {
                                    console.warn('showPicker not supported', e);
                                }
                            }}
                        >
                            <input
                                type="date"
                                min={today}
                                max={maxDateString}
                                className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all cursor-pointer ${errors.date ? 'border-red-500' : 'border-neutral-800'}`}
                                {...dateRest}
                                ref={(e) => {
                                    dateRef(e);
                                    dateInputRef.current = e;
                                }}
                                onClick={(e) => {
                                    try {
                                        (e.target as HTMLInputElement).showPicker();
                                    } catch (e) {}
                                }}
                            />
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 group-hover:text-cyan-500 transition-colors pointer-events-none" size={18} />
                        </div>
                        {errors.date && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.date.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Horários Disponíveis</label>
                        <div className="grid grid-cols-4 gap-2">
                            {timeSlots.length === 0 ? (
                                <div className={`col-span-4 text-center py-4 bg-neutral-950 rounded-xl text-xs border border-dashed transition-colors
                                    ${isDateClosed ? 'border-red-500/50 text-red-400 bg-red-500/5' : 'border-neutral-800 text-neutral-500'}
                                `}>
                                    {isDateClosed ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <AlertCircle size={14} /> Fechado neste dia. Escolha outra data.
                                        </span>
                                    ) : (
                                        "Selecione uma data para ver os horários"
                                    )}
                                </div>
                            ) : (
                                timeSlots.map(slot => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setValue('time', slot, { shouldValidate: true })}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                                            time === slot
                                                ? 'bg-cyan-600 text-white border-cyan-500'
                                                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                                        }`}
                                    >
                                        {slot}
                                    </button>
                                ))
                            )}
                        </div>
                        {errors.time && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.time.message}</p>}
                    </div>
                </div>
            </div>

            <div className="border-t border-neutral-800"></div>

            {/* SEÇÃO 4: DADOS PESSOAIS */}
            <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User size={18} className="text-cyan-500" /> Seus Dados
                </h3>
                <div className="space-y-3">
                    <div>
                        <div className="relative">
                            <input
                                type="text"
                                className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all ${errors.customerName ? 'border-red-500' : 'border-neutral-800'}`}
                                placeholder="Seu nome completo"
                                {...register('customerName')}
                            />
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                        </div>
                        {errors.customerName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.customerName.message}</p>}
                    </div>
                    <div>
                        <div className="relative">
                            <input
                                type="tel"
                                className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all ${errors.whatsapp ? 'border-red-500' : 'border-neutral-800'}`}
                                placeholder="WhatsApp (11) 99999-9999"
                                {...register('whatsapp')}
                            />
                            <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                        </div>
                        {errors.whatsapp && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.whatsapp.message}</p>}
                    </div>
                </div>
            </div>

            <button type="submit" className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-8">
                <CheckCircle size={20} /> Confirmar Agendamento
            </button>
        </form>
      </div>
    </div>
  );
};
