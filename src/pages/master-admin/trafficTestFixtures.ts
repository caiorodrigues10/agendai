import type { AdminTrafficData } from '../../infra/adminTrafficApi';

export const currentSaoPauloDate = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
};

export const currentSaoPauloMonth = () => currentSaoPauloDate().slice(0, 7);

export const previousCivilDay = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
};

export const previousCivilMonth = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 7);
};

export const baseData: AdminTrafficData = {
  period: {
    key: 'week',
    label: 'Semana',
    granularity: 'day',
    fromDay: '2026-11-09',
    toDay: '2026-11-15',
    prevFromDay: '2026-11-02',
    prevToDay: '2026-11-08',
    timezone: 'America/Sao_Paulo',
    dataFrom: '2026-10-01',
  },
  generatedAt: '2026-11-15T12:00:00.000Z',
  beaconEnabled: true,
  totals: {
    visits: 100,
    visitors: 50,
    visitorsBasis: 'sum_of_daily_distinct',
    sessions: 20,
    loggedInUsers: 10,
    newShops: 2,
    newUsers: 4,
    newUsersRemoved: 1,
  },
  prevTotals: null,
  deltaPct: {
    visits: 10,
    visitors: -5,
    sessions: null,
    loggedInUsers: 0,
    newShops: null,
    newUsers: 25,
  },
  series: [
    {
      bucketStart: '2026-11-09',
      label: '09/11',
      visits: 40,
      visitors: 20,
      sessions: 8,
      newShops: 1,
      newUsers: 2,
      newUsersRemoved: 0,
      partial: false,
    },
    {
      bucketStart: '2026-11-15',
      label: '15/11',
      visits: 60,
      visitors: 30,
      sessions: null,
      newShops: 1,
      newUsers: 2,
      newUsersRemoved: 1,
      partial: true,
    },
  ],
  areas: [
    {
      area: 'public_site',
      label: 'Site público',
      visits: 70,
      visitors: 35,
      sessions: 14,
    },
  ],
  origins: [{ host: 'www.google.com.br', visits: 25 }],
  loss: {
    counterRegressions: 0,
    redisUnavailableDrops: 0,
    notes: [],
  },
  userActivity: {
    firstRecordedAt: '2026-10-02T12:00:00.000Z',
  },
};
