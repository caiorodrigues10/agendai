import { chromium } from 'playwright';

// Item 4 — decomposição do tempo na rota /queue/:id?tab=appointments (API real).
// Mede TTFB/carga das APIs (em especial /api/queue) vs render (marks/LCP).
const BASE = 'http://127.0.0.1:4173';
const ROUTE = '/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments';
const SLOW_4G = {
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (0.75 * 1024 * 1024) / 8,
};

const browser = await chromium.launch();
for (let run = 1; run <= 3; run++) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    try { localStorage.setItem('agendai:cookie-consent-v2', 'all'); } catch {}
    window.__lcp = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp.push(e.startTime); })
      .observe({ type: 'largest-contentful-paint', buffered: true });
    window.__apis = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.name.includes('/api/')) continue;
        window.__apis.push({
          url: e.name.split('/api/')[1].split('?')[0],
          ttfb: Math.round(e.responseStart - e.requestStart),
          total: Math.round(e.responseEnd - e.requestStart),
          size: e.transferSize || e.encodedBodySize || 0,
        });
      }
    }).observe({ type: 'resource', buffered: true });
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, ...SLOW_4G });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(5000);
  const data = await page.evaluate(() => {
    const usable = performance.getEntriesByName('public-content-usable')[0];
    const nav = performance.getEntriesByType('navigation')[0];
    const lcp = window.__lcp;
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      load: Math.round(nav.loadEventEnd),
      usable: usable ? Math.round(usable.duration) : null,
      lcp: lcp.length ? Math.round(lcp[lcp.length - 1]) : null,
      apis: window.__apis.sort((a, b) => a.ttfb - b.ttfb),
    };
  });
  const queue = data.apis.find((a) => a.url.startsWith('queue'));
  console.log(`\n=== run ${run} ===`);
  console.log(`DL=${data.domContentLoaded}ms load=${data.load}ms usable=${data.usable}ms lcp=${data.lcp}ms`);
  if (queue) console.log(`/api/queue: ttfb=${queue.ttfb}ms total=${queue.total}ms size=${queue.size}B`);
  for (const a of data.apis) console.log(`  ${a.url}: ttfb=${a.ttfb}ms total=${a.total}ms`);
  await context.close();
}
await browser.close();
