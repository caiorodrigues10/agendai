import { useEffect, useState, type ReactNode } from 'react';
import { LuCircleAlert as AlertCircle, LuRefreshCw as RefreshCw } from 'react-icons/lu';

interface SectionErrorProps {
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
  retryAfterSeconds?: number | null;
}

export function SectionError({
  message,
  onRetry,
  action,
  className = '',
  retryAfterSeconds,
}: SectionErrorProps) {
  const [countdown, setCountdown] = useState(() => Math.max(0, retryAfterSeconds ?? 0));

  useEffect(() => {
    setCountdown(Math.max(0, retryAfterSeconds ?? 0));
  }, [retryAfterSeconds]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown > 0]);

  const retryDisabled = countdown > 0;

  return (
    <div
      role="alert"
      className={`rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-text-primary ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 shrink-0 text-danger" size={18} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p>{message}</p>
          {onRetry || action ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={retryDisabled}
                  className={`inline-flex items-center gap-1 text-sm font-medium text-danger underline-offset-4 ${
                    retryDisabled ? 'cursor-not-allowed opacity-60' : 'hover:underline'
                  }`}
                >
                  <RefreshCw size={14} aria-hidden="true" /> Tentar novamente
                </button>
              ) : null}
              {retryDisabled ? (
                <span className="text-xs text-text-muted" aria-live="polite">
                  Tente novamente em {countdown}s
                </span>
              ) : null}
              {action}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
