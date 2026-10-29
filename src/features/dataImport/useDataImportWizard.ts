import { useCallback, useEffect, useRef } from 'react';
import {
  getActiveImportBatch,
  listImportBatches,
  validateImportBatch,
  type ImportBatchDetail,
  type ImportBatchSummary,
  type ImportFieldKey,
  type ImportOptions,
  type ImportTargetResult,
  type ImportTargetType,
  type ImportUploadResult,
  type ImportValidationSummary,
} from '../../infra/dataImportApi';
import { useImportBatchPolling } from './useImportBatchPolling';
import { useImportWizardActions } from './useImportWizardActions';
import { useImportWizardState } from './useImportWizardState';

/**
 * Estado do assistente de importação.
 *
 * A máquina de etapas mora aqui; a tela só desenha. O lote fica no servidor:
 * se o dono recarregar a página no meio, o assistente retoma de onde parou.
 *
 * O hook é só a composição: o estado, o acompanhamento do lote e as ações
 * vivem em hooks menores (`useImportWizardState`, `useImportBatchPolling` e
 * `useImportWizardActions`).
 */
export type ImportStep = 'upload' | 'target' | 'mapping' | 'validate' | 'review' | 'confirm' | 'done';

export interface DataImportWizardState {
  step: ImportStep;
  completedSteps: ImportStep[];
  batch: ImportUploadResult | ImportBatchSummary | null;
  batchId: string | null;
  target: ImportTargetResult | null;
  mapping: Record<string, ImportFieldKey>;
  options: ImportOptions;
  validation: ImportValidationSummary | null;
  detail: ImportBatchDetail | null;
  history: ImportBatchSummary[];
  busy: boolean;
  error: string | null;
  setStep: (step: ImportStep) => void;
  setMapping: (mapping: Record<string, ImportFieldKey>) => void;
  setOptions: (options: Partial<ImportOptions>) => void;
  upload: (file: File) => Promise<void>;
  chooseTarget: (targetType: ImportTargetType, sheetName?: string | null) => Promise<void>;
  saveMappingAndValidate: () => Promise<void>;
  runValidation: () => Promise<void>;
  confirm: () => Promise<void>;
  refresh: () => Promise<void>;
  undo: (batchId: string) => Promise<void>;
  cancel: (batchId: string) => Promise<void>;
  startOver: () => void;
  loadHistory: () => Promise<void>;
}

export function useDataImportWizard(
  barbershopId: string,
  onNotify: (message: string, type: 'success' | 'error') => void
): DataImportWizardState {
  const state = useImportWizardState();
  const notifyRef = useRef(onNotify);

  const {
    setBatch,
    setBatchId,
    setValidation,
    setStep,
    setHistory,
  } = state;

  useEffect(() => {
    notifyRef.current = onNotify;
  }, [onNotify]);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await listImportBatches(barbershopId));
    } catch {
      // Histórico é secundário: falhar aqui não pode travar o assistente.
    }
  }, [barbershopId, setHistory]);

  const { detail, setDetail, poll } = useImportBatchPolling({
    barbershopId,
    loadHistory,
    onNotify,
  });

  const actions = useImportWizardActions({
    barbershopId,
    onNotify,
    loadHistory,
    poll,
    setDetail,
    state,
  });

  /** Retoma um lote que ficou pela metade (dono saiu da tela). */
  useEffect(() => {
    let cancelled = false;
    const resume = async () => {
      try {
        const active = await getActiveImportBatch(barbershopId);
        if (!active || cancelled) return;
        setBatch(active);
        setBatchId(active.id);
        if (active.status === 'AWAITING_CONFIRMATION' || active.status === 'VALIDATING') {
          // A prévia volta a ser calculada: o dry-run é somente leitura, então
          // repetir não muda nada no banco.
          try {
            setValidation(await validateImportBatch(barbershopId, active.id));
          } catch {
            setValidation(null);
          }
          setStep('review');
        } else if (active.status === 'PROCESSING') {
          setStep('done');
          void poll(active.id);
        } else {
          setStep('target');
        }
        notifyRef.current(
          'Você tinha uma importação em andamento. Retomando de onde parou.',
          'success'
        );
      } catch {
        // Sem lote ativo — segue no passo inicial.
      }
    };
    void resume();
    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, [barbershopId, loadHistory, poll, setBatch, setBatchId, setStep, setValidation]);

  return {
    step: state.step,
    completedSteps: state.completedSteps,
    batch: state.batch,
    batchId: state.batchId,
    target: state.target,
    mapping: state.mapping,
    options: state.options,
    validation: state.validation,
    detail,
    history: state.history,
    busy: state.busy,
    error: state.error,
    setStep: state.setStep,
    setMapping: state.setMapping,
    setOptions: state.setOptions,
    ...actions,
    loadHistory,
  };
}
