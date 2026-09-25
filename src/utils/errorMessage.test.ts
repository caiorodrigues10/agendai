/// <reference types="vitest/globals" />
import { ApiError } from '../infra/apiClient';
import { getErrorMessage } from './errorMessage';

describe('getErrorMessage', () => {
  it('converts raw zod date errors into friendly copy', () => {
    const error = new ApiError(
      '[{"code":"invalid_date","path":["date"],"message":"Invalid date"}]',
      400
    );

    expect(getErrorMessage(error)).toBe('Data inválida. Ajuste o período e tente novamente.');
  });

  it('converts raw zod limit errors into friendly copy', () => {
    const error = new ApiError(
      '[{"code":"too_big","maximum":100,"path":["limit"],"message":"Number must be less than or equal to 100"}]',
      400
    );

    expect(getErrorMessage(error)).toBe('O limite máximo permitido é 100 registros por vez.');
  });

  it('hides raw prisma messages from the interface', () => {
    const error = new Error(
      "Invalid `prisma.profitEntry.findMany()` invocation: Unknown field `service`"
    );

    expect(getErrorMessage(error)).toBe(
      'Não foi possível carregar estes dados agora. Tente novamente em instantes.'
    );
  });

  it('falls back to friendly upgrade copy when DASHBOARD_REQUIRED has no message', () => {
    const error = new ApiError('   ', 403, 'DASHBOARD_REQUIRED');

    expect(getErrorMessage(error)).toBe(
      'Seu plano não inclui dashboard de relatórios e financeiro. Faça upgrade para o Pro.'
    );
  });

  it('keeps the backend DASHBOARD_REQUIRED message when it is already friendly', () => {
    const error = new ApiError(
      'Seu plano não inclui dashboard de relatórios e financeiro. Faça upgrade para o Pro.',
      403,
      'DASHBOARD_REQUIRED'
    );

    expect(getErrorMessage(error)).toBe(
      'Seu plano não inclui dashboard de relatórios e financeiro. Faça upgrade para o Pro.'
    );
  });

  it('maps SESSION_EXPIRED to a re-login copy', () => {
    const error = new ApiError('Token inválido', 401, 'SESSION_EXPIRED');

    expect(getErrorMessage(error)).toBe('Sua sessão expirou. Faça login novamente.');
  });
});
