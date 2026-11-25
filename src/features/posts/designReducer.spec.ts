import { describe, expect, it } from 'vitest';
import {
  compactDesignContent,
  compactDesignOverrides,
  createDesignState,
  designContentPayload,
  designOverridesPayload,
  designReducer,
} from './designReducer';

describe('designReducer', () => {
  it('trocar o design preserva conteúdo e overrides já customizados', () => {
    const initial = createDesignState({
      designKey: 'barbershop-ouro-escuro',
      designVersion: 1,
      designContent: { headline: 'Minha mensagem' },
      designOverrides: { textScale: 1.1 },
    });

    const next = designReducer(initial, {
      type: 'select-design',
      designKey: 'barbershop-editorial',
      designVersion: 2,
    });

    expect(next.designKey).toBe('barbershop-editorial');
    expect(next.designVersion).toBe(2);
    expect(next.designContent).toEqual({ headline: 'Minha mensagem' });
    expect(next.designOverrides).toEqual({ textScale: 1.1 });
  });

  it('preserva null explícito para suprimir fallback do servidor', () => {
    const state = designReducer(createDesignState(), {
      type: 'set-content-nullable-field',
      field: 'whatsapp',
      value: null,
    });

    expect(state.designContent.whatsapp).toBeNull();
    expect(compactDesignContent(state.designContent)).toEqual({ whatsapp: null });
  });

  it('trata string vazia como ausência e a remove do payload', () => {
    const state = designReducer(createDesignState(), {
      type: 'set-content-field',
      field: 'headline',
      value: '   ',
    });

    expect(state.designContent).not.toHaveProperty('headline');
    expect(designContentPayload(state)).toBeUndefined();
  });
});

describe('compactDesignContent', () => {
  it('omite campos vazios, mas preserva null e dados válidos', () => {
    const result = compactDesignContent({
      businessName: '  Barbearia Central  ',
      headline: '',
      whatsapp: null,
      instagram: '   ',
      address: 'Rua Central',
      services: [
        { name: ' Corte ', price: 45 },
        { name: '', price: 10 },
      ],
      promo: {
        kind: 'percent',
        percent: 15,
        promoLabel: '  de desconto ',
      },
      focal: { x: 0.25, y: 0.75 },
    });

    expect(result).toEqual({
      businessName: 'Barbearia Central',
      whatsapp: null,
      address: 'Rua Central',
      services: [{ name: 'Corte', price: 45 }],
      promo: {
        kind: 'percent',
        percent: 15,
        promoLabel: 'de desconto',
      },
      focal: { x: 0.25, y: 0.75 },
    });
    expect(result).not.toHaveProperty('headline');
    expect(result).not.toHaveProperty('instagram');
  });

  it('descarta promoção incompleta e serviços sem nome', () => {
    expect(compactDesignContent({
      promo: { kind: 'percent' },
      services: [{ name: '  ' }],
    })).toBeUndefined();
  });
});

describe('compactDesignOverrides', () => {
  it('mantém somente overrides compatíveis com o schema do servidor', () => {
    const result = compactDesignOverrides({
      colors: { bg: '#112233', accent: 'vermelho' },
      fontPair: 'anton-barlow',
      textScale: 1.2,
      align: 'center',
      visible: { headline: false, cta: true },
      background: {
        kind: 'gradient',
        stops: [
          { color: '#000000', at: 0 },
          { color: '#FFFFFF', at: 1 },
          { color: '#invalid', at: 2 },
        ],
        angle: 90,
      },
      logo: { src: null, shape: 'round' },
      contacts: { whatsapp: null, instagram: ' @empresa ' },
      qr: { data: '  https://agendai.app/s/123  ', enabled: true },
      nudge: {
        headline: { dx: 12, dy: -8, scale: 1.1 },
        invalido: { dx: 900, dy: 0, scale: 1 },
      },
    });

    expect(result).toEqual({
      colors: { bg: '#112233' },
      fontPair: 'anton-barlow',
      textScale: 1.2,
      align: 'center',
      visible: { headline: false },
      background: {
        kind: 'gradient',
        stops: [
          { color: '#000000', at: 0 },
          { color: '#FFFFFF', at: 1 },
        ],
        angle: 90,
      },
      logo: { src: null, shape: 'round' },
      contacts: { whatsapp: null, instagram: '@empresa' },
      qr: { data: 'https://agendai.app/s/123', enabled: true },
      nudge: { headline: { dx: 12, dy: -8, scale: 1.1 } },
    });
  });

  it('remove propriedades vazias e devolve undefined quando não sobra override', () => {
    expect(compactDesignOverrides({
      colors: { bg: '' },
      fontPair: undefined,
      textScale: 9,
      visible: { headline: true },
      logo: { src: '' },
      contacts: { whatsapp: '' },
      qr: { data: '  ' },
    })).toBeUndefined();
    expect(designOverridesPayload(createDesignState())).toBeUndefined();
  });
});
