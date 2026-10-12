/**
 * Fonte única da verdade do que cada segmento significa no frontend.
 *
 * Espelho de `backend/src/shared/segments`. São pacotes separados, então a
 * paridade é garantida por teste (`segmentParity.test.ts`), que compara as
 * chaves deste arquivo com o `segmentParity.json` publicado pelo backend.
 */

export const SEGMENT_LABEL_KEYS = [
  'segmentLabel',
  'shopNoun',
  'shopNounPlural',
  'professional',
  'professionalPlural',
  'client',
  'clientPlural',
  'service',
  'servicePlural',
  'queue',
  'appointment',
  'staff',
] as const;

export type SegmentLabelKey = (typeof SEGMENT_LABEL_KEYS)[number];

export type BusinessSegment =
  | 'BARBERSHOP'
  | 'HAIR_SALON'
  | 'NAIL_STUDIO'
  | 'PETSHOP'
  | 'BEAUTY_STUDIO'
  | 'LASH_BROW_STUDIO'
  | 'AESTHETICS'
  | 'SPA'
  | 'OTHER';

export type TargetAudience = 'MASCULINO' | 'FEMININO' | 'UNISSEX';

export interface SegmentConfig {
  segment: BusinessSegment;
  firstClass: boolean;
  labels: Record<SegmentLabelKey, string>;
  targetAudience: {
    applies: boolean;
    suggested: TargetAudience | null;
  };
  /** Ícone do card de cadastro (lucide). */
  icon: string;
  /** Uma linha de descrição no card. */
  cardDescription: string;
  /** Texto do segmented control de público. */
  audienceQuestion: string;
  /**
   * Resumo mostrado embaixo das opções depois da escolha ("Vamos preparar…").
   * Só do lado do front: a paridade com o backend compara labels/firstClass/
   * targetAudience, não este texto.
   */
  pickSummary: string;
}

export const SEGMENT_CONFIGS: Record<BusinessSegment, SegmentConfig> = {
  BARBERSHOP: {
    segment: 'BARBERSHOP',
    firstClass: true,
    icon: 'Scissors',
    cardDescription: 'Cortes, barba e atendimento por fila.',
    audienceQuestion: 'Quem você atende?',
    pickSummary: 'Vamos preparar serviços, textos e horários para barbearias.',
    labels: {
      segmentLabel: 'Barbearia',
      shopNoun: 'barbearia',
      shopNounPlural: 'barbearias',
      professional: 'barbeiro',
      professionalPlural: 'barbeiros',
      client: 'cliente',
      clientPlural: 'clientes',
      service: 'atendimento',
      servicePlural: 'atendimentos',
      queue: 'fila',
      appointment: 'agenda',
      staff: 'equipe',
    },
    targetAudience: { applies: true, suggested: 'MASCULINO' },
  },
  HAIR_SALON: {
    segment: 'HAIR_SALON',
    firstClass: true,
    icon: 'Sparkles',
    cardDescription: 'Corte, coloração e tratamento com hora marcada.',
    audienceQuestion: 'Quem você atende?',
    pickSummary: 'Vamos preparar serviços, textos e horários para salões de cabelo.',
    labels: {
      segmentLabel: 'Salão de cabelo',
      shopNoun: 'salão',
      shopNounPlural: 'salões',
      professional: 'cabeleireiro(a)',
      professionalPlural: 'cabeleireiros(as)',
      client: 'cliente',
      clientPlural: 'clientes',
      service: 'serviço',
      servicePlural: 'serviços',
      queue: 'fila',
      appointment: 'agenda',
      staff: 'equipe',
    },
    targetAudience: { applies: true, suggested: 'UNISSEX' },
  },
  NAIL_STUDIO: {
    segment: 'NAIL_STUDIO',
    firstClass: true,
    icon: 'Gem',
    cardDescription: 'Manicure, pedicure, gel e nail art.',
    audienceQuestion: 'Quem você atende?',
    pickSummary: 'Vamos preparar serviços, textos e horários para estúdios de unhas.',
    labels: {
      segmentLabel: 'Manicure e nails',
      shopNoun: 'studio',
      shopNounPlural: 'studios',
      professional: 'manicure',
      professionalPlural: 'manicures',
      client: 'cliente',
      clientPlural: 'clientes',
      service: 'serviço',
      servicePlural: 'serviços',
      queue: 'fila',
      appointment: 'agenda',
      staff: 'equipe',
    },
    targetAudience: { applies: true, suggested: 'FEMININO' },
  },
  PETSHOP: {
    segment: 'PETSHOP',
    firstClass: true,
    icon: 'Droplets',
    cardDescription: 'Banho, tosa e cuidados para pets.',
    audienceQuestion: 'Quem você atende?',
    pickSummary: 'Vamos preparar serviços, textos e horários para petshops.',
    labels: {
      segmentLabel: 'Petshop',
      shopNoun: 'petshop',
      shopNounPlural: 'petshops',
      professional: 'tosador(a)',
      professionalPlural: 'tosadores(as)',
      client: 'tutor(a)',
      clientPlural: 'tutores(as)',
      service: 'serviço',
      servicePlural: 'serviços',
      queue: 'fila',
      appointment: 'agenda',
      staff: 'equipe',
    },
    targetAudience: { applies: false, suggested: null },
  },
  BEAUTY_STUDIO: {
    segment: 'BEAUTY_STUDIO',
    firstClass: false,
    icon: 'Smile',
    cardDescription: 'Estética facial e corporal.',
    audienceQuestion: 'Quem você atende?',
    pickSummary: 'Vamos preparar serviços, textos e horários para studios de beleza.',
    labels: {
      segmentLabel: 'Studio de beleza',
      shopNoun: 'studio',
      shopNounPlural: 'studios',
      professional: 'profissional',
      professionalPlural: 'profissionais',
      client: 'cliente',
      clientPlural: 'clientes',
      service: 'serviço',
      servicePlural: 'serviços',
      queue: 'fila',
      appointment: 'agenda',
      staff: 'equipe',
    },
    targetAudience: { applies: true, suggested: 'FEMININO' },
  },
  LASH_BROW_STUDIO: {
    segment: 'LASH_BROW_STUDIO',
    firstClass: false,
    icon: 'Eye',
    cardDescription: 'Extensão de cílios e design de sobrancelha.',
    audienceQuestion: 'Quem você atende?',
    pickSummary: 'Vamos preparar serviços, textos e horários para estúdios de cílios e sobrancelhas.',
    labels: {
      segmentLabel: 'Cílios e sobrancelhas',
      shopNoun: 'studio',
      shopNounPlural: 'studios',
      professional: 'profissional',
      professionalPlural: 'profissionais',
      client: 'cliente',
      clientPlural: 'clientes',
      service: 'serviço',
      servicePlural: 'serviços',
      queue: 'fila',
      appointment: 'agenda',
      staff: 'equipe',
    },
    targetAudience: { applies: true, suggested: 'FEMININO' },
  },
  AESTHETICS: {
    segment: 'AESTHETICS',
    firstClass: false,
    icon: 'Paintbrush',
    cardDescription: 'Protocolos de estética.',
    audienceQuestion: 'Quem você atende?',
    pickSummary: 'Vamos preparar serviços, textos e horários para clínicas de estética.',
    labels: {
      segmentLabel: 'Estética',
      shopNoun: 'estética',
      shopNounPlural: 'estéticas',
      professional: 'profissional',
      professionalPlural: 'profissionais',
      client: 'cliente',
      clientPlural: 'clientes',
      service: 'sessão',
      servicePlural: 'sessões',
      queue: 'fila',
      appointment: 'agenda',
      staff: 'equipe',
    },
    targetAudience: { applies: true, suggested: 'FEMININO' },
  },
  SPA: {
    segment: 'SPA',
    firstClass: false,
    icon: 'Coffee',
    cardDescription: 'Massagem e relaxamento.',
    audienceQuestion: 'Quem você atende?',
    pickSummary: 'Vamos preparar serviços, textos e horários para spas.',
    labels: {
      segmentLabel: 'Spa',
      shopNoun: 'spa',
      shopNounPlural: 'spas',
      professional: 'profissional',
      professionalPlural: 'profissionais',
      client: 'cliente',
      clientPlural: 'clientes',
      service: 'sessão',
      servicePlural: 'sessões',
      queue: 'fila',
      appointment: 'agenda',
      staff: 'equipe',
    },
    targetAudience: { applies: true, suggested: 'UNISSEX' },
  },
  OTHER: {
    segment: 'OTHER',
    firstClass: false,
    icon: 'Briefcase',
    cardDescription: 'Não se encaixa nas opções acima.',
    audienceQuestion: 'Quem você atende?',
    pickSummary: 'Você pode ajustar serviços e textos depois, nas configurações.',
    labels: {
      segmentLabel: 'Outro',
      shopNoun: 'estabelecimento',
      shopNounPlural: 'estabelecimentos',
      professional: 'profissional',
      professionalPlural: 'profissionais',
      client: 'cliente',
      clientPlural: 'clientes',
      service: 'serviço',
      servicePlural: 'serviços',
      queue: 'fila',
      appointment: 'agenda',
      staff: 'equipe',
    },
    targetAudience: { applies: true, suggested: 'UNISSEX' },
  },
};

/** Segmentos oferecidos no cadastro, em ordem de exibição. */
export const FIRST_CLASS_SEGMENTS: BusinessSegment[] = [
  'BARBERSHOP',
  'HAIR_SALON',
  'NAIL_STUDIO',
  'PETSHOP',
];

export const ALL_SEGMENTS: BusinessSegment[] = [
  'BARBERSHOP',
  'HAIR_SALON',
  'NAIL_STUDIO',
  'PETSHOP',
  'BEAUTY_STUDIO',
  'LASH_BROW_STUDIO',
  'AESTHETICS',
  'SPA',
  'OTHER',
];

export const AUDIENCE_OPTIONS: { value: TargetAudience; label: string }[] = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMININO', label: 'Feminino' },
  { value: 'UNISSEX', label: 'Unissex' },
];

export function getSegmentConfig(segment: BusinessSegment | null | undefined): SegmentConfig {
  if (segment && SEGMENT_CONFIGS[segment]) return SEGMENT_CONFIGS[segment];
  return SEGMENT_CONFIGS.OTHER;
}

export function audienceAppliesTo(segment: BusinessSegment): boolean {
  return getSegmentConfig(segment).targetAudience.applies;
}
