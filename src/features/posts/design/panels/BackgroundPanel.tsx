import { Button } from '../../../../components/ui/Button';
import { Field, FIELD_CONTROL } from '../../../../components/ui/Field';
import { SmartSelect } from '../../../../components/ui/SmartSelect';
import type { DesignBackground } from '../../../../infra/postsApi';
import type { PostMedia } from '../../../../infra/postsApi';
import { HexField, PanelHeading, PanelNotice } from '../panelShared';
import type { DesignPanelProps } from '../panelShared';

const BACKGROUND_OPTIONS = [
  { value: 'none', label: 'Padrão da composição' },
  { value: 'color', label: 'Cor sólida' },
  { value: 'gradient', label: 'Gradiente' },
  { value: 'photo', label: 'Foto' },
];

interface BackgroundPanelProps extends DesignPanelProps {
  mediaLibrary: PostMedia[];
}

export default function BackgroundPanel({ state, dispatch, mediaLibrary }: BackgroundPanelProps) {
  const background = state.designOverrides.background;
  const kind = background?.kind ?? 'none';
  const selectedPhotoId = background?.kind === 'photo'
    ? mediaLibrary.find(media => media.url === background.url)?.id ?? null
    : null;
  const mediaOptions = mediaLibrary.map((media, index) => ({
    value: media.id,
    label: `Foto ${index + 1}`,
  }));

  const selectKind = (nextKind: string | null) => {
    if (!nextKind || nextKind === 'none') {
      dispatch({ type: 'set-background', background: undefined });
      return;
    }
    if (nextKind === 'color') {
      dispatch({
        type: 'set-background',
        background: {
          kind: 'color',
          color: state.designOverrides.colors?.bg ?? '#000000',
        },
      });
      return;
    }
    if (nextKind === 'gradient') {
      dispatch({
        type: 'set-background',
        background: {
          kind: 'gradient',
          stops: [
            { color: state.designOverrides.colors?.bg ?? '#000000', at: 0 },
            { color: state.designOverrides.colors?.panel ?? '#FFFFFF', at: 1 },
          ],
          angle: 0,
        },
      });
      return;
    }
    const firstMedia = mediaLibrary[0];
    dispatch({
      type: 'set-background',
      background: firstMedia ? { kind: 'photo', url: firstMedia.url } : undefined,
    });
  };

  const updateBackground = (next: DesignBackground) => {
    dispatch({ type: 'set-background', background: next });
  };

  return (
    <section aria-label="Fundo" className="space-y-4">
      <PanelHeading
        title="Fundo"
        description="Escolha o fundo da composição. Fotos devem vir da biblioteca de mídia do salão."
      />

      <SmartSelect
        label="Tipo de fundo"
        value={kind}
        options={BACKGROUND_OPTIONS}
        onChange={selectKind}
      />

      {background?.kind === 'color' ? (
        <HexField
          label="Cor do fundo"
          value={background.color}
          onChange={color => updateBackground({ kind: 'color', color })}
        />
      ) : null}

      {background?.kind === 'gradient' ? (
        <div className="space-y-4 rounded-xl border border-border bg-surface p-3">
          {background.stops.slice(0, 2).map((stop, index) => (
            <HexField
              key={index}
              label={index === 0 ? 'Primeira cor' : 'Segunda cor'}
              value={stop.color}
              onChange={color => {
                const stops = background.stops.map((item, stopIndex) =>
                  stopIndex === index ? { ...item, color } : item,
                );
                updateBackground({ ...background, stops });
              }}
            />
          ))}
          <Field label="Ângulo" hint="De 0 a 360 graus.">
            <input
              type="number"
              min={0}
              max={360}
              value={background.angle ?? 0}
              onChange={event => updateBackground({
                ...background,
                angle: Number(event.target.value),
              })}
              className={FIELD_CONTROL}
            />
          </Field>
        </div>
      ) : null}

      {background?.kind === 'photo' ? (
        <div className="space-y-4 rounded-xl border border-border bg-surface p-3">
          <SmartSelect
            label="Escolher foto da biblioteca"
            value={selectedPhotoId}
            options={mediaOptions}
            placeholder="Escolher foto da biblioteca"
            emptyMessage="Nenhuma foto na biblioteca"
            onChange={value => {
              const media = mediaLibrary.find(item => item.id === value);
              if (!media) {
                dispatch({ type: 'set-background', background: undefined });
                return;
              }
              updateBackground({
                kind: 'photo',
                url: media.url,
                ...(background.focal ? { focal: background.focal } : {}),
                ...(background.overlay === undefined ? {} : { overlay: background.overlay }),
              });
            }}
          />
          <Field label="Escurecimento" hint={`${background.overlay ?? 0}% (entre 0 e 80).`}>
            <input
              type="range"
              min={0}
              max={80}
              step={1}
              value={background.overlay ?? 0}
              onChange={event => updateBackground({
                ...background,
                overlay: Number(event.target.value),
              })}
              className="w-full accent-[var(--color-accent)]"
            />
          </Field>
        </div>
      ) : null}

      {kind === 'photo' && !mediaLibrary.length ? (
        <PanelNotice>Envie uma foto para a biblioteca do salão para usar como fundo.</PanelNotice>
      ) : null}

      {background ? (
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'set-background', background: undefined })}>
          Usar fundo padrão
        </Button>
      ) : null}
    </section>
  );
}
