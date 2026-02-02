import { z } from 'zod';

// --- Login Schema ---
export const LoginSchema = z.object({
  pin: z.string()
    .min(4, "O PIN deve ter no mínimo 4 dígitos")
    .max(6, "O PIN deve ter no máximo 6 dígitos")
    .regex(/^\d+$/, "O PIN deve conter apenas números")
});

export type LoginFormData = z.infer<typeof LoginSchema>;

// --- Customer/Queue Schema ---
export const CustomerQueueSchema = z.object({
  name: z.string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(50, "O nome é muito longo"),
  whatsapp: z.string()
    .min(11, "Número inválido (mínimo 11 dígitos com DDD)")
    .max(15, "Número muito longo"),
  serviceId: z.string()
    .min(1, "Selecione um serviço")
});

export type CustomerQueueFormData = z.infer<typeof CustomerQueueSchema>;

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
  pin: z.string()
    .min(4, "PIN deve ter 4-6 dígitos")
    .max(6, "PIN deve ter 4-6 dígitos")
    .regex(/^\d+$/, "Apenas números")
});

export type TeamMemberFormData = z.infer<typeof TeamMemberSchema>;

// --- Appointment Schema ---
export const AppointmentSchema = z.object({
  serviceId: z.string().min(1, "Selecione um serviço"),
  staffId: z.string().min(1, "Selecione um profissional"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
  customerName: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  whatsapp: z.string().min(11, "Telefone inválido (mínimo 11 dígitos)")
});

export type AppointmentFormData = z.infer<typeof AppointmentSchema>;
