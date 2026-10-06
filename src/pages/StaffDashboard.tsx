import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from '../layouts/app/AppLayout';
import { ClosedSalonJoinModal, QueueCapacityBanner, QueueItemCard, QueueStatusCard, ReturnToQueueModal } from '../features/queue';
import { AddCustomerForm, ClientsTab } from '../features/clients';
import { ShopFloorControls, ShopProfile } from '../features/shop';
import { CatalogManager, ServiceManager } from '../features/catalog';
import { SettingsManager, AccountPrivacyPanel, DevicesPanel, ProfileAvatarSection, ProfileSettingsPanel } from '../features/settings';
import { SupportPanel } from '../features/support';
import { TeamManager } from '../features/team';
import { CashPanel, DemandAlertBanner, FinancialDashboard, OwnerFinancialPanel, ProfitEnginePanel } from '../features/finance';
import { OwnerReferralsPanel } from '../features/referrals';
import { OwnerSubscriptionPanel } from '../features/subscription';
import { PostsManager } from '../features/posts';
import { ShowcasePanel, PublicLinkPanel } from '../features/showcase';
import { AppointmentCalendar } from '../features/appointments';
import { Toast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useBarbershop } from '../contexts/BarbershopContext';
import { useScheduling } from '../contexts/SchedulingContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useBarbershopFilters } from '../contexts/BarbershopFiltersContext';
import { ALL_TAB_IDS, getDefaultTab, canAccessTab, canAccessTabByMode, getPrimaryTabForMode } from '../config/tabRegistry';

import { getErrorMessage } from '../utils/errorMessage';
import { ApiError } from '../infra/apiClient';
import { ListSkeleton } from '../components/patterns/skeletons';
import { SectionError } from '../components/patterns/states/SectionError';
import { EmptyState } from '../components/ui/EmptyState';
import { QueueItem } from '../types';
import { LuRefreshCw as RefreshCw } from 'react-icons/lu';
import { supportsQueue, supportsAppointments } from '../utils/operationMode';
import { todayISO } from '../utils/dateRanges';
import { usePermissions } from '../hooks/usePermissions';
import { ActivationChecklist, OnboardingChecklist } from '../features/onboarding';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { ProductsHub } from '../features/products';
import { productsApi } from '../infra/productsApi';
import { GoalsPanel } from '../features/goals';
import { LoyaltyPanel } from '../features/loyalty';
import { RecommendationsPanel } from '../features/recommendations';
import { DepositPolicyPanel } from '../features/deposits';
import { WaitlistPanel } from '../features/waitlist';
import { RecurringPackagesPanel } from '../features/recurring';
import { OrganizationsPanel } from '../features/organizations';
import { ErrorBoundary } from '../components/infra/ErrorBoundary';
import { EquipmentPanel } from '../features/equipment';


export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUserAvatar, impersonationShop } = useAuth();
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
  } = useBarbershop();
  const { barbershopId } = useBarbershopFilters();
  const {
    queue,
    queueState,
    queueError,
    queueStale,
    appointments,
    appointmentsState,
    appointmentsError,
    appointmentsStale,
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
    refreshQueue,
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

  // Ações destrutivas: aguarda o mutador; falha de rede não confirma nada.
  const runDestructive = async (
    action: () => Promise<unknown>,
    successMessage: string,
    successType: 'success' | 'bot' = 'success'
  ) => {
    try {
      await action();
      showToast(successMessage, successType);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
        showToast('Sem conexão. Nada foi alterado.', 'error');
        return;
      }
      showToast(getErrorMessage(err, 'Ação não concluída.'), 'error');
    }
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

  const activeQueue = queue.filter(q => q.status !== 'completed' && q.status !== 'cancelled');
  const peopleWaiting = activeQueue.filter(q => q.status === 'waiting').length;
  const currentInChair = activeQueue.find(q => q.status === 'in_chair');
  const isOpen = isShopOpen();
  const queueClosed = isQueueClosed();

  return (
    <>
      <AppLayout
        user={user}
        logoUrl={settings?.logoUrl}
        onLogin={() => navigate('/login')}
        onLogout={() => {
          // Durante a visão temporária, "Sair" só encerra o impersonation e a
          // sessão do master continua viva: voltar para a conta inspecionada
          // em vez da landing pública.
          const shopId = impersonationShop?.id;
          logout();
          navigate(shopId ? `/master/accounts/${shopId}` : '/');
        }}
        toast={
          toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : undefined
        }
        activeTab={activeTab}
        userRole={user?.role}
        hasDashboard={hasDashboard}
        permissions={user?.permissions}
        operationMode={operationMode}
        onboardingCompleted={onboardingCompleted}
        onNavigate={tabId => navigate(`/app/${tabId}`)}
      >
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

              {queueStale && (
                <StaleBanner onRefresh={() => void refreshQueue()} />
              )}

              <div className="space-y-4">
                {queueState === 'loading' && activeQueue.length === 0 ? (
                  <ListSkeleton rows={4} hasIcon />
                ) : queueState === 'error' && activeQueue.length === 0 ? (
                  <SectionError
                    message={queueError ?? 'Não foi possível carregar a fila.'}
                    onRetry={() => void refreshQueue()}
                  />
                ) : queueState === 'ready' && activeQueue.length === 0 ? (
                  <EmptyState title="Nenhum cliente na fila." />
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
                        void runDestructive(() => leaveQueue(id), 'Cliente removido.', 'bot');
                      }}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'appointments' && settings && (
            <>
              {appointmentsStale && (
                <StaleBanner onRefresh={() => void refreshAppointments()} />
              )}
              {appointmentsState === 'loading' && appointments.length === 0 ? (
                <ListSkeleton rows={5} hasIcon />
              ) : appointmentsState === 'error' && appointments.length === 0 ? (
                <SectionError
                  message={appointmentsError ?? 'Não foi possível carregar a agenda.'}
                  onRetry={() => void refreshAppointments()}
                />
              ) : (
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
                    void runDestructive(() => cancelAppointment(id), 'Cancelado');
                  }}
                  onCheckIn={appt => {
                    void runDestructive(() => checkInAppointment(appt), 'Check-in realizado!');
                  }}
                  onNoShow={async id => {
                    await markAppointmentNoShow(id);
                    showToast('Cliente marcado como não compareceu');
                  }}
                  onDateChange={handleDateChange}
                />
              )}
            </>
          )}

          {activeTab === 'appointments' && !settings && (
            <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
              <p className="text-text-muted">Carregando configurações do salão...</p>
            </div>
          )}

          {activeTab === 'products' && hasDashboard && (
            <ProductsHub onNotify={(message, type) => showToast(message, type === 'error' ? 'error' : 'success')} />
          )}

          {activeTab === 'clients' && !settings && (
            <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
              <p className="text-text-muted">Carregando configurações do salão...</p>
            </div>
          )}

          {activeTab === 'clients' && settings && (
            <ErrorBoundary variant="section">
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
            </ErrorBoundary>
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
            <ErrorBoundary variant="section">
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
            </ErrorBoundary>
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
            <ErrorBoundary variant="section">
              <ProfitEnginePanel barbershopId={barbershopId} />
            </ErrorBoundary>
          )}

          {activeTab === 'equipment' && (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && (
            <EquipmentPanel />
          )}

          {activeTab === 'organizations' && (user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && (
            <ErrorBoundary variant="section">
              <OrganizationsPanel />
            </ErrorBoundary>
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
                      <DevicesPanel />
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
                    <DevicesPanel />
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
      </AppLayout>

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
    </>
  );
};

const StaleBanner: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-text-primary">
    <span>Dados podem estar desatualizados.</span>
    <button
      type="button"
      onClick={onRefresh}
      className="inline-flex items-center gap-1 text-sm font-medium text-text-primary underline-offset-4 hover:underline"
    >
      <RefreshCw size={14} aria-hidden="true" /> Atualizar
    </button>
  </div>
);

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
