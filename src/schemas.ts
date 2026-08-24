import { z } from 'zod';
import { isValidCpf, normalizeDocument, isValidCnpj, isValidPhoneBR } from './utils/documentUtils';
import { isValidDate, isNotPast, isWithinHorizon, isBusinessHour } from './utils/dateUtils';

// --- Login Schema ---
export const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória")
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
    .transform((v) => normalizeDocument(v))
    .refine((v) => isValidCpf(v), { message: 'CPF inválido (dígitos verificadores incorretos)' }),
  barbershopName: z.string().min(3, 'Nome do salão é obrigatório'),
  whatsapp: z
    .string()
    .min(10, 'WhatsApp inválido (mínimo 10 dígitos)')
    .transform((v) => normalizeDocument(v))
    .refine((v) => isValidPhoneBR(v), { message: 'Telefone inválido (DDD + número com 8 ou 9 dígitos)' }),
  cnpj: z
    .string()
    .optional()
    .refine((v) => !v || isValidCnpj(v), { message: 'CNPJ inválido (dígitos verificadores incorretos)' })
    .transform((v) => (v ? normalizeDocument(v) : v)),
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;

// --- Customer/Queue Schema ---
export const CustomerQueueSchema = z.object({
  name: z.string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(50, "O nome é muito longo"),
  whatsapp: z
    .string()
    .min(10, "Telefone inválido (mínimo 10 dígitos com DDD)")
    .max(15, "Número muito longo")
    .transform((v) => normalizeDocument(v))
    .refine((v) => isValidPhoneBR(v), { message: 'Telefone inválido (DDD + número com 8 ou 9 dígitos)' }),
  serviceId: z.string()
    .min(1, "Selecione um serviço")
});

export type CustomerQueueFormData = z.infer<typeof CustomerQueueSchema>;

/** Fila adicionada pelo staff — WhatsApp opcional. */
export const CustomerQueueStaffSchema = CustomerQueueSchema.extend({
  whatsapp: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((v) => v ?? '')
    .refine(
      (v) =>
        v === '' ||
        (normalizeDocument(v).length >= 10 &&
          normalizeDocument(v).length <= 15 &&
          isValidPhoneBR(normalizeDocument(v))),
      { message: 'Telefone inválido (DDD + número com 8 ou 9 dígitos)' },
    ),
});

export type CustomerQueueStaffFormData = z.infer<typeof CustomerQueueStaffSchema>;

// --- Service Schema ---
export const ServiceSchema = z.object({
  name: z.string().min(3, "Nome do serviço é obrigatório"),
  price: z.number({ invalid_type_error: "Preço inválido" }).min(0, "O preço não pode ser negativo"),
  avgTimeMinutes: z.number({ invalid_type_error: "Tempo inválido" }).min(5, "Mínimo 5 minutos"),
  icon: z.string().min(1, "Ícone é obrigatório")
});

export type ServiceFormData = z.infer<typeof ServiceSchema>;

// --- Team Member Schema ---
export const TeamMemberSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  cpf: z
    .string()
    .transform((v) => normalizeDocument(v))
    .refine((v) => isValidCpf(v), { message: "CPF inválido" }),
});

export type TeamMemberFormData = z.infer<typeof TeamMemberSchema>;

// --- Appointment Schema ---
export const AppointmentSchema = z.object({
  serviceId: z.string().min(1, "Selecione um serviço"),
  staffId: z.string().min(1, "Selecione um profissional"),
  date: z
    .string()
    .min(1, "Selecione uma data")
    .refine((v) => isValidDate(v), { message: 'Data inválida (use DD/MM/AAAA)' })
    .refine((v) => isNotPast(v), { message: 'Data não pode ser no passado' })
    .refine((v) => isWithinHorizon(v), { message: 'Data muito distante (máximo 60 dias)' }),
  time: z
    .string()
    .min(1, "Selecione um horário")
    .refine((v) => isBusinessHour(v), { message: 'Horário fora do comercial (07:00–22:00)' }),
  customerName: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  whatsapp: z
    .string()
    .min(10, "Telefone inválido (mínimo 10 dígitos)")
    .transform((v) => normalizeDocument(v))
    .refine((v) => isValidPhoneBR(v), { message: 'Telefone inválido (DDD + número com 8 ou 9 dígitos)' }),
  clientId: z.string().uuid().optional(),
  clientPackageId: z.string().uuid().optional(),
});

export type AppointmentFormData = z.infer<typeof AppointmentSchema>;
