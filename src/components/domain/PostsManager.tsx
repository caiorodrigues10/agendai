import React, { useCallback, useEffect, useState } from 'react';
import {
  Megaphone,
  Scissors,
  Star,
  Type,
  Send,
  Clock3,
  Trash2,
  Loader2,
  RefreshCw,
  CalendarDays,
  List,
  CheckCheck,
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Check,
} from 'lucide-react';
import { barbershopApi, PostAiSuggestion } from '../../infra/barbershopApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { FeedPost, PostMode } from '../../types';
import { Toast } from '../ui/Toast';

type PostType = 'haircut' | 'beard' | 'announcement';
type PostTone = 'promocional' | 'informativo' | 'divertido' | null;

const TYPE_OPTIONS: {
  id: PostType;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: 'haircut', label: 'Corte', icon: Scissors },
  { id: 'beard', label: 'Barba', icon: Star },
  { id: 'announcement', label: 'Divulgação', icon: Type },
];

const MODE_OPTIONS: {
  id: PostMode;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: 'queue', label: 'Fila', icon: List },
  { id: 'appointments', label: 'Agenda', icon: CalendarDays },
  { id: 'both', label: 'Ambos', icon: CheckCheck },
];

const TONE_OPTIONS: {
  id: PostTone;
  label: string;
}[] = [
  { id: 'promocional', label: 'Promocional' },
  { id: 'informativo', label: 'Informativo' },
  { id: 'divertido', label: 'Descontraído' },
];

const MODE_LABEL: Record<PostMode, string> = {
  queue: 'Fila',
  appointments: 'Agenda',
  both: 'Fila e Agenda',
};

export const PostsManager: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const { settings } = useBarbershop();

  const [type, setType] = useState<PostType>('haircut');
  const [postMode, setPostMode] = useState<PostMode>('queue');
  const [tone, setTone] = useState<PostTone>(null);
  const [extra, setExtra] = useState('');
  const [title, setTitle] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduledFor, setScheduledFor] = useState('');
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);

  const [suggestions, setSuggestions] = useState<PostAiSuggestion[]>([]);
  const [suggestionsSource, setSuggestionsSource] = useState<'ai' | 'template' | null>(null);
  const [generating, setGenerating] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [scheduled, setScheduled] = useState<FeedPost[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
  }, []);

  const refreshScheduled = useCallback(async () => {
    if (!barbershopId) return;
    try {
      const posts = await barbershopApi.listScheduledPosts(barbershopId);
      setScheduled(Array.isArray(posts) ? posts : []);
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível carregar os posts agendados.'), 'error');
    }
  }, [barbershopId, showToast]);

  useEffect(() => {
    if (!barbershopId) return;
    const load = async () => {
      try {
        const [config, posts] = await Promise.all([
          barbershopApi.getPostConfig(barbershopId),
          barbershopApi.listScheduledPosts(barbershopId),
        ]);
        setAutoPostEnabled(!!config?.autoPostEnabled);
        setScheduled(Array.isArray(posts) ? posts : []);
      } catch (err) {
        showToast(
          getErrorMessage(err, 'Não foi possível carregar as configurações de posts.'),
          'error'
        );
      } finally {
        setLoadingList(false);
      }
    };
    void load();
  }, [barbershopId, showToast]);

  useEffect(() => {
    setSuggestions([]);
    setSuggestionsSource(null);
  }, [type, postMode]);

  const handleGenerate = async () => {
    if (!barbershopId) return;
    setGenerating(true);
    setSuggestions([]);
    setSuggestionsSource(null);
    try {
      const res = await barbershopApi.generatePostContent({
        barbershopId,
        type,
        postMode,
        tone: tone || undefined,
        extra: extra.trim() || undefined,
        count: 3,
      });
      setSuggestions(res.suggestions);
      setSuggestionsSource(res.source);
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível gerar sugestões.'), 'error');
    } finally {
      setGenerating(false);
    }
  };

  const regeneratePreview = useCallback(
    async (mode: PostMode, t: PostType, ti: string, ct: string, id: string | null) => {
      if (!id) return;
      setPreviewLoading(true);
      try {
        const res = await barbershopApi.getPostPreview(id, mode, t);
        setPreviewUrl(res?.imageUrl || null);
      } catch (err) {
        setPreviewUrl(null);
        showToast(getErrorMessage(err, 'Não foi possível gerar o preview do post.'), 'error');
      } finally {
        setPreviewLoading(false);
      }
    },
    [showToast]
  );

  const previewKey = `${type}|${postMode}|${title}|${ctaText}`;

  useEffect(() => {
    if (!barbershopId) return;
    const timer = setTimeout(() => {
      void regeneratePreview(postMode, type, title, ctaText, barbershopId);
    }, 400);
    return () => clearTimeout(timer);
  }, [previewKey, postMode, type, title, ctaText, barbershopId, regeneratePreview]);

  const handlePublish = async () => {
    if (!barbershopId) return;
    if (publishMode === 'schedule' && !scheduledFor) {
      showToast('Escolha a data e hora para agendar o post.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        barbershopId,
        type,
        title: title.trim() || undefined,
        content: title.trim() || ctaText.trim() || 'Novo post',
        ctaText: ctaText.trim() || undefined,
        postMode,
      };
      if (publishMode === 'schedule' && scheduledFor) {
        payload.scheduledFor = new Date(scheduledFor).toISOString();
      }
      await barbershopApi.createPost(payload);
      showToast(publishMode === 'schedule' ? 'Post agendado!' : 'Post publicado!');
      setTitle('');
      setCtaText('');
      setScheduledFor('');
      await refreshScheduled();
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível publicar o post.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishNow = async (post: FeedPost) => {
    setPublishingId(post.id);
    try {
      await barbershopApi.updateScheduledPost(post.id, { status: 'published' });
      showToast('Post publicado!');
      await refreshScheduled();
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível publicar o post.'), 'error');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (post: FeedPost) => {
    if (!window.confirm(`Excluir o post "${post.title || post.content || 'sem título'}"?`)) return;
    setDeletingId(post.id);
    try {
      await barbershopApi.deleteScheduledPost(post.id);
      showToast('Post excluído.');
      await refreshScheduled();
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível excluir o post.'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAutoPostToggle = async (value: boolean) => {
    if (!barbershopId) return;
    const previous = autoPostEnabled;
    setAutoPostEnabled(value);
    setSavingConfig(true);
    try {
      await barbershopApi.savePostConfig(barbershopId, value);
      showToast(value ? 'Publicação automática ativada!' : 'Publicação automática desativada.');
    } catch (err) {
      setAutoPostEnabled(previous);
      showToast(getErrorMessage(err, 'Não foi possível salvar a configuração.'), 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const todaySchedule = settings?.schedule?.[new Date().getDay()];
  const openingTime = todaySchedule?.isOpen ? todaySchedule.openTime : null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-lg space-y-5">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Megaphone size={20} className="text-accent" /> Novo Post
            </h2>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
                Tipo do post
              </label>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setType(opt.id)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all
                      ${type === opt.id ? 'bg-accent border-accent text-accent-fg' : 'bg-bg border-border text-text-muted'}`}
                  >
                    <opt.icon size={14} /> {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
                Tom da mensagem
              </label>
              <div className="flex gap-2">
                {TONE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTone(tone === opt.id ? null : opt.id)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all
                      ${tone === opt.id ? 'bg-accent border-accent text-accent-fg' : 'bg-bg border-border text-text-muted'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
                Algo específico? <span className="text-text-muted font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={extra}
                onChange={e => setExtra(e.target.value)}
                maxLength={200}
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm outline-none focus:ring-2 focus:ring-accent"
                placeholder="Ex.: promoção de aniversário, serviço novo..."
              />
            </div>

            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={generating}
              className="w-full px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 disabled:opacity-60"
            >
              {generating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {generating ? 'Gerando...' : 'Gerar com IA'}
            </button>

            {suggestions.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block">
                  Sugestões <span className="font-normal normal-case">(clique para aplicar)</span>
                </label>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setTitle(s.title);
                      setCtaText(s.ctaText);
                    }}
                    className="w-full text-left bg-bg border border-border rounded-lg px-4 py-3 hover:border-accent transition-all group"
                  >
                    <p className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                      {s.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      CTA: {s.ctaText}
                    </p>
                  </button>
                ))}
                {suggestionsSource === 'template' && (
                  <p className="text-[11px] text-text-muted italic">
                    gerado localmente · adicione GEMINI_API_KEY para sugestões por IA
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
                Título <span className="text-text-muted font-normal">(edite manualmente ou selecione acima)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={80}
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm outline-none focus:ring-2 focus:ring-accent"
                placeholder="Ex.: Corte + barba por R$ 40,00"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
                Texto do CTA <span className="text-text-muted font-normal">(edite manualmente ou selecione acima)</span>
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={e => setCtaText(e.target.value)}
                maxLength={40}
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm outline-none focus:ring-2 focus:ring-accent"
                placeholder="Ex.: Agende agora"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
                O CTA leva para
              </label>
              <div className="flex gap-2">
                {MODE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPostMode(opt.id)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all
                      ${postMode === opt.id ? 'bg-accent border-accent text-accent-fg' : 'bg-bg border-border text-text-muted'}`}
                  >
                    <opt.icon size={14} /> {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
                Publicação
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPublishMode('now')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all
                    ${publishMode === 'now' ? 'bg-accent border-accent text-accent-fg' : 'bg-bg border-border text-text-muted'}`}
                >
                  <Send size={14} /> Publicar agora
                </button>
                <button
                  type="button"
                  onClick={() => setPublishMode('schedule')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all
                    ${publishMode === 'schedule' ? 'bg-accent border-accent text-accent-fg' : 'bg-bg border-border text-text-muted'}`}
                >
                  <Clock3 size={14} /> Agendar
                </button>
              </div>
              {publishMode === 'schedule' && (
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm outline-none focus:ring-2 focus:ring-accent"
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => void handlePublish()}
              disabled={submitting}
              className={`w-full px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all
                ${submitting ? 'bg-surface-2 text-text-muted' : 'bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/20'}`}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {publishMode === 'schedule' ? 'Agendar post' : 'Publicar agora'}
            </button>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-5 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Clock3 size={16} className="text-accent" /> Publicação automática
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  O post é publicado automaticamente quando o salão abre{' '}
                  {openingTime ? `(ex: ${openingTime})` : ''}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  O horário vem da agenda do salão (Configurações &gt; Horários)
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoPostEnabled}
                disabled={savingConfig}
                onClick={() => void handleAutoPostToggle(!autoPostEnabled)}
                className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${autoPostEnabled ? 'bg-accent' : 'bg-surface-2 border border-border-strong'}`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${autoPostEnabled ? 'left-[22px]' : 'left-0.5'}`}
                />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-3">
              <Megaphone size={16} className="text-accent" /> Agendados / Rascunhos
            </h3>
            {loadingList ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-surface-2 rounded-xl" />
                ))}
              </div>
            ) : scheduled.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-sm bg-surface border border-border rounded-xl">
                Nenhum rascunho ou post agendado.
              </div>
            ) : (
              <div className="space-y-3">
                {scheduled.map(post => (
                  <div
                    key={post.id}
                    className="bg-surface border border-border rounded-xl p-4 shadow-lg space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate">
                          {post.title || post.content || 'Post sem título'}
                        </p>
                        {post.ctaText && (
                          <p className="text-xs text-text-secondary mt-0.5 truncate">
                            CTA: {post.ctaText} · {MODE_LABEL[post.postMode || 'queue']}
                          </p>
                        )}
                      </div>
                      {post.status === 'scheduled' ? (
                        <span className="shrink-0 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md border bg-warning/15 text-warning border-warning/30">
                          Agendado
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md border bg-surface-2 text-text-secondary border-border-strong">
                          Rascunho
                        </span>
                      )}
                    </div>
                    {post.status === 'scheduled' && post.scheduledFor && (
                      <p className="text-[11px] text-text-muted">
                        Para {new Date(post.scheduledFor).toLocaleString('pt-BR')}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void handlePublishNow(post)}
                        disabled={publishingId === post.id}
                        className="flex-1 px-3 py-2 rounded-lg bg-accent text-accent-fg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-accent-hover transition-all disabled:opacity-50"
                      >
                        {publishingId === post.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        Publicar agora
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(post)}
                        disabled={deletingId === post.id}
                        className="px-3 py-2 rounded-lg bg-bg border border-border text-text-secondary text-xs font-bold flex items-center justify-center gap-1.5 hover:text-danger transition-all disabled:opacity-50"
                      >
                        {deletingId === post.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-4">
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <ImageIcon size={16} className="text-accent" /> Preview do post
              </h3>
              <button
                type="button"
                onClick={() => void regeneratePreview(postMode, type, title, ctaText, barbershopId)}
                className="text-xs font-bold text-accent flex items-center gap-1 hover:underline"
              >
                <RefreshCw size={12} /> Atualizar
              </button>
            </div>
            <div className="aspect-square w-full bg-bg rounded-2xl border border-border overflow-hidden flex items-center justify-center">
              {previewLoading ? (
                <div className="w-full h-full animate-pulse bg-surface-2 flex items-center justify-center">
                  <Loader2 size={32} className="text-text-muted animate-spin" />
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview do post"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6">
                  <ImageIcon size={32} className="text-text-muted mx-auto mb-2" />
                  <p className="text-xs text-text-muted">Gere o preview para visualizar o post</p>
                </div>
              )}
            </div>
            <p className="text-[11px] text-text-muted mt-3">
              {settings?.shopName
                ? `Prévia gerada para ${settings.shopName}.`
                : 'Prévia gerada pelo sistema.'}{' '}
              Imagem 1080x1080
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
