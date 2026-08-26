/**
 * Utilitários de validação de data para o frontend.
 * Foco em agendamentos e inputs de data/hora.
 */

/** Checa se a string é uma data calendário válida (YYYY-MM-DD) e corresponde a um Date real. */
export const isValidDate = (dateStr: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

/** Checa se a data é hoje ou futuro. */
export const isNotPast = (dateStr: string): boolean => {
  if (!isValidDate(dateStr)) return false;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return dateStr >= today;
};

/** Checa se a data não é muito distante no futuro (máx N dias). */
export const isWithinHorizon = (dateStr: string, maxDays = 60): boolean => {
  if (!isValidDate(dateStr)) return false;
  const now = new Date();
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + maxDays);
  const maxStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;
  return dateStr <= maxStr;
};

/** Checa se HH:MM é um horário válido. */
const isValidTime = (timeStr: string): boolean => {
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;
  const [h, m] = timeStr.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
};

/** Checa se o horário está dentro do horário comercial (07:00–22:00). */
export const isBusinessHour = (timeStr: string): boolean => {
  if (!isValidTime(timeStr)) return false;
  const [h, m] = timeStr.split(':').map(Number);
  const minutes = h * 60 + m;
  return minutes >= 420 && minutes <= 1320;
};
