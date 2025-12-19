import { Service, ShopSettings } from './types';

// Substitua pelo número real do dono da barbearia
export const BARBER_PHONE = '5511999999999'; 

const DEFAULT_SCHEDULE = [
  { dayName: 'Domingo', isOpen: false, openTime: '09:00', closeTime: '13:00' },
  { dayName: 'Segunda-feira', isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayName: 'Terça-feira', isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayName: 'Quarta-feira', isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayName: 'Quinta-feira', isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayName: 'Sexta-feira', isOpen: true, openTime: '09:00', closeTime: '20:00' },
  { dayName: 'Sábado', isOpen: true, openTime: '09:00', closeTime: '18:00' },
];

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  shopName: 'Reis Barbearia',
  schedule: DEFAULT_SCHEDULE
};

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Corte de Cabelo',
    price: 35.00,
    avgTimeMinutes: 30,
    icon: 'Scissors'
  },
  {
    id: 's2',
    name: 'Barba',
    price: 25.00,
    avgTimeMinutes: 20,
    icon: 'Anchor'
  },
  {
    id: 's3',
    name: 'Cabelo + Barba',
    price: 50.00,
    avgTimeMinutes: 45,
    icon: 'Crown'
  },
  {
    id: 's4',
    name: 'Sobrancelha',
    price: 15.00,
    avgTimeMinutes: 10,
    icon: 'Eye'
  }
];

export const MOCK_QUEUE_INITIAL: any[] = [
  // Intentionally empty for fresh start
];