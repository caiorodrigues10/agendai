import { ApiError } from '../../infra/apiClient';

/**
 * Mensagens de erro do assistente de importação.
 *
 * O backend responde com um `code` estável (ver `OCR_ERROR_CODES`) e uma
 * mensagem que pode mudar a qualquer momento. A tela usa o **código** para
 * dizer o que aconteceu de verdade — "a foto está baixa demais", "o servidor
 * está lendo outras imagens" — em vez de um "algo deu errado" que não ajuda
 * ninguém a decidir o que fazer.
 *
 * A ordem é: código conhecido → mensagem do servidor (quando é útil) →
 * mensagem genérica por status HTTP.
 */

/** Código do backend → o que o dono pode fazer. */
const OCR_MESSAGES: Record<string, string> = {
  OCR_DISABLED:
    'A importação por imagem está desativada neste servidor. Envie uma planilha (.xlsx ou .csv) por enquanto.',
  OCR_QUEUE_FULL:
    'O servidor já está lendo outras imagens. Aguarde alguns instantes e tente de novo.',
  OCR_IMAGE_TOO_LARGE:
    'A imagem é grande demais. Envie uma foto menor (até 10 MB).',
  OCR_IMAGE_FORMAT_INVALID:
    'Esse arquivo não é uma imagem válida. Envie uma foto PNG, JPG ou WEBP.',
  OCR_IMAGE_LOW_RESOLUTION:
    'A foto ficou baixa demais para ler com segurança. Tire a foto mais perto, com a tabela inteira visível, e envie de novo.',
  OCR_TRAINEDDATA_MISSING:
    'O leitor de imagem não está instalado no servidor. Envie uma planilha (.xlsx ou .csv) ou fale com o suporte.',
  OCR_NO_TABLE:
    'Não reconhecemos uma tabela nessa foto. Tire a foto de frente, com a tabela inteira visível e bom foco.',
  OCR_REVIEW_PENDING:
    'Ainda há células para conferir. Corrija ou aceite cada uma antes de confirmar a importação.',
};

/** Mensagem genérica por status (quando não há código nem mensagem útil). */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'O servidor recusou o arquivo. Confira o formato e tente de novo.',
  401: 'Sua sessão expirou. Faça login novamente para continuar a importação.',
  403: 'Você não tem permissão para importar dados neste salão.',
  404: 'Este lote de importação não existe mais. Comece de novo.',
  409: 'O lote de importação mudou enquanto você estava na tela. Revalide e tente de novo.',
  413: 'O arquivo é grande demais para o envio.',
  429: 'O servidor está sobrecarregado. Aguarde alguns instantes e tente de novo.',
  500: 'O servidor falhou ao importar. Nada foi gravado: tente de novo.',
  503: 'O serviço de importação está indisponível agora. Tente de novo em alguns instantes.',
};

/** Mensagem do servidor que não ajuda ninguém ("HTTP 500" e afins). */
function mensagemUtil(message: string): string {
  const texto = message.trim();
  if (!texto) return '';
  if (/^HTTP\s*\d+$/i.test(texto)) return '';
  if (/^Falha ao enviar o arquivo \(\d+\)\.$/i.test(texto)) return '';
  return texto;
}

/**
 * Traduz um erro da importação em uma mensagem que diz o que aconteceu.
 *
 * `ApiError` do `apiClient` já carrega `code` e `statusCode`; o upload
 * multipart também devolve `ApiError` (ver `dataImportApi.erroDeUpload`).
 */
export function importErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const porCodigo = err.code ? OCR_MESSAGES[err.code] : undefined;
    if (porCodigo) return porCodigo;

    const doServidor = mensagemUtil(err.message);
    if (doServidor) return doServidor;

    const porStatus = STATUS_MESSAGES[err.statusCode];
    if (porStatus) return porStatus;
  }

  if (err instanceof Error) {
    const texto = mensagemUtil(err.message);
    if (texto) return texto;
  }

  return 'Não foi possível concluir a importação. Tente de novo.';
}
