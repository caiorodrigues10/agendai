import React, { useState } from 'react';
import { LuMail, LuRefreshCw } from 'react-icons/lu';
import { Button } from '../../components/ui/Button';
import { adminApi } from '../../infra/adminApi';
import { getErrorMessage } from '../../utils/errorMessage';
import type { AccountDetail } from '../../infra/adminInternalApi';

type OwnerInvite = AccountDetail['invite'];

const INVITE_STATUS: Record<string, { label: string; tone: string }> = {
  PENDING: { label: 'Pendente', tone: 'text-warning bg-warning/10' },
  ACCEPTED: { label: 'Aceito', tone: 'text-success bg-success/10' },
  EXPIRED: { label: 'Expirado', tone: 'text-danger bg-danger/10' },
  REVOKED: { label: 'Revogado', tone: 'text-text-muted bg-hover-bg' },
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

export interface OwnerInvitePanelProps {
  shopId: string;
  invite: OwnerInvite;
  onReload: () => void;
}

export const OwnerInvitePanel: React.FC<OwnerInvitePanelProps> = ({ shopId, invite, onReload }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    setError(null);
    setSent(false);
    try {
      const res = await adminApi.resendOwnerInvite(shopId);
      if (res.data.inviteSent) {
        setSent(true);
        onReload();
      } else {
        setError('O e-mail não pôde ser enviado. Tente novamente.');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível reenviar o convite.'));
    } finally {
      setSending(false);
    }
  };

  if (!invite) {
    return (
      <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <LuMail size={16} className="text-accent" /> Convite do dono
        </h2>
        <p className="text-sm text-text-muted">Sem convite de dono para esta conta.</p>
      </div>
    );
  }

  const status = INVITE_STATUS[invite.status] ?? {
    label: invite.status,
    tone: 'text-text-muted bg-hover-bg',
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-bold flex items-center gap-2">
        <LuMail size={16} className="text-accent" /> Convite do dono
      </h2>
      <div className="space-y-2 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-text-muted">E-mail</span>
          <span className="font-medium">{invite.email}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted">Status</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${status.tone}`}>
            {status.label}
          </span>
        </div>
        {invite.status === 'PENDING' && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-text-muted">Válido até</span>
            <span>{formatDate(invite.expiresAt)}</span>
          </div>
        )}
        {invite.acceptedAt && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-text-muted">Aceito em</span>
            <span>{formatDate(invite.acceptedAt)}</span>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      {sent && <p className="text-xs text-success">Convite reenviado (novo link por e-mail).</p>}

      {invite.status !== 'ACCEPTED' && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={sending}
          loading={sending}
          onClick={() => void handleResend()}
        >
          <LuRefreshCw size={14} /> Reenviar convite
        </Button>
      )}
    </div>
  );
};

export default OwnerInvitePanel;
