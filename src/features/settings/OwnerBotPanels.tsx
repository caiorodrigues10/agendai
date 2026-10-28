import React from 'react';
import {
  ownerBotActionLabel,
  OWNER_BOT_ALERT_LABELS,
  OWNER_BOT_ALERT_TYPES,
  type OwnerBotActionLogEntry,
  type OwnerBotAlertType,
  type OwnerBotCatalog,
  type OwnerBotPreferences,
  type OwnerBotStatus,
} from '../../infra/ownerBotApi';
import { Button } from '../../components/ui/Button';
import {
  LuBot as Bot,
  LuBan as Ban,
  LuCheck as Check,
  LuCopy as Copy,
  LuLoaderCircle as Loader2,
  LuMessageCircle as MessageCircle,
  LuUnplug as Unplug,
} from 'react-icons/lu';

export function formatDateTime(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatCountdown(seconds: number): string {
  const minutes = Math.floor(Math.max(seconds, 0) / 60);
  const rest = Math.max(seconds, 0) % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export const LinkedPanel: React.FC<{
  status: OwnerBotStatus;
  busy: boolean;
  onUnlink: () => void;
}> = ({ status, busy, onUnlink }) => {
  const botLink = status.botPhone ? `https://wa.me/${status.botPhone}` : null;
  const phoneMismatch = Boolean(
    status.phoneMasked &&
      status.shopPhoneMasked &&
      status.phoneMasked !== status.shopPhoneMasked
  );

  return (
    <div className="rounded-xl border border-success/30 bg-success/5 p-4 mb-4">
      <p className="text-sm font-bold text-success flex items-center gap-2">
        <Check size={16} /> Assistente ativo
      </p>
      <p className="text-sm text-text-secondary mt-1">
        Vinculado ao número {status.phoneMasked}
        {status.linkedAt ? ` em ${formatDateTime(status.linkedAt)}` : ''}.
      </p>
      {phoneMismatch && (
        <p className="text-xs text-warning mt-2" role="note">
          O número cadastrado no estabelecimento termina em {status.shopPhoneMasked}. O assistente
          só responde no número vinculado ({status.phoneMasked}).
        </p>
      )}
      {botLink && (
        <a
          href={botLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-accent hover:text-accent-hover"
        >
          <MessageCircle size={16} /> Conversar com o assistente
        </a>
      )}
      <div className="mt-4">
        <Button
          type="button"
          variant="danger"
          disabled={busy}
          onClick={onUnlink}
          className="flex items-center gap-2"
        >
          <Unplug size={16} /> Desvincular
        </Button>
      </div>
    </div>
  );
};

/** Card para gerar o código de vínculo quando o dono ainda não vinculou o número. */
export const LinkPromptPanel: React.FC<{
  busy: boolean;
  onGenerate: () => void;
}> = ({ busy, onGenerate }) => (
  <div className="rounded-xl border border-border bg-bg p-4 mb-4">
    <p className="text-sm font-bold text-text-primary">Vincular meu WhatsApp</p>
    <p className="text-sm text-text-secondary mt-1">
      Gere um código e envie para o assistente. O código vale por 10 minutos e só pode ser usado
      uma vez.
    </p>
    <Button
      type="button"
      disabled={busy}
      onClick={onGenerate}
      className="mt-3 flex items-center gap-2"
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
      Gerar código de vínculo
    </Button>
  </div>
);

export const LinkCodePanel: React.FC<{
  code: string;
  secondsLeft: number;
  copied: boolean;
  onCopy: () => void;
}> = ({ code, secondsLeft, copied, onCopy }) => (
  <div className="rounded-xl border border-accent/40 bg-bg p-4 mb-4">
    <p className="text-sm font-semibold text-text-secondary">Envie este código ao assistente</p>
    <p className="text-3xl tracking-[0.28em] font-black text-accent my-3">{code}</p>
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="secondary"
        onClick={onCopy}
        className="flex items-center gap-2"
      >
        <Copy size={16} /> {copied ? 'Copiado' : 'Copiar comando'}
      </Button>
      <span className="text-xs text-text-muted" data-testid="owner-bot-countdown">
        {secondsLeft > 0
          ? `Expira em ${formatCountdown(secondsLeft)}`
          : 'Código expirado — gere outro.'}
      </span>
    </div>
    <p className="text-xs text-text-secondary mt-2">
      No WhatsApp do assistente, envie: VINCULAR {code}
    </p>
  </div>
);

export const CapabilitiesList: React.FC<{ highlights: string[] }> = ({ highlights }) => (
  <div className="mb-4">
    <p className="text-sm font-bold text-text-primary mb-2">O que posso fazer por aqui</p>
    <ul className="space-y-1.5">
      {highlights.map(item => (
        <li key={item} className="text-sm text-text-secondary flex items-start gap-2">
          <Check size={14} className="mt-0.5 text-success shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const RecentActionsList: React.FC<{ actions: OwnerBotStatus['recentActions'] }> = ({
  actions,
}) => (
  <div>
    <p className="text-sm font-bold text-text-primary mb-2">Últimas ações pelo assistente</p>
    <ul className="space-y-1" data-testid="owner-bot-history">
      {actions.slice(0, 5).map(action => (
        <li
          key={action.id}
          className="text-xs text-text-secondary flex justify-between gap-3"
        >
          <span>{ownerBotActionLabel(action.action)}</span>
          <span className="text-text-muted">{formatDateTime(action.createdAt)}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const PreferencesPanel: React.FC<{
  prefs: OwnerBotPreferences;
  onPatch: (patch: Partial<OwnerBotPreferences>) => void;
  onSave: () => void;
  disabled?: boolean;
}> = ({ prefs, onPatch, onSave, disabled }) => {
  const toggleAlertType = (type: OwnerBotAlertType) => {
    const next = prefs.alertTypes.includes(type)
      ? prefs.alertTypes.filter(t => t !== type)
      : [...prefs.alertTypes, type];
    onPatch({ alertTypes: next });
  };

  return (
    <div className="rounded-xl border border-border bg-bg p-4 mb-4" data-testid="owner-bot-prefs">
      <p className="text-sm font-bold text-text-primary mb-3">Preferências do assistente</p>

      <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
        <input
          type="checkbox"
          checked={prefs.briefingEnabled}
          disabled={disabled}
          onChange={e => onPatch({ briefingEnabled: e.target.checked })}
        />
        Enviar briefing de manhã
      </label>
      {prefs.briefingEnabled && (
        <input
          type="time"
          value={prefs.briefingTime}
          disabled={disabled}
          onChange={e => onPatch({ briefingTime: e.target.value })}
          className="ml-6 mb-2 text-sm text-text-secondary"
        />
      )}

      <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
        <input
          type="checkbox"
          checked={prefs.summaryEnabled}
          disabled={disabled}
          onChange={e => onPatch({ summaryEnabled: e.target.checked })}
        />
        Enviar resumo à noite
      </label>
      {prefs.summaryEnabled && (
        <input
          type="time"
          value={prefs.summaryTime}
          disabled={disabled}
          onChange={e => onPatch({ summaryTime: e.target.value })}
          className="ml-6 mb-2 text-sm text-text-secondary"
        />
      )}

      <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
        <input
          type="checkbox"
          checked={prefs.alertsEnabled}
          disabled={disabled}
          onChange={e => onPatch({ alertsEnabled: e.target.checked })}
        />
        Alertas proativos
      </label>
      {prefs.alertsEnabled && (
        <div className="ml-6 flex flex-wrap gap-2" data-testid="owner-bot-alert-types">
          {OWNER_BOT_ALERT_TYPES.map(type => (
            <button
              key={type}
              type="button"
              disabled={disabled}
              onClick={() => toggleAlertType(type)}
              className={`text-xs px-2 py-1 rounded border ${
                prefs.alertTypes.includes(type)
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-text-secondary'
              }`}
            >
              {OWNER_BOT_ALERT_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={onSave}
          className="flex items-center gap-2"
        >
          <Check size={16} /> Salvar preferências
        </Button>
      </div>
    </div>
  );
};

export const CatalogPanel: React.FC<{ catalog: OwnerBotCatalog }> = ({ catalog }) => (
  <div className="rounded-xl border border-border bg-bg p-4 mb-4" data-testid="owner-bot-catalog">
    <p className="text-sm font-bold text-text-primary mb-2">
      O que o assistente sabe fazer por aqui ({catalog.total})
    </p>
    {catalog.categories.map(cat => (
      <details key={cat.id} className="mb-2">
        <summary className="text-sm text-text-secondary cursor-pointer">
          {cat.label} ({cat.commands.length})
        </summary>
        <ul className="ml-4 mt-1 space-y-1">
          {cat.commands.map(cmd => (
            <li key={cmd.id} className="text-xs text-text-secondary">
              <span className="font-medium">{cmd.riskLabel}</span> — {cmd.description}
            </li>
          ))}
        </ul>
      </details>
    ))}
  </div>
);

export const ActionLogsPanel: React.FC<{ logs: OwnerBotActionLogEntry[] }> = ({ logs }) => (
  <div className="rounded-xl border border-border bg-bg p-4 mb-4" data-testid="owner-bot-audit">
    <p className="text-sm font-bold text-text-primary mb-2">Auditoria de ações</p>
    <ul className="space-y-1">
      {logs.map(log => (
        <li key={log.id} className="text-xs text-text-secondary flex justify-between gap-3">
          <span>
            {ownerBotActionLabel(log.action)}
            {log.riskClass ? ` · ${log.riskClass}` : ''} · {log.status}
          </span>
          <span className="text-text-muted">{formatDateTime(log.createdAt)}</span>
        </li>
      ))}
    </ul>
  </div>
);

/** Bloqueio/desbloqueio do assistente (estado vindo das preferências). */
export const BlockingSection: React.FC<{
  blocked: boolean;
  canBlock: boolean;
  busy: boolean;
  onBlock: () => void;
  onUnblock: () => void;
}> = ({ blocked, canBlock, busy, onBlock, onUnblock }) => {
  if (blocked) {
    return (
      <div
        className="rounded-xl border border-danger/30 bg-danger/5 p-4 mb-4"
        data-testid="owner-bot-blocked"
      >
        <p className="text-sm font-bold text-danger flex items-center gap-2">
          <Ban size={16} /> Assistente bloqueado
        </p>
        <p className="text-sm text-text-secondary mt-1">
          O assistente está bloqueado e não responde no WhatsApp.
        </p>
        <div className="mt-3">
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={onUnblock}
            className="flex items-center gap-2"
          >
            <Check size={16} /> Desbloquear
          </Button>
        </div>
      </div>
    );
  }

  if (!canBlock) return null;

  return (
    <div className="mb-4">
      <Button
        type="button"
        variant="danger"
        disabled={busy}
        onClick={onBlock}
        className="flex items-center gap-2"
      >
        <Ban size={16} /> Bloquear assistente
      </Button>
    </div>
  );
};
