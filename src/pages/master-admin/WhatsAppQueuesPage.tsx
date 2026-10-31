import React, { useEffect, useState } from 'react';
import { LuLoader } from 'react-icons/lu';
import { adminWhatsappApi } from '../../infra/adminWhatsappApi';
import { SectionError } from '../../components/patterns';

export const WhatsAppQueuesPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminWhatsappApi.queues();
      setData(res.data);
    } catch (e: any) {
      setError(e?.message ?? 'Erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reprocess = async (queue: string, jobId: string) => {
    if (reason.trim().length < 10) { setError('Motivo mínimo 10 caracteres'); return; }
    try {
      await adminWhatsappApi.reprocessJob(queue, jobId, reason.trim());
      await load();
    } catch (e: any) { setError(e?.message ?? 'Erro'); }
  };

  const clean = async (queue: string, jobId: string) => {
    if (reason.trim().length < 10) { setError('Motivo mínimo 10 caracteres'); return; }
    try {
      await adminWhatsappApi.cleanJob(queue, jobId, reason.trim());
      await load();
    } catch (e: any) { setError(e?.message ?? 'Erro'); }
  };

  if (loading) return <div className="p-6 text-text-muted"><LuLoader className="animate-spin" /></div>;
  if (error) return <SectionError message={error} onRetry={load} />;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">WhatsApp — Filas</h1>
      <label className="text-sm">Motivo para ações</label>
      <textarea className="w-full border border-border rounded p-2 text-sm bg-bg" value={reason} onChange={(e) => setReason(e.target.value)} />
      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="font-bold mb-2">Contagens</h2>
        <pre className="text-xs overflow-auto">{JSON.stringify(data?.counts, null, 2)}</pre>
      </div>
      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="font-bold mb-2">Jobs falhos</h2>
        {Object.entries(data?.failed ?? {}).map(([q, jobs]: any) => (
          <div key={q} className="mb-4">
            <h3 className="font-semibold">{q}</h3>
            {(jobs as any[]).length === 0 && <p className="text-xs text-text-muted">Nenhum</p>}
            {(jobs as any[]).map((j) => (
              <div key={j.id} className="border border-border rounded p-2 text-xs mb-2">
                <p>{j.failedReason}</p>
                <div className="flex gap-2 mt-1">
                  <button className="px-2 py-1 bg-accent text-white rounded" onClick={() => reprocess(q, j.id)}>Reprocessar</button>
                  <button className="px-2 py-1 bg-danger text-white rounded" onClick={() => clean(q, j.id)}>Limpar</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
export default WhatsAppQueuesPage;
