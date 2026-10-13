import React, { useState } from 'react';
import { ShopSettings } from '../../types';
import { SmartSelect } from '../../components/ui/SmartSelect';
import { getErrorMessage } from '../../utils/errorMessage';
import {
  ALL_SEGMENTS,
  AUDIENCE_OPTIONS,
  audienceAppliesTo,
  getSegmentConfig,
  type BusinessSegment,
  type TargetAudience,
} from '../../shared/segments';

const SEGMENT_OPTIONS = ALL_SEGMENTS.map(segment => ({
  value: segment,
  label: getSegmentConfig(segment).labels.segmentLabel,
}));

const AUDIENCE_OPTIONS_SELECT = AUDIENCE_OPTIONS.map(option => ({
  value: option.value,
  label: option.label,
}));

/**
 * Trocar o segmento depois do cadastro muda vocabulário, sugestões de catálogo
 * e o público — mas nunca apaga serviços, categorias ou clientes já criados
 * (o backend só normaliza o par segmento/público no PATCH).
 */
export const BusinessSegmentSection: React.FC<{
  settings: ShopSettings;
  onNotify: (message: string, type: 'success' | 'error') => void;
  onSave: (settings: ShopSettings) => void;
}> = ({ settings, onNotify, onSave }) => {
  const [saving, setSaving] = useState(false);
  const current = settings.businessSegment ?? 'OTHER';
  const audienceApplies = audienceAppliesTo(current);
  const currentAudience = audienceApplies ? (settings.targetAudience ?? null) : null;
  const complianceNote = getSegmentConfig(current).complianceNote;

  const save = async (patch: Partial<ShopSettings>, successMessage: string) => {
    setSaving(true);
    try {
      await onSave({ ...settings, ...patch });
      onNotify(successMessage, 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível salvar.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-lg font-bold text-text-primary mb-1">Tipo do estabelecimento</h3>
      <p className="text-xs text-text-muted mb-4">
        Muda os textos, o vocabulário e as sugestões de catálogo do segmento.{' '}
        <strong className="text-text-secondary">
          Não apaga serviços, categorias ou clientes já criados.
        </strong>
      </p>

      {/* Rótulo visual; o nome acessível vem do aria-label do SmartSelect. */}
      <div className="block text-xs font-bold text-text-secondary mb-1.5">Segmento</div>
      <SmartSelect
        options={SEGMENT_OPTIONS}
        value={current}
        disabled={saving}
        clearable={false}
        searchable={false}
        aria-label="Segmento"
        placeholder="Selecione o tipo…"
        onChange={async (value) => {
          if (!value) return;
          const businessSegment = value as BusinessSegment;
          // O público é reavaliado junto: um petshop não herda o "Masculino"
          // da barbearia, e um salão recém-escolhido ganha o sugerido.
          const targetAudience = audienceAppliesTo(businessSegment)
            ? settings.targetAudience ??
              getSegmentConfig(businessSegment).targetAudience.suggested
            : null;
          await save({ businessSegment, targetAudience }, 'Tipo do estabelecimento atualizado.');
        }}
      />

      {audienceApplies && (
        <div className="mt-4">
          <div className="block text-xs font-bold text-text-secondary mb-1.5">
            Público atendido
          </div>
          <SmartSelect
            options={AUDIENCE_OPTIONS_SELECT}
            value={currentAudience}
            disabled={saving}
            clearable={false}
            searchable={false}
            aria-label="Público atendido"
            placeholder="Selecione o público…"
            onChange={async (value) => {
              if (!value) return;
              await save({ targetAudience: value as TargetAudience }, 'Público atualizado.');
            }}
          />
        </div>
      )}

      {/* Segmentos de saúde: deixa claro que é agenda, não prontuário. */}
      {complianceNote && (
        <p className="mt-4 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning" role="note">
          {complianceNote}
        </p>
      )}
    </div>
  );
};
