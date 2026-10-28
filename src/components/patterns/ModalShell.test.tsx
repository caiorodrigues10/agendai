import { fireEvent, render, screen, within } from '@testing-library/react';
import { ModalShell } from './ModalShell';

describe('ModalShell interaction', () => {
  it('does not dismiss a pending operation via Escape, backdrop or close button', () => {
    const close = vi.fn();
    render(<ModalShell open loading title="Salvar" titleId="save-title" onClose={close} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Fechar' }));
    fireEvent.click(document.querySelector('button[aria-hidden="true"]')!);
    expect(close).not.toHaveBeenCalled();
  });

  it('only closes the top dialog and retains scroll lock while its parent remains', () => {
    const parentClose = vi.fn();
    const childClose = vi.fn();
    const { rerender, unmount } = render(
      <>
        <ModalShell open title="Cliente" titleId="client-title" onClose={parentClose} />
        <ModalShell open title="Confirmar" titleId="confirm-title" onClose={childClose} />
      </>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(childClose).toHaveBeenCalledOnce();
    expect(parentClose).not.toHaveBeenCalled();
    rerender(<ModalShell open title="Cliente" titleId="client-title" onClose={parentClose} />);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(parentClose).toHaveBeenCalledOnce();
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
