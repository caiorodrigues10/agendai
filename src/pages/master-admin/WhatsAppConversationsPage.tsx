import React, { useEffect, useState } from 'react';
import { LuLoader } from 'react-icons/lu';
import { adminWhatsappApi, AiConversationSummary, AiConversationDetail } from '../../infra/adminWhatsappApi';
import { ModalShell } from '../../components/patterns/ModalShell';
import { PaginationBar } from '../../components/ui/PaginationBar';
import { SectionError } from '../../components/patterns';

export const WhatsAppConversationsPage: React.FC = () => {
  const [items, setItems] = useState<AiConversationSummary[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AiConversationDetail | null>(null);
  const [reason, setReason] = useState('');

  const load = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminWhatsappApi.aiConversations({ page, limit: 20 });
      setItems(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setError(e?.message ?? 'Erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const openDetail = async (id: string) => {
    try {
      const res = await adminWhatsappApi.aiConversationDetail(id);
      setDetail(res.data);
    } catch (e: any) { setError(e?.message ?? 'Erro'); }
  };

  const transfer = async () => {
    if (!detail) return;
    if (reason.trim().length < 10) { setError('Motivo mínimo 10 caracteres'); return; }
    try {
      await adminWhatsappApi.aiTransfer(detail.id, reason.trim());
      setDetail(null);
      setReason('');
      await load(meta.page);
    } catch (e: any) { setError(e?.message ?? 'Erro'); }
  };

  if (loading) return <div className="p-6 text-text-muted"><LuLoader className="animate-spin" /></div>;
  if (error) return <SectionError message={error} onRetry={() => load(meta.page)} />;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">WhatsApp — Conversas (IA)</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-border">
            <th className="p-2">Salão</th>
            <th className="p-2">Telefone</th>
            <th className="p-2">Status</th>
            <th className="p-2">Msgs</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-b border-border">
              <td className="p-2">{c.barbershopName}</td>
              <td className="p-2">{c.phoneMasked}</td>
              <td className="p-2">{c.status}</td>
              <td className="p-2">{c.messageCount}</td>
              <td className="p-2">
                <button className="px-2 py-1 bg-accent text-white rounded text-xs" onClick={() => openDetail(c.id)}>Ver</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationBar page={meta.page} totalPages={meta.totalPages} onPageChange={(p) => load(p)} />

      <ModalShell open={!!detail} title="Conversa" titleId="conv-detail" onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-2">
            <p className="text-xs text-text-muted">{detail.phoneMasked} — {detail.barbershopName}</p>
            <div className="max-h-64 overflow-auto space-y-1">
              {detail.messages.map((m) => (
                <div key={m.id} className={`text-sm ${m.direction === 'INBOUND' ? 'text-left' : 'text-right'}`}>
                  <span className="inline-block bg-surface border border-border rounded px-2 py-1">{m.content}</span>
                </div>
              ))}
            </div>
            <textarea className="w-full border border-border rounded p-2 text-sm bg-bg" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo para transferir" />
            <button className="px-3 py-1 bg-danger text-white rounded" onClick={transfer}>Transferir para humano</button>
          </div>
        )}
      </ModalShell>
    </div>
  );
};
export default WhatsAppConversationsPage;
