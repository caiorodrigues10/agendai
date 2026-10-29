import React, { useRef, useState } from 'react';
import { LuFileSpreadsheet as FileSpreadsheet } from 'react-icons/lu';
import { importTemplateUrl, type ImportTargetType } from '../../infra/dataImportApi';

/**
 * Etapa 1 — envio do arquivo.
 *
 * Aceita .xlsx e .csv (até 10 MB). O link do modelo ajuda quem não sabe
 * montar a planilha: o modelo já vem com os cabeçalhos certos.
 */
export const ImportUploadStep: React.FC<{
  barbershopId: string;
  busy: boolean;
  onUpload: (file: File) => Promise<void>;
}> = ({ barbershopId, busy, onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    await onUpload(file);
  };

  return (
    <div className="space-y-4" data-testid="import-step-upload">
      <div>
        <h3 className="text-base font-bold text-text-primary">Envie sua planilha</h3>
        <p className="mt-1 text-sm text-text-muted">
          Arquivo .xlsx ou .csv, até 10 MB e 20.000 linhas. Nada é importado antes de você
          revisar a prévia.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface-2 px-5 py-8 text-center transition-colors hover:border-border-strong">
        <FileSpreadsheet size={28} className="text-text-muted" aria-hidden="true" />
        <span className="text-sm font-semibold text-text-primary">
          {busy ? 'Enviando…' : (fileName ?? 'Escolher arquivo')}
        </span>
        <span className="text-xs text-text-muted">Clique para selecionar a planilha</span>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.csv"
          className="sr-only"
          disabled={busy}
          data-testid="import-file-input"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </label>

      <a
        href={importTemplateUrl(barbershopId, 'CLIENTS' as ImportTargetType)}
        className="inline-block text-xs font-semibold text-accent underline underline-offset-2"
        download
      >
        Baixar modelo em branco
      </a>
    </div>
  );
};
