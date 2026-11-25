import { useState } from 'react';
import { LuPlus as Plus, LuTrash2 as Trash2 } from 'react-icons/lu';
import { Button } from '../../../../components/ui/Button';
import { Field, FIELD_CONTROL } from '../../../../components/ui/Field';
import { SmartSelect } from '../../../../components/ui/SmartSelect';
import type { DesignService } from '../../../../infra/postsApi';
import type { Service } from '../../../../types';
import {
  allowsServiceNames,
  allowsServicePrice,
  PanelHeading,
  PanelNotice,
  type DesignPanelProps,
} from '../panelShared';

interface ServicesPanelProps extends DesignPanelProps {
  shopServices: Service[];
  icons?: string[];
}

export default function ServicesPanel({
  state,
  dispatch,
  design,
  shopServices,
  icons,
}: ServicesPanelProps) {
  const services = state.designContent.services ?? [];
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const showNames = allowsServiceNames(design);
  const showPrice = allowsServicePrice(design);
  const iconOptions = icons?.length
    ? icons
    : design.heroIcon
      ? [design.heroIcon]
      : [];

  const updateService = (index: number, patch: Partial<DesignService>) => {
    dispatch({
      type: 'set-content-services',
      services: services.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, ...patch } : service,
      ),
    });
  };

  const importServices = () => {
    const candidates = shopServices.filter(service => service.name.trim());
    const imported = candidates
      .map((service): DesignService | undefined => {
        const name = service.name.trim();
        if (name.length > 80) return undefined;
        const price = typeof service.price === 'number' && service.price >= 0 && service.price <= 1_000_000
          ? service.price
          : undefined;
        return {
          name,
          icon: iconOptions.includes(service.icon) ? service.icon : iconOptions[0],
          ...(showPrice && price !== undefined ? { price } : {}),
        };
      })
      .filter((service): service is DesignService => Boolean(service))
      .slice(0, 8);
    const skipped = candidates.length - imported.length;
    setImportNotice(skipped > 0 ? `${skipped} serviço(s) não compatível(is) com o design foi omitido.` : null);
    if (!imported.length) return;
    dispatch({ type: 'set-content-services', services: imported });
  };

  if (!showNames) {
    return (
      <section aria-label="Serviços" className="space-y-4">
        <PanelHeading title="Serviços" />
        <PanelNotice>Esta composição não possui um bloco de serviços.</PanelNotice>
      </section>
    );
  }

  return (
    <section aria-label="Serviços" className="space-y-4">
      <PanelHeading
        title="Serviços"
        description="Até 8 serviços. O nome é o dado enviado; o ícone acompanha o segmento do salão."
      />

      <div className="space-y-3">
        {services.map((service, index) => (
          <div key={index} className="rounded-xl border border-border bg-surface p-3">
            <div className="flex gap-2">
              <Field label={`Nome do serviço ${index + 1}`} className="min-w-0 flex-1">
                <input
                  type="text"
                  value={service.name}
                  maxLength={80}
                  onChange={event => updateService(index, { name: event.target.value })}
                  placeholder="Ex.: Corte social"
                  className={FIELD_CONTROL}
                />
              </Field>
              {showPrice ? (
                <Field label={`Preço do serviço ${index + 1}`} className="w-32 shrink-0">
                  <input
                    type="number"
                    min={0}
                    max={1_000_000}
                    step="0.01"
                    value={service.price ?? ''}
                    onChange={event => {
                      const raw = event.target.value;
                      updateService(index, { price: raw === '' ? undefined : Number(raw) });
                    }}
                    placeholder="Opcional"
                    className={FIELD_CONTROL}
                  />
                </Field>
              ) : null}
              <button
                type="button"
                onClick={() => dispatch({
                  type: 'set-content-services',
                  services: services.filter((_, serviceIndex) => serviceIndex !== index),
                })}
                disabled={services.length <= 1}
                className="mt-6 h-11 rounded-lg px-2 text-text-muted hover:text-danger disabled:opacity-40"
                aria-label={`Remover serviço ${index + 1}`}
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </div>
            <div className="mt-3">
              <SmartSelect
                label={`Ícone do serviço ${index + 1}`}
                value={service.icon && iconOptions.includes(service.icon) ? service.icon : null}
                options={iconOptions.map(icon => ({ value: icon, label: icon }))}
                placeholder="Escolha um ícone do segmento"
                onChange={value => updateService(index, { icon: value ?? undefined })}
              />
            </div>
          </div>
        ))}
      </div>

      {importNotice ? <PanelNotice>{importNotice}</PanelNotice> : null}

      <div className="flex flex-wrap gap-2">
        {services.length < 8 ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch({
              type: 'set-content-services',
              services: [...services, { name: '' }],
            })}
            className="gap-1.5"
          >
            <Plus size={14} aria-hidden /> Adicionar serviço
          </Button>
        ) : null}
        {shopServices.length ? (
          <Button variant="secondary" size="sm" onClick={importServices} className="gap-1.5">
            Importar do catálogo do salão
          </Button>
        ) : null}
      </div>
    </section>
  );
}
