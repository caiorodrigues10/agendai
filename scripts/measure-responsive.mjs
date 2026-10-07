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
const WIDTHS = [320, 375, 390, 768, 1024, 1440];
const SHOT_ROUTES = ['/', '/login', '/planos'];
const SHOT_WIDTHS = [375, 768];

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
    api: 'auto',
    base: '',
    build: true,
    port: PREVIEW_PORT,
    routes: PUBLIC_ROUTES,
    widths: WIDTHS,
  };
  for (const raw of argv) {
    if (raw === '--layout') args.layout = true;
    else if (raw === '--perf') args.perf = true;
    else if (raw === '--screens') args.screens = true;
    else if (raw === '--no-build') args.build = false;
    else if (raw.startsWith('--label=')) args.label = raw.slice(8);
    else if (raw.startsWith('--api=')) args.api = raw.slice(6);
    else if (raw.startsWith('--base=')) args.base = raw.slice(7).replace(/\/$/, '');
    else if (raw.startsWith('--port=')) args.port = Number(raw.slice(7));
    else if (raw.startsWith('--routes=')) args.routes = raw.slice(9).split(',');
    else if (raw.startsWith('--widths=')) args.widths = raw.slice(9).split(',').map(Number);
    else {
      console.error(`argumento desconhecido: ${raw}`);
      process.exit(2);
    }
  }
  if (!args.layout && !args.perf && !args.screens) {
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

async function newContext(browser, { width, height = 900, mobile = false, api = 'off' }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    colorScheme: 'dark',
    serviceWorkers: 'block',
  });
  await context.addInitScript(INIT_SCRIPT);
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

async function perfPass(browser, { base, routes, apiMode, out, suffix }) {
  const results = [];
  const scenarios = [];
  if (apiMode === 'off' || apiMode === 'both') scenarios.push('off');
  if (apiMode === 'real' || apiMode === 'both') scenarios.push('real');

  for (const scenario of scenarios) {
    for (const route of routes) {
      const context = await newContext(browser, { width: 375, height: 667, mobile: true, api: scenario });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      const entry = { route, width: 375, api: scenario, ok: false };
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
      results.push(entry);
      const m = entry.metrics;
      console.log(
        `[perf ${scenario} 375] ${route} ${entry.ok ? `CLS=${m.cls} LCP=${m.lcp}ms FCP=${m.fcp}ms JS=${Math.round(m.jsBytes / 1024)}KB/${m.jsRequests}req img=${Math.round(m.imageBytes / 1024)}KB` : `ERRO ${entry.error}`}`,
      );
    }
  }
  // desktop 1440 só nas rotas-chave (mesma rede, sem throttling de CPU extra)
  for (const scenario of scenarios) {
    for (const route of KEY_ROUTES) {
      const context = await newContext(browser, { width: 1440, height: 900, api: scenario });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      const entry = { route, width: 1440, api: scenario, ok: false };
      try {
        await cdp.send('Network.enable');
        await cdp.send('Network.emulateNetworkConditions', { offline: false, ...SLOW_4G });
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_RATE });
        await page.goto(`${base}${route}`, { waitUntil: 'load', timeout: 90_000 });
        await page.waitForTimeout(4000);
        entry.metrics = await page.evaluate(COLLECT_PERF);
        entry.ok = true;
      } catch (err) {
        entry.error = String(err).slice(0, 200);
      } finally {
        await context.close();
      }
      results.push(entry);
      const m = entry.metrics;
      console.log(
        `[perf ${scenario} 1440] ${route} ${entry.ok ? `CLS=${m.cls} LCP=${m.lcp}ms FCP=${m.fcp}ms JS=${Math.round(m.jsBytes / 1024)}KB` : `ERRO ${entry.error}`}`,
      );
    }
  }
  out[`perf${suffix}`] = results;
}

async function screensPass(browser, { base, dir }) {
  const outDir = path.join(dir, 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });
  for (const width of SHOT_WIDTHS) {
    for (const route of SHOT_ROUTES) {
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
    env: { slow4g: SLOW_4G, cpuRate: CPU_RATE, minTap: MIN_TAP_PX, minFont: MIN_FONT_PX },
  };

  const browser = await chromium.launch();
  try {
    if (args.layout) await layoutPass(browser, { base, routes: args.routes, widths: args.widths, out });
    if (args.perf) await perfPass(browser, { base, routes: args.routes, apiMode, out, suffix: '' });
    if (args.screens) await screensPass(browser, { base, dir });
  } finally {
    await browser.close();
    if (preview) preview.kill('SIGTERM');
  }

  if (out.layout) out.summary = summarize(out.layout);
  if (out.perf) out.perfSummary = summarizePerf(out.perf);

  fs.writeFileSync(path.join(dir, 'metrics.json'), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(dir, 'summary.md'), renderSummary(out));
  console.log(`\n[salvo] ${path.relative(ROOT, path.join(dir, 'metrics.json'))}`);
  console.log(renderSummary(out));
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
    lines.push('## Performance (4G lenta + CPU 4x)', '', '| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |', '|---|---|---|---|---|---|---|---|---|---|');
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
