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

test('fails closed on unknown URL expressions and dynamic methods', t => {
  for (const [index, source] of ['apiClient(dynamicUrl)', 'apiClient("/api/a", method)', 'apiClient(`/api/items${suffix}`)'].entries()) {
    const root = fixture(t, { [`${index}.ts`]: source });
    assert.throws(() => frontendRequests(path.join(root, `${index}.ts`)), /suportad|ambígua/);
  }
});
