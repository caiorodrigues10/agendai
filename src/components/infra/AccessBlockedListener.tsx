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
 * CARD_REQUIRED → /planos?setup=trial (cadastro de cartão sem cobrança).
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

      // Usuário acabou de se cadastrar → trial sem pagamento não é bloqueio,
      // é só o fluxo normal de checkout. Redireciona para planos em vez de bloqueado.
      const justRegistered = sessionStorage.getItem('agendai:just-registered');
      if (justRegistered) {
        sessionStorage.removeItem('agendai:just-registered');
        navigate('/planos?setup=trial', { replace: true });
        return;
      }

      if (detail?.reason === 'CARD_REQUIRED') {
        navigate('/planos?setup=trial', { replace: true });
        return;
      }
      navigate('/bloqueado', { replace: true });
    };

    window.addEventListener(ACCESS_BLOCKED_EVENT, handler);
    return () => window.removeEventListener(ACCESS_BLOCKED_EVENT, handler);
  }, [navigate]);

  return null;
};
