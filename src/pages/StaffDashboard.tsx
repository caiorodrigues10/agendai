import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { QueueItemCard } from '../components/domain/QueueItemCard';
import { AddCustomerForm } from '../components/domain/AddCustomerForm';
import { ServiceManager } from '../components/domain/ServiceManager';
import { SettingsManager } from '../components/domain/SettingsManager';
import { TeamManager } from '../components/domain/TeamManager';
import { FinancialDashboard } from '../components/domain/FinancialDashboard';
import { OwnerFinancialPanel } from '../components/domain/OwnerFinancialPanel';
import { OwnerSubscriptionPanel } from '../components/domain/OwnerSubscriptionPanel';
import { ShopProfile } from '../components/domain/ShopProfile';
import { AppointmentCalendar } from '../components/domain/AppointmentCalendar';
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useBarbershop } from '../contexts/BarbershopContext';
import { useScheduling } from '../contexts/SchedulingContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Clock, Settings, Scissors, Users, BarChart3, Store, List, CalendarDays, Coffee, Loader2, CreditCard } from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasDashboard } = useSubscription();
  const { services, settings, staff, feed, addPost, deletePost, likePost, setSettings, addService, editService, deleteService, updateTeam, isShopOpen, loading: shopLoading } = useBarbershop();
  const { queue, appointments, availability, aiInsight, completedCount, joinQueue, leaveQueue, updateQueueStatus, bookAppointment, cancelAppointment, checkInAppointment, deleteHistoryItem, clientId, loading: schedulingLoading, refreshAppointments, loadAvailability } = useScheduling();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'bot'} | null>(null);

  const activeTab = location.pathname.split('/')[2] as 'queue' | 'profile' | 'appointments' | 'services' | 'settings' | 'team' | 'reports' | 'finance' | 'subscription' || 'queue';

  const tabs = useMemo(() => {
    const t = [{ id: 'queue', label: 'Fila', icon: List }, { id: 'appointments', label: 'Agenda', icon: CalendarDays }];
    if ((user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && hasDashboard) {
        t.push({ id: 'reports', label: 'Relatórios', icon: BarChart3 });
        t.push({ id: 'finance', label: 'Financeiro', icon: CreditCard });
    }
    t.push({ id: 'profile', label: 'Perfil', icon: Store });
    return t;
  }, [user, hasDashboard]);

  useEffect(() => {
    if (!user) return;
    const restrictedTabs = ['services', 'settings', 'team'];
    if (restrictedTabs.includes(activeTab) && !(user.role === 'MASTER_ADMIN' || user.role === 'OWNER')) {
      navigate('/app/queue');
    }
    // Redirecionar se tentar acessar reports sem permissão (caso acesse via URL direta)
    if (activeTab === 'reports' && (user.role === 'EMPLOYEE' || !hasDashboard)) {
      navigate('/app/queue');
    }
    if (activeTab === 'finance' && (!(user.role === 'MASTER_ADMIN' || user.role === 'OWNER') || !hasDashboard)) {
      navigate('/app/queue');
    }
    if (activeTab === 'subscription' && !(user.role === 'MASTER_ADMIN' || user.role === 'OWNER')) {
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

  const handleDateChange = useCallback((date: string) => {
    refreshAppointments(date);
    loadAvailability(date);
  }, [refreshAppointments, loadAvailability]);

  if (shopLoading || schedulingLoading) {
    return <div className="min-h-screen bg-bg flex items-center justify-center text-accent"><Loader2 className="animate-spin" size={40}/></div>;
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
        onLogout={() => { logout(); navigate('/'); }}
        logoUrl={settings?.logoUrl}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-md mx-auto px-4 pt-6">
        <div className="flex bg-surface p-1 rounded-xl mb-6 border border-border relative">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => navigate(`/app/${tab.id}`)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 z-10 relative
                        ${activeTab === tab.id ? 'text-text-primary' : 'text-text-muted'}
                    `}
                >
                    <tab.icon size={16} /> {tab.label}
                </button>
            ))}

            <div
                className="absolute top-1 bottom-1 bg-surface-2 rounded-lg transition-all duration-300"
                style={{
                    width: `calc(${100 / tabs.length}% - 2px)`,
                    left: `calc(${(tabs.findIndex(t => t.id === activeTab) !== -1 ? tabs.findIndex(t => t.id === activeTab) : 0) * (100 / tabs.length)}% + 1px)`
                }}
            >
            </div>
        </div>

        {user && (
          <div className="flex gap-2 mb-6 bg-surface p-1 rounded-lg border border-border overflow-x-auto no-scrollbar">

            {(user.role === 'MASTER_ADMIN' || user.role === 'OWNER') && (
                <>
                    <button onClick={() => navigate('/app/services')} className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'services' ? 'bg-surface-2 text-text-primary shadow' : 'text-text-secondary'}`}>
                        <Scissors size={16} /> Serviços
                    </button>
                    <button onClick={() => navigate('/app/team')} className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'team' ? 'bg-surface-2 text-text-primary shadow' : 'text-text-secondary'}`}>
                        <Users size={16} /> Equipe
                    </button>
                    <button
                      onClick={() => navigate('/app/subscription')}
                      className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'subscription' ? 'bg-surface-2 text-text-primary shadow' : 'text-text-secondary'}`}
                      title="Planos e assinatura"
                    >
                        <CreditCard size={16} /> Assinatura
                    </button>
                    <button onClick={() => navigate('/app/settings')} className={`w-12 py-2 flex items-center justify-center rounded-md transition-all ${activeTab === 'settings' ? 'bg-surface-2 text-text-primary shadow' : 'text-text-secondary'}`}>
                        <Settings size={18} />
                    </button>
                </>
            )}
          </div>
        )}

        {activeTab === 'profile' && settings && (
            <ShopProfile
                settings={settings}
                posts={feed}
                currentUser={user}
                onAddPost={(p) => { addPost(p); showToast('Postado!'); }}
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
                onBook={async (d) => { await bookAppointment(d); showToast('Agendado com sucesso!'); }}
                onCancel={(id) => { cancelAppointment(id); showToast('Cancelado'); }}
                onCheckIn={(appt) => { checkInAppointment(appt); showToast('Check-in realizado!'); }}
                onDateChange={handleDateChange}
            />
        )}

        {activeTab === 'appointments' && !settings && (
            <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
                <p className="text-text-muted">Carregando configurações do salão...</p>
            </div>
        )}

        {(user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && activeTab === 'settings' && settings && (
            <SettingsManager settings={settings} onSave={(s) => { setSettings(s); showToast('Salvo!'); }} />
        )}

        {(user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && activeTab === 'services' && (
            <ServiceManager services={services} onAdd={addService} onEdit={editService} onDelete={deleteService} />
        )}

        {(user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && activeTab === 'team' && user && (
            <TeamManager staff={staff} onUpdateTeam={async (t) => { await updateTeam(t); showToast('Equipe atualizada'); }} currentAdminId={user.id} />
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

        {(user?.role === 'MASTER_ADMIN' || user?.role === 'OWNER') && activeTab === 'subscription' && (
            <OwnerSubscriptionPanel />
        )}

        {activeTab === 'queue' && (
          <>
            <div className="mb-6 bg-surface rounded-xl p-5 border border-border shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-accent font-bold text-sm tracking-wider uppercase flex items-center gap-2 drop-shadow-md">
                    {settings?.shopName}
                  </h2>
                  {aiInsight && (
                     <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border tracking-wide shadow-sm
                       ${!isOpen ? 'bg-surface-2 text-text-secondary border-border-strong' :
                        aiInsight.busyLevel === 'high' ? 'bg-danger/10 text-danger border-danger/20' :
                          aiInsight.busyLevel === 'medium' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'}
                     `}>
                       { !isOpen ? 'Fechado' :
                         aiInsight.busyLevel === 'high' ? 'Movimento Alto' :
                         aiInsight.busyLevel === 'medium' ? 'Movimento Médio' : 'Movimento Tranquilo' }
                     </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                       <Coffee size={12} className="text-accent" />
                      <span>{isOpen ? 'Aberto hoje' : 'Fechado hoje'}</span>
                    </div>
                    <div className="h-1 w-1 bg-border-strong rounded-full"></div>
                    <div className="text-xs text-text-muted">
                      {aiInsight?.estimatedWait || '--'}
                    </div>
                </div>

                {aiInsight && (
                    <p className="mt-4 text-sm text-text-secondary">
                      {aiInsight.message}
                    </p>
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
                    onLeaveQueue={(id) => { leaveQueue(id); showToast('Cliente removido.', 'bot'); }}
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
    </div>
  );
};
