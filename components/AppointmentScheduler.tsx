import React, { useState, useMemo } from 'react';
import { Service, StaffMember, ShopSettings } from '../types';
import { Calendar, Clock, User, CheckCircle, Smartphone, ChevronRight, ChevronLeft, ExternalLink, Mail } from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';

interface AppointmentSchedulerProps {
  services: Service[];
  staff: StaffMember[];
  settings: ShopSettings;
  onBook: (data: any) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ services, staff, settings, onBook }) => {
  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingComplete, setBookingComplete] = useState(false);

  // --- Logic for Dates ---
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // --- Logic for Time Slots ---
  const timeSlots = useMemo(() => {
    if (!date) return [];
    
    const dayOfWeek = new Date(date).getDay(); // 0-6 (Sun-Sat) -- Note: check timezone in real app
    // Adjust for JS getDay() returning 0 for Sunday, matching our settings array index if index 0 is Sunday
    // Note: settings.schedule array usually assumes 0=Sunday
    const daySchedule = settings.schedule[dayOfWeek === 6 ? 6 : dayOfWeek + 1]; // This logic depends on exact array index matching
    // Let's use a safer find if we have dayName, or assume strict index 0=Sunday
    const safeSchedule = settings.schedule[dayOfWeek];

    if (!safeSchedule || !safeSchedule.isOpen) return [];

    const slots = [];
    let [currHour, currMinute] = safeSchedule.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = safeSchedule.closeTime.split(':').map(Number);
    
    while (currHour < closeHour || (currHour === closeHour && currMinute < closeMinute)) {
      const timeStr = `${currHour.toString().padStart(2, '0')}:${currMinute.toString().padStart(2, '0')}`;
      slots.push(timeStr);
      
      // Increment by 30 mins
      currMinute += 30;
      if (currMinute >= 60) {
        currHour += 1;
        currMinute -= 60;
      }
    }
    return slots;
  }, [date, settings.schedule]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook({
      serviceId: selectedServiceId,
      staffId: selectedStaffId,
      date,
      time,
      customerName: name,
      whatsapp: phone
    });
    setBookingComplete(true);
  };

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedStaff = staff.find(s => s.id === selectedStaffId);

  // --- Calendar Integration ---
  const getEventDetails = () => {
     if (!selectedService || !date || !time) return null;
     const startTime = new Date(`${date}T${time}`);
     const endTime = new Date(startTime.getTime() + (selectedService.avgTimeMinutes * 60000));
     
     return {
         start: startTime,
         end: endTime,
         title: `${selectedService.name} - ${settings.shopName}`,
         details: `Agendamento na ${settings.shopName} com ${selectedStaff ? selectedStaff.name : 'Equipe'}. Serviço: ${selectedService.name}`,
         location: settings.shopName
     };
  };

  const generateGoogleCalendarLink = () => {
    const evt = getEventDetails();
    if (!evt) return '#';
    
    const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evt.title)}&dates=${fmt(evt.start)}/${fmt(evt.end)}&details=${encodeURIComponent(evt.details)}&location=${encodeURIComponent(evt.location)}`;
  };

  const generateOutlookLink = () => {
    const evt = getEventDetails();
    if (!evt) return '#';

    return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${evt.start.toISOString()}&enddt=${evt.end.toISOString()}&subject=${encodeURIComponent(evt.title)}&body=${encodeURIComponent(evt.details)}&location=${encodeURIComponent(evt.location)}`;
  };

  const downloadIcs = () => {
    const evt = getEventDetails();
    if (!evt) return;
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${document.location.href}
DTSTART:${evt.start.toISOString().replace(/-|:|\.\d\d\d/g, "")}
DTEND:${evt.end.toISOString().replace(/-|:|\.\d\d\d/g, "")}
SUMMARY:${evt.title}
DESCRIPTION:${evt.details}
LOCATION:${evt.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new window.Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'agendamento.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Adicionar ao Calendário</p>
          
          <div className="grid grid-cols-2 gap-3">
              <a 
                href={generateGoogleCalendarLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-neutral-700"
              >
                <Calendar size={16} className="text-blue-400" /> Google Agenda
              </a>
              <a 
                href={generateOutlookLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-neutral-700"
              >
                <Mail size={16} className="text-cyan-400" /> Outlook / Live
              </a>
          </div>

          <button 
            onClick={downloadIcs}
            className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-neutral-800"
          >
            <Smartphone size={16} /> Apple Calendar / Nativo
          </button>

          <div className="w-full h-px bg-neutral-800 my-4"></div>

          <button 
            onClick={() => {
                setBookingComplete(false);
                setStep(1);
                setDate('');
                setTime('');
            }}
            className="mt-2 text-cyan-500 text-sm font-bold hover:underline"
          >
            Realizar novo agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
      {/* Progress Bar */}
      <div className="flex">
        {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1 flex-1 transition-all duration-500 ${s <= step ? 'bg-cyan-500' : 'bg-neutral-800'}`}></div>
        ))}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6 text-sm text-neutral-500 font-bold uppercase tracking-wider">
            <Calendar size={14} /> Novo Agendamento
        </div>

        <form onSubmit={handleSubmit}>
            {/* Step 1: Service */}
            {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Selecione o Serviço</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {services.map(service => (
                            <div 
                                key={service.id}
                                onClick={() => setSelectedServiceId(service.id)}
                                className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all
                                    ${selectedServiceId === service.id 
                                        ? 'bg-cyan-900/20 border-cyan-500 ring-1 ring-cyan-500' 
                                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${selectedServiceId === service.id ? 'text-cyan-400' : 'text-neutral-500'}`}>
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
                </div>
            )}

            {/* Step 2: Professional */}
            {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                     <h3 className="text-xl font-bold text-white mb-4">Escolha o Profissional</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div 
                            onClick={() => setSelectedStaffId('any')}
                            className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center
                                ${selectedStaffId === 'any' 
                                    ? 'bg-cyan-900/20 border-cyan-500' 
                                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'}
                            `}
                        >
                            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                                <User size={24} className="text-neutral-400" />
                            </div>
                            <span className="font-bold text-sm text-white">Qualquer Profissional</span>
                        </div>
                        {staff.map(member => (
                            <div 
                                key={member.id}
                                onClick={() => setSelectedStaffId(member.id)}
                                className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center
                                    ${selectedStaffId === member.id 
                                        ? 'bg-cyan-900/20 border-cyan-500' 
                                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'}
                                `}
                            >
                                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                    <span className="text-lg font-bold text-white">{member.name.charAt(0)}</span>
                                </div>
                                <span className="font-bold text-sm text-white">{member.name}</span>
                            </div>
                        ))}
                     </div>
                </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Data e Hora</h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Dia</label>
                        <input 
                            type="date" 
                            min={today}
                            max={maxDateString}
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setTime(''); // Reset time when date changes
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                        />
                    </div>

                    {date && (
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Horários Disponíveis</label>
                            {timeSlots.length === 0 ? (
                                <div className="text-center p-4 bg-red-900/10 border border-red-900/30 rounded-xl text-red-400 text-sm">
                                    Não há horários disponíveis ou a barbearia está fechada neste dia.
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 gap-2">
                                    {timeSlots.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTime(t)}
                                            className={`py-2 rounded-lg text-sm font-bold transition-all
                                                ${time === t 
                                                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' 
                                                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:border-neutral-600'}
                                            `}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Step 4: Details */}
            {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Seus Dados</h3>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Seu Nome</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: João Silva"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">WhatsApp</label>
                        <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                            <input 
                                type="tel" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2').slice(0, 15))}
                                placeholder="(11) 99999-9999"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-cyan-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 mt-4">
                        <h4 className="text-white font-bold mb-2">Resumo</h4>
                        <div className="text-sm text-neutral-400 space-y-1">
                            <p>Serviço: <span className="text-cyan-400">{selectedService?.name}</span></p>
                            <p>Profissional: <span className="text-white">{selectedStaff ? selectedStaff.name : 'Qualquer Profissional'}</span></p>
                            <p>Data: <span className="text-white">{new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')} às {time}</span></p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-3">
                {step > 1 && (
                    <button 
                        type="button" 
                        onClick={handleBack}
                        className="px-6 py-3 rounded-xl font-bold text-neutral-400 bg-neutral-800 hover:bg-neutral-700 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
                
                <button 
                    type={step === 4 ? "submit" : "button"}
                    onClick={step < 4 ? handleNext : undefined}
                    disabled={
                        (step === 1 && !selectedServiceId) ||
                        (step === 2 && !selectedStaffId) ||
                        (step === 3 && (!date || !time)) ||
                        (step === 4 && (!name || !phone))
                    }
                    className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all
                        ${(step === 1 && !selectedServiceId) || (step === 3 && !time)
                            ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed shadow-none' 
                            : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20'}
                    `}
                >
                    {step === 4 ? 'Confirmar Agendamento' : 'Continuar'} {step < 4 && <ChevronRight size={18} />}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};