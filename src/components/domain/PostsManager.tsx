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
  Palette,
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
import { FeedPost, PostFormat, PostMode } from '../../types';
import { Toast } from '../ui/Toast';
import { Logo } from '../ui/Logo';

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

const TEMPLATE_OPTIONS = [
  ['agenda-aberta', 'Agenda aberta', 'Horários e serviços'],
  ['ultimas-vagas', 'Últimas vagas', 'Urgência elegante'],
  ['promocao-relampago', 'Promoção relâmpago', 'Oferta em destaque'],
  ['servico-destaque', 'Serviço destaque', 'Preço e benefício'],
  ['antes-depois', 'Antes e depois', 'Dois resultados'],
  ['transformacao', 'Transformação', 'Resultado final'],
  ['profissional-destaque', 'Profissional', 'Apresente sua equipe'],
  ['depoimento', 'Depoimento', 'Prova social'],
  ['menu-servicos', 'Menu de serviços', 'Serviços principais'],
  ['horario-especial', 'Horário especial', 'Avisos importantes'],
  ['novidade', 'Novidade', 'Lançamentos'],
  ['editorial-minimalista', 'Minimalista', 'Visual limpo'],
] as const;

const QUICK_PRESETS = [
  { label: 'Hoje tem vaga', title: 'Horários abertos hoje!', ctaText: 'Reservar horário' },
  {
    label: 'Agenda da semana',
    title: 'Sua próxima transformação começa aqui',
    ctaText: 'Ver horários',
  },
  { label: 'Chamar no WhatsApp', title: 'Bora cuidar de você?', ctaText: 'Chamar no WhatsApp' },
] as const;

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
  const [templateKey, setTemplateKey] = useState('agenda-aberta');
  const [format, setFormat] = useState<PostFormat>('square');
  const [postMode, setPostMode] = useState<PostMode>('queue');
  const [tone, setTone] = useState<PostTone>(null);
  const [extra, setExtra] = useState('');
  const [title, setTitle] = useState('Vem pra cá hoje!');
  const [ctaText, setCtaText] = useState('Agende agora');
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduledFor, setScheduledFor] = useState('');
  const [minimumScheduleDate] = useState(() =>
    new Date(Date.now() + 60_000).toISOString().slice(0, 16)
  );
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
        let msg =
          'Você atingiu o limite de gerações de post por hoje. Tente novamente amanhã ou preencha o post manualmente.';
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
        const res = await barbershopApi.getPostPreview(id, mode, t, ti, ct, templateKey, format);
        setPreviewUrl(res?.imageUrl || null);
      } catch (err) {
        setPreviewUrl(null);
        showToast(getErrorMessage(err, 'Não foi possível gerar o preview do post.'), 'error');
      } finally {
        setPreviewLoading(false);
      }
    },
    [showToast, templateKey, format]
  );

  const previewKey = `${type}|${postMode}|${title}|${ctaText}|${templateKey}|${format}`;

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
      if (
        !window.confirm(
          'Publicar agora vai enviar este post por WhatsApp para todos os clientes cadastrados do salão. Continuar?'
        )
      ) {
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
        templateKey,
        format,
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
      setTitle('Vem pra cá hoje!');
      setCtaText('Agende agora');
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
    if (
      !window.confirm(
        'Publicar post e enviar imagem via WhatsApp para todos os clientes cadastrados?'
      )
    ) {
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

  return (
    <div className="animate-fade-in space-y-5 pb-20 sm:space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-5 py-5 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.75)] sm:p-6">
        <div
          className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-accent/15 blur-3xl"
          aria-hidden
        />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-emerald-300 to-accent" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-fg shadow-lg shadow-accent/20">
            <Megaphone size={21} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
              Estúdio de conteúdo
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-text-primary">
              Crie posts que param o feed
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              Monte sua arte, revise no formato do Instagram e publique quando fizer sentido.
            </p>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-1 lg:gap-6">
        <div className="space-y-6">
          <div className="space-y-6 rounded-3xl border border-border bg-surface p-4 shadow-lg sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
                  01 · Criar
                </p>
                <h3 className="mt-1 text-lg font-bold text-text-primary">Novo post</h3>
              </div>
              <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-bold text-accent">
                1080 × 1080
              </span>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-secondary">
                Modelo visual
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                {TEMPLATE_OPTIONS.map(([id, label, description]) => (
                  <button key={id} type="button" aria-pressed={templateKey === id} onClick={() => setTemplateKey(id)}
                    className={`min-w-[142px] snap-start rounded-2xl border p-3 text-left transition-all ${templateKey === id ? 'border-accent bg-accent/15 ring-1 ring-accent' : 'border-border bg-bg hover:border-accent/40'}`}>
                    <span className="mb-2 block h-16 rounded-xl bg-gradient-to-br from-accent/70 via-surface-2 to-bg" />
                    <span className="block text-xs font-bold text-text-primary">{label}</span>
                    <span className="mt-1 block text-[10px] text-text-muted">{description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-secondary">Formato</label>
              <div className="grid grid-cols-3 gap-2">
                {([['square', 'Quadrado', '1080×1080'], ['portrait', 'Feed vertical', '1080×1350'], ['story', 'Story', '1080×1920']] as const).map(([id, label, size]) => (
                  <button key={id} type="button" aria-pressed={format === id} onClick={() => setFormat(id)} className={`min-h-16 rounded-xl border px-2 py-2 text-center transition-all ${format === id ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-bg text-text-muted hover:border-accent/35'}`}>
                    <span className="block text-xs font-bold">{label}</span><span className="text-[10px] opacity-80">{size}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-secondary">
                Escolha o tema
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={type === opt.id}
                    onClick={() => setType(opt.id)}
                    className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-xs font-bold transition-all
                      ${type === opt.id ? 'border-accent bg-accent text-accent-fg shadow-lg shadow-accent/20' : 'border-border bg-bg text-text-muted hover:border-accent/35 hover:text-text-primary'}`}
                  >
                    <opt.icon size={19} /> {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg p-3 sm:p-4">
              <div className="mb-3 flex items-center gap-2">
                <Palette size={15} className="text-accent" />
                <label
                  htmlFor="post-title"
                  className="text-xs font-bold uppercase tracking-wider text-text-secondary"
                >
                  Mensagem do post
                </label>
              </div>
              <div className="space-y-3">
                <input
                  id="post-title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={80}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-base font-semibold text-text-primary outline-none transition-shadow placeholder:font-normal focus:ring-2 focus:ring-accent"
                  placeholder="Ex.: Corte + barba por R$ 40,00"
                />
                <input
                  id="post-cta"
                  type="text"
                  value={ctaText}
                  onChange={e => setCtaText(e.target.value)}
                  maxLength={40}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-shadow focus:ring-2 focus:ring-accent"
                  placeholder="Texto do botão: Agende agora"
                />
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {QUICK_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setTitle(preset.title);
                      setCtaText(preset.ctaText);
                    }}
                    className="shrink-0 rounded-full border border-border bg-surface px-3 py-2 text-[11px] font-bold text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-secondary">
                Destino do botão
              </label>
              <div className="grid grid-cols-3 gap-2">
                {MODE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={postMode === opt.id}
                    onClick={() => setPostMode(opt.id)}
                    className={`flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[11px] font-bold transition-all
                      ${postMode === opt.id ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-bg text-text-muted hover:border-accent/35 hover:text-text-primary'}`}
                  >
                    <opt.icon size={16} /> {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <details className="rounded-2xl border border-border bg-bg px-4 py-3.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                <span className="flex items-center gap-2">
                  <Sparkles size={15} className="text-accent" /> Estilo e sugestões
                </span>
                <Sparkles size={14} className="text-text-muted" />
              </summary>
              <p className="text-[11px] text-text-muted mt-2 mb-3">
                Frases prontas do AgendAI. Não depende de Gemini nem ChatGPT — você pode ignorar e
                escrever o seu texto.
              </p>
              <div className="flex gap-2 mb-3">
                {TONE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={tone === opt.id}
                    onClick={() => setTone(tone === opt.id ? null : opt.id)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all
                      ${tone === opt.id ? 'bg-accent border-accent text-accent-fg' : 'bg-surface border-border text-text-muted'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <input
                id="post-extra"
                type="text"
                value={extra}
                onChange={e => setExtra(e.target.value)}
                maxLength={200}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm outline-none focus:ring-2 focus:ring-accent mb-3"
                placeholder="Ex.: promoção de aniversário…"
              />
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={generating}
                className="w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-border text-text-primary hover:border-accent disabled:opacity-60"
              >
                {generating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {generating ? 'Buscando frases…' : 'Sugerir frases'}
              </button>
              {suggestions.length > 0 && (
                <div className="space-y-2 mt-3">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTitle(s.title);
                        setCtaText(s.ctaText);
                      }}
                      className="w-full text-left bg-surface border border-border rounded-lg px-3 py-2 hover:border-accent transition-all group"
                    >
                      <p className="text-sm font-bold text-text-primary group-hover:text-accent">
                        {s.title}
                      </p>
                      <p className="text-[11px] text-text-secondary mt-0.5">Botão: {s.ctaText}</p>
                    </button>
                  ))}
                  {suggestionsSource === 'template' && (
                    <p className="text-[11px] text-text-muted">
                      Modelos locais · sem chamada a IA.
                    </p>
                  )}
                  {suggestionsSource === 'ai' && (
                    <p className="text-[11px] text-text-muted">
                      Sugestão gerada por um provedor de texto.
                    </p>
                  )}
                </div>
              )}
            </details>

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
                  min={minimumScheduleDate}
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

          <div className="rounded-2xl border border-border bg-surface p-4 shadow-lg sm:p-5">
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
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
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

        <div className="order-last -mx-1 space-y-3 lg:mx-0">
          <div className="overflow-hidden rounded-3xl border border-border bg-black shadow-[0_24px_50px_-28px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5">
                  <Logo size="sm" className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {settings?.shopName || 'Seu salão'}
                  </p>
                   <p className="text-[10px] text-neutral-400">Seu post no feed · {format === 'square' ? '1080×1080' : format === 'portrait' ? '1080×1350' : '1080×1920'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    void regeneratePreview(postMode, type, title, ctaText, barbershopId)
                  }
                  className="text-[11px] font-bold text-accent flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/5"
                >
                  <RefreshCw size={12} className={previewLoading ? 'animate-spin' : ''} /> Atualizar
                </button>
                <MoreHorizontal size={16} className="text-neutral-500" />
              </div>
            </div>

             <div className={`relative w-full overflow-hidden bg-surface ${format === 'square' ? 'aspect-square' : format === 'portrait' ? 'aspect-[4/5]' : 'aspect-[9/16]'}`}>
              {!previewUrl && (
                <>
                  <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
                  <div
                    className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl"
                    aria-hidden
                  />
                </>
              )}
              {previewLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={32} className="text-accent animate-spin" />
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview do post"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center px-8 text-center gap-4">
                  <Logo size="md" className="text-white" />
                  <p className="text-lg font-extrabold text-white leading-tight">
                    {title || 'Vem pra cá hoje!'}
                  </p>
                  <div className="w-full rounded-2xl bg-surface border border-border px-4 py-3 text-left">
                    <p className="text-[10px] font-bold tracking-widest text-accent">HOJE</p>
                    <p className="text-sm text-neutral-200 mt-0.5">
                      {openingTime ? `Aberto às ${openingTime}` : 'Horário do salão'}
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center px-8 py-2.5 rounded-full bg-accent text-text-on-accent text-xs font-extrabold">
                    {ctaText || 'Agende agora'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-3.5 py-3 text-neutral-300">
              <div className="flex items-center gap-3">
                <Heart size={18} />
                <MessageCircle size={18} />
                <Send size={17} />
              </div>
              <Bookmark size={18} />
            </div>
            <div className="border-t border-white/10 px-3.5 py-3">
              <p className="text-xs font-semibold text-white">
                {settings?.shopName || 'Seu salão'}{' '}
                <span className="font-normal text-neutral-400">acabou de publicar</span>
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-300">
                {title || 'Crie uma mensagem para o seu próximo post.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-2">
            <p className="text-[11px] font-medium text-text-muted">
              {settings?.shopName
                ? `Prévia pronta para ${settings.shopName}`
                : 'Prévia pronta para publicar'}
            </p>
            {previewUrl && (
              <button
                type="button"
                onClick={() => downloadPostImage(previewUrl, `agendai-post-${Date.now()}.png`)}
                className="flex items-center gap-1 text-[11px] font-bold text-accent hover:underline"
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
