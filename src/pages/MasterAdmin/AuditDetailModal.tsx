import React, { useEffect } from 'react';
import { LuX } from 'react-icons/lu';
import type { AuditLog } from '../../infra/adminApi';

const SENSITIVE_KEY = /^(password|senha|token|secret|authorization|apikey|api_key|cpf|cnpj|card|cardnumber|cvv)$/i;

const maskValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map((item) => maskValue(item));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [
        key,
        SENSITIVE_KEY.test(key) ? '•••••' : maskValue(child),
      ]),
    );
  }
  return value;
};

const FALLBACK_PATTERN =
  /("(?:password|senha|token|secret|authorization|apikey|api_key|cpf|cnpj|card|cvv)"\s*:\s*")([^"]*)(")/gi;

/** Mascara chaves sensíveis do JSON de details antes de exibir. */
export const maskSensitiveJson = (text: string | null): string => {
  if (!text) return 'Sem detalhes.';
  try {
    return JSON.stringify(maskValue(JSON.parse(text)), null, 2);
  } catch {
    return text.replace(FALLBACK_PATTERN, '$1•••••$3');
  }
};

/** Modal de detalhe de um log de auditoria com JSON mascarado. */
export const AuditDetailModal: React.FC<{ log: AuditLog | null; onClose: () => void }> = ({
  log,
  onClose,
}) => {
  useEffect(() => {
    if (!log) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [log, onClose]);

  if (!log) return null;

  const rows: [string, string][] = [
    ['Ação', log.action],
    ['Recurso', log.resource],
    ['Recurso ID', log.resourceId ?? '—'],
    ['Usuário', log.userId],
    ['IP', log.ipAddress ?? '—'],
    ['Data', new Date(log.createdAt).toLocaleString('pt-BR')],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes do log ${log.action}`}
        className="relative bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-auto p-4 space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Detalhes do registro</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Valores sensíveis (senhas, tokens, CPF) aparecem mascarados.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="rounded-lg border border-border p-1.5 text-text-secondary hover:bg-bg"
          >
            <LuX size={14} />
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-text-muted font-bold uppercase tracking-widest text-[10px]">
                {label}
              </dt>
              <dd className="text-text-primary font-mono break-all">{value}</dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
            Detalhes (JSON mascarado)
          </p>
          <pre className="bg-bg border border-border rounded-lg p-3 text-xs text-text-secondary overflow-x-auto whitespace-pre-wrap break-all">
            {maskSensitiveJson(log.details)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AuditDetailModal;
