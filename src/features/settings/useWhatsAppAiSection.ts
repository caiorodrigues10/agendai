import { useCallback, useEffect, useState } from 'react';
import {
  whatsappAiApi,
  type AiConversation,
  type AiIntentLog,
  type AiIntentStats,
  type AiMessage,
  type AiProcessResult,
  type AiSettings,
} from '../../infra/whatsappAiApi';
import { getErrorMessage } from '../../utils/errorMessage';

export type WhatsAppAiView = 'conversations' | 'logs' | 'analytics';

const PAGE_SIZE = 20;

/** Estado + ações da seção "Atendente de IA no WhatsApp". */
export function useWhatsAppAiSection(
  barbershopId: string,
  onNotify: (message: string, type: 'success' | 'error') => void
) {
  const [view, setView] = useState<WhatsAppAiView>('conversations');
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [conversationTotal, setConversationTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState<(AiConversation & { messages: AiMessage[] }) | null>(null);

  const [logs, setLogs] = useState<AiIntentLog[]>([]);
  const [stats, setStats] = useState<AiIntentStats | null>(null);

  const [testPhone, setTestPhone] = useState('');
  const [testContent, setTestContent] = useState('');
  const [testResult, setTestResult] = useState<AiProcessResult | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setSettings(await whatsappAiApi.getSettings(barbershopId));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar a configuração do atendente.'));
    }
  }, [barbershopId]);

  const loadConversations = useCallback(async () => {
    try {
      const result = await whatsappAiApi.listConversations(barbershopId, {
        status: statusFilter || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setConversations(result.conversations);
      setConversationTotal(result.total);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar as conversas.'));
    }
  }, [barbershopId, statusFilter, page]);

  const loadLogs = useCallback(async () => {
    try {
      const result = await whatsappAiApi.getIntentLogs(barbershopId, { page: 1, limit: 50 });
      setLogs(result.logs);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar os logs.'));
    }
  }, [barbershopId]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await whatsappAiApi.getStats(barbershopId));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar as estatísticas.'));
    }
  }, [barbershopId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadSettings();
      await loadConversations();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadSettings, loadConversations]);

  const selectView = async (next: WhatsAppAiView) => {
    setView(next);
    if (next === 'logs') await loadLogs();
    if (next === 'analytics') await loadStats();
  };

  const openConversation = async (conversationId: string) => {
    setBusy(true);
    try {
      setDetail(await whatsappAiApi.getConversationDetail(barbershopId, conversationId));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar a conversa.'));
    } finally {
      setBusy(false);
    }
  };

  const closeConversation = () => setDetail(null);

  const toggleEnabled = async (enabled: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await whatsappAiApi.updateSettings(barbershopId, enabled);
      setSettings(updated);
      onNotify(
        enabled ? 'Atendente de IA ligado neste salão.' : 'Atendente de IA desligado neste salão.',
        'success'
      );
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível alterar a configuração.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const transferToHuman = async (conversationId: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await whatsappAiApi.transferToHuman(barbershopId, conversationId);
      setDetail(prev => (prev ? { ...prev, status: 'TRANSFERRED_TO_HUMAN' } : prev));
      setConversations(prev =>
        prev.map(c => (c.id === conversationId ? { ...c, status: 'TRANSFERRED_TO_HUMAN' } : c))
      );
      onNotify('Conversa transferida para um atendente.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível transferir a conversa.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const sendTestMessage = async () => {
    if (busy) return;
    if (!testPhone.trim() || !testContent.trim()) {
      onNotify('Informe o telefone e a mensagem do cliente.', 'error');
      return;
    }
    setBusy(true);
    try {
      const result = await whatsappAiApi.processIncoming(
        barbershopId,
        testPhone.trim(),
        testContent.trim()
      );
      setTestResult(result);
      onNotify('Mensagem processada.', 'success');
      await loadConversations();
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível processar a mensagem.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(conversationTotal / PAGE_SIZE));

  return {
    view,
    selectView,
    settings,
    loading,
    busy,
    error,
    conversations,
    conversationTotal,
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
  };
}
