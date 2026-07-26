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
        <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
            <Calendar className="text-accent" size={20} /> Agenda Próxima
        </h3>
        
        {sortedAppointments.length === 0 ? (
            <div className="text-center py-10 bg-surface rounded-xl border border-border border-dashed">
                <p className="text-text-muted">Nenhum agendamento futuro.</p>
            </div>
        ) : (
            sortedAppointments.map(appt => {
                const service = getService(appt.serviceId);
                const member = getStaff(appt.staffId);
                const isToday = appt.date === new Date().toISOString().split('T')[0];

                return (
                    <div key={appt.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group">
                        {isToday && <div className="absolute top-0 right-0 px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold uppercase rounded-bl-lg">Hoje</div>}
                        
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="bg-surface-2 p-3 rounded-lg text-center min-w-[3.5rem]">
                                    <span className="block text-xs text-text-secondary uppercase font-bold">
                                        {new Date(appt.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                                    </span>
                                    <span className="block text-xl font-bold text-text-primary">
                                        {appt.time}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-primary text-lg">{appt.customerName}</h4>
                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                        <span className="text-accent">{service?.name}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><User size={12} /> {member ? member.name : 'Qualquer'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                                        <Phone size={10} /> {appt.whatsapp}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-2 pt-3 border-t border-border">
                             <button 
                                onClick={() => {
                                    if(confirm('Mover para a fila de espera agora?')) onCheckIn(appt);
                                }}
                                className="flex-1 py-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                             >
                                <CheckCircle size={14} /> Check-in (Fila)
                             </button>
                             <button 
                                onClick={() => {
                                    if(confirm('Cancelar agendamento?')) onCancel(appt.id);
                                }}
                                className="px-3 py-2 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 rounded-lg text-xs font-bold transition-colors"
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
