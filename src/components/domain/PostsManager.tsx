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
  Sparkles,
  Download,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
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

function downloadPostImage(imageUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

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
    } catch (err: any) {
      if (err?.code === 'AI_DAILY_LIMIT_EXCEEDED') {
        const retryAfter = err?.data?.retryAfter;
        let msg = 'Você atingiu o limite de gerações de post por hoje. Tente novamente amanhã ou preencha o post manualmente.';
        if (retryAfter) {
          const d = new Date(retryAfter);
          const hh = d.getHours().toString().padStart(2, '0');
          const mm = d.getMinutes().toString().padStart(2, '0');
          msg = `Você atingiu o limite de gerações de post por hoje. Libera às ${hh}:${mm}. Enquanto isso, você pode preencher o post manualmente.`;
        }
        showToast(msg, 'error');
      } else {
        showToast(getErrorMessage(err, 'Não foi possível gerar sugestões.'), 'error');
      }
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
    if (publishMode === 'schedule' && scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (scheduledDate.getTime() <= Date.now()) {
        showToast('A data de agendamento precisa ser no futuro.', 'error');
        return;
      }
    }
    if (!title.trim() && !ctaText.trim()) {
      showToast('Adicione pelo menos um título ou texto do botão de ação.', 'error');
      return;
    }
    if (publishMode === 'now') {
      if (!window.confirm('Publicar agora vai enviar este post por WhatsApp para todos os clientes cadastrados do salão. Continuar?')) {
        return;
      }
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
      const res = await barbershopApi.createPost(payload);
      if (publishMode === 'now' && res?.imageUrl) {
        downloadPostImage(res.imageUrl, `post-${res.id}.png`);
      }
      showToast(
        publishMode === 'now'
          ? 'Post publicado! Baixando imagem e enviando para os clientes por WhatsApp...'
          : 'Post agendado!'
      );
      setTitle('');
      setCtaText('');
      setScheduledFor('');
      await refreshScheduled();
    } catch (err) {
      showToast(
        getErrorMessage(
          err,
          'Conecte o WhatsApp do salão em Configurações para enviar o post aos clientes.'
        ),
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishNow = async (post: FeedPost) => {
    if (!window.confirm('Publicar post e enviar imagem via WhatsApp para todos os clientes cadastrados?')) {
      return;
    }
    setPublishingId(post.id);
    try {
      await barbershopApi.updateScheduledPost(post.id, { status: 'published' });
      if (post.imageUrl) {
        downloadPostImage(post.imageUrl, `post-${post.id}.png`);
      }
      showToast('Post publicado!');
      await refreshScheduled();
    } catch (err) {
      showToast(
        getErrorMessage(
          err,
          'Conecte o WhatsApp do salão em Configurações para enviar o post aos clientes.'
        ),
        'error'
      );
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

  const shopInitials = (settings?.shopName || 'AG')
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-lg overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
        <h2 className="text-lg font-bold text-text-primary tracking-tight">Posts do salão</h2>
        <p className="text-sm text-text-secondary mt-1 max-w-xl">
          Arte 1080×1080 no visual do AgendAI — preto e esmeralda, como o site. Publique no WhatsApp
          ou baixe para o Instagram.
        </p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-lg space-y-5">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Megaphone size={20} className="text-accent" /> Novo post
            </h3>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
                Tipo do post
              </label>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={type === opt.id}
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
                    aria-pressed={tone === opt.id}
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
              <label htmlFor="post-extra" className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
                Algo específico? <span className="text-text-muted font-normal">(opcional)</span>
              </label>
              <input
                id="post-extra"
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
              className="w-full px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/20 disabled:opacity-60"
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
                      Botão: {s.ctaText}
                    </p>
                  </button>
                ))}
                {suggestionsSource === 'template' && (
                  <p className="text-[11px] text-text-muted italic">
                    gerado localmente · configure pelo menos uma chave de IA no backend (ver .env)
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="post-title" className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
                Título <span className="text-text-muted font-normal">(edite manualmente ou selecione acima)</span>
              </label>
              <input
                id="post-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={80}
                className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary text-sm outline-none focus:ring-2 focus:ring-accent"
                placeholder="Ex.: Corte + barba por R$ 40,00"
              />
            </div>

            <div>
              <label htmlFor="post-cta" className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
                Texto do botão de ação <span className="text-text-muted font-normal">(edite manualmente ou selecione acima)</span>
              </label>
              <input
                id="post-cta"
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
                Para onde o botão leva
              </label>
              <div className="flex gap-2">
                {MODE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={postMode === opt.id}
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
                  aria-pressed={publishMode === 'now'}
                  onClick={() => setPublishMode('now')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all
                    ${publishMode === 'now' ? 'bg-accent border-accent text-accent-fg' : 'bg-bg border-border text-text-muted'}`}
                >
                  <Send size={14} /> Publicar agora
                </button>
                <button
                  type="button"
                  aria-pressed={publishMode === 'schedule'}
                  onClick={() => setPublishMode('schedule')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all
                    ${publishMode === 'schedule' ? 'bg-accent border-accent text-accent-fg' : 'bg-bg border-border text-text-muted'}`}
                >
                  <Clock3 size={14} /> Agendar
                </button>
              </div>
              {publishMode === 'schedule' && (
                <input
                  id="post-schedule"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
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
                            Botão: {post.ctaText} · {MODE_LABEL[post.postMode || 'queue']}
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

        <div className="lg:sticky lg:top-4 space-y-3">
          <div className="rounded-2xl border border-border bg-black shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">
                  {shopInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {settings?.shopName || 'Seu salão'}
                  </p>
                  <p className="text-[10px] text-neutral-500">Feed · 1080×1080</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => void regeneratePreview(postMode, type, title, ctaText, barbershopId)}
                  className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/5"
                >
                  <RefreshCw size={12} className={previewLoading ? 'animate-spin' : ''} /> Atualizar
                </button>
                <MoreHorizontal size={16} className="text-neutral-500" />
              </div>
            </div>

            <div className="aspect-square w-full bg-[#0f0f0f] relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
              <div
                className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl"
                aria-hidden
              />
              {previewLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={32} className="text-emerald-400 animate-spin" />
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview do post"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center px-8 text-center gap-4">
                  <span className="text-[10px] font-bold tracking-[0.35em] text-emerald-400 border border-emerald-500/40 rounded-full px-3 py-1">
                    AGENDAI
                  </span>
                  <p className="text-lg font-extrabold text-white leading-tight">
                    {title || 'Seu post aparece aqui'}
                  </p>
                  <div className="w-full rounded-2xl bg-[#212121] border border-[#303030] px-4 py-3 text-left">
                    <p className="text-[10px] font-bold tracking-widest text-emerald-500">HOJE</p>
                    <p className="text-sm text-neutral-200 mt-0.5">
                      {openingTime ? `Aberto às ${openingTime}` : 'Horário do salão'}
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center px-8 py-2.5 rounded-full bg-emerald-500 text-[#052e1f] text-xs font-extrabold">
                    {ctaText || 'Agende agora'}
                  </span>
                </div>
              )}
            </div>

            <div className="px-3 py-2.5 flex items-center justify-between text-neutral-400">
              <div className="flex items-center gap-3">
                <Heart size={18} />
                <MessageCircle size={18} />
                <Send size={17} />
              </div>
              <Bookmark size={18} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-1">
            <p className="text-[11px] text-text-muted">
              {settings?.shopName
                ? `Prévia para ${settings.shopName}`
                : 'Prévia gerada pelo sistema'}
            </p>
            {previewUrl && (
              <button
                type="button"
                onClick={() =>
                  downloadPostImage(previewUrl, `agendai-post-${Date.now()}.png`)
                }
                className="text-[11px] font-bold text-accent flex items-center gap-1 hover:underline"
              >
                <Download size={12} /> Baixar PNG
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
