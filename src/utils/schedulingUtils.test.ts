/// <reference types="vitest/globals" />
import { calendarDateKey, isSlotAvailable, mapAppointmentFromApi } from './schedulingUtils';

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

describe('mapAppointmentFromApi', () => {
  it('normaliza a data da API para o dia da agenda', () => {
    expect(calendarDateKey('2026-09-22T00:00:00.000Z')).toBe('2026-09-22');
    expect(calendarDateKey('2026-09-22')).toBe('2026-09-22');
    const mapped = mapAppointmentFromApi({
      id: 'a1',
      date: '2026-09-22T00:00:00.000Z',
      time: '10:00:00',
    });
    expect(mapped.date).toBe('2026-09-22');
    expect(mapped.time).toBe('10:00');
  });
});
