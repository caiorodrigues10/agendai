import React, { useCallback, useRef, useState } from 'react';
import { LuCloudUpload, LuImage, LuTrash2 } from 'react-icons/lu';
import { COVER_IMAGE_SPEC } from '../../shared/imageSpecs';
import { buildCoverUrl } from '../../shared/coverImage';
import { CloudinaryUploadError } from '../../infra/cloudinaryDirectUpload';
import type { UploadCoverOptions } from '../../infra/pageThemeApi';
import { CoverFocalEditor } from './CoverFocalEditor';
import { coverImageWarnings, validateCoverFile, type CoverImageWarning } from './validateCoverFile';
import { getErrorMessage } from '../../utils/errorMessage';

interface CoverUploaderProps {
  coverUrl: string | null;
  overlay: number;
  onOverlayChange: (value: number) => void;
  onUpload: (file: File, options?: UploadCoverOptions) => Promise<void>;
  onDelete: () => Promise<void>;
  /** Ponto focal salvo (0–100); com `onFocalChange` habilita o editor. */
  focalX?: number;
  focalY?: number;
  onFocalChange?: (x: number, y: number) => void;
  /** Dimensões originais do arquivo (dica de qualidade; back preenche). */
  coverWidth?: number | null;
  coverHeight?: number | null;
  disabled?: boolean;
}

const SPEC = COVER_IMAGE_SPEC;

/** Avisos da medida escolhida — nunca bloqueiam (cor semântica nos 2 temas). */
const WarningList: React.FC<{ warnings: CoverImageWarning[]; testId: string }> = ({
  warnings,
  testId,
}) => (
  <>
    {warnings.map(warning => (
      <p
        key={warning.text}
        className={`mt-2 rounded-lg border px-3 py-2 text-[11px] font-medium ${
          warning.tone === 'ok'
            ? 'border-success/30 bg-success/10 text-success'
            : 'border-warning/30 bg-warning/10 text-warning'
        }`}
        data-testid={testId}
      >
        {warning.text}
      </p>
    ))}
  </>
);

/** Card de orientação mostrado ANTES de o dono escolher o arquivo. */
export const CoverGuideCard: React.FC = () => (
  <div className="rounded-xl border border-dashed border-border bg-surface-2/50 p-3" data-testid="cover-guide">
    <p className="text-xs font-bold text-text-secondary">
      Recomendado: {SPEC.recommended.width}×{SPEC.recommended.height} px ({SPEC.recommended.aspect}) ·
      JPG, PNG ou WebP
    </p>
    <p className="mt-1 text-[11px] text-text-muted">
      Qualquer outra medida é aceita — recortamos para {SPEC.recommended.aspect} automaticamente.
    </p>
    <div className="mt-2 flex items-center gap-3">
      <div className="relative aspect-video w-28 shrink-0 rounded-lg border border-border-strong bg-bg">
        <div className="absolute inset-x-1.5 bottom-1.5 flex flex-col items-center gap-0.5 rounded-md border border-dashed border-accent/60 px-1 py-1">
          <div className="h-2.5 w-2.5 rounded-full bg-accent/70" />
          <div className="h-1 w-12 rounded bg-text-muted/50" />
        </div>
      </div>
      <p className="min-w-0 text-[11px] text-text-muted">
        Use foto horizontal, sem texto nas bordas. A área tracejada (avatar + nome) fica no
        rodapé da capa — mantenha o fundo importante no topo e nas laterais.
      </p>
    </div>
  </div>
);

/** Barra de progresso + cancelar durante o envio DIRETO ao Cloudinary. */
const CoverUploadProgress: React.FC<{ percent: number; onCancel: () => void }> = ({
  percent,
  onCancel,
}) => (
  <div className="mt-3 flex items-center gap-3" data-testid="cover-progress-wrap">
    <div
      role="progressbar"
      aria-label="Progresso do envio da capa"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"
      data-testid="cover-progress"
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-200"
        style={{ width: `${percent}%` }}
      />
    </div>
    <button
      type="button"
      onClick={onCancel}
      className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-text-secondary hover:border-danger/40 hover:text-danger"
      data-testid="cover-cancel"
    >
      Cancelar
    </button>
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
        {SPEC.recommended.width}×{SPEC.recommended.height} ({SPEC.recommended.aspect}) — ou
        qualquer outra medida
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

/** Card do arquivo escolhido (aguardando "Enviar capa") + avisos da medida. */
const CoverPendingCard: React.FC<{
  pendingFile: { file: File; preview: string; width?: number; height?: number };
  busy: boolean;
  progress: number | null;
  disabled?: boolean;
  onSend: () => void;
  onCancel: () => void;
}> = ({ pendingFile, busy, progress, disabled, onSend, onCancel }) => (
  <div className="rounded-xl border border-border bg-surface p-3" data-testid="cover-pending">
    <div className="flex flex-wrap items-center gap-3">
      <img
        src={pendingFile.preview}
        alt="Pré-visualização da capa selecionada"
        className="h-16 w-28 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 grow shrink basis-40">
        <p className="truncate text-xs font-bold text-text-primary" title={pendingFile.file.name}>
          {pendingFile.file.name}
        </p>
        <p className="text-[11px] text-text-muted">Pronta para enviar ao Cloudinary.</p>
      </div>
      <button
        type="button"
        onClick={onSend}
        disabled={busy || disabled}
        className="ml-auto shrink-0 whitespace-nowrap rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg disabled:opacity-50"
        data-testid="cover-send"
      >
        {busy ? `Enviando… ${progress ?? 0}%` : 'Enviar capa'}
      </button>
    </div>
    <WarningList
      warnings={coverImageWarnings(pendingFile.width, pendingFile.height)}
      testId="cover-warning"
    />
    {busy && <CoverUploadProgress percent={progress ?? 0} onCancel={onCancel} />}
  </div>
);

/** Capa publicada: editor de enquadramento (ou prévia simples) + remover. */
const CoverCurrentCard: React.FC<{
  coverUrl: string;
  overlay: number;
  focalX?: number;
  focalY?: number;
  onFocalChange?: (x: number, y: number) => void;
  coverWidth?: number | null;
  coverHeight?: number | null;
  deleting: boolean;
  disabled?: boolean;
  onDelete: () => void;
}> = ({
  coverUrl,
  overlay,
  focalX,
  focalY,
  onFocalChange,
  coverWidth,
  coverHeight,
  deleting,
  disabled,
  onDelete,
}) => (
  <div className="rounded-xl border border-border bg-surface p-3" data-testid="cover-current">
    {onFocalChange ? (
      <div className="mb-2">
        <CoverFocalEditor
          coverUrl={coverUrl}
          focalX={focalX ?? 50}
          focalY={focalY ?? 50}
          onFocalChange={onFocalChange}
          coverWidth={coverWidth}
          coverHeight={coverHeight}
          overlay={overlay}
          disabled={disabled || deleting}
        />
      </div>
    ) : (
      <div className="relative mb-2 overflow-hidden rounded-lg">
        <img
          src={buildCoverUrl(coverUrl, { width: 640 })}
          alt="Capa atual da página"
          className="h-24 w-full object-cover"
        />
        <div className="absolute inset-0 bg-black" style={{ opacity: overlay / 100 }} aria-hidden="true" />
      </div>
    )}
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2 text-xs text-text-muted">
        <LuImage size={14} /> Capa publicada
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting || disabled}
        className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-danger/40 px-2.5 py-1.5 text-xs font-bold text-danger disabled:opacity-50"
        data-testid="cover-delete"
      >
        <LuTrash2 size={14} />
        {deleting ? 'Removendo…' : 'Remover'}
      </button>
    </div>
    <WarningList warnings={coverImageWarnings(coverWidth, coverHeight)} testId="cover-warning" />
  </div>
);

/**
 * Uploader de capa com validação instantânea (camada 1: tipo real via
 * `createImageBitmap`). QUALQUER medida é aceita — fora do ideal vira aviso
 * suave, nunca erro. O envio é DIRETO ao Cloudinary (sem MB definidos pelo
 * app): mostra progresso real e botão Cancelar; o back confirma o recurso
 * antes de publicar. Com `onFocalChange`, o card atual vira editor de
 * enquadramento (arraste/setas → `coverFocalX/Y` no rascunho).
 */
export const CoverUploader: React.FC<CoverUploaderProps> = ({
  coverUrl,
  overlay,
  onOverlayChange,
  onUpload,
  onDelete,
  focalX,
  focalY,
  onFocalChange,
  coverWidth,
  coverHeight,
  disabled,
}) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{
    file: File;
    preview: string;
    width?: number;
    height?: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (busy) return;
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
    setPendingFile({
      file,
      preview: URL.createObjectURL(file),
      width: result.width,
      height: result.height,
    });
  }, [busy]);

  const send = async () => {
    if (!pendingFile || busy) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await onUpload(pendingFile.file, {
        onProgress: setProgress,
        signal: controller.signal,
      });
      URL.revokeObjectURL(pendingFile.preview);
      setPendingFile(null);
    } catch (err) {
      if (err instanceof CloudinaryUploadError && err.canceled) {
        // cancelado pelo dono: volta a "pronta para enviar", sem alerta de erro
        setProgress(0);
      } else {
        setError(getErrorMessage(err, 'Não foi possível enviar a capa.'));
      }
    } finally {
      setBusy(false);
      setProgress(null);
      abortRef.current = null;
    }
  };

  const remove = async () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await onDelete();
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível remover a capa.'));
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
        <CoverPendingCard
          pendingFile={pendingFile}
          busy={busy}
          progress={progress}
          disabled={disabled}
          onSend={() => void send()}
          onCancel={() => abortRef.current?.abort()}
        />
      )}

      {coverUrl && !pendingFile && (
        <CoverCurrentCard
          coverUrl={coverUrl}
          overlay={overlay}
          focalX={focalX}
          focalY={focalY}
          onFocalChange={onFocalChange}
          coverWidth={coverWidth}
          coverHeight={coverHeight}
          deleting={deleting}
          disabled={disabled}
          onDelete={() => void remove()}
        />
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
