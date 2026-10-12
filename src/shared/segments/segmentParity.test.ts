import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALL_SEGMENTS,
  AUDIENCE_OPTIONS,
  FIRST_CLASS_SEGMENTS,
  SEGMENT_CONFIGS,
  SEGMENT_LABEL_KEYS,
  audienceAppliesTo,
  getSegmentConfig,
} from './index';
import { ICON_OPTIONS } from '../../components/ui/DynamicIcon';

/**
 * Os pacotes são separados (backend/ e frontend/), então a paridade de
 * vocabulário não vem de um import compartilhado — vem deste teste.
 *
 * O backend publica `segmentParity.json`; se as chaves divergirem daqui, o
 * teste reprova. O caminho segue a mesma convenção de
 * `scripts/check-api-contract.mjs` (API_CONTRACT_BACKEND ou ../backend).
 */
// Raiz do pacote frontend: este arquivo está em src/shared/segments, então
// são 3 níveis até a pasta do pacote.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const backend = path.resolve(
  process.env.API_CONTRACT_BACKEND || path.join(root, '../backend')
);
const parityPath = path.join(backend, 'src/shared/segments/segmentParity.json');

interface ParityFile {
  labelKeys: string[];
  allSegments: string[];
  firstClassSegments: string[];
  segments: Record<
    string,
    { firstClass: boolean; labels: Record<string, string>; targetAudience: { applies: boolean; suggested: string | null } }
  >;
}

function readParity(): ParityFile {
  return JSON.parse(fs.readFileSync(parityPath, 'utf8'));
}

describe('paridade com o backend', () => {
  it('consegue ler o segmentParity.json do backend irmão', () => {
    expect(
      fs.existsSync(parityPath),
      `Backend não encontrado em "${backend}" (esperado ${parityPath}). ` +
        'Defina API_CONTRACT_BACKEND com o caminho da pasta do backend.'
    ).toBe(true);
  });

  it('tem as mesmas label keys do backend', () => {
    expect([...SEGMENT_LABEL_KEYS]).toEqual(readParity().labelKeys);
  });

  it('tem os mesmos segmentos do backend', () => {
    const parity = readParity();
    expect([...ALL_SEGMENTS]).toEqual(parity.allSegments);
    expect([...FIRST_CLASS_SEGMENTS]).toEqual(parity.firstClassSegments);
  });

  it('tem os mesmos labels, firstClass e targetAudience de cada segmento', () => {
    const parity = readParity();
    for (const segment of ALL_SEGMENTS) {
      const config = SEGMENT_CONFIGS[segment];
      expect(config, `segmento ${segment} ausente no frontend`).toBeDefined();
      expect(parity.segments[segment].firstClass, `firstClass de ${segment}`).toBe(config.firstClass);
      expect(config.labels, `labels de ${segment}`).toEqual(parity.segments[segment].labels);
      expect(config.targetAudience, `targetAudience de ${segment}`).toEqual(
        parity.segments[segment].targetAudience
      );
    }
  });
});

describe('config de segmento no frontend', () => {
  it('os 4 segmentos do cadastro são os first-class, na ordem pedida', () => {
    expect([...FIRST_CLASS_SEGMENTS]).toEqual(['BARBERSHOP', 'HAIR_SALON', 'NAIL_STUDIO', 'PETSHOP']);
  });

  it('todo segmento tem ícone e descrição de card', () => {
    for (const segment of ALL_SEGMENTS) {
      const config = SEGMENT_CONFIGS[segment];
      expect(config.icon, `${segment}: ícone`).toBeTruthy();
      expect(config.cardDescription.length, `${segment}: descrição`).toBeGreaterThan(10);
    }
  });

  it('os ícones dos cards existem no DynamicIcon', () => {
    // DynamicIcon cai no fallback Scissors para nome desconhecido, então um
    // typo viraria tesoura em silêncio e o teste de unidade nunca reprovaria.
    for (const segment of ALL_SEGMENTS) {
      expect(
        ICON_OPTIONS,
        `${segment}: "${SEGMENT_CONFIGS[segment].icon}" não está em ICON_OPTIONS`
      ).toContain(SEGMENT_CONFIGS[segment].icon);
    }
  });

  it('PETSHOP não tem público; os de beleza têm', () => {
    expect(audienceAppliesTo('PETSHOP')).toBe(false);
    expect(audienceAppliesTo('BARBERSHOP')).toBe(true);
    expect(audienceAppliesTo('HAIR_SALON')).toBe(true);
    expect(audienceAppliesTo('NAIL_STUDIO')).toBe(true);
  });

  it('sugere MASCULINO para barbearia, como pedido', () => {
    expect(getSegmentConfig('BARBERSHOP').targetAudience.suggested).toBe('MASCULINO');
  });

  it('sugere FEMININO/UNISSEX para nails, sem obrigar', () => {
    const suggested = getSegmentConfig('NAIL_STUDIO').targetAudience.suggested;
    expect(['FEMININO', 'UNISSEX']).toContain(suggested);
  });

  it('as opções de público cobrem os 3 valores do enum', () => {
    expect(AUDIENCE_OPTIONS.map((o) => o.value)).toEqual(['MASCULINO', 'FEMININO', 'UNISSEX']);
    expect(AUDIENCE_OPTIONS.every((o) => o.label.length > 0)).toBe(true);
  });

  it('cai no fallback OTHER para segmento desconhecido', () => {
    expect(getSegmentConfig(null).segment).toBe('OTHER');
    expect(getSegmentConfig('INEXISTENTE' as never).segment).toBe('OTHER');
  });
});
