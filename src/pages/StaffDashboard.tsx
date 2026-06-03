import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/ui/Header';
import { QueueItemCard } from '../components/domain/QueueItemCard';
import { AddCustomerForm } from '../components/domain/AddCustomerForm';
import { ServiceManager } from '../components/domain/ServiceManager';
import { SettingsManager } from '../components/domain/SettingsManager';
import { TeamManager } from '../components/domain/TeamManager';
import { FinancialDashboard } from '../components/domain/FinancialDashboard';
import { ShopProfile } from '../components/domain/ShopProfile';
import { AppointmentScheduler } from '../components/domain/AppointmentScheduler';
import { AppointmentList } from '../components/domain/AppointmentList';
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useBarbershop } from '../contexts/BarbershopContext';
import { useScheduling } from '../contexts/SchedulingContext';
import { Clock, Settings, Scissors, Users, BarChart3, Store, List, CalendarDays, Coffee, Loader2 } from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { services, settings, staff, feed, addPost, deletePost, likePost, setSettings, addService, editService, deleteService, updateTeam, isShopOpen, loading: shopLoading } = useBarbershop();
  const { queue, appointments, aiInsight, completedCount, joinQueue, leaveQueue, updateQueueStatus, bookAppointment, cancelAppointment, checkInAppointment, deleteHistoryItem, clientId, loading: schedulingLoading } = useScheduling();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'bot'} | null>(null);

  const activeTab = location.pathname.split('/')[2] as 'queue' | 'profile' | 'appointments' | 'services' | 'settings' | 'team' | 'reports' || 'queue';

  const tabs = useMemo(() => {
    const t = [{ id: 'queue', label: 'Fila', icon: List }, { id: 'appointments', label: 'Agenda', icon: CalendarDays }];
    if (user?.role === 'admin' || user?.role === 'owner') {
        t.push({ id: 'reports', label: 'Relatórios', icon: BarChart3 });
    }
    t.push({ id: 'profile', label: 'Perfil', icon: Store });
    return t;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const restrictedTabs = ['services', 'settings', 'team'];
    if (restrictedTabs.includes(activeTab) && !(user.role === 'admin' || user.role === 'owner')) {
      navigate('/app/queue');
    }
    // Redirecionar se tentar acessar reports sem permissão (caso acesse via URL direta)
    if (activeTab === 'reports' && user.role === 'employee') {
      navigate('/app/queue');
    }
  }, [activeTab, user, navigate]);

  const showToast = (msg: string, type: 'success' | 'bot' = 'success') => {
    setToast({ message: msg, type });
  };

  const handleJoinQueue = async (name: string, whatsapp: string, serviceId: string) => {
    await joinQueue(name, whatsapp, serviceId);
    setShowJoinForm(false);
    showToast('Cliente adicionado!');
  };

  if (shopLoading || schedulingLoading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-cyan-500"><Loader2 className="animate-spin" size={40}/></div>;
  }

  const activeQueue = queue.filter(q => q.status !== 'completed' && q.status !== 'cancelled');
  const peopleWaiting = activeQueue.filter(q => q.status === 'waiting').length;
  const currentInChair = activeQueue.find(q => q.status === 'in_chair');
  const isUserInQueue = activeQueue.some(q => q.customerId === clientId);
  const isOpen = isShopOpen();

  return (
    <div className="min-h-screen pb-20 bg-neutral-950 text-neutral-100">
      <Header
        currentUser={user}
        onOpenLogin={() => navigate('/login')}
        onLogout={() => { logout(); navigate('/'); }}
        logoUrl={settings?.logoUrl}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-md mx-auto px-4 pt-6">
        <div className="flex bg-neutral-900 p-1 rounded-xl mb-6 border border-neutral-800 relative">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => navigate(`/app/${tab.id}`)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 z-10 relative
                        ${activeTab === tab.id ? 'text-white' : 'text-neutral-500'}
                    `}
                >
                    <tab.icon size={16} /> {tab.label}
                </button>
            ))}

            <div
                className="absolute top-1 bottom-1 bg-neutral-800 rounded-lg transition-all duration-300"
                style={{
                    width: `calc(${100 / tabs.length}% - 2px)`,
                    left: `calc(${(tabs.findIndex(t => t.id === activeTab) !== -1 ? tabs.findIndex(t => t.id === activeTab) : 0) * (100 / tabs.length)}% + 1px)`
                }}
            >
            </div>
        </div>

        {user && (
          <div className="flex gap-2 mb-6 bg-neutral-900 p-1 rounded-lg border border-neutral-800 overflow-x-auto no-scrollbar">

            {(user.role === 'admin' || user.role === 'owner') && (
                <>
                    <button onClick={() => navigate('/app/services')} className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'services' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400'}`}>
                        <Scissors size={16} /> Serviços
                    </button>
                    <button onClick={() => navigate('/app/team')} className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'team' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400'}`}>
                        <Users size={16} /> Equipe
                    </button>
                    <button onClick={() => navigate('/app/settings')} className={`w-12 py-2 flex items-center justify-center rounded-md transition-all ${activeTab === 'settings' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400'}`}>
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

        {activeTab === 'appointments' && (
            user ? (
                <AppointmentList
                    appointments={appointments}
                    services={services}
                    staff={staff}
                    onCancel={(id) => { cancelAppointment(id); showToast('Cancelado'); }}
                    onCheckIn={(appt) => { checkInAppointment(appt); showToast('Check-in realizado!'); }}
                />
            ) : (
                settings && (
                  <AppointmentScheduler
                      services={services}
                      staff={staff}
                      settings={settings}
                      onBook={(d) => { bookAppointment(d); showToast('Agendado com sucesso!'); }}
                  />
                )
            )
        )}

        {(user?.role === 'admin' || user?.role === 'owner') && activeTab === 'settings' && settings && (
            <SettingsManager settings={settings} onSave={(s) => { setSettings(s); showToast('Salvo!'); }} />
        )}

        {(user?.role === 'admin' || user?.role === 'owner') && activeTab === 'services' && (
            <ServiceManager services={services} onAdd={addService} onEdit={editService} onDelete={deleteService} />
        )}

        {(user?.role === 'admin' || user?.role === 'owner') && activeTab === 'team' && user && (
            <TeamManager staff={staff} onUpdateTeam={(t) => { updateTeam(t); showToast('Equipe atualizada'); }} currentAdminId={user.id} />
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

        {activeTab === 'queue' && (
          <>
            <div className="mb-6 bg-neutral-900 rounded-xl p-5 border border-neutral-800 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-cyan-500 font-bold text-sm tracking-wider uppercase flex items-center gap-2 drop-shadow-md">
                    {settings?.shopName}
                  </h2>
                  {aiInsight && (
                     <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border tracking-wide shadow-sm
                       ${!isOpen ? 'bg-neutral-800 text-neutral-400 border-neutral-700' :
                        aiInsight.busyLevel === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                         aiInsight.busyLevel === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}
                     `}>
                       { !isOpen ? 'Fechado' :
                         aiInsight.busyLevel === 'high' ? 'Movimento Alto' :
                         aiInsight.busyLevel === 'medium' ? 'Movimento Médio' : 'Movimento Tranquilo' }
                     </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <Coffee size={12} className="text-cyan-500" />
                      <span>{isOpen ? 'Aberto hoje' : 'Fechado hoje'}</span>
                    </div>
                    <div className="h-1 w-1 bg-neutral-700 rounded-full"></div>
                    <div className="text-xs text-neutral-500">
                      {aiInsight?.estimatedWait || '--'}
                    </div>
                </div>

                {aiInsight && (
                    <p className="mt-4 text-sm text-neutral-400">
                      {aiInsight.message}
                    </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-3 items-center flex-wrap">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-400">
                  <span className="text-white font-bold">{peopleWaiting}</span> na espera
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-400">
                  <span className="text-white font-bold">{completedCount}</span> concluídos
                </div>
                {currentInChair && (
                  <div className="bg-green-900/20 border border-green-900/50 rounded-xl px-3 py-2 text-xs text-green-400">
                    {currentInChair.customerName} na cadeira
                  </div>
                )}
              </div>

              {!isUserInQueue && (
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="px-3 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/20"
                >
                  Adicionar cliente
                </button>
              )}
            </div>

            <div className="space-y-4">
              {activeQueue.length === 0 ? (
                <div className="text-center py-10 bg-neutral-900 rounded-xl border border-neutral-800 border-dashed">
                  <p className="text-neutral-500">Nenhum cliente na fila.</p>
                </div>
              ) : (
                activeQueue.map((item, index) => (
                  <QueueItemCard
                    key={item.id}
                    item={item}
                    service={services.find(s => s.id === item.serviceId)}
                    position={index + 1}
                    isAdmin={true}
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
