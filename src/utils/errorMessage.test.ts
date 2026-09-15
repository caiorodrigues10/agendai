import { describe, expect, it } from 'vitest';
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
});
