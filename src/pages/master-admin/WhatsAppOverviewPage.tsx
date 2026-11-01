import React, { useEffect, useState } from 'react';
import { LuLoader, LuCircleCheck, LuCircleX } from 'react-icons/lu';
import { adminWhatsappApi, WhatsAppOverview } from '../../infra/adminWhatsappApi';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

const pieceStatus = (state: string | null) =>
  state === 'open' ? 'Conectado' : state === 'connecting' ? 'Conectando' : 'Desconectado';

export const WhatsAppOverviewPage: React.FC = () => {
  const [data, setData] = useState<WhatsAppOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<Partial<WhatsAppOverview['globalSettings']> | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminWhatsappApi.overview();
      setData(res.data);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const requestChange = (patch: Partial<WhatsAppOverview['globalSettings']>) => {
    setPending(patch);
    setConfirmOpen(true);
  };

  const confirmChange = async () => {
    if (!pending) return;
    if (reason.trim().length < 10) { setError('Motivo mínimo 10 caracteres'); return; }
    try {
      await adminWhatsappApi.platformSettingsPut({ ...pending, reason: reason.trim() } as any);
      setConfirmOpen(false);
      setPending(null);
      setReason('');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao salvar');
    }
  };

  if (loading) return <div className="p-6 text-text-muted"><LuLoader className="animate-spin" /></div>;
  if (error) return <div className="p-6 text-danger">{error}</div>;
  if (!data) return null;

  const s = data.globalSettings;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">WhatsApp — Visão geral</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs font-bold uppercase text-text-muted">Atendente de IA</p>
          <p className="text-lg font-bold mt-1">{pieceStatus(data.instances.ai.state)}</p>
          <p className="text-xs text-text-muted">{data.instances.ai.name ?? 'não configurado'}</p>
          <p className="text-xs text-text-muted mt-2">Salões com IA ligada: {data.counts.shopsWithAiEnabled}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs font-bold uppercase text-text-muted">Assistente do dono</p>
          <p className="text-lg font-bold mt-1">{pieceStatus(data.instances.platform.state)}</p>
          <p className="text-xs text-text-muted">{data.instances.platform.name ?? 'não configurado'}</p>
          <p className="text-xs text-text-muted mt-2">Salões com assistente ligado: {data.counts.shopsWithOwnerBotEnabled}</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <h2 className="font-bold">Chaves globais</h2>
        <div className="flex items-center justify-between">
          <span>IA globalmente ligada</span>
          <button
            className={`px-3 py-1 rounded ${s.aiGloballyEnabled ? 'bg-success text-white' : 'bg-border'}`}
            onClick={() => requestChange({ aiGloballyEnabled: !s.aiGloballyEnabled })}
          >
            {s.aiGloballyEnabled ? 'Ligada' : 'Desligada'}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span>Assistente do dono globalmente ligado</span>
          <button
            className={`px-3 py-1 rounded ${s.ownerBotGloballyEnabled ? 'bg-success text-white' : 'bg-border'}`}
            onClick={() => requestChange({ ownerBotGloballyEnabled: !s.ownerBotGloballyEnabled })}
          >
            {s.ownerBotGloballyEnabled ? 'Ligado' : 'Desligado'}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span>Envios pausados</span>
          <button
            className={`px-3 py-1 rounded ${s.outboundPaused ? 'bg-danger text-white' : 'bg-border'}`}
            onClick={() => requestChange({ outboundPaused: !s.outboundPaused })}
          >
            {s.outboundPaused ? 'Pausado' : 'Ativo'}
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="font-bold mb-2">Filas</h2>
        <pre className="text-xs overflow-auto">{JSON.stringify(data.queues, null, 2)}</pre>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        <label className="text-sm">Motivo (mín. 10 caracteres)</label>
        <textarea className="w-full border border-border rounded p-2 text-sm bg-bg mt-1" value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar alteração global"
        message="Esta ação afeta toda a plataforma."
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={confirmChange}
        onCancel={() => { setConfirmOpen(false); setPending(null); }}
      />
    </div>
  );
};
export default WhatsAppOverviewPage;
