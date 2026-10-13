import { z } from 'zod';
import {
  ALL_SEGMENTS,
  AUDIENCE_OPTIONS,
  audienceAppliesTo,
  type BusinessSegment,
  type TargetAudience,
} from '@/shared/segments';

// Derivados do config central: um z.enum listado à mão diverge na primeira
// vez que um segmento novo entrar (já aconteceu com PETSHOP no backend).
const businessSegmentEnum = z.enum(
  ALL_SEGMENTS as [BusinessSegment, ...BusinessSegment[]]
);
const targetAudienceEnum = z.enum(
  AUDIENCE_OPTIONS.map(option => option.value) as [TargetAudience, ...TargetAudience[]]
);

export const CrmMergeSchema = z.object({
  targetId: z.string().uuid('Selecione o cadastro principal'),
  sourceIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos um duplicado'),
  confirmation: z.literal('MESCLAR', { errorMap: () => ({ message: 'Digite MESCLAR para confirmar' }) }),
}).refine(value => !value.sourceIds.includes(value.targetId) && new Set(value.sourceIds).size === value.sourceIds.length, {
  path: ['sourceIds'], message: 'Os duplicados devem ser distintos do cadastro principal',
});

export const CrmBackfillSchema = z.object({ confirmation: z.literal('REPROCESSAR', { errorMap: () => ({ message: 'Digite REPROCESSAR para confirmar' }) }) });
import {
  isValidCpf,
  normalizeDocument,
  isValidCnpj,
  isValidPhoneBR,
  normalizePhoneBR,
} from './utils/documentUtils';
import { isValidDate, isNotPast, isWithinHorizon, isBusinessHour } from './utils/dateUtils';

const whatsappRequired = z
  .string()
  .transform(v => normalizePhoneBR(v))
  .refine(v => isValidPhoneBR(v), {
    message: 'Telefone inválido (DDD + número com 8 ou 9 dígitos)',
  });

const whatsappOptional = z
  .string()
  .optional()
  .or(z.literal(''))
  .transform(v => normalizePhoneBR(v ?? ''))
  .refine(v => v === '' || isValidPhoneBR(v), {
    message: 'Telefone inválido (DDD + número com 8 ou 9 dígitos)',
  });

// --- Login Schema ---
export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

// --- Register Schema (cadastro owner + salão, wizard de 3 etapas) ---
// Um schema por etapa: o "Continuar" valida só os campos da própria tela e o
// `RegisterSchema` (composição) segue sendo o contrato enviado ao backend —
// mesma payload, nenhuma quebra.

const registerAccountShape = {
  ownerName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  authMethod: z.enum(['password', 'google']).default('password'),
  googleIdToken: z.string().optional(),
  password: z.string().optional(),
  cpf: z
    .string()
    .min(11, 'CPF inválido')
    .transform(v => normalizeDocument(v))
    .refine(v => isValidCpf(v), { message: 'CPF inválido (dígitos verificadores incorretos)' }),
  termsVersion: z.string().min(1),
  termsAccepted: z.boolean().refine(v => v === true, 'É necessário aceitar os Termos de Uso'),
  marketingOptIn: z.boolean().optional().default(false),
  lgpdConsent: z
    .boolean()
    .refine(v => v === true, 'É necessário consentir com o tratamento de dados (LGPD)'),
};

const registerSegmentShape = {
  // Obrigatório no formulário: sem segmento o cadastro não avança. O backend
  // aceita omitido (compat), mas a UI exige — é lá que a regra vive.
  businessSegment: businessSegmentEnum,
  // Texto livre de OTHER ("o que você faz?"). Normalizado/limitado no backend;
  // aqui só cortamos o óbvio para não enviar lixo.
  businessSegmentOther: z.string().max(80).optional(),
  // Público só existe em segmentos de beleza; PETSHOP não tem. O backend
  // também recusa — aqui o erro aparece antes de a requisição sair.
  targetAudience: targetAudienceEnum.nullable().optional(),
};

const registerBusinessShape = {
  barbershopName: z.string().min(3, 'Nome do salão é obrigatório'),
  whatsapp: whatsappRequired,
  cnpj: z
    .string()
    .optional()
    .refine(v => !v || isValidCnpj(v), {
      message: 'CNPJ inválido (dígitos verificadores incorretos)',
    })
    .transform(v => (v ? normalizeDocument(v) : v)),
  address: z.string().max(500).optional(),
  addressNumber: z.string().max(20).optional(),
  addressComplement: z.string().max(100).optional(),
  city: z.string().min(2, 'Informe a cidade').max(120),
  cep: z.string().max(9).optional(),
};

/** Etapa 1 — dados iniciais do responsável (inclui aceites; senha só no modo password). */
const refineAccountAuth = (
  data: z.infer<z.ZodObject<typeof registerAccountShape>>,
  ctx: z.RefinementCtx
) => {
  if (data.authMethod === 'password') {
    if (!data.password || data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'Senha deve ter no mínimo 6 caracteres',
      });
    }
  }
  if (data.authMethod === 'google' && !data.googleIdToken) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['googleIdToken'],
      message: 'Continue com o Google para concluir o cadastro',
    });
  }
};

/** Etapa 2 — público só nos segmentos em que se aplica. */
const refineSegmentAudience = (
  data: z.infer<z.ZodObject<typeof registerSegmentShape>>,
  ctx: z.RefinementCtx
) => {
  if (
    data.targetAudience &&
    data.businessSegment &&
    !audienceAppliesTo(data.businessSegment)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['targetAudience'],
      message: 'Público não se aplica ao segmento escolhido.',
    });
  }
};

export const RegisterStep1Schema = z
  .object(registerAccountShape)
  .superRefine(refineAccountAuth);

export const RegisterStep2Schema = z
  .object(registerSegmentShape)
  .superRefine(refineSegmentAudience);

export const RegisterStep3Schema = z.object(registerBusinessShape);

/** Contrato completo enviado ao backend (uma chamada, no fim da etapa 3). */
export const RegisterSchema = z
  .object({
    ...registerAccountShape,
    ...registerSegmentShape,
    ...registerBusinessShape,
    schedule: z
      .array(
        z.object({
          dayOfWeek: z.number().min(0).max(6),
          isOpen: z.boolean(),
          openTime: z.string().min(4).max(5),
          closeTime: z.string().min(4).max(5),
        })
      )
      .min(7)
      .max(7)
      .optional(),
  })
  .superRefine((data, ctx) => {
    refineSegmentAudience(data, ctx);
    refineAccountAuth(data, ctx);
  });

export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type RegisterStep1FormData = z.infer<typeof RegisterStep1Schema>;
export type RegisterStep2FormData = z.infer<typeof RegisterStep2Schema>;
export type RegisterStep3FormData = z.infer<typeof RegisterStep3Schema>;

// --- Customer/Queue Schema ---
export const CustomerQueueSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(50, 'O nome é muito longo'),
  whatsapp: whatsappRequired,
  serviceId: z.string().min(1, 'Selecione um serviço'),
});

export type CustomerQueueFormData = z.infer<typeof CustomerQueueSchema>;

/** Fila adicionada pelo staff ou dependente — WhatsApp opcional. */
export const CustomerQueueStaffSchema = CustomerQueueSchema.extend({
  whatsapp: whatsappOptional,
});

export type CustomerQueueStaffFormData = z.infer<typeof CustomerQueueStaffSchema>;

// --- Service Schema ---
export const ServiceSchema = z.object({
  categoryId: z.string().nullable().optional(),
  name: z.string().min(3, 'Nome do serviço é obrigatório'),
  price: z.number({ invalid_type_error: 'Preço inválido' }).min(0, 'O preço não pode ser negativo'),
  avgTimeMinutes: z.number({ invalid_type_error: 'Tempo inválido' }).min(5, 'Mínimo 5 minutos'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  commissionPercent: z.number({ invalid_type_error: 'Comissão inválida' }).min(0).max(100),
});

export type ServiceFormData = z.infer<typeof ServiceSchema>;

// --- Team Member Schema ---
export const TeamMemberSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  cpf: z
    .string()
    .transform(v => normalizeDocument(v))
    .refine(v => isValidCpf(v), { message: 'CPF inválido' }),
});

export type TeamMemberFormData = z.infer<typeof TeamMemberSchema>;

// --- Appointment Schema ---
export const AppointmentSchema = z.object({
  serviceId: z.string().min(1, 'Selecione um serviço'),
  staffId: z.string().min(1, 'Selecione um profissional'),
  date: z
    .string()
    .min(1, 'Selecione uma data')
    .refine(v => isValidDate(v), { message: 'Data inválida (use DD/MM/AAAA)' })
    .refine(v => isNotPast(v), { message: 'Data não pode ser no passado' })
    .refine(v => isWithinHorizon(v), { message: 'Data muito distante (máximo 60 dias)' }),
  time: z
    .string()
    .min(1, 'Selecione um horário')
    .refine(v => isBusinessHour(v), { message: 'Horário fora do comercial (07:00–22:00)' }),
  customerName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  whatsapp: whatsappRequired,
  clientId: z.string().uuid().optional(),
  clientPackageId: z.string().uuid().optional(),
  /** Pet escolhido no petshop. O backend resolve o nome do pet. */
  petId: z.string().uuid().optional(),
  reservedProducts: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .max(10)
    .optional(),
});

export type AppointmentFormData = z.infer<typeof AppointmentSchema>;

// --- Product Schema ---
export const ProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().default(''),
  salePrice: z.coerce.number({ invalid_type_error: 'Preço inválido' }).min(0, 'Preço não pode ser negativo'),
  categoryId: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
  type: z.enum(['RETAIL', 'CONSUMABLE', 'BOTH']),
  unit: z.enum(['UNIT', 'ML', 'L', 'G', 'KG', 'BOX', 'PACK', 'OTHER']).default('UNIT'),
  unitLabel: z.string().default(''),
  initialStock: z.coerce.number({ invalid_type_error: 'Quantidade inválida' }).min(0, 'Quantidade não pode ser negativa').default(0),
  minStock: z.coerce.number({ invalid_type_error: 'Estoque inválido' }).min(0).default(0),
  trackStock: z.boolean().default(true),
  expirationDate: z.string().optional().default(''),
  lotNumber: z.string().optional().default(''),
}).superRefine((data, ctx) => {
  if (data.unit === 'OTHER' && !data.unitLabel?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Quando a unidade é "Outra", o nome da unidade é obrigatório',
      path: ['unitLabel'],
    });
  }
});

export type ProductFormData = z.infer<typeof ProductSchema>;

// --- Client Create Schema ---
export const ClientCreateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  whatsapp: whatsappOptional,
});

export type ClientCreateFormData = z.infer<typeof ClientCreateSchema>;

// --- Client Edit Schema ---
export const ClientEditSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  whatsapp: whatsappOptional,
  notes: z.string().optional().default(''),
});

export type ClientEditFormData = z.infer<typeof ClientEditSchema>;

// --- Package Catalog Schema ---
export const PackageCatalogSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  serviceId: z.string().min(1, 'Selecione um serviço'),
  sessionCount: z.coerce.number({ invalid_type_error: 'Sessões inválido' }).min(2, 'Sessões deve ser ≥ 2'),
  price: z.coerce.number({ invalid_type_error: 'Preço inválido' }).min(0.01, 'Preço deve ser maior que zero'),
  validityDays: z.coerce.number().int().positive().optional().nullable(),
});

export type PackageCatalogFormData = z.infer<typeof PackageCatalogSchema>;

// --- Profile Settings Schema ---
export const ProfileSettingsSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  currentPassword: z.string().optional().default(''),
  newPassword: z.string().optional().default(''),
}).superRefine((data, ctx) => {
  if (data.newPassword && data.newPassword.length < 6) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Nova senha deve ter no mínimo 6 caracteres',
      path: ['newPassword'],
    });
  }
  if (data.newPassword && !data.currentPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Informe sua senha atual para criar uma nova',
      path: ['currentPassword'],
    });
  }
});

export type ProfileSettingsFormData = z.infer<typeof ProfileSettingsSchema>;

// --- Refund Schema ---
export const RefundSaleSchema = z.object({
  reason: z.string().min(1, 'Informe o motivo do estorno'),
  restock: z.boolean().default(true),
  refundMethod: z.string().min(1, 'Selecione a forma de estorno'),
});

export type RefundSaleFormData = z.infer<typeof RefundSaleSchema>;

// --- Stock Receipt Schema ---
export const StockReceiptSchema = z.object({
  productId: z.string().min(1, 'Selecione um produto'),
  quantity: z.coerce.number({ invalid_type_error: 'Quantidade inválida' }).min(0.01, 'Quantidade deve ser maior que zero'),
  unitCost: z.coerce.number({ invalid_type_error: 'Custo inválido' }).min(0, 'Custo não pode ser negativo'),
  supplierId: z.string().optional().default(''),
});

export type StockReceiptFormData = z.infer<typeof StockReceiptSchema>;

// --- Stock Adjustment Schema ---
export const StockAdjustmentSchema = z.object({
  productId: z.string().min(1, 'Selecione um produto'),
  quantity: z.coerce.number({ invalid_type_error: 'Quantidade inválida' }),
  type: z.enum(['MANUAL_ADJUSTMENT', 'INTERNAL_CONSUMPTION']),
  reason: z.string().min(3, 'Informe um motivo com pelo menos 3 caracteres'),
});

export type StockAdjustmentFormData = z.infer<typeof StockAdjustmentSchema>;

// --- Expense Schema ---
export const ExpenseSchema = z.object({
  title: z.string().min(2, 'Título deve ter no mínimo 2 caracteres'),
  amount: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01, 'Valor deve ser maior que zero'),
  type: z.enum(['FIXED', 'VARIABLE', 'INVESTMENT']),
  referenceDate: z.string().min(1, 'Data de referência é obrigatória'),
  categoryId: z.string().optional().default(''),
  description: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  recurrence: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  dueDate: z.string().optional().default(''),
  paymentMethod: z.string().optional().default(''),
  supplierName: z.string().optional().default(''),
});

export type ExpenseFormData = z.infer<typeof ExpenseSchema>;

// --- Fiado Schema ---
export const FiadoSchema = z.object({
  customerName: z.string().min(2, 'Informe o nome do cliente'),
  whatsapp: z
    .string()
    .transform(v => normalizePhoneBR(v))
    .refine(v => isValidPhoneBR(v), { message: 'Informe um telefone válido com DDD' }),
  description: z.string().min(2, 'Descrição deve ter no mínimo 2 caracteres'),
  amount: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01, 'Valor deve ser maior que zero'),
  dueDate: z.string().optional().default(''),
});

export type FiadoFormData = z.infer<typeof FiadoSchema>;

// --- Procedure Record Schema ---
export const ProcedureRecordSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  professionalName: z.string().min(1, 'Profissional é obrigatório').max(200),
  formula: z.string().optional().default(''),
  details: z.string().optional().default(''),
  serviceName: z.string().optional().default(''),
});

export type ProcedureRecordFormData = z.infer<typeof ProcedureRecordSchema>;

export const CategorySchema = z.object({
  name: z.string().trim().min(2, 'Informe pelo menos 2 caracteres').max(100, 'Use até 100 caracteres'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Escolha uma cor').or(z.literal('')),
});
export type CategoryFormData = z.infer<typeof CategorySchema>;

export const OrganizationSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da organização'),
  slug: z.string().trim().min(1, 'Informe o identificador'),
  logoUrl: z.string().trim().url('Informe uma URL válida').or(z.literal('')),
});
export type OrganizationFormData = z.infer<typeof OrganizationSchema>;

// --- Support Report Schema ---
export const SupportReportSchema = z.object({
  category: z.enum(
    ['BUG', 'WRONG_DATA', 'SUGGESTION', 'QUESTION', 'BILLING', 'ACCESS', 'SCHEDULE'],
    { errorMap: () => ({ message: 'Selecione uma categoria' }) }
  ),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT'], {
    errorMap: () => ({ message: 'Selecione uma prioridade' }),
  }),
  title: z
    .string()
    .trim()
    .min(5, 'Informe um título com pelo menos 5 caracteres')
    .max(200, 'Título pode ter no máximo 200 caracteres'),
  description: z
    .string()
    .trim()
    .min(10, 'Descreva o problema com pelo menos 10 caracteres')
    .max(4000, 'Descrição pode ter no máximo 4000 caracteres'),
});

export type SupportReportFormData = z.infer<typeof SupportReportSchema>;

// --- Reserva de produto (vitrine pública /queue/:id/produtos/:productId) ---
export const ProductReservationSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, 'Informe seu nome')
    .max(160, 'Nome muito longo'),
  whatsapp: whatsappRequired,
  quantity: z
    .number()
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade mínima é 1')
    .max(10, 'Máximo de 10 por reserva'),
});

export type ProductReservationFormData = z.infer<typeof ProductReservationSchema>;

