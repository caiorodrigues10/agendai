import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check, Loader2, Mail, MessageCircle, RefreshCcw } from 'lucide-react';
import {
  NotificationChannel,
  NotificationPreference,
  notificationsApi,
} from '../../infra/notificationsApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { NotificationDeliveriesPanel } from './NotificationDeliveriesPanel';

type OwnerNotificationTab = 'preferences' | 'deliveries';

interface OwnerNotificationsPanelProps {
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

const TYPE_LABELS: Record<string, string> = {
  APPOINTMENT_CONFIRMATION: 'Confirmação de agendamento',
  APPOINTMENT_REMINDER: 'Lembrete de agendamento',
  APPOINTMENT_CANCELLATION: 'Cancelamento de agendamento',
  QUEUE_JOINED: 'Entrada na fila',
  QUEUE_NEAR_TURN: 'Cliente próximo da vez',
  QUEUE_CALLED: 'Chamada do cliente',
  QUEUE_CANCELED: 'Cancelamento da fila',
  CAMPAIGN: 'Campanhas do CRM',
};

function preferenceLabel(preference: NotificationPreference): string {
  return preference.label || TYPE_LABELS[preference.type] || preference.type.replaceAll('_', ' ');
}

const NotificationPreferences: React.FC<OwnerNotificationsPanelProps> = ({ onNotify }) => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [initialPreferences, setInitialPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await notificationsApi.getPreferences();
      setPreferences(result);
      setInitialPreferences(result);
    } catch (cause) {
      setError(getErrorMessage(cause, 'Não foi possível carregar as preferências.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  const dirty = useMemo(
    () =>
      JSON.stringify(preferences.map(({ channel, type, enabled }) => ({ channel, type, enabled }))) !==
      JSON.stringify(initialPreferences.map(({ channel, type, enabled }) => ({ channel, type, enabled }))),
    [initialPreferences, preferences]
  );

  const grouped = useMemo(
    () => ({
      WHATSAPP: preferences.filter(item => item.channel === 'WHATSAPP'),
      EMAIL: preferences.filter(item => item.channel === 'EMAIL'),
    }),
    [preferences]
  );

  const toggle = (channel: NotificationChannel, type: string) => {
    setPreferences(current =>
      current.map(preference =>
        preference.channel === channel && preference.type === type
          ? { ...preference, enabled: !preference.enabled }
          : preference
      )
    );
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await notificationsApi.updatePreferences(preferences);
      const effective = updated.length > 0 ? updated : preferences;
      setPreferences(effective);
      setInitialPreferences(effective);
      onNotify?.('Preferências de notificações salvas.', 'success');
    } catch (cause) {
      const message = getErrorMessage(cause, 'Não foi possível salvar as preferências.');
      setError(message);
      onNotify?.(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div role="status" className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-text-muted">
        Carregando preferências...
      </div>
    );
  }

  if (error && preferences.length === 0) {
    return (
      <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
        <p>{error}</p>
        <button type="button" onClick={() => void loadPreferences()} className="mt-2 inline-flex min-h-10 items-center gap-2 font-bold underline">
          <RefreshCcw size={15} /> Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="notification-preferences-title">
      <div>
        <h3 id="notification-preferences-title" className="text-lg font-bold text-text-primary">
          Preferências de avisos
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          Escolha quais avisos operacionais o salão enviará. Campanhas continuam exigindo consentimento do cliente.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      {preferences.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
          Nenhuma preferência configurável está disponível no momento.
        </div>
      ) : (
        (['WHATSAPP', 'EMAIL'] as const).map(channel => {
          const items = grouped[channel];
          if (items.length === 0) return null;
          return (
            <div key={channel} className="rounded-xl border border-border bg-surface p-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-text-primary">
                {channel === 'WHATSAPP' ? <MessageCircle size={17} /> : <Mail size={17} />}
                {channel === 'WHATSAPP' ? 'WhatsApp' : 'E-mail'}
              </h4>
              <div className="mt-3 divide-y divide-border">
                {items.map(preference => (
                  <div key={`${channel}:${preference.type}`} className="flex min-w-0 items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-text-primary">
                        {preferenceLabel(preference)}
                      </p>
                      {preference.description && (
                        <p className="mt-0.5 break-words text-xs text-text-muted">
                          {preference.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={preference.enabled}
                      aria-label={`${preferenceLabel(preference)} por ${channel === 'WHATSAPP' ? 'WhatsApp' : 'e-mail'}`}
                      onClick={() => toggle(channel, preference.type)}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface ${
                        preference.enabled ? 'bg-accent' : 'bg-border-strong'
                      }`}
                    >
                      <span
                        className={`absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-accent shadow transition-transform ${
                          preference.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      >
                        {preference.enabled && <Check size={12} aria-hidden="true" />}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      <button
        type="button"
        onClick={() => void save()}
        disabled={!dirty || saving || preferences.length === 0}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-accent-fg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        Salvar preferências
      </button>
    </section>
  );
};

export const OwnerNotificationsPanel: React.FC<OwnerNotificationsPanelProps> = ({ onNotify }) => {
  const [tab, setTab] = useState<OwnerNotificationTab>('preferences');

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-accent/10 p-2 text-accent" aria-hidden="true">
          <Bell size={20} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-text-primary">Notificações</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Controle avisos e acompanhe as tentativas de entrega do salão.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-bg p-1" role="tablist" aria-label="Configurações de notificações">
        {([
          ['preferences', 'Preferências'],
          ['deliveries', 'Entregas'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`min-h-11 rounded-lg px-3 text-sm font-bold transition-colors ${
              tab === value ? 'bg-surface-2 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === 'preferences' ? (
          <NotificationPreferences onNotify={onNotify} />
        ) : (
          <NotificationDeliveriesPanel onNotify={onNotify} />
        )}
      </div>
    </div>
  );
};
