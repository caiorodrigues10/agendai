import type { RequestHandler } from 'msw';

/**
 * Handlers HTTP compartilhados entre stories (MSW browser, via loader do
 * preview) e testes Node (`src/mocks/server.ts`).
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
