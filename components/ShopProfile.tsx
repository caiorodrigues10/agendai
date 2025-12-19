import React, { useState } from 'react';
import { ShopSettings, FeedPost, StaffMember } from '../types';
import { Logo } from './Logo';
import { Camera, Type, Send, Trash2, Heart, Image as ImageIcon, MapPin, Star, Scissors } from 'lucide-react';
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
  // New Post State
  const [newPostContent, setNewPostContent] = useState('');
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
    if (!newPostContent && !newPostImage) return;

    setIsPosting(true);

    const post: FeedPost = {
      id: uuidv4(),
      type: newPostType,
      content: newPostContent,
      imageUrl: newPostImage || undefined,
      createdAt: Date.now(),
      likes: 0,
      authorName: currentUser?.name || 'Equipe'
    };

    // Simulate small delay
    setTimeout(() => {
        onAddPost(post);
        setNewPostContent('');
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

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* --- Profile Header --- */}
      <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl relative">
        {/* Banner / Cover */}
        <div className="h-32 bg-gradient-to-r from-neutral-900 via-cyan-900/40 to-neutral-900 relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>
        
        <div className="px-6 pb-6 relative -mt-12 flex flex-col items-center text-center">
            {/* Logo */}
            <div className="bg-neutral-950 p-2 rounded-2xl border-4 border-neutral-900 shadow-xl mb-3">
                 <Logo size="lg" customImageUrl={settings.logoUrl} />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-1">{settings.shopName}</h1>
            <p className="text-neutral-400 text-sm max-w-xs mx-auto mb-4">
              Estilo, tradição e modernidade. O melhor lugar para o seu visual.
            </p>

            <div className="flex gap-4 text-xs font-medium text-neutral-500">
                <span className="flex items-center gap-1"><MapPin size={12} className="text-cyan-500" /> Centro da Cidade</span>
                <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500" /> 4.9 (120 Reviews)</span>
            </div>
        </div>
      </div>

      {/* --- Create Post (Staff Only) --- */}
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all
                            ${newPostType === type.id 
                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' 
                                : 'bg-neutral-950 text-neutral-500 border border-neutral-800 hover:border-neutral-700'}
                        `}
                    >
                        <type.icon size={12} /> {type.label}
                    </button>
                ))}
             </div>

             <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={newPostType === 'announcement' ? "Escreva um comunicado..." : "Descreva este estilo..."}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none resize-none h-20 placeholder-neutral-700"
             />

             {newPostType !== 'announcement' && (
                <div className="flex items-center gap-3">
                    <input 
                        type="file" 
                        id="post-image" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                    />
                    <label 
                        htmlFor="post-image"
                        className={`flex-1 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors
                            ${newPostImage ? 'border-cyan-500/50 bg-cyan-900/10' : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950'}
                        `}
                    >
                        {newPostImage ? (
                            <img src={newPostImage} alt="Preview" className="h-full w-full object-cover rounded-md opacity-80" />
                        ) : (
                            <>
                                <Camera size={18} className="text-neutral-500" />
                                <span className="text-[10px] text-neutral-500">Adicionar Foto</span>
                            </>
                        )}
                    </label>
                </div>
             )}

             <button
                type="submit"
                disabled={isPosting || (!newPostContent && !newPostImage)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
             >
                <Send size={14} /> {isPosting ? 'Publicando...' : 'Publicar no Feed'}
             </button>
          </form>
        </div>
      )}

      {/* --- Feed Timeline --- */}
      <div className="space-y-6">
         {posts.length === 0 ? (
            <div className="text-center py-10 opacity-50">
                <ImageIcon size={48} className="mx-auto mb-2 text-neutral-700" />
                <p className="text-neutral-500 text-sm">O feed está vazio por enquanto.</p>
            </div>
         ) : (
            posts.map((post) => (
                <div key={post.id} className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-3 flex justify-between items-center border-b border-neutral-800/50">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-cyan-900/30 flex items-center justify-center border border-cyan-900/50">
                                <Logo size="sm" />
                             </div>
                             <div>
                                <h4 className="text-sm font-bold text-white leading-tight">{settings.shopName}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-neutral-500 uppercase tracking-wide">
                                        {getPostTypeLabel(post.type)}
                                    </span>
                                    <span className="text-[10px] text-neutral-600">• {new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                             </div>
                        </div>
                        {currentUser?.role === 'admin' && (
                            <button 
                                onClick={() => onDeletePost(post.id)}
                                className="text-neutral-600 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    {/* Content - Image */}
                    {post.imageUrl && (
                        <div className="w-full aspect-square sm:aspect-video bg-neutral-950 relative">
                             <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Content - Text & Actions */}
                    <div className={`p-4 ${post.type === 'announcement' ? 'bg-cyan-900/5' : ''}`}>
                        {post.content && (
                            <p className={`text-sm mb-3 ${post.type === 'announcement' ? 'text-cyan-100 font-medium text-center py-2' : 'text-neutral-300'}`}>
                                {post.content}
                            </p>
                        )}

                        <div className="flex items-center gap-4 pt-2">
                             <button 
                                onClick={() => onLikePost(post.id)}
                                className="flex items-center gap-1.5 text-neutral-400 hover:text-pink-500 transition-colors group"
                             >
                                <Heart size={20} className="group-active:scale-75 transition-transform" />
                                <span className="text-xs font-bold">{post.likes}</span>
                             </button>
                        </div>
                    </div>
                </div>
            ))
         )}
      </div>
    </div>
  );
};