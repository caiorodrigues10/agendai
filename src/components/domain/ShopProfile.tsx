import React, { useState } from 'react';
import { ShopSettings, FeedPost, StaffMember } from '../../types';
import { Logo } from '../ui/Logo';
import { Camera, Type, Send, Trash2, Heart, Image as ImageIcon, MapPin, Star, Scissors, MoreHorizontal } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
  onLikePost
}) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostType, setNewPostType] = useState<'haircut' | 'beard' | 'announcement'>('haircut');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

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

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent && !newPostImage && !newPostTitle) return;

    setIsPosting(true);

    const post: FeedPost = {
      id: uuidv4(),
      type: newPostType,
      title: newPostTitle,
      content: newPostContent,
      imageUrl: newPostImage || undefined,
      createdAt: Date.now(),
      likes: 0,
      authorName: currentUser?.name || 'Equipe'
    };

    setTimeout(() => {
        onAddPost(post);
        setNewPostContent('');
        setNewPostTitle('');
        setNewPostImage(null);
        setIsPosting(false);
    }, 500);
  };

  const getPostTypeLabel = (type: string) => {
    switch(type) {
      case 'haircut': return 'Corte da Semana';
      case 'beard': return 'Barba de Respeito';
      case 'announcement': return 'Aviso Oficial';
      default: return 'Post';
    }
  };

  const getPostTypeStyle = (type: string) => {
    switch(type) {
      case 'announcement':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'beard':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'haircut':
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">

      <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl relative">
        <div className="h-40 bg-gradient-to-b from-neutral-900 via-cyan-950/20 to-neutral-900 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

            <div className="relative z-10 flex flex-col items-center">
                 <div className="mb-2 transform scale-125">
                     <Logo size="lg" customImageUrl={settings.logoUrl} />
                 </div>
            </div>
        </div>

        <div className="px-6 pb-8 relative text-center">
            <h1 className="text-2xl font-bold text-white mb-2">{settings.shopName}</h1>
            <p className="text-neutral-400 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
              Estilo, tradição e modernidade. O melhor lugar para o seu visual.
            </p>

            <div className="flex justify-center gap-6 text-xs font-bold text-neutral-500">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-cyan-500" /> Centro da Cidade</span>
                <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-500 fill-yellow-500/20" /> 4.9 (120 Reviews)</span>
            </div>
        </div>
      </div>

      {currentUser && (
        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Scissors size={16} className="text-cyan-400" /> Novo Post
          </h3>

          <form onSubmit={handleSubmitPost} className="space-y-3">
             <div className="flex gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'haircut', label: 'Corte', icon: Scissors },
                  { id: 'beard', label: 'Barba', icon: Star },
                  { id: 'announcement', label: 'Aviso', icon: Type }
                ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setNewPostType(type.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all
                        ${newPostType === type.id ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-500'}
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
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Título do post (opcional)"
                />
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-500 min-h-[90px]"
                  placeholder="Escreva algo para seus clientes..."
                />
             </div>

             {newPostImage && (
                <div className="relative rounded-xl overflow-hidden border border-neutral-800">
                  <img src={newPostImage} alt="Preview" className="w-full h-40 object-cover" />
                </div>
             )}

             <div className="flex items-center justify-between">
                <label className="px-3 py-2 text-xs bg-neutral-950 text-neutral-400 rounded-lg border border-neutral-800 cursor-pointer hover:bg-neutral-900 flex items-center gap-2">
                    <ImageIcon size={14} /> Adicionar imagem
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <button
                  type="submit"
                  disabled={isPosting}
                  className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 ${
                    isPosting ? 'bg-neutral-800 text-neutral-500' : 'bg-cyan-600 text-white hover:bg-cyan-500'
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
          <div className="text-center py-8 text-neutral-500 text-sm bg-neutral-900 border border-neutral-800 rounded-xl">
            Nenhuma postagem ainda.
          </div>
        )}

        {posts.map(post => (
          <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md border ${getPostTypeStyle(post.type)}`}>
                    {getPostTypeLabel(post.type)}
                </span>
                {currentUser && (
                  <button className="text-neutral-500 hover:text-white">
                    <MoreHorizontal size={16} />
                  </button>
                )}
                {!currentUser && (
                     <span className="text-[10px] text-neutral-600 font-bold">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                )}
              </div>
              {post.title && <h3 className="text-white font-bold mb-2 text-lg">{post.title}</h3>}
              <p className="text-neutral-300 text-sm leading-relaxed">{post.content}</p>
            </div>
            {post.imageUrl && (
              <img src={post.imageUrl} alt="Post" className="w-full h-56 object-cover" />
            )}
            <div className="p-4 flex items-center justify-between border-t border-neutral-800">
              <button
                onClick={() => onLikePost(post.id)}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-400"
              >
                <Heart size={14} /> {post.likes}
              </button>
              {currentUser && (
                <button
                  onClick={() => onDeletePost(post.id)}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-400"
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
