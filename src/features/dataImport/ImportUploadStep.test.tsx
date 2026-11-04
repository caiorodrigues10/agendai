/**
 * Testes do ImportUploadStep — aceitação de imagem (OCR).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ImportUploadStep } from './ImportUploadStep';

const onUpload = vi.fn();

const renderStep = (props?: Partial<React.ComponentProps<typeof ImportUploadStep>>) =>
  render(
    <ImportUploadStep
      barbershopId="shop-1"
      busy={false}
      onUpload={onUpload}
      {...props}
    />,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ImportUploadStep', () => {
  it('aceita imagens .png/.jpg/.jpeg/.webp além de planilhas', () => {
    renderStep();
    const input = screen.getByTestId('import-file-input');
    expect(input.getAttribute('accept')).toContain('.png');
    expect(input.getAttribute('accept')).toContain('.jpg');
    expect(input.getAttribute('accept')).toContain('.jpeg');
    expect(input.getAttribute('accept')).toContain('.webp');
    expect(input.getAttribute('accept')).toContain('.xlsx');
  });

  it('mostra aviso de OCR ao selecionar imagem', async () => {
    renderStep();
    const input = screen.getByTestId('import-file-input');

    const file = new File(['fake-png'], 'foto.png', { type: 'image/png' });
    Object.defineProperty(file, 'name', { value: 'foto.png' });

    fireEvent.change(input, { target: { files: [file] } });

    await vi.waitFor(() => {
      expect(screen.getByTestId('import-image-hint')).toBeInTheDocument();
    });
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it('desabilita botão de modelos quando é imagem', () => {
    renderStep();
    const input = screen.getByTestId('import-file-input');

    const file = new File(['fake-png'], 'foto.png', { type: 'image/png' });
    Object.defineProperty(file, 'name', { value: 'foto.png' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(
      screen.getByTestId('import-templates-toggle'),
    ).toBeDisabled();
  });
});
