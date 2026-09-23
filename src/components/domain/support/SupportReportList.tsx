import React from 'react';
import { LuLifeBuoy, LuLoaderCircle as Loader2, LuMessageSquare, LuTriangleAlert } from 'react-icons/lu';
import { SupportListMeta, SupportReport } from '../../../infra/supportApi';
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_STATUS_COLORS,
  SUPPORT_STATUS_LABELS,
} from './supportLabels';

interface SupportReportListProps {
  reports: SupportReport[];
  meta: SupportListMeta;
  page: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onSelect: (id: string) => void;
}

export const SupportReportList: React.FC<SupportReportListProps> = ({
  reports,
  meta,
  page,
  loading,
  error,
  onPageChange,
  onRetry,
  onSelect,
}) => (
  <section className="bg-surface border border-border rounded-xl overflow-hidden">
    <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center justify-between gap-3">
      <h2 className="font-bold text-text-primary">Meus relatórios</h2>
      {!loading && !error && reports.length > 0 && (
        <span className="text-xs text-text-muted">{meta.total} relatório(s)</span>
      )}
    </div>

    {loading ? (
      <div className="flex justify-center py-10">
        <Loader2 size={22} className="animate-spin text-accent" />
      </div>
    ) : error ? (
      <div className="text-center py-10 px-4">
        <LuTriangleAlert size={22} className="mx-auto mb-2 text-warning" />
        <p className="text-sm text-text-secondary">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-accent text-sm font-medium hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    ) : reports.length === 0 ? (
      <div className="text-center py-10 px-4">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 text-text-muted">
          <LuLifeBuoy size={22} aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-text-primary">Nenhum relatório ainda</p>
        <p className="mt-1 text-xs text-text-muted">
          Quando você enviar um bug, dúvida ou sugestão, ele aparecerá aqui com o andamento.
        </p>
      </div>
    ) : (
      <div className="divide-y divide-border/50">
        {reports.map(report => (
          <button
            key={report.id}
            type="button"
            onClick={() => onSelect(report.id)}
            className="w-full text-left px-4 sm:px-5 py-3.5 hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-text-muted">{report.protocol}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  SUPPORT_STATUS_COLORS[report.status] ?? ''
                }`}
              >
                {SUPPORT_STATUS_LABELS[report.status] ?? report.status}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-2 text-text-secondary">
                {SUPPORT_CATEGORY_LABELS[report.category] ?? report.category}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-text-primary truncate">{report.title}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
              <span>{new Date(report.createdAt).toLocaleDateString('pt-BR')}</span>
              <span className="flex items-center gap-1">
                <LuMessageSquare size={12} aria-hidden="true" />
                {report._count?.comments ?? 0}
              </span>
            </div>
          </button>
        ))}
      </div>
    )}

    {meta.totalPages > 1 && (
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-border text-sm">
        <span className="text-text-muted">
          Página {page} de {meta.totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1 rounded border border-border text-text-secondary disabled:opacity-40 hover:bg-surface-2"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={page >= meta.totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1 rounded border border-border text-text-secondary disabled:opacity-40 hover:bg-surface-2"
          >
            Próxima
          </button>
        </div>
      </div>
    )}
  </section>
);
