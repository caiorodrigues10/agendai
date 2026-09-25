import { ApiError } from '../infra/apiClient';

const NETWORK_PATTERN =
  /failed to fetch|networkerror|network request failed|load failed|fetch failed|econnrefused|err_connection|err_empty_response|err_timed_out/i;

const TECHNICAL_PATTERN = /^HTTP\s*\d+$/i;

const SDK_PATTERN =
  /credentials|google-auth|cloud\.google\.com\/docs|could not load|default credentials|permission denied|unauthorized|invalid_grant/i;

const RAW_VALIDATION_PATTERN =
  /"\s*code\s*"|invalid_date|too_big|too_small|invalid_type|invalid enum|expected .*received|\[\s*\{\s*"code"/i;

const RAW_DATABASE_PATTERN =
  /prisma\.|findmany|findunique|findfirst|update\(\)|create\(\)|unknown field|provided date object is invalid|cannot read properties of undefined/i;

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
          const path = Array.isArray((item as { path?: unknown }).path)
            ? (item as { path?: unknown[] }).path?.join('.')
            : null;
          return typeof msg === 'string' ? (path ? `${path}: ${msg}` : msg) : null;
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

function friendlyTechnicalMessage(raw: string): string | null {
  if (RAW_VALIDATION_PATTERN.test(raw)) {
    if (/limit|too_big|less than or equal to 100/i.test(raw)) {
      return 'O limite máximo permitido é 100 registros por vez.';
    }
    if (/date|invalid_date|provided date object is invalid/i.test(raw)) {
      return 'Data inválida. Ajuste o período e tente novamente.';
    }
    return 'Dados inválidos. Confira as informações e tente novamente.';
  }
  if (RAW_DATABASE_PATTERN.test(raw)) {
    return 'Não foi possível carregar estes dados agora. Tente novamente em instantes.';
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
    if (err.code === 'RECAPTCHA_REQUIRED') {
      return 'Não foi possível validar a proteção antiabuso. Recarregue a página e tente novamente.';
    }
    if (err.code === 'RECAPTCHA_REJECTED') {
      return 'Validação de segurança recusada. Aguarde alguns segundos e tente de novo.';
    }
    if (err.code === 'RECAPTCHA_UNAVAILABLE') {
      return 'Cadastro temporariamente indisponível. Tente novamente em instantes.';
    }
    if (err.code === 'INSUFFICIENT_STOCK' || err.code === 'PRODUCTS_INVENTORY_REQUIRED') {
      return err.message?.trim() || fallback;
    }
    if (err.code === 'DASHBOARD_REQUIRED') {
      return (
        err.message?.trim() ||
        'Seu plano não inclui dashboard de relatórios e financeiro. Faça upgrade para o Pro.'
      );
    }
    if (err.code === 'SESSION_EXPIRED') {
      return 'Sua sessão expirou. Faça login novamente.';
    }
    if (err.code === 'PRODUCT_SKU_DUPLICATE' || err.code === 'PRODUCT_BARCODE_DUPLICATE' || err.code === 'PRODUCT_CODE_DUPLICATE') {
      return err.message?.trim() || 'Já existe um produto com este SKU/código neste salão.';
    }

    const raw = err.message?.trim() ?? '';
    const friendly = friendlyTechnicalMessage(raw);
    if (friendly) return friendly;
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
    const friendly = friendlyTechnicalMessage(raw);
    if (friendly) return friendly;
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
