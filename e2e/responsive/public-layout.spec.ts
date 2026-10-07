import { expect, test, type Page } from '@playwright/test';

/**
 * Checagens responsivas das rotas públicas (itens R1–R12 da auditoria).
 *
 * As métricas são coletadas uma única vez por largura e reutilizadas entre os
 * testes: as regras de visibilidade/exceção são idênticas às do script
 * `npm run measure:responsive` (scripts/measure-responsive.mjs), para que o
 * resultado deste spec bata com a medição antes/depois.
 */

const MIN_TAP_PX = 44;
const MIN_FONT_PX = 12;
const WIDTHS = [320, 375];
const ROUTES = [
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

interface TapInfo {
  tag: string;
  text: string;
  cls: string;
  w: number;
  h: number;
  href?: string;
}

interface LayoutMetrics {
  overflowPx: number;
  overflowSources: Array<TapInfo & { right: number }>;
  tap: { total: number; tooSmall: TapInfo[]; exceptions: Record<string, number> };
  tiny: { total: number; bad: Array<TapInfo & { size: number }> };
  h1: Array<{ text: string; visible: boolean }>;
  images: { total: number; missingDims: number; items: unknown[] };
}

interface Snapshot {
  route: string;
  width: number;
  ok: boolean;
  error?: string;
  metrics?: LayoutMetrics;
}

const COLLECT_LAYOUT = ({ minTap, minFont }: { minTap: number; minFont: number }) => {
  const visible = (el: Element) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    if (el.closest('[aria-hidden="true"]')) return false;
    if (el.closest('[inert]')) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    if (r.width < 4 || r.height < 4) return false;
    if (r.left >= window.innerWidth || r.right <= 0) return false;
    return true;
  };
  const info = (el: Element): TapInfo => ({
    tag: el.tagName.toLowerCase(),
    text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48),
    cls: String(el.getAttribute('class') || '').slice(0, 80),
    w: Math.round(el.getBoundingClientRect().width),
    h: Math.round(el.getBoundingClientRect().height),
    href: el.getAttribute('href') || undefined,
  });

  const doc = document.documentElement;
  const overflowPx = Math.max(0, doc.scrollWidth - doc.clientWidth);

  const overflowSources: Array<TapInfo & { right: number }> = [];
  if (overflowPx > 0) {
    for (const el of document.querySelectorAll('body *')) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1) {
        const parent = el.parentElement;
        const cs = parent ? getComputedStyle(parent) : null;
        if (cs && (cs.overflowX === 'auto' || cs.overflowX === 'scroll')) continue;
        overflowSources.push({ ...info(el), right: Math.round(r.right) });
      }
    }
    overflowSources.sort((a, b) => b.right - a.right);
  }

  const clickable = document.querySelectorAll(
    'a[href], button, [role="button"], [role="link"], [role="tab"], input, select, textarea, summary, label',
  );
  const tap = { total: 0, tooSmall: [] as TapInfo[], exceptions: { paragraph: 0, inlineSentence: 0, labelControl: 0 } };
  for (const el of Array.from(clickable)) {
    if (!visible(el)) continue;
    if ((el as HTMLInputElement).disabled) continue;
    const r = el.getBoundingClientRect();
    tap.total += 1;
    if (r.width >= minTap && r.height >= minTap) continue;

    const inParagraph = Boolean(el.closest('p, blockquote, figcaption, [class*="prose"]'));
    let inlineInSentence = false;
    if (!inParagraph && getComputedStyle(el).display === 'inline' && el.parentElement) {
      for (const node of Array.from(el.parentElement.childNodes)) {
        if (node.nodeType === 3 && (node.textContent || '').trim()) {
          inlineInSentence = true;
          break;
        }
      }
    }
    let labelControl = false;
    if (el.tagName === 'LABEL') {
      const control =
        (el as HTMLLabelElement).control || el.querySelector('input, select, textarea');
      if (control && control !== el && visible(control)) {
        const cr = control.getBoundingClientRect();
        labelControl = cr.width >= minTap && cr.height >= minTap;
      }
    }

    if (inParagraph) tap.exceptions.paragraph += 1;
    else if (inlineInSentence) tap.exceptions.inlineSentence += 1;
    else if (labelControl) tap.exceptions.labelControl += 1;
    else tap.tooSmall.push(info(el));
  }

  const tiny = { total: 0, bad: [] as Array<TapInfo & { size: number }>, bySize: {} as Record<string, number> };
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    if ([...el.childNodes].some((n) => n.nodeType === 1)) continue;
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const size = Number.parseFloat(getComputedStyle(el).fontSize);
    tiny.total += 1;
    if (size >= minFont) continue;
    tiny.bySize[`${size}px`] = (tiny.bySize[`${size}px`] || 0) + 1;
    tiny.bad.push({ ...info(el), size });
  }

  const h1 = [...document.querySelectorAll('h1')].map((el) => ({
    text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
    visible: visible(el),
  }));

  const images = { total: 0, missingDims: 0, items: [] as unknown[] };
  for (const img of document.querySelectorAll('img')) {
    if (!visible(img)) continue;
    images.total += 1;
    const hasW = img.hasAttribute('width');
    const hasH = img.hasAttribute('height');
    if (hasW && hasH) continue;
    images.missingDims += 1;
    images.items.push({
      src: (img.getAttribute('src') || '').slice(-70),
      loading: img.getAttribute('loading'),
    });
  }

  return { overflowPx, overflowSources: overflowSources.slice(0, 8), tap, tiny, h1, images };
};

let snapshots: Snapshot[] | null = null;

async function collect(page: Page): Promise<Snapshot[]> {
  if (snapshots) return snapshots;
  const results: Snapshot[] = [];
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 812 });
    for (const route of ROUTES) {
      const entry: Snapshot = { route, width, ok: false };
      try {
        await page.goto(route, { waitUntil: 'load', timeout: 45_000 });
        await page.waitForTimeout(1200);
        entry.metrics = await page.evaluate(COLLECT_LAYOUT, {
          minTap: MIN_TAP_PX,
          minFont: MIN_FONT_PX,
        });
        entry.ok = true;
      } catch (err) {
        entry.error = String(err).slice(0, 200);
      }
      results.push(entry);
    }
  }
  snapshots = results;
  return results;
}

function describeFailures<T>(items: Array<{ route: string; width: number; items: T[] }>): string {
  return items
    .map((group) => `${group.route}@${group.width}: ${JSON.stringify(group.items)}`)
    .join('\n');
}

test.describe('Layout público responsivo (auditoria R1–R12)', () => {
  test.setTimeout(300_000);

  test('R1 — nenhum alvo clicável mede menos que 44×44 px em mobile', async ({ page }) => {
    const data = await collect(page);
    const failures = data
      .filter((s) => s.ok && s.metrics && s.metrics.tap.tooSmall.length > 0)
      .map((s) => ({ route: s.route, width: s.width, items: s.metrics!.tap.tooSmall }));

    expect(describeFailures(failures)).toBe('');
  });

  test('R1 — nenhuma rota falha na coleta', async ({ page }) => {
    const data = await collect(page);
    const broken = data.filter((s) => !s.ok).map((s) => ({ route: s.route, width: s.width, items: [s.error] }));
    expect(describeFailures(broken)).toBe('');
  });

  test('R2 — nenhum texto de conteúdo mede menos que 12px em mobile', async ({ page }) => {
    const data = await collect(page);
    const failures = data
      .filter((s) => s.ok && s.metrics && s.metrics.tiny.bad.length > 0)
      .map((s) => ({
        route: s.route,
        width: s.width,
        items: s.metrics!.tiny.bad.map((t) => ({ text: t.text, size: t.size, cls: t.cls })),
      }));

    expect(describeFailures(failures)).toBe('');
  });
});
