import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** Worker MSW para navegador (Storybook). Ativado por story via `parameters.msw`. */
export const worker = setupWorker(...handlers);
