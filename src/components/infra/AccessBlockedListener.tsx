import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACCESS_BLOCKED_EVENT } from '../../infra/apiClient';

export const BLOCK_INFO_STORAGE_KEY = 'agendai:access-block-info';

/** Rotas onde o redirecionamento não deve acontecer (evita loop e não interrompe o pagamento). */
const EXEMPT_PATHS = ['/bloqueado', '/planos', '/checkout', '/login'];

/**
 * Listener global: quando qualquer chamada à API falha com
 * SUBSCRIPTION_REQUIRED (402) ou CPF_BLOCKED (403), guarda o payload do erro
 * (planos, motivo, data do bloqueio) e redireciona para a tela de bloqueio.
 * Trial expirado no login usa modal na própria LoginPage (sessão já existe).
 */
export const AccessBlockedListener: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      try {
        sessionStorage.setItem(BLOCK_INFO_STORAGE_KEY, JSON.stringify(detail));
      } catch {
        // storage cheio/indisponível — a página de bloqueio usa o fallback do contexto
      }
      const path = window.location.pathname;
      if (EXEMPT_PATHS.some(p => path.startsWith(p))) return;

      navigate('/bloqueado', { replace: true });
    };

    window.addEventListener(ACCESS_BLOCKED_EVENT, handler);
    return () => window.removeEventListener(ACCESS_BLOCKED_EVENT, handler);
  }, [navigate]);

  return null;
};
