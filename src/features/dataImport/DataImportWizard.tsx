import React from 'react';
import { Button } from '../../components/ui/Button';
import { ImportConfirmStep } from './ImportConfirmStep';
import { ImportReviewStep } from './ImportReviewStep';
import { ImportValidateStep } from './ImportValidateStep';
import { useDataImportWizard } from './useDataImportWizard';
import { ImportStepper } from './ImportStepper';
import { ImportUploadStep } from './ImportUploadStep';
import { ImportTargetStep } from './ImportTargetStep';
import { ImportMappingStep } from './ImportMappingStep';
import { ImportDoneStep } from './ImportDoneStep';
import { ImportHistory } from './ImportHistory';
import { LuFileSpreadsheet as FileSpreadsheet } from 'react-icons/lu';

/**
 * Assistente de importação de planilhas.
 *
 * Sete etapas, uma de cada vez: arquivo → o que importar → colunas →
 * validação → prévia → confirmação → conclusão. Nada é gravado antes da
 * confirmação do dono, e a importação pode ser desfeita em 30 dias.
 */
export const DataImportWizard: React.FC<{
  barbershopId: string;
  onNotify: (message: string, type: 'success' | 'error') => void;
}> = ({ barbershopId, onNotify }) => {
  const wizard = useDataImportWizard(barbershopId, onNotify);
  const uploadResult =
    wizard.batch && 'sheetNames' in wizard.batch ? wizard.batch : null;

  return (
    <div className="bg-surface border border-border rounded-xl p-5" data-testid="data-import-wizard">
      <div className="mb-4 flex items-center gap-2">
        <FileSpreadsheet size={18} className="text-text-primary" aria-hidden="true" />
        <h3 className="text-lg font-bold text-text-primary">Importar dados</h3>
      </div>

      <div className="mb-5">
        <ImportStepper currentStep={wizard.step} completedSteps={wizard.completedSteps} />
      </div>

      {wizard.error ? (
        <p
          className="mb-4 rounded-xl border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger"
          role="alert"
          data-testid="import-error"
        >
          {wizard.error}
        </p>
      ) : null}

      {wizard.step === 'upload' ? (
        <ImportUploadStep
          barbershopId={barbershopId}
          busy={wizard.busy}
          onUpload={wizard.upload}
        />
      ) : null}

      {wizard.step === 'target' ? (
        <ImportTargetStep
          busy={wizard.busy}
          fileName={wizard.batch?.fileName}
          sheetNames={wizard.target?.sheetNames ?? uploadResult?.sheetNames}
          onChoose={wizard.chooseTarget}
        />
      ) : null}

      {wizard.step === 'mapping' && wizard.target ? (
        <ImportMappingStep
          fields={wizard.target.fields}
          headers={wizard.target.headers}
          mapping={wizard.mapping}
          options={wizard.options}
          preview={wizard.target.preview}
          busy={wizard.busy}
          onChangeMapping={wizard.setMapping}
          onChangeOptions={wizard.setOptions}
          onContinue={wizard.saveMappingAndValidate}
        />
      ) : null}

      {wizard.step === 'validate' ? (
        <ImportValidateStep busy={wizard.busy} onValidate={wizard.runValidation} />
      ) : null}

      {wizard.step === 'review' && wizard.validation ? (
        <ImportReviewStep
          validation={wizard.validation}
          busy={wizard.busy}
          onBack={() => wizard.setStep('mapping')}
          onRevalidate={wizard.runValidation}
          onConfirm={wizard.confirm}
        />
      ) : null}

      {wizard.step === 'review' && !wizard.validation ? (
        <ImportReviewUnavailable busy={wizard.busy} onRevalidate={wizard.runValidation} />
      ) : null}

      {wizard.step === 'confirm' ? (
        <ImportConfirmStep busy={wizard.busy} onConfirm={wizard.confirm} />
      ) : null}

      {wizard.step === 'done' && wizard.batchId ? (
        <ImportDoneStep
          barbershopId={barbershopId}
          batchId={wizard.batchId}
          detail={wizard.detail}
          busy={wizard.busy}
          onRefresh={wizard.refresh}
          onUndo={wizard.undo}
          onStartOver={wizard.startOver}
        />
      ) : null}

      <ImportHistory
        history={wizard.history}
        busy={wizard.busy}
        onUndo={wizard.undo}
        onCancel={wizard.cancel}
      />
    </div>
  );
};

/** A prévia do lote sumiu (lote antigo): o dono revalida para seguir. */
const ImportReviewUnavailable: React.FC<{
  busy: boolean;
  onRevalidate: () => Promise<void>;
}> = ({ busy, onRevalidate }) => (
  <div className="space-y-3" data-testid="import-step-review">
    <p className="text-sm text-text-muted">
      Não conseguimos refazer a prévia deste lote. Valide a planilha de novo para
      continuar.
    </p>
    <Button variant="primary" loading={busy} onClick={() => void onRevalidate()}>
      Validar de novo
    </Button>
  </div>
);
