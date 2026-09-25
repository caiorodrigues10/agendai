import { dateAtNoon } from './dateRanges';

export function formatWeatherDayLabel(date: string): string {
  const value = dateAtNoon(date);
  if (Number.isNaN(value.getTime())) return date || '';
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (value.toDateString() === today.toDateString()) return 'Hoje';
  if (value.toDateString() === tomorrow.toDateString()) return 'Amanhã';

  return value.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}
