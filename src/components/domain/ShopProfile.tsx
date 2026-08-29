import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopSettings, FeedPost, StaffMember, Service, DaySchedule } from '../../types';
import {
  Type,
  Send,
  Trash2,
  Heart,
  Image as ImageIcon,
  MapPin,
  Star,
  Scissors,
  MoreHorizontal,
  Film,
  X,
  Clock,
  MessageCircle,
  List,
  CalendarDays,
  ExternalLink,
  Camera,
  Loader2,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { barbershopApi } from '../../infra/barbershopApi';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface ShopProfileProps {
  settings: ShopSettings;
  posts: FeedPost[];
  currentUser: StaffMember | null;
  onAddPost: (post: FeedPost) => void;
  onDeletePost: (id: string) => void;
  onLikePost: (id: string) => void;
  /** Perfil do cliente no link público vs. aba Perfil da equipe. */
  audience?: 'public' | 'staff';
  onGoQueue?: () => void;
  onGoAppointments?: () => void;
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

function waLink(phone: string): string | null {
  const d = digitsOnly(phone);
  if (d.length < 10) return null;
  const withCc = d.startsWith('55') ? d : `55${d.replace(/^0/, '')}`;
  return `https://wa.me/${withCc}`;
}

function formatBrPhone(phone: string): string {
  const d = digitsOnly(phone);
  const local = d.startsWith('55') && d.length > 11 ? d.slice(2) : d;
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return phone;
}

function shopInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase() || 'S'
  );
}

function todaySchedule(schedule: DaySchedule[] | undefined): DaySchedule | null {
  if (!schedule?.length) return null;
  return schedule[new Date().getDay()] ?? null;
}

export const ShopProfile: React.FC<ShopProfileProps> = ({
  settings,
  posts,
  currentUser,
  onAddPost,
  onDeletePost,
  onLikePost,
  audience = 'public',
  onGoQueue,
  onGoAppointments,
  onNotify,
}) => {
  const navigate = useNavigate();
  const { services, isShopOpen, getTodayScheduleDisplay } = useBarbershop();
  const { barbershopId } = useBarbershopFilters();
  const isPublic = audience === 'public';
  const open = isShopOpen();
  const today = todaySchedule(settings.schedule);
  const hoursLabel = getTodayScheduleDisplay();
  const whatsappUrl = settings.whatsapp ? waLink(settings.whatsapp) : null;
  const canCompose =
    !isPublic &&
    Boolean(
      currentUser &&
        (currentUser.role === 'OWNER' ||
          currentUser.role === 'EMPLOYEE' ||
          currentUser.role === 'MASTER_ADMIN')
    );

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostType, setNewPostType] = useState<'haircut' | 'beard' | 'announcement'>('haircut');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newPostVideoUrl, setNewPostVideoUrl] = useState<string | null>(null);
  const [newPostVideoPreview, setNewPostVideoPreview] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewObjectUrl = useRef<string | null>(null);

  const canEditLogo =
    audience === 'staff' && Boolean(currentUser && currentUser.role === 'OWNER');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(settings.logoUrl);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogoUrl(settings.logoUrl);
  }, [settings.logoUrl]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !barbershopId) return;

    setLogoUploading(true);
    setLogoError(null);
    try {
      const { uploadUrl, publicUrl } = await barbershopApi.getLogoUploadUrl(
        barbershopId,
        file.type
      );
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!putRes.ok) {
        throw new Error(
          `Falha ao enviar a imagem para o storage (${putRes.status}).`
        );
      }
      await barbershopApi.confirmLogo(barbershopId, publicUrl);
      setLogoUrl(publicUrl);
      onNotify?.('Logo atualizada com sucesso!', 'success');
    } catch (err) {
      setLogoUrl(settings.logoUrl);
      const msg = getErrorMessage(err, 'Não foi possível enviar a logo. Tente novamente.');
      setLogoError(msg);
      onNotify?.(msg, 'error');
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteLogo = async () => {
    if (!barbershopId || !logoUrl) return;
    if (!confirm('Remover a logo do salão?')) return;

    setLogoUploading(true);
    setLogoError(null);
    try {
      await barbershopApi.deleteLogo(barbershopId);
      setLogoUrl(undefined);
      onNotify?.('Logo removida.', 'success');
    } catch (err) {
      const msg = getErrorMessage(err, 'Erro ao remover a logo.');
      setLogoError(msg);
      onNotify?.(msg, 'error');
    } finally {
      setLogoUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (videoPreviewObjectUrl.current) {
        URL.revokeObjectURL(videoPreviewObjectUrl.current);
      }
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoError(null);

    if (file.size > 25 * 1024 * 1024) {
      setVideoError('Arquivo muito grande. Máximo: 25 MB');
      return;
    }

    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = async () => {
      if (video.duration > 60) {
        URL.revokeObjectURL(objectUrl);
        setVideoError('Vídeo muito longo. Máximo: 60 segundos');
        return;
      }

      if (videoPreviewObjectUrl.current) {
        URL.revokeObjectURL(videoPreviewObjectUrl.current);
      }
      videoPreviewObjectUrl.current = objectUrl;
      setNewPostVideoPreview(objectUrl);

      try {
        if (!currentUser?.barbershopId) return;
        const result = await barbershopApi.uploadPostVideo(currentUser.barbershopId, file);
        setNewPostVideoUrl(result.videoUrl);
      } catch (err) {
        setVideoError(err instanceof Error ? err.message : 'Erro ao enviar vídeo');
        setNewPostVideoPreview(null);
        if (videoPreviewObjectUrl.current) {
          URL.revokeObjectURL(videoPreviewObjectUrl.current);
          videoPreviewObjectUrl.current = null;
        }
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setVideoError('Formato de vídeo não suportado');
    };
  };

  const handleRemoveVideo = () => {
    if (videoPreviewObjectUrl.current) {
      URL.revokeObjectURL(videoPreviewObjectUrl.current);
      videoPreviewObjectUrl.current = null;
    }
    setNewPostVideoPreview(null);
    setNewPostVideoUrl(null);
    setVideoError(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent && !newPostImage && !newPostVideoUrl && !newPostTitle) return;

    setIsPosting(true);

    const post: FeedPost = {
      id: uuidv4(),
      type: newPostType,
      title: newPostTitle,
      content: newPostContent,
      imageUrl: newPostImage || undefined,
      videoUrl: newPostVideoUrl || undefined,
      createdAt: Date.now(),
      likes: 0,
      authorName: currentUser?.name || 'Equipe',
    };

    setTimeout(() => {
      onAddPost(post);
      setNewPostContent('');
      setNewPostTitle('');
      setNewPostImage(null);
      handleRemoveVideo();
      setIsPosting(false);
    }, 500);
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'haircut':
        return 'Look da Semana';
      case 'beard':
        return 'Barba / Acabamento';
      case 'announcement':
        return 'Aviso';
      default:
        return 'Post';
    }
  };

  const getPostTypeStyle = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'beard':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'haircut':
      default:
        return 'bg-success/10 text-success border-success/20';
    }
  };

  const listedServices: Service[] = services.slice(0, 8);
  const extraServiceCount = Math.max(0, services.length - listedServices.length);

  return (
    <div className="animate-fade-in space-y-5 pb-20">
      <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-lg relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-accent z-20" />
        <div className="h-28 bg-gradient-to-br from-accent/25 via-surface to-surface relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-10 -right-8 h-40 w-40 rounded-full bg-accent/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-accent/10 blur-3xl"
            aria-hidden
          />
        </div>

        <div className="px-5 pb-5 -mt-12 relative text-center">
          <div className="mx-auto mb-3 w-24 h-24">
            {canEditLogo ? (
              <div className="relative group w-full h-full rounded-2xl border-4 border-surface bg-bg shadow-lg overflow-hidden flex items-center justify-center">
                {logoUploading ? (
                  <Loader2 size={28} className="text-accent animate-spin" />
                ) : logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={settings.shopName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black tracking-tight text-accent">
                    {shopInitials(settings.shopName)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <Camera size={24} className="text-white" />
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={logoUploading}
                />
              </div>
            ) : (
              <div className="w-full h-full rounded-2xl border-4 border-surface bg-bg shadow-lg overflow-hidden flex items-center justify-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={settings.shopName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black tracking-tight text-accent">
                    {shopInitials(settings.shopName)}
                  </span>
                )}
              </div>
            )}
          </div>

          {canEditLogo && logoUrl && !logoUploading && (
            <button
              type="button"
              onClick={handleDeleteLogo}
              className="mx-auto mb-2 px-3 py-1.5 text-[11px] font-medium text-danger bg-danger/10 rounded-lg border border-danger/20 hover:bg-danger/20 transition-colors flex items-center gap-1"
            >
              <Trash2 size={12} /> Remover logo
            </button>
          )}
          {logoError && (
            <p className="mx-auto mb-2 text-[11px] text-danger max-w-[200px]">{logoError}</p>
          )}

          <h1 className="text-2xl font-bold text-text-primary tracking-tight">{settings.shopName}</h1>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                open
                  ? 'bg-success/15 text-success border-success/30'
                  : 'bg-surface-2 text-text-secondary border-border-strong'
              }`}
            >
              {open ? 'Aberto agora' : 'Fechado'}
            </span>
            {hoursLabel && (
              <span className="text-[11px] font-bold text-text-secondary flex items-center gap-1">
                <Clock size={12} className="text-accent" />
                {today?.isOpen ? `Hoje ${hoursLabel}` : hoursLabel}
              </span>
            )}
          </div>

          {settings.address && (
            <p className="mt-3 text-sm text-text-secondary flex items-center justify-center gap-1.5">
              <MapPin size={14} className="text-accent shrink-0" />
              <span>{settings.address}</span>
            </p>
          )}

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            {isPublic && (
              <>
                <button
                  type="button"
                  onClick={() => onGoQueue?.()}
                  className="flex-1 px-4 py-3 rounded-xl bg-accent text-accent-fg text-sm font-bold flex items-center justify-center gap-2 hover:bg-accent-hover shadow-lg shadow-accent/20"
                >
                  <List size={16} /> Entrar na fila
                </button>
                <button
                  type="button"
                  onClick={() => onGoAppointments?.()}
                  className="flex-1 px-4 py-3 rounded-xl bg-bg border border-border text-text-primary text-sm font-bold flex items-center justify-center gap-2 hover:border-accent"
                >
                  <CalendarDays size={16} /> Agendar
                </button>
              </>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  isPublic ? 'sm:flex-none' : 'flex-1'
                } px-4 py-3 rounded-xl bg-bg border border-border text-text-primary text-sm font-bold flex items-center justify-center gap-2 hover:border-accent`}
              >
                <MessageCircle size={16} className="text-accent" />
                {isPublic ? 'WhatsApp' : formatBrPhone(settings.whatsapp)}
              </a>
            )}
          </div>

          {isPublic && settings.whatsapp && (
            <p className="mt-2 text-[11px] text-text-muted">{formatBrPhone(settings.whatsapp)}</p>
          )}

          {!isPublic && barbershopId && (
            <button
              type="button"
              onClick={() => navigate(`/queue/${barbershopId}`)}
              className="mt-3 text-[11px] font-bold text-accent inline-flex items-center gap-1 hover:underline"
            >
              <ExternalLink size={12} /> Ver como o cliente vê
            </button>
          )}
        </div>
      </div>

      {settings.schedule?.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
          <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <Clock size={16} className="text-accent" /> Horários
          </h2>
          <div className="space-y-1.5">
            {settings.schedule.map((day, index) => {
              const isToday = index === new Date().getDay();
              return (
                <div
                  key={day.dayName}
                  className={`flex items-center justify-between text-sm rounded-lg px-2 py-1.5 ${
                    isToday ? 'bg-accent/10' : ''
                  }`}
                >
                  <span
                    className={`font-bold ${isToday ? 'text-accent' : 'text-text-secondary'}`}
                  >
                    {day.dayName}
                    {isToday ? ' · hoje' : ''}
                  </span>
                  <span className={day.isOpen ? 'text-text-primary' : 'text-text-muted'}>
                    {day.isOpen ? `${day.openTime} – ${day.closeTime}` : 'Fechado'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {listedServices.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
          <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <Scissors size={16} className="text-accent" /> Serviços
          </h2>
          <ul className="divide-y divide-border">
            {listedServices.map(service => (
              <li key={service.id} className="flex items-center justify-between py-2.5 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">{service.name}</p>
                  <p className="text-[11px] text-text-muted">{service.avgTimeMinutes} min</p>
                </div>
                <span className="text-sm font-bold text-accent shrink-0">
                  {brl.format(service.price)}
                </span>
              </li>
            ))}
          </ul>
          {extraServiceCount > 0 && isPublic && (
            <button
              type="button"
              onClick={() => onGoAppointments?.()}
              className="mt-2 w-full text-xs font-bold text-accent py-2"
            >
              Ver todos ({services.length}) na agenda
            </button>
          )}
        </div>
      )}

      {canCompose && (
        <div className="bg-surface p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Scissors size={16} className="text-accent" /> Novo post
            </h3>
            <button
              type="button"
              onClick={() => navigate('/app/posts')}
              className="text-[11px] font-bold text-accent hover:underline"
            >
              Gerar com IA
            </button>
          </div>

          <form onSubmit={handleSubmitPost} className="space-y-3">
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'haircut', label: 'Look', icon: Scissors },
                { id: 'beard', label: 'Acabamento', icon: Star },
                { id: 'announcement', label: 'Aviso', icon: Type },
              ].map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setNewPostType(type.id as 'haircut' | 'beard' | 'announcement')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all
                        ${newPostType === type.id ? 'bg-accent border-accent text-accent-fg' : 'bg-bg border-border text-text-muted'}
                      `}
                >
                  <type.icon size={14} /> {type.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={newPostTitle}
                onChange={e => setNewPostTitle(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm outline-none focus:ring-2 focus:ring-accent"
                placeholder="Título do post (opcional)"
              />
              <textarea
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm outline-none focus:ring-2 focus:ring-accent min-h-[90px]"
                placeholder="Escreva algo para seus clientes..."
              />
            </div>

            {newPostImage && (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={newPostImage} alt="Preview" className="w-full h-40 object-cover" />
              </div>
            )}

            {newPostVideoPreview && (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <video src={newPostVideoPreview} className="w-full h-40 object-cover" controls />
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 p-1.5 bg-bg/80 rounded-full text-text-secondary hover:text-danger transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {videoError && <p className="text-xs text-danger">{videoError}</p>}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="px-3 py-2 text-xs bg-bg text-text-secondary rounded-lg border border-border cursor-pointer hover:bg-surface flex items-center gap-2">
                  <ImageIcon size={14} /> Imagem
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <label className="px-3 py-2 text-xs bg-bg text-text-secondary rounded-lg border border-border cursor-pointer hover:bg-surface flex items-center gap-2">
                  <Film size={14} /> Vídeo
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={isPosting}
                className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 ${
                  isPosting
                    ? 'bg-surface-2 text-text-muted'
                    : 'bg-accent text-accent-fg hover:bg-accent-hover'
                }`}
              >
                <Send size={14} /> Publicar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-text-primary px-1">Publicações</h2>

        {posts.length === 0 && (
          <div className="text-center py-10 px-6 bg-surface border border-dashed border-border rounded-2xl">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <ImageIcon size={20} className="text-accent" />
            </div>
            <p className="text-sm font-bold text-text-primary">Nenhuma publicação ainda</p>
            <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
              {isPublic
                ? 'Quando o salão postar fotos e avisos, eles aparecem aqui.'
                : 'Publique em Posts para preencher o perfil que o cliente vê.'}
            </p>
            {!isPublic && (
              <button
                type="button"
                onClick={() => navigate('/app/posts')}
                className="mt-4 px-4 py-2 rounded-xl bg-accent text-accent-fg text-xs font-bold"
              >
                Criar primeiro post
              </button>
            )}
          </div>
        )}

        {posts.map(post => (
          <div
            key={post.id}
            className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="p-4 flex items-center justify-between gap-3">
              <span
                className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md border ${getPostTypeStyle(post.type)}`}
              >
                {getPostTypeLabel(post.type)}
              </span>
              {canCompose ? (
                <button type="button" className="text-text-muted hover:text-text-primary">
                  <MoreHorizontal size={16} />
                </button>
              ) : (
                <span className="text-[10px] text-text-muted font-bold">
                  {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
            {post.imageUrl && (
              <img src={post.imageUrl} alt="" className="w-full aspect-square object-cover bg-bg" />
            )}
            {post.videoUrl && !post.imageUrl && (
              <video src={post.videoUrl} className="w-full aspect-square object-cover bg-bg" controls />
            )}
            <div className="p-4 pt-3">
              {post.title && (
                <h3 className="text-text-primary font-bold mb-1 text-base">{post.title}</h3>
              )}
              {post.content && (
                <p className="text-text-secondary text-sm leading-relaxed">{post.content}</p>
              )}
            </div>
            {(post.postMode || post.ctaText) && post.barbershopId && (
              <div className="px-4 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    if (isPublic && post.postMode === 'appointments' && onGoAppointments) {
                      onGoAppointments();
                      return;
                    }
                    if (isPublic && onGoQueue && post.postMode !== 'appointments') {
                      onGoQueue();
                      return;
                    }
                    navigate(
                      `/queue/${post.barbershopId}${post.postMode === 'appointments' ? '?tab=appointments' : ''}`
                    );
                  }}
                  className="w-full bg-accent text-accent-fg rounded-xl text-sm font-bold py-3 hover:bg-accent-hover transition-all"
                >
                  {post.ctaText || 'Agendar'}
                </button>
              </div>
            )}
            <div className="px-4 py-3 flex items-center justify-between border-t border-border">
              <button
                type="button"
                onClick={() => onLikePost(post.id)}
                className="flex items-center gap-1 text-xs text-text-secondary hover:text-danger"
              >
                <Heart size={14} /> {post.likes}
              </button>
              {canCompose && (
                <button
                  type="button"
                  onClick={() => onDeletePost(post.id)}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-danger"
                >
                  <Trash2 size={14} /> Excluir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isPublic && (
        <p className="text-center text-[10px] font-bold tracking-[0.25em] text-text-muted pt-1">
          AGENDAI
        </p>
      )}
    </div>
  );
};
