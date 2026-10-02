import type { DaySchedule, Service, ShopSettings, StaffMember } from '../../types';

export const schedule: DaySchedule[] = [
  { dayName: 'Domingo', isOpen: false, openTime: '09:00', closeTime: '18:00' },
  { dayName: 'Segunda', isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayName: 'Terça', isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayName: 'Quarta', isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayName: 'Quinta', isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayName: 'Sexta', isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayName: 'Sábado', isOpen: true, openTime: '08:30', closeTime: '17:00' },
];

export const settings: ShopSettings = {
  shopName: 'Barbearia Central',
  whatsapp: '5511999990000',
  schedule,
  operationMode: 'HYBRID',
};

export const staff: StaffMember[] = [
  { id: 'st-1', name: 'Ana Souza', email: 'ana@barbearia.com', role: 'OWNER' },
  { id: 'st-2', name: 'Bruno Lima', email: 'bruno@barbearia.com', role: 'EMPLOYEE' },
];

export const services: Service[] = [
  { id: 'svc-1', name: 'Corte + Barba', price: 55, avgTimeMinutes: 50, icon: 'scissors' },
  { id: 'svc-2', name: 'Corte social', price: 35, avgTimeMinutes: 30, icon: 'scissors' },
  { id: 'svc-3', name: 'Barba', price: 30, avgTimeMinutes: 20, icon: 'scissors' },
];
