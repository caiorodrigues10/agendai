/// <reference types="vitest/globals" />
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BusinessSegmentSection } from './BusinessSegmentSection';
import type { ShopSettings } from '../../types';

function baseSettings(patch: Partial<ShopSettings> = {}): ShopSettings {
  return {
    shopName: 'Salão Teste',
    whatsapp: '11999999999',
    schedule: [],
    businessSegment: 'BARBERSHOP',
    targetAudience: 'MASCULINO',
    ...patch,
  };
}

function setup(settings: ShopSettings) {
  const onSave = vi.fn(async () => undefined);
  const onNotify = vi.fn();
  render(
    <BusinessSegmentSection settings={settings} onSave={onSave} onNotify={onNotify} />
  );
  return { onSave, onNotify };
}

describe('BusinessSegmentSection', () => {
  it('avisa que trocar o tipo não apaga serviços existentes', () => {
    setup(baseSettings());
    expect(screen.getByText(/não apaga serviços, categorias ou clientes/i)).toBeInTheDocument();
  });

  it('oferece os 4 segmentos do cadastro e os legados', () => {
    setup(baseSettings());
    fireEvent.click(screen.getByRole('combobox', { name: 'Segmento' }));
    for (const label of ['Barbearia', 'Salão de cabelo', 'Manicure e nails', 'Petshop', 'Outro']) {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument();
    }
  });

  it('trocar para PETSHOP zera o público no payload salvo', async () => {
    const { onSave } = setup(baseSettings());
    fireEvent.click(screen.getByRole('combobox', { name: 'Segmento' }));
    fireEvent.click(screen.getByRole('option', { name: 'Petshop' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ businessSegment: 'PETSHOP', targetAudience: null })
    );
  });

  it('não mostra o seletor de público quando o segmento é PETSHOP', () => {
    setup(baseSettings({ businessSegment: 'PETSHOP', targetAudience: null }));
    expect(screen.queryByRole('combobox', { name: 'Público atendido' })).toBeNull();
  });

  it('mudar o público salva o par junto com o segmento atual', async () => {
    const { onSave } = setup(baseSettings());
    fireEvent.click(screen.getByRole('combobox', { name: 'Público atendido' }));
    fireEvent.click(screen.getByRole('option', { name: 'Unissex' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ businessSegment: 'BARBERSHOP', targetAudience: 'UNISSEX' })
    );
  });
});
