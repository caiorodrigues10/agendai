/* eslint-disable max-lines -- arquivo gerado; rode `npm run segments:mirror` */
/**
 * Catálogo inicial, preset de horário e modo sugerido de cada segmento.
 *
 * GERADO a partir do `segmentParity.json` do backend (fonte única).
 * Depois de mexer em `backend/src/shared/segments`, rode:
 *   npm run segments:parity   (backend)
 *   npm run segments:mirror   (frontend)
 * O teste de paridade compara este arquivo com o JSON, então dados
 * desatualizados falham no teste, não em produção.
 */
import type {
  BusinessSegment,
  SegmentCatalog,
  SegmentOperationMode,
  SegmentScheduleDay,
} from './types';

const PRESET_SEG_SAB_0900_1900: SegmentScheduleDay[] = [
  { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '19:00' },
];
const PRESET_SEG_SEX_0900_1800: SegmentScheduleDay[] = [
  { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '18:00' },
  { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { dayOfWeek: 6, isOpen: false, openTime: '09:00', closeTime: '18:00' },
];
const PRESET_SEG_SAB_0800_1800: SegmentScheduleDay[] = [
  { dayOfWeek: 0, isOpen: false, openTime: '08:00', closeTime: '18:00' },
  { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '18:00' },
  { dayOfWeek: 6, isOpen: true, openTime: '08:00', closeTime: '18:00' },
];

export const SEGMENT_SCHEDULE_PRESETS: Record<BusinessSegment, SegmentScheduleDay[]> = {
  BARBERSHOP: PRESET_SEG_SAB_0900_1900,
  HAIR_SALON: PRESET_SEG_SEX_0900_1800,
  NAIL_STUDIO: PRESET_SEG_SEX_0900_1800,
  PETSHOP: PRESET_SEG_SAB_0800_1800,
  BEAUTY_STUDIO: PRESET_SEG_SEX_0900_1800,
  LASH_BROW_STUDIO: PRESET_SEG_SEX_0900_1800,
  AESTHETICS: PRESET_SEG_SEX_0900_1800,
  SPA: PRESET_SEG_SEX_0900_1800,
  MAKEUP_STUDIO: PRESET_SEG_SEX_0900_1800,
  PHYSIOTHERAPY: PRESET_SEG_SEX_0900_1800,
  NUTRITION: PRESET_SEG_SEX_0900_1800,
  PSYCHOTHERAPY: PRESET_SEG_SEX_0900_1800,
  VETERINARY: PRESET_SEG_SAB_0900_1900,
  CAR_WASH: PRESET_SEG_SAB_0900_1900,
  AUTO_REPAIR: PRESET_SEG_SEX_0900_1800,
  PHOTO_STUDIO: PRESET_SEG_SEX_0900_1800,
  TATTOO_PIERCING: PRESET_SEG_SAB_0900_1900,
  COACHING: PRESET_SEG_SEX_0900_1800,
  PRIVATE_CLASSES: PRESET_SEG_SAB_0900_1900,
  TECH_SUPPORT: PRESET_SEG_SEX_0900_1800,
  HOME_SERVICES: PRESET_SEG_SEX_0900_1800,
  OTHER: PRESET_SEG_SAB_0900_1900,
};

export const SEGMENT_OPERATION_MODES: Record<BusinessSegment, SegmentOperationMode> = {
  BARBERSHOP: 'QUEUE_ONLY',
  HAIR_SALON: 'APPOINTMENTS_ONLY',
  NAIL_STUDIO: 'APPOINTMENTS_ONLY',
  PETSHOP: 'APPOINTMENTS_ONLY',
  BEAUTY_STUDIO: 'APPOINTMENTS_ONLY',
  LASH_BROW_STUDIO: 'APPOINTMENTS_ONLY',
  AESTHETICS: 'APPOINTMENTS_ONLY',
  SPA: 'APPOINTMENTS_ONLY',
  MAKEUP_STUDIO: 'APPOINTMENTS_ONLY',
  PHYSIOTHERAPY: 'APPOINTMENTS_ONLY',
  NUTRITION: 'APPOINTMENTS_ONLY',
  PSYCHOTHERAPY: 'APPOINTMENTS_ONLY',
  VETERINARY: 'HYBRID',
  CAR_WASH: 'HYBRID',
  AUTO_REPAIR: 'APPOINTMENTS_ONLY',
  PHOTO_STUDIO: 'APPOINTMENTS_ONLY',
  TATTOO_PIERCING: 'APPOINTMENTS_ONLY',
  COACHING: 'APPOINTMENTS_ONLY',
  PRIVATE_CLASSES: 'APPOINTMENTS_ONLY',
  TECH_SUPPORT: 'HYBRID',
  HOME_SERVICES: 'HYBRID',
  OTHER: 'HYBRID',
};

export const SEGMENT_CATALOGS: Record<BusinessSegment, SegmentCatalog> = {
  BARBERSHOP: {
    serviceCategories: [
      { name: 'Cortes', icon: 'scissors' },
      { name: 'Barba', icon: 'user' },
    ],
    services: [
      { name: 'Corte', price: 45, avgTimeMinutes: 30, icon: 'scissors', categoryName: 'Cortes' },
      { name: 'Barba', price: 30, avgTimeMinutes: 20, icon: 'user', categoryName: 'Barba' },
      {
        name: 'Corte + barba',
        price: 65,
        avgTimeMinutes: 45,
        icon: 'scissors',
        categoryName: 'Cortes',
      },
      {
        name: 'Sobrancelha',
        price: 20,
        avgTimeMinutes: 15,
        icon: 'sparkles',
        categoryName: 'Cortes',
      },
      {
        name: 'Pigmentação de barba',
        price: 35,
        avgTimeMinutes: 30,
        icon: 'palette',
        categoryName: 'Barba',
      },
    ],
  },
  HAIR_SALON: {
    serviceCategories: [
      { name: 'Cabelo', icon: 'scissors' },
      { name: 'Coloração', icon: 'palette' },
      { name: 'Tratamento', icon: 'sparkles' },
    ],
    services: [
      {
        name: 'Corte feminino',
        price: 80,
        avgTimeMinutes: 45,
        icon: 'scissors',
        categoryName: 'Cabelo',
      },
      {
        name: 'Corte masculino',
        price: 60,
        avgTimeMinutes: 40,
        icon: 'scissors',
        categoryName: 'Cabelo',
      },
      { name: 'Escova', price: 55, avgTimeMinutes: 40, icon: 'sparkles', categoryName: 'Cabelo' },
      {
        name: 'Coloração',
        price: 180,
        avgTimeMinutes: 120,
        icon: 'palette',
        categoryName: 'Coloração',
      },
      {
        name: 'Mechas',
        price: 250,
        avgTimeMinutes: 150,
        icon: 'palette',
        categoryName: 'Coloração',
      },
      {
        name: 'Hidratação',
        price: 70,
        avgTimeMinutes: 40,
        icon: 'sparkles',
        categoryName: 'Tratamento',
      },
      {
        name: 'Progressiva',
        price: 220,
        avgTimeMinutes: 120,
        icon: 'sparkles',
        categoryName: 'Tratamento',
      },
    ],
  },
  NAIL_STUDIO: {
    serviceCategories: [
      { name: 'Unhas naturais', icon: 'sparkles' },
      { name: 'Alongamento', icon: 'palette' },
      { name: 'Design', icon: 'heart' },
    ],
    services: [
      {
        name: 'Manicure',
        price: 40,
        avgTimeMinutes: 40,
        icon: 'sparkles',
        categoryName: 'Unhas naturais',
      },
      {
        name: 'Pedicure',
        price: 45,
        avgTimeMinutes: 45,
        icon: 'sparkles',
        categoryName: 'Unhas naturais',
      },
      {
        name: 'Esmaltação em gel',
        price: 70,
        avgTimeMinutes: 60,
        icon: 'palette',
        categoryName: 'Unhas naturais',
      },
      {
        name: 'Alongamento em fibra',
        price: 150,
        avgTimeMinutes: 120,
        icon: 'palette',
        categoryName: 'Alongamento',
      },
      {
        name: 'Alongamento em gel',
        price: 170,
        avgTimeMinutes: 130,
        icon: 'palette',
        categoryName: 'Alongamento',
      },
      { name: 'Nail art', price: 35, avgTimeMinutes: 30, icon: 'heart', categoryName: 'Design' },
      {
        name: 'Remoção',
        price: 30,
        avgTimeMinutes: 30,
        icon: 'sparkles',
        categoryName: 'Unhas naturais',
      },
    ],
  },
  PETSHOP: {
    serviceCategories: [
      { name: 'Banho', icon: 'droplets' },
      { name: 'Tosa', icon: 'scissors' },
      { name: 'Cuidados', icon: 'heart' },
    ],
    services: [
      { name: 'Banho', price: 60, avgTimeMinutes: 45, icon: 'droplets', categoryName: 'Banho' },
      {
        name: 'Tosa higiênica',
        price: 45,
        avgTimeMinutes: 30,
        icon: 'scissors',
        categoryName: 'Tosa',
      },
      {
        name: 'Tosa completa',
        price: 80,
        avgTimeMinutes: 60,
        icon: 'scissors',
        categoryName: 'Tosa',
      },
      {
        name: 'Banho + tosa',
        price: 110,
        avgTimeMinutes: 90,
        icon: 'sparkles',
        categoryName: 'Banho',
      },
      {
        name: 'Hidratação de pelagem',
        price: 55,
        avgTimeMinutes: 30,
        icon: 'droplets',
        categoryName: 'Cuidados',
      },
      {
        name: 'Corte de unhas',
        price: 25,
        avgTimeMinutes: 15,
        icon: 'scissors',
        categoryName: 'Cuidados',
      },
      {
        name: 'Limpeza de ouvidos',
        price: 20,
        avgTimeMinutes: 10,
        icon: 'heart',
        categoryName: 'Cuidados',
      },
    ],
  },
  BEAUTY_STUDIO: {
    serviceCategories: [
      { name: 'Estética facial', icon: 'smile' },
      { name: 'Corpo', icon: 'heart' },
    ],
    services: [
      {
        name: 'Limpeza de pele',
        price: 120,
        avgTimeMinutes: 60,
        icon: 'smile',
        categoryName: 'Estética facial',
      },
    ],
  },
  LASH_BROW_STUDIO: {
    serviceCategories: [
      { name: 'Cílios', icon: 'eye' },
      { name: 'Sobrancelhas', icon: 'sparkles' },
    ],
    services: [
      {
        name: 'Extensão de cílios',
        price: 150,
        avgTimeMinutes: 90,
        icon: 'eye',
        categoryName: 'Cílios',
      },
      {
        name: 'Design de sobrancelha',
        price: 50,
        avgTimeMinutes: 30,
        icon: 'sparkles',
        categoryName: 'Sobrancelhas',
      },
    ],
  },
  AESTHETICS: {
    serviceCategories: [
      { name: 'Facial', icon: 'smile' },
      { name: 'Corporal', icon: 'heart' },
    ],
    services: [
      { name: 'Peeling', price: 180, avgTimeMinutes: 50, icon: 'smile', categoryName: 'Facial' },
    ],
  },
  SPA: {
    serviceCategories: [
      { name: 'Massagem', icon: 'heart' },
      { name: 'Relaxamento', icon: 'sparkles' },
    ],
    services: [
      {
        name: 'Massagem relaxante',
        price: 160,
        avgTimeMinutes: 60,
        icon: 'heart',
        categoryName: 'Massagem',
      },
    ],
  },
  MAKEUP_STUDIO: {
    serviceCategories: [
      { name: 'Maquiagem', icon: 'palette' },
      { name: 'Cabelo', icon: 'scissors' },
    ],
    services: [
      {
        name: 'Maquiagem social',
        price: 0,
        avgTimeMinutes: 60,
        icon: 'palette',
        categoryName: 'Maquiagem',
      },
      {
        name: 'Maquiagem noiva',
        price: 0,
        avgTimeMinutes: 90,
        icon: 'sparkles',
        categoryName: 'Maquiagem',
      },
      { name: 'Penteado', price: 0, avgTimeMinutes: 45, icon: 'scissors', categoryName: 'Cabelo' },
    ],
  },
  PHYSIOTHERAPY: {
    serviceCategories: [
      { name: 'Sessões', icon: 'heart' },
      { name: 'Avaliação', icon: 'clipboard' },
    ],
    services: [
      {
        name: 'Sessão de fisioterapia',
        price: 0,
        avgTimeMinutes: 50,
        icon: 'heart',
        categoryName: 'Sessões',
      },
      {
        name: 'Sessão de quiropraxia',
        price: 0,
        avgTimeMinutes: 40,
        icon: 'sparkles',
        categoryName: 'Sessões',
      },
      {
        name: 'Avaliação inicial',
        price: 0,
        avgTimeMinutes: 30,
        icon: 'clipboard',
        categoryName: 'Avaliação',
      },
    ],
  },
  NUTRITION: {
    serviceCategories: [
      { name: 'Consultas', icon: 'clipboard' },
      { name: 'Acompanhamento', icon: 'calendar' },
    ],
    services: [
      {
        name: 'Consulta de nutrição',
        price: 0,
        avgTimeMinutes: 45,
        icon: 'clipboard',
        categoryName: 'Consultas',
      },
      {
        name: 'Consulta de retorno',
        price: 0,
        avgTimeMinutes: 30,
        icon: 'calendar',
        categoryName: 'Acompanhamento',
      },
    ],
  },
  PSYCHOTHERAPY: {
    serviceCategories: [{ name: 'Sessões', icon: 'heart' }],
    services: [
      {
        name: 'Sessão de terapia',
        price: 0,
        avgTimeMinutes: 50,
        icon: 'heart',
        categoryName: 'Sessões',
      },
    ],
  },
  VETERINARY: {
    serviceCategories: [
      { name: 'Consultas', icon: 'stethoscope' },
      { name: 'Procedimentos', icon: 'sparkles' },
    ],
    services: [
      {
        name: 'Consulta veterinária',
        price: 0,
        avgTimeMinutes: 30,
        icon: 'stethoscope',
        categoryName: 'Consultas',
      },
      {
        name: 'Vacinação',
        price: 0,
        avgTimeMinutes: 20,
        icon: 'sparkles',
        categoryName: 'Procedimentos',
      },
      {
        name: 'Banho terapêutico',
        price: 0,
        avgTimeMinutes: 45,
        icon: 'droplets',
        categoryName: 'Procedimentos',
      },
    ],
  },
  CAR_WASH: {
    serviceCategories: [
      { name: 'Lavagem', icon: 'droplets' },
      { name: 'Estética', icon: 'sparkles' },
    ],
    services: [
      {
        name: 'Lavagem simples',
        price: 0,
        avgTimeMinutes: 30,
        icon: 'droplets',
        categoryName: 'Lavagem',
      },
      {
        name: 'Lavagem completa',
        price: 0,
        avgTimeMinutes: 60,
        icon: 'sparkles',
        categoryName: 'Lavagem',
      },
      {
        name: 'Enceramento',
        price: 0,
        avgTimeMinutes: 45,
        icon: 'sparkles',
        categoryName: 'Estética',
      },
    ],
  },
  AUTO_REPAIR: {
    serviceCategories: [
      { name: 'Manutenção', icon: 'wrench' },
      { name: 'Revisão', icon: 'clipboard' },
    ],
    services: [
      {
        name: 'Troca de óleo',
        price: 0,
        avgTimeMinutes: 40,
        icon: 'wrench',
        categoryName: 'Manutenção',
      },
      {
        name: 'Revisão periódica',
        price: 0,
        avgTimeMinutes: 90,
        icon: 'clipboard',
        categoryName: 'Revisão',
      },
      {
        name: 'Alinhamento e balanceamento',
        price: 0,
        avgTimeMinutes: 60,
        icon: 'wrench',
        categoryName: 'Manutenção',
      },
    ],
  },
  PHOTO_STUDIO: {
    serviceCategories: [
      { name: 'Ensaio', icon: 'camera' },
      { name: 'Evento', icon: 'star' },
    ],
    services: [
      {
        name: 'Ensaio fotográfico',
        price: 0,
        avgTimeMinutes: 90,
        icon: 'camera',
        categoryName: 'Ensaio',
      },
      {
        name: 'Cobertura de evento',
        price: 0,
        avgTimeMinutes: 180,
        icon: 'star',
        categoryName: 'Evento',
      },
    ],
  },
  TATTOO_PIERCING: {
    serviceCategories: [
      { name: 'Tatuagem', icon: 'penTool' },
      { name: 'Piercing', icon: 'sparkles' },
    ],
    services: [
      {
        name: 'Sessão de tatuagem',
        price: 0,
        avgTimeMinutes: 120,
        icon: 'penTool',
        categoryName: 'Tatuagem',
      },
      {
        name: 'Aplicação de piercing',
        price: 0,
        avgTimeMinutes: 30,
        icon: 'sparkles',
        categoryName: 'Piercing',
      },
    ],
  },
  COACHING: {
    serviceCategories: [{ name: 'Sessões', icon: 'briefcase' }],
    services: [
      {
        name: 'Sessão de consultoria',
        price: 0,
        avgTimeMinutes: 60,
        icon: 'briefcase',
        categoryName: 'Sessões',
      },
      {
        name: 'Sessão de acompanhamento',
        price: 0,
        avgTimeMinutes: 45,
        icon: 'calendar',
        categoryName: 'Sessões',
      },
    ],
  },
  PRIVATE_CLASSES: {
    serviceCategories: [{ name: 'Aulas', icon: 'music' }],
    services: [
      {
        name: 'Aula particular',
        price: 0,
        avgTimeMinutes: 60,
        icon: 'music',
        categoryName: 'Aulas',
      },
      {
        name: 'Aula experimental',
        price: 0,
        avgTimeMinutes: 45,
        icon: 'star',
        categoryName: 'Aulas',
      },
    ],
  },
  TECH_SUPPORT: {
    serviceCategories: [
      { name: 'Atendimentos', icon: 'wrench' },
      { name: 'Entrega', icon: 'package' },
    ],
    services: [
      {
        name: 'Atendimento técnico',
        price: 0,
        avgTimeMinutes: 45,
        icon: 'wrench',
        categoryName: 'Atendimentos',
      },
      {
        name: 'Visita técnica',
        price: 0,
        avgTimeMinutes: 60,
        icon: 'package',
        categoryName: 'Atendimentos',
      },
    ],
  },
  HOME_SERVICES: {
    serviceCategories: [{ name: 'Serviços', icon: 'home' }],
    services: [
      {
        name: 'Diária de limpeza',
        price: 0,
        avgTimeMinutes: 240,
        icon: 'home',
        categoryName: 'Serviços',
      },
      {
        name: 'Visita técnica',
        price: 0,
        avgTimeMinutes: 90,
        icon: 'wrench',
        categoryName: 'Serviços',
      },
    ],
  },
  OTHER: {
    serviceCategories: [{ name: 'Serviços', icon: 'sparkles' }],
    services: [
      { name: 'Serviço', price: 0, avgTimeMinutes: 30, icon: 'sparkles', categoryName: 'Serviços' },
    ],
  },
};
