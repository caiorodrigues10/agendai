import { useCallback, useEffect, useState } from 'react';
import {
  ownerBotApi,
  type OwnerBotActionLogEntry,
  type OwnerBotCatalog,
  type OwnerBotPreferences,
  type OwnerBotStatus,
} from '../../infra/ownerBotApi';
import { getErrorMessage } from '../../utils/errorMessage';

/** Estado + carregamento (status, preferências, catálogo, auditoria) da seção. */
export function useOwnerBotData(barbershopId: string) {
  const [status, setStatus] = useState<OwnerBotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [prefs, setPrefs] = useState<OwnerBotPreferences | null>(null);
  const [catalog, setCatalog] = useState<OwnerBotCatalog | null>(null);
  const [logs, setLogs] = useState<OwnerBotActionLogEntry[]>([]);
  const [prefsDraft, setPrefsDraft] = useState<Partial<OwnerBotPreferences>>({});

  const loadStatus = useCallback(async () => {
    try {
      const next = await ownerBotApi.getStatus(barbershopId);
      setStatus(next);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível consultar o assistente.'));
    }
  }, [barbershopId]);

  const loadPrefs = useCallback(async () => {
    try {
      const next = await ownerBotApi.getPreferences(barbershopId);
      setPrefs(next);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar as preferências.'));
    }
  }, [barbershopId]);

  const loadCatalog = useCallback(async () => {
    try {
      const next = await ownerBotApi.getCatalog(barbershopId);
      setCatalog(next);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar o catálogo.'));
    }
  }, [barbershopId]);

  const loadLogs = useCallback(async () => {
    try {
      const next = await ownerBotApi.getActionLogs(barbershopId, { limit: 50 });
      setLogs(next);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar a auditoria.'));
    }
  }, [barbershopId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await Promise.all([loadStatus(), loadPrefs(), loadCatalog(), loadLogs()]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadStatus, loadPrefs, loadCatalog, loadLogs]);

  useEffect(() => {
    if (!code) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [code]);

  const secondsLeft = codeExpiresAt
    ? Math.max(0, Math.round((codeExpiresAt - now) / 1000))
    : 0;

  const mergedPrefs = prefs ? { ...prefs, ...prefsDraft } : null;

  return {
    status,
    loading,
    busy,
    error,
    code,
    copied,
    secondsLeft,
    showUnlinkModal,
    showBlockModal,
    prefs,
    catalog,
    logs,
    prefsDraft,
    mergedPrefs,
    setBusy,
    setError,
    setCode,
    setCodeExpiresAt,
    setNow,
    setCopied,
    setShowUnlinkModal,
    setShowBlockModal,
    setPrefs,
    setPrefsDraft,
    loadStatus,
    loadPrefs,
  };
}
