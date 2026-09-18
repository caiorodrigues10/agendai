/// <reference types="vitest/globals" />
import { buildQuery } from './query';

describe('buildQuery', () => {
  it('omits empty values while preserving false and zero', () => {
    expect(buildQuery({ search: '', page: 0, active: false, ignored: undefined, nullValue: null })).toBe(
      '?page=0&active=false'
    );
  });

  it('encodes values with URLSearchParams', () => {
    expect(buildQuery({ search: 'corte & escova' })).toBe('?search=corte+%26+escova');
  });
});
