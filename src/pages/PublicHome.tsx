import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QueueItemCard } from '../components/domain/QueueItemCard';
import { AddCustomerForm } from '../components/domain/AddCustomerForm';
import { ShopProfile } from '../components/domain/ShopProfile';
import { AppointmentScheduler } from '../components/domain/AppointmentScheduler';
import { Toast } from '../components/ui/Toast';
import { Header } from '../components/ui/Header';
import { useAuth } from '../contexts/AuthContext';
import { useBarbershop } from '../contexts/BarbershopContext';
import { useBarbershopFilters } from '../contexts/BarbershopFiltersContext';
import { useScheduling } from '../contexts/SchedulingContext';
import { DynamicIcon } from '../components/ui/DynamicIcon';
import { List, CalendarDays, Store, Coffee, Loader2, Clock } from 'lucide-react';
import { LandingPage } from './LandingPage';

export const PublicHome: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { barbershopId } = useBarbershopFilters();
  const { services, settings, staff, feed, addPost, deletePost, likePost, isShopOpen, loading: shopLoading } = useBarbershop();
  const { queue, appointments, aiInsight, joinQueue, leaveQueue, bookAppointment, clientId, loading: schedulingLoading } = useScheduling();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'profile' | 'appointments'>('queue');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'bot'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'bot' = 'success') => {
    setToast({ message: msg, type });
  };

  const handleJoinQueue = async (name: string, whatsapp: string, serviceId: string) => {
    await joinQueue(name, whatsapp, serviceId);
    setShowJoinForm(false);
    showToast('Você entrou na fila!', 'bot');
  };

  if (shopLoading || schedulingLoading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-cyan-500"><Loader2 className="animate-spin" size={40}/></div>;
  }

  // If no barbershop is selected or settings couldn't be loaded, show the product landing page
  if (!barbershopId || !settings) {
    return <LandingPage />;
  }

  const activeQueue = queue.filter(q => q.status !== 'completed' && q.status !== 'cancelled');
  const peopleWaiting = activeQueue.filter(q => q.status === 'waiting').length;
  const currentInChair = activeQueue.find(q => q.status === 'in_chair');
  const isUserInQueue = activeQueue.some(q => q.customerId === clientId);
  const isOpen = isShopOpen();

  return (
    <div className="min-h-screen pb-20 bg-neutral-950 text-neutral-100">

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-md mx-auto px-4 pt-6">
        <div className="flex bg-neutral-900 p-1 rounded-xl mb-6 border border-neutral-800 relative">
            {['queue', 'appointments', 'profile'].map((tab) => (
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

        {activeTab === 'profile' && (
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
            <AppointmentScheduler
                services={services}
                staff={staff}
                settings={settings}
                appointments={appointments}
                onBook={(d) => { bookAppointment(d); showToast('Agendado com sucesso!'); }}
            />
        )}

        {activeTab === 'queue' && (
          <>
            {/* BIG HEADER CARD */}
            <div className="mb-6 bg-neutral-900 rounded-xl p-6 border border-neutral-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-cyan-500/20 transition-all duration-700"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                     <h2 className="text-cyan-500 font-bold text-sm tracking-wider uppercase mb-1 flex items-center gap-2">
                        {settings?.shopName}
                     </h2>
                     <div className="flex items-center gap-2 text-4xl font-bold text-white tracking-tighter">
                        <Clock size={32} className="text-neutral-600" />
                        <span>{aiInsight?.estimatedWait || '0 min'}</span>
                     </div>
                     <span className="text-xs text-neutral-500 uppercase tracking-widest font-semibold ml-1">Tempo Estimado</span>
                  </div>

                  {aiInsight && (
                     <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase border tracking-wide shadow-lg
                       ${!isOpen ? 'bg-neutral-800 text-neutral-400 border-neutral-700' :
                        aiInsight.busyLevel === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/10' :
                         aiInsight.busyLevel === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-amber-500/10' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10'}
                     `}>
                       { !isOpen ? 'Fechado' :
                         aiInsight.busyLevel === 'high' ? 'Movimento Alto' :
                         aiInsight.busyLevel === 'medium' ? 'Movimento Médio' : 'Movimento Tranquilo' }
                     </span>
                  )}
                </div>

                <div className="bg-black/40 rounded-lg p-4 border border-white/5 backdrop-blur-sm">
                  <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                    {aiInsight?.message || "A barbearia está pronta para te receber."}
                  </p>
                </div>
              </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center shadow-lg group hover:border-cyan-500/30 transition-colors">
                  <span className="block text-3xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{peopleWaiting}</span>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Na Fila</span>
               </div>
               <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center shadow-lg group hover:border-green-500/30 transition-colors">
                  <span className="block text-3xl font-bold text-green-400 mb-1 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]">
                    {currentInChair ? '1' : '0'}
                  </span>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Cortando</span>
               </div>
            </div>

            {/* ACTIONS */}
            {!isUserInQueue && (
                !isOpen ? (
                    <div className="w-full bg-neutral-900 border border-neutral-800 text-neutral-500 font-bold text-lg py-4 rounded-xl mb-8 flex items-center justify-center gap-3 opacity-75 cursor-not-allowed">
                        <Coffee size={24} />
                        <span>Fechado hoje</span>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowJoinForm(true)}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] mb-8 flex items-center justify-center gap-3 border border-cyan-400/20 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <span className="relative flex items-center gap-3">
                           <DynamicIcon name="Scissors" size={24} />
                           Entrar na Fila
                        </span>
                    </button>
                )
            )}

            {isUserInQueue && (
                 <div className="mb-8 animate-fade-in">
                    <div className="w-full bg-cyan-950/30 border border-cyan-900/50 text-cyan-200 text-center py-3 rounded-t-xl flex items-center justify-center gap-2">
                        <DynamicIcon name="CheckCircle" size={20} className="text-cyan-400" />
                        <span className="font-bold">Você já está na fila!</span>
                    </div>
                    <button
                        onClick={() => setShowJoinForm(true)}
                        className="w-full bg-neutral-900 border-x border-b border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white text-sm font-medium py-3 rounded-b-xl transition-all flex items-center justify-center gap-2"
                    >
                        <DynamicIcon name="UserPlus" size={16} /> Adicionar outra pessoa
                    </button>
                </div>
            )}

            {/* QUEUE LIST HEADER */}
            <div className="flex items-center gap-3 mb-4">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 Acompanhar Fila
               </h3>
               <span className="text-xs font-bold text-neutral-400 bg-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-700">
                  {peopleWaiting}
               </span>
            </div>

            <div className="space-y-4">
              {activeQueue.length === 0 ? (
                <div className="text-center py-16 bg-neutral-900/50 rounded-2xl border-2 border-dashed border-neutral-800/50 flex flex-col items-center justify-center">
                  <div className="mb-4 text-neutral-700">
                    <Coffee size={48} strokeWidth={1.5} />
                  </div>
                  <p className="text-neutral-500 font-medium">Nenhum cliente na fila.</p>
                  {!isUserInQueue && isOpen && (
                     <button onClick={() => setShowJoinForm(true)} className="text-cyan-500 text-sm font-bold mt-2 hover:underline">
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
                    isCurrentUser={item.customerId === clientId}
                    onStatusChange={() => {}}
                    onLeaveQueue={(id) => { leaveQueue(id); showToast('Você saiu da fila.', 'bot'); }}
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
