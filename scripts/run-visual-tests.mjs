#!/usr/bin/env node
/**
 * Regressão visual (Storybook test-runner + jest-image-snapshot).
 *
 * 1. Garante o build estático (`storybook-static/`), rebuildando se preciso.
 * 2. Sobe um servidor estático mínimo (sem dependências).
 * 3. Roda `test-storybook` contra ele e encaminha o exit code.
 *
 * Uso:
 *   node scripts/run-visual-tests.mjs                 # build + testes
 *   node scripts/run-visual-tests.mjs --no-build      # reusa build atual
 *   node scripts/run-visual-tests.mjs -- --updateSnapshot   # (re)gera baseline
 *   node scripts/run-visual-tests.mjs -- --url http://host:porta  # pula servidor
 * Args extras após `--` são repassados ao test-storybook.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const staticDir = path.join(root, 'storybook-static');
const PORT = Number(process.env.VISUAL_PORT || 6060);

const sepIdx = process.argv.indexOf('--');
const ownArgs = process.argv.slice(2, sepIdx === -1 ? process.argv.length : sepIdx);
const passthrough = sepIdx === -1 ? [] : process.argv.slice(sepIdx + 1);

const noBuild = ownArgs.includes('--no-build');
// Args além de --no-build são repassados ao test-storybook (ex.: --updateSnapshot, --maxWorkers).
const extraArgs = [...ownArgs.filter((a) => a !== '--no-build'), ...passthrough];
const urlArgIdx = extraArgs.indexOf('--url');
const externalUrl = urlArgIdx !== -1 ? extraArgs[urlArgIdx + 1] : null;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

/**
 * @swc/core (usado pelo test-runner) valida o DACL do cache nativo em Windows:
 * só aceita {usuário atual, Administradores, SYSTEM} — ACLs herdadas padrão
 * (Authenticated Users, SIDs de perfil de sandbox) reprovam e o binding falha.
 * Garante um cache em <drive>:\swc-native-cache com ACL restrito.
 * Não faz nada se SWC_NATIVE_BINDING_CACHE já estiver definido ou fora de Windows.
 */
function ensureSwcCache() {
  if (process.platform !== 'win32' || process.env.SWC_NATIVE_BINDING_CACHE) return;
  try {
    const dir = path.join(process.env.SystemDrive || 'C:', 'swc-native-cache');
    fs.mkdirSync(dir, { recursive: true });
    const whoami = execFileSync('whoami', ['/user', '/fo', 'csv', '/nh'], { encoding: 'utf8' });
    const sid = whoami.match(/S-\d+(-\d+)+/)?.[0];
    if (!sid) throw new Error('SID do usuário atual não encontrado');
    execFileSync('icacls', [dir, '/inheritance:r'], { stdio: 'ignore' });
    execFileSync('icacls', [
      dir,
      '/grant:r', '*S-1-5-18:(OI)(CI)F',
      '/grant:r', '*S-1-5-32-544:(OI)(CI)F',
      '/grant:r', `*${sid}:(OI)(CI)F`,
    ], { stdio: 'ignore' });
    process.env.SWC_NATIVE_BINDING_CACHE = dir;
  } catch (err) {
    console.warn('[visual] não foi possível preparar o cache do SWC:', err.message);
  }
}

function ensureBuild() {
  if (noBuild && fs.existsSync(path.join(staticDir, 'index.html'))) return;
  const r = spawnSync('npm', ['run', 'build-storybook'], { cwd: root, stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    console.error('[visual] build-storybook falhou.');
    process.exit(r.status ?? 1);
  }
}

function startServer() {
  const server = http.createServer((req, res) => {
    try {
      const url = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = path.normalize(path.join(staticDir, url));
      if (!filePath.startsWith(staticDir)) {
        res.writeHead(403).end('forbidden');
        return;
      }
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        const fallback = path.join(staticDir, 'index.html');
        if (!fs.existsSync(fallback)) {
          res.writeHead(404).end('not found');
          return;
        }
        filePath = fallback;
      }
      const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(PORT, () => resolve(server));
  });
}

function runTests(url) {
  const bin = path.join(root, 'node_modules', '@storybook', 'test-runner', 'dist', 'test-storybook.js');
  const args = [bin, '--url', url, ...extraArgs];
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit' });
    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', (err) => {
      console.error('[visual] falha ao iniciar test-storybook:', err);
      resolve(1);
    });
  });
}

const server = await (async () => {
  if (externalUrl) return null;
  ensureBuild();
  try {
    return await startServer();
  } catch (err) {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`[visual] porta ${PORT} em uso — passe -- --url http://localhost:<outra> ou encerre o processo.`);
      process.exit(1);
    }
    throw err;
  }
})();

const url = externalUrl || `http://localhost:${PORT}`;
ensureSwcCache();
const code = await runTests(url);
if (server) server.close();
process.exit(code);
