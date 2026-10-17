import {
  COVER_IMAGE_SPEC,
  describeImageDimensionError,
  type ImageSpec,
} from '../../shared/imageSpecs';

export interface CoverFileValidation {
  ok: boolean;
  error?: string;
  width?: number;
  height?: number;
}

function sizeErrorMessage(bytes: number, spec: ImageSpec): string {
  const mb = (bytes / 1024 / 1024).toFixed(2).replace(/\.?0+$/, '');
  const maxMb = (spec.maxBytes / 1024 / 1024).toString();
  return `Sua imagem tem ${mb} MB. O máximo permitido é ${maxMb} MB.`;
}

function ratioErrorMessage(width: number, height: number, spec: ImageSpec): string {
  return (
    `Sua imagem tem ${width}×${height}, que não é ${spec.ratioLabel}. ` +
    `Envie exatamente ${spec.recommendedWidth}×${spec.recommendedHeight} ` +
    `(proporção ${spec.ratioLabel}).`
  );
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
 * Validação INSTANTÂNEA no front (camada 1 de 3). Nada é enviado ao back se
 * `ok` for false — sem "enviar mesmo assim", sem recorte escondido. O back
 * revalida tudo com sharp (autoridade) e o Cloudinary aplica limites do preset.
 */
export async function validateCoverFile(
  file: File,
  spec: ImageSpec = COVER_IMAGE_SPEC
): Promise<CoverFileValidation> {
  const mimeType = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  if (!mimeType || !spec.allowedMimeTypes[mimeType]) {
    return {
      ok: false,
      error: `Tipo de arquivo não permitido${mimeType ? `: "${mimeType}"` : ''}. Aceitos: JPG, PNG, WebP.`,
    };
  }

  if (file.size > spec.maxBytes) {
    return { ok: false, error: sizeErrorMessage(file.size, spec) };
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

  if (width < spec.minWidth || height < spec.minHeight) {
    return { ok: false, error: describeImageDimensionError(spec, width, height), width, height };
  }
  if (width > spec.maxWidth || height > spec.maxHeight) {
    return {
      ok: false,
      error: `Sua imagem tem ${width}×${height}. O máximo permitido é ${spec.maxWidth}×${spec.maxHeight}.`,
      width,
      height,
    };
  }
  if (Math.abs(width / height - spec.ratio) > spec.ratioTolerance) {
    return { ok: false, error: ratioErrorMessage(width, height, spec), width, height };
  }

  return { ok: true, width, height };
}
