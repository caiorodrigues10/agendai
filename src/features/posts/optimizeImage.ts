import { POST_MEDIA_MAX_BYTES } from '../../shared/imageSpecs';

/** Lado máximo preservado na otimização (mesmo limite da transformação do back). */
export const OPTIMIZE_MAX_SIDE = 2000;
export const OPTIMIZE_JPEG_QUALITY = 0.85;

/**
 * Otimiza foto grande no navegador antes do upload: reduz o lado máximo para
 * `OPTIMIZE_MAX_SIDE` px e reencoda em JPEG (~0,85). Usado apenas quando o
 * arquivo excede `POST_MEDIA_MAX_BYTES` — fotos dentro do limite sobem como
 * estão (preserva PNG/WebP originais).
 *
 * Retorna o arquivo original quando já está dentro do limite ou quando a
 * otimização não é possível (browser sem canvas/blob).
 */
export async function optimizeImageIfNeeded(file: File): Promise<File> {
  if (file.size <= POST_MEDIA_MAX_BYTES) return file;
  if (typeof createImageBitmap !== 'function' || typeof HTMLCanvasElement === 'undefined') return file;
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(1, OPTIMIZE_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', OPTIMIZE_JPEG_QUALITY));
    if (!blob || blob.size === 0) return file;
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto';
    const optimized = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
    // Só substitui se a otimização realmente ajudou (e mantém o mínimo de lado).
    if (optimized.size >= file.size) return file;
    return optimized;
  } catch {
    return file;
  } finally {
    bitmap?.close?.();
  }
}
