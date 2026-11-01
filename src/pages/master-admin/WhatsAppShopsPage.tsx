import React, { useEffect, useState } from 'react';
import { LuLoader } from 'react-icons/lu';
import { adminWhatsappApi, WhatsAppShop } from '../../infra/adminWhatsappApi';
import { TableSkeleton, DataTableState, SectionError } from '../../components/patterns';
import { PaginationBar } from '../../components/ui/PaginationBar';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const WhatsAppShopsPage: React.FC = () => {
  const [shops, setShops] = useState<WhatsAppShop[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState<{ id: string; action: 'ai' | 'owner'; value: boolean } | null>(null);

  const load = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminWhatsappApi.shops({ page, limit: 20, search });
      setShops(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setError(e?.message ?? 'Erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const doToggle = async () => {
    if (!confirm) return;
    if (reason.trim().length < 10) { setError('Motivo mínimo 10 caracteres'); return; }
    try {
      if (confirm.action === 'ai') {
        await adminWhatsappApi.patchShopAi(confirm.id, { enabled: confirm.value, reason: reason.trim() });
      } else {
        await adminWhatsappApi.patchShopOwnerBot(confirm.id, { enabled: confirm.value, reason: reason.trim() });
      }
      setConfirm(null);
      setReason('');
      await load(meta.page);
    } catch (e: any) {
      setError(e?.message ?? 'Erro');
    }
  };

  if (loading) return <TableSkeleton rows={5} cols={4} />;
  if (error) return <SectionError message={error} onRetry={() => load(meta.page)} />;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">WhatsApp — Salões</h1>
      <input
        className="border border-border rounded p-2 text-sm bg-bg"
        placeholder="Buscar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && load(1)}
      />
      {shops.length === 0 ? (
        <p className="text-text-muted">Nenhum salão encontrado.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-border">
              <th className="p-2">Nome</th>
              <th className="p-2">IA</th>
              <th className="p-2">Assistente</th>
              <th className="p-2">Instância</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((s) => (
              <tr key={s.id} className="border-b border-border">
                <td className="p-2">{s.name}</td>
                <td className="p-2">
                  <button
                    className={`px-2 py-1 rounded text-xs ${s.whatsappAiEnabled ? 'bg-success text-white' : 'bg-border'}`}
                    onClick={() => setConfirm({ id: s.id, action: 'ai', value: !s.whatsappAiEnabled })}
                  >
                    {s.whatsappAiEnabled ? 'Ligada' : 'Desligada'}
                  </button>
                </td>
                <td className="p-2">
                  <button
                    className={`px-2 py-1 rounded text-xs ${s.ownerBot?.enabled ? 'bg-success text-white' : 'bg-border'}`}
                    onClick={() => setConfirm({ id: s.id, action: 'owner', value: !(s.ownerBot?.enabled ?? false) })}
                  >
                    {s.ownerBot?.enabled ? 'Ligado' : 'Desligado'}
                  </button>
                </td>
                <td className="p-2 text-xs text-text-muted">{s.evolutionInstanceName ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <PaginationBar page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load(p)} />

      <ConfirmDialog
        open={!!confirm}
        title="Confirmar alteração"
        message="Ação sobre salão."
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={doToggle}
        onCancel={() => setConfirm(null)}
      />
      <div className="mt-2">
        <label className="text-sm">Motivo</label>
        <textarea className="w-full border border-border rounded p-2 text-sm bg-bg" value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
    </div>
  );
};
export default WhatsAppShopsPage;
