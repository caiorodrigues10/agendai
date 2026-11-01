import React, { useState } from 'react';
import { RiAddLine, RiDeleteBin6Line } from 'react-icons/ri';
import { ShopSettings } from '../../types';
import { Field, FIELD_CONTROL } from '../../components/ui/Field';
import { getErrorMessage } from '../../utils/errorMessage';

/** Sugestões de áreas de atuação — apenas sugestão: o dono edita livremente. */
export const PRACTICE_AREA_SUGGESTIONS = [
  'Cível',
  'Trabalhista',
  'Família e Sucessões',
  'Criminal',
  'Tributário',
  'Previdenciário',
  'Empresarial',
  'Consumidor',
  'Imobiliário',
  'Digital/LGPD',
];

const MAX_AREAS = 20;
const MAX_TAG_LENGTH = 60;

/**
 * Áreas de atuação e registro na OAB do escritório.
 *
 * As áreas são tags livres configuráveis: aparecem no perfil público e
 * classificam um atendimento. O registro na OAB é texto opcional com
 * validação leve de formato (UF + número), sem consulta externa.
 */
export const ProfessionalProfileSection: React.FC<{
  settings: ShopSettings;
  onNotify: (message: string, type: 'success' | 'error') => void;
  onSave: (settings: ShopSettings) => void | Promise<void>;
}> = ({ settings, onNotify, onSave }) => {
  const [areas, setAreas] = useState<string[]>(settings.practiceAreas ?? []);
  const [oab, setOab] = useState(settings.oabRegistration ?? '');
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const addArea = (value: string) => {
    const tag = value.trim();
    if (!tag) return;
    if (tag.length > MAX_TAG_LENGTH) {
      onNotify(`"${tag}" é muito longa (máximo ${MAX_TAG_LENGTH} caracteres).`, 'error');
      return;
    }
    if (areas.some(area => area.toLowerCase() === tag.toLowerCase())) {
      onNotify('Essa área já está na lista.', 'error');
      return;
    }
    if (areas.length >= MAX_AREAS) {
      onNotify(`Máximo de ${MAX_AREAS} áreas de atuação.`, 'error');
      return;
    }
    setAreas([...areas, tag]);
    setDraft('');
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave({
        ...settings,
        practiceAreas: areas,
        oabRegistration: oab.trim() || null,
      });
      onNotify('Dados do escritório atualizados.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível salvar.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-lg font-bold text-text-primary mb-1">Áreas de atuação</h3>
      <p className="text-xs text-text-muted mb-4">
        Tags do escritório. Aparecem no perfil público e podem classificar um
        atendimento.
      </p>

      {areas.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2">
          {areas.map(area => (
            <li
              key={area}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent"
            >
              {area}
              <button
                type="button"
                onClick={() => setAreas(areas.filter(item => item !== area))}
                className="rounded-full p-0.5 hover:bg-accent/20"
                aria-label={`Remover ${area}`}
              >
                <RiDeleteBin6Line size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addArea(draft);
            }
          }}
          placeholder="Ex.: Cível"
          maxLength={MAX_TAG_LENGTH}
          className={FIELD_CONTROL}
          aria-label="Nova área de atuação"
        />
        <button
          type="button"
          onClick={() => addArea(draft)}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl border border-border px-3 text-xs font-bold text-text-secondary hover:border-accent/50 hover:text-accent"
        >
          <RiAddLine size={14} /> Adicionar
        </button>
      </div>

      {areas.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRACTICE_AREA_SUGGESTIONS.map(suggestion => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addArea(suggestion)}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] font-bold text-text-muted hover:border-accent/50 hover:text-accent"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5">
        <Field
          label="Registro na OAB"
          hint="Opcional. Ex.: SP 123456. Exibido no perfil como “OAB/SP nº 123456”."
        >
          <input
            value={oab}
            onChange={event => setOab(event.target.value)}
            placeholder="SP 123456"
            maxLength={40}
            className={FIELD_CONTROL}
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-bold text-accent-fg disabled:opacity-50"
      >
        {saving ? 'Salvando…' : 'Salvar áreas e registro'}
      </button>
    </div>
  );
};
