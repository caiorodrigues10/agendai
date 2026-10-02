import { LuCircleAlert as AlertCircle, LuRefreshCw as RefreshCw } from 'react-icons/lu';

interface SectionErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function SectionError({ message, onRetry, className = '' }: SectionErrorProps) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-text-primary ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 shrink-0 text-danger" size={18} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p>{message}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-danger underline-offset-4 hover:underline"
            >
              <RefreshCw size={14} aria-hidden="true" /> Tentar novamente
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
