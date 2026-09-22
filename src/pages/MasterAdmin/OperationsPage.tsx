import React, { useState, useEffect, useCallback } from 'react';
import { LuLoader, LuTriangleAlert, LuActivity, LuCircleCheck, LuCircleX, LuCircleHelp } from 'react-icons/lu';
import { adminInternalApi } from '../../infra/adminInternalApi';

export const OperationsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminInternalApi.getOperationsHealth();
      setData(res);
    } catch {
      setError('Não foi possível carregar as informações de operação.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <div className="flex justify-center py-20"><LuLoader className="animate-spin text-accent" size={32} /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <LuTriangleAlert className="mx-auto mb-2 text-warning" size={24} />
        <p className="text-sm text-text-secondary">{error}</p>
        <button onClick={load} className="text-accent text-sm mt-2 hover:underline">Tentar novamente</button>
      </div>
    );
  }

  const health = data?.data ?? data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Operação</h1>
        <button onClick={load} className="p-2 rounded-lg hover:bg-surface-2 text-text-muted">
          <LuActivity size={16} />
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="text-sm font-bold mb-3">Saúde das notificações</h2>
        {health ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(health).map(([key, value]) => (
              <div key={key} className="bg-bg border border-border rounded-lg p-3">
                <p className="text-xs text-text-muted mb-1">{key}</p>
                <div className="flex items-center gap-2">
                  {value === true || value === 'ok' ? (
                    <LuCircleCheck size={14} className="text-success" />
                  ) : value === false || value === 'error' ? (
                    <LuCircleX size={14} className="text-danger" />
                  ) : (
                    <LuCircleHelp size={14} className="text-text-muted" />
                  )}
                  <span className="text-sm font-medium">
                    {value === true ? 'Saudável' : value === false ? 'Falha' : String(value ?? 'Sem informação')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">Nenhuma informação de telemetria disponível.</p>
        )}
      </div>
    </div>
  );
};

export default OperationsPage;
