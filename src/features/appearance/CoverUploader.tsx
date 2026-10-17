import React, { useCallback, useRef, useState } from 'react';
import { LuCloudUpload, LuImage, LuTrash2 } from 'react-icons/lu';
import { COVER_IMAGE_SPEC } from '../../shared/imageSpecs';
import { cloudinaryDeliveryUrl } from './themeVars';
import { validateCoverFile } from './validateCoverFile';

interface CoverUploaderProps {
  coverUrl: string | null;
  overlay: number;
  onOverlayChange: (value: number) => void;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  disabled?: boolean;
}

const SPEC = COVER_IMAGE_SPEC;

/** Card de orientação mostrado ANTES de o dono escolher o arquivo. */
export const CoverGuideCard: React.FC = () => (
  <div className="rounded-xl border border-dashed border-border bg-surface-2/50 p-3" data-testid="cover-guide">
    <p className="text-xs font-bold text-text-secondary">
      {SPEC.recommendedWidth}×{SPEC.recommendedHeight} px · {SPEC.ratioLabel} · até{' '}
      {SPEC.maxBytes / 1024 / 1024} MB · JPG, PNG ou WebP
    </p>
    <div className="mt-2 flex items-center gap-3">
      <div className="relative aspect-video w-28 shrink-0 rounded-lg border border-border-strong bg-bg">
        <div className="absolute inset-x-1.5 bottom-1.5 flex flex-col items-center gap-0.5 rounded-md border border-dashed border-accent/60 px-1 py-1">
          <div className="h-2.5 w-2.5 rounded-full bg-accent/70" />
          <div className="h-1 w-12 rounded bg-text-muted/50" />
        </div>
      </div>
      <p className="text-[11px] text-text-muted">
        Use foto horizontal, sem texto nas bordas. A área tracejada (avatar + nome) fica no
        rodapé da capa — mantenha o fundo importante no topo e nas laterais.
      </p>
    </div>
  </div>
);

const CoverDropzone: React.FC<{ onFile: (file: File) => void; dragging: boolean; setDragging: (v: boolean) => void }> = ({
  onFile,
  dragging,
  setDragging,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Selecionar imagem de capa (arraste ou pressione Enter)"
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={e => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
        dragging ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
      }`}
      data-testid="cover-dropzone"
    >
      <LuCloudUpload className="text-text-muted" size={24} />
      <p className="text-sm font-medium text-text-secondary">Arraste a capa aqui ou clique para escolher</p>
      <p className="text-[11px] text-text-muted">
        {SPEC.recommendedWidth}×{SPEC.recommendedHeight} ({SPEC.ratioLabel}), até{' '}
        {SPEC.maxBytes / 1024 / 1024} MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={Object.keys(SPEC.allowedMimeTypes).join(',')}
        className="hidden"
        data-testid="cover-file-input"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
};

/**
 * Uploader de capa com validação instantânea (camada 1: tipo real, peso,
 * dimensões e proporção via `createImageBitmap`). Arquivo reprovado NÃO é
 * enviado — o back revalida com sharp antes de subir ao Cloudinary.
 */
export const CoverUploader: React.FC<CoverUploaderProps> = ({
  coverUrl,
  overlay,
  onOverlayChange,
  onUpload,
  onDelete,
  disabled,
}) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ file: File; preview: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setPendingFile(prev => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return null;
    });
    const result = await validateCoverFile(file, SPEC);
    if (!result.ok) {
      setError(result.error ?? 'Imagem inválida.');
      return;
    }
    setPendingFile({ file, preview: URL.createObjectURL(file) });
  }, []);

  const send = async () => {
    if (!pendingFile || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onUpload(pendingFile.file);
      URL.revokeObjectURL(pendingFile.preview);
      setPendingFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a capa.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível remover a capa.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section aria-labelledby="cover-uploader-title" className="space-y-3">
      <div>
        <h3 id="cover-uploader-title" className="text-sm font-bold text-text-primary">
          Imagem de capa
        </h3>
        <p className="text-xs text-text-muted">Plano de fundo do topo da página pública.</p>
      </div>

      <CoverGuideCard />
      <CoverDropzone onFile={file => void handleFile(file)} dragging={dragging} setDragging={setDragging} />

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger"
          data-testid="cover-error"
        >
          {error}
        </p>
      )}

      {pendingFile && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3" data-testid="cover-pending">
          <img
            src={pendingFile.preview}
            alt="Pré-visualização da capa selecionada"
            className="h-16 w-28 rounded-lg object-cover"
          />
          <div className="flex-1">
            <p className="text-xs font-bold text-text-primary">{pendingFile.file.name}</p>
            <p className="text-[11px] text-text-muted">Pronta para enviar ao Cloudinary.</p>
          </div>
          <button
            type="button"
            onClick={() => void send()}
            disabled={busy || disabled}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg disabled:opacity-50"
            data-testid="cover-send"
          >
            {busy ? 'Enviando…' : 'Enviar capa'}
          </button>
        </div>
      )}

      {coverUrl && !pendingFile && (
        <div className="rounded-xl border border-border bg-surface p-3" data-testid="cover-current">
          <div className="relative mb-2 overflow-hidden rounded-lg">
            <img
              src={cloudinaryDeliveryUrl(coverUrl, 640)}
              alt="Capa atual da página"
              className="h-24 w-full object-cover"
            />
            <div className="absolute inset-0 bg-black" style={{ opacity: overlay / 100 }} aria-hidden="true" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <LuImage size={14} /> Capa publicada
            </div>
            <button
              type="button"
              onClick={() => void remove()}
              disabled={deleting || disabled}
              className="flex items-center gap-1 rounded-lg border border-danger/40 px-2.5 py-1.5 text-xs font-bold text-danger disabled:opacity-50"
              data-testid="cover-delete"
            >
              <LuTrash2 size={14} />
              {deleting ? 'Removendo…' : 'Remover'}
            </button>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="cover-overlay" className="mb-1.5 block text-sm font-medium text-text-secondary">
          Escurecimento da capa: <span className="font-bold text-text-primary">{overlay}%</span>
        </label>
        <input
          id="cover-overlay"
          type="range"
          min={0}
          max={80}
          step={5}
          value={overlay}
          disabled={disabled}
          onChange={e => onOverlayChange(Number(e.target.value))}
          className="w-full accent-[var(--ag-accent)]"
          data-testid="cover-overlay"
        />
        <p className="text-[11px] text-text-muted">
          Ajusta a legibilidade do avatar, título e botões sobre a foto.
        </p>
      </div>
    </section>
  );
};
