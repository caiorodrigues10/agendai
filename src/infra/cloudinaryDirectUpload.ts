/**
 * Upload DIRETO do cliente ao Cloudinary (FormData → POST uploadUrl via XHR).
 * Por que XHR: progresso real (`upload.onprogress`) e cancelamento
 * (`AbortSignal` → `xhr.abort()`), que `fetch` não expõe de forma simples.
 *
 * Sem limite de peso definido pelo app: se o arquivo exceder o limite do plano
 * da conta Cloudinary, o erro deles é traduzido para linguagem humana aqui.
 */

export interface SignedImageUpload {
  cloudName: string;
  apiKey: string;
  uploadUrl: string;
  folder: string;
  publicId: string;
  timestamp: number;
  signature: string;
  expiresInSeconds: number;
  /** Params prontos para o FormData (inclui `signature` e `api_key`). */
  params: Record<string, string>;
}

export interface CloudinaryUploadResult {
  publicId: string;
  version: number;
  secureUrl: string;
}

export interface DirectUploadOptions {
  file: File;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export class CloudinaryUploadError extends Error {
  /** Assinatura inválida/expirada: o chamador re-assina UMA vez e tenta de novo. */
  readonly signatureExpired: boolean;
  /** Cancelado pelo usuário: o chamador não deve tratar como erro. */
  readonly canceled: boolean;

  constructor(
    message: string,
    options?: { signatureExpired?: boolean; canceled?: boolean },
  ) {
    super(message);
    this.name = 'CloudinaryUploadError';
    this.signatureExpired = options?.signatureExpired ?? false;
    this.canceled = options?.canceled ?? false;
  }
}

const PLAN_SIZE_MESSAGE =
  'Esta imagem é maior do que o seu plano de imagens permite. ' +
  'Comprima a imagem ou faça upgrade do plano e tente novamente.';
const FORMAT_MESSAGE = 'Formato não permitido. Envie JPG, PNG ou WebP.';
const NETWORK_MESSAGE = 'Falha de rede ao enviar a imagem. Verifique sua conexão e tente novamente.';

function isSignatureFailure(status: number, apiMessage: string): boolean {
  const message = apiMessage.toLowerCase();
  return (
    status === 401 ||
    message.includes('signature') ||
    message.includes('must be signed') ||
    message.includes('unsigned')
  );
}

function isPlanSizeFailure(apiMessage: string): boolean {
  const message = apiMessage.toLowerCase();
  return message.includes('file size too large') || message.includes('file size');
}

function isFormatFailure(apiMessage: string): boolean {
  const message = apiMessage.toLowerCase();
  return (
    message.includes('allowed_formats') ||
    message.includes('file type') ||
    /format[^a-z0-9]{0,30}not (allowed|supported)/.test(message) ||
    /not (allowed|supported)[^a-z0-9]{0,30}format/.test(message)
  );
}

/**
 * Envia o arquivo direto ao Cloudinary com progresso e cancelamento.
 * Erros vêm como `CloudinaryUploadError` (mensagem já humana, sem stack/secret).
 */
export function uploadToCloudinary(
  credentials: SignedImageUpload,
  options: DirectUploadOptions,
): Promise<CloudinaryUploadResult> {
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const { signal } = options;

    if (signal?.aborted) {
      reject(new CloudinaryUploadError('Envio cancelado.', { canceled: true }));
      return;
    }

    const formData = new FormData();
    for (const [key, value] of Object.entries(credentials.params)) {
      formData.append(key, value);
    }
    formData.append('file', options.file);

    const xhr = new XMLHttpRequest();
    const onAbortSignal = () => xhr.abort();
    signal?.addEventListener('abort', onAbortSignal, { once: true });
    const cleanup = () => signal?.removeEventListener('abort', onAbortSignal);

    xhr.open('POST', credentials.uploadUrl);

    xhr.upload.onprogress = event => {
      if (event.lengthComputable && event.total > 0) {
        options.onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const parsed = JSON.parse(xhr.responseText) as {
            public_id?: string;
            version?: number;
            secure_url?: string;
          };
          if (!parsed.public_id || !parsed.secure_url) {
            reject(new CloudinaryUploadError('Resposta inválida do Cloudinary ao enviar a imagem.'));
            return;
          }
          resolve({
            publicId: parsed.public_id,
            version: Number(parsed.version ?? 0),
            secureUrl: parsed.secure_url,
          });
        } catch {
          reject(new CloudinaryUploadError('Resposta inválida do Cloudinary ao enviar a imagem.'));
        }
        return;
      }

      let apiMessage = '';
      try {
        const parsed = JSON.parse(xhr.responseText) as { error?: { message?: string } };
        apiMessage = parsed.error?.message ?? '';
      } catch {
        /* corpo não-JSON: mensagem fica genérica */
      }

      if (isSignatureFailure(xhr.status, apiMessage)) {
        reject(new CloudinaryUploadError('Assinatura de upload expirada.', { signatureExpired: true }));
        return;
      }
      if (isPlanSizeFailure(apiMessage)) {
        reject(new CloudinaryUploadError(PLAN_SIZE_MESSAGE));
        return;
      }
      if (isFormatFailure(apiMessage)) {
        reject(new CloudinaryUploadError(FORMAT_MESSAGE));
        return;
      }
      // Demais erros: mensagem amigável genérica ao usuário; o detalhe técnico
      // (status + texto do Cloudinary, sem segredos) vai só para o console.
      console.warn('[upload-cloudinary] erro não mapeado', xhr.status, apiMessage);
      reject(new CloudinaryUploadError('Não foi possível enviar a imagem. Tente novamente em instantes.'));
    };

    xhr.onerror = () => {
      cleanup();
      reject(new CloudinaryUploadError(NETWORK_MESSAGE));
    };

    xhr.ontimeout = () => {
      cleanup();
      reject(new CloudinaryUploadError(NETWORK_MESSAGE));
    };

    xhr.onabort = () => {
      cleanup();
      reject(new CloudinaryUploadError('Envio cancelado.', { canceled: true }));
    };

    xhr.send(formData);
  });
}
