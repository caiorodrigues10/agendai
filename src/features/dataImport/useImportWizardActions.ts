import { useCallback } from 'react';
import {
  cancelImportBatch,
  configureImportTarget,
  confirmImportBatch,
  getImportBatch,
  saveImportMapping,
  undoImportBatch,
  uploadImportFile,
  validateImportBatch,
  type ImportBatchDetail,
  type ImportFieldKey,
  type ImportTargetType,
} from '../../infra/dataImportApi';
import type { ImportWizardStateModel } from './useImportWizardState';

/**
 * Ações do assistente de importação.
 *
 * Cada ação é uma etapa do fluxo e todas conversam com o servidor: o estado
 * local só guarda o que a tela desenha.
 */

export interface ImportWizardActions {
  upload: (file: File) => Promise<void>;
  chooseTarget: (targetType: ImportTargetType, sheetName?: string | null) => Promise<void>;
  saveMappingAndValidate: () => Promise<void>;
  runValidation: () => Promise<void>;
  confirm: () => Promise<void>;
  refresh: () => Promise<void>;
  undo: (batchId: string) => Promise<void>;
  cancel: (batchId: string) => Promise<void>;
  startOver: () => void;
}

export function useImportWizardActions(params: {
  barbershopId: string;
  onNotify: (message: string, type: 'success' | 'error') => void;
  loadHistory: () => Promise<void>;
  poll: (batchId: string) => Promise<void>;
  setDetail: (detail: ImportBatchDetail | null) => void;
  state: ImportWizardStateModel;
}): ImportWizardActions {
  const { barbershopId, onNotify, loadHistory, poll, setDetail, state } = params;
  const {
    batchId,
    mapping,
    options,
    setBatch,
    setBatchId,
    setTarget,
    setMapping,
    setValidation,
    setStep,
    setBusy,
    setError,
    reset,
  } = state;

  const handleError = useCallback(
    (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Não foi possível concluir a importação.';
      setError(message);
      onNotify(message, 'error');
    },
    [onNotify, setError]
  );

  const upload = useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      try {
        const result = await uploadImportFile(barbershopId, file);
        setBatch(result);
        setBatchId(result.id);
        setTarget(null);
        setMapping({});
        setValidation(null);
        setDetail(null);
        setStep('target');
        await loadHistory();
      } catch (err) {
        handleError(err);
      } finally {
        setBusy(false);
      }
    },
    [barbershopId, handleError, loadHistory, setBatch, setBatchId, setDetail, setError, setMapping, setStep, setTarget, setValidation, setBusy]
  );

  const chooseTarget = useCallback(
    async (targetType: ImportTargetType, sheetName?: string | null) => {
      if (!batchId) return;
      setBusy(true);
      setError(null);
      try {
        const result = await configureImportTarget(barbershopId, batchId, targetType, sheetName);
        setTarget(result);
        setBatchId(result.id);
        setMapping(toMapping(result.detectedColumns));
        setStep('mapping');
      } catch (err) {
        handleError(err);
      } finally {
        setBusy(false);
      }
    },
    [barbershopId, batchId, handleError, setBatchId, setBusy, setError, setMapping, setStep, setTarget]
  );

  const saveMappingAndValidate = useCallback(async () => {
    if (!batchId) return;
    setBusy(true);
    setError(null);
    try {
      await saveImportMapping(barbershopId, batchId, mapping, options);
      setStep('validate');
      const summary = await validateImportBatch(barbershopId, batchId);
      setValidation(summary);
      setStep('review');
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  }, [barbershopId, batchId, handleError, mapping, options, setBusy, setError, setStep, setValidation]);

  const runValidation = useCallback(async () => {
    if (!batchId) return;
    setBusy(true);
    setError(null);
    try {
      const summary = await validateImportBatch(barbershopId, batchId);
      setValidation(summary);
      setStep('review');
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  }, [barbershopId, batchId, handleError, setBusy, setError, setStep, setValidation]);

  const confirm = useCallback(async () => {
    if (!batchId) return;
    setBusy(true);
    setError(null);
    try {
      await confirmImportBatch(barbershopId, batchId);
      setStep('done');
      await poll(batchId);
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  }, [barbershopId, batchId, handleError, poll, setBusy, setError, setStep]);

  const refresh = useCallback(async () => {
    if (!batchId) return;
    try {
      setDetail(await getImportBatch(barbershopId, batchId));
    } catch (err) {
      handleError(err);
    }
  }, [barbershopId, batchId, handleError, setDetail]);

  const undo = useCallback(
    async (targetBatchId: string) => {
      setBusy(true);
      try {
        const result = await undoImportBatch(barbershopId, targetBatchId);
        setDetail(null);
        await loadHistory();
        onNotify(
          result.removed > 0
            ? `Importação desfeita: ${result.removed} registro(s) removido(s).`
            : 'Nada foi removido: os registros foram alterados depois da importação.',
          'success'
        );
      } catch (err) {
        handleError(err);
      } finally {
        setBusy(false);
      }
    },
    [barbershopId, handleError, loadHistory, onNotify, setBusy, setDetail]
  );

  const cancel = useCallback(
    async (targetBatchId: string) => {
      setBusy(true);
      try {
        await cancelImportBatch(barbershopId, targetBatchId);
        await loadHistory();
        onNotify('Importação cancelada.', 'success');
      } catch (err) {
        handleError(err);
      } finally {
        setBusy(false);
      }
    },
    [barbershopId, handleError, loadHistory, onNotify, setBusy]
  );

  const startOver = useCallback(() => {
    reset();
    void loadHistory();
  }, [loadHistory, reset]);

  return {
    upload,
    chooseTarget,
    saveMappingAndValidate,
    runValidation,
    confirm,
    refresh,
    undo,
    cancel,
    startOver,
  };
}

/** Converte o mapa detectado pelo servidor (campo → coluna) no formato da tela (coluna → campo). */
function toMapping(detected: Partial<Record<ImportFieldKey, number>>): Record<string, ImportFieldKey> {
  const mapping: Record<string, ImportFieldKey> = {};
  for (const [field, column] of Object.entries(detected)) {
    if (typeof column === 'number') mapping[String(column)] = field as ImportFieldKey;
  }
  return mapping;
}
