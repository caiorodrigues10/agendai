import React, { useState } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import { Button } from '../../components/ui/Button';
import { adminApi, BarbershopListItem } from '../../infra/adminApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { StepIndicator } from './ShopWizardSteps';

export interface CreatedState {
  shop: BarbershopListItem;
  ownerEmail: string;
  inviteSent: boolean;
}

export interface ShopCreatedPanelProps {
  created: CreatedState;
  onInviteSent: () => void;
}

/** Corpo do modal "Salão criado": status do convite + reenvio. */
export const ShopCreatedPanel: React.FC<ShopCreatedPanelProps> = ({ created, onInviteSent }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await adminApi.resendOwnerInvite(created.shop.id);
      if (res.data.inviteSent) {
        onInviteSent();
      } else {
        setError('O e-mail não pôde ser enviado. Tente novamente.');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível reenviar o convite.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3 text-sm">
      <StepIndicator step={5} />
      <p>
        <strong>{created.shop.name}</strong> foi criado com sucesso.
      </p>
      <div className="rounded-xl border border-border bg-surface-2 p-3 space-y-1">
        <p className="font-medium">Dono: {created.ownerEmail}</p>
        <p className="text-text-muted text-xs">
          O dono recebe um convite por e-mail para definir a senha (válido por 72 horas).
        </p>
      </div>
      {created.inviteSent ? (
        <p className="text-success text-xs">Convite enviado.</p>
      ) : (
        <div className="space-y-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2">
          <p className="flex items-center gap-2 text-warning text-xs">
            <LuTriangleAlert size={14} /> O convite não pôde ser enviado agora.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={sending}
            loading={sending}
            onClick={() => void handleResend()}
          >
            Reenviar convite
          </Button>
          {error && <p className="text-danger text-xs">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default ShopCreatedPanel;
