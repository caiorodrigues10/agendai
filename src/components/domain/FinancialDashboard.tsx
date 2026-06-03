import React, { useState, useMemo } from 'react';
import { QueueItem, Service, StaffMember } from '../../types';
import { DollarSign, Users, Calendar, TrendingUp, Filter, History, Trash2, Check, X } from 'lucide-react';

interface FinancialDashboardProps {
  queueHistory: QueueItem[];
  services: Service[];
  currentUser: StaffMember;
  allStaff: StaffMember[];
  onDeleteHistoryItem: (id: string) => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  queueHistory,
  services,
  currentUser,
  allStaff,
  onDeleteHistoryItem
}) => {
  const [viewMode, setViewMode] = useState<'personal' | 'shop'>((currentUser.role === 'admin' || currentUser.role === 'owner') ? 'shop' : 'personal');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getStaffName = (id?: string) => allStaff.find(s => s.id === id)?.name || 'Desconhecido';
  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || 'Serviço Removido';

  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return queueHistory.filter(item => {
      if (item.status !== 'completed' || !item.completedAt) return false;
      if (viewMode === 'personal' && item.completedBy !== currentUser.id) return false;
      if (timeFilter === 'today' && item.completedAt < startOfDay) return false;
      if (timeFilter === 'week' && item.completedAt < startOfWeek) return false;
      if (timeFilter === 'month' && item.completedAt < startOfMonth) return false;
      return true;
    }).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }, [queueHistory, viewMode, timeFilter, currentUser.id]);

  const stats = useMemo(() => {
    const totalRevenue = filteredData.reduce((acc, curr) => acc + (curr.finalPrice || 0), 0);
    const totalClients = filteredData.length;
    const avgTicket = totalClients > 0 ? totalRevenue / totalClients : 0;

    const daysCount = [0, 0, 0, 0, 0, 0, 0];
    filteredData.forEach(item => {
      if (item.completedAt) {
        const day = new Date(item.completedAt).getDay();
        daysCount[day]++;
      }
    });
    const maxDayCount = Math.max(...daysCount) || 1;

    return { totalRevenue, totalClients, avgTicket, daysCount, maxDayCount };
  }, [filteredData]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex flex-col gap-4 bg-neutral-900 p-4 rounded-xl border border-neutral-800">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-cyan-400" /> Dashboard
            </h2>

            {(currentUser.role === 'admin' || currentUser.role === 'owner') && (
                <div className="flex bg-neutral-950 rounded-lg p-1 border border-neutral-800">
                    <button
                        onClick={() => setViewMode('shop')}
                        className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${viewMode === 'shop' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500'}`}
                    >
                        Barbearia
                    </button>
                    <button
                        onClick={() => setViewMode('personal')}
                        className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${viewMode === 'personal' ? 'bg-cyan-900/30 text-cyan-400 shadow' : 'text-neutral-500'}`}
                    >
                        Meus Resultados
                    </button>
                </div>
            )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
            {['today', 'week', 'month', 'all'].map((t) => (
                <button
                    key={t}
                    onClick={() => setTimeFilter(t as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap
                        ${timeFilter === t
                            ? 'bg-cyan-600 border-cyan-500 text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-600'}
                    `}
                >
                    {t === 'today' ? 'Hoje' : t === 'week' ? 'Semana' : t === 'month' ? 'Mês' : 'Tudo'}
                </button>
            ))}
        </div>
      </div>

      {(currentUser.role === 'admin' || currentUser.role === 'owner') && (
        <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800">
          <h3 className="text-sm font-bold text-white mb-3">Insights de Retenção e Receita</h3>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li>Retenção é a alavanca principal: estudos da Harvard Business Review indicam que 5% a mais de retenção pode elevar receita entre 25% e 95%.</li>
            <li>Estratégias com maior impacto: reativação de clientes inativos, recomendações personalizadas e lembretes de retorno com base no último serviço.</li>
            <li>Prioridade prática: reduzir faltas com lembretes 24h e 2h antes, e oferecer reaproveitamento rápido de horários vagos.</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 shadow-lg relative overflow-hidden">
             <div className="absolute -right-2 -top-2 text-neutral-800 opacity-20"><DollarSign size={64} /></div>
             <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Faturamento</p>
             <h3 className="text-lg sm:text-xl font-bold text-green-400 truncate">
                R$ {stats.totalRevenue.toFixed(0)}
             </h3>
        </div>
        <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 shadow-lg relative overflow-hidden">
             <div className="absolute -right-2 -top-2 text-neutral-800 opacity-20"><Users size={64} /></div>
             <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Clientes</p>
             <h3 className="text-lg sm:text-xl font-bold text-white">
                {stats.totalClients}
             </h3>
        </div>
        <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 shadow-lg relative overflow-hidden">
             <div className="absolute -right-2 -top-2 text-neutral-800 opacity-20"><Filter size={64} /></div>
             <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Ticket Médio</p>
             <h3 className="text-lg sm:text-xl font-bold text-cyan-400">
                R$ {stats.avgTicket.toFixed(0)}
             </h3>
        </div>
      </div>

      <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800">
         <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <Calendar size={16} className="text-cyan-500" /> Fluxo Semanal (Volume)
         </h3>

         <div className="flex justify-between items-end h-32 gap-2">
            {stats.daysCount.map((count, index) => {
                const heightPercentage = (count / stats.maxDayCount) * 100;
                return (
                    <div key={index} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full flex items-end justify-center h-full">
                            <div
                                style={{ height: `${heightPercentage}%` }}
                                className={`w-full max-w-[20px] rounded-t-sm transition-all duration-500 relative group-hover:brightness-110
                                    ${heightPercentage === 100 ? 'bg-cyan-500' : 'bg-neutral-800'}
                                `}
                            >
                                {count > 0 && (
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white bg-neutral-950 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {count}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-[10px] uppercase text-neutral-500 mt-2 font-bold">{weekDays[index]}</span>
                    </div>
                )
            })}
         </div>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History size={16} className="text-cyan-500" /> Histórico de Atendimentos
            </h3>
            <span className="text-xs text-neutral-500">{filteredData.length} registros</span>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
            {filteredData.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">
                    Nenhum registro encontrado para este período.
                </div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-950 text-neutral-500 text-[10px] uppercase tracking-wider sticky top-0">
                        <tr>
                            <th className="p-3 font-medium">Data/Hora</th>
                            <th className="p-3 font-medium">Cliente</th>
                            <th className="p-3 font-medium">Serviço</th>
                            {viewMode === 'shop' && <th className="p-3 font-medium text-right">Barbeiro</th>}
                            <th className="p-3 font-medium text-right">Valor</th>
                            {(currentUser.role === 'admin' || currentUser.role === 'owner') && <th className="p-3 font-medium text-center">Ações</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {filteredData.map(item => (
                            <tr key={item.id} className="text-xs text-neutral-300 hover:bg-neutral-900">
                                <td className="p-3 whitespace-nowrap">
                                    {new Date(item.completedAt || 0).toLocaleString('pt-BR')}
                                </td>
                                <td className="p-3">{item.customerName}</td>
                                <td className="p-3">{getServiceName(item.serviceId)}</td>
                                {viewMode === 'shop' && <td className="p-3 text-right">{getStaffName(item.completedBy)}</td>}
                                <td className="p-3 text-right text-green-400">
                                    R$ {(item.finalPrice || 0).toFixed(2)}
                                </td>
                                {(currentUser.role === 'admin' || currentUser.role === 'owner') && (
                                    <td className="p-3 text-center">
                                        {deleteConfirmId === item.id ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => { onDeleteHistoryItem(item.id); setDeleteConfirmId(null); }}
                                                    className="p-1 bg-red-600 text-white rounded"
                                                >
                                                    <Check size={12} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(null)}
                                                    className="p-1 bg-neutral-800 text-neutral-400 rounded"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirmId(item.id)}
                                                className="text-neutral-500 hover:text-red-400"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};
