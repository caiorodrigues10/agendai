import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Run against an isolated Storybook with synthetic MSW fixtures, never production.
const require = createRequire(import.meta.url);
const origin = process.argv[2];
const output = process.argv[3];
const storyFilter = process.argv[4];
if (!origin || !output || !['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) {
  throw new Error('Usage: node scripts/check-user-ux.mjs http://127.0.0.1:6014 <output-directory>');
}
await mkdir(output, { recursive: true });
const index = await (await fetch(`${origin}/index.json`)).json();
const stories = Object.values(index.entries).filter(
  entry =>
    entry.type === 'story' &&
    (!storyFilter || entry.id.includes(storyFilter)) &&
    !/^(MasterAdmin|Marketing|Billing|Fundações|Infra|Padrões|UI)\//.test(entry.title)
);
const selected = [
  ...new Map(
    stories.map(entry => [
      entry.title,
      stories.find(
        item =>
          item.title === entry.title &&
          /^(Default|Com Dados|Proprietario|Novo|Equipe|Telefone)$/i.test(item.name)
      ) ?? entry,
    ])
  ).values(),
];
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const story of selected) {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    // MSW owns fixture responses. Unhandled API traffic is rejected by this guard.
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/api/'))
        return route.fulfill({ status: 501, json: { message: 'Fixture não definida' } });
      if (
        url.origin !== new URL(origin).origin &&
        !url.hostname.endsWith('gstatic.com') &&
        !url.hostname.endsWith('googleapis.com') &&
        !(url.hostname === 'api.qrserver.com' && route.request().resourceType() === 'image')
      )
        return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const theme of ['dark', 'light']) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      const row = {
        story: story.id,
        title: story.title,
        theme,
        layouts: [],
        violations: [],
        errors: [],
      };
      try {
        await page.goto(
          `${origin}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`,
          { waitUntil: 'networkidle', timeout: 45000 }
        );
        await page.locator('#storybook-root').waitFor();
        await page.waitForTimeout(350);
        for (const width of [375, 768, 1024, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.waitForTimeout(60);
          // Reveal lazy/whileInView sections before capturing the full page.
          // Otherwise their initial opacity can hide real contrast failures.
          await page.evaluate(async () => {
            const height = document.documentElement.scrollHeight;
            for (let top = 0; top < height; top += innerHeight * 0.8) {
              scrollTo(0, top);
              await new Promise(resolve => setTimeout(resolve, 60));
            }
            scrollTo(0, 0);
          });
          await page.waitForTimeout(350);
          const layout = await page.evaluate(() => ({
            width: innerWidth,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            overflowing: [...document.querySelectorAll('#storybook-root *')]
              .filter(element => {
                const rect = element.getBoundingClientRect();
                return (
                  rect.width > 0 &&
                  rect.right > innerWidth + 1 &&
                  getComputedStyle(element).position !== 'absolute'
                );
              })
              .slice(0, 4)
              .map(element => `${element.tagName}.${element.className}`),
          }));
          row.layouts.push(layout);
          if ((width === 375 && theme === 'light') || (width === 1440 && theme === 'dark')) {
            await page.screenshot({
              path: path.join(output, `${story.id}-${width}-${theme}.png`),
              fullPage: true,
            });
          }
        }
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
        await page.waitForFunction(() => !window.axe._running);
        row.violations = await page.evaluate(async () =>
          (
            await window.axe.run(document, {
              runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
            })
          ).violations
            .filter(item => ['serious', 'critical'].includes(item.impact))
            .map(item => ({
              id: item.id,
              impact: item.impact,
              nodes: item.nodes.map(node => ({
                target: node.target,
                summary: node.failureSummary,
              })),
            }))
        );
        // Safe navigation only: no publish/payment/message actions are inferred.
        const tabs = await page.getByRole('tab').all();
        row.tabsChecked = 0;
        for (const tab of tabs) {
          if ((await tab.isVisible()) && (await tab.isEnabled())) {
            await tab.click();
            await page.waitForTimeout(80);
            row.tabsChecked++;
          }
        }
        row.errors = [...errors];
        if (await page.locator('.sb-errordisplay').isVisible())
          row.errors.push(await page.locator('.sb-errordisplay').innerText());
      } catch (error) {
        row.errors.push(String(error));
      }
      results.push(row);
      await writeFile(path.join(output, 'visual-results.json'), JSON.stringify(results, null, 2));
      console.log(
        `${row.title} ${theme}: overflow=${row.layouts.some(item => item.overflow)} a11y=${row.violations.length} errors=${row.errors.length}`
      );
    }
    await context.close();
  }
} finally {
  await browser.close();
}
console.log(`${results.length} story/theme cases written to ${output}`);
if (
  results.some(
    row => row.errors.length || row.violations.length || row.layouts.some(item => item.overflow)
  )
)
  process.exitCode = 1;
