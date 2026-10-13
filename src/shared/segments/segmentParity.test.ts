import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALL_SEGMENTS,
  AUDIENCE_OPTIONS,
  FIRST_CLASS_SEGMENTS,
  SEGMENT_CATALOGS,
  SEGMENT_CONFIGS,
  SEGMENT_LABEL_KEYS,
  SEGMENT_OPERATION_MODES,
  SEGMENT_SCHEDULE_PRESETS,
  SEGMENTS_BY_GROUP,
  audienceAppliesTo,
  getSegmentConfig,
  segmentSearchText,
} from './index';
import { ICON_OPTIONS, normalizeIconName } from '../../components/ui/DynamicIcon';

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

interface ParitySegment {
  group: string;
  labels: Record<string, string>;
  targetAudience: { applies: boolean; suggested: string | null };
  suggestedOperationMode: string;
  complianceNote: string | null;
  auxiliaryProfile: string | null;
  catalog: {
    serviceCategories: { name: string; icon: string }[];
    services: {
      name: string;
      price: number;
      avgTimeMinutes: number;
      icon: string;
      categoryName: string;
    }[];
  };
  schedulePreset: {
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }[];
}

interface ParityFile {
  labelKeys: string[];
  allSegments: string[];
  firstClassSegments: string[];
  segments: Record<string, ParitySegment>;
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

  it('tem os mesmos segmentos do backend (mesmo conjunto, qualquer ordem)', () => {
    const parity = readParity();
    expect(new Set(ALL_SEGMENTS)).toEqual(new Set(parity.allSegments));
    expect(new Set(FIRST_CLASS_SEGMENTS)).toEqual(new Set(parity.firstClassSegments));
  });

  it('tem os mesmos labels, group e targetAudience de cada segmento', () => {
    const parity = readParity();
    for (const segment of ALL_SEGMENTS) {
      const config = SEGMENT_CONFIGS[segment];
      expect(config, `segmento ${segment} ausente no frontend`).toBeDefined();
      const mirror = parity.segments[segment];
      expect(mirror, `segmento ${segment} ausente no backend`).toBeDefined();
      expect(config.group, `group de ${segment}`).toBe(mirror.group);
      expect(config.labels, `labels de ${segment}`).toEqual(mirror.labels);
      expect(config.targetAudience, `targetAudience de ${segment}`).toEqual(mirror.targetAudience);
    }
  });

  it('tem o mesmo modo sugerido, preset de horário e catálogo do backend', () => {
    const parity = readParity();
    for (const segment of ALL_SEGMENTS) {
      const mirror = parity.segments[segment];
      expect(mirror, `segmento ${segment} ausente no backend`).toBeDefined();
      expect(SEGMENT_OPERATION_MODES[segment], `modo de ${segment}`).toBe(
        mirror.suggestedOperationMode
      );
      expect(SEGMENT_SCHEDULE_PRESETS[segment], `schedulePreset de ${segment}`).toEqual(
        mirror.schedulePreset
      );
      expect(SEGMENT_CATALOGS[segment], `catalog de ${segment}`).toEqual(mirror.catalog);
    }
  });

  it('complianceNote e auxiliaryProfile espelhados do backend (null = sem)', () => {
    const parity = readParity();
    for (const segment of ALL_SEGMENTS) {
      const mirror = parity.segments[segment];
      expect(getSegmentConfig(segment).complianceNote ?? null, `complianceNote de ${segment}`).toBe(
        mirror.complianceNote
      );
      expect(getSegmentConfig(segment).auxiliaryProfile ?? null, `auxiliaryProfile de ${segment}`).toBe(
        mirror.auxiliaryProfile
      );
    }
  });

  it('catálogo do espelho é utilizável: sem duplicatas, horários válidos e ícones existentes', () => {
    for (const segment of ALL_SEGMENTS) {
      const { serviceCategories, services } = SEGMENT_CATALOGS[segment];
      expect(services.length, `${segment}: serviços de exemplo`).toBeGreaterThan(0);
      expect(serviceCategories.length, `${segment}: categorias`).toBeGreaterThan(0);

      const categoryNames = serviceCategories.map((c) => c.name);
      expect(new Set(categoryNames).size, `${segment}: categorias duplicadas`).toBe(
        categoryNames.length
      );
      const serviceNames = services.map((s) => s.name);
      expect(new Set(serviceNames).size, `${segment}: serviços duplicados`).toBe(serviceNames.length);

      for (const category of serviceCategories) {
        expect(
          ICON_OPTIONS,
          `${segment}: ícone de categoria "${category.icon}" fora do DynamicIcon`
        ).toContain(normalizeIconName(category.icon));
      }
      for (const service of services) {
        expect(
          categoryNames,
          `${segment}: categoryName "${service.categoryName}" sem categoria correspondente`
        ).toContain(service.categoryName);
        expect(service.avgTimeMinutes, `${segment}: "${service.name}" com duração inválida`).toBeGreaterThan(0);
        expect(
          ICON_OPTIONS,
          `${segment}: ícone "${service.icon}" fora do DynamicIcon`
        ).toContain(normalizeIconName(service.icon));
        expect(service.price, `${segment}: "${service.name}" com preço negativo`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('preset de horário tem os 7 dias, e nenhum horário aberto invertido', () => {
    for (const segment of ALL_SEGMENTS) {
      const preset = SEGMENT_SCHEDULE_PRESETS[segment];
      expect(preset.map((d) => d.dayOfWeek), `${segment}: dias`).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(
        preset.some((d) => d.isOpen),
        `${segment}: preset totalmente fechado`
      ).toBe(true);
      for (const day of preset.filter((d) => d.isOpen)) {
        expect(day.openTime < day.closeTime, `${segment}: dia ${day.dayOfWeek} invertido`).toBe(true);
      }
    }
  });
});

describe('config de segmento no frontend', () => {
  it('todos os 22 segmentos são oferecidos no cadastro, agrupados', () => {
    expect(FIRST_CLASS_SEGMENTS).toHaveLength(22);
    expect(new Set(FIRST_CLASS_SEGMENTS)).toEqual(new Set(ALL_SEGMENTS));
    // Cada segmento aparece em exatamente um grupo, e `other` é o último.
    const grouped = SEGMENTS_BY_GROUP.flatMap((g) => g.segments);
    expect(grouped).toHaveLength(22);
    expect(new Set(grouped)).toEqual(new Set(ALL_SEGMENTS));
    expect(SEGMENTS_BY_GROUP[SEGMENTS_BY_GROUP.length - 1].group).toBe('other');
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

  it('só beleza e bem-estar têm público; saúde/pet/auto/serviços/other não', () => {
    expect(audienceAppliesTo('PETSHOP')).toBe(false);
    expect(audienceAppliesTo('BARBERSHOP')).toBe(true);
    expect(audienceAppliesTo('HAIR_SALON')).toBe(true);
    expect(audienceAppliesTo('NAIL_STUDIO')).toBe(true);
    expect(audienceAppliesTo('MAKEUP_STUDIO')).toBe(true);
    expect(audienceAppliesTo('SPA')).toBe(true);
    // Nenhum segmento fora de beleza/bem-estar pergunta público.
    for (const s of ['PHYSIOTHERAPY', 'NUTRITION', 'PSYCHOTHERAPY', 'VETERINARY', 'CAR_WASH', 'AUTO_REPAIR', 'PHOTO_STUDIO', 'TATTOO_PIERCING', 'COACHING', 'PRIVATE_CLASSES', 'TECH_SUPPORT', 'HOME_SERVICES', 'OTHER'] as const) {
      expect(audienceAppliesTo(s), `${s} não deveria perguntar público`).toBe(false);
    }
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

  it('OTHER é o modo genérico: sem público, sem ficha auxiliar, sem compliance', () => {
    const other = getSegmentConfig('OTHER');
    expect(other.targetAudience.applies).toBe(false);
    expect(other.targetAudience.suggested).toBeNull();
    expect(other.auxiliaryProfile).toBeUndefined();
    expect(other.complianceNote).toBeUndefined();
  });

  it('segmentos de saúde carregam o aviso de que não é prontuário', () => {
    for (const s of ['PHYSIOTHERAPY', 'NUTRITION', 'PSYCHOTHERAPY'] as const) {
      expect(getSegmentConfig(s).complianceNote, `${s}: complianceNote`).toBeTruthy();
    }
  });

  it('ficha auxiliar: pet em veterinária; veículo em automotivo; nenhum em OTHER', () => {
    expect(getSegmentConfig('VETERINARY').auxiliaryProfile).toBe('pet');
    expect(getSegmentConfig('CAR_WASH').auxiliaryProfile).toBe('vehicle');
    expect(getSegmentConfig('AUTO_REPAIR').auxiliaryProfile).toBe('vehicle');
    expect(getSegmentConfig('BARBERSHOP').auxiliaryProfile).toBeUndefined();
    expect(getSegmentConfig('OTHER').auxiliaryProfile).toBeUndefined();
  });
});

describe('busca de segmento no cadastro', () => {
  it('vocabulário e aliases comuns são indexados em minúsculas', () => {
    expect(segmentSearchText('BARBERSHOP')).toContain('barbearia');
    expect(segmentSearchText('BARBERSHOP')).toBe(segmentSearchText('BARBERSHOP').toLowerCase());
  });

  it('termos do dia a dia acham o segmento certo', () => {
    expect(segmentSearchText('NAIL_STUDIO')).toContain('unha');
    expect(segmentSearchText('CAR_WASH')).toContain('carro');
    expect(segmentSearchText('AUTO_REPAIR')).toContain('carro');
    expect(segmentSearchText('PETSHOP')).toContain('tosa');
    expect(segmentSearchText('PRIVATE_CLASSES')).toContain('pilates');
  });

  it('todo segmento tem vocabulário indexável (nunca string vazia)', () => {
    for (const segment of ALL_SEGMENTS) {
      expect(segmentSearchText(segment).length, `${segment}: texto de busca`).toBeGreaterThan(0);
    }
  });
});
