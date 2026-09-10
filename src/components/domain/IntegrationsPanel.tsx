import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  Loader2,
  MessageSquare,
  Plug,
  RefreshCw,
  Settings,
  Trash2,
  X,
  Zap,
  Bot,
  CreditCard,
  FileText,
} from 'lucide-react';
import {
  integrationsApi,
  Integration,
  IntegrationSyncLog,
} from '../../infra/integrationsApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { FIELD_CONTROL, FORM_FOOTER } from '../ui/Field';

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
  GOOGLE_CALENDAR: {
    icon: <Calendar className="w-5 h-5" />,
    label: 'Google Calendar',
    description: 'Sincronize agenda com Google Calendar',
  },
  ICALENDAR: {
    icon: <Calendar className="w-5 h-5" />,
    label: 'iCal / CalDAV',
    description: 'Importe/exporte calendários iCal',
  },
  TWILIO: {
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'Twilio',
    description: 'Envio de SMS e WhatsApp via Twilio',
  },
  EVOLUTION_API: {
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'Evolution API',
    description: 'WhatsApp via Evolution API',
  },
  OPENAI: {
    icon: <Bot className="w-5 h-5" />,
    label: 'OpenAI',
    description: 'Copilot e respostas automáticas com IA',
  },
  ASAAS: {
    icon: <CreditCard className="w-5 h-5" />,
    label: 'Asaas',
    description: 'Gateway de pagamento Asaas',
  },
  NFSE: {
    icon: <FileText className="w-5 h-5" />,
    label: 'NFS-e',
    description: 'Emissão de Nota Fiscal de Serviço',
  },
  ZAPI: {
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'Z-API',
    description: 'WhatsApp via Z-API',
  },
  WHATSAPP_CLOUD: {
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'WhatsApp Cloud',
    description: 'WhatsApp Business API oficial',
  },
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-success/10 text-success',
  INACTIVE: 'bg-text-muted/10 text-text-muted',
  ERROR: 'bg-danger/10 text-danger',
  RATE_LIMITED: 'bg-warning/10 text-warning',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
  ERROR: 'Erro',
  RATE_LIMITED: 'Limite atingido',
};

interface SyncFormData {
  type: string;
  provider: string;
  config: Record<string, unknown>;
  credentials: Record<string, unknown>;
}

const INITIAL_FORM: SyncFormData = {
  type: 'GOOGLE_CALENDAR',
  provider: '',
  config: {},
  credentials: {},
};

export const IntegrationsPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SyncFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; message: string } | null>(null);

  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ id: string; count: number } | null>(null);

  const [logsIntegrationId, setLogsIntegrationId] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<IntegrationSyncLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await integrationsApi.list(barbershopId);
      setIntegrations(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => { load(); }, [load]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setSaveError(null);
    setModalOpen(true);
  };

  const openEditModal = (integration: Integration) => {
    setEditingId(integration.id);
    setForm({
      type: integration.type,
      provider: integration.provider,
      config: integration.config ?? {},
      credentials: integration.credentials ?? {},
    });
    setSaveError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!barbershopId) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (editingId) {
        await integrationsApi.update(barbershopId, editingId, {
          config: form.config,
          credentials: form.credentials,
        });
      } else {
        await integrationsApi.create(barbershopId, form);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (id: string) => {
    if (!barbershopId) return;
    setTestingId(id);
    setTestResult(null);
    try {
      const result = await integrationsApi.test(barbershopId, id);
      setTestResult({ id, ok: true, message: result.message });
    } catch (err) {
      setTestResult({ id, ok: false, message: getErrorMessage(err) });
    } finally {
      setTestingId(null);
    }
  };

  const handleSync = async (id: string) => {
    if (!barbershopId) return;
    setSyncingId(id);
    setSyncResult(null);
    try {
      const result = await integrationsApi.sync(barbershopId, id);
      setSyncResult({ id, count: result.recordsCount });
      await load();
    } catch (err) {
      setTestResult({ id, ok: false, message: getErrorMessage(err) });
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!barbershopId) return;
    if (!window.confirm('Tem certeza que deseja remover esta integração?')) return;
    try {
      await integrationsApi.delete(barbershopId, id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const loadLogs = async (integrationId: string) => {
    if (!barbershopId) return;
    setLogsIntegrationId(integrationId);
    setLogsLoading(true);
    try {
      const result = await integrationsApi.getSyncLogs(barbershopId, integrationId);
      setSyncLogs(result.data);
    } catch (err) {
      setSyncLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const updateConfigField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));
  };

  const updateCredField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, credentials: { ...prev.credentials, [key]: value } }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Integrações</h2>
          <p className="text-sm text-text-muted">Conecte serviços externos ao seu salão</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          <Plug className="w-4 h-4" />
          Nova Integração
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {integrations.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <Plug className="w-10 h-10 mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-muted">Nenhuma integração configurada</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {integrations.map(integration => {
            const meta = TYPE_META[integration.type] ?? {
              icon: <Settings className="w-5 h-5" />,
              label: integration.type,
              description: integration.provider,
            };
            return (
              <div
                key={integration.id}
                className="rounded-xl border border-border bg-surface p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      {meta.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{meta.label}</p>
                      <p className="text-xs text-text-muted">{integration.provider}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[integration.status]}`}>
                    {STATUS_LABELS[integration.status] ?? integration.status}
                  </span>
                </div>

                <p className="text-xs text-text-muted">{meta.description}</p>

                {integration.lastSyncAt && (
                  <p className="text-[11px] text-text-muted">
                    Última sync: {new Date(integration.lastSyncAt).toLocaleString('pt-BR')}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => openEditModal(integration)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-accent/5 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Configurar
                  </button>
                  <button
                    onClick={() => handleTest(integration.id)}
                    disabled={testingId === integration.id}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-accent/5 transition-colors disabled:opacity-50"
                  >
                    {testingId === integration.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    Testar
                  </button>
                  <button
                    onClick={() => handleSync(integration.id)}
                    disabled={syncingId === integration.id}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-accent/5 transition-colors disabled:opacity-50"
                  >
                    {syncingId === integration.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Sincronizar
                  </button>
                  <button
                    onClick={() => loadLogs(integration.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-accent/5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Logs
                  </button>
                  <button
                    onClick={() => handleDelete(integration.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/5 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {testResult?.id === integration.id && (
                  <div className={`rounded-lg p-2 text-xs ${testResult.ok ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {testResult.message}
                  </div>
                )}

                {syncResult?.id === integration.id && (
                  <div className="rounded-lg bg-success/10 p-2 text-xs text-success">
                    Sync concluída: {syncResult.count} registros processados
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {logsIntegrationId && (
        <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Histórico de Sincronizações</h3>
            <button onClick={() => setLogsIntegrationId(null)} className="text-text-muted hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>
          {logsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            </div>
          ) : syncLogs.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">Nenhum log de sincronização</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-text-muted">Data</th>
                    <th className="pb-2 text-left font-medium text-text-muted">Direção</th>
                    <th className="pb-2 text-left font-medium text-text-muted">Status</th>
                    <th className="pb-2 text-right font-medium text-text-muted">Registros</th>
                  </tr>
                </thead>
                <tbody>
                  {syncLogs.map(log => (
                    <tr key={log.id} className="border-b border-border/50">
                      <td className="py-2 text-text-secondary">
                        {new Date(log.startedAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2 text-text-secondary">{log.direction}</td>
                      <td className="py-2">
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          log.status === 'SUCCESS' ? 'bg-success/10 text-success' :
                          log.status === 'FAILED' ? 'bg-danger/10 text-danger' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2 text-right text-text-secondary">{log.recordsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary">
                {editingId ? 'Editar Integração' : 'Nova Integração'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="rounded-lg bg-danger/10 p-2 text-xs text-danger">{saveError}</div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                disabled={!!editingId}
                className={FIELD_CONTROL}
              >
                {Object.entries(TYPE_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Nome / Provider</label>
              <input
                type="text"
                value={form.provider}
                onChange={e => setForm(prev => ({ ...prev, provider: e.target.value }))}
                placeholder="Ex: Meu Calendar, Conta Principal"
                className={FIELD_CONTROL}
              />
            </div>

            <div className="space-y-3 rounded-lg border border-border p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Configuração</p>
              {form.type === 'GOOGLE_CALENDAR' && (
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">Calendar ID</label>
                  <input
                    type="text"
                    value={(form.config.calendarId as string) ?? ''}
                    onChange={e => updateConfigField('calendarId', e.target.value)}
                    placeholder="seu-calendar@group.calendar.google.com"
                    className={FIELD_CONTROL}
                  />
                </div>
              )}
              {form.type === 'ICALENDAR' && (
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">URL do iCal</label>
                  <input
                    type="url"
                    value={(form.config.url as string) ?? ''}
                    onChange={e => updateConfigField('url', e.target.value)}
                    placeholder="https://..."
                    className={FIELD_CONTROL}
                  />
                </div>
              )}
              {form.type === 'TWILIO' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">Account SID</label>
                    <input
                      type="text"
                      value={(form.config.accountSid as string) ?? ''}
                      onChange={e => updateConfigField('accountSid', e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">Auth Token</label>
                    <input
                      type="password"
                      value={(form.config.authToken as string) ?? ''}
                      onChange={e => updateConfigField('authToken', e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">Número de origem</label>
                    <input
                      type="text"
                      value={(form.config.fromNumber as string) ?? ''}
                      onChange={e => updateConfigField('fromNumber', e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </div>
                </>
              )}
              {form.type === 'EVOLUTION_API' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">Nome da instância</label>
                    <input
                      type="text"
                      value={(form.config.instanceName as string) ?? ''}
                      onChange={e => updateConfigField('instanceName', e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">API URL</label>
                    <input
                      type="url"
                      value={(form.config.apiUrl as string) ?? ''}
                      onChange={e => updateConfigField('apiUrl', e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </div>
                </>
              )}
              {form.type === 'OPENAI' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">Modelo</label>
                    <input
                      type="text"
                      value={(form.config.model as string) ?? 'gpt-4o'}
                      onChange={e => updateConfigField('model', e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">Max Tokens</label>
                    <input
                      type="number"
                      value={String((form.config.maxTokens as number) ?? 1000)}
                      onChange={e => updateConfigField('maxTokens', e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </div>
                </>
              )}
              {form.type === 'ASAAS' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">API Key</label>
                    <input
                      type="password"
                      value={(form.config.apiKey as string) ?? ''}
                      onChange={e => updateConfigField('apiKey', e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">Ambiente</label>
                    <select
                      value={(form.config.environment as string) ?? 'sandbox'}
                      onChange={e => updateConfigField('environment', e.target.value)}
                      className={FIELD_CONTROL}
                    >
                      <option value="sandbox">Sandbox</option>
                      <option value="production">Produção</option>
                    </select>
                  </div>
                </>
              )}
              {form.type === 'ZAPI' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">Nome da instância</label>
                    <input
                      type="text"
                      value={(form.config.instanceName as string) ?? ''}
                      onChange={e => updateConfigField('instanceName', e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">API Key</label>
                    <input
                      type="password"
                      value={(form.config.apiKey as string) ?? ''}
                      onChange={e => updateConfigField('apiKey', e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </div>
                </>
              )}
              {form.type === 'WHATSAPP_CLOUD' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">Phone Number ID</label>
                    <input
                      type="text"
                      value={(form.config.phoneNumberId as string) ?? ''}
                      onChange={e => updateConfigField('phoneNumberId', e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-secondary">Access Token</label>
                    <input
                      type="password"
                      value={(form.config.accessToken as string) ?? ''}
                      onChange={e => updateConfigField('accessToken', e.target.value)}
                      className={FIELD_CONTROL}
                    />
                  </div>
                </>
              )}
              {form.type === 'NFSE' && (
                <p className="text-xs text-text-muted">Configuração será realizada via wizard fiscal.</p>
              )}
            </div>

            <div className={`${FORM_FOOTER} justify-end`}>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.provider}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
