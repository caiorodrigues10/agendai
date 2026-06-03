import React from 'react';
import { QueueItem, Service } from '../../types';
import { DynamicIcon } from '../ui/DynamicIcon';
import { MessageCircle, Trash2, LogOut, CheckCircle, Bell, Clock } from 'lucide-react';

interface QueueItemCardProps {
  item: QueueItem;
  service: Service | undefined;
  position: number;
  isAdmin: boolean;
  isCurrentUser: boolean;
  onStatusChange: (id: string, status: QueueItem['status']) => void;
  onLeaveQueue: (id: string) => void;
}

export const QueueItemCard: React.FC<QueueItemCardProps> = ({
  item,
  service,
  position,
  isAdmin,
  isCurrentUser,
  onStatusChange,
  onLeaveQueue
}) => {

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'in_chair': return 'border-l-4 border-l-green-500 bg-green-500/5';
      case 'waiting': return isCurrentUser
          ? 'border-l-4 border-l-cyan-400 bg-cyan-950/20 border border-cyan-900'
          : 'border-l-4 border-l-neutral-700 bg-neutral-900';
      case 'completed': return 'border-l-4 border-l-neutral-600 bg-neutral-900 opacity-60';
      default: return 'bg-neutral-900';
    }
  };

  const getStatusLabel = (status: string) => {
     switch(status) {
      case 'in_chair': return 'Na Cadeira';
      case 'waiting': return 'Aguardando';
      case 'completed': return 'Finalizado';
      default: return status;
    }
  };

  const sendReminder = () => {
    const phone = item.whatsapp.replace(/\D/g, '');
    const msg = `Olá ${item.customerName}! Sua vez na Reis Barbearia está chegando (aprox. 15 min). Já pode vir!`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const sendNextNotification = () => {
    const phone = item.whatsapp.replace(/\D/g, '');
    const msg = `Olá ${item.customerName}! Você é o próximo na fila da Reis Barbearia. Por favor, fique atento!`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const hasValidPhone = item.whatsapp && item.whatsapp !== '00000000000' && item.whatsapp.replace(/\D/g, '').length > 5;

  return (
    <div className={`rounded-lg p-4 mb-3 border border-neutral-800 shadow-sm transition-all ${getStatusColor(item.status)}`}>
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="flex flex-col items-center justify-center min-w-[2.5rem]">
            {item.status === 'in_chair' ? (
              <span className="animate-pulse text-green-400">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 blur opacity-50 rounded-full animate-ping"></div>
                  <DynamicIcon name="Scissors" size={24} className="relative z-10" />
                </div>
              </span>
            ) : (
              <span className={`text-xl font-bold ${isCurrentUser ? 'text-cyan-400' : 'text-neutral-500'}`}>#{position}</span>
            )}
          </div>
          <div>
            <h4 className={`font-bold text-lg ${isCurrentUser ? 'text-cyan-100' : 'text-neutral-200'}`}>
                {item.customerName} {isCurrentUser && <span className="text-xs text-cyan-500 ml-2">(Você)</span>}
            </h4>
            <div className="flex items-center gap-2 text-sm text-neutral-400">
               {service && <DynamicIcon name={service.icon} size={14} />}
               <span>{service?.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-600 mt-1">
              <Clock size={10} />
              <span>Chegou às {new Date(item.joinedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-2">
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide
            ${item.status === 'in_chair' ? 'text-green-400 bg-green-400/10' : 'text-neutral-400 bg-neutral-800'}
          `}>
            {getStatusLabel(item.status)}
          </span>

          {isCurrentUser && item.status === 'waiting' && !isAdmin && (
              <button
                onClick={() => {
                    if(confirm("Deseja realmente sair da fila?")) onLeaveQueue(item.id);
                }}
                className="mt-1 px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-900/50 hover:bg-red-900/50 text-red-400 text-xs font-bold transition-all flex items-center gap-2 group hover:shadow-[0_0_10px_rgba(239,68,68,0.1)]"
              >
                <LogOut size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                Sair da fila
              </button>
          )}
        </div>
      </div>

      {isAdmin && item.status !== 'completed' && (
        <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-wrap justify-end gap-2">
           {item.status === 'waiting' && (
             <>
                {hasValidPhone && (
                  <>
                    <button
                      onClick={sendReminder}
                      className="px-3 py-1.5 text-xs text-green-400 bg-green-900/20 border border-green-800 hover:bg-green-900/40 rounded flex items-center gap-1 transition-colors"
                    >
                      <MessageCircle size={14} /> Avisar (15m)
                    </button>
                    <button
                      onClick={sendNextNotification}
                      className="px-3 py-1.5 text-xs text-cyan-400 bg-cyan-900/20 border border-cyan-800 hover:bg-cyan-900/40 rounded flex items-center gap-1 transition-colors"
                    >
                      <MessageCircle size={14} /> É o Próximo
                    </button>
                  </>
                )}
                <button
                  onClick={() => onStatusChange(item.id, 'cancelled')}
                  className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/50 rounded flex items-center gap-1 transition-colors"
                >
                   <Trash2 size={14} /> Cancelar
                </button>
                <button
                  onClick={() => onStatusChange(item.id, 'in_chair')}
                  className="px-4 py-1.5 text-xs font-bold text-black bg-cyan-500 hover:bg-cyan-400 rounded shadow-lg shadow-cyan-500/20 flex items-center gap-1 transition-colors"
                >
                  <Bell size={14} /> Chamar
                </button>
             </>
           )}
           {item.status === 'in_chair' && (
             <button
                onClick={() => onStatusChange(item.id, 'completed')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-500 rounded shadow-md w-full flex items-center justify-center gap-1 transition-colors"
              >
                <CheckCircle size={14} /> Finalizar Serviço
              </button>
           )}
        </div>
      )}
    </div>
  );
};
