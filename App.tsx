import React, { useState } from 'react';
import { Header } from './components/Header';
import { QueueItemCard } from './components/QueueItemCard';
import { AddCustomerForm } from './components/AddCustomerForm';
import { ServiceManager } from './components/ServiceManager';
import { SettingsManager } from './components/SettingsManager'; 
import { TeamManager } from './components/TeamManager';
import { FinancialDashboard } from './components/FinancialDashboard';
import { StaffLogin } from './components/StaffLogin';
import { ShopProfile } from './components/ShopProfile';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { AppointmentList } from './components/AppointmentList';
import { Toast } from './components/Toast'; 
import { useShop } from './contexts/ShopContext';
import { Clock, Lock, Settings, Scissors, UserPlus, Users, BarChart3, Store, List, CalendarDays, Coffee, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { 
    loading, currentUser, queue, services, settings, staff, feed, appointments, 
    ownedIds, aiInsight, login, logout, joinQueue, leaveQueue, updateQueueStatus,
    addPost, deletePost, likePost, bookAppointment, cancelAppointment, checkInAppointment,
    addService, editService, deleteService, saveSettings, updateTeam, deleteHistoryItem,
    isShopOpen, getTodayScheduleDisplay
  } = useShop();

  const [showLogin, setShowLogin] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'profile' | 'appointments' | 'services' | 'settings' | 'team' | 'reports'>('queue'); 
  const [toast, setToast] = useState<{message: string, type: 'success' | 'bot'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'bot' = 'success') => {
      setToast({ message: msg, type });
  };

  // --- Handlers Wrappers to include Toast ---
  const handleJoinQueue = async (name: string, whatsapp: string, serviceId: string, isManual?: boolean) => {
    await joinQueue(name, whatsapp, serviceId, isManual);
    setShowJoinForm(false);
    if(isManual) showToast('Cliente adicionado!');
    else showToast('Você entrou na fila!', 'bot');
  };

  const handleLogin = async (member: any) => {
    await login(member.pin); // Actually logic is inside context, but UI flow is here
    if (member.role === 'admin') setActiveTab('queue');
    setShowLogin(false);
  };

  if (loading) {
      return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-cyan-500"><Loader2 className="animate-spin" size={40}/></div>;
  }

  // Computed
  const activeQueue = queue.filter(q => q.status !== 'completed' && q.status !== 'cancelled');
  const peopleWaiting = activeQueue.filter(q => q.status === 'waiting').length;
  const currentInChair = activeQueue.find(q => q.status === 'in_chair');
  const isUserInQueue = activeQueue.some(q => ownedIds.includes(q.id));
  const isOpen = isShopOpen();

  return (
    <div className="min-h-screen pb-20 bg-neutral-950 text-neutral-100">
      <Header 
        currentUser={currentUser}
        onOpenLogin={() => setShowLogin(true)}
        onLogout={() => { logout(); setActiveTab('queue'); }}
        logoUrl={settings.logoUrl}
      />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {showLogin && (
        <StaffLogin 
            staffMembers={staff} 
            onLogin={handleLogin}
            onClose={() => setShowLogin(false)}
            logoUrl={settings.logoUrl}
        />
      )}

      <main className="max-w-md mx-auto px-4 pt-6">
        
        {/* TOP NAVIGATION */}
        <div className="flex bg-neutral-900 p-1 rounded-xl mb-6 border border-neutral-800 relative">
            {['queue', 'appointments', 'profile'].map((tab, idx) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 z-10 relative
                        ${activeTab === tab ? 'text-white' : 'text-neutral-500'}
                    `}
                >
                    {tab === 'queue' && <><List size={16} /> Fila</>}
                    {tab === 'appointments' && <><CalendarDays size={16} /> Agenda</>}
                    {tab === 'profile' && <><Store size={16} /> Perfil</>}
                </button>
            ))}
            
            <div className={`absolute top-1 bottom-1 w-[calc(33.3%-2px)] bg-neutral-800 rounded-lg transition-all duration-300 
                ${activeTab === 'queue' ? 'left-1' : activeTab === 'appointments' ? 'left-[calc(33.3%+2px)]' : 'left-[calc(66.6%+2px)]'}`}>
            </div>
        </div>

        {/* STAFF TABS */}
        {currentUser && (
          <div className="flex gap-2 mb-6 bg-neutral-900 p-1 rounded-lg border border-neutral-800 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('reports')} className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'reports' ? 'bg-neutral-800 text-cyan-400 shadow' : 'text-neutral-400'}`}>
               <BarChart3 size={16} /> Relatórios
            </button>
            
            {currentUser.role === 'admin' && (
                <>
                    <button onClick={() => setActiveTab('services')} className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'services' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400'}`}>
                        <Scissors size={16} /> Serviços
                    </button>
                    <button onClick={() => setActiveTab('team')} className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'team' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400'}`}>
                        <Users size={16} /> Equipe
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={`w-12 py-2 flex items-center justify-center rounded-md transition-all ${activeTab === 'settings' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400'}`}>
                        <Settings size={18} />
                    </button>
                </>
            )}
          </div>
        )}

        {/* --- CONTENT --- */}

        {activeTab === 'profile' && (
            <ShopProfile 
                settings={settings}
                posts={feed}
                currentUser={currentUser}
                onAddPost={(p) => { addPost(p); showToast('Postado!'); }}
                onDeletePost={deletePost}
                onLikePost={likePost}
            />
        )}

        {activeTab === 'appointments' && (
            currentUser ? (
                <AppointmentList 
                    appointments={appointments} 
                    services={services}
                    staff={staff}
                    onCancel={(id) => { cancelAppointment(id); showToast('Cancelado'); }}
                    onCheckIn={(appt) => { checkInAppointment(appt); showToast('Check-in realizado!'); }}
                />
            ) : (
                <AppointmentScheduler 
                    services={services}
                    staff={staff}
                    settings={settings}
                    onBook={(d) => { bookAppointment(d); showToast('Agendado com sucesso!'); }}
                />
            )
        )}

        {currentUser?.role === 'admin' && activeTab === 'settings' && (
            <SettingsManager settings={settings} onSave={(s) => { saveSettings(s); showToast('Salvo!'); }} />
        )}

        {currentUser?.role === 'admin' && activeTab === 'services' && (
            <ServiceManager services={services} onAdd={addService} onEdit={editService} onDelete={deleteService} />
        )}

        {currentUser?.role === 'admin' && activeTab === 'team' && (
            <TeamManager staff={staff} onUpdateTeam={(t) => { updateTeam(t); showToast('Equipe atualizada'); }} currentAdminId={currentUser.id} />
        )}

        {currentUser && activeTab === 'reports' && (
            <FinancialDashboard 
                queueHistory={queue} 
                services={services} 
                currentUser={currentUser}
                allStaff={staff}
                onDeleteHistoryItem={deleteHistoryItem}
            />
        )}

        {activeTab === 'queue' && (
          <>
            {/* AI Banner */}
            <div className="mb-6 bg-neutral-900 rounded-xl p-5 border border-neutral-800 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-cyan-500 font-bold text-sm tracking-wider uppercase flex items-center gap-2 drop-shadow-md">
                    {settings.shopName}
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
                
                <div className="flex items-end gap-3 mb-4">
                  <div className="bg-neutral-800/80 p-2 rounded-lg text-cyan-400 border border-neutral-700">
                    <Clock size={24} />
                  </div>
                  <div>
                    <span className="block text-3xl font-bold text-white tracking-tighter leading-none">
                      {isOpen ? (aiInsight?.estimatedWait || "--") : "--"}
                    </span>
                    <span className="text-neutral-400 text-xs font-medium uppercase tracking-wide">
                      {isOpen ? 'tempo estimado' : 'Barbearia Fechada'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 bg-black/40 p-3 rounded-lg border border-neutral-800">
                  <p className="text-cyan-100/90 text-sm font-medium leading-relaxed">
                     {isOpen ? (aiInsight?.message || "Analisando movimento...") : `Horário de hoje: ${getTodayScheduleDisplay()}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center shadow-lg">
                  <span className="block text-2xl font-bold text-white">{peopleWaiting}</span>
                  <span className="text-xs text-neutral-500 uppercase tracking-wide">Na Fila</span>
               </div>
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center shadow-lg">
                  <span className="block text-2xl font-bold text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]">
                    {currentInChair ? '1' : '0'}
                  </span>
                  <span className="text-xs text-neutral-500 uppercase tracking-wide">Cortando</span>
               </div>
            </div>

            {/* Actions */}
            {currentUser && (
                 <button
                    onClick={() => setShowJoinForm(true)}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all mb-8 flex items-center justify-center gap-2 border border-cyan-400/20"
                >
                    <UserPlus size={20} /> Adicionar Cliente (Manual)
                </button>
            )}

            {!currentUser && (
                !isOpen ? (
                    <div className="w-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold text-lg py-4 rounded-xl mb-8 flex items-center justify-center gap-2 opacity-75 cursor-not-allowed">
                        <Lock size={20} /> 
                        <span>Fechado ({getTodayScheduleDisplay()})</span>
                    </div>
                ) : isUserInQueue ? (
                     <div className="mb-8 animate-fade-in">
                        <div className="w-full bg-cyan-950/30 border border-cyan-900 text-cyan-200 text-center py-3 rounded-t-xl flex items-center justify-center gap-2">
                            <Scissors size={20} />
                            <span className="font-bold">Você já está na fila!</span>
                        </div>
                        <button
                            onClick={() => setShowJoinForm(true)}
                            className="w-full bg-neutral-900 border-x border-b border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white text-sm font-medium py-3 rounded-b-xl transition-all flex items-center justify-center gap-2"
                        >
                            <UserPlus size={16} /> Adicionar outra pessoa
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowJoinForm(true)}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] mb-8 flex items-center justify-center gap-2 border border-cyan-400/20"
                    >
                        <Scissors size={20} /> Entrar na Fila
                    </button>
                )
            )}

            {/* List */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {currentUser ? 'Gerenciar Fila' : 'Acompanhar Fila'}
                <span className="text-xs font-normal text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-700">
                  {activeQueue.length}
                </span>
              </h3>

              {activeQueue.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-neutral-800 rounded-xl">
                  <div className="mb-3 opacity-30 flex justify-center text-neutral-500">
                    <Coffee size={48} />
                  </div>
                  <p className="text-neutral-600">Nenhum cliente na fila.</p>
                  {!currentUser && isOpen && <p className="text-cyan-600 mt-2 font-medium">Seja o primeiro!</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  {activeQueue.map((item, index) => (
                    <QueueItemCard
                      key={item.id}
                      item={item}
                      service={services.find(s => s.id === item.serviceId)}
                      position={index + 1}
                      isAdmin={!!currentUser}
                      isCurrentUser={ownedIds.includes(item.id)}
                      onStatusChange={updateQueueStatus}
                      onLeaveQueue={(id) => { leaveQueue(id); showToast('Você saiu da fila.', 'bot'); }}
                    />
                  ))}
                </div>
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
          isStaffMode={!!currentUser}
        />
      )}
    </div>
  );
};

export default App;
