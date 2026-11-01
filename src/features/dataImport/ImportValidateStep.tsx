import React from 'react';
import { Button } from '../../components/ui/Button';

/**
 * Etapa 4/7 — validação.
 *
 * O dry-run é somente leitura: o dono vê o que entra e o que é rejeitado
 * antes de qualquer gravação.
 */
export const ImportValidateStep: React.FC<{
  busy: boolean;
  onValidate: () => Promise<void>;
}> = ({ busy, onValidate }) => (
  <div className="space-y-4" data-testid="import-step-validate">
    <p className="text-sm text-text-muted">
      Vamos conferir a planilha antes de gravar qualquer coisa.
    </p>
    <Button
      variant="primary"
      loading={busy}
      onClick={() => void onValidate()}
      data-testid="import-validate-start"
    >
      Validar agora
    </Button>
  </div>
);
