import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { backendRoutes, frontendRequests } from './check-api-contract.mjs';

function fixture(t, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agendai-contract-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [name, source] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), source);
  }
  return root;
}

test('compares registered routes, prefix and method; detects endpoint drift', t => {
  const root = fixture(t, {
    'src/shared/infra/http/app.ts': 'app.register(apiRoutes, { prefix: "/api" });',
    'src/shared/infra/http/routes/api.ts': 'import { authRoutes } from "./auth.routes"; async function apiRoutes(app) { await authRoutes(app); }',
    'src/shared/infra/http/routes/auth.routes.ts': 'function authRoutes(app) { app.post("/auth/login", handler); app.get("/shops/:shopId", handler); }',
    'src/shared/infra/http/routes/unused.routes.ts': 'app.get("/not-registered", handler);',
    'wrapper.ts': 'apiClient(`/api/shops/${id}?page=${page}`); apiClient("/api/auth/login", "POST"); apiClient("/api/auth/login", "GET"); apiClient("/api/not-registered");',
  });
  const routes = backendRoutes(root);
  const requests = frontendRequests(path.join(root, 'wrapper.ts'));
  assert.deepEqual(requests.map(request => routes.has(request.key)), [true, true, false, false]);
  fs.writeFileSync(path.join(root, 'src/shared/infra/http/routes/auth.routes.ts'), 'app.post("/auth/sign-in", handler);');
  assert.equal(backendRoutes(root).has(requests[1].key), false);
});

test('expands factories, query suffixes, multipart and default GET', t => {
  const root = fixture(t, { 'wrapper.ts': `
    function categoryApi(path: string) { return apiClient(\x60\x24{path}/\x24{id}\x24{buildQuery(params)}\x60, 'PATCH'); }
    categoryApi('/api/a'); categoryApi('/api/b');
    apiFetch('/api/upload', { method: 'POST' });
    apiClient(\x60/api/items\x24{enabled ? '?all=true' : ''}\x60);
  ` });
  assert.deepEqual(frontendRequests(path.join(root, 'wrapper.ts')).map(r => r.key),
    ['PATCH /api/a/{}', 'PATCH /api/b/{}', 'POST /api/upload', 'GET /api/items']);
});

test('skips fetch(url) when url is the enclosing transport parameter', t => {
  const root = fixture(t, { 'wrapper.ts': `
    async function clientFetch(url: string, init?: RequestInit) {
      return fetch(url, init);
    }
    clientFetch('/api/client/portal/me');
    fetch('/api/client/portal/refresh', { method: 'POST' });
  ` });
  assert.deepEqual(frontendRequests(path.join(root, 'wrapper.ts')).map(r => r.key),
    ['GET /api/client/portal/me', 'POST /api/client/portal/refresh']);
});

test('fails closed on unknown URL expressions and dynamic methods', t => {
  for (const [index, source] of ['apiClient(dynamicUrl)', 'apiClient("/api/a", method)', 'apiClient(`/api/items${suffix}`)'].entries()) {
    const root = fixture(t, { [`${index}.ts`]: source });
    assert.throws(() => frontendRequests(path.join(root, `${index}.ts`)), /suportad|ambígua/);
  }
});

test('resolves local path helpers as arguments and template spans', t => {
  const root = fixture(t, { 'wrapper.ts': `
    const base = (id) => \x60/api/shops/\${encodeURIComponent(id)}\x60;
    const postPath = (id, pid) => \x60\${base(id)}/posts/\${encodeURIComponent(pid)}\x60;
    apiClient(postPath(id, pid));
    apiClient(\x60\${postPath(id, pid)}/comments?page=\${page}\x60);
    apiClient(\x60\${base(id)}/stories\x60);
  ` });
  assert.deepEqual(frontendRequests(path.join(root, 'wrapper.ts')).map(r => r.key),
    ['GET /api/shops/{}/posts/{}', 'GET /api/shops/{}/posts/{}/comments', 'GET /api/shops/{}/stories']);
});

test('expande segmento final dinâmico tipado como union local', t => {
  const root = fixture(t, {
    'src/shared/infra/http/app.ts': 'app.register(apiRoutes, { prefix: "/api" });',
    'src/shared/infra/http/routes/api.ts':
      'import { accountRoutes } from "./account.routes"; async function apiRoutes(app) { await accountRoutes(app); }',
    'src/shared/infra/http/routes/account.routes.ts':
      'function accountRoutes(app) { app.post("/admin/accounts/:id/suspend", h); app.post("/admin/accounts/:id/approve", h); }',
    'wrapper.ts': [
      "export type AccountAction = 'suspend' | 'approve';",
      'const api = {',
      '  accountAction(id: string, action: AccountAction) {',
      '    return apiClient(\x60/api/admin/accounts/\${id}/\${action}\x60, "POST");',
      '  },',
      '};',
    ].join('\n'),
  });
  const requests = frontendRequests(path.join(root, 'wrapper.ts'));
  assert.deepEqual(requests.map(request => request.key), [
    'POST /api/admin/accounts/{}/suspend',
    'POST /api/admin/accounts/{}/approve',
  ]);
  const routes = backendRoutes(root);
  assert.deepEqual(requests.map(request => routes.has(request.key)), [true, true]);
});

test('sem union declarada o segmento final dinâmico segue caindo como antes', t => {
  const root = fixture(t, { 'wrapper.ts': `
    const api = {
      accountAction(id: string, action: string) {
        return apiClient(\x60/api/admin/accounts/\${id}/\${action}\x60, "POST");
      },
    };
  ` });
  assert.deepEqual(frontendRequests(path.join(root, 'wrapper.ts')).map(r => r.key),
    ['POST /api/admin/accounts/{}/{}']);
});

test('follows nested route delegations and const-string template URLs', t => {
  const root = fixture(t, {
    'src/shared/infra/http/app.ts': 'app.register(apiRoutes, { prefix: "/api" });',
    'src/shared/infra/http/routes/api.ts': 'import { feedRoutes } from "./feed.routes"; async function apiRoutes(app) { await feedRoutes(app); }',
    'src/shared/infra/http/routes/feed.routes.ts': [
      'import { socialRoutes } from "@/modules/feed/social.routes";',
      'export async function feedRoutes(app) { await socialRoutes(app); app.get("/feed", handler); }',
    ].join('\n'),
    'src/modules/feed/social.routes.ts': [
      'export async function socialRoutes(app) {',
      '  const base = "/salons/:salonId";',
      '  app.get(`${base}/posts/:postId`, handler);',
      '  app.post(`${base}/stories`, handler);',
      '}',
    ].join('\n'),
  });
  const routes = backendRoutes(root);
  assert.ok(routes.has('GET /api/feed'));
  assert.ok(routes.has('GET /api/salons/{}/posts/{}'));
  assert.ok(routes.has('POST /api/salons/{}/stories'));
});
