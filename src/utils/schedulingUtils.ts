import { Appointment, Service, ShopSettings, StaffMember, DaySchedule } from '../types';

export interface AvailabilitySlot {
  time: string;
  staffId: string | null;
  durationMinutes: number;
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const DEFAULT_SCHEDULE: DaySchedule[] = DAY_NAMES.map((dayName) => ({
  dayName,
  isOpen: dayName !== 'Domingo',
  openTime: '09:00',
  closeTime: '18:00'
}));

export function mapScheduleFromApi(
  items?: Array<{ dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string }> | null
): DaySchedule[] {
  if (!items?.length) return DEFAULT_SCHEDULE;

  return DEFAULT_SCHEDULE.map((day, index) => {
    const item = items.find((entry) => entry.dayOfWeek === index);
    if (!item) return day;
    return {
      dayName: DAY_NAMES[index],
      isOpen: item.isOpen,
      openTime: item.openTime,
      closeTime: item.closeTime
    };
  });
}

export function mapScheduleToApi(
  schedule: DaySchedule[]
): Array<{ dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string }> {
  return schedule.map((day, index) => ({
    dayOfWeek: index,
    isOpen: day.isOpen,
    openTime: day.openTime,
    closeTime: day.closeTime,
  }));
}

export function mapStaffFromApi(raw: Record<string, unknown>): StaffMember {
  const roleRaw = String(raw.role ?? 'EMPLOYEE').toUpperCase();
  const role: StaffMember['role'] =
    roleRaw === 'MASTER_ADMIN' || roleRaw === 'OWNER' || roleRaw === 'EMPLOYEE'
      ? roleRaw
      : 'EMPLOYEE';

  return {
    id: String(raw.id),
    name: String(raw.name),
    email: String(raw.email),
    role,
    barbershopId: raw.barbershopId ? String(raw.barbershopId) : undefined,
  };
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function generateTimeSlots(openTime?: string, closeTime?: string, interval = 30): string[] {
  if (!openTime || !closeTime) return [];
  const slots: string[] = [];
  let [currHour, currMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  while (currHour < closeHour || (currHour === closeHour && currMinute < closeMinute)) {
    slots.push(`${currHour.toString().padStart(2, '0')}:${currMinute.toString().padStart(2, '0')}`);
    currMinute += interval;
    if (currMinute >= 60) {
      currHour += 1;
      currMinute -= 60;
    }
  }
  return slots;
}

export function getDaySchedule(date: Date, schedule?: ShopSettings['schedule'] | null): DaySchedule {
  const safeSchedule = schedule?.length ? schedule : DEFAULT_SCHEDULE;
  const dayOfWeek = date.getDay();
  return safeSchedule[dayOfWeek] ?? DEFAULT_SCHEDULE[dayOfWeek];
}

export function isSlotAvailable(
  time: string,
  staffId: string | null | undefined,
  occupancy: AvailabilitySlot[],
  staffCount: number
): boolean {
  const slotStart = timeToMinutes(time);

  const conflicts = occupancy.filter((slot) => {
    const occupiedStart = timeToMinutes(slot.time);
    const occupiedEnd = occupiedStart + slot.durationMinutes;
    const checkEnd = slotStart + 30;
    const overlaps = slotStart < occupiedEnd && occupiedStart < checkEnd;
    if (!overlaps) return false;

    if (staffId && staffId !== 'any') {
      return !slot.staffId || slot.staffId === staffId;
    }
    return true;
  });

  if (staffId && staffId !== 'any') {
    return conflicts.length === 0;
  }

  const busyAtTime = occupancy.filter((slot) => {
    const occupiedStart = timeToMinutes(slot.time);
    const occupiedEnd = occupiedStart + slot.durationMinutes;
    return slotStart < occupiedEnd && occupiedStart < slotStart + 30;
  }).length;

  return busyAtTime < staffCount;
}

export function getServiceDuration(serviceId: string, services: Service[]): number {
  return services.find((s) => s.id === serviceId)?.avgTimeMinutes ?? 30;
}

export function getStaffName(staffId: string | null | undefined, staff: StaffMember[]): string {
  if (!staffId || staffId === 'any') return 'Qualquer';
  return staff.find((s) => s.id === staffId)?.name ?? 'Profissional';
}

export function getServiceName(serviceId: string, services: Service[]): string {
  return services.find((s) => s.id === serviceId)?.name ?? 'Serviço';
}

export function normalizeStaffId(staffId?: string | null): string | null {
  if (!staffId || staffId === 'any') return null;
  return staffId;
}

export function mapAppointmentFromApi(raw: any): Appointment {
  return {
    id: raw.id,
    barbershopId: raw.barbershopId,
    customerName: raw.customerName,
    whatsapp: raw.whatsapp,
    serviceId: raw.serviceId,
    staffId: raw.staffId ?? 'any',
    date: raw.date,
    time: raw.time,
    createdAt: raw.createdAt ?? Date.now(),
    status: raw.status ?? 'confirmed',
    serviceName: raw.serviceName,
    staffName: raw.staffName,
    serviceDurationMinutes: raw.serviceDurationMinutes
  };
}
