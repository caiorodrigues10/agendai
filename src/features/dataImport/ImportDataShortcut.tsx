import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LuFileSpreadsheet as FileSpreadsheet } from 'react-icons/lu';

/**
 * Atalho para o assistente de importação.
 *
 * Aparece nos estados vazios (clientes, serviços, agenda) e no onboarding:
 * quem está começando com o sistema tem a opção de trazer tudo de uma vez
 * em vez de digitar item por item.
 */
export const ImportDataShortcut: React.FC<{
  label?: string;
  className?: string;
}> = ({ label = 'Importar planilha', className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/app/settings?section=import')}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-text-primary transition-colors hover:border-border-strong hover:bg-surface-2 ${className}`}
      data-testid="import-data-shortcut"
    >
      <FileSpreadsheet size={14} aria-hidden="true" />
      {label}
    </button>
  );
};
