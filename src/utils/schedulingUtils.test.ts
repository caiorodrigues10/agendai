import { describe, it, expect } from 'vitest';
import { isSlotAvailable } from './schedulingUtils';

describe('isSlotAvailable', () => {
  it('qualquer profissional: indisponível se staffCount=0', () => {
    expect(isSlotAvailable('10:00', 'any', [], 0)).toBe(false);
  });

  it('qualquer profissional: livre se ocupação < staffCount', () => {
    expect(
      isSlotAvailable('10:00', 'any', [{ time: '10:00', staffId: 's1', durationMinutes: 30 }], 2)
    ).toBe(true);
  });

  it('qualquer profissional: ocupado se todos busy', () => {
    expect(
      isSlotAvailable(
        '10:00',
        'any',
        [
          { time: '10:00', staffId: 's1', durationMinutes: 30 },
          { time: '10:00', staffId: 's2', durationMinutes: 30 },
        ],
        2
      )
    ).toBe(false);
  });

  it('profissional específico: bloqueado por booking sem staff', () => {
    expect(
      isSlotAvailable('10:00', 's1', [{ time: '10:00', staffId: null, durationMinutes: 30 }], 3)
    ).toBe(false);
  });
});
