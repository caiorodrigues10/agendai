import { z } from 'zod';

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

// --- Register Schema (cadastro owner + salão) ---
export const RegisterSchema = z.object({
  ownerName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  cpf: z
    .string()
    .min(11, 'CPF inválido')
    .transform(v => normalizeDocument(v))
    .refine(v => isValidCpf(v), { message: 'CPF inválido (dígitos verificadores incorretos)' }),
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
  city: z.string().min(2, 'Informe a cidade').max(120),
  termsVersion: z.string().min(1),
  termsAccepted: z.boolean().refine(v => v === true, 'É necessário aceitar os Termos de Uso'),
  marketingOptIn: z.boolean().optional().default(false),
  lgpdConsent: z
    .boolean()
    .refine(v => v === true, 'É necessário consentir com o tratamento de dados (LGPD)'),
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
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;

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
});

export type AppointmentFormData = z.infer<typeof AppointmentSchema>;

// --- Product Schema ---
export const ProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().default(''),
  salePrice: z.coerce.number({ invalid_type_error: 'Preço inválido' }).min(0, 'Preço não pode ser negativo'),
  sku: z.string().optional().default(''),
  barcode: z.string().optional().default(''),
  categoryId: z.string().optional().default(''),
  type: z.enum(['RETAIL', 'CONSUMABLE', 'BOTH']),
  unitLabel: z.string().min(1, 'Unidade é obrigatória').default('unidade'),
  minStock: z.coerce.number({ invalid_type_error: 'Estoque inválido' }).min(0).default(0),
  trackStock: z.boolean().default(true),
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
