import { useCallback, useMemo, useState } from 'react';
import type {
  ImportBatchSummary,
  ImportOptions,
  ImportSheetPlanInput,
  ImportTargetResult,
  ImportUploadResult,
  ImportValidationSummary,
} from '../../infra/dataImportApi';
import type { ImportStep } from './useDataImportWizard';

/**
 * Estado do assistente de importação.
 *
 * Fica isolado num hook próprio para que a máquina de etapas (upload → alvo →
 * mapa → validação → prévia → confirmação → conclusão) tenha um só lugar.
 * O lote em si vive no servidor: o dono pode sair da tela e voltar depois.
 *
 * Uma planilha pode ter várias abas; `sheets` guarda o plano de cada aba
 * (tipo, colunas e opções) escolhido pelo dono.
 */

export const DEFAULT_OPTIONS: ImportOptions = {
  updateExisting: true,
  countFinancialValues: false,
  sendReviewInvitations: false,
  includeCase: false,
  replaceExistingSchedules: false,
  importTimeOffAsPending: false,
  updateExistingProducts: true,
  createProductCategories: true,
  sendFiadoReminders: false,
};

const STEP_ORDER: ImportStep[] = [
  'upload',
  'target',
  'mapping',
  'validate',
  'review',
  'confirm',
  'done',
];

/** Escritores de estado — todos estáveis, para os callbacks não nascerem novos a cada render. */
export interface ImportWizardSetters {
  setStep: (step: ImportStep) => void;
  setBatch: (batch: ImportUploadResult | ImportBatchSummary | null) => void;
  setBatchId: (batchId: string | null) => void;
  setTarget: (target: ImportTargetResult | null) => void;
  setSheets: (sheets: ImportSheetPlanInput[]) => void;
  /** Atualiza uma aba do plano (mapa de colunas e/ou opções). */
  updateSheet: (index: number, patch: Partial<ImportSheetPlanInput>) => void;
  setValidation: (validation: ImportValidationSummary | null) => void;
  setBusy: (busy: boolean) => void;
  setError: (error: string | null) => void;
  /** Volta tudo ao estado inicial (importar outra planilha). */
  reset: () => void;
}

export interface ImportWizardStateModel extends ImportWizardSetters {
  step: ImportStep;
  completedSteps: ImportStep[];
  batch: ImportUploadResult | ImportBatchSummary | null;
  batchId: string | null;
  target: ImportTargetResult | null;
  sheets: ImportSheetPlanInput[];
  validation: ImportValidationSummary | null;
  history: ImportBatchSummary[];
  busy: boolean;
  error: string | null;
  setHistory: (history: ImportBatchSummary[]) => void;
}

export function useImportWizardState(): ImportWizardStateModel {
  const [step, setStep] = useState<ImportStep>('upload');
  const [batch, setBatch] = useState<ImportUploadResult | ImportBatchSummary | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [target, setTarget] = useState<ImportTargetResult | null>(null);
  const [sheets, setSheets] = useState<ImportSheetPlanInput[]>([]);
  const [validation, setValidation] = useState<ImportValidationSummary | null>(null);
  const [history, setHistory] = useState<ImportBatchSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedSteps = useMemo<ImportStep[]>(() => {
    const index = STEP_ORDER.indexOf(step);
    return STEP_ORDER.slice(0, index);
  }, [step]);

  const updateSheet = useCallback((index: number, patch: Partial<ImportSheetPlanInput>) => {
    setSheets((current) => current.map((sheet, i) => (i === index ? { ...sheet, ...patch } : sheet)));
  }, []);

  const reset = useCallback(() => {
    setBatch(null);
    setBatchId(null);
    setTarget(null);
    setSheets([]);
    setValidation(null);
    setError(null);
    setStep('upload');
  }, []);

  return {
    step,
    completedSteps,
    batch,
    batchId,
    target,
    sheets,
    validation,
    history,
    busy,
    error,
    setStep,
    setBatch,
    setBatchId,
    setTarget,
    setSheets,
    updateSheet,
    setValidation,
    setBusy,
    setError,
    setHistory,
    reset,
  };
}
