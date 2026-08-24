import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface UseGoogleSignInOptions {
  clientId: string;
  onCredential: (idToken: string) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

interface UseGoogleSignInResult {
  isLoaded: boolean;
  error: string | null;
  renderButton: (parent: HTMLElement) => void;
}

export function useGoogleSignIn({
  clientId,
  onCredential,
  onError,
  enabled = true,
}: UseGoogleSignInOptions): UseGoogleSignInResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.accounts?.id) {
        setIsLoaded(true);
      } else {
        setError('Google Identity Services não carregou corretamente.');
        onError?.('Google Identity Services não carregou corretamente.');
      }
    };

    script.onerror = () => {
      setError('Falha ao carregar o script do Google.');
      onError?.('Falha ao carregar o script do Google.');
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [clientId, enabled, onError]);

  const renderButton = (parent: HTMLElement) => {
    if (!window.google?.accounts?.id || !isLoaded || initializedRef.current) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential?: string }) => {
          if (response.credential) {
            onCredential(response.credential);
          } else {
            setError('Credencial Google não recebida.');
            onError?.('Credencial Google não recebida.');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(parent, {
        type: 'standard',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        theme: 'outline',
        width: parent.offsetWidth || 300,
      });

      initializedRef.current = true;
    } catch (err) {
      setError('Erro ao inicializar botão Google.');
      onError?.('Erro ao inicializar botão Google.');
    }
  };

  return { isLoaded, error, renderButton };
}
