import { Button } from '../../../../components/ui/Button';
import { Field, FIELD_CONTROL } from '../../../../components/ui/Field';
import { SmartSelect } from '../../../../components/ui/SmartSelect';
import { PanelHeading, PanelNotice, type DesignPanelProps } from '../panelShared';

const SHAPE_OPTIONS = [
  { value: 'round', label: 'Redonda' },
  { value: 'square', label: 'Quadrada' },
  { value: 'none', label: 'Sem forma' },
];

export default function LogoContactsPanel({ state, dispatch }: DesignPanelProps) {
  const content = state.designContent;
  const shape = state.designOverrides.logo?.shape;
  const logoHidden = content.logoUrl === null;
  const hasCustomLogo = typeof content.logoUrl === 'string' && content.logoUrl.length > 0;
  const whatsappHidden = content.whatsapp === null;
  const hasCustomWhatsapp = typeof content.whatsapp === 'string' && content.whatsapp.length > 0;

  return (
    <section aria-label="Logo e contatos" className="space-y-4">
      <PanelHeading
        title="Logo e contatos"
        description="A logo oficial do salão é usada por padrão. Informe apenas dados que você quer exibir."
      />

      <PanelNotice>
        A logo oficial do salão é usada por padrão. Você pode mudar apenas o formato ou ocultá-la.
      </PanelNotice>

      <SmartSelect
        label="Formato da logo"
        value={shape ?? null}
        options={SHAPE_OPTIONS}
        placeholder="Padrão da composição"
        onChange={value => dispatch({ type: 'set-logo', logo: { shape: value ?? undefined } })}
      />

      {logoHidden ? (
        <>
          <p className="text-xs text-text-secondary">A logo do salão está oculta nesta arte.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch({
              type: 'set-content-nullable-field',
              field: 'logoUrl',
              value: '',
            })}
          >
            Usar logo do salão
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch({
              type: 'set-content-nullable-field',
              field: 'logoUrl',
              value: null,
            })}
          >
            Ocultar logo do salão
          </Button>
          {hasCustomLogo ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({
                type: 'set-content-nullable-field',
                field: 'logoUrl',
                value: '',
              })}
            >
              Voltar a usar a logo do salão
            </Button>
          ) : null}
        </>
      )}

      {!logoHidden ? (
        <details className="rounded-xl border border-border bg-surface p-3">
          <summary className="cursor-pointer text-xs font-bold text-text-secondary">
            Usar URL personalizada de logo
          </summary>
          <div className="mt-3">
            <Field label="URL personalizada da logo" hint="Opção avançada; a logo do salão é o fluxo principal.">
              <input
                type="url"
                value={content.logoUrl ?? ''}
                maxLength={10_000}
                onChange={event => dispatch({
                  type: 'set-content-nullable-field',
                  field: 'logoUrl',
                  value: event.target.value,
                })}
                placeholder="https://..."
                className={FIELD_CONTROL}
              />
            </Field>
          </div>
        </details>
      ) : null}

      <Field
        label="WhatsApp personalizado"
        hint={whatsappHidden ? 'O fallback do salão está suprimido.' : 'Deixe vazio para usar o WhatsApp do salão.'}
      >
        <input
          type="tel"
          value={whatsappHidden ? '' : content.whatsapp ?? ''}
          maxLength={20}
          disabled={whatsappHidden}
          onChange={event => dispatch({
            type: 'set-content-nullable-field',
            field: 'whatsapp',
            value: event.target.value,
          })}
          placeholder="(00) 00000-0000"
          className={FIELD_CONTROL}
        />
      </Field>

      {whatsappHidden ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => dispatch({
            type: 'set-content-nullable-field',
            field: 'whatsapp',
            value: '',
          })}
        >
          Usar WhatsApp do salão
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => dispatch({
            type: 'set-content-nullable-field',
            field: 'whatsapp',
            value: null,
          })}
        >
          Ocultar WhatsApp do salão
        </Button>
      )}
      {hasCustomWhatsapp ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({
            type: 'set-content-nullable-field',
            field: 'whatsapp',
            value: '',
          })}
        >
          Voltar a usar o WhatsApp do salão
        </Button>
      ) : null}

      <Field label="Instagram" hint="Opcional. Até 40 caracteres.">
        <input
          type="text"
          value={content.instagram ?? ''}
          maxLength={40}
          onChange={event => dispatch({
            type: 'set-content-nullable-field',
            field: 'instagram',
            value: event.target.value,
          })}
          placeholder="@seuperfil"
          className={FIELD_CONTROL}
        />
      </Field>

      <Field label="Endereço" hint="Opcional. Até 120 caracteres.">
        <input
          type="text"
          value={content.address ?? ''}
          maxLength={120}
          onChange={event => dispatch({
            type: 'set-content-nullable-field',
            field: 'address',
            value: event.target.value,
          })}
          placeholder="Rua, número e bairro"
          className={FIELD_CONTROL}
        />
      </Field>
    </section>
  );
}
