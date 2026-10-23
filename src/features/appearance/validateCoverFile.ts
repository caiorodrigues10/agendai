import { COVER_IMAGE_SPEC, type CoverImageSpec } from '../../shared/imageSpecs';
import { isSupportedImage } from '../../shared/isSupportedImage';

export interface CoverFileValidation {
  ok: boolean;
  error?: string;
  width?: number;
  height?: number;
}

/** Aviso NÃO bloqueante sobre a medida escolhida (capa aceita qualquer uma). */
export interface CoverImageWarning {
  tone: 'info' | 'ok';
  text: string;
}

async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close?.();
    return size;
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode failed'));
    };
    img.src = url;
  });
}

/**
 * Validação INSTANTÂNEA no front (camada 1 de 3): tipo real e legibilidade do
 * arquivo. QUALQUER medida/proporção de capa é aceita — o recorte 16:9 e o
 * ponto focal acontecem na entrega (helper único `shared/coverImage.ts`). O
 * back revalida o tipo com sharp (autoridade) e o Cloudinary aplica o limite
 * de peso do plano da conta (o app não define MB).
 */
export async function validateCoverFile(
  file: File,
  spec: CoverImageSpec = COVER_IMAGE_SPEC
): Promise<CoverFileValidation> {
  // Camada 1: MIME declarado (spec). Se não convencer (vazio, octet-stream
  // ou MIME raro — comum em arrastar-e-soltar), a função única
  // `isSupportedImage` decide por assinatura de bytes e extensão.
  const mimeType = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  const mimeAllowed = Boolean(mimeType) && Boolean(spec.allowedMimeTypes[mimeType]);
  if (!mimeAllowed && !(await isSupportedImage(file))) {
    return {
      ok: false,
      error: `Tipo de arquivo não permitido${mimeType ? `: "${mimeType}"` : ''}. Aceitos: JPG, PNG ou WebP.`,
    };
  }

  let width: number;
  let height: number;
  try {
    ({ width, height } = await readImageDimensions(file));
  } catch {
    return {
      ok: false,
      error: 'Não foi possível ler a imagem. Ela pode estar corrompida — envie outro arquivo JPG, PNG ou WebP.',
    };
  }

  return { ok: true, width, height };
}

/**
 * Avisos suaves da medida escolhida — NUNCA bloqueiam o envio (a capa aceita
 * qualquer tamanho). Saem em cor semântica (warning/success) nos dois temas.
 */
export function coverImageWarnings(
  width?: number | null,
  height?: number | null
): CoverImageWarning[] {
  if (!width || !height) return [];
  const { recommended } = COVER_IMAGE_SPEC;
  const ratio = width / height;
  const idealRatio = Math.abs(ratio - 16 / 9) <= 0.02;
  const warnings: CoverImageWarning[] = [];

  if (height > width) {
    warnings.push({
      tone: 'info',
      text: `Imagem vertical (${width}×${height}) — o recorte da capa é horizontal (16:9) e corta o topo e a base. Prefira uma foto deitada.`,
    });
  } else if (!idealRatio) {
    warnings.push({
      tone: 'info',
      text: `Imagem ${width}×${height} — proporção diferente de ${recommended.aspect}; recortamos automaticamente para o enquadramento da capa. Ajuste o ponto focal abaixo.`,
    });
  }
  if (width < 1280) {
    warnings.push({
      tone: 'info',
      text: `Largura ${width}px — em telas grandes pode perder nitidez. Recomendado ${recommended.width}×${recommended.height}.`,
    });
  }
  if (idealRatio && width >= 1280 && height <= width) {
    warnings.push({
      tone: 'ok',
      text: `${width}×${height}px — proporção ${recommended.aspect} em alta resolução. Medidas ideais.`,
    });
  }
  return warnings;
}
