import React, { useRef } from 'react';
import { buildCoverSourceUrl, coverObjectPosition } from '../../shared/coverImage';

interface CoverFocalEditorProps {
  coverUrl: string;
  /** Ponto focal 0–100 (percentual do original). */
  focalX: number;
  focalY: number;
  onFocalChange: (x: number, y: number) => void;
  /** Dimensões originais do arquivo (fonte sem recorte + dica de qualidade). */
  coverWidth?: number | null;
  coverHeight?: number | null;
  /** Escurecimento 0–80 (mesmo slider da capa) sobre a prévia. */
  overlay?: number;
  disabled?: boolean;
}

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const FOCAL_SHORTCUTS = [
  { label: 'Centros', x: 50, y: 50, testId: 'cover-focal-center' },
  { label: 'Topo', x: 50, y: 20, testId: 'cover-focal-top' },
  { label: 'Base', x: 50, y: 80, testId: 'cover-focal-bottom' },
] as const;

const KEY_STEPS: Record<string, readonly [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

/**
 * Editor de enquadramento (ponto focal) da capa: arraste com o mouse/toque ou
 * setas do teclado (Shift = passo 10). Renderiza o ORIGINAL sem recorte
 * (`buildCoverSourceUrl`) e move só o `object-position` — o arraste é fluido e
 * não rebuscar a rede; o recorte 16:9 de verdade acontece na entrega
 * (`shared/coverImage.ts`) quando o tema é salvo.
 */
export const CoverFocalEditor: React.FC<CoverFocalEditorProps> = ({
  coverUrl,
  focalX,
  focalY,
  onFocalChange,
  coverWidth,
  coverHeight,
  overlay = 0,
  disabled = false,
}) => {
  const frameRef = useRef<HTMLButtonElement>(null);
  const draggingRef = useRef(false);

  const updateFromPointer = (clientX: number, clientY: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    onFocalChange(
      clamp(((clientX - rect.left) / rect.width) * 100),
      clamp(((clientY - rect.top) / rect.height) * 100),
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const arrow = KEY_STEPS[event.key];
    if (!arrow) return;
    event.preventDefault();
    const step = event.shiftKey ? 10 : 2;
    onFocalChange(clamp(focalX + arrow[0] * step), clamp(focalY + arrow[1] * step));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-text-secondary">Enquadramento da capa</p>
        <p
          className="text-[11px] text-text-muted"
          data-testid="cover-focal-value"
          aria-live="polite"
        >
          {focalX}% · {focalY}%
        </p>
      </div>
      <button
        ref={frameRef}
        type="button"
        aria-label={`Ponto focal da capa: ${focalX}% horizontal, ${focalY}% vertical. Use as setas do teclado para ajustar.`}
        aria-describedby="cover-focal-hint"
        tabIndex={disabled ? -1 : 0}
        data-testid="cover-focal-editor"
        className={`relative block aspect-video w-full touch-none select-none overflow-hidden rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-accent ${
          disabled ? 'opacity-60' : 'cursor-grab active:cursor-grabbing'
        }`}
        onPointerDown={event => {
          if (disabled) return;
          event.preventDefault();
          draggingRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event.clientX, event.clientY);
        }}
        onPointerMove={event => {
          if (!draggingRef.current || disabled) return;
          updateFromPointer(event.clientX, event.clientY);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
        onKeyDown={handleKeyDown}
      >
        <img
          src={buildCoverSourceUrl(coverUrl, {
            originalWidth: coverWidth,
            originalHeight: coverHeight,
          })}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: coverObjectPosition(focalX, focalY) }}
        />
        <span
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: Math.min(Math.max(overlay, 0), 80) / 100 }}
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent/70 shadow"
          style={{ left: `${focalX}%`, top: `${focalY}%` }}
          data-testid="cover-focal-marker"
          aria-hidden="true"
        />
      </button>
      <div className="flex flex-wrap items-center gap-2">
        {FOCAL_SHORTCUTS.map(shortcut => (
          <button
            key={shortcut.label}
            type="button"
            disabled={disabled}
            onClick={() => onFocalChange(shortcut.x, shortcut.y)}
            className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-bold text-text-secondary hover:border-accent/60 hover:text-accent disabled:opacity-50"
            data-testid={shortcut.testId}
          >
            {shortcut.label}
          </button>
        ))}
        <p id="cover-focal-hint" className="text-[11px] text-text-muted">
          Arraste ou use as setas do teclado — lembre de salvar a aparência.
        </p>
      </div>
      {coverWidth && coverHeight ? (
        <p className="text-[11px] text-text-muted">
          Original {coverWidth}×{coverHeight}px.
        </p>
      ) : null}
    </div>
  );
};
