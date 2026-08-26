import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { QueueItemCard } from '../components/domain/QueueItemCard';
import { AddCustomerForm } from '../components/domain/AddCustomerForm';
import { ShopProfile } from '../components/domain/ShopProfile';
import { AppointmentScheduler } from '../components/domain/AppointmentScheduler';
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useBarbershop } from '../contexts/BarbershopContext';
import { useBarbershopFilters } from '../contexts/BarbershopFiltersContext';
import { useScheduling } from '../contexts/SchedulingContext';
import { DynamicIcon } from '../components/ui/DynamicIcon';
import { List, CalendarDays, Store, Coffee, Loader2, Clock } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'queue' | 'profile' | 'appointments'>('queue');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'bot' } | null>(null);

  React.useEffect(() => {
    if (id && id !== barbershopId) {
      setBarbershopId(id);
    }
  }, [id, barbershopId, setBarbershopId]);

  // Suporte a ?tab=appointments vindo do CTA de posts
  React.useEffect(() => {
    if (searchParams.get('tab') === 'appointments') {
      setActiveTab('appointments');
    }
  }, [searchParams]);

  const showToast = (msg: string, type: 'success' | 'bot' = 'success') => {
    setToast({ message: msg, type });
  };

  const handleJoinQueue = async (name: string, whatsapp: string, serviceId: string) => {
    await joinQueue(name, whatsapp, serviceId);
    setShowJoinForm(false);
    showToast('Você entrou na fila!', 'bot');
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

  return (
    <div className="min-h-screen pb-20 bg-bg text-text-primary">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-md mx-auto px-4 pt-6">
        <div className="flex bg-surface p-1 rounded-xl mb-6 border border-border relative">
          {['queue', 'appointments', 'profile'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
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
            className={`absolute top-1 bottom-1 w-[calc(33.3%-2px)] bg-surface-2 rounded-lg transition-all duration-300
                ${activeTab === 'queue' ? 'left-1' : activeTab === 'appointments' ? 'left-[calc(33.3%+2px)]' : 'left-[calc(66.6%+2px)]'}`}
          ></div>
        </div>

        {activeTab === 'profile' && (
          <ShopProfile
            settings={settings}
            posts={feed}
            currentUser={user}
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
            onBook={async d => {
              try {
                await bookAppointmentPublic(d);
                showToast('Agendado com sucesso!');
              } catch (err) {
                const { getErrorMessage } = await import('../utils/errorMessage');
                showToast(
                  getErrorMessage(err, 'Não foi possível agendar. Tente outro horário.'),
                  'bot'
                );
                throw err;
              }
            }}
            onDateChange={(date, staffId) => loadAvailability(date, staffId)}
          />
        )}

        {activeTab === 'queue' && (
          <>
            {/* BIG HEADER CARD */}
            <div className="mb-6 bg-surface rounded-xl p-6 border border-border shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-accent/20 transition-all duration-700"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-accent font-bold text-sm tracking-wider uppercase mb-1 flex items-center gap-2">
                      {settings?.shopName}
                    </h2>
                    <div className="flex items-center gap-2 text-4xl font-bold text-text-primary tracking-tighter">
                      <Clock size={32} className="text-text-muted" />
                      <span>{aiInsight?.estimatedWait || '0 min'}</span>
                    </div>
                    <span className="text-xs text-text-muted uppercase tracking-widest font-semibold ml-1">
                      Tempo Estimado
                    </span>
                  </div>

                  {aiInsight && (
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold uppercase border tracking-wide shadow-lg
                       ${
                         !isOpen
                           ? 'bg-surface-2 text-text-secondary border-border-strong'
                           : aiInsight.busyLevel === 'high'
                             ? 'bg-danger/15 text-danger border-danger/30 shadow-danger/10'
                             : aiInsight.busyLevel === 'medium'
                               ? 'bg-warning/15 text-warning border-warning/30 shadow-warning/10'
                               : 'bg-success/15 text-success border-success/30 shadow-success/10'
                       }
                     `}
                    >
                      {!isOpen
                        ? 'Fechado'
                        : aiInsight.busyLevel === 'high'
                          ? 'Movimento Alto'
                          : aiInsight.busyLevel === 'medium'
                            ? 'Movimento Médio'
                            : 'Movimento Tranquilo'}
                    </span>
                  )}
                </div>

                <div className="bg-bg/50 rounded-lg p-4 border border-border backdrop-blur-sm">
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">
                    {aiInsight?.message || 'O estabelecimento está pronto para te receber.'}
                  </p>
                </div>
              </div>
            </div>

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
            {!isUserInQueue &&
              (!isOpen ? (
                <div className="w-full bg-surface border border-border text-text-muted font-bold text-lg py-4 rounded-xl mb-8 flex items-center justify-center gap-3 opacity-75 cursor-not-allowed">
                  <Coffee size={24} />
                  <span>Fechado hoje</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="w-full bg-accent hover:bg-accent-hover text-accent-fg font-bold text-lg py-4 rounded-xl shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] mb-8 flex items-center justify-center gap-3 border border-accent/20 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
                  <span className="relative flex items-center gap-3">
                    <DynamicIcon name="Scissors" size={24} />
                    Entrar na Fila
                  </span>
                </button>
              ))}

            {isUserInQueue && (
              <div className="mb-8 animate-fade-in">
                <div className="w-full bg-accent/10 border border-accent/30 text-accent text-center py-3 rounded-t-xl flex items-center justify-center gap-2">
                  <DynamicIcon name="CheckCircle" size={20} className="text-accent" />
                  <span className="font-bold">Você já está na fila!</span>
                </div>
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="w-full bg-surface border-x border-b border-border hover:bg-surface-2 text-text-secondary hover:text-text-primary text-sm font-medium py-3 rounded-b-xl transition-all flex items-center justify-center gap-2"
                >
                  <DynamicIcon name="UserPlus" size={16} /> Adicionar outra pessoa
                </button>
              </div>
            )}

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
                  {!isUserInQueue && isOpen && (
                    <button
                      onClick={() => setShowJoinForm(true)}
                      className="text-accent text-sm font-bold mt-2 hover:underline"
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
        />
      )}
    </div>
  );
};

export default PublicHome;
