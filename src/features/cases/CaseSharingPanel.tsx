import React, { useState } from 'react';
import { LuEye as Eye, LuEyeOff as EyeOff } from 'react-icons/lu';
import { clientsApi } from '../../infra/clientsApi';
import { getErrorMessage } from '../../utils/errorMessage';

export interface CaseSharingPanelProps {
  caseData: { id: string; clientId: string; shareWithClient?: boolean };
  onChanged: () => void | Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

/**
 * Compartilhamento do processo com o cliente no portal.
 *
 * O escritório decide caso a caso: ao ligar, o processo aparece na aba
 * "Processos" do portal do cliente. Os dados internos (número do processo,
 * apelido, tribunal, parte adversária e observações) **nunca** saem — o
 * cliente vê apenas os andamentos marcados como visíveis.
 */
export const CaseSharingPanel: React.FC<CaseSharingPanelProps> = ({
  caseData,
  onChanged,
  onNotify,
}) => {
  const [shared, setShared] = useState(Boolean(caseData.shareWithClient));
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const next = !shared;
    setSaving(true);
    try {
      await clientsApi.updateCase(caseData.clientId, caseData.id, {
        shareWithClient: next,
      });
      setShared(next);
      await onChanged();
      onNotify?.(
        next
          ? 'Processo compartilhado com o cliente no portal.'
          : 'Processo removido do portal do cliente.'
      );
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
        Portal do cliente
      </p>
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={saving}
        className="mt-1 flex items-center gap-1.5 text-xs font-bold text-text-primary disabled:opacity-50"
      >
        {shared ? <Eye size={14} /> : <EyeOff size={14} />}
        {shared ? 'Compartilhado com o cliente' : 'Não compartilhado'}
      </button>
      <p className="mt-1 text-[11px] text-text-muted">
        {shared
          ? 'O cliente acompanha o processo no portal. Só os andamentos marcados como visíveis aparecem para ele.'
          : 'Ligue para o cliente acompanhar o processo na aba "Processos" do portal.'}
      </p>
    </div>
  );
};
