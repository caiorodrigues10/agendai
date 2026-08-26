import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopSettings, FeedPost, StaffMember } from '../../types';
import { Logo } from '../ui/Logo';
import {
  Camera,
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
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { barbershopApi } from '../../infra/barbershopApi';

interface ShopProfileProps {
  settings: ShopSettings;
  posts: FeedPost[];
  currentUser: StaffMember | null;
  onAddPost: (post: FeedPost) => void;
  onDeletePost: (id: string) => void;
  onLikePost: (id: string) => void;
}

export const ShopProfile: React.FC<ShopProfileProps> = ({
  settings,
  posts,
  currentUser,
  onAddPost,
  onDeletePost,
  onLikePost,
}) => {
  const navigate = useNavigate();
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

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="bg-surface rounded-2xl overflow-hidden border border-border shadow-2xl relative">
        <div className="h-40 bg-gradient-to-b from-surface via-accent/10 to-surface relative flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          ></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-2 transform scale-125">
              <Logo size="lg" customImageUrl={settings.logoUrl} />
            </div>
          </div>
        </div>

        <div className="px-6 pb-8 relative text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">{settings.shopName}</h1>
          {settings.whatsapp && (
            <p className="text-text-secondary text-sm max-w-xs mx-auto mb-4 leading-relaxed">
              WhatsApp: {settings.whatsapp}
            </p>
          )}

          {settings.address && (
            <div className="flex justify-center text-xs font-bold text-text-muted">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-accent" /> {settings.address}
              </span>
            </div>
          )}
        </div>
      </div>

      {currentUser && (
        <div className="bg-surface p-4 rounded-xl border border-border">
          <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <Scissors size={16} className="text-accent" /> Novo Post
          </h3>

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
                  onClick={() => setNewPostType(type.id as any)}
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
                <video
                  src={newPostVideoPreview}
                  className="w-full h-40 object-cover"
                  controls
                />
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 p-1.5 bg-bg/80 rounded-full text-text-secondary hover:text-danger transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {videoError && (
              <p className="text-xs text-danger">{videoError}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="px-3 py-2 text-xs bg-bg text-text-secondary rounded-lg border border-border cursor-pointer hover:bg-surface flex items-center gap-2">
                  <ImageIcon size={14} /> Imagem
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
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

      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm bg-surface border border-border rounded-xl">
            Nenhuma postagem ainda.
          </div>
        )}

        {posts.map(post => (
          <div
            key={post.id}
            className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md border ${getPostTypeStyle(post.type)}`}
                >
                  {getPostTypeLabel(post.type)}
                </span>
                {currentUser && (
                  <button className="text-text-muted hover:text-text-primary">
                    <MoreHorizontal size={16} />
                  </button>
                )}
                {!currentUser && (
                  <span className="text-[10px] text-text-muted font-bold">
                    {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
              {post.title && (
                <h3 className="text-text-primary font-bold mb-2 text-lg">{post.title}</h3>
              )}
              <p className="text-text-secondary text-sm leading-relaxed">{post.content}</p>
            </div>
            {post.imageUrl && (
              <img src={post.imageUrl} alt="Post" className="w-full h-56 object-cover" />
            )}
            {post.videoUrl && !post.imageUrl && (
              <video
                src={post.videoUrl}
                className="w-full h-56 object-cover"
                controls
              />
            )}
            {(post.postMode || post.ctaText) && post.barbershopId && (
              <div className="p-4 pb-0">
                <button
                  onClick={() =>
                    navigate(
                      `/queue/${post.barbershopId}${post.postMode === 'appointments' ? '?tab=appointments' : ''}`
                    )
                  }
                  className="w-full bg-accent text-accent-fg rounded-xl text-sm font-bold py-3 hover:bg-accent-hover transition-all"
                >
                  {post.ctaText || 'Agendar'}
                </button>
              </div>
            )}
            <div className="p-4 flex items-center justify-between border-t border-border">
              <button
                onClick={() => onLikePost(post.id)}
                className="flex items-center gap-1 text-xs text-text-secondary hover:text-danger"
              >
                <Heart size={14} /> {post.likes}
              </button>
              {currentUser && (
                <button
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
    </div>
  );
};
