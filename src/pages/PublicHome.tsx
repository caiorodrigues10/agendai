import React, { useCallback, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { QueueItemCard } from '../components/domain/QueueItemCard';
import { AddCustomerForm } from '../components/domain/AddCustomerForm';
import { ShopProfile } from '../components/domain/ShopProfile';
import { AppointmentScheduler } from '../components/domain/AppointmentScheduler';
import { QueueStatusCard } from '../components/domain/QueueStatusCard';
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useBarbershop } from '../contexts/BarbershopContext';
import { useBarbershopFilters } from '../contexts/BarbershopFiltersContext';
import { useScheduling } from '../contexts/SchedulingContext';
import { schedulingApi } from '../infra/schedulingApi';
import { DynamicIcon } from '../components/ui/DynamicIcon';
import { List, CalendarDays, Store, Coffee, Loader2 } from 'lucide-react';
import type { OperationMode } from '../types';
import { toLocalISO } from '../components/ui/ThemedCalendar';

type PublicTab = 'queue' | 'appointments' | 'profile';

function visiblePublicTabs(mode?: OperationMode): PublicTab[] {
  const tabs: PublicTab[] = [];
  if (!mode || mode === 'QUEUE_ONLY' || mode === 'HYBRID') tabs.push('queue');
  if (!mode || mode === 'APPOINTMENTS_ONLY' || mode === 'HYBRID') tabs.push('appointments');
  tabs.push('profile');
  return tabs;
}

export const PublicHome: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { barbershopId, setBarbershopId } = useBarbershopFilters();
  const {
    services,
    settings,
    staff,
    feed,
    addPost,
    deletePost,
    likePost,
    isShopOpen,
    isQueueClosed,
    loading: shopLoading,
  } = useBarbershop();
  const {
    queue,
    availability,
    aiInsight,
    joinQueue,
    leaveQueue,
    bookAppointmentPublic,
    loadAvailability,
    clientId,
    loading: schedulingLoading,
  } = useScheduling();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinMode, setJoinMode] = useState<'self' | 'dependent'>('self');
  const operationMode = settings?.operationMode ?? 'HYBRID';
  const tabs = visiblePublicTabs(operationMode);
  const [activeTab, setActiveTab] = useState<PublicTab>(tabs[0]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'bot' } | null>(null);
  const [publicSlots, setPublicSlots] = useState<string[] | undefined>();

  const handleDateChange = useCallback(
    (date: string, staffId?: string, serviceId?: string) => {
      loadAvailability(date, staffId);
      if (!serviceId || !barbershopId) {
        setPublicSlots(undefined);
        return;
      }
      schedulingApi.getAppointmentSlots(barbershopId, serviceId, date, staffId)
        .then(slots => setPublicSlots(slots.map(slot => slot.time)))
        .catch(() => setPublicSlots([]));
    },
    [barbershopId, loadAvailability]
  );

  React.useEffect(() => {
    if (id && id !== barbershopId) {
      setBarbershopId(id);
    }
  }, [id, barbershopId, setBarbershopId]);

  // Deep links used by the salon's public QR codes and post CTAs.
  React.useEffect(() => {
    const tab = searchParams.get('tab') as PublicTab | null;
    if (tab && tabs.includes(tab)) setActiveTab(tab);
  }, [searchParams, tabs]);

  const showToast = (msg: string, type: 'success' | 'bot' = 'success') => {
    setToast({ message: msg, type });
  };

  const handleJoinQueue = async (name: string, whatsapp: string, serviceId: string) => {
    const asDependent = joinMode === 'dependent';
    await joinQueue(name, whatsapp, serviceId, { additionalPerson: asDependent });
    setShowJoinForm(false);
    showToast(asDependent ? 'Dependente adicionado à fila!' : 'Você entrou na fila!', 'bot');
  };

  const openJoinForm = (mode: 'self' | 'dependent') => {
    setJoinMode(mode);
    setShowJoinForm(true);
  };

  // Wait until URL tenant is applied before deciding to redirect
  const pendingUrlShop = Boolean(id) && id !== barbershopId;
  const stillLoading = pendingUrlShop || shopLoading || schedulingLoading;

  if (stillLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-accent">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  // /queue without id → landing. /queue/:id with failed load → explicit empty state.
  if (!barbershopId || !settings) {
    if (id) {
      return (
        <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center justify-center gap-4 px-6 text-center">
          <Store className="text-text-muted" size={40} />
          <div>
            <h1 className="text-lg font-bold">Salão não encontrado</h1>
            <p className="text-sm text-text-secondary mt-1">
              Não foi possível carregar os dados deste estabelecimento.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl bg-accent text-accent-fg text-sm font-bold"
          >
            Voltar ao início
          </button>
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  const activeQueue = queue.filter(q => q.status !== 'completed' && q.status !== 'cancelled');
  const peopleWaiting = activeQueue.filter(q => q.status === 'waiting').length;
  const currentInChair = activeQueue.find(q => q.status === 'in_chair');
  const isUserInQueue = activeQueue.some(q => q.customerId === clientId);
  const isOpen = isShopOpen();
  const queueClosed = isQueueClosed();
  const canJoinQueue = isOpen && !queueClosed;
  const todayIso = toLocalISO(new Date());
  const todayException = settings.scheduleExceptions?.find(
    item => !item.isOpen && item.date.slice(0, 10) === todayIso
  );
  const closedBanner = !isOpen
    ? settings.openState?.reason === 'MANUAL_MODE_NOT_OPENED'
      ? 'O salão ainda não abriu hoje.'
      : settings.openState?.reason === 'EXCEPTION'
        ? `Fechado em ${new Date(`${todayIso}T12:00:00`).toLocaleDateString('pt-BR')}${todayException?.reason ? ` (${todayException.reason})` : ''}`
        : 'Fechado no momento'
    : queueClosed
      ? 'Fila encerrada por hoje'
      : null;

  return (
    <div className="min-h-screen pb-[max(5rem,env(safe-area-inset-bottom))] bg-bg text-text-primary">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 pt-6">
        <div className="flex bg-surface p-1 rounded-xl mb-6 border border-border relative">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 z-10 relative
                        ${activeTab === tab ? 'text-text-primary' : 'text-text-muted'}
                    `}
            >
              {tab === 'queue' && (
                <>
                  <List size={16} /> Fila
                </>
              )}
              {tab === 'appointments' && (
                <>
                  <CalendarDays size={16} /> Agenda
                </>
              )}
              {tab === 'profile' && (
                <>
                  <Store size={16} /> Perfil
                </>
              )}
            </button>
          ))}

          <div
            className={`absolute top-1 bottom-1 bg-surface-2 rounded-lg transition-all duration-300
                ${tabs.length === 3
                  ? `w-[calc(33.3%-2px)] ${activeTab === 'queue' ? 'left-1' : activeTab === 'appointments' ? 'left-[calc(33.3%+2px)]' : 'left-[calc(66.6%+2px)]'}`
                  : tabs.length === 2
                    ? `w-[calc(50%-2px)] ${activeTab === tabs[0] ? 'left-1' : 'left-[calc(50%+2px)]'}`
                    : 'w-[calc(100%-8px)] left-1'
                }`}
          ></div>
        </div>

        {activeTab === 'profile' && (
          <ShopProfile
            settings={settings}
            posts={feed}
            currentUser={user}
            audience="public"
            onGoQueue={() => setActiveTab('queue')}
            onGoAppointments={() => setActiveTab('appointments')}
            onAddPost={p => {
              addPost(p);
              showToast('Postado!');
            }}
            onDeletePost={deletePost}
            onLikePost={likePost}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentScheduler
            services={services}
            staff={staff}
            settings={settings}
            occupancy={availability}
            availableSlots={publicSlots}
            onBook={async d => {
              try {
                const created = await bookAppointmentPublic(d);
                showToast('Agendado com sucesso!');
                return created;
              } catch (err) {
                const { getErrorMessage } = await import('../utils/errorMessage');
                showToast(
                  getErrorMessage(err, 'Não foi possível agendar. Tente outro horário.'),
                  'bot'
                );
                throw err;
              }
            }}
            onDateChange={handleDateChange}
          />
        )}

        {activeTab === 'queue' && (
          <>
            <QueueStatusCard
              shopName={settings?.shopName}
              isOpen={isOpen}
              queueClosed={queueClosed}
              insight={aiInsight}
            />

            {closedBanner && (
              <div className="mb-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
                <p className="font-bold text-text-primary">{closedBanner}</p>
                <p className="text-xs mt-1">
                  {!isOpen
                    ? 'A entrada na fila está indisponível até o salão reabrir.'
                    : 'Quem já está na fila continua sendo atendido. Agendamentos seguem liberados.'}
                </p>
              </div>
            )}

            {/* STATS GRID */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface p-4 rounded-xl border border-border text-center shadow-lg group hover:border-accent/30 transition-colors">
                <span className="block text-3xl font-bold text-text-primary mb-1 group-hover:text-accent transition-colors">
                  {peopleWaiting}
                </span>
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                  Na Fila
                </span>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-border text-center shadow-lg group hover:border-success/30 transition-colors">
                <span className="block text-3xl font-bold text-success mb-1">
                  {currentInChair ? '1' : '0'}
                </span>
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                  Em Atendimento
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mb-8 space-y-2">
              {!isUserInQueue &&
                (!canJoinQueue ? (
                  <div className="w-full bg-surface border border-border text-text-muted font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-3 opacity-75 cursor-not-allowed">
                    <Coffee size={24} />
                    <span>{queueClosed && isOpen ? 'Fila encerrada por hoje' : 'Fechado no momento'}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openJoinForm('self')}
                    className="w-full bg-accent hover:bg-accent-hover text-accent-fg font-bold text-lg py-4 rounded-xl shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 border border-accent/20 relative overflow-hidden group cursor-pointer"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
                    <span className="relative flex items-center gap-3">
                      <DynamicIcon name="Scissors" size={24} />
                      Entrar na Fila
                    </span>
                  </button>
                ))}

              {isUserInQueue && (
                <div className="w-full bg-accent/10 border border-accent/30 text-accent text-center py-3 rounded-xl flex items-center justify-center gap-2">
                  <DynamicIcon name="CheckCircle" size={20} className="text-accent" />
                  <span className="font-bold">Você já está na fila!</span>
                </div>
              )}

              {canJoinQueue && isUserInQueue && (
                <button
                  type="button"
                  onClick={() => openJoinForm('dependent')}
                  className="w-full bg-surface border border-border hover:border-accent/50 hover:bg-surface-2 text-text-primary text-sm font-bold py-3.5 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <DynamicIcon name="UserPlus" size={16} className="text-accent" />
                    Adicionar dependente
                  </span>
                  <span className="text-[11px] font-medium text-text-muted">
                    Filho, parceiro ou quem veio junto — sem entrar de novo
                  </span>
                </button>
              )}
            </div>

            {/* QUEUE LIST HEADER */}
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                Acompanhar Fila
              </h3>
              <span className="text-xs font-bold text-text-secondary bg-surface-2 px-2.5 py-0.5 rounded-full border border-border-strong">
                {peopleWaiting}
              </span>
            </div>

            <div className="space-y-4">
              {activeQueue.length === 0 ? (
                <div className="text-center py-16 bg-surface/50 rounded-2xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center">
                  <div className="mb-4 text-text-muted">
                    <Coffee size={48} strokeWidth={1.5} />
                  </div>
                  <p className="text-text-muted font-medium">Nenhum cliente na fila.</p>
                  {!isUserInQueue && canJoinQueue && (
                    <button
                      type="button"
                      onClick={() => openJoinForm('self')}
                      className="text-accent text-sm font-bold mt-2 hover:underline cursor-pointer"
                    >
                      Seja o primeiro!
                    </button>
                  )}
                </div>
              ) : (
                activeQueue.map((item, index) => (
                  <QueueItemCard
                    key={item.id}
                    item={item}
                    service={services.find(s => s.id === item.serviceId)}
                    position={index + 1}
                    isAdmin={false}
                    shopName={settings?.shopName}
                    isCurrentUser={item.customerId === clientId}
                    onStatusChange={() => {}}
                    onLeaveQueue={id => {
                      leaveQueue(id);
                      showToast('Você saiu da fila.', 'bot');
                    }}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>

      {showJoinForm && (
        <AddCustomerForm
          services={services}
          onJoin={handleJoinQueue}
          onCancel={() => setShowJoinForm(false)}
          isAdditionalPerson={joinMode === 'dependent'}
        />
      )}
    </div>
  );
};

export default PublicHome;
