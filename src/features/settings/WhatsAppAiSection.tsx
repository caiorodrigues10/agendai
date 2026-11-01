import React from 'react';
import {
  LuBot as Bot,
  LuChartColumn as BarChart3,
  LuList as List,
  LuLoaderCircle as Loader2,
  LuMessageSquare as MessageSquare,
  LuPhone as Phone,
  LuSend as Send,
  LuTriangleAlert as AlertTriangle,
  LuUserCheck as UserCheck,
} from 'react-icons/lu';
import { Button } from '../../components/ui/Button';
import {
  aiConversationStatusLabel,
  aiHandledByLabel,
  aiIntentLabel,
} from '../../infra/whatsappAiApi';
import { useWhatsAppAiSection } from './useWhatsAppAiSection';

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: '', label: 'Todas' },
  { id: 'ACTIVE', label: 'Ativas' },
  { id: 'TRANSFERRED_TO_HUMAN', label: 'Transferidas' },
  { id: 'CLOSED', label: 'Fechadas' },
];

/**
 * Seção "Atendente de IA no WhatsApp".
 *
 * O atendente responde o cliente final automaticamente (preços, horário,
 * endereço) e resolve sozinho qual salão atender a partir do número do
 * cliente. Aqui o dono liga/desliga o atendente, acompanha as conversas e
 * transfere para um atendente humano.
 */
export const WhatsAppAiSection: React.FC<{
  barbershopId: string;
  onNotify: (message: string, type: 'success' | 'error') => void;
}> = ({ barbershopId, onNotify }) => {
  const ai = useWhatsAppAiSection(barbershopId, onNotify);
  const {
    view,
    selectView,
    settings,
    loading,
    busy,
    error,
    conversations,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    detail,
    openConversation,
    closeConversation,
    logs,
    stats,
    testPhone,
    setTestPhone,
    testContent,
    setTestContent,
    testResult,
    sendTestMessage,
    toggleEnabled,
    transferToHuman,
    totalPages,
  } = ai;

  const enabled = Boolean(settings?.enabled);

  return (
    <div className="bg-surface border border-border rounded-xl p-5" data-testid="whatsapp-ai-section">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Bot size={18} /> Atendente de IA no WhatsApp
        </h3>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Atendente de IA"
          disabled={busy || !settings}
          onClick={() => void toggleEnabled(!enabled)}
          className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
            enabled ? 'bg-accent' : 'bg-surface-2'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
      <p className="text-xs text-text-muted mb-4">
        Respostas automáticas para o cliente final: preços, horário de funcionamento e endereço.
        O salão atendido é resolvido pelo número do cliente.
      </p>

      {settings && !settings.aiInstanceConfigured && (
        <p
          className="mb-4 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-text-secondary"
          data-testid="whatsapp-ai-no-instance"
        >
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />
          <span>
            A instância do atendente de IA não está configurada no servidor. Enquanto isso, as
            mensagens do WhatsApp não chegam aqui — só o teste manual abaixo funciona.
          </span>
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={16} className="animate-spin" /> Consultando o atendente...
        </div>
      ) : (
        <>
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {[
              { id: 'conversations' as const, label: 'Conversas', icon: MessageSquare },
              { id: 'logs' as const, label: 'Logs', icon: List },
              { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
            ].map(tab => {
              const Icon = tab.icon;
              const active = view === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => void selectView(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${
                    active
                      ? 'bg-accent text-accent-fg'
                      : 'bg-surface-2 text-text-secondary hover:bg-surface-2/70'
                  }`}
                >
                  <Icon size={12} /> {tab.label}
                </button>
              );
            })}
          </div>

          {view === 'conversations' && !detail && (
            <>
              <div className="mb-3 flex gap-2 overflow-x-auto">
                {STATUS_FILTERS.map(filter => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(filter.id);
                      setPage(1);
                    }}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${
                      statusFilter === filter.id
                        ? 'bg-accent text-accent-fg'
                        : 'bg-surface-2 text-text-secondary hover:bg-surface-2/70'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {conversations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-bg p-6 text-center">
                  <MessageSquare size={24} className="mx-auto text-text-muted" />
                  <p className="mt-2 text-sm text-text-secondary">
                    Nenhuma conversa ainda. Quando o cliente escrever no WhatsApp, ela aparece aqui.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {conversations.map(conversation => (
                    <li key={conversation.id}>
                      <button
                        type="button"
                        onClick={() => void openConversation(conversation.id)}
                        className="w-full rounded-xl border border-border bg-bg p-3 text-left hover:border-accent/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-text-primary">
                            <Phone size={12} className="text-text-muted" /> {conversation.phone}
                          </span>
                          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-text-secondary">
                            {aiConversationStatusLabel(conversation.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-text-muted">
                          {conversation._count?.messages ?? 0} mensagens ·{' '}
                          {new Date(conversation.lastMessageAt).toLocaleString('pt-BR')}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(Math.max(1, page - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="text-xs text-text-muted">
                    {page}/{totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}

          {view === 'conversations' && detail && (
            <div className="space-y-3" data-testid="whatsapp-ai-detail">
              <Button type="button" variant="ghost" size="sm" onClick={closeConversation}>
                Voltar
              </Button>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-bg p-3">
                <span className="flex items-center gap-1.5 text-sm font-bold text-text-primary">
                  <Phone size={12} className="text-text-muted" /> {detail.phone}
                </span>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-text-secondary">
                  {aiConversationStatusLabel(detail.status)}
                </span>
              </div>

              {detail.status === 'ACTIVE' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={busy}
                  onClick={() => void transferToHuman(detail.id)}
                >
                  <UserCheck size={14} /> Transferir para humano
                </Button>
              )}

              <ul className="max-h-[320px] space-y-2 overflow-y-auto">
                {detail.messages.map(message => (
                  <li
                    key={message.id}
                    className={`flex ${
                      message.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                        message.direction === 'OUTBOUND'
                          ? 'bg-accent text-accent-fg'
                          : 'bg-surface-2 text-text-primary'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] opacity-70">
                        <span>
                          {new Date(message.sentAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {message.intent && <span>{aiIntentLabel(message.intent)}</span>}
                        {message.confidence != null && (
                          <span>{Math.round(message.confidence * 100)}%</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view === 'logs' && (
            <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-bg p-6 text-center text-sm text-text-secondary">
                  Nenhum log de intenção ainda.
                </p>
              ) : (
                <ul className="space-y-1">
                  {logs.map(log => (
                    <li
                      key={log.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-xs"
                    >
                      <span className="font-bold text-text-primary">{aiIntentLabel(log.intent)}</span>
                      <span className="text-text-muted">
                        {aiHandledByLabel(log.handledBy)} · {Math.round(log.confidence * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {view === 'analytics' && (
            <div className="space-y-3">
              {!stats ? (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Loader2 size={16} className="animate-spin" /> Carregando indicadores...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border bg-bg p-3 text-center">
                      <p className="text-xl font-bold text-text-primary">{stats.total}</p>
                      <p className="text-[11px] text-text-muted">Mensagens</p>
                    </div>
                    <div className="rounded-xl border border-border bg-bg p-3 text-center">
                      <p className="text-xl font-bold text-text-primary">
                        {Math.round(stats.avgConfidence * 100)}%
                      </p>
                      <p className="text-[11px] text-text-muted">Confiança média</p>
                    </div>
                  </div>

                  {Object.keys(stats.byIntent).length > 0 && (
                    <div className="rounded-xl border border-border bg-bg p-3">
                      <p className="mb-2 text-xs font-bold text-text-primary">Por intenção</p>
                      <ul className="space-y-1">
                        {Object.entries(stats.byIntent)
                          .sort((a, b) => b[1] - a[1])
                          .map(([intent, count]) => (
                            <li
                              key={intent}
                              className="flex items-center justify-between text-xs text-text-secondary"
                            >
                              <span>{aiIntentLabel(intent)}</span>
                              <span className="font-bold text-text-primary">{count}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {Object.keys(stats.byHandledBy).length > 0 && (
                    <div className="rounded-xl border border-border bg-bg p-3">
                      <p className="mb-2 text-xs font-bold text-text-primary">Por atendimento</p>
                      <ul className="space-y-1">
                        {Object.entries(stats.byHandledBy).map(([handledBy, count]) => (
                          <li
                            key={handledBy}
                            className="flex items-center justify-between text-xs text-text-secondary"
                          >
                            <span>{aiHandledByLabel(handledBy)}</span>
                            <span className="font-bold text-text-primary">{count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="mt-5 rounded-xl border border-border bg-bg p-3" data-testid="whatsapp-ai-test">
            <p className="text-xs font-bold text-text-primary">Testar uma mensagem</p>
            <p className="mt-1 text-[11px] text-text-muted">
              Simula o que o cliente escreveria. Não envia nada ao WhatsApp.
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                type="tel"
                value={testPhone}
                onChange={event => setTestPhone(event.target.value)}
                placeholder="Telefone do cliente"
                aria-label="Telefone do cliente"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
              <input
                type="text"
                value={testContent}
                onChange={event => setTestContent(event.target.value)}
                placeholder="Ex.: qual o horário de vocês?"
                aria-label="Mensagem do cliente"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                loading={busy}
                onClick={() => void sendTestMessage()}
              >
                <Send size={14} /> Processar
              </Button>
              {testResult && (
                <span className="text-[11px] text-text-muted" data-testid="whatsapp-ai-test-result">
                  {aiIntentLabel(testResult.intent)} · {Math.round(testResult.confidence * 100)}%
                </span>
              )}
            </div>
            {testResult && (
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-xs text-text-primary">
                {testResult.reply}
              </p>
            )}
          </div>
        </>
      )}

      {error && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
