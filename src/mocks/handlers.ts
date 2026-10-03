import type { RequestHandler } from 'msw';

/**
 * Handlers HTTP compartilhados entre stories (MSW browser, via loader do
 * preview). O servidor Node antigo (`src/mocks/server.ts`) foi removido na
 * Etapa 9 — testes mockiam por `vi.mock` ou `http` local.
 *
 * Uso na story:
 *   parameters: { msw: true }                       // worker ligado, sem handler
 *   parameters: { msw: { handlers: [...] } }        // handlers pontuais (resetados por story)
 *
 * Requests sem handler são bypassados — nunca bloqueiam chamadas reais.
 * Nenhum contrato HTTP do app é alterado por aqui.
 *
 * Exemplo ao criar a primeira story com HTTP:
 *   import { http, HttpResponse } from 'msw';
 *   export const handlers: RequestHandler[] = [
 *     http.get('/api/health', () => HttpResponse.json({ ok: true })),
 *   ];
 */
export const handlers: RequestHandler[] = [];
