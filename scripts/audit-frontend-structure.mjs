import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = join(process.cwd(), 'src');
const findings = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
      const source = await readFile(path, 'utf8');
      const lines = source.split(/\r?\n/).length;
      const states = (source.match(/\buseState\s*[<(]/g) ?? []).length;
      const effects = (source.match(/\buseEffect\s*\(/g) ?? []).length;
      if (lines > 400 || states > 8 || effects > 3)
        findings.push({ path: relative(process.cwd(), path), lines, states, effects });
      if (!path.includes(`${join('src', 'infra')}`) && /\bfetch\s*\(/.test(source))
        console.log(`direct-fetch: ${relative(process.cwd(), path)}`);
      if (!path.includes(`${join('src', 'utils')}`) && /new Intl\.NumberFormat/.test(source))
        console.log(`inline-intl: ${relative(process.cwd(), path)}`);
    }
  }
}

await walk(root);
console.table(findings.sort((a, b) => b.lines - a.lines));
console.log(`\n${findings.length} arquivo(s) precisam de atenção estrutural.`);
