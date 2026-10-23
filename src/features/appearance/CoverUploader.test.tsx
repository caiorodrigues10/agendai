/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CoverUploader } from './CoverUploader';

function stubBitmap(width: number, height: number) {
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(async () => ({ width, height, close: vi.fn() }))
  );
}

function fileFrom(name: string, type: string, size = 2048): File {
  return new File([new Uint8Array(size)], name, { type });
}

function renderUploader(overrides: Partial<React.ComponentProps<typeof CoverUploader>> = {}) {
  const props: React.ComponentProps<typeof CoverUploader> = {
    coverUrl: null,
    overlay: 40,
    onOverlayChange: vi.fn(),
    onUpload: vi.fn(() => Promise.resolve()),
    onDelete: vi.fn(() => Promise.resolve()),
    ...overrides,
  };
  render(<CoverUploader {...props} />);
  return props;
}

function selectFile(file: File) {
  const input = screen.getByTestId('cover-file-input');
  fireEvent.change(input, { target: { files: [file] } });
}

describe('CoverUploader', () => {
  beforeAll(() => {
    // jsdom não implementa createObjectURL (usado só na pré-visualização local)
    if (!URL.createObjectURL) {
      Object.defineProperty(URL, 'createObjectURL', { value: () => 'blob:preview', writable: true });
      Object.defineProperty(URL, 'revokeObjectURL', { value: () => undefined, writable: true });
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('mostra as instruções de dimensão ANTES de o dono escolher o arquivo', () => {
    renderUploader();
    const guide = screen.getByTestId('cover-guide');
    expect(guide.textContent).toContain('1920×1080');
    expect(guide.textContent).toContain('16:9');
    expect(guide.textContent).toContain('Qualquer outra medida é aceita');
  });

  it('aceita medida fora do ideal com aviso e não envia antes de "Enviar capa"', async () => {
    stubBitmap(1200, 800);
    const props = renderUploader();
    selectFile(fileFrom('capa.png', 'image/png'));

    await screen.findByTestId('cover-pending');
    const warnings = await screen.findAllByTestId('cover-warning');
    expect(warnings.map(w => w.textContent).join(' ')).toContain('1200×800');
    expect(screen.queryByTestId('cover-error')).toBeNull();
    expect(props.onUpload).not.toHaveBeenCalled();
    expect(screen.queryByTestId('cover-pending')).not.toBeNull();
  });

  it('aceita proporção fora do 16:9 com aviso e não envia antes da confirmação', async () => {
    stubBitmap(1920, 1200);
    const props = renderUploader();
    selectFile(fileFrom('capa.png', 'image/png'));

    const warnings = await screen.findAllByTestId('cover-warning');
    expect(warnings.map(w => w.textContent).join(' ')).toContain('16:9');
    expect(screen.queryByTestId('cover-error')).toBeNull();
    expect(props.onUpload).not.toHaveBeenCalled();
  });

  it('aceita a capa válida e só envia ao clicar em "Enviar capa"', async () => {
    stubBitmap(1920, 1080);
    const props = renderUploader();
    selectFile(fileFrom('capa-oficial.png', 'image/png'));

    await screen.findByTestId('cover-pending');
    expect(props.onUpload).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('cover-send'));
    await waitFor(() => expect(props.onUpload).toHaveBeenCalledTimes(1));
    const [file] = vi.mocked(props.onUpload).mock.calls[0];
    expect(file.name).toBe('capa-oficial.png');
  });

  it('mostra o erro do servidor sem perder a página', async () => {
    stubBitmap(1920, 1080);
    renderUploader({
      onUpload: vi.fn(() => Promise.reject(new Error('Falha ao enviar a capa (502)'))),
    });
    selectFile(fileFrom('capa.png', 'image/png'));
    fireEvent.click(await screen.findByTestId('cover-send'));

    const alert = await screen.findByTestId('cover-error');
    expect(alert.textContent).toContain('502');
  });

  it('renderiza a capa atual com botão de remover', () => {
    renderUploader({
      coverUrl: 'https://res.cloudinary.com/demo/image/upload/agendaja/1/cover/cover',
    });
    expect(screen.getByTestId('cover-current')).toBeInTheDocument();
    expect(screen.getByTestId('cover-delete')).toBeInTheDocument();
  });

  it('ajusta o overlay (0–80%) via slider', () => {
    const props = renderUploader();
    fireEvent.change(screen.getByTestId('cover-overlay'), { target: { value: '60' } });
    expect(props.onOverlayChange).toHaveBeenCalledWith(60);
  });
});
