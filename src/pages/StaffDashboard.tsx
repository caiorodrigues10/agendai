import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { QueueItemCard } from '../components/domain/QueueItemCard';
import { AddCustomerForm } from '../components/domain/AddCustomerForm';
import { ReturnToQueueModal } from '../components/domain/ReturnToQueueModal';
import { ServiceManager } from '../components/domain/ServiceManager';
import { SettingsManager } from '../components/domain/SettingsManager';
import { TeamManager } from '../components/domain/TeamManager';
import { FinancialDashboard } from '../components/domain/FinancialDashboard';
import { OwnerFinancialPanel } from '../components/domain/OwnerFinancialPanel';
import { OwnerSubscriptionPanel } from '../components/domain/OwnerSubscriptionPanel';
import { OwnerReferralsPanel } from '../components/domain/OwnerReferralsPanel';
import { PostsManager } from '../components/domain/PostsManager';
import { ShopProfile } from '../components/domain/ShopProfile';
import { AppointmentCalendar } from '../components/domain/AppointmentCalendar';
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useBarbershop } from '../contexts/BarbershopContext';
import { useScheduling } from '../contexts/SchedulingContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useBarbershopFilters } from '../contexts/BarbershopFiltersContext';
import {
  Settings,
  Scissors,
  Users,
  BarChart3,
  Store,
  List,
  CalendarDays,
  Coffee,
  Loader2,
  CreditCard,
  Gift,
  Megaphone,
  Contact,
  Link2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { ClientsManager } from '../components/domain/ClientsManager';
import { PublicLinkPanel } from '../components/domain/PublicLinkPanel';
import { getErrorMessage } from '../utils/errorMessage';
import { QueueItem } from '../types';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasDashboard, accessState, loading: subscriptionLoading } = useSubscription();
  const {
    services,
    settings,
    staff,
    feed,
    addPost,
    deletePost,
    likePost,
    setSettings,
    addService,
    editService,
    deleteService,
    updateTeam,
    isShopOpen,
    loading: shopLoading,
  } = useBarbershop();
  const { barbershopId } = useBarbershopFilters();
  const {
    queue,
    appointments,
    availability,
    aiInsight,
    completedCount,
    joinQueue,
    leaveQueue,
    updateQueueStatus,
    bookAppointment,
    cancelAppointment,
    checkInAppointment,
    deleteHistoryItem,
    clientId,
    loading: schedulingLoading,
    refreshAppointments,
    loadAvailability,
  } = useScheduling();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [returnToQueueItem, setReturnToQueueItem] = useState<QueueItem | null>(null);
  const [returningToQueue, setReturningToQueue] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'bot' } | null>(null);

  const activeTab =
    (location.pathname.split('/')[2] as
      | 'queue'
      | 'profile'
      | 'appointments'
      | 'clients'
      | 'services'
      | 'settings'
      | 'team'
      | 'reports'
      | 'finance'
      | 'subscription'
      | 'referrals'
      | 'posts'
      | 'link') || 'queue';

  const tabsRef = useRef<HTMLDivElement>(null);
  const subTabsRef = useRef<HTMLDivElement>(null);
  const tabBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [mainBarFades, setMainBarFades] = useState({ left: false, right: false });
  const [subBarFades, setSubBarFades] = useState({ left: false, right: false });

  const updateFades = (el: HTMLDivElement, set: typeof setMainBarFades) => {
    set({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  };

  const edgeMaskStyle = (fades: { left: boolean; right: boolean }): React.CSSProperties | undefined => {
    if (!fades.left && !fades.right) return undefined;
    const parts: string[] = [];
    if (fades.left) parts.push('transparent 0', '#000 36px');
    else parts.push('#000 0');
    if (fades.right) parts.push('#000 calc(100% - 44px)', 'transparent 100%');
    else parts.push('#000 100%');
    const image = `linear-gradient(to right, ${parts.join(', ')})`;
    return { WebkitMaskImage: image, maskImage: image };
  };

  const measureIndicator = useCallback(() => {
    const container = tabsRef.current;
    const activeBtn = tabBtnRefs.current.get(activeTab);
    if (!container || !activeBtn) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const newLeft = btnRect.left - containerRect.left + container.scrollLeft;
    setIndicator({
      left: newLeft,
      width: btnRect.width,
    });
    const btnCenter = newLeft + btnRect.width / 2;
    const viewportCenter = container.clientWidth / 2;
    container.scrollTo({ left: btnCenter - viewportCenter, behavior: 'smooth' });
  }, [activeTab]);

  const remeasure = useCallback(() => {
    measureIndicator();
    if (tabsRef.current) updateFades(tabsRef.current, setMainBarFades);
    if (subTabsRef.current) updateFades(subTabsRef.current, setSubBarFades);
  }, [measureIndicator]);

  useEffect(() => {
    const timer = setTimeout(remeasure, 100);
    window.addEventListener('resize', remeasure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', remeasure);
    };
  }, [remeasure]);

  useEffect(() => {
    if (subscriptionLoading) return;
    if (accessState === 'blocked') {
      navigate('/bloqueado', { replace: true });
    }
  }, [accessState, subscriptionLoading, navigate]);

  const tabs = useMemo(() => {
    const t = [
      { id: 'queue', label: 'Fila', icon: List },
      { id: 'appointments', label: 'Agenda', icon: CalendarDays },
      { id: 'clients', label: 'Clientes', icon: Contact },
    ];
    if (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') {
      t.push({ id: 'services', label: 'Serviços', icon: Scissors });
      t.push({ id: 'team', label: 'Equipe', icon: Users });
    }
    t.push({ id: 'settings', label: 'Configurações', icon: Settings });
    if ((user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && hasDashboard) {
      t.push({ id: 'reports', label: 'Relatórios', icon: BarChart3 });
      t.push({ id: 'finance', label: 'Financeiro', icon: CreditCard });
    }
    t.push({ id: 'profile', label: 'Perfil', icon: Store });
    return t;
  }, [user, hasDashboard]);

  useEffect(() => {
    if (!user) return;
    const restrictedTabs = ['services', 'team'];
    if (
      restrictedTabs.includes(activeTab) &&
      !(user.role === 'MASTER_ADMIN' || user.role === 'OWNER')
    ) {
      navigate('/app/queue');
    }
    // Redirecionar se tentar acessar reports sem permissão (caso acesse via URL direta)
    if (activeTab === 'reports' && (user.role === 'EMPLOYEE' || !hasDashboard)) {
      navigate('/app/queue');
    }
    if (
      activeTab === 'finance' &&
      (!(user.role === 'MASTER_ADMIN' || user.role === 'OWNER') || !hasDashboard)
    ) {
      navigate('/app/queue');
    }
    if (activeTab === 'subscription' && !(user.role === 'MASTER_ADMIN' || user.role === 'OWNER')) {
      navigate('/app/queue');
    }
    if (activeTab === 'referrals' && !(user.role === 'MASTER_ADMIN' || user.role === 'OWNER')) {
      navigate('/app/queue');
    }
    if (activeTab === 'posts' && !(user.role === 'MASTER_ADMIN' || user.role === 'OWNER')) {
      navigate('/app/queue');
    }
    if (activeTab === 'link' && !(user.role === 'MASTER_ADMIN' || user.role === 'OWNER')) {
      navigate('/app/queue');
    }
  }, [activeTab, user, navigate, hasDashboard]);

  const showToast = (msg: string, type: 'success' | 'bot' = 'success') => {
    setToast({ message: msg, type });
  };

  const handleJoinQueue = async (name: string, whatsapp: string, serviceId: string) => {
    await joinQueue(name, whatsapp, serviceId);
    setShowJoinForm(false);
    showToast('Cliente adicionado!');
  };

  const handleConfirmReturnToQueue = async (insertAt: number) => {
    if (!returnToQueueItem) return;
    setReturningToQueue(true);
    try {
      await updateQueueStatus(returnToQueueItem.id, 'waiting', { insertAt });
      showToast(`${returnToQueueItem.customerName} voltou para a fila.`, 'bot');
      setReturnToQueueItem(null);
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível devolver à fila.'), 'bot');
    } finally {
      setReturningToQueue(false);
    }
  };

  const handleDateChange = useCallback(
    (date: string) => {
      refreshAppointments(date);
      loadAvailability(date);
    },
    [refreshAppointments, loadAvailability]
  );

  if (shopLoading || schedulingLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-accent">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  const activeQueue = queue.filter(q => q.status !== 'completed' && q.status !== 'cancelled');
  const peopleWaiting = activeQueue.filter(q => q.status === 'waiting').length;
  const currentInChair = activeQueue.find(q => q.status === 'in_chair');
  const isUserInQueue = activeQueue.some(q => q.customerId === clientId);
  const isOpen = isShopOpen();

  return (
    <div className="min-h-screen pb-20 bg-bg text-text-primary">
      <Header
        currentUser={user}
        onOpenLogin={() => navigate('/login')}
        onLogout={() => {
          logout();
          navigate('/');
        }}
        logoUrl={settings?.logoUrl}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 pt-6">
        <div className="relative">
          <div
            ref={tabsRef}
            onScroll={e => updateFades(e.currentTarget, setMainBarFades)}
            style={edgeMaskStyle(mainBarFades)}
            className="flex w-fit max-w-full mx-auto bg-surface p-1 rounded-xl mb-6 border border-border relative overflow-x-auto no-scrollbar"
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                ref={btn => { if (btn) tabBtnRefs.current.set(tab.id, btn); }}
                onClick={() => navigate(`/app/${tab.id}`)}
                className={`flex-shrink-0 px-3 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 z-10 relative leading-tight
                          ${activeTab === tab.id ? 'text-text-primary' : 'text-text-muted'}
                      `}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}

            <div
              className="absolute top-1 bottom-1 bg-surface-2 rounded-lg transition-all duration-300"
              style={{ left: indicator.left, width: indicator.width }}
            ></div>
          </div>
          {mainBarFades.right && (
            <button
              type="button"
              aria-label="Rolar abas para a direita"
              onClick={() => tabsRef.current?.scrollBy({ left: 140, behavior: 'smooth' })}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-surface-2 border border-border text-text-secondary shadow-md hover:text-text-primary transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          )}
          {mainBarFades.left && (
            <button
              type="button"
              aria-label="Rolar abas para a esquerda"
              onClick={() => tabsRef.current?.scrollBy({ left: -140, behavior: 'smooth' })}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-surface-2 border border-border text-text-secondary shadow-md hover:text-text-primary transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {user && (user.role === 'MASTER_ADMIN' || user.role === 'OWNER') && (
          <div className="relative mb-6">
            <div
              ref={subTabsRef}
              onScroll={e => updateFades(e.currentTarget, setSubBarFades)}
              style={edgeMaskStyle(subBarFades)}
              className="flex w-fit max-w-full mx-auto gap-2 bg-surface p-1 rounded-lg border border-border overflow-x-auto no-scrollbar"
            >
            {(user.role === 'MASTER_ADMIN' || user.role === 'OWNER') && (
              <>
                <button
                  onClick={() => navigate('/app/subscription')}
                  className={`flex-shrink-0 px-3 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'subscription' ? 'bg-surface-2 text-text-primary shadow' : 'text-text-secondary'}`}
                  title="Planos e assinatura"
                >
                  <CreditCard size={16} /> Assinatura
                </button>
                <button
                  onClick={() => navigate('/app/referrals')}
                  className={`flex-shrink-0 px-3 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'referrals' ? 'bg-surface-2 text-text-primary shadow' : 'text-text-secondary'}`}
                  title="Indique e ganhe"
                >
                  <Gift size={16} /> Indicar
                </button>
                <button
                  onClick={() => navigate('/app/posts')}
                  className={`flex-shrink-0 px-3 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'posts' ? 'bg-surface-2 text-text-primary shadow' : 'text-text-secondary'}`}
                  title="Posts do salão"
                >
                  <Megaphone size={16} /> Posts
                </button>
                <button
                  onClick={() => navigate('/app/link')}
                  className={`flex-shrink-0 px-3 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'link' ? 'bg-surface-2 text-text-primary shadow' : 'text-text-secondary'}`}
                  title="Link público do salão"
                >
                  <Link2 size={16} /> Link
                </button>
              </>
            )}
            </div>
            {subBarFades.right && (
              <button
                type="button"
                aria-label="Rolar ações para a direita"
                onClick={() => subTabsRef.current?.scrollBy({ left: 140, behavior: 'smooth' })}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-surface-2 border border-border text-text-secondary shadow-md hover:text-text-primary transition-colors cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            )}
            {subBarFades.left && (
              <button
                type="button"
                aria-label="Rolar ações para a esquerda"
                onClick={() => subTabsRef.current?.scrollBy({ left: -140, behavior: 'smooth' })}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full bg-surface-2 border border-border text-text-secondary shadow-md hover:text-text-primary transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
            )}
          </div>
        )}

        {activeTab === 'profile' && settings && (
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

        {activeTab === 'appointments' && settings && (
          <AppointmentCalendar
            appointments={appointments}
            services={services}
            staff={staff}
            settings={settings}
            currentUserId={user?.id}
            currentUserRole={user?.role}
            occupancy={availability}
            onBook={async d => {
              await bookAppointment(d);
              showToast('Agendado com sucesso!');
            }}
            onCancel={id => {
              cancelAppointment(id);
              showToast('Cancelado');
            }}
            onCheckIn={appt => {
              checkInAppointment(appt);
              showToast('Check-in realizado!');
            }}
            onDateChange={handleDateChange}
          />
        )}

        {activeTab === 'appointments' && !settings && (
          <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
            <p className="text-text-muted">Carregando configurações do salão...</p>
          </div>
        )}

        {(user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') &&
          activeTab === 'settings' &&
          settings && (
            <SettingsManager
              settings={settings}
              barbershopId={barbershopId || undefined}
              onSave={s => {
                setSettings(s);
                showToast('Salvo!');
              }}
            />
          )}

        {user &&
          activeTab === 'settings' &&
          !((user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && settings) && (
            <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
              <p className="text-text-muted">Carregando configurações...</p>
            </div>
          )}

        {(user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && activeTab === 'services' && (
          <ServiceManager
            services={services}
            onAdd={addService}
            onEdit={editService}
            onDelete={deleteService}
          />
        )}

        {user && activeTab === 'clients' && settings && (
          <ClientsManager
            services={services}
            staff={staff}
            settings={settings}
            canCancelSale={user.role === 'MASTER_ADMIN' || user.role === 'OWNER'}
          />
        )}

        {(user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') &&
          activeTab === 'team' &&
          user && (
            <TeamManager
              staff={staff}
              onUpdateTeam={async t => {
                await updateTeam(t);
                showToast('Equipe atualizada');
              }}
              currentAdminId={user.id}
            />
          )}

        {user && activeTab === 'reports' && (
          <FinancialDashboard
            queueHistory={queue}
            services={services}
            currentUser={user}
            allStaff={staff}
            onDeleteHistoryItem={deleteHistoryItem}
          />
        )}

        {(user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && activeTab === 'finance' && (
          <OwnerFinancialPanel />
        )}

        {(user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') &&
          activeTab === 'subscription' && <OwnerSubscriptionPanel />}

        {(user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && activeTab === 'referrals' && (
          <OwnerReferralsPanel />
        )}

        {(user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && activeTab === 'posts' && (
          <PostsManager />
        )}

        {(user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') &&
          activeTab === 'link' &&
          barbershopId && <PublicLinkPanel barbershopId={barbershopId} />}

        {activeTab === 'queue' && (
          <>
            <div className="mb-6 bg-surface rounded-xl p-5 border border-border shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-accent font-bold text-sm tracking-wider uppercase flex items-center gap-2 drop-shadow-md">
                    {settings?.shopName}
                  </h2>
                  {aiInsight && (
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border tracking-wide shadow-sm
                       ${
                         !isOpen
                           ? 'bg-surface-2 text-text-secondary border-border-strong'
                           : aiInsight.busyLevel === 'high'
                             ? 'bg-danger/10 text-danger border-danger/20'
                             : aiInsight.busyLevel === 'medium'
                               ? 'bg-warning/10 text-warning border-warning/20'
                               : 'bg-success/10 text-success border-success/20'
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

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Coffee size={12} className="text-accent" />
                    <span>{isOpen ? 'Aberto hoje' : 'Fechado hoje'}</span>
                  </div>
                  <div className="h-1 w-1 bg-border-strong rounded-full"></div>
                  <div className="text-xs text-text-muted">{aiInsight?.estimatedWait || '--'}</div>
                </div>

                {aiInsight && (
                  <p className="mt-4 text-sm text-text-secondary">{aiInsight.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-3 items-center flex-wrap">
                <div className="bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-secondary">
                  <span className="text-text-primary font-bold">{peopleWaiting}</span> na espera
                </div>
                <div className="bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-secondary">
                  <span className="text-text-primary font-bold">{completedCount}</span> concluídos
                </div>
                {currentInChair && (
                  <div className="bg-success/10 border border-success/30 rounded-xl px-3 py-2 text-xs text-success">
                    {currentInChair.customerName} na cadeira
                  </div>
                )}
              </div>

              {!isUserInQueue && (
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="px-3 py-2 rounded-xl bg-accent text-accent-fg text-xs font-bold shadow-lg shadow-accent/20"
                >
                  Adicionar cliente
                </button>
              )}
            </div>

            <div className="space-y-4">
              {activeQueue.length === 0 ? (
                <div className="text-center py-10 bg-surface rounded-xl border border-border border-dashed">
                  <p className="text-text-muted">Nenhum cliente na fila.</p>
                </div>
              ) : (
                activeQueue.map((item, index) => (
                  <QueueItemCard
                    key={item.id}
                    item={item}
                    service={services.find(s => s.id === item.serviceId)}
                    position={index + 1}
                    isAdmin={true}
                    shopName={settings?.shopName}
                    isCurrentUser={item.customerId === clientId}
                    onStatusChange={updateQueueStatus}
                    onReturnToQueue={setReturnToQueueItem}
                    onLeaveQueue={id => {
                      leaveQueue(id);
                      showToast('Cliente removido.', 'bot');
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
          isStaffMode={true}
        />
      )}
      {returnToQueueItem && (
        <ReturnToQueueModal
          item={returnToQueueItem}
          waiting={queue.filter(
            q => q.status === 'waiting' && q.id !== returnToQueueItem.id
          )}
          services={services}
          submitting={returningToQueue}
          onConfirm={handleConfirmReturnToQueue}
          onClose={() => {
            if (!returningToQueue) setReturnToQueueItem(null);
          }}
        />
      )}
    </div>
  );
};

export default StaffDashboard;
