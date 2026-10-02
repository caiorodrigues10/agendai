import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Servidor MSW para testes Node (Vitest projeto `app`).
 * Uso num teste:
 *   import { server } from '../mocks/server';
 *   beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
 *   afterAll(() => server.close());
 *   afterEach(() => server.resetHandlers());
 */
export const server = setupServer(...handlers);
