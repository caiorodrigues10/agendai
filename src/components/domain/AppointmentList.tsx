import React from 'react';
import { Appointment, Service, StaffMember } from '../../types';
import { Calendar, Trash2, CheckCircle, User, Phone } from 'lucide-react';

interface AppointmentListProps {
  appointments: Appointment[];
  services: Service[];
  staff: StaffMember[];
  onCancel: (id: string) => void;
  onCheckIn: (appointment: Appointment) => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, services, staff, onCancel, onCheckIn }) => {
  const sortedAppointments = [...appointments].sort((a, b) => {
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });

  const getService = (id: string) => services.find(s => s.id === id);
  const getStaff = (id: string) => staff.find(s => s.id === id);

  return (
    <div className="space-y-4 animate-fade-in">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Calendar className="text-cyan-500" size={20} /> Agenda Próxima
        </h3>
        
        {sortedAppointments.length === 0 ? (
            <div className="text-center py-10 bg-neutral-900 rounded-xl border border-neutral-800 border-dashed">
                <p className="text-neutral-500">Nenhum agendamento futuro.</p>
            </div>
        ) : (
            sortedAppointments.map(appt => {
                const service = getService(appt.serviceId);
                const member = getStaff(appt.staffId);
                const isToday = appt.date === new Date().toISOString().split('T')[0];

                return (
                    <div key={appt.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group">
                        {isToday && <div className="absolute top-0 right-0 px-2 py-0.5 bg-green-900/50 text-green-400 text-[10px] font-bold uppercase rounded-bl-lg">Hoje</div>}
                        
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="bg-neutral-800 p-3 rounded-lg text-center min-w-[3.5rem]">
                                    <span className="block text-xs text-neutral-400 uppercase font-bold">
                                        {new Date(appt.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                                    </span>
                                    <span className="block text-xl font-bold text-white">
                                        {appt.time}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{appt.customerName}</h4>
                                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                                        <span className="text-cyan-400">{service?.name}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><User size={12} /> {member ? member.name : 'Qualquer'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                                        <Phone size={10} /> {appt.whatsapp}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-2 pt-3 border-t border-neutral-800">
                             <button 
                                onClick={() => {
                                    if(confirm('Mover para a fila de espera agora?')) onCheckIn(appt);
                                }}
                                className="flex-1 py-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-600/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                             >
                                <CheckCircle size={14} /> Check-in (Fila)
                             </button>
                             <button 
                                onClick={() => {
                                    if(confirm('Cancelar agendamento?')) onCancel(appt.id);
                                }}
                                className="px-3 py-2 bg-red-900/10 hover:bg-red-900/20 text-red-400 border border-red-900/30 rounded-lg text-xs font-bold transition-colors"
                             >
                                <Trash2 size={14} />
                             </button>
                        </div>
                    </div>
                );
            })
        )}
    </div>
  );
};
