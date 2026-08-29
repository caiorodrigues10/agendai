import { ApiError } from '../infra/apiClient';

const NETWORK_PATTERN =
  /failed to fetch|networkerror|network request failed|load failed|fetch failed|econnrefused|err_connection|err_empty_response|err_timed_out/i;

const TECHNICAL_PATTERN = /^HTTP\s*\d+$/i;

const SDK_PATTERN =
  /credentials|google-auth|cloud\.google\.com\/docs|could not load|default credentials|permission denied|unauthorized|invalid_grant/i;

function isNetworkError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return err.code === 'NETWORK_ERROR' || err.statusCode === 0;
  }
  if (err instanceof Error) return NETWORK_PATTERN.test(err.message);
  return false;
}

function formatApiFieldErrors(errors: unknown): string | null {
  if (!errors) return null;
  if (typeof errors === 'string' && errors.trim()) return errors;
  if (Array.isArray(errors)) {
    const parts = errors
      .map(item => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'message' in item) {
          const msg = (item as { message?: unknown }).message;
          return typeof msg === 'string' ? msg : null;
        }
        return null;
      })
      .filter((v): v is string => Boolean(v));
    return parts.length ? parts.join(' · ') : null;
  }
  if (typeof errors === 'object') {
    const parts = Object.values(errors as Record<string, unknown>)
      .flatMap(v => (Array.isArray(v) ? v : [v]))
      .map(v => (typeof v === 'string' ? v : null))
      .filter((v): v is string => Boolean(v));
    return parts.length ? parts.join(' · ') : null;
  }
  return null;
}

function messageForStatus(status: number, fallback: string): string {
  switch (status) {
    case 0:
      return 'Não foi possível conectar ao servidor. Verifique se a API está no ar e tente de novo.';
    case 400:
      return 'Dados inválidos. Confira as informações e tente novamente.';
    case 401:
      return 'E-mail ou senha inválidos.';
    case 403:
      return 'Você não tem permissão para esta ação.';
    case 404:
      return 'Recurso não encontrado.';
    case 409:
      return 'Já existe um cadastro com esses dados.';
    case 422:
      return 'Não foi possível processar os dados enviados.';
    case 429:
      return 'Muitas tentativas. Aguarde um momento e tente de novo.';
    case 502:
    case 503:
    case 504:
      return 'Servidor indisponível no momento. Tente novamente em instantes.';
    default:
      if (status >= 500) {
        return 'Erro interno do servidor. Tente novamente em instantes.';
      }
      return fallback;
  }
}

/**
 * Converte qualquer erro (rede, ApiError, Error) em mensagem amigável em PT-BR.
 * Evita vazar textos técnicos como "Failed to fetch".
 */
export function getErrorMessage(
  err: unknown,
  fallback = 'Algo deu errado. Tente novamente.'
): string {
  if (isNetworkError(err)) {
    return messageForStatus(0, fallback);
  }

  if (err instanceof ApiError) {
    const fromFields = formatApiFieldErrors((err.data as Record<string, unknown>)?.errors);
    if (fromFields) return fromFields;

    if (err.code === 'WHATSAPP_NOT_CONNECTED') {
      return (
        err.message?.trim() ||
        'Conecte o WhatsApp do salão em Configurações para enviar mensagens.'
      );
    }
    if (err.code === 'EVOLUTION_NOT_CONFIGURED') {
      return err.message?.trim() || 'WhatsApp da plataforma indisponível.';
    }

    const raw = err.message?.trim() ?? '';
    if (
      err.statusCode === 401 &&
      /token\s*(inválido|ausente|mal\s*formatado)|refresh\s*token|sess[aã]o/i.test(raw)
    ) {
      return 'Sua sessão expirou. Faça login novamente e tente de novo.';
    }
    if (!raw || TECHNICAL_PATTERN.test(raw) || NETWORK_PATTERN.test(raw) || SDK_PATTERN.test(raw)) {
      return messageForStatus(err.statusCode, fallback);
    }
    return raw;
  }

  if (err instanceof Error) {
    const raw = err.message?.trim() ?? '';
    if (!raw || NETWORK_PATTERN.test(raw) || TECHNICAL_PATTERN.test(raw) || SDK_PATTERN.test(raw)) {
      return fallback;
    }
    // Mensagens curtas em inglês genérico do browser
    if (/^(abort(ed)?|timeout|network error)$/i.test(raw)) {
      return messageForStatus(0, fallback);
    }
    return raw;
  }

  return fallback;
}
