/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AuditDetailModal, maskSensitiveJson } from './AuditDetailModal';
import type { AuditLog } from '../../infra/adminApi';

const log: AuditLog = {
  id: 'log-1',
  userId: 'user-1',
  action: 'POST /api/auth/login',
  resource: 'auth',
  resourceId: null,
  details: '{"password":"s3cr3t","token":"abc","user":{"cpf":"111.222.333-44","name":"Ana"}}',
  ipAddress: '10.0.0.1',
  createdAt: '2026-10-03T10:00:00.000Z',
};

describe('maskSensitiveJson compatibility export', () => {
  it('masks nested sensitive keys and keeps non-sensitive values', () => {
    const masked = maskSensitiveJson(log.details);
    expect(masked).not.toContain('s3cr3t');
    expect(masked).not.toContain('abc');
    expect(masked).not.toContain('111.222.333-44');
    expect(masked).toContain('"name": "Ana"');
    expect(masked).toContain('•••••');
  });

  it('redacts malformed JSON and supports empty details', () => {
    const masked = maskSensitiveJson('payload quebrado {"password":"hunter2","token":"abc123"}');
    expect(masked).not.toContain('hunter2');
    expect(masked).not.toContain('abc123');
    expect(maskSensitiveJson(null)).toBe('Sem detalhes.');
  });
});

describe('AuditDetailModal', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows readable names and keeps technical data collapsed by default', () => {
    const onClose = vi.fn();
    render(
      <AuditDetailModal
        log={log}
        onClose={onClose}
        users={[{ id: 'user-1', name: 'Administrador', email: 'admin@example.test' }]}
      />
    );

    const dialog = screen.getByRole('dialog', { name: 'Detalhes do registro' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByText('Acesso realizado')).toBeVisible();
    expect(within(dialog).getByText('Administrador')).toBeVisible();
    expect(within(dialog).getByText('10.0.0.1')).toBeVisible();
    expect(within(dialog).getByText('Dados técnicos').closest('details')).not.toHaveAttribute(
      'open'
    );
    expect(dialog).not.toHaveTextContent('s3cr3t');
    expect(dialog).not.toHaveTextContent('111.222.333-44');

    fireEvent.click(screen.getByRole('button', { name: 'Fechar detalhes' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the contextual CPF in every representation and copies only redacted details', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const blocked: AuditLog = {
      ...log,
      action: 'BLOCK_ENTITY',
      resource: 'BlockedEntity',
      userId: '00000000-0000-0000-0000-000000000000',
      details: '{"type":"CPF","value":"08136109826","reason":"Assinatura expirada"}',
    };
    render(<AuditDetailModal log={blocked} onClose={vi.fn()} />);

    expect(screen.getByText('Sistema')).toBeVisible();
    expect(screen.getByRole('dialog')).not.toHaveTextContent('08136109826');
    fireEvent.click(screen.getByRole('button', { name: 'Copiar detalhes mascarados' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const copied = JSON.parse(writeText.mock.calls[0][0]);
    expect(copied.value).toBe('•••••');
    expect(copied.reason).toBe('Assinatura expirada');
    expect(await screen.findByText('Detalhes mascarados copiados.')).toBeVisible();
  });

  it('provides actionable feedback when copying is unavailable', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined });
    render(<AuditDetailModal log={log} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar detalhes mascarados' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Não foi possível copiar.');
  });

  it('closes with Escape through the shared shell', () => {
    const onClose = vi.fn();
    render(<AuditDetailModal log={log} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks background scrolling only while open and resets copy feedback when reopened', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const previousOverflow = document.body.style.overflow;
    const { rerender } = render(<AuditDetailModal log={log} onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Copiar detalhes mascarados' }));
    expect(await screen.findByRole('button', { name: 'Copiado' })).toBeInTheDocument();
    rerender(<AuditDetailModal log={null} onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe(previousOverflow);
    rerender(<AuditDetailModal log={log} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Copiar detalhes mascarados' })).toBeInTheDocument();
  });

  it('renders nothing without a selected event', () => {
    render(<AuditDetailModal log={null} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
