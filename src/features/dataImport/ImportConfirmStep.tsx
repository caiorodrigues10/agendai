import React from 'react';
import { Button } from '../../components/ui/Button';

/**
 * Etapa 6/7 — confirmação.
 *
 * A confirmação grava os dados e não envia nenhuma mensagem para os clientes:
 * a importação é silenciosa.
 */
export const ImportConfirmStep: React.FC<{
  busy: boolean;
  onConfirm: () => Promise<void>;
}> = ({ busy, onConfirm }) => (
  <div className="space-y-4" data-testid="import-step-confirm">
    <p className="text-sm text-text-muted">
      Tudo certo? A confirmação grava os dados e não envia nenhuma mensagem para os
      clientes.
    </p>
    <Button
      variant="primary"
      loading={busy}
      onClick={() => void onConfirm()}
      data-testid="import-confirm-start"
    >
      Confirmar e importar
    </Button>
  </div>
);
