import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw, Copy, Check } from 'lucide-react';
import { logger } from '../../utils/logger';
import { SystemStatePage } from './SystemStatePage';
import { getLastCorrelationId } from '../../utils/correlationIdStore';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  correlationId: string | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, correlationId: null, copied: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, correlationId: getLastCorrelationId(), copied: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('[ErrorBoundary]', error, errorInfo);
  }

  private handleCopyCorrelationId = async () => {
    const id = this.state.correlationId;
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // Clipboard API not available or denied
    }
  };

  render() {
    if (this.state.hasError) {
      const { correlationId, copied } = this.state;

      return (
        <SystemStatePage
          code="500"
          title="Algo não saiu como esperado"
          description="Não foi possível abrir esta tela agora. Recarregue a página e tente novamente."
          icon={<AlertTriangle size={36} strokeWidth={1.8} aria-hidden="true" />}
          primaryAction={{
            label: 'Recarregar página',
            onClick: () => window.location.reload(),
            icon: <RefreshCw size={17} aria-hidden="true" />,
          }}
          secondaryAction={{
            label: 'Voltar ao início',
            href: '/',
            icon: <Home size={17} aria-hidden="true" />,
          }}
          footer={
            correlationId ? (
              <div className="mt-6 flex flex-col items-center gap-3">
                <p className="text-xs text-text-muted">
                  Código de referência para o suporte:
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                  <code className="select-all font-mono text-xs text-text-secondary">
                    {correlationId}
                  </code>
                  <button
                    type="button"
                    onClick={this.handleCopyCorrelationId}
                    className="rounded p-1 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
                    aria-label="Copiar código de referência"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <a
                  href="/contato"
                  className="text-xs font-semibold text-accent transition-colors hover:text-accent-hover"
                >
                  Abrir chamado de suporte
                </a>
              </div>
            ) : undefined
          }
        />
      );
    }

    return this.props.children;
  }
}
