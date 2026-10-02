import React, { useState } from 'react';
import { ShopSettings, OperationMode } from '../../types';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { LuLayoutGrid as LayoutGrid, LuUsers as Users, LuCalendarCheck as CalendarCheck } from 'react-icons/lu';

interface OperationModeSectionProps {
  settings: ShopSettings;
  barbershopId?: string;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

const MODE_OPTIONS: {
  value: OperationMode;
  icon: React.ReactNode;
  title: string;
  description: string;
}[] = [
  {
    value: 'HYBRID',
    icon: <LayoutGrid size={20} />,
    title: 'Híbrido',
    description: 'Fila + agenda. Flexível para o cliente escolher.',
  },
  {
    value: 'QUEUE_ONLY',
    icon: <Users size={20} />,
    title: 'Somente Fila',
    description: 'Clientes entram na fila. Sem agendamento.',
  },
  {
    value: 'APPOINTMENTS_ONLY',
    icon: <CalendarCheck size={20} />,
    title: 'Somente Agenda',
    description: 'Clientes agendam horários. Sem fila.',
  },
];

export const OperationModeSection: React.FC<OperationModeSectionProps> = ({
  settings,
  barbershopId,
  onNotify,
}) => {
  const { setOperationMode } = useBarbershop();
  const [saving, setSaving] = useState(false);
  const currentMode = settings.operationMode ?? 'HYBRID';

  const handleSelect = async (mode: OperationMode) => {
    if (mode === currentMode || !barbershopId) return;
    setSaving(true);
    try {
      await setOperationMode(mode);
      onNotify('Modo de atendimento atualizado.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível alterar o modo.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-lg font-bold text-text-primary mb-1">Modo de Atendimento</h3>
      <p className="text-xs text-text-muted mb-4">
        Define como seus clientes entram: pela fila, pela agenda ou ambos.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {MODE_OPTIONS.map(opt => {
          const active = currentMode === opt.value;
          return (
            <button
              key={opt.value}
              disabled={saving || active}
              onClick={() => handleSelect(opt.value)}
              className={`flex flex-col items-center text-center gap-2 rounded-xl border-2 p-4 transition-all ${
                active
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-bg text-text-secondary hover:border-accent/40'
              } ${saving ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface">
                {opt.icon}
              </div>
              <span className="text-sm font-bold">{opt.title}</span>
              <span className="text-[11px] leading-tight text-text-muted">{opt.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
