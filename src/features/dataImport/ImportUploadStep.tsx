import React, { useRef, useState } from 'react';
import { LuFileSpreadsheet as FileSpreadsheet } from 'react-icons/lu';
import { importTemplateUrl, type ImportTargetType } from '../../infra/dataImportApi';

const TEMPLATE_TARGETS: { id: ImportTargetType; label: string }[] = [
  { id: 'CLIENTS', label: 'Clientes' },
  { id: 'SERVICES', label: 'Serviços' },
  { id: 'APPOINTMENTS', label: 'Agendamentos' },
  { id: 'STAFF_SCHEDULES', label: 'Horários da equipe' },
  { id: 'SHOP_SCHEDULE', label: 'Horário do salão' },
  { id: 'TIME_OFF', label: 'Férias e folgas' },
  { id: 'PRODUCTS', label: 'Produtos e estoque' },
  { id: 'SERVICE_PACKAGES', label: 'Catálogo de pacotes' },
  { id: 'CLIENT_PACKAGES', label: 'Pacotes dos clientes' },
  { id: 'FIADOS', label: 'Fiados' },
];

/**
 * Etapa 1 — envio do arquivo.
 *
 * Aceita .xlsx e .csv (até 10 MB). Os modelos por tipo trazem os cabeçalhos
 * certos e duas linhas de exemplo — o dono baixa o modelo do que quer importar.
 */
export const ImportUploadStep: React.FC<{
  barbershopId: string;
  busy: boolean;
  onUpload: (file: File) => Promise<void>;
}> = ({ barbershopId, busy, onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

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
          revisar a prévia. Uma planilha com várias abas também funciona: escolha o tipo de
          cada aba no passo seguinte.
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

      <div>
        <button
          type="button"
          className="text-xs font-semibold text-accent underline underline-offset-2"
          onClick={() => setShowTemplates((current) => !current)}
          aria-expanded={showTemplates}
          data-testid="import-templates-toggle"
        >
          {showTemplates ? 'Esconder modelos' : 'Baixar modelo (.xlsx)'}
        </button>
        {showTemplates ? (
          <ul className="mt-2 grid gap-1 sm:grid-cols-2" data-testid="import-templates-list">
            {TEMPLATE_TARGETS.map((target) => (
              <li key={target.id}>
                <a
                  href={importTemplateUrl(barbershopId, target.id)}
                  className="inline-block text-xs font-semibold text-accent underline underline-offset-2"
                  download
                  data-testid={`import-template-${target.id}`}
                >
                  Modelo: {target.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
};
