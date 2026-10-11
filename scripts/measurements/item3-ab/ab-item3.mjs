import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4173';
const ROUTE = '/';
const SLOW_4G = {
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (0.75 * 1024 * 1024) / 8,
};
const CPU_RATE = 4;
const RUNS = { 'off-1440': 5, 'off-375': 3 };
const SESSIONS = ['A', 'B', 'A', 'B', 'A', 'B']; // A=sem animação, B=com animação

const INIT = (arm) => {
  try {
    localStorage.setItem('agendai:cookie-consent-v2', 'all');
  } catch {
    /* about:blank não tem localStorage */
  }
  if (arm === 'A') {
    const apply = () => {
      if (document.head && !document.getElementById('ab-no-hero-anim')) {
        const s = document.createElement('style');
        s.id = 'ab-no-hero-anim';
        s.textContent = 'html .hero-line-rise{animation:none !important}';
        document.head.appendChild(s);
      }
    };
    apply();
    document.addEventListener('DOMContentLoaded', apply);
  }
  window.__lcp = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) window.__lcp.push(e.startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
};

const med = (vals) => {
  const v = vals.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : null;
};

const measureOnce = async (browser, arm, { width, mobile }) => {
  const context = await browser.newContext({
    viewport: { width, height: mobile ? 667 : 900 },
    isMobile: mobile,
    deviceScaleFactor: mobile ? 3 : 1,
  });
  await context.addInitScript(INIT, arm);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  try {
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, ...SLOW_4G });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_RATE });
    await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'load', timeout: 90_000 });
    await page.waitForTimeout(4000);
    return await page.evaluate(() => {
      const lcp = window.__lcp;
      const anim = getComputedStyle(document.querySelector('[data-hero-line]')).animationName;
      return { lcp: lcp.length ? lcp[lcp.length - 1] : null, anim };
    });
  } catch (err) {
    console.error(`ERRO ${arm} ${width}: ${String(err).slice(0, 200)}`);
    return { lcp: null, anim: 'erro' };
  } finally {
    await context.close();
  }
};

const browser = await chromium.launch();
const out = [];
for (let s = 0; s < SESSIONS.length; s++) {
  const arm = SESSIONS[s];
  const label = arm === 'A' ? 'sem-anim' : 'com-anim';
  const session = { session: s + 1, arm: label, cells: {} };
  for (const [cell, width, mobile] of [
    ['off-1440', 1440, false],
    ['off-375', 375, true],
  ]) {
    const vals = [];
    for (let i = 0; i < RUNS[cell]; i++) {
      const r = await measureOnce(browser, arm, { width, mobile });
      if (cell === 'off-1440') {
        console.log(`[s${s + 1} ${label} ${cell} run${i + 1}] lcp=${Math.round(r.lcp)}ms anim=${r.anim}`);
        if (arm === 'A' && r.anim !== 'none') throw new Error('toggle falhou: A deveria ter animationName=none');
        if (arm === 'B' && r.anim !== 'hero-line-rise') throw new Error('toggle falhou: B deveria ter hero-line-rise');
      }
      vals.push(r.lcp);
    }
    session.cells[cell] = { runs: vals.map((v) => Math.round(v)), median: med(vals) ? Math.round(med(vals)) : null };
  }
  out.push(session);
  console.log(`session ${s + 1} (${label}): off-1440=${session.cells['off-1440'].median}ms off-375=${session.cells['off-375'].median}ms`);
}
await browser.close();

const A = out.filter((s) => s.arm === 'sem-anim').map((s) => s.cells['off-1440'].median);
const B = out.filter((s) => s.arm === 'com-anim').map((s) => s.cells['off-1440'].median);
const A375 = out.filter((s) => s.arm === 'sem-anim').map((s) => s.cells['off-375'].median);
const B375 = out.filter((s) => s.arm === 'com-anim').map((s) => s.cells['off-375'].median);
const mA = med(A);
const mB = med(B);
const delta = mB - mA;
console.log('\n=== off@1440 (decisiva) ===');
console.log(`sem animação (A): ${A.join(' / ')} ms → mediana ${mA}`);
console.log(`com animação  (B): ${B.join(' / ')} ms → mediana ${mB}`);
console.log(`delta B-A: ${delta >= 0 ? '+' : ''}${delta} ms (critério: ≤ +100 ms)`);
console.log('\n=== off@375 ===');
console.log(`sem: ${A375.join(' / ')} → mediana ${med(A375)} | com: ${B375.join(' / ')} → mediana ${med(B375)}`);
const verdict = delta <= 100 && Math.max(...B, ...B375) <= 2500 ? 'MANTER animação' : 'REVERTER (mantém sem animação)';
console.log(`\nveredito: ${verdict}`);
console.log(JSON.stringify({ sessions: out, off1440: { A, B, mA, mB, delta }, off375: { A: A375, B: B375 }, verdict }, null, 2));
