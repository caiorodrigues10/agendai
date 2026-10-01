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

  it('keeps the backend message for RESERVATION_LIMIT_REACHED', () => {
    const error = new ApiError(
      'Você já tem 3 reservas abertas neste salão. Retire ou cancele antes de reservar de novo.',
      409,
      'RESERVATION_LIMIT_REACHED'
    );

    expect(getErrorMessage(error)).toBe(
      'Você já tem 3 reservas abertas neste salão. Retire ou cancele antes de reservar de novo.'
    );
  });

  it('falls back when RESERVATION_FINALIZED arrives without a message', () => {
    const error = new ApiError('  ', 409, 'RESERVATION_FINALIZED');

    expect(getErrorMessage(error)).toBe(
      'Esta reserva já foi finalizada e não pode ser alterada.'
    );
  });

  it('keeps the backend message for PRODUCT_HAS_HISTORY', () => {
    const error = new ApiError(
      'Este produto já tem histórico de estoque ou vendas. Use Inativar para mantê-lo fora das listas.',
      409,
      'PRODUCT_HAS_HISTORY'
    );

    expect(getErrorMessage(error)).toBe(
      'Este produto já tem histórico de estoque ou vendas. Use Inativar para mantê-lo fora das listas.'
    );
  });

  it('keeps the backend message for PRODUCT_HAS_OPEN_RESERVATIONS', () => {
    const error = new ApiError(
      'Este produto tem reservas em aberto. Aguarde a retirada ou peça o cancelamento antes de apagar.',
      409,
      'PRODUCT_HAS_OPEN_RESERVATIONS'
    );

    expect(getErrorMessage(error)).toBe(
      'Este produto tem reservas em aberto. Aguarde a retirada ou peça o cancelamento antes de apagar.'
    );
  });
});
