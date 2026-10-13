/**
 * Tipos do vocabulário de segmentos — pedaço da fonte única do frontend.
 * Reexportados por `./index`; os consumidores seguem importando de lá.
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
  | 'MAKEUP_STUDIO'
  | 'PHYSIOTHERAPY'
  | 'NUTRITION'
  | 'PSYCHOTHERAPY'
  | 'VETERINARY'
  | 'CAR_WASH'
  | 'AUTO_REPAIR'
  | 'PHOTO_STUDIO'
  | 'TATTOO_PIERCING'
  | 'COACHING'
  | 'PRIVATE_CLASSES'
  | 'TECH_SUPPORT'
  | 'HOME_SERVICES'
  | 'OTHER';

export type TargetAudience = 'MASCULINO' | 'FEMININO' | 'UNISSEX';

/** Grupos do cadastro, na ordem de exibição. `other` sempre por último. */
export type SegmentGroup = 'beauty' | 'wellness' | 'health' | 'pet' | 'automotive' | 'services' | 'other';

export const SEGMENT_GROUP_LABELS: Record<SegmentGroup, string> = {
  beauty: 'Beleza e cabelo',
  wellness: 'Bem-estar',
  health: 'Saúde',
  pet: 'Pet',
  automotive: 'Automotivo',
  services: 'Outros serviços',
  other: 'Outros',
};

/** Ficha auxiliar do cliente sugerida pelo segmento (pet reusa o MVP de pets). */
export type SegmentAuxiliaryProfile = 'pet' | 'vehicle';

/**
 * Modo de atendimento que o backend já aplica na criação quando o segmento
 * vem informado: fila só, agenda só ou os dois.
 */
export type SegmentOperationMode = 'QUEUE_ONLY' | 'APPOINTMENTS_ONLY' | 'HYBRID';

export interface SegmentCatalogCategory {
  name: string;
  icon: string;
}

export interface SegmentCatalogService {
  name: string;
  /** 0 = placeholder: o dono preenche o preço. */
  price: number;
  avgTimeMinutes: number;
  icon: string;
  categoryName: string;
}

export interface SegmentCatalog {
  serviceCategories: SegmentCatalogCategory[];
  services: SegmentCatalogService[];
}

export interface SegmentScheduleDay {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface SegmentConfig {
  segment: BusinessSegment;
  group: SegmentGroup;
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
   * Só do lado do front: a paridade com o backend compara labels/group/
   * targetAudience, não este texto.
   */
  pickSummary: string;
  /**
   * Aviso nos segmentos de saúde: agenda e relacionamento, não prontuário.
   * Obrigatório nos três; ausente nos demais.
   */
  complianceNote?: string;
  /** Ficha auxiliar opcional do cliente (pet/vehicle). Ausente = nenhuma. */
  auxiliaryProfile?: SegmentAuxiliaryProfile;
}
