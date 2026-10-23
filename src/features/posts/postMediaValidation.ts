import { POST_MEDIA_MAX_BYTES } from '../../shared/imageSpecs';
import { isSupportedImage } from '../../shared/isSupportedImage';

export { POST_MEDIA_MAX_BYTES };
export const POST_MEDIA_MIN_SIDE = 600;
export const POST_MEDIA_FORMAT_HINT = 'JPG, PNG ou WebP';

export type PostMediaValidationError = 'format' | 'size' | 'dimensions' | null;

export async function readImageDimensions(
  file: File
): Promise<{ width: number; height: number } | null> {
  if (typeof createImageBitmap !== 'function') return null;
  try {
    const bitmap = await createImageBitmap(file);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close?.();
    return dims;
  } catch {
    return null;
  }
}

export type PostMediaValidation =
  | { error: null; width: number | null; height: number | null }
  | { error: Exclude<PostMediaValidationError, null>; width?: number; height?: number };

export async function validatePostMediaFile(file: File): Promise<PostMediaValidation> {
  if (!(await isSupportedImage(file))) return { error: 'format' };
  if (file.size > POST_MEDIA_MAX_BYTES) return { error: 'size' };
  const dims = await readImageDimensions(file);
  if (dims && Math.min(dims.width, dims.height) < POST_MEDIA_MIN_SIDE) {
    return { error: 'dimensions', ...dims };
  }
  return { error: null, ...dims };
}

export function mediaValidationErrorPT(
  error: Exclude<PostMediaValidationError, null>,
  dims?: { width?: number; height?: number } | null
): string {
  switch (error) {
    case 'format':
      return `Formato inválido. Envie uma imagem ${POST_MEDIA_FORMAT_HINT}.`;
    case 'size':
      return `A imagem excede o limite de ${Math.round(POST_MEDIA_MAX_BYTES / (1024 * 1024))} MB. Comprima ou reduza o arquivo.`;
    case 'dimensions':
      return `A imagem tem ${dims?.width ?? '?'}×${dims?.height ?? '?'}px. Envie uma foto com pelo menos ${POST_MEDIA_MIN_SIDE}px em cada lado.`;
  }
}
