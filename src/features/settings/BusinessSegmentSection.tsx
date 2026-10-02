import React, { useState } from 'react';
import { ShopSettings, BusinessSegment } from '../../types';
import { SmartSelect } from '../../components/ui/SmartSelect';
import { getErrorMessage } from '../../utils/errorMessage';

const SEGMENT_OPTIONS: { value: BusinessSegment; label: string }[] = [
  { value: 'BARBERSHOP', label: 'Barbearia' },
  { value: 'HAIR_SALON', label: 'Salão de cabelo' },
  { value: 'BEAUTY_STUDIO', label: 'Studio de beleza' },
  { value: 'NAIL_STUDIO', label: 'Unhas' },
  { value: 'LASH_BROW_STUDIO', label: 'Cílios e sobrancelhas' },
  { value: 'AESTHETICS', label: 'Estética' },
  { value: 'SPA', label: 'Spa' },
  { value: 'OTHER', label: 'Outro' },
];

export const BusinessSegmentSection: React.FC<{
  settings: ShopSettings;
  onNotify: (message: string, type: 'success' | 'error') => void;
  onSave: (settings: ShopSettings) => void;
}> = ({ settings, onNotify, onSave }) => {
  const [saving, setSaving] = useState(false);
  const current = settings.businessSegment ?? 'OTHER';
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-lg font-bold text-text-primary mb-1">Tipo do estabelecimento</h3>
      <p className="text-xs text-text-muted mb-4">
        Só orienta sugestões de catálogo. Não altera plano, URL pública, fila ou agenda.
      </p>
      <SmartSelect
        options={SEGMENT_OPTIONS}
        value={current}
        disabled={saving}
        clearable={false}
        searchable={false}
        placeholder="Selecione o tipo…"
        onChange={async (value) => {
          if (!value) return;
          const businessSegment = value as BusinessSegment;
          setSaving(true);
          try {
            await onSave({ ...settings, businessSegment });
            onNotify('Tipo do estabelecimento atualizado.', 'success');
          } catch (err) {
            onNotify(getErrorMessage(err, 'Não foi possível salvar o tipo.'), 'error');
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
};
