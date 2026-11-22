/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ModalShell } from './ModalShell';

// O mock global de FocusLock remove justamente o wrapper que participate do
// layout do fullscreen; este teste usa a implementação real.
vi.unmock('react-focus-lock');
vi.unmock('framer-motion');

function mediaQueryList(query: string, matches: boolean): MediaQueryList {
  return {
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

describe('ModalShell fullscreen geometry', () => {
  it('faz o wrapper real do FocusLock ocupar toda a área visível', async () => {
    render(
      <ModalShell
        open
        variant="fullscreen"
        title="Prévia da página"
        titleId="preview-fullscreen-title"
        onClose={() => undefined}
      />
    );

    const dialog = screen.getByRole('dialog', { name: 'Prévia da página' });
    const focusLock = dialog.parentElement;
    expect(focusLock).toHaveClass('h-full', 'min-h-0', 'w-full', 'min-w-0');
    expect(focusLock?.parentElement).toHaveClass('h-[100dvh]', 'w-[100dvw]');

    await waitFor(() => expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus());
  });

  it('aplica os safe areas uma vez e preserva um footer no fullscreen', () => {
    render(
      <ModalShell
        open
        variant="fullscreen"
        title="Prévia da página"
        titleId="preview-fullscreen-title"
        onClose={() => undefined}
        footer={<button type="button">Salvar prévia</button>}
      />
    );

    const dialog = screen.getByRole('dialog', { name: 'Prévia da página' });
    expect(dialog).toHaveClass(
      'pt-[env(safe-area-inset-top,0px)]',
      'pr-[env(safe-area-inset-right,0px)]',
      'pb-[env(safe-area-inset-bottom,0px)]',
      'pl-[env(safe-area-inset-left,0px)]'
    );
    expect(screen.getByRole('button', { name: 'Salvar prévia' })).toBeInTheDocument();
  });

  it('devolve o foco ao elemento que abriu o diálogo', async () => {
    const matchMedia = vi.mocked(window.matchMedia);
    matchMedia.mockImplementation(query => mediaQueryList(query, true));
    const trigger = document.createElement('button');
    trigger.type = 'button';
    document.body.appendChild(trigger);
    trigger.focus();

    try {
      const { rerender } = render(
        <ModalShell
          open
          variant="fullscreen"
          title="Prévia da página"
          titleId="preview-fullscreen-title"
          onClose={() => undefined}
        />
      );

      await waitFor(() => expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus());

      rerender(
        <ModalShell
          open={false}
          variant="fullscreen"
          title="Prévia da página"
          titleId="preview-fullscreen-title"
          onClose={() => undefined}
        />
      );

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
    } finally {
      trigger.remove();
      matchMedia.mockImplementation(query => mediaQueryList(query, false));
    }
  });

  it('libera o scroll e sinaliza a saída com movimento reduzido', async () => {
    const matchMedia = vi.mocked(window.matchMedia);
    matchMedia.mockImplementation(query => mediaQueryList(query, true));
    try {
      const onExitComplete = vi.fn();
      const { rerender } = render(
        <ModalShell
          open
          variant="fullscreen"
          title="Prévia da página"
          titleId="preview-fullscreen-title"
          onClose={() => undefined}
          onExitComplete={onExitComplete}
        />
      );
      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <ModalShell
          open={false}
          variant="fullscreen"
          title="Prévia da página"
          titleId="preview-fullscreen-title"
          onClose={() => undefined}
          onExitComplete={onExitComplete}
        />
      );
      expect(document.body.style.overflow).toBe('hidden');

      await waitFor(() => expect(onExitComplete).toHaveBeenCalledOnce());
      expect(document.body.style.overflow).toBe('');
    } finally {
      matchMedia.mockImplementation(query => mediaQueryList(query, false));
    }
  });
});
