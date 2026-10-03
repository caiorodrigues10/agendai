/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('maskSensitiveJson', () => {
  it('mascara chaves sensíveis mesmo aninhadas', () => {
    const masked = maskSensitiveJson(log.details);
    expect(masked).not.toContain('s3cr3t');
    expect(masked).not.toContain('abc');
    expect(masked).not.toContain('111.222.333-44');
    expect(masked).toContain('"name": "Ana"');
    expect(masked).toContain('•••••');
  });

  it('aplica fallback regex quando não é JSON', () => {
    const masked = maskSensitiveJson(
      'payload quebrado {"password":"hunter2","token":"abc123"}',
    );
    expect(masked).not.toContain('hunter2');
    expect(masked).not.toContain('abc123');
  });

  it('retorna texto padrão sem details', () => {
    expect(maskSensitiveJson(null)).toBe('Sem detalhes.');
  });
});

describe('AuditDetailModal', () => {
  it('renderiza os campos do log e fecha pelo botão', () => {
    const onClose = vi.fn();
    render(<AuditDetailModal log={log} onClose={onClose} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('POST /api/auth/login')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
    expect(screen.getByText(/"name": "Ana"/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar detalhes' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('não renderiza nada sem log selecionado', () => {
    render(<AuditDetailModal log={null} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
