/**
 * Medição de responsividade e das páginas públicas do Agenda Já.
 *
 * Serve o build (npm run build + vite preview) e mede, por rota pública e por
 * largura (320/375/390/768/1024/1440):
 *   - estouro horizontal (scrollWidth > clientWidth)
 *   - clicáveis visíveis com menos de 44 px (mobile)
 *   - textos com fonte < 12 px
 *   - quantidade de <h1>
 *   - <img> sem width/height
 * e, com rede 4G lenta + CPU 4x (CDP):
 *   - CLS, LCP, FCP
 *   - JS/CSS/imagens transferidos (KB) e nº de scripts por rota
 * com a API fora (interceptada) e, se o backend estiver no ar, com a API real.
 *
 * Uso:
 *   npm run measure:responsive -- --label=antes
 *   npm run measure:responsive -- --label=depois --layout --perf --screens
 *   npm run measure:responsive -- --label=x --routes=/,/login --widths=375
 *   npm run measure:responsive -- --label=x --base=http://127.0.0.1:4173 --no-build
 *   npm run measure:responsive -- --label=lcp-antes --lcp --runs=3
 *   npm run measure:responsive -- --label=x --lcp --lcp-widths=375,1440 --routes=/login
 *   npm run measure:responsive -- --label=x --screens --shots=/,/login --shot-widths=375,768
 *
 * Performance: cada rota é medida `--runs` vezes (padrão 5) com throttling
 * idêntico e o valor reportado é a MEDIANA entre as execuções (nunca a
 * melhor). `--lcp` roda o diagnóstico de LCP (elemento, divisão do tempo,
 * caminho crítico, dependência de JS) nas rotas-chave, em `--lcp-widths`
 * (padrão 375). O passe desktop (1440) cobre as rotas-chave E qualquer
 * rota `/queue...` passada em `--routes` (fila pública medida nos dois
 * viewports). `--shots`/`--shot-widths` sobrescrevem as capturas padrão.
 */
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const PUBLIC_ROUTES = [
  '/',
  '/funcionalidades',
  '/ia-preditiva',
  '/agendamento',
  '/sobre',
  '/contato',
  '/privacidade',
  '/termos',
  '/login',
  '/cadastro',
  '/esqueci-senha',
  '/planos',
  '/queue',
  '/sistema-para-barbearia',
];

const KEY_ROUTES = ['/', '/login', '/cadastro', '/planos'];
const LCP_ROUTES = ['/', '/planos', '/queue', '/cadastro'];
const WIDTHS = [320, 375, 390, 768, 1024, 1440];
const SHOT_ROUTES = ['/', '/login', '/planos'];
const SHOT_WIDTHS = [375, 768];
const DEFAULT_RUNS = 5; // execuções por rota no passe de performance (mediana)

// Slow 4G (preset do DevTools): 1.6 Mbps down / 0.75 Mbps up / 150 ms RTT.
const SLOW_4G = {
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (0.75 * 1024 * 1024) / 8,
};
const CPU_RATE = 4;
const PREVIEW_PORT = Number(process.env.MEASURE_PORT || 4173);
const BACKEND = process.env.MEASURE_BACKEND || 'http://127.0.0.1:3333';
const MIN_TAP_PX = 44;
const MIN_FONT_PX = 12;

// ---------------------------------------------------------------- args
function parseArgs(argv) {
  const args = {
    label: 'manual',
    layout: false,
    perf: false,
    screens: false,
    lcp: false,
    runs: DEFAULT_RUNS,
    api: 'auto',
    base: '',
    build: true,
    port: PREVIEW_PORT,
    routes: PUBLIC_ROUTES,
    widths: WIDTHS,
    lcpWidths: [375],
    shots: SHOT_ROUTES,
    shotWidths: SHOT_WIDTHS,
  };
  for (const raw of argv) {
    if (raw === '--layout') args.layout = true;
    else if (raw === '--perf') args.perf = true;
    else if (raw === '--screens') args.screens = true;
    else if (raw === '--lcp') args.lcp = true;
    else if (raw === '--no-build') args.build = false;
    else if (raw.startsWith('--label=')) args.label = raw.slice(8);
    else if (raw.startsWith('--runs=')) args.runs = Math.max(1, Number(raw.slice(7)) || DEFAULT_RUNS);
    else if (raw.startsWith('--api=')) args.api = raw.slice(6);
    else if (raw.startsWith('--base=')) args.base = raw.slice(7).replace(/\/$/, '');
    else if (raw.startsWith('--port=')) args.port = Number(raw.slice(7));
    else if (raw.startsWith('--routes=')) args.routes = raw.slice(9).split(',');
    else if (raw.startsWith('--widths=')) args.widths = raw.slice(9).split(',').map(Number);
    else if (raw.startsWith('--lcp-widths=')) args.lcpWidths = raw.slice(13).split(',').map(Number);
    else if (raw.startsWith('--shots=')) args.shots = raw.slice(8).split(',');
    else if (raw.startsWith('--shot-widths=')) args.shotWidths = raw.slice(14).split(',').map(Number);
    else {
      console.error(`argumento desconhecido: ${raw}`);
      process.exit(2);
    }
  }
  if (!args.layout && !args.perf && !args.screens && !args.lcp) {
    args.layout = args.perf = args.screens = true;
  }
  return args;
}

// ---------------------------------------------------------------- infra
function run(cmd, cmdArgs) {
  const res = spawnSync(cmd, cmdArgs, { cwd: ROOT, encoding: 'utf8', shell: false });
  if (res.status !== 0) {
    console.error((res.stdout || '') + (res.stderr || ''));
    throw new Error(`${cmd} ${cmdArgs.join(' ')} falhou (${res.status})`);
  }
  return res.stdout || '';
}

async function waitFor(url, timeoutMs = 60_000) {
  const started = Date.now();
  for (;;) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      /* ainda subindo */
    }
    if (Date.now() - started > timeoutMs) throw new Error(`servidor não respondeu: ${url}`);
    await new Promise((r) => setTimeout(r, 400));
  }
}

async function apiAlive() {
  try {
    const res = await fetch(`${BACKEND}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

function routeSlug(route) {
  return (route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-')) || 'home';
}

// ---------------------------------------------------------------- coleta in-page
const COLLECT_LAYOUT = ({ minTap, minFont }) => {
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    if (el.closest('[aria-hidden="true"]')) return false;
    if (el.closest('[inert]')) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    // sr-only / visualmente oculto (1px + clip) não é alvo visível
    if (r.width < 4 || r.height < 4) return false;
    // fora do eixo horizontal (menus off-canvas fechados) não conta como visível
    if (r.left >= window.innerWidth || r.right <= 0) return false;
    return true;
  };
  const info = (el) => ({
    tag: el.tagName.toLowerCase(),
    text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48),
    cls: String(el.getAttribute('class') || '').slice(0, 80),
    w: Math.round(el.getBoundingClientRect().width),
    h: Math.round(el.getBoundingClientRect().height),
    href: el.getAttribute('href') || undefined,
  });

  const doc = document.documentElement;
  const overflowPx = Math.max(0, doc.scrollWidth - doc.clientWidth);

  const overflowSources = [];
  if (overflowPx > 0) {
    for (const el of document.querySelectorAll('body *')) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1) {
        const parent = el.parentElement;
        const cs = parent ? getComputedStyle(parent) : null;
        if (cs && (cs.overflowX === 'auto' || cs.overflowX === 'scroll')) continue; // rolagem intencional
        overflowSources.push({ ...info(el), right: Math.round(r.right) });
      }
    }
    overflowSources.sort((a, b) => b.right - a.right);
  }

  const clickable = document.querySelectorAll(
    'a[href], button, [role="button"], [role="link"], [role="tab"], input, select, textarea, summary, label',
  );
  const tap = { total: 0, tooSmall: [], exceptions: { paragraph: 0, inlineSentence: 0, labelControl: 0 } };
  for (const el of clickable) {
    if (!visible(el)) continue;
    if (el.disabled) continue;
    const r = el.getBoundingClientRect();
    tap.total += 1;
    if (r.width >= minTap && r.height >= minTap) continue;

    // exceção 1: link/controle dentro de texto corrido (parágrafo)
    const inParagraph = Boolean(el.closest('p, blockquote, figcaption, [class*="prose"]'));
    // exceção 2: link inline com texto irmão (dentro de uma frase)
    let inlineInSentence = false;
    if (!inParagraph && getComputedStyle(el).display === 'inline' && el.parentElement) {
      for (const node of el.parentElement.childNodes) {
        if (node.nodeType === 3 && (node.textContent || '').trim()) {
          inlineInSentence = true;
          break;
        }
      }
    }
    // exceção 3: <label> cujo controle associado é visível e já mede >= minTap
    let labelControl = false;
    if (el.tagName === 'LABEL') {
      const control = el.control || el.querySelector('input, select, textarea');
      if (control && control !== el && visible(control)) {
        const cr = control.getBoundingClientRect();
        labelControl = cr.width >= minTap && cr.height >= minTap;
      }
    }

    if (inParagraph) tap.exceptions.paragraph += 1;
    else if (inlineInSentence) tap.exceptions.inlineSentence += 1;
    else if (labelControl) tap.exceptions.labelControl += 1;
    else tap.tooSmall.push({ ...info(el), inParagraph: false });
  }

  const tiny = { total: 0, bad: [], bySize: {} };
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    if ([...el.childNodes].some((n) => n.nodeType === 1)) continue; // só folhas de texto
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const size = Number.parseFloat(getComputedStyle(el).fontSize);
    tiny.total += 1;
    if (size >= minFont) continue;
    const key = `${size}px`;
    tiny.bySize[key] = (tiny.bySize[key] || 0) + 1;
    tiny.bad.push({ ...info(el), size });
  }

  const h1 = [...document.querySelectorAll('h1')].map((el) => ({
    text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
    visible: visible(el),
  }));

  const images = { total: 0, missingDims: 0, items: [] };
  for (const img of document.querySelectorAll('img')) {
    if (!visible(img)) continue;
    images.total += 1;
    const hasW = img.hasAttribute('width');
    const hasH = img.hasAttribute('height');
    if (hasW && hasH) continue;
    images.missingDims += 1;
    images.items.push({
      src: (img.getAttribute('src') || '').slice(-70),
      width: hasW ? String(img.getAttribute('width')) : null,
      height: hasH ? String(img.getAttribute('height')) : null,
      loading: img.getAttribute('loading'),
    });
  }

  return { overflowPx, overflowSources: overflowSources.slice(0, 8), tap, tiny, h1, images };
};

const COLLECT_PERF = () => {
  const vitals = window.__vitals || { cls: 0, lcp: 0, fcp: 0 };
  const acc = { js: 0, css: 0, images: 0, fonts: 0, other: 0, total: 0, requests: 0 };
  const scripts = new Set();
  const images = { count: 0, bytes: 0 };
  for (const entry of performance.getEntriesByType('resource')) {
    const size = entry.transferSize || entry.encodedBodySize || 0;
    const name = entry.name;
    const ext = name.split('?')[0].split('.').pop()?.toLowerCase() || '';
    acc.total += size;
    acc.requests += 1;
    if (entry.initiatorType === 'script' || ['js', 'mjs'].includes(ext)) {
      acc.js += size;
      scripts.add(name);
    } else if (entry.initiatorType === 'link' || ext === 'css') acc.css += size;
    else if (['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg', 'ico'].includes(ext) || entry.initiatorType === 'img') {
      acc.images += size;
      images.count += 1;
      images.bytes += size;
    } else if (['woff', 'woff2', 'ttf', 'otf'].includes(ext)) acc.fonts += size;
    else acc.other += size;
  }
  return {
    cls: Number(vitals.cls.toFixed(4)),
    lcp: Math.round(vitals.lcp),
    fcp: Math.round(vitals.fcp),
    jsBytes: acc.js,
    jsRequests: scripts.size,
    cssBytes: acc.css,
    imageBytes: acc.images,
    imageRequests: images.count,
    fontBytes: acc.fonts,
    totalBytes: acc.total,
    totalRequests: acc.requests,
  };
};

const INIT_SCRIPT = () => {
  localStorage.setItem('agendai:cookie-consent-v2', 'all');
  window.__vitals = { cls: 0, lcp: 0, fcp: 0 };
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length) window.__vitals.lcp = entries[entries.length - 1].startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length) window.__vitals.fcp = entries[0].startTime;
    }).observe({ type: 'paint', buffered: true });
  } catch {
    /* observer indisponível */
  }
};

// Coleta para o diagnóstico de LCP (item L1): cada entrada de LCP com o
// elemento, quando o elemento entrou no DOM, se ele nasceu escondido e a
// cascata de recursos com início/fim/tamanho.
const INIT_LCP = () => {
  localStorage.setItem('agendai:cookie-consent-v2', 'all');
  const d = (window.__lcp = { paints: {}, lcp: [], res: [], fetches: [], nav: null });

  const mark = (n) => {
    if (n.nodeType !== 1 || n.__fs !== undefined) return;
    n.__fs = performance.now();
    try {
      if (n.style && n.style.opacity === '0') n.__h = 'style.opacity=0';
      else if (n.classList && n.classList.contains('opacity-0')) n.__h = 'class opacity-0';
    } catch {
      /* elemento não estilizável */
    }
    const kids = n.children;
    if (kids) for (let i = 0; i < kids.length; i++) mark(kids[i]);
  };
  new MutationObserver((ms) => {
    for (const m of ms) for (const n of m.addedNodes) mark(n);
  }).observe(document, { childList: true, subtree: true });

  const desc = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const chain = [];
    let p = el;
    while (p && p !== document.body && chain.length < 6) {
      const cls = typeof p.className === 'string' && p.className.trim() ? '.' + p.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
      chain.push(p.tagName.toLowerCase() + (p.id ? '#' + p.id : '') + cls);
      p = p.parentElement;
    }
    const out = {
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      cls: typeof el.className === 'string' ? el.className.slice(0, 160) : null,
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      rect: { w: Math.round(r.width), h: Math.round(r.height) },
      fs: el.__fs === undefined ? null : Math.round(el.__fs),
      hidden0: el.__h || null,
      style: {
        opacity: cs.opacity,
        visibility: cs.visibility,
        fontSize: cs.fontSize,
        fontFamily: cs.fontFamily.split(',')[0],
      },
      chain,
    };
    if (el.tagName === 'IMG') {
      out.img = {
        src: el.getAttribute('src'),
        currentSrc: (el.currentSrc || '').slice(-90),
        loading: el.getAttribute('loading'),
        fetchPriority: el.getAttribute('fetchpriority'),
        complete: el.complete,
        naturalWidth: el.naturalWidth,
      };
    }
    return out;
  };

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        d.lcp.push({
          t: Math.round(e.startTime),
          size: Math.round(e.size),
          url: e.url || null,
          el: desc(e.element),
        });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) d.paints[e.name] = Math.round(e.startTime);
    }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        d.res.push({
          name: e.name,
          start: Math.round(e.startTime),
          end: Math.round(e.responseEnd),
          dur: Math.round(e.duration),
          size: e.transferSize || e.encodedBodySize || 0,
          type: e.initiatorType,
        });
      }
    }).observe({ type: 'resource', buffered: true });
  } catch {
    /* observer indisponível */
  }

  addEventListener('DOMContentLoaded', () => {
    d.dcl = Math.round(performance.now());
  });
  addEventListener('load', () => {
    d.load = Math.round(performance.now());
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
      d.nav = {
        ttfb: Math.round(nav.responseStart),
        responseEnd: Math.round(nav.responseEnd),
        domInteractive: Math.round(nav.domInteractive),
        dcl: Math.round(nav.domContentLoadedEventEnd),
        loadEnd: Math.round(nav.loadEventEnd),
        transferSize: nav.transferSize,
      };
    }
  });

  const of = window.fetch;
  if (of && !window.__lcpFetchWrapped) {
    window.__lcpFetchWrapped = true;
    window.fetch = function (...a) {
      const t0 = performance.now();
      const url = typeof a[0] === 'string' ? a[0] : (a[0] && a[0].url) || '';
      return of.apply(this, a).then(
        (r) => {
          d.fetches.push({ url, start: Math.round(t0), end: Math.round(performance.now()), status: r.status });
          return r;
        },
        (e) => {
          d.fetches.push({ url, start: Math.round(t0), end: Math.round(performance.now()), err: String(e && e.message) });
          throw e;
        },
      );
    };
  }
};

async function newContext(browser, { width, height = 900, mobile = false, api = 'off', init = INIT_SCRIPT }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    colorScheme: 'dark',
    serviceWorkers: 'block',
  });
  await context.addInitScript(init);
  if (api === 'off') {
    await context.route('**/api/**', (route) => route.abort());
    await context.route('**/api', (route) => route.abort());
  }
  return context;
}

// ---------------------------------------------------------------- passes
async function layoutPass(browser, { base, routes, widths, out }) {
  const results = [];
  for (const width of widths) {
    for (const route of routes) {
      const mobile = width <= 768;
      const context = await newContext(browser, { width, height: mobile ? 812 : 900, mobile });
      const page = await context.newPage();
      const entry = { route, width, ok: false };
      try {
        await page.goto(`${base}${route}`, { waitUntil: 'load', timeout: 45_000 });
        await page.waitForTimeout(1800); // deixa animações/lazy assentarem
        entry.metrics = await page.evaluate(COLLECT_LAYOUT, { minTap: MIN_TAP_PX, minFont: MIN_FONT_PX });
        entry.ok = true;
      } catch (err) {
        entry.error = String(err).slice(0, 200);
      } finally {
        await context.close();
      }
      results.push(entry);
      const m = entry.metrics;
      console.log(
        `[layout ${width}] ${route} ${entry.ok ? `overflow=${m.overflowPx} tap<44=${m.tap.tooSmall.length} exc=${m.tap.exceptions.paragraph + m.tap.exceptions.inlineSentence + m.tap.exceptions.labelControl} texto<12=${m.tiny.bad.length} h1=${m.h1.length} imgSemDim=${m.images.missingDims}` : `ERRO ${entry.error}`}`,
      );
    }
  }
  out.layout = results;
}

async function perfPass(browser, { base, routes, apiMode, out, suffix, runs }) {
  const results = [];
  const scenarios = [];
  if (apiMode === 'off' || apiMode === 'both') scenarios.push('off');
  if (apiMode === 'real' || apiMode === 'both') scenarios.push('real');

  const med = (vals) => {
    const v = vals.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
    return v.length ? v[Math.floor(v.length / 2)] : null;
  };

  const measureOnce = async ({ width, height, mobile, route, scenario }) => {
    const context = await newContext(browser, { width, height, mobile, api: scenario });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const entry = { route, width, api: scenario, ok: false };
    try {
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, ...SLOW_4G });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_RATE });
      await page.goto(`${base}${route}`, { waitUntil: 'load', timeout: 90_000 });
      await page.waitForTimeout(4000); // CLS tardio + LCP final
      entry.metrics = await page.evaluate(COLLECT_PERF);
      entry.ok = true;
    } catch (err) {
      entry.error = String(err).slice(0, 200);
    } finally {
      await context.close();
    }
    return entry;
  };

  // `runs` execuções por rota; o registro consolidado guarda a MEDIANA de
  // cada métrica (as execuções individuais ficam em `runs` no metrics.json).
  const runGroup = async ({ width, height, mobile, route, scenario }) => {
    const group = [];
    for (let i = 0; i < runs; i++) {
      group.push(await measureOnce({ width, height, mobile, route, scenario }));
    }
    const oks = group.filter((r) => r.ok && r.metrics);
    const entry = { route, width, api: scenario, ok: oks.length > 0, runCount: runs, okRuns: oks.length };
    if (oks.length) {
      const keys = [
        'cls', 'lcp', 'fcp', 'jsBytes', 'jsRequests', 'cssBytes',
        'imageBytes', 'imageRequests', 'fontBytes', 'totalBytes', 'totalRequests',
      ];
      const m = {};
      for (const k of keys) m[k] = med(oks.map((r) => r.metrics[k]));
      entry.metrics = m;
      entry.runs = oks.map((r) => ({ cls: r.metrics.cls, lcp: r.metrics.lcp, fcp: r.metrics.fcp }));
      const lcps = oks.map((r) => r.metrics.lcp).sort((a, b) => a - b);
      console.log(
        `[perf ${scenario} ${width}] ${route} CLS=${m.cls} LCP=${m.lcp}ms (mediana ${oks.length}/${runs}, min ${lcps[0]} máx ${lcps[lcps.length - 1]}) FCP=${m.fcp}ms JS=${Math.round(m.jsBytes / 1024)}KB/${m.jsRequests}req img=${Math.round(m.imageBytes / 1024)}KB`,
      );
    } else {
      entry.error = group.map((r) => r.error).filter(Boolean)[0] || 'todas as execuções falharam';
      console.log(`[perf ${scenario} ${width}] ${route} ERRO ${entry.error}`);
    }
    return entry;
  };

  for (const scenario of scenarios) {
    for (const route of routes) {
      results.push(await runGroup({ width: 375, height: 667, mobile: true, route, scenario }));
    }
  }
  // desktop 1440 nas rotas-chave + rotas /queue (fila pública é medida nos
  // dois viewports — item B da rodada LCP)
  const desktopRoutes = [...new Set([...KEY_ROUTES, ...routes.filter((r) => r.startsWith('/queue'))])];
  for (const scenario of scenarios) {
    for (const route of desktopRoutes) {
      results.push(await runGroup({ width: 1440, height: 900, mobile: false, route, scenario }));
    }
  }
  out[`perf${suffix}`] = results;
}

async function screensPass(browser, { base, dir, shots, shotWidths }) {
  const outDir = path.join(dir, 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });
  for (const width of shotWidths) {
    for (const route of shots) {
      const context = await newContext(browser, { width, height: width < 500 ? 812 : 1024, mobile: width < 500 });
      const page = await context.newPage();
      try {
        await page.goto(`${base}${route}`, { waitUntil: 'load', timeout: 45_000 });
        await page.waitForTimeout(2000);
        const file = path.join(outDir, `${routeSlug(route)}-${width}.png`);
        await page.screenshot({ path: file });
        console.log(`[shot] ${path.relative(ROOT, file)}`);
      } catch (err) {
        console.error(`[shot] falhou ${route}@${width}: ${err}`);
      } finally {
        await context.close();
      }
    }
  }
}

// ---------------------------------------------------------------- lcp (L1)
const median = (vals) => {
  const v = vals.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : null;
};

const shortPath = (u) => {
  try {
    const x = new URL(u, 'http://127.0.0.1');
    return x.pathname + (x.search || '');
  } catch {
    return String(u);
  }
};

// Divisão do tempo do LCP (mesmas grandezas do painel de Performance do
// Chromium): TTFB, atraso até o elemento/recurso existir, download e
// atraso de renderização.
function analyzeLcpRun(run, route) {
  const paints = run.paints || {};
  const fcp = paints['first-contentful-paint'] ?? null;
  const entries = run.lcp || [];
  const last = entries[entries.length - 1] || null;
  const nav = run.nav || {};
  const htmlEnd = nav.responseEnd ?? 0;
  const res = run.res || [];

  const el = last ? last.el : null;
  const isImg = Boolean(el && (el.img || last.url));
  const imgRes = isImg && last.url ? res.find((r) => r.name === last.url) : null;

  const breakdown = { ttfb: nav.ttfb ?? null };
  if (last) {
    if (isImg) {
      breakdown.recursoDelay = imgRes ? imgRes.start - htmlEnd : null; // atraso de descoberta do recurso
      breakdown.recursoDownload = imgRes ? imgRes.dur : null;
      breakdown.render = last.t - (imgRes ? imgRes.end : htmlEnd);
    } else {
      breakdown.criacaoElemento = el && el.fs != null ? el.fs - htmlEnd : null; // descoberta/criação (JS)
      breakdown.render = last.t - (el && el.fs != null ? el.fs : htmlEnd);
    }
  }

  const critical = [];
  if (nav.ttfb != null) {
    critical.push({ recurso: `${route} (document)`, tipo: 'html', inicio: 0, fim: nav.responseEnd, dur: nav.responseEnd, kb: Math.round((nav.transferSize || 0) / 102.4) / 10 });
  }
  for (const r of [...res].sort((a, b) => a.start - b.start)) {
    if (last && r.start > last.t) continue;
    const name = shortPath(r.name);
    const isCode = /\.(js|mjs)(\?|$)/.test(name);
    const isCss = /\.css(\?|$)/.test(name);
    const isFont = /\.(woff2?|ttf|otf)(\?|$)/.test(name);
    const isImgRes = /\.(png|jpe?g|webp|avif|svg|gif|ico)(\?|$)/.test(name);
    if (!isCode && !isCss && !isFont && !isImgRes && r.type !== 'link' && r.type !== 'script') continue;
    critical.push({
      recurso: name,
      tipo: isCss ? 'css (bloqueia pintura)' : isCode ? 'js' : isFont ? 'fonte' : isImgRes ? 'imagem' : r.type,
      inicio: r.start,
      fim: r.end,
      dur: r.dur,
      kb: Math.round(r.size / 102.4) / 10,
    });
  }

  const jsDeps = {
    elementoCriadoAposFCP: Boolean(el && el.fs != null && fcp != null && el.fs > fcp + 50),
    delayAposFCP: el && el.fs != null && fcp != null ? Math.round(el.fs - fcp) : null,
    nasceuEscondido: el ? el.hidden0 : null,
    dentroDoRootReact: el && el.chain ? el.chain.some((c) => c.startsWith('div#root')) : null,
    entradasLCP: entries.length, // >1 ⇒ o elemento foi pintado, escondido e repintado
  };

  const fetches = (run.fetches || []).map((f) => ({
    url: shortPath(f.url),
    inicio: f.start,
    fim: f.end,
    status: f.status ?? null,
    erro: f.err ?? null,
    antesDoLCP: last ? f.end <= last.t : false,
  }));

  return {
    route,
    fcp: fcp ?? paints['first-paint'] ?? null,
    lcpMs: last ? last.t : null,
    lcpSize: last ? last.size : null,
    lcpUrl: last && last.url ? shortPath(last.url) : null,
    elemento: el,
    entradas: entries.map((e) => ({ t: e.t, size: e.size, url: e.url ? shortPath(e.url) : null, texto: e.el ? e.el.text.slice(0, 60) : null, tag: e.el ? e.el.tag : null, fs: e.el ? e.el.fs : null, hidden0: e.el ? e.el.hidden0 : null })),
    breakdown,
    jsDeps,
    critical,
    fetches,
    dcl: run.dcl ?? nav.dcl ?? null,
    load: run.load ?? nav.loadEnd ?? null,
    fonts: res.filter((r) => r.type === 'font' || /\.(woff2?)(\?|$)/.test(r.name)).map((r) => ({ recurso: shortPath(r.name), inicio: r.start, fim: r.end, kb: Math.round(r.size / 102.4) / 10 })),
  };
}

async function lcpPass(browser, { base, routes, apiMode, runs, widths, out }) {
  const results = [];
  const scenarios = [];
  if (apiMode === 'off' || apiMode === 'both') scenarios.push('off');
  if (apiMode === 'real' || apiMode === 'both') scenarios.push('real');

  for (const scenario of scenarios) {
    for (const width of widths) {
      const mobile = width <= 768;
      for (const route of routes) {
        const execucoes = [];
        for (let i = 0; i < runs; i++) {
          const context = await newContext(browser, { width, height: mobile ? 667 : 900, mobile, api: scenario, init: INIT_LCP });
          const page = await context.newPage();
          const cdp = await context.newCDPSession(page);
          try {
            await cdp.send('Network.enable');
            await cdp.send('Network.emulateNetworkConditions', { offline: false, ...SLOW_4G });
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_RATE });
            await page.goto(`${base}${route}`, { waitUntil: 'load', timeout: 90_000 });
            await page.waitForTimeout(5000); // animações/lazy assentam; LCP final
            const raw = await page.evaluate(() => window.__lcp);
            execucoes.push(analyzeLcpRun(raw, route));
          } catch (err) {
            execucoes.push({ route, erro: String(err).slice(0, 200) });
          } finally {
            await context.close();
          }
          const atual = execucoes[execucoes.length - 1];
          console.log(
            `[lcp ${scenario} ${width}] ${route} exec ${i + 1}/${runs}: ${atual.erro ? `ERRO ${atual.erro}` : `LCP=${atual.lcpMs}ms FCP=${atual.fcp}ms el=<${atual.elemento ? atual.elemento.tag : '?'}> "${(atual.elemento ? atual.elemento.text : '').slice(0, 48)}" criadoEm=${atual.elemento ? atual.elemento.fs : '?'}ms`}`,
          );
        }
        results.push({ route, width, api: scenario, runs: execucoes });
      }
    }
  }
  out.lcp = { runsPerRoute: runs, scenarios, routes, widths, execucoes: results };
  return out.lcp;
}

function renderLcp(lcp) {
  const lines = [`# Diagnóstico LCP — ${lcp.runsPerRoute} execuções por rota`, ''];
  lines.push('Condições: rede Slow 4G (1,6 Mbps / 150 ms RTT) + CPU 4×, viewport 375×667, consentimento de cookies pré-setado.', '');
  for (const grupo of lcp.execucoes) {
    const ok = grupo.runs.filter((r) => !r.erro && r.lcpMs != null);
    if (!ok.length) {
      lines.push(`## ${grupo.route} (API ${grupo.api})`, '', '- todas as execuções falharam', '');
      continue;
    }
    const med = (fn) => median(ok.map(fn));
    const base = ok[0];
    const elementos = new Set(ok.map((r) => `${r.elemento ? r.elemento.tag : '?'}:"${r.elemento ? r.elemento.text.slice(0, 40) : ''}"`));
    lines.push(`## ${grupo.route} (API ${grupo.api}, ${ok.length} execuções)`, '');
    lines.push(`- **LCP mediano**: ${med((r) => r.lcpMs)} ms · **FCP mediano**: ${med((r) => r.fcp)} ms · elemento estável em ${elementos.size === 1 ? 'todas' : `só ${elementos.size} variações`} as execuções`);
    const el = base.elemento;
    if (el) {
      lines.push(`- **Elemento LCP**: \`<${el.tag}>\`${el.id ? `#${el.id}` : ''} classe \`${(el.cls || '').slice(0, 90)}\` — “${el.text.slice(0, 90)}” (${el.rect.w}×${el.rect.h}px)`);
      lines.push(`- **Cadeia do elemento**: ${el.chain.join(' → ')}`);
      lines.push(`- **Estilo no paint**: opacity=${el.style.opacity}, visibility=${el.style.visibility}, fonte ${el.style.fontSize} ${el.style.fontFamily}${el.hidden0 ? ` · **nasceu escondido: ${el.hidden0}**` : ' · visível desde a criação'}`);
      if (el.fs != null) {
        let fsNote = '';
        if (base.fcp != null) {
          const delta = Math.round(el.fs - base.fcp);
          fsNote = delta > 50 ? ` (${delta} ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)` : ' (antes/do FCP)';
        }
        lines.push(`- **Entrada no DOM**: ${el.fs} ms${fsNote}`);
      }
    }
    const b = base.breakdown;
    const parts = [`TTFB ${b.ttfb ?? '?'} ms`];
    if (b.criacaoElemento != null) parts.push(`criação do elemento +${b.criacaoElemento} ms`);
    if (b.recursoDelay != null) parts.push(`descoberta do recurso +${b.recursoDelay} ms`);
    if (b.recursoDownload != null) parts.push(`download do recurso ${b.recursoDownload} ms`);
    if (b.render != null) parts.push(`renderização +${b.render} ms`);
    lines.push(`- **Divisão do tempo (execução 1)**: ${parts.join(' · ')}`);
    lines.push(`- **Divisão (mediana)**: TTFB ${med((r) => r.breakdown.ttfb)} · elemento/recurso +${med((r) => (r.breakdown.criacaoElemento ?? r.breakdown.recursoDelay ?? 0))} · render +${med((r) => r.breakdown.render ?? 0)} ⇒ soma ≈ ${med((r) => r.lcpMs)} ms`);
    const d = base.jsDeps;
    lines.push(`- **Depende de JS**: elemento criado após FCP em ${ok.filter((r) => r.jsDeps.elementoCriadoAposFCP).length}/${ok.length} execuções · nasceu escondido em ${ok.filter((r) => r.jsDeps.nasceuEscondido).length}/${ok.length} · dentro de \`div#root\`: ${d.dentroDoRootReact ? 'sim' : 'não'} · entradas LCP por execução (repinturas): ${ok.map((r) => r.jsDeps.entradasLCP).join(', ')}`);
    const fetchApi = base.fetches.filter((f) => f.url.startsWith('/api'));
    if (fetchApi.length) {
      lines.push(`- **Chamadas API antes do LCP**: ${fetchApi.map((f) => `${f.url} ${f.inicio}→${f.fim}ms ${f.erro ? `(${f.erro})` : `status ${f.status}`}${f.antesDoLCP ? ' [terminou antes do LCP]' : ' [depois do LCP]'}`).join(' · ')}`);
    } else {
      lines.push('- **Chamadas API antes do LCP**: nenhuma');
    }
    lines.push('', 'Caminho crítico até o LCP (execução 1):', '', '| recurso | tipo | início | fim | dur | KB |', '|---|---|---|---|---|---|');
    for (const c of base.critical) {
      lines.push(`| \`${c.recurso.slice(0, 70)}\` | ${c.tipo} | ${c.inicio} | ${c.fim} | ${c.dur} | ${c.kb} |`);
    }
    if (base.fonts.length) {
      lines.push('', `Fontes carregadas até o LCP: ${base.fonts.map((f) => `${f.recurso.split('/').pop()} ${f.inicio}→${f.fim}ms (${f.kb}KB)`).join(' · ')}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------- resumo
function summarize(results) {
  const ok = results.filter((r) => r.ok && r.metrics);
  const mobile = ok.filter((r) => r.width <= 768);
  const pick = (arr, fn) => arr.map(fn);
  const sum = (arr, fn) => arr.reduce((acc, x) => acc + fn(x), 0);
  return {
    rotas: ok.length,
    overflow: {
      total: sum(ok, (r) => (r.metrics.overflowPx > 0 ? 1 : 0)),
      maxPx: Math.max(0, ...ok.map((r) => r.metrics.overflowPx)),
      detalhe: pick(ok.filter((r) => r.metrics.overflowPx > 0), (r) => `${r.route}@${r.width}=${r.metrics.overflowPx}px`),
    },
    tapUnder44Mobile: {
      total: sum(mobile, (r) => r.metrics.tap.tooSmall.length),
      excecoes: {
        paragrafo: sum(mobile, (r) => r.metrics.tap.exceptions.paragraph),
        frase: sum(mobile, (r) => r.metrics.tap.exceptions.inlineSentence),
        labelComControle: sum(mobile, (r) => r.metrics.tap.exceptions.labelControl),
      },
      detalhe: pick(mobile.filter((r) => r.metrics.tap.tooSmall.length), (r) => `${r.route}@${r.width}=${r.metrics.tap.tooSmall.length}`),
    },
    tinyTextMobile: {
      total: sum(mobile, (r) => r.metrics.tiny.bad.length),
      detalhe: pick(mobile.filter((r) => r.metrics.tiny.bad.length), (r) => `${r.route}@${r.width}=${r.metrics.tiny.bad.length}`),
    },
    h1: pick(ok, (r) => `${r.route}@${r.width}=${r.metrics.h1.length}`).filter((s) => !s.endsWith('=1')),
    imagesWithoutDims: {
      total: sum(ok, (r) => r.metrics.images.missingDims),
      detalhe: pick(ok.filter((r) => r.metrics.images.missingDims), (r) => `${r.route}@${r.width}=${r.metrics.images.missingDims}`),
    },
  };
}

function summarizePerf(results) {
  const ok = results.filter((r) => r.ok && r.metrics);
  const byApi = {};
  for (const r of ok) {
    const key = `${r.api}@${r.width}`;
    byApi[key] = byApi[key] || [];
    byApi[key].push(r);
  }
  const table = [];
  for (const [key, rows] of Object.entries(byApi)) {
    const med = (fn) => {
      const vals = rows.map(fn).filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
      if (!vals.length) return null;
      return vals[Math.floor(vals.length / 2)];
    };
    table.push({
      scenario: key,
      rotas: rows.length,
      clsMed: med((r) => r.metrics.cls),
      clsMax: Math.max(...rows.map((r) => r.metrics.cls)),
      lcpMed: med((r) => r.metrics.lcp),
      lcpMax: Math.max(...rows.map((r) => r.metrics.lcp)),
      fcpMed: med((r) => r.metrics.fcp),
      jsMedKB: Math.round((med((r) => r.metrics.jsBytes) || 0) / 1024),
      jsReqMed: med((r) => r.metrics.jsRequests),
      imgMedKB: Math.round((med((r) => r.metrics.imageBytes) || 0) / 1024),
      porRota: rows.map((r) => ({
        route: r.route,
        cls: r.metrics.cls,
        lcp: r.metrics.lcp,
        fcp: r.metrics.fcp,
        jsKB: Math.round(r.metrics.jsBytes / 1024),
        jsReq: r.metrics.jsRequests,
        imgKB: Math.round(r.metrics.imageBytes / 1024),
      })),
    });
  }
  return table;
}

// ---------------------------------------------------------------- main
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dir = path.join(ROOT, 'scripts', 'measurements', args.label);
  fs.mkdirSync(dir, { recursive: true });

  let base = args.base;
  let preview = null;
  if (!base) {
    if (args.build) {
      console.log('[build] npm run build ...');
      run('npm', ['run', 'build']);
    }
    base = `http://127.0.0.1:${args.port}`;
    console.log(`[preview] subindo ${base} ...`);
    preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(args.port), '--strictPort'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      // liga o proxy de /api do preview para a medição "API real"
      env: { ...process.env, MEASURE_API_PROXY: '1' },
    });
    preview.stdout.on('data', (d) => process.stdout.write(`[preview] ${d}`));
    preview.stderr.on('data', (d) => process.stderr.write(`[preview] ${d}`));
    await waitFor(base, 90_000);
  }

  const backendUp = await apiAlive();
  let apiMode = args.api;
  if (apiMode === 'auto') apiMode = backendUp ? 'both' : 'off';
  if (apiMode === 'real' && !backendUp) {
    console.warn('[aviso] backend indisponível — cenário "real" ignorado');
    apiMode = 'off';
  }
  console.log(`[run] label=${args.label} base=${base} api=${apiMode} backend=${backendUp ? 'up' : 'down'}`);

  const out = {
    label: args.label,
    createdAt: new Date().toISOString(),
    base,
    apiMode,
    backendUp,
    routes: args.routes,
    widths: args.widths,
    runs: args.runs,
    env: { slow4g: SLOW_4G, cpuRate: CPU_RATE, minTap: MIN_TAP_PX, minFont: MIN_FONT_PX },
  };
  const lcpRoutes = args.routes === PUBLIC_ROUTES ? LCP_ROUTES : args.routes;

  const browser = await chromium.launch();
  try {
    if (args.lcp) await lcpPass(browser, { base, routes: lcpRoutes, apiMode, runs: args.runs, widths: args.lcpWidths, out });
    if (args.layout) await layoutPass(browser, { base, routes: args.routes, widths: args.widths, out });
    if (args.perf) await perfPass(browser, { base, routes: args.routes, apiMode, out, suffix: '', runs: args.runs });
    if (args.screens) await screensPass(browser, { base, dir, shots: args.shots, shotWidths: args.shotWidths });
  } finally {
    await browser.close();
    if (preview) preview.kill('SIGTERM');
  }

  if (out.layout) out.summary = summarize(out.layout);
  if (out.perf) out.perfSummary = summarizePerf(out.perf);

  // só grava metrics/summary se houve passe de métrica (um --screens puro
  // não sobrescreve o metrics.json de uma corrida anterior do mesmo label)
  if (out.layout || out.perf || out.lcp) {
    fs.writeFileSync(path.join(dir, 'metrics.json'), JSON.stringify(out, null, 2));
    fs.writeFileSync(path.join(dir, 'summary.md'), renderSummary(out));
    console.log(`\n[salvo] ${path.relative(ROOT, path.join(dir, 'metrics.json'))}`);
    console.log(renderSummary(out));
  }
  if (out.lcp) {
    fs.writeFileSync(path.join(dir, 'lcp.json'), JSON.stringify(out.lcp, null, 2));
    fs.writeFileSync(path.join(dir, 'lcp.md'), renderLcp(out.lcp));
    console.log(`\n[salvo] ${path.relative(ROOT, path.join(dir, 'lcp.md'))}`);
    console.log(renderLcp(out.lcp));
  }
}

function renderSummary(out) {
  const lines = [`# Medição — ${out.label}`, '', `Gerado em ${out.createdAt} · base ${out.base} · API ${out.apiMode}`, ''];
  if (out.summary) {
    const s = out.summary;
    lines.push('## Layout (todas as rotas/larguras, API fora)', '', '| métrica | valor |', '|---|---|');
    lines.push(`| rotas medidas | ${s.rotas} |`);
    lines.push(`| páginas com estouro horizontal | ${s.overflow.total} (máx ${s.overflow.maxPx}px) |`);
    lines.push(`| clicáveis <44px em mobile (alvo real) | ${s.tapUnder44Mobile.total} |`);
    lines.push(
      `| exceções justificadas (texto corrido / frase / label com controle ok) | ${s.tapUnder44Mobile.excecoes.paragrafo} / ${s.tapUnder44Mobile.excecoes.frase} / ${s.tapUnder44Mobile.excecoes.labelComControle} |`,
    );
    lines.push(`| textos <12px em mobile | ${s.tinyTextMobile.total} |`);
    lines.push(`| páginas sem exatamente 1 h1 | ${s.h1.length} |`);
    lines.push(`| <img> visíveis sem width/height | ${s.imagesWithoutDims.total} |`);
    for (const [k, v] of [
      ['estouro', s.overflow.detalhe],
      ['tap', s.tapUnder44Mobile.detalhe],
      ['texto', s.tinyTextMobile.detalhe],
      ['h1', s.h1],
      ['img', s.imagesWithoutDims.detalhe],
    ]) {
      if (v.length) lines.push('', `<details><summary>${k} (detalhe)</summary>`, '', ...v.map((x) => `- ${x}`), '', '</details>');
    }
    lines.push('');
  }
  if (out.perfSummary) {
    lines.push(`## Performance (4G lenta + CPU 4x${out.runs ? `, mediana de ${out.runs} execuções por rota` : ''})`, '', '| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |', '|---|---|---|---|---|---|---|---|---|---|');
    for (const row of out.perfSummary) {
      lines.push(
        `| ${row.scenario} | ${row.rotas} | ${row.clsMed} | ${row.clsMax} | ${row.lcpMed}ms | ${row.lcpMax}ms | ${row.fcpMed}ms | ${row.jsMedKB}KB | ${row.jsReqMed} | ${row.imgMedKB}KB |`,
      );
    }
    lines.push('');
    for (const row of out.perfSummary) {
      lines.push(`### ${row.scenario}`, '', '| rota | CLS | LCP | FCP | JS | scripts | imagens |', '|---|---|---|---|---|---|---|');
      for (const r of row.porRota) {
        lines.push(`| ${r.route} | ${r.cls} | ${r.lcp}ms | ${r.fcp}ms | ${r.jsKB}KB | ${r.jsReq} | ${r.imgKB}KB |`);
      }
      lines.push('');
    }
  }
  return lines.join('\n');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
