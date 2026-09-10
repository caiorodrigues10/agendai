export type WeatherVisual = { image: string; accent: string; glow: string };

export function getWeatherVisual(code: number, condition = ''): WeatherVisual {
  const name = condition.toLowerCase();
  if (code >= 95 || name.includes('tempest')) return { image: '/weather/storm.jpg', accent: 'text-violet-200', glow: 'bg-violet-400' };
  if ((code >= 51 && code <= 82) || name.includes('chuva') || name.includes('garoa')) return { image: '/weather/rain.jpg', accent: 'text-sky-200', glow: 'bg-sky-400' };
  if (code === 45 || code === 48 || name.includes('nevo') || name === 'nublado') return { image: '/weather/fog.jpg', accent: 'text-slate-100', glow: 'bg-slate-300' };
  if (code <= 1 || name.includes('ensolarado') || name.includes('céu limpo')) return { image: '/weather/sunny.jpg', accent: 'text-amber-100', glow: 'bg-amber-300' };
  return { image: '/weather/partly-cloudy.jpg', accent: 'text-cyan-100', glow: 'bg-cyan-300' };
}

export const finiteNumber = (value: unknown, fallback = 0) => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
};
