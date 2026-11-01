/// <reference types="vitest/globals" />
import { SEGMENT_GATE_CONFIG, getSegmentGate, isModuleEnabled, isTabEnabled } from './segmentGate';

describe('segmentGate (frontend)', () => {
  it('LAW_FIRM esconde produtos, equipamento, comissões e gorjeta', () => {
    expect(getSegmentGate('LAW_FIRM').hiddenTabs).toEqual(['products', 'equipment']);
    expect(isModuleEnabled('LAW_FIRM', 'products')).toBe(false);
    expect(isModuleEnabled('LAW_FIRM', 'equipment')).toBe(false);
    expect(isModuleEnabled('LAW_FIRM', 'commissions')).toBe(false);
    expect(isModuleEnabled('LAW_FIRM', 'tip')).toBe(false);
  });

  it('segmento sem gate libera tudo', () => {
    expect(getSegmentGate('BARBERSHOP').hiddenTabs).toEqual([]);
    expect(getSegmentGate(null).hiddenModules).toEqual([]);
    expect(isTabEnabled(undefined, 'products')).toBe(true);
    expect(isModuleEnabled('BARBERSHOP', 'commissions')).toBe(true);
  });

  it('o gate é declarado por segmento, sem if/else espalhado', () => {
    expect(Object.keys(SEGMENT_GATE_CONFIG)).toEqual(['LAW_FIRM']);
  });
});
