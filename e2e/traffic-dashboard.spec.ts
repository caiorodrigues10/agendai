import { expect, test, type Page, type Route } from '@playwright/test';

type ReportMode = 'ok' | 'empty' | 'error';

type MasterPermissions = 'allowed' | 'denied';

const PERIODS = [
  { key: 'day', label: 'Dia' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
  { key: '3m', label: '3 meses' },
  { key: '6m', label: '6 meses' },
  { key: 'year', label: 'Último ano' },
  { key: 'all', label: 'Anos' },
] as const;

const USER = {
  id: 'master-traffic-e2e',
  name: 'Master de Tráfego',
  email: 'master.traffic@example.test',
  role: 'MASTER_ADMIN',
};

function buildReport(period: string) {
  const granularity =
    period === 'day'
      ? 'hour'
      : period === 'week' || period === 'month'
        ? 'day'
        : period === '3m' || period === '6m'
          ? 'week'
          : period === 'year'
            ? 'month'
            : 'year';

  return {
    period: {
      key: period,
      label: PERIODS.find(option => option.key === period)?.label ?? 'Período',
      granularity,
      fromDay: '2026-10-01',
      toDay: '2026-11-15',
      prevFromDay: period === 'all' ? null : '2026-08-01',
      prevToDay: period === 'all' ? null : '2026-09-30',
      timezone: 'America/Sao_Paulo',
      dataFrom: '2026-10-01',
    },
    generatedAt: '2026-11-15T12:00:00.000Z',
    beaconEnabled: true,
    totals: {
      visits: 120,
      visitors: 87,
      visitorsBasis: period === 'day' ? 'daily_distinct' : 'sum_of_daily_distinct',
      sessions: 64,
      loggedInUsers: 19,
      newShops: 4,
      newUsers: 12,
      newUsersRemoved: 2,
    },
    prevTotals:
      period === 'all'
        ? null
        : {
            visits: 100,
            visitors: 80,
            visitorsBasis: period === 'day' ? 'daily_distinct' : 'sum_of_daily_distinct',
            sessions: 60,
            loggedInUsers: 15,
            newShops: 3,
            newUsers: 10,
            newUsersRemoved: 1,
          },
    deltaPct:
      period === 'all'
        ? null
        : {
            visits: 20,
            visitors: 8.75,
            sessions: 6.67,
            loggedInUsers: 26.67,
            newShops: 33.33,
            newUsers: 20,
          },
    series: [
      {
        bucketStart: granularity === 'hour' ? '2026-11-15T09' : '2026-11-01',
        label: granularity === 'hour' ? '09:00' : '01/11',
        visits: 20,
        visitors: 15,
        sessions: granularity === 'hour' ? null : 12,
        newShops: 1,
        newUsers: 2,
        newUsersRemoved: 1,
        partial: period === '3m' || period === '6m',
      },
      {
        bucketStart: granularity === 'hour' ? '2026-11-15T10' : '2026-11-02',
        label: granularity === 'hour' ? '10:00' : '02/11',
        visits: 30,
        visitors: 24,
        sessions: granularity === 'hour' ? null : 18,
        newShops: 2,
        newUsers: 3,
        newUsersRemoved: 0,
        partial: false,
      },
    ],
    areas: [
      {
        area: 'public_site',
        label: 'Site público/landing',
        visits: 70,
        visitors: 55,
        sessions: 40,
      },
      {
        area: 'salon_public',
        label: 'Páginas públicas de salão',
        visits: 35,
        visitors: 25,
        sessions: 18,
      },
      {
        area: 'logged_area',
        label: 'Área logada',
        visits: 15,
        visitors: 12,
        sessions: 9,
      },
    ],
    origins: [
      { host: 'example.test', visits: 80 },
      { host: '(interno)', visits: 40 },
    ],
    loss: {
      counterRegressions: 0,
      redisUnavailableDrops: 0,
      notes: [],
    },
    userActivity: {
      firstRecordedAt: '2026-09-01T12:00:00.000Z',
    },
  };
}

async function seedMaster(page: Page, access: MasterPermissions): Promise<void> {
  const internalPermissions =
    access === 'allowed' ? ['internal:traffic:read'] : ['internal:dashboard:read'];

  await page.addInitScript(
    ({ user, permissions }) => {
      localStorage.setItem(
        'barber_user',
        JSON.stringify({ ...user, internalPermissions: permissions })
      );
      localStorage.setItem('barber_remember_me', 'true');
      localStorage.setItem('agendai:cookie-consent-v2', 'essential');
    },
    { user: USER, permissions: internalPermissions }
  );
}

async function installApiMocks(
  page: Page,
  options: {
    mode?: ReportMode;
    internalPermissions?: string[];
    onTrafficRequest?: (url: URL) => void;
  } = {}
): Promise<void> {
  const mode = options.mode ?? 'ok';
  const internalPermissions = options.internalPermissions ?? ['internal:traffic:read'];

  await page.route('**/api/**', async (route: Route) => {
    const url = new URL(route.request().url());

    if (url.pathname === '/api/auth/refresh') {
      await route.fulfill({
        json: {
          user: { ...USER, internalPermissions },
          accessToken: 'traffic-e2e-token',
        },
      });
      return;
    }

    if (url.pathname === '/api/admin/traffic') {
      options.onTrafficRequest?.(url);

      if (mode === 'error') {
        await route.fulfill({
          status: 500,
          json: { success: false, message: 'Falha simulada no relatório de tráfego.' },
        });
        return;
      }

      const report = buildReport(url.searchParams.get('period') ?? 'week');
      await route.fulfill({
        json: {
          success: true,
          data:
            mode === 'empty'
              ? { ...report, series: [], totals: { ...report.totals, visits: 0, visitors: 0 } }
              : report,
        },
      });
      return;
    }

    if (url.pathname === '/api/admin/traffic/export') {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv; charset=utf-8',
        body: 'bucket,rotulo,visitas\n2026-11-01,01/11,20\n',
      });
      return;
    }

    await route.fulfill({ json: { success: true, data: null } });
  });
}

async function openTrafficDashboard(page: Page): Promise<void> {
  await page.goto('/master/traffic?period=week');
  await expect(page.getByRole('heading', { name: 'Tráfego', exact: true })).toBeVisible();
}

async function selectPeriod(page: Page, label: string, expectedKey: string): Promise<void> {
  const periodControl = page
    .getByRole('tab', { name: label, exact: true })
    .or(page.getByRole('button', { name: label, exact: true }));

  const responsePromise = page.waitForResponse(response => {
    if (!response.url().includes('/api/admin/traffic?')) return false;
    return new URL(response.url()).searchParams.get('period') === expectedKey;
  });

  await periodControl.click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  await expect(page).toHaveURL(new RegExp(`[?&]period=${expectedKey}(?:&|$)`));
}

for (const period of PERIODS) {
  test(`tráfego: filtro ${period.label} consulta o período correspondente`, async ({ page }) => {
    await seedMaster(page, 'allowed');
    await installApiMocks(page);
    await openTrafficDashboard(page);

    if (period.key === 'week') {
      await page.goto('/master/traffic?period=month');
      await expect(page.getByRole('heading', { name: 'Tráfego', exact: true })).toBeVisible();
    }

    await selectPeriod(page, period.label, period.key);

    if (period.key === '3m') {
      await expect(page.getByText('semana parcial')).toBeVisible();
    }
  });
}

test('tráfego: dia e mês enviam as âncoras selecionadas', async ({ page }) => {
  await seedMaster(page, 'allowed');
  await installApiMocks(page);
  await openTrafficDashboard(page);

  await selectPeriod(page, 'Dia', 'day');
  const dayResponse = page.waitForResponse(response => {
    if (!response.url().includes('/api/admin/traffic?')) return false;
    return new URL(response.url()).searchParams.get('date') === '2026-10-15';
  });
  await page.getByLabel('Data', { exact: true }).fill('2026-10-15');
  expect((await dayResponse).status()).toBe(200);

  await selectPeriod(page, 'Mês', 'month');
  const monthResponse = page.waitForResponse(response => {
    if (!response.url().includes('/api/admin/traffic?')) return false;
    return new URL(response.url()).searchParams.get('month') === '2026-09';
  });
  await page.getByLabel('Mês de referência', { exact: true }).fill('2026-09');
  expect((await monthResponse).status()).toBe(200);
});

test('tráfego: área e papel alteram a consulta', async ({ page }) => {
  await seedMaster(page, 'allowed');
  await installApiMocks(page);
  await openTrafficDashboard(page);

  const areaControl = page
    .getByRole('tab', { name: /páginas.*salão/i })
    .or(page.getByRole('button', { name: /páginas.*salão/i }));
  const areaResponse = page.waitForResponse(response => {
    if (!response.url().includes('/api/admin/traffic?')) return false;
    return new URL(response.url()).searchParams.get('area') === 'salon_public';
  });
  await areaControl.click();
  expect((await areaResponse).status()).toBe(200);

  const roleResponse = page.waitForResponse(response => {
    if (!response.url().includes('/api/admin/traffic?')) return false;
    return new URL(response.url()).searchParams.get('userRole') === 'OWNER';
  });
  await page.getByLabel(/papel.*novos usuários/i).selectOption('OWNER');
  expect((await roleResponse).status()).toBe(200);
});

test('tráfego: estado vazio explica que não há dados', async ({ page }) => {
  await seedMaster(page, 'allowed');
  await installApiMocks(page, { mode: 'empty' });
  await openTrafficDashboard(page);

  await expect(page.getByText('Nenhum dado de tráfego no período', { exact: true })).toBeVisible();
});

test('tráfego: erro da API permite tentar novamente', async ({ page }) => {
  await seedMaster(page, 'allowed');
  await installApiMocks(page, { mode: 'error' });
  await page.goto('/master/traffic?period=week');

  await expect(page.getByText(/não foi possível carregar/i)).toBeVisible();
  const retryResponse = page.waitForResponse(response =>
    response.url().includes('/api/admin/traffic?')
  );
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  expect((await retryResponse).status()).toBe(500);
});

test('tráfego: usuário sem permissão não consulta a API', async ({ page }) => {
  const trafficRequests: URL[] = [];
  await seedMaster(page, 'denied');
  await installApiMocks(page, {
    internalPermissions: ['internal:dashboard:read'],
    onTrafficRequest: url => trafficRequests.push(url),
  });

  await page.goto('/master/traffic');

  await expect(page.getByRole('heading', { name: 'Acesso negado' })).toBeVisible();
  expect(trafficRequests).toHaveLength(0);
});
