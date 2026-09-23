import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';
import {
  LuClock,
  LuLoaderCircle as Loader2,
  LuMessageSquare,
  LuSend,
  LuTriangleAlert,
  LuX,
} from 'react-icons/lu';
import {
  supportApi,
  SupportReportComment,
  SupportReportDetail as SupportReportDetailData,
} from '../../../infra/supportApi';
import { getErrorMessage } from '../../../utils/errorMessage';
import { FIELD_CONTROL } from '../../ui/Field';
import {
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_STATUS_COLORS,
  SUPPORT_STATUS_LABELS,
} from './supportLabels';

const ReportBody: React.FC<{ detail: SupportReportDetailData }> = ({ detail }) => (
  <>
    <div className="rounded-xl bg-bg border border-border p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
        Descrição
      </h3>
      <p className="text-sm text-text-secondary whitespace-pre-wrap">{detail.description}</p>
    </div>

    <div className="rounded-xl bg-bg border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <LuMessageSquare size={12} aria-hidden="true" />
          Conversa ({detail.comments?.length ?? 0})
        </h3>
      </div>
      <div className="divide-y divide-border/50 max-h-64 overflow-y-auto">
        {(detail.comments ?? []).length === 0 ? (
          <p className="px-4 py-5 text-center text-xs text-text-muted">
            Nenhum comentário ainda. A equipe responderá por aqui.
          </p>
        ) : (
          (detail.comments ?? []).map(comment => (
            <div key={comment.id} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold">
                  {comment.author.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-text-primary">
                  {comment.author.name}
                </span>
                <span className="text-[11px] text-text-muted">
                  {new Date(comment.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <p className="text-sm text-text-secondary ml-8 whitespace-pre-wrap">
                {comment.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  </>
);

const HeaderInfo: React.FC<{
  detail: SupportReportDetailData | null;
  loading: boolean;
}> = ({ detail, loading }) => (
  <div className="flex-1 min-w-0">
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-xs text-text-muted">
        {detail?.protocol ?? (loading ? '...' : '')}
      </span>
      {detail && (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
            SUPPORT_STATUS_COLORS[detail.status] ?? ''
          }`}
        >
          {SUPPORT_STATUS_LABELS[detail.status] ?? detail.status}
        </span>
      )}
      {detail && (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-2 text-text-secondary">
          {SUPPORT_CATEGORY_LABELS[detail.category] ?? detail.category}
        </span>
      )}
      {detail && (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium text-accent bg-accent/10">
          {SUPPORT_PRIORITY_LABELS[detail.priority] ?? detail.priority}
        </span>
      )}
    </div>
    <h2 id="support-detail-title" className="mt-1.5 font-bold text-text-primary break-words">
      {detail?.title ?? 'Carregando relatório...'}
    </h2>
    {detail && (
      <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
        <LuClock size={12} aria-hidden="true" />
        {new Date(detail.createdAt).toLocaleString('pt-BR')}
      </p>
    )}
  </div>
);

interface SupportReportDetailProps {
  reportId: string | null;
  onClose: () => void;
}

export const SupportReportDetail: React.FC<SupportReportDetailProps> = ({ reportId, onClose }) => {
  const [detail, setDetail] = useState<SupportReportDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setDetail(null);
      setError(null);
      setText('');
      setCommentError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setText('');
      setCommentError(null);
      try {
        const data = await supportApi.getReport(reportId);
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Não foi possível carregar o relatório.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  useEffect(() => {
    if (!reportId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reportId, onClose]);

  const sendComment = useCallback(async () => {
    if (!reportId) return;
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setCommentError(null);
    try {
      const comment: SupportReportComment = await supportApi.addComment(reportId, value);
      setDetail(prev => (prev ? { ...prev, comments: [...(prev.comments ?? []), comment] } : prev));
      setText('');
    } catch (err) {
      setCommentError(getErrorMessage(err, 'Não foi possível enviar o comentário.'));
    } finally {
      setSending(false);
    }
  }, [reportId, sending, text]);

  if (!reportId) return null;

  return createPortal(
    <FocusLock returnFocus>
      <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 p-4 sm:items-center">
        <button
          type="button"
          aria-label="Fechar relatório"
          onClick={onClose}
          className="absolute inset-0 cursor-default"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-detail-title"
          className="relative w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        >
          <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border">
            <HeaderInfo detail={detail} loading={loading} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="shrink-0 rounded-lg p-1.5 text-text-muted hover:bg-bg"
            >
              <LuX size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={22} className="animate-spin text-accent" />
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <LuTriangleAlert size={22} className="mx-auto mb-2 text-warning" />
                <p className="text-sm text-text-secondary">{error}</p>
              </div>
            ) : detail ? (
              <ReportBody detail={detail} />
            ) : null}
          </div>

          <div className="border-t border-border p-4 space-y-2">
            <label htmlFor="support-comment" className="sr-only">
              Adicionar comentário
            </label>
            <textarea
              id="support-comment"
              rows={2}
              maxLength={2000}
              value={text}
              onChange={event => setText(event.target.value)}
              placeholder="Escreva uma mensagem..."
              className={`${FIELD_CONTROL} min-h-[64px] resize-y`}
            />
            {commentError && (
              <p role="alert" className="text-xs text-danger">
                {commentError}
              </p>
            )}
            <button
              type="button"
              onClick={() => void sendComment()}
              disabled={!text.trim() || sending}
              className="w-full min-h-10 rounded-xl bg-accent hover:bg-accent-hover text-accent-fg text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {sending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <LuSend size={14} />
              )}
              {sending ? 'Enviando...' : 'Enviar comentário'}
            </button>
          </div>
        </div>
      </div>
    </FocusLock>,
    document.body
  );
};
