/**
 * Testes do ImportUploadStep — aceitação de imagem (OCR).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { ImportUploadStep } from './ImportUploadStep';
import { lerDimensoesImagem } from './ocrCaptura';

// O navegador de teste não decodifica imagem: a leitura da largura é
// simulada (o resto do módulo — dicas e mensagem — é o real).
vi.mock('./ocrCaptura', async (importOriginal) => {
  const original = await importOriginal<typeof import('./ocrCaptura')>();
  return {
    ...original,
    lerDimensoesImagem: vi.fn(async () => ({ larguraPx: 1200, alturaPx: 800 })),
  };
});

const mockedLerDimensoes = vi.mocked(lerDimensoesImagem);

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

const imagem = (nome = 'foto.png') => {
  const file = new File(['fake-png'], nome, { type: 'image/png' });
  Object.defineProperty(file, 'name', { value: nome });
  return file;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedLerDimensoes.mockResolvedValue({ larguraPx: 1200, alturaPx: 800 });
});

/** Escolhe um arquivo e espera a leitura da largura terminar. */
const selecionar = async (file: File) => {
  await act(async () => {
    fireEvent.change(screen.getByTestId('import-file-input'), {
      target: { files: [file] },
    });
  });
  await vi.waitFor(() => expect(mockedLerDimensoes).toHaveBeenCalledWith(file));
};

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
    const file = imagem();

    await selecionar(file);

    expect(screen.getByTestId('import-image-hint')).toBeInTheDocument();
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it('desabilita botão de modelos quando é imagem', async () => {
    renderStep();

    await selecionar(imagem());

    expect(
      screen.getByTestId('import-templates-toggle'),
    ).toBeDisabled();
  });

  it('mostra as dicas curtas de captura quando é imagem', async () => {
    renderStep();
    await selecionar(imagem());

    const dicas = await screen.findByTestId('import-image-dicas');
    expect(dicas).toHaveTextContent('Tabela inteira visível');
    expect(dicas).toHaveTextContent('Foto de frente');
    expect(dicas).toHaveTextContent('Boa luz, sem sombra');
    expect(dicas).toHaveTextContent('não fotografe a tela de outra foto');
  });

  it('mantém o aviso de que manuscrito pode ler mal e exige revisão', async () => {
    renderStep();
    await selecionar(imagem());

    const aviso = await screen.findByTestId('import-image-hint');
    expect(aviso).toHaveTextContent('Letra de mão pode ser lida errada');
    expect(aviso).toHaveTextContent('confira cada célula antes de confirmar');
  });

  it('avisa com mensagem específica quando a foto fica abaixo do piso', async () => {
    mockedLerDimensoes.mockResolvedValue({ larguraPx: 480, alturaPx: 640 });
    renderStep();
    await selecionar(imagem());

    const aviso = await screen.findByTestId('import-image-baixo-piso');
    expect(aviso).toHaveTextContent('480 px');
    expect(aviso).toHaveTextContent('mínimo para ler a tabela é 693 px');
    expect(aviso).toHaveTextContent('Tire a foto mais perto');
  });

  it('não avisa de piso quando a foto tem largura suficiente', async () => {
    mockedLerDimensoes.mockResolvedValue({ larguraPx: 1600, alturaPx: 900 });
    renderStep();
    await selecionar(imagem());

    await screen.findByTestId('import-image-dicas');
    await waitFor(() => {
      expect(screen.queryByTestId('import-image-baixo-piso')).not.toBeInTheDocument();
    });
  });

  it('não tenta ler a largura de planilha (só de imagem)', async () => {
    renderStep();
    const planilha = new File(['csv'], 'clientes.csv', { type: 'text/csv' });
    Object.defineProperty(planilha, 'name', { value: 'clientes.csv' });

    fireEvent.change(screen.getByTestId('import-file-input'), {
      target: { files: [planilha] },
    });

    expect(mockedLerDimensoes).not.toHaveBeenCalled();
  });
});
