import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { AddCustomerForm } from '../components/domain/AddCustomerForm';
import { ReturnToQueueModal } from '../components/domain/ReturnToQueueModal';
import { Toast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useBarbershop } from '../contexts/BarbershopContext';
import { useScheduling } from '../contexts/SchedulingContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useBarbershopFilters } from '../contexts/BarbershopFiltersContext';
import { ALL_TAB_IDS, getDefaultTab, canAccessTab, canAccessTabByMode, getPrimaryTabForMode } from '../config/tabRegistry';
import { getErrorMessage } from '../utils/errorMessage';
import { QueueItem } from '../types';
import { LuLoaderCircle as Loader2 } from 'react-icons/lu';
import { StaffNavigation } from '../components/ui/StaffNavigation';
import { supportsQueue, supportsAppointments } from '../utils/operationMode';
import { todayISO } from '../utils/dateRanges';
import { ClosedSalonJoinModal } from '../components/domain/ClosedSalonJoinModal';
import { usePermissions } from '../hooks/usePermissions';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { productsApi } from '../infra/productsApi';
import { ErrorBoundary } from '../components/infra/ErrorBoundary';
import { lazyPanel } from '../components/infra/lazyPanel';

const QueueItemCard = lazyPanel(() => import('../components/domain/QueueItemCard'), 'QueueItemCard');
const QueueStatusCard = lazyPanel(() => import('../components/domain/QueueStatusCard'), 'QueueStatusCard');
const QueueCapacityBanner = lazyPanel(() => import('../components/domain/QueueCapacityBanner'), 'QueueCapacityBanner');
const ShopFloorControls = lazyPanel(() => import('../components/domain/ShopFloorControls'), 'ShopFloorControls');
const ActivationChecklist = lazyPanel(() => import('../components/domain/ActivationChecklist'), 'ActivationChecklist');
const DemandAlertBanner = lazyPanel(() => import('../components/domain/DemandAlertBanner'), 'DemandAlertBanner');
const PwaInstallCard = lazyPanel(() => import('../components/pwa/PwaInstallCard'), 'PwaInstallCard');
const OnboardingChecklist = lazyPanel(() => import('../components/domain/OnboardingChecklist'), 'OnboardingChecklist');
const AppointmentCalendar = lazyPanel(() => import('../components/domain/AppointmentCalendar'), 'AppointmentCalendar');
const ProductsHub = lazyPanel(() => import('../components/domain/ProductsHub'), 'ProductsHub');
const ClientsTab = lazyPanel(() => import('../components/domain/ClientsTab'), 'ClientsTab');
const ServiceManager = lazyPanel(() => import('../components/domain/ServiceManager'), 'ServiceManager');
const CatalogManager = lazyPanel(() => import('../components/domain/CatalogManager'), 'CatalogManager');
const TeamManager = lazyPanel(() => import('../components/domain/TeamManager'), 'TeamManager');
const FinancialDashboard = lazyPanel(() => import('../components/domain/FinancialDashboard'), 'FinancialDashboard');
const RecommendationsPanel = lazyPanel(() => import('../components/domain/RecommendationsPanel'), 'RecommendationsPanel');
const OwnerFinancialPanel = lazyPanel(() => import('../components/domain/OwnerFinancialPanel'), 'OwnerFinancialPanel');
const CashPanel = lazyPanel(() => import('../components/domain/CashPanel'), 'CashPanel');
const DepositPolicyPanel = lazyPanel(() => import('../components/domain/DepositPolicyPanel'), 'DepositPolicyPanel');
const WaitlistPanel = lazyPanel(() => import('../components/domain/WaitlistPanel'), 'WaitlistPanel');
const RecurringPackagesPanel = lazyPanel(() => import('../components/domain/RecurringPackagesPanel'), 'RecurringPackagesPanel');
const LoyaltyPanel = lazyPanel(() => import('../components/domain/LoyaltyPanel'), 'LoyaltyPanel');
const GoalsPanel = lazyPanel(() => import('../components/domain/GoalsPanel'), 'GoalsPanel');
const ProfitEnginePanel = lazyPanel(() => import('../components/domain/ProfitEnginePanel'), 'ProfitEnginePanel');
const EquipmentPanel = lazyPanel(() => import('../components/domain/EquipmentPanel'), 'EquipmentPanel');
const OrganizationsPanel = lazyPanel(() => import('../components/domain/OrganizationsPanel'), 'OrganizationsPanel');
const PostsManager = lazyPanel(() => import('../components/domain/PostsManager'), 'PostsManager');
const ShowcasePanel = lazyPanel(() => import('../components/domain/ShowcasePanel'), 'ShowcasePanel');
const PublicLinkPanel = lazyPanel(() => import('../components/domain/PublicLinkPanel'), 'PublicLinkPanel');
const OwnerReferralsPanel = lazyPanel(() => import('../components/domain/OwnerReferralsPanel'), 'OwnerReferralsPanel');
const OwnerSubscriptionPanel = lazyPanel(() => import('../components/domain/OwnerSubscriptionPanel'), 'OwnerSubscriptionPanel');
const SettingsManager = lazyPanel(() => import('../components/domain/SettingsManager'), 'SettingsManager');
const ProfileAvatarSection = lazyPanel(() => import('../components/domain/ProfileAvatarSection'), 'ProfileAvatarSection');
const ProfileSettingsPanel = lazyPanel(() => import('../components/domain/ProfileSettingsPanel'), 'ProfileSettingsPanel');
const AccountPrivacyPanel = lazyPanel(() => import('../components/domain/AccountPrivacyPanel'), 'AccountPrivacyPanel');
const SupportPanel = lazyPanel(() => import('../components/domain/SupportPanel'), 'SupportPanel');
const ShopProfile = lazyPanel(() => import('../components/domain/ShopProfile'), 'ShopProfile');

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUserAvatar } = useAuth();
  const { hasPermission, isOwnerOrAdmin } = usePermissions();
  const { hasDashboard, accessState, loading: subscriptionLoading } = useSubscription();
  const {
    services,
    settings,
    staff,
    feed,
    deletePost,
    likePost,
    setSettings,
    addService,
    editService,
    deleteService,
    updateTeam,
    isShopOpen,
    isQueueClosed,
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
    markAppointmentNoShow,
    checkInAppointment,
    deleteHistoryItem,
    clientId,
    loading: schedulingLoading,
    refreshAppointments,
    loadAvailability,
  } = useScheduling();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showClosedSalonModal, setShowClosedSalonModal] = useState(false);
  const [pendingJoin, setPendingJoin] = useState<{ name: string; whatsapp: string; serviceId: string } | null>(null);
  const [joiningClosedSalon, setJoiningClosedSalon] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const isOnboardingRole = user?.role === 'OWNER' || user?.role === 'MASTER_ADMIN';
  const {
    status: onboardingStatus,
    loaded: onboardingLoaded,
    completed: onboardingCompleted,
    refresh: refreshOnboarding,
  } = useOnboardingStatus(isOnboardingRole ? barbershopId : null);
  const [dependentResponsible, setDependentResponsible] = useState<QueueItem | null>(null);
  const [returnToQueueItem, setReturnToQueueItem] = useState<QueueItem | null>(null);
  const [returningToQueue, setReturningToQueue] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'bot' | 'error' } | null>(
    null
  );

  const rawTab = location.pathname.split('/')[2] || 'overview';
  const operationMode = settings?.operationMode ?? 'HYBRID';
  const activeTab = ALL_TAB_IDS.includes(rawTab) ? rawTab : getDefaultTab(user?.role, operationMode);

  const prevRawTab = useRef(rawTab);
  useEffect(() => {
    if (prevRawTab.current === 'onboarding' && rawTab !== 'onboarding') {
      void refreshOnboarding();
    }
    prevRawTab.current = rawTab;
  }, [rawTab, refreshOnboarding]);

  const handleOnboardingCompleted = useCallback(() => {
    void refreshOnboarding();
  }, [refreshOnboarding]);

  useEffect(() => {
    if (!user || !barbershopId || !isOnboardingRole || onboardingChecked || !onboardingLoaded || !onboardingStatus) return;
    setOnboardingChecked(true);
    if (onboardingStatus.completed && rawTab === 'onboarding') {
      navigate('/app/overview', { replace: true });
      return;
    }
    if (!onboardingStatus.welcomeSeen && !onboardingStatus.dismissed && !onboardingStatus.completed && rawTab !== 'onboarding') {
      navigate('/app/onboarding', { replace: true });
    }
  }, [user, barbershopId, isOnboardingRole, onboardingChecked, onboardingLoaded, onboardingStatus, rawTab, navigate]);

  // Redirect invalid tabs
  useEffect(() => {
    if (rawTab !== activeTab) {
      navigate(`/app/${getDefaultTab(user?.role, operationMode)}`, { replace: true });
    }
  }, [rawTab, activeTab, user?.role, operationMode, navigate]);

  // Redirect if tab not accessible by role
  useEffect(() => {
    if (!user) return;
    if (!canAccessTab(activeTab, user.role, { hasDashboard, permissions: user.permissions })) {
      navigate(`/app/${getDefaultTab(user.role, operationMode)}`, { replace: true });
    }
  }, [activeTab, user, hasDashboard, operationMode, navigate]);

  // Redirect if tab not accessible by operation mode
  useEffect(() => {
    if (!canAccessTabByMode(activeTab, operationMode)) {
      const preferred = getPrimaryTabForMode(operationMode);
      const target = canAccessTab(preferred, user?.role, { hasDashboard, permissions: user?.permissions })
        ? preferred
        : getDefaultTab(user?.role, operationMode);
      navigate(`/app/${target}`, { replace: true });
    }
  }, [activeTab, operationMode, user?.role, hasDashboard, navigate]);

  // Re-check access including hasDashboard
  useEffect(() => {
    if (!user) return;
    if ((activeTab === 'reports' || activeTab === 'finance' || activeTab === 'products' || activeTab === 'profit' || activeTab === 'equipment' || activeTab === 'organizations') && !hasDashboard) {
      navigate(`/app/${getDefaultTab(user.role, operationMode)}`, { replace: true });
    }
  }, [activeTab, user, hasDashboard, operationMode, navigate]);

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
    if (!isShopOpen()) {
      setPendingJoin({ name, whatsapp, serviceId });
      setShowClosedSalonModal(true);
      return;
    }
    await addClientToQueue(name, whatsapp, serviceId);
  };

  const addClientToQueue = async (name: string, whatsapp: string, serviceId: string) => {
    await joinQueue(name, whatsapp, serviceId);
    setShowJoinForm(false);
    showToast('Cliente adicionado!');
  };

  const handleAddWhileClosed = async () => {
    if (!pendingJoin) return;
    setJoiningClosedSalon(true);
    try {
      await addClientToQueue(pendingJoin.name, pendingJoin.whatsapp, pendingJoin.serviceId);
      setPendingJoin(null);
      setShowClosedSalonModal(false);
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível adicionar o cliente.'), 'error');
    } finally {
      setJoiningClosedSalon(false);
    }
  };

  const handleAddDependent = async (name: string, whatsapp: string, serviceId: string) => {
    if (!dependentResponsible?.customerId) return;
    await joinQueue(name, whatsapp, serviceId, {
      additionalPerson: true,
      responsibleSessionId: dependentResponsible.customerId,
    });
    showToast(`${name} adicionado como dependente de ${dependentResponsible.customerName}.`);
    setDependentResponsible(null);
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
  const queueClosed = isQueueClosed();
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
          activeTab={activeTab}
          userRole={user?.role}
          hasDashboard={hasDashboard}
          permissions={user?.permissions}
          operationMode={operationMode}
          onboardingCompleted={onboardingCompleted}
          onNavigate={tabId => navigate(`/app/${tabId}`)}
        />
        <main id="main-content" className="min-w-0 flex-1">
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {supportsQueue(operationMode) && (
                <QueueCapacityBanner barbershopId={barbershopId} waiting={peopleWaiting} onNavigate={tab => navigate(`/app/${tab}`)} canConfigure={user?.role === 'OWNER' || user?.role === 'MASTER_ADMIN'} />
              )}
              {(user?.role === 'OWNER' || user?.role === 'MASTER_ADMIN') && settings && barbershopId && (
                <ActivationChecklist
                  barbershopId={barbershopId}
                  onNavigate={tab => navigate(`/app/${tab}`)}
                />
              )}
              <DemandAlertBanner />
              {hasDashboard && isOwnerOrAdmin && <LowStockBanner />}
              {supportsAppointments(operationMode) && (
                <div className="rounded-xl border border-border bg-surface p-4">
                  <h2 className="mb-3 text-lg font-bold">Agenda de hoje</h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-surface-2 p-3">
                      <p className="text-xs text-text-muted">Agendamentos</p>
                      <p className="text-xl font-bold">
                        {appointments.filter(a => {
                          const today = todayISO();
                          return a.date === today && (a.status === 'confirmed' || a.status === 'checked_in');
                        }).length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface-2 p-3">
                      <p className="text-xs text-text-muted">Status do salão</p>
                      <p className={`text-sm font-bold ${isOpen ? 'text-success' : 'text-danger'}`}>
                        {isOpen ? 'Aberto' : 'Fechado'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {supportsQueue(operationMode) && (
                <QueueStatusCard
                  shopName={settings?.shopName}
                  isOpen={isOpen}
                  queueClosed={queueClosed}
                  insight={aiInsight}
                  peopleWaiting={peopleWaiting}
                  completedCount={completedCount}
                  inChairName={currentInChair?.customerName ?? null}
                  showStaffStats
                />
              )}
              <PwaInstallCard variant="panel" videoUrl={installVideoUrl} />
            </div>
          )}

          {activeTab === 'onboarding' && user && barbershopId && (
            <OnboardingChecklist
              barbershopId={barbershopId}
              shopName={settings?.shopName || ''}
              onNavigate={tab => navigate(`/app/${tab}`)}
              onCompleted={handleOnboardingCompleted}
              onDone={() => navigate('/app/overview')}
            />
          )}

          {activeTab === 'queue' && (
            <>
              <QueueCapacityBanner barbershopId={barbershopId} waiting={peopleWaiting} onNavigate={tab => navigate(`/app/${tab}`)} canConfigure={user?.role === 'OWNER' || user?.role === 'MASTER_ADMIN'} />
              <QueueStatusCard
                shopName={settings?.shopName}
                isOpen={isOpen}
                queueClosed={queueClosed}
                insight={aiInsight}
                peopleWaiting={peopleWaiting}
                completedCount={completedCount}
                inChairName={currentInChair?.customerName ?? null}
                showStaffStats
              />

              {isOwnerOrAdmin && (
                <div className="mb-4">
                  <ShopFloorControls
                    variant="compact"
                    onNotify={(message, type) => showToast(message, type === 'error' ? 'error' : 'success')}
                  />
                </div>
              )}

              <div className="flex items-center justify-end mb-4">
                <Button onClick={() => setShowJoinForm(true)} className="w-full sm:w-auto">
                  Adicionar cliente
                </Button>
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
                      staff={staff}
                      currentUserId={user?.id}
                      enableProductSales={
                        hasDashboard && (isOwnerOrAdmin || hasPermission('RETAIL_SELL'))
                      }
                      canOverrideProductPrice={isOwnerOrAdmin || hasPermission('PRODUCTS_MANAGE')}
                      isCurrentUser={item.customerId === clientId}
                      onStatusChange={updateQueueStatus}
                      onReturnToQueue={setReturnToQueueItem}
                      onAddDependent={setDependentResponsible}
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
              onNoShow={async id => {
                await markAppointmentNoShow(id);
                showToast('Cliente marcado como não compareceu');
              }}
              onDateChange={handleDateChange}
            />
          )}

          {activeTab === 'appointments' && !settings && (
            <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
              <p className="text-text-muted">Carregando configurações do salão...</p>
            </div>
          )}

          {activeTab === 'products' && hasDashboard && (
            <ProductsHub onNotify={(message, type) => showToast(message, type === 'error' ? 'error' : 'success')} />
          )}

          {activeTab === 'clients' && settings && (
            <ClientsTab
              services={services}
              staff={staff}
              settings={settings}
              canAnalytics={
                hasDashboard && (isOwnerOrAdmin || hasPermission('CRM_ANALYTICS_VIEW'))
              }
              canCampaigns={isOwnerOrAdmin || hasPermission('CRM_CAMPAIGNS_MANAGE')}
              canCancelSale={user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER'}
              showUpgradeHint={
                (user?.role === 'OWNER' || user?.role === 'MASTER_ADMIN') &&
                !hasDashboard
              }
              availability={availability}
              onBook={async d => {
                await bookAppointment(d);
                showToast('Agendamento confirmado');
              }}
              onNotify={showToast}
            />
          )}

          {activeTab === 'services' &&
            (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && (
              <div className="space-y-6">
                <ServiceManager
                  services={services}
                  onAdd={addService}
                  onEdit={editService}
                  onDelete={deleteService}
                />
                <CatalogManager />
              </div>
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
            <div className="space-y-6">
              <FinancialDashboard
                queueHistory={queue}
                services={services}
                currentUser={user}
                allStaff={staff}
                onDeleteHistoryItem={deleteHistoryItem}
              />
              <RecommendationsPanel />
            </div>
          )}

          {activeTab === 'finance' && (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && (
            <div className="space-y-6">
              <ErrorBoundary variant="section">
                <OwnerFinancialPanel />
              </ErrorBoundary>
              <ErrorBoundary variant="section">
                <CashPanel />
              </ErrorBoundary>
              <ErrorBoundary variant="section">
                <DepositPolicyPanel />
              </ErrorBoundary>
              <ErrorBoundary variant="section">
                <WaitlistPanel />
              </ErrorBoundary>
              <ErrorBoundary variant="section">
                <RecurringPackagesPanel />
              </ErrorBoundary>
              <ErrorBoundary variant="section">
                <LoyaltyPanel />
              </ErrorBoundary>
              <ErrorBoundary variant="section">
                <GoalsPanel />
              </ErrorBoundary>
            </div>
          )}

          {activeTab === 'profit' && barbershopId && (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && (
            <ProfitEnginePanel barbershopId={barbershopId} />
          )}

          {activeTab === 'equipment' && (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && (
            <EquipmentPanel />
          )}

          {activeTab === 'organizations' && (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && (
            <OrganizationsPanel />
          )}

          {activeTab === 'posts' && (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && (
            <PostsManager />
          )}

          {activeTab === 'showcase' && (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && (
            <ShowcasePanel />
          )}

          {activeTab === 'link' &&
            (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') &&
            barbershopId && <PublicLinkPanel barbershopId={barbershopId} operationMode={settings?.operationMode} />}

          {activeTab === 'referrals' &&
            (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && <OwnerReferralsPanel onNotify={showToast} />}

          {activeTab === 'subscription' &&
            (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && <OwnerSubscriptionPanel />}

          {activeTab === 'settings' && user && (
            <>
              {(user.role === 'MASTER_ADMIN' || user.role === 'OWNER') && settings ? (
                <SettingsManager
                  settings={settings}
                  barbershopId={barbershopId || undefined}
                  onSave={async s => {
                    await setSettings(s);
                    showToast('Salvo!');
                  }}
                  onNotify={showToast}
                  showNotifications={user.role === 'OWNER'}
                  accountSection={
                    <div className="space-y-6">
                      <ProfileAvatarSection
                        userId={user.id}
                        userName={user.name}
                        avatarUrl={user.avatarUrl}
                        onAvatarUpdated={url => updateUserAvatar(url)}
                        onNotify={showToast}
                      />
                      <ProfileSettingsPanel onNotify={showToast} />
                    </div>
                  }
                />
              ) : (
                <div className="space-y-8 animate-fade-in">
                  <section className="space-y-4">
                    <h2 className="text-lg font-bold text-text-primary">Conta</h2>
                    <ProfileAvatarSection
                      userId={user.id}
                      userName={user.name}
                      avatarUrl={user.avatarUrl}
                      onAvatarUpdated={url => updateUserAvatar(url)}
                      onNotify={showToast}
                    />
                    <ProfileSettingsPanel onNotify={showToast} />
                  </section>
                  {user.role === 'EMPLOYEE' && (
                    <section className="space-y-4">
                      <h2 className="text-lg font-bold text-text-primary">Privacidade e dados</h2>
                      <AccountPrivacyPanel onNotify={showToast} />
                    </section>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'support' && <SupportPanel />}

          {activeTab === 'profile' && settings && (
            <ShopProfile
              settings={settings}
              posts={feed}
              currentUser={user}
              audience="staff"
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
      <ClosedSalonJoinModal
        open={showClosedSalonModal}
        schedule={settings?.schedule || []}
        submitting={joiningClosedSalon}
        onAddAnyway={() => void handleAddWhileClosed()}
        onOpenSettings={() => {
          setShowClosedSalonModal(false);
          setPendingJoin(null);
          setShowJoinForm(false);
          navigate('/app/settings');
        }}
        onClose={() => {
          if (!joiningClosedSalon) setShowClosedSalonModal(false);
        }}
      />
      {dependentResponsible && (
        <AddCustomerForm
          services={services}
          onJoin={handleAddDependent}
          onCancel={() => setDependentResponsible(null)}
          isAdditionalPerson
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

const LowStockBanner: React.FC = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    productsApi.listProducts({ lowStock: 'true', limit: 1, page: 1 }).then(res => setCount(res.meta.total)).catch(() => undefined);
  }, []);
  if (!count) return null;
  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-text-primary">
      {count} produto(s) abaixo do estoque mínimo. A venda continua liberada.
    </div>
  );
};

export default StaffDashboard;
