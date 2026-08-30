import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { logger } from '../../utils/logger';
import { SystemStatePage } from './SystemStatePage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
        />
      );
    }

    return this.props.children;
  }
}
