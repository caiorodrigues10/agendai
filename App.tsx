import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { QueueItem, Service, AIInsight, ShopSettings, StaffMember, FeedPost } from './types';
import { DEFAULT_SERVICES, MOCK_QUEUE_INITIAL, DEFAULT_SHOP_SETTINGS } from './constants';
import { Header } from './components/Header';
import { QueueItemCard } from './components/QueueItemCard';
import { AddCustomerForm } from './components/AddCustomerForm';
import { ServiceManager } from './components/ServiceManager';
import { SettingsManager } from './components/SettingsManager'; 
import { TeamManager } from './components/TeamManager';
import { FinancialDashboard } from './components/FinancialDashboard';
import { StaffLogin } from './components/StaffLogin';
import { ShopProfile } from './components/ShopProfile';
import { Toast } from './components/Toast'; 
import { getQueueInsight } from './services/geminiService';
import { notifyBarberBot } from './services/notificationService'; 
import { Scissors, Coffee, Clock, Lock, Settings, Sparkles, UserPlus, Users, BarChart3, Store, List } from 'lucide-react';

const App: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string>(''); 
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null); // Logged in Staff
  const [showLogin, setShowLogin] = useState(false);

  // Multi-user/Family support for Customers
  const [ownedIds, setOwnedIds] = useState<string[]>([]);

  // --- Initializers ---
  useEffect(() => {
    let uid = localStorage.getItem('barberUserId');
    if (!uid) {
        uid = uuidv4();
        localStorage.setItem('barberUserId', uid);
    }
    setCurrentUserId(uid);

    const savedOwned = localStorage.getItem('barberOwnedIds');
    if (savedOwned) {
        const parsed = JSON.parse(savedOwned);
        if (!parsed.includes(uid)) parsed.push(uid);
        setOwnedIds(parsed);
    } else {
        setOwnedIds([uid]);
    }
  }, []);

  useEffect(() => {
    if (ownedIds.length > 0) {
        localStorage.setItem('barberOwnedIds', JSON.stringify(ownedIds));
    }
  }, [ownedIds]);
  
  // --- Global States ---
  const [queue, setQueue] = useState<QueueItem[]>(() => {
    const saved = localStorage.getItem('barberQueue');
    return saved ? JSON.parse(saved) : MOCK_QUEUE_INITIAL;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('barberServices');
    return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
  });

  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
    const saved = localStorage.getItem('barberShopSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration check for old settings format
      if (!parsed.schedule) {
        return { ...DEFAULT_SHOP_SETTINGS, shopName: parsed.shopName };
      }
      return parsed;
    }
    return DEFAULT_SHOP_SETTINGS;
  });

  // FEED STATE
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(() => {
    const saved = localStorage.getItem('barberFeed');
    return saved ? JSON.parse(saved) : [
        {
            id: 'mock-1',
            type: 'announcement',
            content: 'Bem-vindo ao novo app da barbearia! Agora você pode acompanhar a fila de casa.',
            createdAt: Date.now() - 10000000,
            likes: 5,
            authorName: 'Admin'
        }
    ];
  });

  // Default Admin Creation
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('barberStaff');
    if (saved) return JSON.parse(saved);
    // Create default admin if none exists
    return [{
        id: 'admin-01',
        name: 'Admin',
        pin: '1234', // Default PIN
        role: 'admin'
    }];
  });

  // UI States
  const [showJoinForm, setShowJoinForm] = useState(false);
  
  // Tabs: 'queue' (default), 'profile' (public), others (admin)
  const [activeTab, setActiveTab] = useState<'queue' | 'profile' | 'services' | 'settings' | 'team' | 'reports'>('queue'); 
  
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'bot'} | null>(null);

  // --- Persistence ---
  useEffect(() => { localStorage.setItem('barberQueue', JSON.stringify(queue)); }, [queue]);
  useEffect(() => { localStorage.setItem('barberServices', JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem('barberShopSettings', JSON.stringify(shopSettings)); }, [shopSettings]);
  useEffect(() => { localStorage.setItem('barberStaff', JSON.stringify(staffMembers)); }, [staffMembers]);
  useEffect(() => { localStorage.setItem('barberFeed', JSON.stringify(feedPosts)); }, [feedPosts]);

  // --- AI Insights ---
  useEffect(() => {
    const fetchInsight = async () => {
      const insight = await getQueueInsight(queue, services);
      setAiInsight(insight);
    };
    // Fetch initial
    fetchInsight();
    
    // Refresh periodically - Increased interval to save image gen cost/quota
    const intervalId = setInterval(fetchInsight, 15000); 
    return () => clearInterval(intervalId);
  }, [queue, services, refreshKey]);

  // --- Logic for Shop Availability ---
  const isShopOpen = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const todaySchedule = shopSettings.schedule[day];

    if (!todaySchedule || !todaySchedule.isOpen) return false;

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMinute] = todaySchedule.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = todaySchedule.closeTime.split(':').map(Number);
    
    const openTimeMinutes = openHour * 60 + openMinute;
    const closeTimeMinutes = closeHour * 60 + closeMinute;

    return currentTime >= openTimeMinutes && currentTime < closeTimeMinutes;
  };

  const getTodayScheduleDisplay = () => {
    const now = new Date();
    const day = now.getDay();
    const todaySchedule = shopSettings.schedule[day];
    
    if (!todaySchedule) return 'Horário indisponível';
    if (!todaySchedule.isOpen) return 'Fechado hoje';
    return `${todaySchedule.openTime} às ${todaySchedule.closeTime}`;
  };

  // --- Queue Handlers ---
  const handleJoinQueue = async (name: string, whatsapp: string, serviceId: string, isManualEntry: boolean = false) => {
    
    // If Manual Entry (Staff), generate a random ID.
    // If Customer Entry, check ownership.
    let newItemId;
    if (isManualEntry) {
        newItemId = uuidv4();
    } else {
        const isMainIdBusy = queue.some(q => q.id === currentUserId && q.status === 'waiting');
        newItemId = isMainIdBusy ? uuidv4() : currentUserId;
        if (!ownedIds.includes(newItemId)) setOwnedIds(prev => [...prev, newItemId]);
    }

    const newItem: QueueItem = {
      id: newItemId,
      customerName: name,
      whatsapp: whatsapp,
      serviceId,
      joinedAt: Date.now(),
      status: 'waiting',
      addedByStaff: isManualEntry
    };
    
    setQueue(prev => [...prev, newItem]);
    setShowJoinForm(false);

    const serviceName = services.find(s => s.id === serviceId)?.name || 'Serviço';

    if (isManualEntry) {
        setToast({ message: "Cliente adicionado manualmente!", type: 'success' });
    } else {
        // Only notify bot if customer joined themselves
        const msg = `*Novo Cliente na Fila*\nNome: ${name}\nServiço: ${serviceName}\nContato: ${whatsapp}`;
        setToast({ message: "Entrando na fila...", type: 'bot' });
        await notifyBarberBot(msg);
        setToast({ message: "Pronto! O Robô avisou o barbeiro.", type: 'bot' });
    }
  };

  const handleStatusChange = (id: string, newStatus: QueueItem['status']) => {
    setQueue(prev => prev.map(item => {
        if (item.id !== id) return item;

        const update: Partial<QueueItem> = { status: newStatus };
        
        // If completing, save the timestamp, current user ID, and price snapshot
        if (newStatus === 'completed') {
            const service = services.find(s => s.id === item.serviceId);
            update.completedAt = Date.now();
            update.completedBy = currentUser?.id; // Track who finished the job
            update.finalPrice = service?.price || 0; // Snapshot price
        }

        return { ...item, ...update };
    }));
  };

  const handleLeaveQueue = async (id: string) => {
      const itemLeaving = queue.find(q => q.id === id);
      setQueue(prev => prev.filter(item => item.id !== id));

      if (itemLeaving && !itemLeaving.addedByStaff) {
          setToast({ message: "Saindo da fila...", type: 'bot' });
          const msg = `*Cliente Saiu da Fila*\nNome: ${itemLeaving.customerName}\nMotivo: Cancelamento pelo usuário`;
          await notifyBarberBot(msg);
          setToast({ message: "Você saiu da fila. O barbeiro foi avisado.", type: 'bot' });
      }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
    setToast({ message: "Registro excluído do histórico.", type: 'success' });
  };

  // --- Feed Handlers ---
  const handleAddPost = (post: FeedPost) => {
    setFeedPosts(prev => [post, ...prev]);
    setToast({ message: "Post publicado!", type: 'success' });
  };

  const handleDeletePost = (id: string) => {
      if(confirm("Apagar post?")) {
        setFeedPosts(prev => prev.filter(p => p.id !== id));
      }
  };

  const handleLikePost = (id: string) => {
    setFeedPosts(prev => prev.map(post => 
        post.id === id ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  // --- Service & Team Handlers ---
  const handleAddService = (data: Omit<Service, 'id'>) => setServices(prev => [...prev, { id: uuidv4(), ...data }]);
  const handleEditService = (id: string, data: Omit<Service, 'id'>) => setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  const handleDeleteService = (id: string) => setServices(prev => prev.filter(s => s.id !== id));
  const handleSaveSettings = (newSettings: ShopSettings) => { setShopSettings(newSettings); setToast({ message: "Configurações salvas!", type: 'success' }); };
  const handleUpdateTeam = (newTeam: StaffMember[]) => { setStaffMembers(newTeam); setToast({ message: "Equipe atualizada!", type: 'success' }); };

  // --- Computed Data ---
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
        onLogout={() => { setCurrentUser(null); setActiveTab('queue'); }}
        logoUrl={shopSettings.logoUrl}
      />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {showLogin && (
        <StaffLogin 
            staffMembers={staffMembers} 
            onLogin={(user) => {
                setCurrentUser(user);
                // Redirect to reports if admin logs in, else queue
                if (user.role === 'admin') setActiveTab('queue'); 
            }}
            onClose={() => setShowLogin(false)}
            logoUrl={shopSettings.logoUrl}
        />
      )}

      <main className="max-w-md mx-auto px-4 pt-6">
        
        {/* TOP NAVIGATION (FOR EVERYONE) */}
        <div className="flex bg-neutral-900 p-1 rounded-xl mb-6 border border-neutral-800 relative">
            <button 
                onClick={() => setActiveTab('queue')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 z-10 relative
                    ${activeTab === 'queue' ? 'text-white' : 'text-neutral-500'}
                `}
            >
                <List size={16} /> Fila
            </button>
            <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 z-10 relative
                    ${activeTab === 'profile' ? 'text-white' : 'text-neutral-500'}
                `}
            >
                <Store size={16} /> Perfil
            </button>
            
            {/* Sliding Background */}
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-neutral-800 rounded-lg transition-all duration-300 ${activeTab === 'profile' ? 'left-[calc(50%+2px)]' : 'left-1'}`}></div>
        </div>

        {/* STAFF NAVIGATION (ADDITIONAL TABS) */}
        {currentUser && (
          <div className="flex gap-2 mb-6 bg-neutral-900 p-1 rounded-lg border border-neutral-800 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('reports')}
              className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'reports' ? 'bg-neutral-800 text-cyan-400 shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
            >
               <BarChart3 size={16} /> Relatórios
            </button>
            
            {/* Admin Only Tabs */}
            {currentUser.role === 'admin' && (
                <>
                    <button 
                    onClick={() => setActiveTab('services')}
                    className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'services' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                    >
                    <Scissors size={16} /> Serviços
                    </button>
                    <button 
                    onClick={() => setActiveTab('team')}
                    className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeTab === 'team' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                    >
                    <Users size={16} /> Equipe
                    </button>
                    <button 
                    onClick={() => setActiveTab('settings')}
                    className={`w-12 py-2 flex items-center justify-center rounded-md transition-all ${activeTab === 'settings' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                    >
                    <Settings size={18} />
                    </button>
                </>
            )}
          </div>
        )}

        {/* --- CONTENT ROUTER --- */}

        {/* 1. PUBLIC/STAFF: PROFILE & FEED */}
        {activeTab === 'profile' && (
            <ShopProfile 
                settings={shopSettings}
                posts={feedPosts}
                currentUser={currentUser}
                onAddPost={handleAddPost}
                onDeletePost={handleDeletePost}
                onLikePost={handleLikePost}
            />
        )}

        {/* 2. ADMIN: SETTINGS */}
        {currentUser?.role === 'admin' && activeTab === 'settings' && (
            <SettingsManager settings={shopSettings} onSave={handleSaveSettings} />
        )}

        {/* 3. ADMIN: SERVICES */}
        {currentUser?.role === 'admin' && activeTab === 'services' && (
            <ServiceManager services={services} onAdd={handleAddService} onEdit={handleEditService} onDelete={handleDeleteService} />
        )}

        {/* 4. ADMIN: TEAM */}
        {currentUser?.role === 'admin' && activeTab === 'team' && (
            <TeamManager staff={staffMembers} onUpdateTeam={handleUpdateTeam} currentAdminId={currentUser.id} />
        )}

        {/* 5. REPORTS / FINANCIAL */}
        {currentUser && activeTab === 'reports' && (
            <FinancialDashboard 
                queueHistory={queue} 
                services={services} 
                currentUser={currentUser}
                allStaff={staffMembers}
                onDeleteHistoryItem={handleDeleteHistoryItem}
            />
        )}

        {/* 6. QUEUE VIEW (DEFAULT) */}
        {activeTab === 'queue' && (
          <>
            {/* AI Insight Banner */}
            <div className="mb-6 bg-neutral-900 rounded-xl p-5 border border-neutral-800 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-cyan-500 font-bold text-sm tracking-wider uppercase flex items-center gap-2 drop-shadow-md">
                    {shopSettings.shopName}
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

            {/* Current Status Overview */}
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

            {/* ACTIONS: CUSTOMER OR STAFF */}
            
            {/* STAFF ACTION: MANUAL ADD */}
            {currentUser && (
                 <button
                    onClick={() => setShowJoinForm(true)}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all mb-8 flex items-center justify-center gap-2 border border-cyan-400/20"
                >
                    <UserPlus size={20} /> Adicionar Cliente (Manual)
                </button>
            )}

            {/* CUSTOMER ACTION: JOIN */}
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

            {/* Queue List */}
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
                      onStatusChange={handleStatusChange}
                      onLeaveQueue={handleLeaveQueue}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </main>

      {/* Modals */}
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