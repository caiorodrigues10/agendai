/// <reference types="vitest/globals" />
import { unwrapData, unwrapList } from './apiData';

describe('unwrapList', () => {
  it('returns a bare array', () => {
    expect(unwrapList([1, 2])).toEqual([1, 2]);
  });

  it('unwraps data arrays', () => {
    expect(unwrapList({ success: true, data: [{ id: 'a' }] })).toEqual([{ id: 'a' }]);
  });

  it('unwraps paginated items without calling .map on the envelope', () => {
    const payload = { success: true, data: { items: [{ id: 'w' }], total: 1, page: 1, limit: 20 } };
    expect(unwrapList(payload)).toEqual([{ id: 'w' }]);
  });

  it('returns an empty array for objects without a list', () => {
    expect(unwrapList({ success: true, data: { total: 0 } })).toEqual([]);
    expect(unwrapList(null)).toEqual([]);
  });
});

describe('unwrapData', () => {
  it('reads the data field', () => {
    expect(unwrapData({ data: { total: 3 } })).toEqual({ total: 3 });
  });
});
