import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Appointment, Service, ShopSettings, StaffMember } from '../../types';
import {
  addDays,
  formatDateISO,
  generateTimeSlots,
  getDaySchedule,
  getServiceDuration,
  getServiceName,
  getStaffName,
} from '../../utils/schedulingUtils';
import { AppointmentBookingModal } from './AppointmentBookingModal';
import { AvailabilitySlot } from '../../utils/schedulingUtils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Users,
  User,
  CheckCircle,
  Trash2,
  Phone,
  ChevronDown,
} from 'lucide-react';

type AgendaView = 'salon' | 'professional';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  services: Service[];
  staff: StaffMember[];
  settings: ShopSettings;
  currentUserId?: string;
  currentUserRole?: string;
  occupancy: AvailabilitySlot[];
  onBook: (data: any) => Promise<void>;
  onCancel: (id: string) => void;
  onCheckIn: (appointment: Appointment) => void;
  onDateChange?: (date: string) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  services,
  staff,
  settings,
  currentUserId,
  currentUserRole,
  occupancy,
  onBook,
  onCancel,
  onCheckIn,
  onDateChange,
}) => {
  const [selectedDate, setSelectedDate] = useState(() => formatDateISO(new Date()));
  const [view, setView] = useState<AgendaView>(
    currentUserRole === 'employee' ? 'professional' : 'salon'
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    currentUserRole === 'employee' && currentUserId ? currentUserId : (staff[0]?.id ?? 'any')
  );
  const [showBooking, setShowBooking] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const staffDropdownRef = useRef<HTMLDivElement>(null);

  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => new Date(), []);
  const [calendarMonth, setCalendarMonth] = useState(() => today.getMonth());
  const [calendarYear, setCalendarYear] = useState(() => today.getFullYear());

  const onDateChangeRef = useRef(onDateChange);
  onDateChangeRef.current = onDateChange;

  useEffect(() => {
    onDateChangeRef.current?.(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (staffDropdownRef.current && !staffDropdownRef.current.contains(e.target as Node)) {
        setShowStaffDropdown(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dateObj = useMemo(() => new Date(selectedDate + 'T12:00:00'), [selectedDate]);
  const daySchedule = getDaySchedule(dateObj, settings.schedule);
  const isClosed = !daySchedule?.isOpen;

  const timeSlots = useMemo(() => {
    if (!daySchedule?.isOpen) return [];
    return generateTimeSlots(daySchedule.openTime, daySchedule.closeTime);
  }, [daySchedule]);

  const dayAppointments = useMemo(() => {
    return appointments
      .filter(a => a.date === selectedDate && a.status !== 'cancelled')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  const columns = useMemo(() => {
    if (view === 'professional') {
      const id = selectedStaffId === 'any' ? null : selectedStaffId;
      return [{ id, label: getStaffName(id, staff) }];
    }
    const cols = staff.map(s => ({ id: s.id, label: s.name }));
    cols.push({ id: null as unknown as string, label: 'Sem prof.' });
    return cols;
  }, [view, selectedStaffId, staff]);

  const getAppointmentsForColumn = (columnId: string | null) => {
    return dayAppointments.filter(a => {
      const apptStaff = a.staffId === 'any' ? null : a.staffId;
      if (view === 'professional') {
        const filterId = selectedStaffId === 'any' ? null : selectedStaffId;
        return apptStaff === filterId || (filterId === null && !apptStaff);
      }
      if (columnId === null) return !apptStaff || apptStaff === 'any';
      return apptStaff === columnId;
    });
  };

  const navigateDate = (delta: number) => {
    setSelectedDate(formatDateISO(addDays(dateObj, delta)));
  };

  const dateLabel = dateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const selectedStaffName = useMemo(() => {
    if (selectedStaffId === 'any') return 'Qualquer profissional';
    return staff.find(s => s.id === selectedStaffId)?.name ?? 'Profissional';
  }, [selectedStaffId, staff]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [calendarYear, calendarMonth]);

  const navigateCalendarMonth = (delta: number) => {
    const newDate = new Date(calendarYear, calendarMonth + delta, 1);
    setCalendarMonth(newDate.getMonth());
    setCalendarYear(newDate.getFullYear());
  };

  const selectCalendarDay = (day: number) => {
    const iso = formatDateISO(new Date(calendarYear, calendarMonth, day));
    setSelectedDate(iso);
    setShowCalendar(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <CalendarDays className="text-accent" size={20} />
          Agenda
        </h3>
        <button
          onClick={() => setShowBooking(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-hover text-accent-fg text-xs font-bold rounded-xl transition-colors"
        >
          <Plus size={16} /> Novo
        </button>
      </div>

      <div className="flex bg-surface p-1 rounded-xl border border-border">
        <button
          onClick={() => setView('salon')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            view === 'salon' ? 'bg-surface-2 text-text-primary' : 'text-text-muted'
          }`}
        >
          <Users size={14} /> Salão
        </button>
        <button
          onClick={() => setView('professional')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            view === 'professional' ? 'bg-surface-2 text-text-primary' : 'text-text-muted'
          }`}
        >
          <User size={14} /> Profissional
        </button>
      </div>

      {view === 'professional' && (
        <div ref={staffDropdownRef} className="relative">
          <button
            onClick={() => setShowStaffDropdown(!showStaffDropdown)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm flex items-center justify-between hover:border-accent/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <User size={14} className="text-text-muted" />
              {selectedStaffName}
            </span>
            <ChevronDown
              size={16}
              className={`text-text-muted transition-transform ${showStaffDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showStaffDropdown && (
            <div className="absolute z-30 w-full mt-1 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in">
              {currentUserRole !== 'employee' && (
                <button
                  onClick={() => {
                    setSelectedStaffId('any');
                    setShowStaffDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 transition-colors ${
                    selectedStaffId === 'any'
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <Users
                    size={14}
                    className={selectedStaffId === 'any' ? 'text-accent' : 'text-text-muted'}
                  />
                  Qualquer profissional
                  {selectedStaffId === 'any' && (
                    <CheckCircle size={14} className="ml-auto text-accent" />
                  )}
                </button>
              )}
              {currentUserRole !== 'employee' && <div className="h-px bg-border" />}
              {staff.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStaffId(s.id);
                    setShowStaffDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 transition-colors ${
                    selectedStaffId === s.id
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-primary hover:bg-surface-2'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${selectedStaffId === s.id ? 'bg-accent' : 'bg-text-muted'}`}
                  />
                  {s.name}
                  {selectedStaffId === s.id && (
                    <CheckCircle size={14} className="ml-auto text-accent" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="relative" ref={calendarRef}>
        <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-3">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <button
              onClick={() => setSelectedDate(formatDateISO(new Date()))}
              className="text-xs text-accent font-bold hover:underline mb-0.5"
            >
              Hoje
            </button>
            <button
              onClick={() => {
                setCalendarMonth(dateObj.getMonth());
                setCalendarYear(dateObj.getFullYear());
                setShowCalendar(!showCalendar);
              }}
              className="text-sm font-bold text-text-primary capitalize flex items-center gap-1 mx-auto hover:text-accent transition-colors"
            >
              <CalendarDays size={14} className="text-accent" />
              {dateLabel}
            </button>
          </div>
          <button
            onClick={() => navigateDate(1)}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {showCalendar && (
          <div className="absolute z-30 left-1/2 -translate-x-1/2 mt-2 w-72 bg-surface border border-border rounded-xl shadow-2xl p-3 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => navigateCalendarMonth(-1)}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-bold text-text-primary">
                {MONTH_NAMES[calendarMonth]} {calendarYear}
              </span>
              <button
                onClick={() => navigateCalendarMonth(1)}
                className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-[10px] font-bold text-text-muted text-center py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />;
                const iso = formatDateISO(new Date(calendarYear, calendarMonth, day));
                const isSelected = iso === selectedDate;
                const isToday = iso === formatDateISO(new Date());
                return (
                  <button
                    key={day}
                    onClick={() => selectCalendarDay(day)}
                    className={`aspect-square text-xs font-medium rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-accent text-accent-fg font-bold'
                        : isToday
                          ? 'bg-accent/10 text-accent font-bold'
                          : 'text-text-primary hover:bg-surface-2'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isClosed ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
          <p className="text-text-muted">Salão fechado neste dia.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div
            className="grid border-b border-border"
            style={{ gridTemplateColumns: `3.5rem repeat(${columns.length}, 1fr)` }}
          >
            <div className="p-2 text-[10px] text-text-muted font-bold border-r border-border" />
            {columns.map(col => (
              <div
                key={String(col.id)}
                className="p-2 text-[10px] text-text-secondary font-bold text-center border-r border-border last:border-r-0 truncate"
              >
                {col.label}
              </div>
            ))}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {timeSlots.map(slot => (
              <div
                key={slot}
                className="grid border-b border-border/50 min-h-[2.75rem]"
                style={{ gridTemplateColumns: `3.5rem repeat(${columns.length}, 1fr)` }}
              >
                <div className="p-1.5 text-[10px] text-text-muted font-mono border-r border-border flex items-start pt-2">
                  {slot}
                </div>
                {columns.map(col => {
                  const colAppts = getAppointmentsForColumn(col.id).filter(a => a.time === slot);
                  return (
                    <div
                      key={String(col.id) + slot}
                      className="p-0.5 border-r border-border/50 last:border-r-0 relative min-h-[2.75rem]"
                    >
                      {colAppts.map(appt => {
                        const duration =
                          appt.serviceDurationMinutes ??
                          getServiceDuration(appt.serviceId, services);
                        const rows = Math.max(1, Math.ceil(duration / 30));
                        return (
                          <button
                            key={appt.id}
                            onClick={() => setSelectedAppt(appt)}
                            className="absolute inset-x-0.5 top-0.5 bg-accent/20 border border-accent/40 rounded-lg p-1.5 text-left hover:bg-accent/30 transition-colors z-10 overflow-hidden"
                            style={{ minHeight: `${rows * 2.5}rem` }}
                          >
                            <p className="text-[10px] font-bold text-text-primary truncate">
                              {appt.customerName}
                            </p>
                            <p className="text-[9px] text-accent truncate">
                              {appt.serviceName ?? getServiceName(appt.serviceId, services)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {dayAppointments.length === 0 && !isClosed && (
        <p className="text-center text-text-muted text-sm py-2">
          Nenhum agendamento para este dia.
        </p>
      )}

      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-sm p-5 space-y-4 animate-fade-in">
            <div>
              <h4 className="text-lg font-bold text-text-primary">{selectedAppt.customerName}</h4>
              <p className="text-sm text-accent">
                {getServiceName(selectedAppt.serviceId, services)}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {selectedAppt.time} • {getStaffName(selectedAppt.staffId, staff)}
              </p>
              <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                <Phone size={10} /> {selectedAppt.whatsapp}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (confirm('Mover para a fila de espera?')) {
                    onCheckIn(selectedAppt);
                    setSelectedAppt(null);
                  }
                }}
                className="flex-1 py-2.5 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
              >
                <CheckCircle size={14} /> Check-in
              </button>
              <button
                onClick={() => {
                  if (confirm('Cancelar agendamento?')) {
                    onCancel(selectedAppt.id);
                    setSelectedAppt(null);
                  }
                }}
                className="px-4 py-2.5 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 rounded-xl text-xs font-bold"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <button
              onClick={() => setSelectedAppt(null)}
              className="w-full py-2 text-text-secondary text-sm hover:text-text-primary"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showBooking && (
        <AppointmentBookingModal
          services={services}
          staff={staff}
          settings={settings}
          occupancy={occupancy}
          defaultDate={selectedDate}
          defaultStaffId={view === 'professional' ? selectedStaffId : undefined}
          onBook={onBook}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
};
