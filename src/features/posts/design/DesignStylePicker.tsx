import type { Dispatch } from 'react';
import { LuCheck as Check } from 'react-icons/lu';
import type { PostDesign } from '../../../infra/postsApi';
import type { DesignAction } from '../designReducer';

function styleLabel(design: PostDesign): string {
  return design.layoutId
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

interface DesignStylePickerProps {
  designs: PostDesign[];
  selectedKey?: string;
  dispatch: Dispatch<DesignAction>;
}

export function DesignStylePicker({
  designs,
  selectedKey,
  dispatch,
}: DesignStylePickerProps) {
  return (
    <section aria-label="Estilos do segmento" className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-text-primary">Estilos</h3>
        <p className="mt-1 text-xs text-text-muted">
          Miniaturas estáticas do catálogo do seu segmento. Trocar o estilo preserva conteúdo e ajustes.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {designs.map(design => {
          const selected = design.key === selectedKey;
          return (
            <button
              key={`${design.key}@${design.version}`}
              type="button"
              aria-pressed={selected}
              aria-label={`Selecionar estilo ${styleLabel(design)}`}
              onClick={() => dispatch({
                type: 'select-design',
                designKey: design.key,
                designVersion: design.version,
              })}
              className={`overflow-hidden rounded-xl border text-left transition ${
                selected
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface hover:border-accent/50'
              }`}
            >
              <div className="relative aspect-[4/5] bg-surface-2">
                {design.thumbnailUrl ? (
                  <img
                    src={design.thumbnailUrl}
                    alt={`Miniatura do estilo ${styleLabel(design)}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center p-2 text-center text-xs text-text-muted">
                    {styleLabel(design)}
                  </span>
                )}
                {selected ? (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-accent p-1 text-accent-fg">
                    <Check size={12} aria-hidden />
                  </span>
                ) : null}
              </div>
              <span className="block p-2.5 text-xs font-bold text-text-primary">{styleLabel(design)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
