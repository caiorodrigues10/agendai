import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { ApiError } from '../../infra/apiClient';
import { SectionError } from '../../components/patterns';

/**
 * Mensagens e ações de erro do relatório de visitas do salão.
 *
 * O relatório é um recurso pago: `checkSubscription` responde 402
 * (`SUBSCRIPTION_REQUIRED`) quando a assinatura do salão está vencida. Nesse
 * caso repetir a requisição não resolve — o caminho é renovar o plano. O
 * listener global (`AccessBlockedListener`) redireciona para `/bloqueado`,
 * mas o card/section podem estar numa rota isenta de redirecionamento, então
 * a mensagem de erro também precisa ser específica.
 *
 * O bloqueio de acesso tem mais de uma causa (`CPF_BLOCKED`, 403), e Renewar
 * o plano não resolve todos elas — por isso a distinção é feita pelo `code`
 * da resposta, e não só por "houve bloqueio".
 */

/** Falha genérica de carregamento — recuperável, vale a pena tentar de novo. */
export const SALON_TRAFFIC_LOAD_ERROR = 'Não foi possível carregar as visitas ao seu salão.';

/** Assinatura vencida (402) — repetir a requisição não resolve; renove o plano. */
export const SALON_TRAFFIC_SUBSCRIPTION_ERROR =
  'Sua assinatura está vencida. Renove o plano para ver as visitas ao seu salão.';

/**
 * Acesso bloqueado por outra causa (ex.: `CPF_BLOCKED`, 403) — a renovação do
 * plano não é o caminho, então a mensagem é neutra e não oferece link.
 */
export const SALON_TRAFFIC_ACCESS_BLOCKED_ERROR =
  'O acesso aos dados do seu salão está bloqueado. Entre em contato com o suporte para liberar o acesso.';

/**
 * Erro do relatório: mensagem exibida + se o acesso foi bloqueado.
 *
 * Mensagem e flag viajam juntas (nunca podem divergir: um erro bloqueado
 * sempre leva a mensagem da causa e nunca o botão de retry).
 */
export interface SalonTrafficError {
  message: string;
  accessBlocked: boolean;
}

/** Converte a rejeição da API no estado de erro do relatório (diferencia por `code`). */
export function toSalonTrafficError(error: unknown): SalonTrafficError {
  const code = error instanceof ApiError ? error.code : undefined;

  if (code === 'SUBSCRIPTION_REQUIRED') {
    return { message: SALON_TRAFFIC_SUBSCRIPTION_ERROR, accessBlocked: true };
  }
  if (code === 'CPF_BLOCKED') {
    return { message: SALON_TRAFFIC_ACCESS_BLOCKED_ERROR, accessBlocked: true };
  }
  return { message: SALON_TRAFFIC_LOAD_ERROR, accessBlocked: false };
}

/** Ação do estado bloqueado: levar para a tela de planos (renovação). */
export const SalonTrafficSubscriptionAction: React.FC = () => (
  <Link
    to="/planos"
    className="inline-flex items-center gap-1 text-sm font-medium text-accent underline-offset-4 hover:underline"
  >
    Ver planos e renovar
    <LuArrowRight size={14} aria-hidden="true" />
  </Link>
);

/**
 * Ação do erro: o link de renovação só faz sentido quando a assinatura está
 * vencida — nos demais bloqueios o caminho é o suporte, não o plano.
 *
 * O estado guarda só `accessBlocked` (booleano), então a causa do bloqueio é
 * reconhecida pela mensagem canônica (as mensagens são deste módulo).
 */
export function salonTrafficErrorAction(error: SalonTrafficError): ReactNode {
  if (!error.accessBlocked) return undefined;
  if (error.message !== SALON_TRAFFIC_SUBSCRIPTION_ERROR) return undefined;
  return <SalonTrafficSubscriptionAction />;
}

/**
 * Estado de erro do relatório:
 * - assinatura vencida → link de renovação, sem retry;
 * - outro bloqueio de acesso → sem link, sem retry;
 * - erro comum → mensagem genérica com retry.
 */
export const SalonTrafficErrorState: React.FC<{
  error: SalonTrafficError;
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <SectionError
    message={error.message}
    onRetry={error.accessBlocked ? undefined : onRetry}
    action={salonTrafficErrorAction(error)}
  />
);
