import React, { useEffect, useState } from 'react';
import { LuCheck, LuCode, LuCopy, LuLockKeyhole, LuShield } from 'react-icons/lu';
import type { AuditLog } from '../../infra/adminApi';
import type { AuditFacets } from '../../infra/adminAuditApi';
import { ModalShell } from '../../components/patterns/ModalShell';
import { Button } from '../../components/ui/Button';
import {
  auditActorLabel,
  auditDetailSummary,
  auditFieldLabel,
  auditResourceLabel,
  describeAuditAction,
  maskSensitiveJson,
} from './auditPresentation';

export { maskSensitiveJson } from './auditPresentation';

interface AuditDetailModalProps {
  log: AuditLog | null;
  onClose: () => void;
  users?: AuditFacets['users'];
  shops?: AuditFacets['shops'];
}

const readableDetails = (safeJson: string): [string, string][] => {
  try {
    const parsed: unknown = JSON.parse(safeJson);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return [];
    return Object.entries(parsed as Record<string, unknown>)
      .filter(([key, value]) => !/id$/i.test(key) && value !== null && value !== undefined)
      .slice(0, 10)
      .map(([key, value]): [string, string] => {
        const content = Array.isArray(value)
          ? value
              .map(item =>
                typeof item === 'string' ? auditFieldLabel(item) : 'Informação adicional'
              )
              .join(', ')
          : typeof value === 'object'
            ? Object.entries(value as Record<string, unknown>)
                .slice(0, 8)
                .map(
                  ([field, item]) =>
                    `${auditFieldLabel(field)}: ${typeof item === 'object' ? 'Ver dados técnicos' : String(item)}`
                )
                .join(' · ')
            : typeof value === 'boolean'
              ? value
                ? 'Sim'
                : 'Não'
              : String(value);
        return [auditFieldLabel(key), content];
      });
  } catch {
    return [];
  }
};

const AuditDetailContent: React.FC<Omit<AuditDetailModalProps, 'log'> & { log: AuditLog }> = ({
  log,
  onClose,
  users,
  shops,
}) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const action = describeAuditAction(log.action, log.resource);
  const safeJson = maskSensitiveJson(log.details);
  const fields = readableDetails(safeJson);
  const actor = auditActorLabel(log.userId, users);
  const shop = shops?.find(item => item.id === log.barbershopId)?.name;
  const date = new Date(log.createdAt).toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  });
  const copyDetails = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(safeJson);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  };

  return (
    <ModalShell
      open
      variant="sheet"
      titleId="audit-detail-title"
      ariaLabel="Detalhes do registro"
      title={<h2 className="text-lg font-bold text-text-primary">Detalhes do registro</h2>}
      icon={<LuShield size={22} aria-hidden="true" />}
      onClose={onClose}
      className="[&_header_button]:min-h-11 [&_header_button]:min-w-11 [&_header_button]:focus-visible:ring-2 [&_header_button]:focus-visible:ring-focus"
      bodyClassName="space-y-6"
      body={
        <>
          <section className="space-y-3" aria-label="Resumo do evento">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  action.tone === 'danger'
                    ? 'border-danger/25 bg-danger/10 text-danger'
                    : action.tone === 'warning'
                      ? 'border-warning/25 bg-warning/10 text-warning'
                      : 'border-border bg-bg text-text-secondary'
                }`}
              >
                {auditResourceLabel(log.resource)}
              </span>
              <span className="text-xs text-text-secondary">Registro de atividade</span>
            </div>
            <p className="text-2xl font-semibold leading-tight text-text-primary">{action.label}</p>
            <p className="text-sm leading-relaxed text-text-secondary [overflow-wrap:anywhere]">
              {auditDetailSummary(log.details)}
            </p>
          </section>

          <dl className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-bg p-4 sm:grid-cols-2">
            {[
              ['Responsável', actor],
              ['Quando', date],
              ['Salão', shop ?? (log.barbershopId ? 'Salão não identificado' : 'Ação global')],
              ['Endereço IP', log.ipAddress ?? 'Não informado'],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs font-medium text-text-secondary">{label}</dt>
                <dd className="mt-1 text-sm font-semibold leading-relaxed text-text-primary [overflow-wrap:anywhere]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {fields.length > 0 && (
            <section aria-label="Informações do evento">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">
                Informações do evento
              </h3>
              <dl className="divide-y divide-border rounded-xl border border-border">
                {fields.map(([label, value], index) => (
                  <div
                    key={`${label}-${index}`}
                    className="grid gap-1 px-4 py-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
                  >
                    <dt className="text-xs font-medium text-text-secondary">{label}</dt>
                    <dd className="text-sm leading-relaxed text-text-primary [overflow-wrap:anywhere]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div className="flex gap-2 rounded-xl border border-border bg-bg px-3 py-3 text-xs leading-relaxed text-text-secondary">
            <LuLockKeyhole size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>Dados sensíveis são ocultados nesta visualização e na cópia dos detalhes.</p>
          </div>

          <details key={log.id} className="group rounded-xl border border-border">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-text-secondary outline-none hover:bg-bg focus-visible:ring-2 focus-visible:ring-focus">
              <span className="flex items-center gap-2">
                <LuCode size={17} aria-hidden="true" />
                Dados técnicos
              </span>
              <span aria-hidden="true" className="text-lg font-normal group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="space-y-4 border-t border-border p-4">
              <dl className="space-y-3">
                {[
                  ['Ação original', log.action],
                  ['Recurso', log.resource],
                  ['ID do registro', log.id],
                  ['ID do recurso', log.resourceId ?? 'Não informado'],
                  ['ID do usuário', log.userId],
                  ...(log.barbershopId ? [['ID do salão', log.barbershopId]] : []),
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-medium text-text-secondary">{label}</dt>
                    <dd className="mt-1 font-mono text-xs leading-relaxed text-text-primary [overflow-wrap:anywhere]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div>
                <h3 className="mb-2 text-xs font-semibold text-text-secondary">
                  Detalhes em JSON (mascarado)
                </h3>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-bg p-3 font-mono text-xs leading-relaxed text-text-secondary [overflow-wrap:anywhere]">
                  {safeJson}
                </pre>
              </div>
            </div>
          </details>
          <p
            role="status"
            aria-live="polite"
            className={`min-h-5 text-xs ${copyStatus === 'error' ? 'text-danger' : 'text-text-secondary'}`}
          >
            {copyStatus === 'copied'
              ? 'Detalhes mascarados copiados.'
              : copyStatus === 'error'
                ? 'Não foi possível copiar. Abra os dados técnicos e selecione o texto.'
                : ''}
          </p>
        </>
      }
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Button variant="secondary" onClick={onClose}>
            Fechar detalhes
          </Button>
          <Button variant="primary" onClick={copyDetails}>
            {copyStatus === 'copied' ? (
              <LuCheck size={16} aria-hidden="true" />
            ) : (
              <LuCopy size={16} aria-hidden="true" />
            )}
            {copyStatus === 'copied' ? 'Copiado' : 'Copiar detalhes mascarados'}
          </Button>
        </div>
      }
    />
  );
};

/** A readable investigation sheet; closing or changing records resets its local state. */
export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ log, ...props }) =>
  log ? <AuditDetailContent key={log.id} log={log} {...props} /> : null;

export default AuditDetailModal;
