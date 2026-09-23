import React, { useCallback, useEffect, useState } from 'react';
import { LuLifeBuoy } from 'react-icons/lu';
import { supportApi, SupportListMeta, SupportReport } from '../../infra/supportApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Toast } from '../ui/Toast';
import { SupportReportForm } from './support/SupportReportForm';
import { SupportReportList } from './support/SupportReportList';
import { SupportReportDetail } from './support/SupportReportDetail';

const LOAD_LIMIT = 10;

interface SupportPanelProps {
  onNotify?: (message: string, type?: 'success' | 'error' | 'bot') => void;
}

export const SupportPanel: React.FC<SupportPanelProps> = ({ onNotify }) => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'bot' } | null>(
    null
  );
  const [reports, setReports] = useState<SupportReport[]>([]);
  const [meta, setMeta] = useState<SupportListMeta>({
    total: 0,
    page: 1,
    limit: LOAD_LIMIT,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const notify = useCallback(
    (message: string, type: 'success' | 'error' | 'bot' = 'success') => {
      if (onNotify) onNotify(message, type);
      else setToast({ message, type });
    },
    [onNotify]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await supportApi.listMyReports({ page, limit: LOAD_LIMIT });
      setReports(res.data);
      setMeta(res.meta);
    } catch (err) {
      setListError(getErrorMessage(err, 'Não foi possível carregar seus relatórios.'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreated = (report: SupportReport) => {
    notify(`Protocolo ${report.protocol} gerado`, 'success');
    if (page === 1) void load();
    else setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="rounded-2xl border border-border bg-surface p-5 sm:p-6 flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <LuLifeBuoy size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-text-primary">Ajuda e suporte</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Encontre ajuda, reporte bugs ou dados incorretos da plataforma e acompanhe o
            andamento dos seus relatórios com a nossa equipe.
          </p>
        </div>
      </header>

      <SupportReportForm onCreated={handleCreated} />

      <SupportReportList
        reports={reports}
        meta={meta}
        page={page}
        loading={loading}
        error={listError}
        onPageChange={setPage}
        onRetry={() => void load()}
        onSelect={setSelectedId}
      />

      <SupportReportDetail reportId={selectedId} onClose={() => setSelectedId(null)} />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
