/// <reference types="vitest/globals" />
import React from 'react';
import { renderHook } from '@testing-library/react';
import { BarbershopContext } from '../contexts/BarbershopContext';
import { useSegmentLabels } from './useSegmentLabels';

function wrapperWithSettings(settings: unknown) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BarbershopContext.Provider value={{ settings } as never}>
        {children}
      </BarbershopContext.Provider>
    );
  };
}

describe('useSegmentLabels', () => {
  it('sem provider cai no vocabulário genérico de OTHER (fallback único do app)', () => {
    const { result } = renderHook(() => useSegmentLabels());
    expect(result.current.segment).toBe('OTHER');
    expect(result.current.rawSegment).toBeNull();
    expect(result.current.labels.professional).toBeTruthy();
    expect(result.current.config.targetAudience.applies).toBe(false);
  });

  it('lê o segmento e o público do salão no contexto', () => {
    const { result } = renderHook(() => useSegmentLabels(), {
      wrapper: wrapperWithSettings({ businessSegment: 'PETSHOP', targetAudience: null }),
    });
    expect(result.current.segment).toBe('PETSHOP');
    expect(result.current.labels.client).toBe('tutor(a)');
    expect(result.current.targetAudience).toBeNull();
  });

  it('override vence o contexto (resumo no cadastro, preview no wizard)', () => {
    const { result } = renderHook(() => useSegmentLabels('NAIL_STUDIO'), {
      wrapper: wrapperWithSettings({
        businessSegment: 'BARBERSHOP',
        targetAudience: 'MASCULINO',
      }),
    });
    expect(result.current.rawSegment).toBe('NAIL_STUDIO');
    expect(result.current.labels.professional).toBe('manicure');
    // O público continua o do salão: o override muda só o vocabulário.
    expect(result.current.targetAudience).toBe('MASCULINO');
  });

  it('OTHER explícito fica OTHER (só o fallback sem salão é barbearia)', () => {
    const { result } = renderHook(() => useSegmentLabels(), {
      wrapper: wrapperWithSettings({ businessSegment: 'OTHER' }),
    });
    expect(result.current.segment).toBe('OTHER');
    expect(result.current.labels.shopNoun).toBeTruthy();
  });

  it('segmento fora do enum nunca quebra a UI', () => {
    const { result } = renderHook(() => useSegmentLabels(), {
      wrapper: wrapperWithSettings({ businessSegment: 'PETSHOPPING' }),
    });
    expect(result.current.segment).toBe('OTHER');
  });

  it('o vocabulário de HAIR_SALON usa cabeleireiro e UNISSEX como sugerido', () => {
    const { result } = renderHook(() => useSegmentLabels('HAIR_SALON'));
    expect(result.current.labels.professional).toBe('cabeleireiro(a)');
    expect(result.current.config.targetAudience.suggested).toBe('UNISSEX');
  });
});
