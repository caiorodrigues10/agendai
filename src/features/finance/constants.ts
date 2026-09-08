import type { ExpenseType } from '../../infra/financialApi';

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  FIXED: 'Fixa',
  VARIABLE: 'Variável',
  INVESTMENT: 'Investimento',
};

export const EXPENSE_RECURRENCE_LABELS: Record<string, string> = {
  ONCE: 'Única',
  DAILY: 'Diária',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
};

export const FINANCE_PAYMENT_METHODS = ['Dinheiro', 'PIX', 'Cartão', 'Boleto', 'Outro'];
