import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { QueueItemCard } from '../components/domain/QueueItemCard';
import { QueueStatusCard } from '../components/domain/QueueStatusCard';
import { AddCustomerForm } from '../components/domain/AddCustomerForm';
import { ReturnToQueueModal } from '../components/domain/ReturnToQueueModal';
import { ServiceManager } from '../components/domain/ServiceManager';
import { SettingsManager } from '../components/domain/SettingsManager';
import { AccountPrivacyPanel } from '../components/domain/AccountPrivacyPanel';
import { ProfileAvatarSection } from '../components/domain/ProfileAvatarSection';
import { ProfileSettingsPanel } from '../components/domain/ProfileSettingsPanel';
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
import { ALL_TAB_IDS, getDefaultTab, canAccessTab } from '../config/tabRegistry';
import { ClientsManager } from '../components/domain/ClientsManager';
import { PublicLinkPanel } from '../components/domain/PublicLinkPanel';
import { PwaInstallCard } from '../components/pwa/PwaInstallCard';
import { getErrorMessage } from '../utils/errorMessage';
import { QueueItem } from '../types';
import { Loader2 } from 'lucide-react';
import { DemandAlertBanner } from '../components/domain/DemandAlertBanner';
import { StaffNavigation } from '../components/ui/StaffNavigation';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUserAvatar } = useAuth();
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'bot' | 'error' } | null>(
    null
  );

  const rawTab = location.pathname.split('/')[2] || 'queue';
  const activeTab = ALL_TAB_IDS.includes(rawTab) ? rawTab : 'queue';

  // Redirect invalid tabs
  useEffect(() => {
    if (rawTab !== activeTab) {
      navigate(`/app/${getDefaultTab(user?.role)}`, { replace: true });
    }
  }, [rawTab, activeTab, user?.role, navigate]);

  // Redirect if tab not accessible
  useEffect(() => {
    if (!user) return;
    if (!canAccessTab(activeTab, user.role)) {
      navigate(`/app/${getDefaultTab(user.role)}`, { replace: true });
    }
  }, [activeTab, user, navigate]);

  // Re-check access including hasDashboard
  useEffect(() => {
    if (!user) return;
    if ((activeTab === 'reports' || activeTab === 'finance') && !hasDashboard) {
      navigate(`/app/${getDefaultTab(user.role)}`, { replace: true });
    }
  }, [activeTab, user, hasDashboard, navigate]);

  useEffect(() => {
    if (subscriptionLoading) return;
    if (accessState === 'blocked') {
      navigate('/bloqueado', { replace: true });
    }
  }, [accessState, subscriptionLoading, navigate]);

  const showToast = (msg: string, type: 'success' | 'bot' | 'error' = 'success') => {
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
  const isOpen = isShopOpen();
  const installVideoUrl = import.meta.env.VITE_PWA_INSTALL_VIDEO_URL as string | undefined;

  return (
    <div className="min-h-screen bg-bg pb-[max(5.5rem,env(safe-area-inset-bottom))] text-text-primary lg:pb-0">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[90] rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-fg focus:not-sr-only"
      >
        Pular para o conteúdo
      </a>
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

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <StaffNavigation
          key={activeTab}
          activeTab={activeTab}
          userRole={user?.role}
          onNavigate={tabId => navigate(`/app/${tabId}`)}
        />
        <main id="main-content" className="min-w-0 flex-1">
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <DemandAlertBanner />
              <div className="bg-surface rounded-xl border border-border p-4">
                <h2 className="text-lg font-bold mb-3">Visão Geral</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-text-muted text-xs">Na fila</p>
                    <p className="text-xl font-bold">{peopleWaiting}</p>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-text-muted text-xs">Atendidos hoje</p>
                    <p className="text-xl font-bold">{completedCount}</p>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-text-muted text-xs">Status</p>
                    <p
                      className={`text-sm font-bold ${isOpen ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {isOpen ? 'Aberto' : 'Fechado'}
                    </p>
                  </div>
                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-text-muted text-xs">Em atendimento</p>
                    <p className="text-sm font-bold">{currentInChair?.customerName || '—'}</p>
                  </div>
                </div>
              </div>
              <QueueStatusCard
                shopName={settings?.shopName}
                isOpen={isOpen}
                insight={aiInsight}
                peopleWaiting={peopleWaiting}
                completedCount={completedCount}
                inChairName={currentInChair?.customerName ?? null}
                showStaffStats
              />
              <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
                <PwaInstallCard variant="panel" videoUrl={installVideoUrl} />
                <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
                    Onboarding
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-text-primary">
                    Vídeo de como colocar o salão na tela
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    Aqui entra o tutorial interno que mostra como abrir a operação, ativar a fila e
                    instalar o PWA no celular da equipe. Esse material é para quem já entrou na
                    plataforma, então ele não compete com a landing.
                  </p>
                  <div className="mt-4 rounded-xl border border-border bg-bg p-3 text-sm text-text-muted">
                    Dica: mantenha esse vídeo vertical, curto e com passo a passo em tela cheia.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'queue' && (
            <>
              <QueueStatusCard
                shopName={settings?.shopName}
                isOpen={isOpen}
                insight={aiInsight}
                peopleWaiting={peopleWaiting}
                completedCount={completedCount}
                inChairName={currentInChair?.customerName ?? null}
                showStaffStats
              />

              <div className="flex items-center justify-end mb-4">
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-accent text-accent-fg text-sm font-bold shadow-lg shadow-accent/20"
                >
                  Adicionar cliente
                </button>
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
                      barbershopId={barbershopId || item.barbershopId}
                      isCurrentUser={item.customerId === clientId}
                      onStatusChange={updateQueueStatus}
                      onReturnToQueue={setReturnToQueueItem}
                      onNotify={showToast}
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

          {activeTab === 'clients' && settings && (
            <ClientsManager
              services={services}
              staff={staff}
              settings={settings}
              canCancelSale={user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER'}
            />
          )}

          {activeTab === 'services' &&
            (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && (
              <ServiceManager
                services={services}
                onAdd={addService}
                onEdit={editService}
                onDelete={deleteService}
              />
            )}

          {activeTab === 'team' &&
            (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') &&
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

          {activeTab === 'reports' && user && (
            <FinancialDashboard
              queueHistory={queue}
              services={services}
              currentUser={user}
              allStaff={staff}
              onDeleteHistoryItem={deleteHistoryItem}
            />
          )}

          {activeTab === 'finance' && (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && (
            <OwnerFinancialPanel />
          )}

          {activeTab === 'posts' && (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && (
            <PostsManager />
          )}

          {activeTab === 'link' &&
            (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') &&
            barbershopId && <PublicLinkPanel barbershopId={barbershopId} />}

          {activeTab === 'referrals' &&
            (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && <OwnerReferralsPanel />}

          {activeTab === 'subscription' &&
            (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && <OwnerSubscriptionPanel />}

          {activeTab === 'settings' && user && (
            <>
              <ProfileAvatarSection
                userId={user.id}
                userName={user.name}
                avatarUrl={user.avatarUrl}
                onAvatarUpdated={url => updateUserAvatar(url)}
                onNotify={showToast}
              />
              <div className="mt-6"><ProfileSettingsPanel onNotify={showToast} /></div>
              {(user.role === 'MASTER_ADMIN' || user.role === 'OWNER') && settings && (
                <div className="mt-6">
                  <SettingsManager
                    settings={settings}
                    barbershopId={barbershopId || undefined}
                    onSave={s => {
                      setSettings(s);
                      showToast('Salvo!');
                    }}
                    onNotify={showToast}
                  />
                </div>
              )}
              {user.role === 'EMPLOYEE' && (
                <div className="mt-6">
                  <AccountPrivacyPanel onNotify={showToast} />
                </div>
              )}
            </>
          )}

          {activeTab === 'profile' && settings && (
            <ShopProfile
              settings={settings}
              posts={feed}
              currentUser={user}
              audience="staff"
              onAddPost={p => {
                addPost(p);
                showToast('Postado!');
              }}
              onDeletePost={deletePost}
              onLikePost={likePost}
              onNotify={showToast}
            />
          )}
        </main>
      </div>

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
          waiting={queue.filter(q => q.status === 'waiting' && q.id !== returnToQueueItem.id)}
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
