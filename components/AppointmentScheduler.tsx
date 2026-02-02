import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Service, StaffMember, ShopSettings } from '../types';
import { AppointmentSchema, AppointmentFormData } from '../schemas';
import { Calendar, Clock, User, CheckCircle, Smartphone, ChevronRight, ChevronLeft, Mail, AlertCircle } from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';

interface AppointmentSchedulerProps {
  services: Service[];
  staff: StaffMember[];
  settings: ShopSettings;
  onBook: (data: any) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ services, staff, settings, onBook }) => {
  const [step, setStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);

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

  const selectedServiceId = watch('serviceId');
  const selectedStaffId = watch('staffId');
  const date = watch('date');
  const time = watch('time');
  const name = watch('customerName');
  const phone = watch('whatsapp');

  // --- Logic for Dates ---
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // --- Logic for Time Slots ---
  const timeSlots = useMemo(() => {
    if (!date) return [];
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const safeSchedule = settings.schedule[dayOfWeek];

    if (!safeSchedule || !safeSchedule.isOpen) return [];

    const slots = [];
    let [currHour, currMinute] = safeSchedule.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = safeSchedule.closeTime.split(':').map(Number);
    
    while (currHour < closeHour || (currHour === closeHour && currMinute < closeMinute)) {
      const timeStr = `${currHour.toString().padStart(2, '0')}:${currMinute.toString().padStart(2, '0')}`;
      slots.push(timeStr);
      currMinute += 30;
      if (currMinute >= 60) {
        currHour += 1;
        currMinute -= 60;
      }
    }
    return slots;
  }, [date, settings.schedule]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof AppointmentFormData)[] = [];
    if (step === 1) fieldsToValidate = ['serviceId'];
    if (step === 2) fieldsToValidate = ['staffId'];
    if (step === 3) fieldsToValidate = ['date', 'time'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const onSubmit = (data: AppointmentFormData) => {
    onBook(data);
    setBookingComplete(true);
  };

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedStaff = staff.find(s => s.id === selectedStaffId);

  // --- Calendar Links Logic ---
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
          <button onClick={() => { setBookingComplete(false); setStep(1); }} className="mt-4 text-cyan-500 text-sm font-bold hover:underline">
            Realizar novo agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
      <div className="flex">
        {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1 flex-1 transition-all duration-500 ${s <= step ? 'bg-cyan-500' : 'bg-neutral-800'}`}></div>
        ))}
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Selecione o Serviço</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {services.map(service => (
                            <div 
                                key={service.id}
                                onClick={() => setValue('serviceId', service.id, { shouldValidate: true })}
                                className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all
                                    ${selectedServiceId === service.id 
                                        ? 'bg-cyan-900/20 border-cyan-500 ring-1 ring-cyan-500' 
                                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={selectedServiceId === service.id ? 'text-cyan-400' : 'text-neutral-500'}>
                                        <DynamicIcon name={service.icon} size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{service.name}</h4>
                                        <p className="text-xs text-neutral-400">~{service.avgTimeMinutes} min • R$ {service.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                {selectedServiceId === service.id && <CheckCircle className="text-cyan-500" size={20} />}
                            </div>
                        ))}
                    </div>
                    {errors.serviceId && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.serviceId.message}</p>}
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                     <h3 className="text-xl font-bold text-white mb-4">Escolha o Profissional</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div 
                            onClick={() => setValue('staffId', 'any', { shouldValidate: true })}
                            className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center
                                ${selectedStaffId === 'any' ? 'bg-cyan-900/20 border-cyan-500' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'}
                            `}
                        >
                            <User size={24} className="text-neutral-400" />
                            <span className="font-bold text-sm text-white">Qualquer Profissional</span>
                        </div>
                        {staff.map(member => (
                            <div 
                                key={member.id}
                                onClick={() => setValue('staffId', member.id, { shouldValidate: true })}
                                className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center
                                    ${selectedStaffId === member.id ? 'bg-cyan-900/20 border-cyan-500' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'}
                                `}
                            >
                                <span className="text-lg font-bold text-white">{member.name.charAt(0)}</span>
                                <span className="font-bold text-sm text-white">{member.name}</span>
                            </div>
                        ))}
                     </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Data e Hora</h3>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Dia</label>
                        <input type="date" min={today} max={maxDateString} {...register('date')} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none" />
                        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                    </div>
                    {date && (
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Horários Disponíveis</label>
                            <div className="grid grid-cols-4 gap-2">
                                {timeSlots.map(t => (
                                    <button key={t} type="button" onClick={() => setValue('time', t, { shouldValidate: true })} className={`py-2 rounded-lg text-sm font-bold transition-all ${time === t ? 'bg-cyan-600 text-white shadow-lg' : 'bg-neutral-950 border border-neutral-800 text-neutral-400'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                            {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
                        </div>
                    )}
                </div>
            )}

            {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Seus Dados</h3>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Seu Nome</label>
                        <input type="text" {...register('customerName')} placeholder="Ex: João Silva" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none" />
                        {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">WhatsApp</label>
                        <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                            <input type="tel" {...register('whatsapp')} placeholder="(11) 99999-9999" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-cyan-500 outline-none" />
                        </div>
                        {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
                    </div>
                </div>
            )}

            <div className="mt-8 flex gap-3">
                {step > 1 && <button type="button" onClick={handleBack} className="px-6 py-3 rounded-xl font-bold text-neutral-400 bg-neutral-800 hover:bg-neutral-700 transition-colors"><ChevronLeft size={20} /></button>}
                <button type={step === 4 ? "submit" : "button"} onClick={step < 4 ? handleNext : undefined} className="flex-1 py-3 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg flex items-center justify-center gap-2">
                    {step === 4 ? 'Confirmar Agendamento' : 'Continuar'} {step < 4 && <ChevronRight size={18} />}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};