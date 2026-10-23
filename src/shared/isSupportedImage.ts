/**
 * Suporte de formato de imagem — função ÚNICA usada por todos os uploads de
 * imagem do app (capa, logo, posts, avatar…). A ordem de decisão:
 *
 * 1. MIME declarado `image/jpeg|png|webp` (alias `image/jpg` normalizado) → aceita.
 * 2. Assinatura de bytes válida → aceita (cobre `file.type` vazio em
 *    arrastar-e-soltar, MIME errado/não listado e extensões `.JPG`/`.jpeg`/`.jfif`):
 *    JPEG `FF D8 FF` (qualquer marcador — EXIF `E1`, Adobe `EE`, …), PNG
 *    `89 50 4E 47 0D 0A 1A 0A`, WebP `RIFF….WEBP`.
 * 3. MIME presente e não-suportado, sem assinatura → barra (ex.: GIF com nome
 *    enganoso; `.gif`/`.svg`/`.pdf` caem aqui).
 * 4. Sem MIME (ou `application/octet-stream`): extensão `.jpg/.jpeg/.jfif/
 *    .png/.webp` (case-insensitive) como último recurso — a validação real do
 *    arquivo (decodificação/Cloudinary/back) acontece depois.
 *
 * Arquivos inválidos continuam barrados: ou aqui, ou na decodificação, ou pelo
 * Cloudinary (`allowed_formats`) com a mensagem de formato.
 */
import { COVER_IMAGE_SPEC } from './imageSpecs';

type ImageKind = 'jpeg' | 'png' | 'webp';

const SUPPORTED_MIME = new Set<string>([
  ...Object.keys(COVER_IMAGE_SPEC.allowedMimeTypes).map(mime => mime.toLowerCase()),
  'image/jpg',
]);

const MIME_BY_KIND: Record<ImageKind, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const EXTENSION_KIND: Record<string, ImageKind> = {
  jpg: 'jpeg',
  jpeg: 'jpeg',
  jfif: 'jpeg',
  png: 'png',
  webp: 'webp',
};

function normalizeMime(mime: string): string {
  const lower = mime.toLowerCase();
  return lower === 'image/jpg' ? 'image/jpeg' : lower;
}

function fileExtension(name: string): string {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index + 1).toLowerCase() : '';
}

function extensionKind(name: string): ImageKind | undefined {
  return EXTENSION_KIND[fileExtension(name)];
}

async function detectImageSignature(file: File): Promise<ImageKind | null> {
  try {
    const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return 'jpeg';
    }
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (bytes.length >= 8 && pngSignature.every((byte, index) => bytes[index] === byte)) {
      return 'png';
    }
    if (
      bytes.length >= 12 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    ) {
      return 'webp';
    }
    return null;
  } catch {
    return null;
  }
}

/** `true` se o arquivo é uma imagem JPG/PNG/WebP suportada pelo app. */
export async function isSupportedImage(file: File): Promise<boolean> {
  const mime = normalizeMime(file.type || '');
  if (SUPPORTED_MIME.has(mime)) return true;

  if (await detectImageSignature(file)) return true;

  if (mime && mime !== 'application/octet-stream') return false;

  return extensionKind(file.name) !== undefined;
}

/**
 * MIME melhor adivinhado p/ declarar em uploads (bytes → tipo declarado →
 * extensão); `null` quando não é imagem suportada.
 */
export async function detectImageMime(file: File): Promise<string | null> {
  const kind = await detectImageSignature(file);
  if (kind) return MIME_BY_KIND[kind];
  const mime = normalizeMime(file.type || '');
  if (SUPPORTED_MIME.has(mime)) return mime;
  const fromExtension = extensionKind(file.name);
  return fromExtension ? MIME_BY_KIND[fromExtension] : null;
}
