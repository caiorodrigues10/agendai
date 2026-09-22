import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuTicket, LuListTodo, LuClock, LuTriangleAlert, LuCircleCheck,
  LuUsers, LuArrowRight, LuLoader, LuRefreshCcw
} from 'react-icons/lu';
import { adminInternalApi, WorkSummary } from '../../infra/adminInternalApi';
import { Toast } from '../../components/ui/Toast';

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'text-danger bg-danger/10',
  HIGH: 'text-warning bg-warning/10',
  NORMAL: 'text-accent bg-accent/10',
  LOW: 'text-text-muted bg-surface-2',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'text-support bg-support/10',
  IN_PROGRESS: 'text-accent bg-accent/10',
  WAITING_SHOP: 'text-warning bg-warning/10',
  RESOLVED: 'text-success bg-success/10',
  CANCELLED: 'text-text-muted bg-surface-2',
};

export const WorkSummaryPage: React.FC = () => {
  const [data, setData] = useState<WorkSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await adminInternalApi.getWorkSummary();
      setData(summary);
    } catch {
      setError('Não foi possível carregar o resumo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LuLoader className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <LuTriangleAlert className="mx-auto mb-3 text-warning" size={32} />
        <p className="text-text-secondary mb-3">{error}</p>
        <button onClick={load} className="text-accent text-sm hover:underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, myOpenTickets, myOverdueTasks, unassignedTickets, recentActivity } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Meu trabalho</h1>
        <button onClick={load} className="p-2 rounded-lg hover:bg-surface-2 text-text-muted">
          <LuRefreshCcw size={16} />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Chamados abertos', value: summary.totalOpenTickets, icon: LuTicket, color: 'text-support' },
          { label: 'Em atendimento', value: summary.totalInProgressTickets, icon: LuClock, color: 'text-accent' },
          { label: 'Minhas tarefas', value: summary.totalMyActiveTasks, icon: LuListTodo, color: 'text-warning' },
          { label: 'Concluídas hoje', value: summary.totalCompletedToday, icon: LuCircleCheck, color: 'text-success' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className={color} />
              <span className="text-xs text-text-muted">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* My open tickets */}
        <Section
          title="Meus chamados abertos"
          count={myOpenTickets.length}
          emptyText="Nenhum chamado atribuído"
          action={<button onClick={() => navigate('/master/tickets')} className="text-xs text-accent hover:underline">Ver todos</button>}
        >
          {myOpenTickets.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/master/tickets/${t.id}`)}
              className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${PRIORITY_COLORS[t.priority] ?? ''}`}>
                {t.priority}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.protocol} — {t.title}</p>
                {t.barbershop && <p className="text-xs text-text-muted truncate">{t.barbershop.name}</p>}
              </div>
              <LuArrowRight size={14} className="text-text-muted shrink-0" />
            </button>
          ))}
        </Section>

        {/* Unassigned tickets */}
        <Section
          title="Sem responsável"
          count={unassignedTickets.length}
          emptyText="Todos os chamados estão atribuídos"
          action={<button onClick={() => navigate('/master/tickets?unassigned=true')} className="text-xs text-accent hover:underline">Ver fila</button>}
        >
          {unassignedTickets.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/master/tickets/${t.id}`)}
              className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${PRIORITY_COLORS[t.priority] ?? ''}`}>
                {t.priority}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.protocol} — {t.title}</p>
                <p className="text-xs text-text-muted">{t.channel}</p>
              </div>
              <LuArrowRight size={14} className="text-text-muted shrink-0" />
            </button>
          ))}
        </Section>

        {/* Overdue tasks */}
        <Section
          title="Tarefas atrasadas"
          count={myOverdueTasks.length}
          emptyText="Nenhuma tarefa atrasada"
          action={<button onClick={() => navigate('/master/tasks')} className="text-xs text-accent hover:underline">Ver todas</button>}
        >
          {myOverdueTasks.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/master/tasks/${t.id}`)}
              className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <LuTriangleAlert size={14} className="text-danger shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.title}</p>
                {t.dueDate && (
                  <p className="text-xs text-danger">
                    Venceu em {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <LuArrowRight size={14} className="text-text-muted shrink-0" />
            </button>
          ))}
        </Section>

        {/* Recent activity */}
        <Section
          title="Atividade recente"
          count={recentActivity.length}
          emptyText="Nenhuma atividade recente"
        >
          {recentActivity.map((a: any) => (
            <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{a.actor.name}</span>
                  {' '}alterou{' '}
                  <span className="font-medium text-accent">{a.field}</span>
                  {' '}no chamado{' '}
                  <span className="font-medium">{a.ticket.protocol}</span>
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {new Date(a.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
};

// ── Section helper ────────────────────────────────────────────────────────────

const Section: React.FC<{
  title: string;
  count: number;
  emptyText: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, count, emptyText, action, children }) => (
  <div className="bg-surface border border-border rounded-xl overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      <h2 className="text-sm font-bold">{title}</h2>
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted">{count}</span>
        {action}
      </div>
    </div>
    <div className="divide-y divide-border/50 max-h-80 overflow-y-auto">
      {count === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-text-muted">{emptyText}</p>
      ) : (
        children
      )}
    </div>
  </div>
);

export default WorkSummaryPage;
