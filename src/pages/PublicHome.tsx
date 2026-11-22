import React, { Suspense, useCallback, useState } from 'react';
import { LuCoffee as Coffee, LuStore as Store } from 'react-icons/lu';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PublicProductCarousel } from '../components/domain/PublicProductCarousel';
import { SeoHead } from '../components/marketing/SeoHead';
import { Tabs } from '../components/patterns';
import { PublicPageSkeleton } from '../components/patterns/skeletons';
import { DynamicIcon } from '../components/ui/DynamicIcon';
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useBarbershop } from '../contexts/BarbershopContext';
import { useBarbershopFilters } from '../contexts/BarbershopFiltersContext';
import { useScheduling } from '../contexts/SchedulingContext';
import { ShopPageTheme, usePageTheme } from '../features/appearance';
import { AppointmentScheduler } from '../features/appointments/AppointmentScheduler';
// Import direto do módulo (sem barrel): a barrel {features/clients} puxava
// ClientsTab → CrmIntelligencePanel → ui/chart (77,9 kB) para o chunk da fila.
import { AddCustomerForm } from '../features/clients/AddCustomerForm';
import { QueueItemCard, QueueStatusCard } from '../features/queue';
import { useSegmentLabels } from '../hooks/useSegmentLabels';
import { useSalonTrafficTabBeacon } from '../hooks/useSalonTrafficTabBeacon';
import { API_BASE } from '../infra/apiClient';
import { productsApi, PublicSaleProduct } from '../infra/productsApi';
import { schedulingApi } from '../infra/schedulingApi';
import { sanitizeSalonTrafficTab } from '../infra/trafficBeaconApi';
import { buildCoverOgUrl } from '../shared/coverImage';
import { visiblePublicTabs, type PublicTab } from '../shared/publicTabs';

// Perfil não é crítico (aba não padrão): sai do closure inicial da rota.
const ShopProfile = React.lazy(() =>
  import('../features/shop/ShopProfile').then(m => ({ default: m.ShopProfile }))
);

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
    deletePost,
    likePost,
    isShopOpen,
    isQueueClosed,
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
  const { labels } = useSegmentLabels(settings?.businessSegment ?? null);
  const { loading: themeLoading, theme: pageTheme } = usePageTheme(barbershopId);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinMode, setJoinMode] = useState<'self' | 'dependent'>('self');
  const operationMode = settings?.operationMode ?? 'HYBRID';
  // Serviço interno (audiência, diligência, despacho) não é agendável pelo
  // cliente: sai da agenda pública.
  const publicServices = React.useMemo(
    () => services.filter(service => service.publicBookable !== false),
    [services]
  );
  const tabs = React.useMemo(() => visiblePublicTabs(operationMode), [operationMode]);
  // A aba inicial respeita o deep link (`/queue/:id?tab=…`): assim o beacon da
  // página envia `kind:'visit'` já com a aba resolvida desde o primeiro render.
  const [activeTab, setActiveTab] = useState<PublicTab>(() => {
    const requested = searchParams.get('tab');
    // Link legado da antiga sub-aba "Fotos": abre o perfil já em Publicações.
    if (requested === 'fotos') return 'profile';
    const fromQuery = sanitizeSalonTrafficTab(requested);
    return fromQuery && tabs.includes(fromQuery) ? fromQuery : tabs[0];
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'bot' } | null>(null);
  const [publicSlots, setPublicSlots] = useState<string[] | undefined>();
  const [publicProducts, setPublicProducts] = useState<PublicSaleProduct[]>([]);

  // Atribui a visita (exatamente 1 `kind:'visit'` por carregamento) e cada
  // troca de aba (`kind:'tab'`) ao salão público desta URL. O listener global
  // não emite para `/queue/:id` — este hook é o único emissor dessa rota.
  useSalonTrafficTabBeacon({ pathname: `/queue/${id ?? ''}`, tab: activeTab });

  const handleDateChange = useCallback(
    (date: string, staffId?: string, serviceId?: string) => {
      loadAvailability(date, staffId);
      if (!serviceId || !barbershopId) {
        setPublicSlots(undefined);
        return;
      }
      schedulingApi
        .getAppointmentSlots(barbershopId, serviceId, date, staffId)
        .then(slots => setPublicSlots(slots.map(slot => slot.time)))
        .catch(() => setPublicSlots([]));
    },
    [barbershopId, loadAvailability]
  );

  React.useEffect(() => {
    if (id && id !== barbershopId) {
      setBarbershopId(id);
    }
  }, [id, barbershopId, setBarbershopId]);

  React.useEffect(() => {
    if (!barbershopId) {
      setPublicProducts([]);
      return;
    }

    productsApi
      .listPublicSaleProducts(barbershopId)
      .then(products => setPublicProducts(Array.isArray(products) ? products : []))
      .catch(() => setPublicProducts([]));
  }, [barbershopId]);

  // Deep links used by the salon's public QR codes and post CTAs. O modo do
  // salão é autoritativo: se a aba atual deixou de existir (por exemplo, Fila
  // em um salão só de agenda), caímos na primeira aba permitida.
  React.useEffect(() => {
    const requested = searchParams.get('tab');
    const requestedTab = requested === 'fotos' ? 'profile' : sanitizeSalonTrafficTab(requested);
    setActiveTab(current => {
      if (requestedTab && tabs.includes(requestedTab)) return requestedTab;
      return tabs.includes(current) ? current : tabs[0];
    });
  }, [searchParams, tabs]);

  const showToast = (msg: string, type: 'success' | 'bot' = 'success') => {
    setToast({ message: msg, type });
  };

  const handleJoinQueue = async (name: string, whatsapp: string, serviceId: string) => {
    const asDependent = joinMode === 'dependent';
    await joinQueue(name, whatsapp, serviceId, { additionalPerson: asDependent });
    setShowJoinForm(false);
    showToast(asDependent ? 'Dependente adicionado à fila!' : 'Você entrou na fila!', 'bot');
  };

  const openJoinForm = (mode: 'self' | 'dependent') => {
    setJoinMode(mode);
    setShowJoinForm(true);
  };

  // Wait until URL tenant is applied before deciding to redirect.
  // themeLoading evita flash do tema padrão (FOUC) quando o salão tem tema salvo.
  const pendingUrlShop = Boolean(id) && id !== barbershopId;
  const stillLoading = pendingUrlShop || shopLoading || schedulingLoading || themeLoading;

  // ITEM 4 — métrica de conteúdo útil: marca o instante em que a página
  // pública sai do estado de carregamento e renderiza conteúdo real (ou o
  // estado vazio explícito). duração = public-content-usable (ms desde
  // timeOrigin). Só a primeira transição por montagem.
  const contentMarkedRef = React.useRef(false);
  React.useEffect(() => {
    if (stillLoading || contentMarkedRef.current) return;
    contentMarkedRef.current = true;
    performance.mark('public-content-ready');
    performance.measure('public-content-usable', { start: 0, end: 'public-content-ready' });
  }, [stillLoading]);

  if (stillLoading) {
    return (
      <div role="status" aria-label="Carregando salão">
        <PublicPageSkeleton />
      </div>
    );
  }

  // /queue without id → landing. /queue/:id with failed load → explicit empty state.
  if (!barbershopId || !settings) {
    if (id) {
      return (
        <div className="min-h-dvh bg-bg text-text-primary flex flex-col items-center justify-center gap-4 px-6 text-center">
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
            className="min-h-11 inline-flex items-center px-4 py-2 rounded-xl bg-accent text-accent-fg text-sm font-bold"
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
  const queueClosed = isQueueClosed();
  const canJoinQueue = isOpen && !queueClosed;
  const closedBanner = !isOpen
    ? settings.openState?.reason === 'MANUAL_MODE_NOT_OPENED'
      ? `${labels.segmentLabel} ainda não abriu hoje.`
      : 'Fechado no momento'
    : queueClosed
      ? 'Fila encerrada por hoje'
      : null;

  return (
    <ShopPageTheme barbershopId={barbershopId}>
      {barbershopId && (
        <SeoHead
          title={settings?.shopName ? `${settings.shopName} — Agenda Já` : 'Agenda Já'}
          description={
            settings?.shopName
              ? `Fila, agenda e serviços de ${settings.shopName}. Agende pelo Agenda Já.`
              : 'Fila, agenda e serviços. Agende pelo Agenda Já.'
          }
          path={`/queue/${barbershopId}`}
          image={
            pageTheme?.coverUrl
              ? buildCoverOgUrl(pageTheme.coverUrl, {
                  focalX: pageTheme.coverFocalX,
                  focalY: pageTheme.coverFocalY,
                  originalWidth: pageTheme.coverWidth,
                  originalHeight: pageTheme.coverHeight,
                })
              : `${API_BASE}/api/barbershops/${barbershopId}/page-theme/og-image`
          }
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="@container">
        <main className="mx-auto max-w-md px-4 pt-6 @min-[640px]:max-w-xl @min-[768px]:max-w-3xl @min-[1024px]:max-w-4xl">
          <Tabs<PublicTab>
            ariaLabel="Navegação do salão"
            items={tabs.map(id => ({
              id,
              label: id === 'queue' ? 'Fila' : id === 'appointments' ? 'Agenda' : 'Perfil',
            }))}
            value={activeTab}
            onChange={setActiveTab}
            activeClassName="bg-accent-active-bg text-accent-active-fg !border-accent-active-border"
          >
            {activeTab === 'profile' && (
              <Suspense fallback={<PublicPageSkeleton />}>
                <ShopProfile
                  settings={settings}
                  posts={feed}
                  currentUser={user}
                  audience="public"
                  onGoQueue={() => setActiveTab('queue')}
                  onGoAppointments={() => setActiveTab('appointments')}
                  onDeletePost={deletePost}
                  onLikePost={likePost}
                />
              </Suspense>
            )}

            {activeTab === 'appointments' && (
              <AppointmentScheduler
                services={services}
                staff={staff}
                settings={settings}
                occupancy={availability}
                availableSlots={publicSlots}
                publicProducts={publicProducts}
                onBook={async d => {
                  try {
                    const created = await bookAppointmentPublic(d);
                    showToast('Agendado com sucesso!');
                    return created;
                  } catch (err) {
                    const { getErrorMessage } = await import('../utils/errorMessage');
                    showToast(
                      getErrorMessage(err, 'Não foi possível agendar. Tente outro horário.'),
                      'bot'
                    );
                    throw err;
                  }
                }}
                onDateChange={handleDateChange}
              />
            )}

            {/* Reserva de produtos: conteúdo extra da aba Agenda e da aba Perfil
            (em QUEUE_ONLY só existe Perfil; a aba Fila nunca mostra o carrossel). */}
            {(activeTab === 'appointments' || activeTab === 'profile') && (
              <PublicProductCarousel barbershopId={barbershopId} />
            )}

            {activeTab === 'queue' && (
              <>
                <QueueStatusCard
                  shopName={settings?.shopName}
                  isOpen={isOpen}
                  queueClosed={queueClosed}
                  insight={aiInsight}
                />

                {closedBanner && (
                  <div className="mb-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
                    <p className="font-bold text-text-primary">{closedBanner}</p>
                    <p className="text-xs mt-1">
                      {!isOpen
                        ? 'A entrada na fila está indisponível até o salão reabrir.'
                        : 'Quem já está na fila continua sendo atendido. Agendamentos seguem liberados.'}
                    </p>
                  </div>
                )}

                {/* STATS GRID */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-surface p-4 rounded-xl border border-border text-center shadow-lg group">
                    <span className="block text-3xl font-bold text-text-primary mb-1">
                      {peopleWaiting}
                    </span>
                    <span className="text-2xs text-text-muted uppercase tracking-widest font-bold">
                      Na Fila
                    </span>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-border text-center shadow-lg group">
                    <span className="block text-3xl font-bold text-tertiary mb-1">
                      {currentInChair ? '1' : '0'}
                    </span>
                    <span className="text-2xs text-text-muted uppercase tracking-widest font-bold">
                      Em Atendimento
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="mb-8 space-y-2">
                  {!isUserInQueue &&
                    (!canJoinQueue ? (
                      <div className="w-full bg-surface border border-border text-text-muted font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-3 opacity-75 cursor-not-allowed">
                        <Coffee size={24} />
                        <span>
                          {queueClosed && isOpen ? 'Fila encerrada por hoje' : 'Fechado no momento'}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openJoinForm('self')}
                        className="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl border !border-accent-active-border bg-accent-active-bg py-4 text-lg font-bold text-accent-active-fg shadow-lg transition-all hover:scale-[1.02] hover:bg-accent-action-hover hover:shadow-xl active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transform-none motion-reduce:transition-none"
                      >
                        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full motion-reduce:hidden"></div>
                        <span className="relative flex items-center gap-3">
                          <DynamicIcon name="Scissors" size={24} />
                          Entrar na Fila
                        </span>
                      </button>
                    ))}

                  {isUserInQueue && (
                    <div className="w-full bg-selection border border-accent/30 text-text-primary text-center py-3 rounded-xl flex items-center justify-center gap-2">
                      <DynamicIcon name="CheckCircle" size={20} className="text-success" />
                      <span className="font-bold">Você já está na fila!</span>
                    </div>
                  )}

                  {canJoinQueue && isUserInQueue && (
                    <button
                      type="button"
                      onClick={() => openJoinForm('dependent')}
                      className="w-full bg-surface border border-border hover:border-accent/50 hover:bg-surface-2 text-text-primary text-sm font-bold py-3.5 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <DynamicIcon name="UserPlus" size={16} className="text-tertiary" />
                        Adicionar dependente
                      </span>
                      <span className="text-2xs font-medium text-text-muted">
                        Filho, parceiro ou quem veio junto — sem entrar de novo
                      </span>
                    </button>
                  )}
                </div>

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
                      {!isUserInQueue && canJoinQueue && (
                        <button
                          type="button"
                          onClick={() => openJoinForm('self')}
                          className="mt-2 cursor-pointer text-sm font-bold text-text-secondary hover:text-text-primary hover:underline"
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
          </Tabs>
        </main>
      </div>

      {showJoinForm && (
        <AddCustomerForm
          services={services}
          onJoin={handleJoinQueue}
          onCancel={() => setShowJoinForm(false)}
          isAdditionalPerson={joinMode === 'dependent'}
        />
      )}
    </ShopPageTheme>
  );
};

export default PublicHome;
