import React from 'react';
import { ShopSettings } from '../../types';
import { LuMapPin as MapPin } from 'react-icons/lu';
import { Field, FIELD_CONTROL } from '../../components/ui/Field';

export const ShopCityField: React.FC<{
  city: string;
  onCityChange: (value: string) => void;
  settings: ShopSettings;
}> = ({ city, onCityChange, settings }) => {
  const cityTrim = city.trim();
  const locationReady =
    settings.latitude != null &&
    settings.longitude != null &&
    (settings.city || cityTrim).trim().length > 0;

  return (
    <div>
      <Field label="Cidade">
        <input
          id="shop-city"
          value={city}
          onChange={e => onCityChange(e.target.value)}
          className={FIELD_CONTROL}
          placeholder="São Paulo"
        />
      </Field>
      <p className={`mt-1.5 text-[11px] flex items-start gap-1.5 ${locationReady ? 'text-success' : 'text-text-muted'}`}>
        <MapPin size={12} className="mt-0.5 shrink-0" />
        <span>
          {locationReady
            ? `Previsão do tempo ativa para ${settings.city || cityTrim}.`
            : cityTrim
              ? 'Clique em Salvar Configurações para localizar a cidade e carregar o clima.'
              : 'Necessária para a previsão de demanda baseada no clima.'}
        </span>
      </p>
    </div>
  );
};
