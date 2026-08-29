import React, { useState } from 'react';
import { QueueItem, Service } from '../../types';
import { DynamicIcon } from '../ui/DynamicIcon';
import { MessageCircle, Trash2, LogOut, CheckCircle, Bell, Clock, Undo2, Loader2 } from 'lucide-react';
import { notificationsApi } from '../../infra/notificationsApi';
import { getErrorMessage } from '../../utils/errorMessage';

interface QueueItemCardProps {
  item: QueueItem;
  service: Service | undefined;
  position: number;
  isAdmin: boolean;
  isCurrentUser: boolean;
  shopName?: string;
  barbershopId?: string;
  onStatusChange: (id: string, status: QueueItem['status']) => void;
  onLeaveQueue: (id: string) => void;
  onReturnToQueue?: (item: QueueItem) => void;
  onNotify?: (message: string, type: 'success' | 'error' | 'bot') => void;
}

export const QueueItemCard: React.FC<QueueItemCardProps> = ({
  item,
  service,
  position,
  isAdmin,
  isCurrentUser,
  shopName = 'salão',
  barbershopId,
  onStatusChange,
  onLeaveQueue,
  onReturnToQueue,
  onNotify,
}) => {
  const [sending, setSending] = useState<'reminder' | 'next' | null>(null);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_chair':
        return 'border-l-4 border-l-success bg-success/5';
      case 'waiting':
        return isCurrentUser
          ? 'border-l-4 border-l-accent bg-accent/10 border border-accent/30'
          : 'border-l-4 border-l-border-strong bg-surface';
      case 'completed':
        return 'border-l-4 border-l-border-strong bg-surface opacity-60';
      default:
        return 'bg-surface';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_chair':
        return 'Na Cadeira';
      case 'waiting':
        return 'Aguardando';
      case 'completed':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const sendWhatsApp = async (kind: 'reminder' | 'next') => {
    const phone = item.whatsapp.replace(/\D/g, '');
    const msg =
      kind === 'reminder'
        ? `Olá ${item.customerName}! Sua vez no ${shopName} está chegando (aprox. 15 min). Já pode vir!`
        : `Olá ${item.customerName}! Você é o próximo na fila do ${shopName}. Por favor, fique atento!`;
    const shopId = barbershopId || item.barbershopId;
    if (!shopId) {
      onNotify?.('Conecte o WhatsApp do salão em Configurações para enviar mensagens.', 'error');
      return;
    }
    setSending(kind);
    try {
      await notificationsApi.sendWhatsApp({
        phone,
        message: msg,
        barbershopId: shopId,
      });
      onNotify?.(kind === 'reminder' ? 'Aviso de 15 min enviado.' : 'Cliente avisado que é o próximo.', 'success');
    } catch (err) {
      onNotify?.(
        getErrorMessage(err, 'Conecte o WhatsApp do salão em Configurações para enviar mensagens.'),
        'error'
      );
    } finally {
      setSending(null);
    }
  };

  const hasValidPhone =
    item.whatsapp && item.whatsapp !== '00000000000' && item.whatsapp.replace(/\D/g, '').length > 5;

  return (
    <div
      className={`rounded-lg p-4 mb-3 border border-border shadow-sm transition-all ${getStatusColor(item.status)}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="flex flex-col items-center justify-center min-w-[2.5rem]">
            {item.status === 'in_chair' ? (
              <span className="animate-pulse text-success">
                <div className="relative">
                  <div className="absolute inset-0 bg-success blur opacity-50 rounded-full animate-ping"></div>
                  <DynamicIcon name="Scissors" size={24} className="relative z-10" />
                </div>
              </span>
            ) : (
              <span
                className={`text-xl font-bold ${isCurrentUser ? 'text-accent' : 'text-text-muted'}`}
              >
                #{position}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-lg text-text-primary">
              {item.customerName}{' '}
              {isCurrentUser && <span className="text-xs text-accent ml-2">(Você)</span>}
            </h4>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              {service && <DynamicIcon name={service.icon} size={14} />}
              <span>{service?.name}</span>
            </div>
            {item.responsibleName && (
              <div className="text-xs text-text-muted mt-1">
                Dependente de {item.responsibleName}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
              <Clock size={10} />
              <span>
                Chegou às{' '}
                {new Date(item.joinedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-2">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide
            ${item.status === 'in_chair' ? 'text-success bg-success/10' : 'text-text-secondary bg-surface-2'}
          `}
          >
            {getStatusLabel(item.status)}
          </span>

          {isCurrentUser && item.status === 'waiting' && !isAdmin && (
            <button
              onClick={() => {
                if (confirm('Deseja realmente sair da fila?')) onLeaveQueue(item.id);
              }}
              className="mt-1 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30 hover:bg-danger/20 text-danger text-xs font-bold transition-all flex items-center gap-2 group"
            >
              <LogOut size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Sair da fila
            </button>
          )}
        </div>
      </div>

      {isAdmin && item.status !== 'completed' && (
        <div className="mt-4 pt-3 border-t border-border flex flex-wrap justify-end gap-2">
          {item.status === 'waiting' && (
            <>
              {hasValidPhone && (
                <>
                  <button
                    type="button"
                    disabled={sending !== null}
                    onClick={() => void sendWhatsApp('reminder')}
                    className="px-3 py-1.5 text-xs text-success bg-success/10 border border-success/30 hover:bg-success/20 rounded flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {sending === 'reminder' ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <MessageCircle size={14} />
                    )}
                    Avisar (15m)
                  </button>
                  <button
                    type="button"
                    disabled={sending !== null}
                    onClick={() => void sendWhatsApp('next')}
                    className="px-3 py-1.5 text-xs text-accent bg-accent/10 border border-accent/30 hover:bg-accent/20 rounded flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {sending === 'next' ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <MessageCircle size={14} />
                    )}
                    É o Próximo
                  </button>
                </>
              )}
              <button
                onClick={() => onStatusChange(item.id, 'cancelled')}
                className="px-3 py-1.5 text-xs text-danger hover:bg-danger/10 rounded flex items-center gap-1 transition-colors"
              >
                <Trash2 size={14} /> Cancelar
              </button>
              <button
                onClick={() => onStatusChange(item.id, 'in_chair')}
                className="px-4 py-1.5 text-xs font-bold text-accent-fg bg-accent hover:bg-accent-hover rounded shadow-lg shadow-accent/20 flex items-center gap-1 transition-colors"
              >
                <Bell size={14} /> Chamar
              </button>
            </>
          )}
          {item.status === 'in_chair' && (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              {onReturnToQueue && (
                <button
                  type="button"
                  onClick={() => onReturnToQueue(item)}
                  className="px-4 py-1.5 text-xs font-bold text-text-primary bg-surface-2 border border-border hover:bg-surface hover:border-border-strong rounded flex items-center justify-center gap-1 transition-colors cursor-pointer sm:flex-1"
                >
                  <Undo2 size={14} /> Voltar para a fila
                </button>
              )}
              <button
                type="button"
                onClick={() => onStatusChange(item.id, 'completed')}
                className="px-4 py-1.5 text-xs font-bold text-text-primary bg-success hover:bg-success/80 rounded shadow-md flex items-center justify-center gap-1 transition-colors cursor-pointer sm:flex-1"
              >
                <CheckCircle size={14} /> Finalizar Serviço
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
