import { describe, expect, it } from 'vitest';
import { THEME_PRESETS } from './presets';
import {
  evaluateThemeContrast,
  failingContrastChecks,
} from '../../shared/pageThemeContrast';

describe('THEME_PRESETS', () => {
  it.each(THEME_PRESETS.map(p => [p.label, p] as const))(
    'preset %s passa no contraste WCAG AA',
    (_label, preset) => {
      const failing = failingContrastChecks(evaluateThemeContrast(preset.colors));
      expect(failing.map(f => `${f.key}=${f.ratio}`)).toEqual([]);
    }
  );

  it('tem chaves únicas', () => {
    const keys = THEME_PRESETS.map(p => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
