import { useCallback, useEffect, useRef, useState } from 'react';
import { getImportBatch, type ImportBatchDetail } from '../../infra/dataImportApi';

/**
 * Acompanhamento do lote enquanto ele é processado.
 *
 * O processamento acontece na fila do servidor: a tela apenas acompanha. A
 * função de polling é nomeada e vive fora do hook — assim ela pode se
 * reagendar sem depender de referência circular dentro do próprio hook.
 */

const POLL_INTERVAL_MS = 1500;
const POLL_RETRY_INTERVAL_MS = 3000;

export interface ImportBatchPolling {
  detail: ImportBatchDetail | null;
  setDetail: (detail: ImportBatchDetail | null) => void;
  /** Acompanha o lote até ele sair de "processando". */
  poll: (batchId: string) => Promise<void>;
}

interface PollArgs {
  barbershopId: string;
  batchId: string;
  fetchDetail: (barbershopId: string, batchId: string) => Promise<ImportBatchDetail>;
  schedule: (run: () => void, delay: number) => void;
  onDetail: (detail: ImportBatchDetail) => void;
  onFinish: (detail: ImportBatchDetail) => void;
}

/**
 * Roda o polling de um lote.
 *
 * A recursão passa pelo agendador (`schedule`), não por uma referência à
 * própria função dentro do hook.
 */
async function pollBatch(args: PollArgs): Promise<void> {
  try {
    const current = await args.fetchDetail(args.barbershopId, args.batchId);
    args.onDetail(current);
    if (current.status === 'PROCESSING') {
      args.schedule(() => void pollBatch(args), POLL_INTERVAL_MS);
      return;
    }
    args.onFinish(current);
  } catch {
    args.schedule(() => void pollBatch(args), POLL_RETRY_INTERVAL_MS);
  }
}

export function useImportBatchPolling(params: {
  barbershopId: string;
  loadHistory: () => Promise<void>;
  onNotify: (message: string, type: 'success' | 'error') => void;
}): ImportBatchPolling {
  const { barbershopId, loadHistory, onNotify } = params;
  const [detail, setDetail] = useState<ImportBatchDetail | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifyRef = useRef(onNotify);

  useEffect(() => {
    notifyRef.current = onNotify;
  }, [onNotify]);

  const schedule = useCallback((run: () => void, delay: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(run, delay);
  }, []);

  const poll = useCallback(
    async (batchId: string) => {
      await pollBatch({
        barbershopId,
        batchId,
        fetchDetail: getImportBatch,
        schedule,
        onDetail: setDetail,
        onFinish: (current) => {
          void loadHistory();
          const hasErrors = current.status === 'COMPLETED_WITH_ERRORS';
          notifyRef.current(
            hasErrors
              ? `Importação concluída com ${current.failedRows} linha(s) rejeitada(s).`
              : 'Importação concluída!',
            hasErrors ? 'error' : 'success'
          );
        },
      });
    },
    [barbershopId, loadHistory, schedule]
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return { detail, setDetail, poll };
}
