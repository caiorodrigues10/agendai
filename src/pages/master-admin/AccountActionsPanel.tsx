import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuEye, LuBan, LuBell, LuPause, LuPlay, LuCheck, LuX, LuClock, LuRefreshCw } from 'react-icons/lu';
import { adminAccountActionsApi, AccountControlAction } from '../../infra/adminAccountActionsApi';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { AccountActionDialog, ActionExtra } from './AccountActionDialog';

interface PanelShop {
  id: string;
  name: string;
  active: boolean;
  approvalStatus: string;
  cnpj: string | null;
}

interface AccountActionsPanelProps {
  shop: PanelShop;
  subscription: { status: string } | null;
  onDone: () => void;
}

interface DialogConfig {
  action: AccountControlAction | 'impersonate';
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  extra?: ActionExtra;
}

interface ActionItem {
  config: DialogConfig;
  icon: React.ReactNode;
  show: boolean;
}

const buttonTone = (danger?: boolean) =>
  danger
    ? 'border-danger/40 text-danger hover:bg-danger/10'
    : 'border-border text-text-secondary hover:bg-bg';

const buildActions = (shop: PanelShop, subscription: { status: string } | null): ActionItem[] => [
  {
    show: shop.active,
    icon: <LuPause size={14} />,
    config: {
      action: 'suspend',
      title: 'Suspender conta',
      message: `Suspender "${shop.name}"? O salão fica inativo e o dono não consegue entrar.`,
      confirmLabel: 'Suspender',
      danger: true,
    },
  },
  {
    show: !shop.active,
    icon: <LuPlay size={14} />,
    config: {
      action: 'reactivate',
      title: 'Reativar conta',
      message: `Reativar "${shop.name}"? O salão volta a ficar disponível.`,
      confirmLabel: 'Reativar',
      danger: false,
    },
  },
  {
    show: shop.approvalStatus === 'PENDING',
    icon: <LuCheck size={14} />,
    config: {
      action: 'approve',
      title: 'Aprovar conta',
      message: `Aprovar o cadastro de "${shop.name}"?`,
      confirmLabel: 'Aprovar',
      danger: false,
    },
  },
  {
    show: shop.approvalStatus !== 'REJECTED',
    icon: <LuX size={14} />,
    config: {
      action: 'reject',
      title: 'Rejeitar conta',
      message: `Rejeitar o cadastro de "${shop.name}"?`,
      confirmLabel: 'Rejeitar',
      danger: true,
    },
  },
  {
    show: subscription?.status === 'TRIALING',
    icon: <LuClock size={14} />,
    config: {
      action: 'extend-trial',
      title: 'Estender trial',
      message: 'Estender o período de teste desta conta.',
      confirmLabel: 'Estender',
      danger: false,
      extra: 'days',
    },
  },
  {
    show: subscription !== null,
    icon: <LuRefreshCw size={14} />,
    config: {
      action: 'change-plan',
      title: 'Trocar plano',
      message: 'Alterar o plano ativo desta assinatura.',
      confirmLabel: 'Trocar plano',
      danger: false,
      extra: 'plans',
    },
  },
  {
    show: Boolean(shop.cnpj),
    icon: <LuBan size={14} />,
    config: {
      action: 'block',
      title: 'Bloquear CNPJ',
      message: `Bloquear o CNPJ ${shop.cnpj}? Cadastros futuros com este CNPJ serão recusados.`,
      confirmLabel: 'Bloquear',
      danger: true,
    },
  },
  {
    show: true,
    icon: <LuBell size={14} />,
    config: {
      action: 'notify',
      title: 'Avisar o dono',
      message: 'Enviar uma notificação interna ao dono desta conta.',
      confirmLabel: 'Enviar aviso',
      danger: false,
    },
  },
  {
    show: true,
    icon: <LuEye size={14} />,
    config: {
      action: 'impersonate',
      title: 'Entrar como dono',
      message: `Abrir a conta de "${shop.name}" em modo somente-leitura por 30 minutos. Você não conseguirá editar nada e a sessão encerra sozinha.`,
      confirmLabel: 'Entrar agora',
      danger: false,
    },
  },
];

/**
 * Cartão de ações de controle do master sobre uma conta: suspensão,
 * aprovação, trial, plano, bloqueio de CNPJ, aviso ao dono e entrada
 * em modo somente-leitura (impersonation de 30min).
 */
export const AccountActionsPanel: React.FC<AccountActionsPanelProps> = ({
  shop,
  subscription,
  onDone,
}) => {
  const navigate = useNavigate();
  const { startImpersonation } = useAuth();
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAction = async (
    config: DialogConfig,
    reason: string,
    extra: { days?: number; planId?: string },
  ) => {
    setBusy(true);
    setError(null);
    try {
      if (config.action === 'impersonate') {
        const resp = await adminAccountActionsApi.impersonate(shop.id, reason);
        startImpersonation(resp.data);
        setDialog(null);
        navigate('/app/overview');
        return;
      }
      await adminAccountActionsApi.accountAction(shop.id, config.action, { reason, ...extra });
      setDialog(null);
      onDone();
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível executar a ação.'));
    } finally {
      setBusy(false);
    }
  };

  const actions = buildActions(shop, subscription).filter((item) => item.show);

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <h2 className="text-sm font-bold">Ações de controle</h2>
      <div className="flex flex-wrap gap-2">
        {actions.map((item) => (
          <button
            key={item.config.action}
            type="button"
            onClick={() => {
              setError(null);
              setDialog(item.config);
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold ${buttonTone(
              item.config.danger,
            )}`}
          >
            {item.icon}
            {item.config.confirmLabel}
          </button>
        ))}
      </div>
      {error && !dialog && <p className="text-sm text-danger">{error}</p>}

      {dialog && (
        <AccountActionDialog
          open
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          danger={dialog.danger}
          extra={dialog.extra}
          loading={busy}
          error={error}
          onCancel={() => {
            setDialog(null);
            setError(null);
          }}
          onConfirm={(reason, extra) => void runAction(dialog, reason, extra)}
        />
      )}
    </div>
  );
};

export default AccountActionsPanel;
