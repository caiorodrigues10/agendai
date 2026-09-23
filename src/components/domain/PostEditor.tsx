import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LuLoaderCircle as Loader2,
  LuChevronRight as ChevronRight,
  LuChevronLeft as ChevronLeft,
  LuClock3 as Clock3,
  LuSparkles as Sparkles,
  LuDownload as Download,
  LuImagePlus as ImagePlus,
  LuCheck as Check,
  LuPalette as Palette,
  LuCalendarClock as CalendarClock,
  LuMegaphone as Megaphone,
  LuRectangleHorizontal as RectangleHorizontal,
  LuRectangleVertical as RectangleVertical,
  LuSmartphone as Smartphone,
} from 'react-icons/lu';
import { postsApi, type PostMedia, type PostPaletteDef } from '../../infra/postsApi';
import { barbershopApi, PostAiSuggestion } from '../../infra/barbershopApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FeedPost, PostFormat, PostMode } from '../../types';
import { PostPreviewBox } from './PostPreviewBox';

type PostType = 'haircut' | 'beard' | 'announcement';
type PostTone = 'promocional' | 'informativo' | 'divertido' | null;
type EditorTab = 'content' | 'image' | 'format' | 'identity';

const OBJECTIVES = [
  { id: 'promote-service', label: 'Divulgar serviço', description: 'Destaque um serviço e seu preço', templateKey: 'servico-destaque', type: 'haircut' as PostType },
  { id: 'fill-slots', label: 'Preencher horários', description: 'Mostre que ainda há vagas', templateKey: 'agenda-aberta', type: 'announcement' as PostType },
  { id: 'show-result', label: 'Mostrar resultado', description: 'Antes e depois do cliente', templateKey: 'antes-depois', type: 'haircut' as PostType },
  { id: 'highlight-staff', label: 'Destacar profissional', description: 'Apresente sua equipe', templateKey: 'profissional-destaque', type: 'haircut' as PostType },
  { id: 'share-review', label: 'Compartilhar depoimento', description: 'Experiência de clientes', templateKey: 'depoimento', type: 'announcement' as PostType },
  { id: 'announce', label: 'Comunicar novidade', description: 'Aviso, promoção ou lançamento', templateKey: 'novidade', type: 'announcement' as PostType },
] as const;

type ObjectiveId = (typeof OBJECTIVES)[number]['id'];

const TEMPLATE_GROUPS: { key: string; label: string }[] = [
  { key: 'agenda', label: 'Agenda' },
  { key: 'ofertas', label: 'Ofertas' },
  { key: 'resultados', label: 'Resultados' },
  { key: 'equipe', label: 'Equipe' },
  { key: 'depoimentos', label: 'Depoimentos' },
];

const TEMPLATE_OPTIONS: { key: string; name: string; group: string; requiredMedia: number }[] = [
  { key: 'agenda-aberta', name: 'Agenda aberta', group: 'agenda', requiredMedia: 0 },
  { key: 'ultimas-vagas', name: 'Últimas vagas', group: 'agenda', requiredMedia: 1 },
  { key: 'horario-especial', name: 'Horário especial', group: 'agenda', requiredMedia: 0 },
  { key: 'promocao-relampago', name: 'Promoção relâmpago', group: 'ofertas', requiredMedia: 1 },
  { key: 'servico-destaque', name: 'Serviço em destaque', group: 'ofertas', requiredMedia: 1 },
  { key: 'menu-servicos', name: 'Menu de serviços', group: 'ofertas', requiredMedia: 0 },
  { key: 'novidade', name: 'Novidade', group: 'ofertas', requiredMedia: 1 },
  { key: 'antes-depois', name: 'Antes e depois', group: 'resultados', requiredMedia: 2 },
  { key: 'transformacao', name: 'Transformação', group: 'resultados', requiredMedia: 1 },
  { key: 'editorial-minimalista', name: 'Editorial minimalista', group: 'resultados', requiredMedia: 1 },
  { key: 'profissional-destaque', name: 'Profissional em destaque', group: 'equipe', requiredMedia: 1 },
  { key: 'depoimento', name: 'Depoimento', group: 'depoimentos', requiredMedia: 1 },
];

const FORMAT_OPTIONS: { id: PostFormat; label: string; hint: string; icon: React.ReactNode }[] = [
  { id: 'square', label: 'Quadrado', hint: '1:1', icon: <RectangleHorizontal size={16} /> },
  { id: 'portrait', label: 'Retrato', hint: '4:5', icon: <RectangleVertical size={16} /> },
  { id: 'story', label: 'Story', hint: '9:16', icon: <Smartphone size={16} /> },
];

const MODE_OPTIONS: { id: PostMode; label: string }[] = [
  { id: 'queue', label: 'Fila' },
  { id: 'appointments', label: 'Agenda' },
  { id: 'both', label: 'Fila e Agenda' },
];

const TONE_OPTIONS: { id: NonNullable<PostTone>; label: string }[] = [
  { id: 'promocional', label: 'Promocional' },
  { id: 'informativo', label: 'Informativo' },
  { id: 'divertido', label: 'Descontraído' },
];

const TAB_LABELS: { id: EditorTab; label: string; num: number }[] = [
  { id: 'content', label: 'Conteúdo', num: 1 },
  { id: 'image', label: 'Imagem', num: 2 },
  { id: 'format', label: 'Formato', num: 3 },
  { id: 'identity', label: 'Identidade', num: 4 },
];

const DRAFT_VERSION = 1;

function downloadImage(imageUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function draftKey(userId: string, barbershopId: string, postId: string) {
  return `agendai:post-draft:${userId}:${barbershopId}:${postId}`;
}

interface LocalDraftPayload {
  version: number;
  savedAt: number;
  objectiveId: ObjectiveId | null;
  templateKey: string;
  paletteKey: string;
  format: PostFormat;
  postMode: PostMode;
  type: PostType;
  title: string;
  ctaText: string;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
}

function readDraft(userId: string, barbershopId: string, postId: string): LocalDraftPayload | null {
  try {
    const raw = localStorage.getItem(draftKey(userId, barbershopId, postId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalDraftPayload;
    return parsed.version === DRAFT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function writeDraft(userId: string, barbershopId: string, postId: string, data: Omit<LocalDraftPayload, 'version' | 'savedAt'>) {
  try {
    localStorage.setItem(
      draftKey(userId, barbershopId, postId),
      JSON.stringify({ version: DRAFT_VERSION, savedAt: Date.now(), ...data })
    );
  } catch { /* noop */ }
}

function clearDraft(userId: string, barbershopId: string, postId: string) {
  try { localStorage.removeItem(draftKey(userId, barbershopId, postId)); } catch { /* noop */ }
}

// ─── Props ────────────────────────────────────────────────────

export interface PostEditorProps {
  post: FeedPost | null;
  barbershopId: string;
  userId: string;
  palettes: PostPaletteDef[];
  mediaLibrary: PostMedia[];
  onClose: () => void;
  onSaved: (status: 'draft' | 'scheduled' | 'published') => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onMediaUploaded: (m: PostMedia) => void;
}

// ─── Componente ────────────────────────────────────────────────

export const PostEditor: React.FC<PostEditorProps> = ({
  post,
  barbershopId,
  userId,
  palettes,
  mediaLibrary,
  onClose,
  onSaved,
  showToast,
  onMediaUploaded,
}) => {
  const isEditing = !!post;
  const storageKey = post?.id ?? 'new';

  const [tab, setTab] = useState<EditorTab>('content');
  const [objectiveId, setObjectiveId] = useState<ObjectiveId | null>(null);
  const [templateKey, setTemplateKey] = useState(post?.templateKey ?? 'agenda-aberta');
  const [paletteKey, setPaletteKey] = useState(post?.paletteKey ?? 'brand');
  const [format, setFormat] = useState<PostFormat>(post?.format ?? 'square');
  const [postMode, setPostMode] = useState<PostMode>(post?.postMode ?? 'both');
  const [type, setType] = useState<PostType>(post?.type ?? 'haircut');
  const [title, setTitle] = useState(post?.title ?? '');
  const [ctaText, setCtaText] = useState(post?.ctaText ?? '');
  const [primaryMediaId, setPrimaryMediaId] = useState<string | null>(post?.primaryMediaId ?? null);
  const [secondaryMediaId, setSecondaryMediaId] = useState<string | null>(post?.secondaryMediaId ?? null);

  const [tone, setTone] = useState<PostTone>(null);
  const [extra, setExtra] = useState('');
  const [suggestions, setSuggestions] = useState<PostAiSuggestion[]>([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  const [scheduledFor, setScheduledFor] = useState(() => {
    const d = new Date(Date.now() + 3 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');

  const [previewUrl, setPreviewUrl] = useState<string | null>(post?.imageUrl ?? null);
  const [previewStale, setPreviewStale] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showMediaPicker, setShowMediaPicker] = useState<'primary' | 'secondary' | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRef = useRef<{ templateKey: string; paletteKey: string; format: PostFormat; title: string; ctaText: string; primaryMediaId: string | null; secondaryMediaId: string | null; postMode: PostMode; type: PostType }>({
    templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId, postMode, type,
  });

  const selectedTemplate = useMemo(() => TEMPLATE_OPTIONS.find(t => t.key === templateKey), [templateKey]);
  const filteredTemplates = useMemo(() =>
    templateFilter === 'all' ? TEMPLATE_OPTIONS : TEMPLATE_OPTIONS.filter(t => t.group === templateFilter),
    [templateFilter]
  );

  const persistDraft = useCallback(() => {
    writeDraft(userId, barbershopId, storageKey, {
      objectiveId, templateKey, paletteKey, format, postMode, type, title, ctaText, primaryMediaId, secondaryMediaId,
    });
  }, [userId, barbershopId, storageKey, objectiveId, templateKey, paletteKey, format, postMode, type, title, ctaText, primaryMediaId, secondaryMediaId]);

  useEffect(() => { persistDraft(); }, [persistDraft]);

  useEffect(() => {
    if (isEditing) return;
    const saved = readDraft(userId, barbershopId, 'new');
    if (!saved) return;
    setObjectiveId(saved.objectiveId);
    setTemplateKey(saved.templateKey);
    setPaletteKey(saved.paletteKey);
    setFormat(saved.format);
    setPostMode(saved.postMode);
    setType(saved.type);
    setTitle(saved.title);
    setCtaText(saved.ctaText);
    setPrimaryMediaId(saved.primaryMediaId);
    setSecondaryMediaId(saved.secondaryMediaId);
  }, [isEditing, userId, barbershopId]);

  const triggerPreview = useCallback(() => {
    if (!barbershopId) return;
    setPreviewStale(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const snap = liveRef.current;
      setPreviewLoading(true);
      try {
        const url = await postsApi.preview(barbershopId, {
          postMode: snap.postMode,
          type: snap.type,
          title: snap.title || undefined,
          ctaText: snap.ctaText || undefined,
          templateKey: snap.templateKey,
          format: snap.format,
          paletteKey: snap.paletteKey,
          primaryMediaId: snap.primaryMediaId,
          secondaryMediaId: snap.secondaryMediaId,
        });
        const cur = liveRef.current;
        if (
          cur.templateKey === snap.templateKey &&
          cur.paletteKey === snap.paletteKey &&
          cur.format === snap.format &&
          cur.title === snap.title &&
          cur.ctaText === snap.ctaText &&
          cur.primaryMediaId === snap.primaryMediaId &&
          cur.secondaryMediaId === snap.secondaryMediaId
        ) {
          setPreviewUrl(url);
          setPreviewStale(false);
        }
      } catch {
        showToast('Não foi possível gerar a prévia.', 'error');
        setPreviewStale(true);
      } finally {
        setPreviewLoading(false);
      }
    }, 500);
  }, [barbershopId, showToast]);

  useEffect(() => {
    liveRef.current = { templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId, postMode, type };
    triggerPreview();
  }, [templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId, postMode, type, triggerPreview]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const pickObjective = (id: ObjectiveId) => {
    const obj = OBJECTIVES.find(o => o.id === id);
    if (!obj) return;
    setObjectiveId(id);
    setTemplateKey(obj.templateKey);
    setType(obj.type);
    setTab('content');
  };

  const handleGenerate = async () => {
    setGeneratingSuggestions(true);
    setSuggestions([]);
    try {
      const res = await barbershopApi.generatePostContent({
        barbershopId, type, postMode,
        tone: tone || undefined,
        extra: extra.trim() || undefined,
        count: 3,
      });
      setSuggestions(res.suggestions);
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Não foi possível gerar sugestões.'), 'error');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !barbershopId) return;
    if (!file.type.startsWith('image/')) { showToast('Envie uma imagem (JPG, PNG ou WebP).', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Imagem deve ter no máximo 5 MB.', 'error'); return; }
    try {
      const media = await postsApi.uploadMedia(barbershopId, file);
      onMediaUploaded(media);
      if (showMediaPicker === 'primary') { setPrimaryMediaId(media.id); setShowMediaPicker(null); }
      else if (showMediaPicker === 'secondary') { setSecondaryMediaId(media.id); setShowMediaPicker(null); }
      showToast('Imagem adicionada à biblioteca.');
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível enviar a imagem.'), 'error');
    }
  };

  const handleSave = async (action: 'draft' | 'publish' | 'schedule') => {
    if (!barbershopId) return;
    setSubmitting(true);
    try {
      let targetId = post?.id;

      if (isEditing) {
        await postsApi.update(targetId!, {
          title: title || undefined,
          ctaText: ctaText || undefined,
          postMode, templateKey, format, paletteKey,
          primaryMediaId, secondaryMediaId,
        });
      } else {
        const created = await postsApi.create({
          barbershopId, type, postMode,
          title: title || undefined,
          ctaText: ctaText || undefined,
          templateKey, format, paletteKey,
          primaryMediaId, secondaryMediaId,
          status: 'draft',
        });
        targetId = created.id;
      }

      if (action === 'publish') {
        await postsApi.publish(targetId!);
        clearDraft(userId, barbershopId, storageKey);
        onSaved('published');
        showToast('Post publicado no perfil.');
      } else if (action === 'schedule') {
        await postsApi.schedule(targetId!, new Date(scheduledFor).toISOString());
        clearDraft(userId, barbershopId, storageKey);
        onSaved('scheduled');
        showToast('Post agendado para publicação.');
      } else {
        clearDraft(userId, barbershopId, storageKey);
        onSaved('draft');
        showToast('Rascunho salvo.');
      }
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível salvar o post.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectTemplate = (key: string) => {
    setTemplateKey(key);
    setShowTemplatePicker(false);
  };

  if (!objectiveId && !isEditing) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 sm:items-center p-0 sm:p-4">
        <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-surface sm:h-auto sm:max-h-[92vh] sm:rounded-2xl sm:border sm:border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-bold text-text-primary">Criar post</h3>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-text-muted hover:text-text-primary" aria-label="Fechar">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="mb-3 text-xs font-bold text-text-secondary">Qual o objetivo do post?</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {OBJECTIVES.map(obj => (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => pickObjective(obj.id)}
                  className="flex flex-col items-start gap-2 rounded-xl border border-border bg-surface p-4 text-left transition hover:border-accent/50"
                >
                  <p className="text-sm font-bold text-text-primary">{obj.label}</p>
                  <p className="text-xs leading-relaxed text-text-muted">{obj.description}</p>
                  <span className="flex items-center gap-1 text-xs font-semibold text-text-muted">
                    Escolher <ChevronRight size={12} aria-hidden />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 sm:items-center p-0 sm:p-4">
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-surface sm:h-auto sm:max-h-[92vh] sm:rounded-2xl sm:border sm:border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-bold text-text-primary">
            {isEditing ? 'Editar post' : 'Criar post'}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-text-muted hover:text-text-primary" aria-label="Fechar">
            ✕
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border">
          {TAB_LABELS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-center text-xs font-bold transition ${
                tab === t.id
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Tab: Conteúdo */}
          {tab === 'content' && (
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {/* Título */}
                <div>
                  <label htmlFor="post-title" className="mb-1 block text-xs font-bold text-text-secondary">Título</label>
                  <input
                    id="post-title"
                    type="text"
                    maxLength={80}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex.: Corte + barba por R$ 45"
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                {/* CTA */}
                <div>
                  <label htmlFor="post-cta" className="mb-1 block text-xs font-bold text-text-secondary">Texto do botão (CTA)</label>
                  <input
                    id="post-cta"
                    type="text"
                    maxLength={40}
                    value={ctaText}
                    onChange={e => setCtaText(e.target.value)}
                    placeholder="Ex.: Agendar horário"
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Modo + Tipo */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="post-mode" className="mb-1 block text-xs font-bold text-text-secondary">Destino do CTA</label>
                    <select
                      id="post-mode"
                      value={postMode}
                      onChange={e => setPostMode(e.target.value as PostMode)}
                      className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                    >
                      {MODE_OPTIONS.map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="post-template" className="mb-1 block text-xs font-bold text-text-secondary">Modelo</label>
                    <button
                      type="button"
                      onClick={() => setShowTemplatePicker(true)}
                      className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-left text-sm hover:border-accent/50 focus:border-accent focus:outline-none"
                    >
                      {selectedTemplate ? selectedTemplate.name : 'Selecionar modelo…'}
                    </button>
                  </div>
                </div>

                {/* IA */}
                <details className="rounded-xl border border-border bg-bg/50 p-3">
                  <summary className="flex cursor-pointer items-center justify-between text-xs font-bold text-text-secondary">
                    <span className="flex items-center gap-1.5"><Sparkles size={13} aria-hidden /> Sugestões por IA</span>
                    <ChevronRight size={12} aria-hidden />
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {TONE_OPTIONS.map(t => (
                        <button key={t.id} type="button"
                          onClick={() => setTone(tone === t.id ? null : t.id)}
                          className={`min-h-9 rounded-lg border px-3 text-xs font-semibold ${
                            tone === t.id ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:border-text-muted'
                          }`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <textarea value={extra} onChange={e => setExtra(e.target.value)} maxLength={500} rows={2}
                      placeholder="Contexto extra (ex.: promoção só até sexta)"
                      className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs focus:border-accent focus:outline-none"
                    />
                    <button type="button" onClick={() => void handleGenerate()} disabled={generatingSuggestions}
                      className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-bold text-text-secondary hover:border-accent/40 hover:text-accent disabled:opacity-40"
                    >
                      {generatingSuggestions ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <Sparkles size={13} aria-hidden />}
                      {generatingSuggestions ? 'Gerando…' : 'Gerar sugestões'}
                    </button>
                  </div>
                </details>

                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-text-muted">Sugestões</p>
                    {suggestions.map((s, i) => (
                      <button key={i} type="button"
                        onClick={() => { setTitle(s.title || title); setCtaText(s.ctaText || ctaText); }}
                        className="w-full rounded-xl border border-border p-3 text-left transition hover:border-accent/40"
                      >
                        <p className="text-sm font-bold text-text-primary">{s.title}</p>
                        {s.ctaText && <p className="mt-1 text-xs italic text-accent">{s.ctaText}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview lateral */}
              <div className="hidden lg:block">
                <div className="sticky top-0">
                  <PostPreviewBox
                    format={format}
                    previewUrl={previewUrl}
                    loading={previewLoading}
                    stale={previewStale}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Imagem */}
          {tab === 'image' && (
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <p className="text-xs font-bold text-text-secondary">Gerenciar fotos do post</p>
                <div className="flex flex-wrap gap-3">
                  {(['primary', 'secondary'] as const).map(slot => {
                    const mediaId = slot === 'primary' ? primaryMediaId : secondaryMediaId;
                    const media = mediaLibrary.find(m => m.id === mediaId);
                    const required = (selectedTemplate?.requiredMedia ?? 0) >= (slot === 'primary' ? 1 : 2);
                    return (
                      <button key={slot} type="button"
                        onClick={() => setShowMediaPicker(slot)}
                        className={`relative flex h-36 w-40 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed ${
                          media ? 'border-accent bg-accent/5' : required ? 'border-warning bg-warning/5' : 'border-border bg-bg'
                        } p-2 text-center transition hover:border-accent/50`}
                      >
                        {media ? (
                          <>
                            <img src={media.url} alt="" className="h-20 w-full rounded object-cover" />
                            <span className="text-[10px] font-semibold text-accent">Trocar foto</span>
                          </>
                        ) : (
                          <>
                            <ImagePlus size={22} className="text-text-muted" aria-hidden />
                            <span className="text-[10px] text-text-muted">
                              {slot === 'primary' ? 'Foto principal' : 'Foto secundária'}
                            </span>
                            {required && <span className="text-[10px] font-bold text-warning">Requerida</span>}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-text-muted">
                  {selectedTemplate?.requiredMedia === 0
                    ? 'Este modelo não requer fotos.'
                    : `Este modelo requer ${selectedTemplate?.requiredMedia} foto(s).`}
                </p>
              </div>

              <div className="hidden lg:block">
                <div className="sticky top-0">
                  <PostPreviewBox
                    format={format}
                    previewUrl={previewUrl}
                    loading={previewLoading}
                    stale={previewStale}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Formato */}
          {tab === 'format' && (
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {/* Formato */}
                <div>
                  <p className="mb-2 text-xs font-bold text-text-secondary">Formato da arte</p>
                  <div className="grid grid-cols-3 gap-2">
                    {FORMAT_OPTIONS.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormat(f.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition ${
                          format === f.id
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border text-text-muted hover:border-text-muted'
                        }`}
                      >
                        {f.icon}
                        <span className="text-xs font-bold">{f.label}</span>
                        <span className="text-[10px] text-text-muted">{f.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paleta */}
                <div>
                  <p className="mb-2 text-xs font-bold text-text-secondary">
                    <Palette size={13} className="mr-1 inline" aria-hidden /> Paleta de cores
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {palettes.map(p => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPaletteKey(p.key)}
                        title={p.label}
                        className={`h-9 rounded-lg px-3 text-xs font-semibold capitalize transition ${
                          paletteKey === p.key
                            ? 'bg-accent text-accent-fg'
                            : 'bg-surface text-text-secondary hover:bg-bg'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modelo */}
                <div>
                  <p className="mb-2 text-xs font-bold text-text-secondary">Modelo</p>
                  <div className="space-y-1.5">
                    {TEMPLATE_GROUPS.map(group => {
                      const templates = TEMPLATE_OPTIONS.filter(t => t.group === group.key);
                      if (templates.length === 0) return null;
                      return (
                        <div key={group.key}>
                          <p className="mb-1 text-[10px] font-bold uppercase text-text-muted">{group.label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {templates.map(t => (
                              <button
                                key={t.key}
                                type="button"
                                onClick={() => setTemplateKey(t.key)}
                                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                                  templateKey === t.key
                                    ? 'bg-accent text-accent-fg'
                                    : 'bg-surface text-text-secondary hover:bg-bg'
                                }`}
                              >
                                {t.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="sticky top-0">
                  <PostPreviewBox
                    format={format}
                    previewUrl={previewUrl}
                    loading={previewLoading}
                    stale={previewStale}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Identidade */}
          {tab === 'identity' && (
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-bg/50 p-4 space-y-3">
                  <p className="text-xs font-bold text-text-secondary">Resumo do post</p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">Título</dt>
                      <dd className="font-semibold text-text-primary text-right">{title || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">Botão</dt>
                      <dd className="font-semibold text-text-primary text-right">{ctaText || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">Modelo</dt>
                      <dd className="font-semibold text-text-primary text-right">{selectedTemplate?.name ?? '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">Formato</dt>
                      <dd className="font-semibold text-text-primary text-right">
                        {FORMAT_OPTIONS.find(f => f.id === format)?.label ?? format}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">Paleta</dt>
                      <dd className="font-semibold text-text-primary capitalize text-right">{paletteKey}</dd>
                    </div>
                  </dl>
                </div>

                {/* Download */}
                <button type="button"
                  onClick={() => previewUrl && downloadImage(previewUrl, `post-${format}-${Date.now()}.png`)}
                  disabled={!previewUrl}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border font-semibold text-text-secondary hover:border-accent/40 disabled:opacity-40"
                >
                  <Download size={15} aria-hidden /> Baixar PNG
                </button>
              </div>

              <div className="hidden lg:block">
                <div className="sticky top-0">
                  <PostPreviewBox
                    format={format}
                    previewUrl={previewUrl}
                    loading={previewLoading}
                    stale={previewStale}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — actions */}
        <div className="border-t border-border bg-surface px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={onClose} disabled={submitting}
              className="flex min-h-11 items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-semibold text-text-secondary disabled:opacity-40"
            >
              Cancelar
            </button>
            <div className="flex items-center gap-2">
              {/* Agendamento inline */}
              <div className="hidden sm:flex items-center gap-1.5">
                <Clock3 size={13} className="text-text-muted" aria-hidden />
                <input
                  type="datetime-local"
                  min={new Date(Date.now() + 5 * 60_000).toISOString().slice(0, 16)}
                  value={scheduledFor}
                  onChange={e => { setScheduledFor(e.target.value); if (e.target.value) setPublishMode('schedule'); }}
                  onFocus={() => setPublishMode('schedule')}
                  className="w-44 rounded-xl border border-border bg-bg px-2.5 py-2 text-xs focus:border-accent focus:outline-none"
                />
              </div>
              <button type="button" onClick={() => void handleSave('draft')} disabled={submitting}
                className="flex min-h-11 items-center gap-1.5 rounded-xl border border-border px-4 text-xs font-semibold text-text-secondary hover:border-text-muted disabled:opacity-40"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
                Rascunho
              </button>
              <button type="button"
                onClick={() => publishMode === 'schedule' ? void handleSave('schedule') : void handleSave('publish')}
                disabled={submitting || (publishMode === 'schedule' && !scheduledFor)}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-accent-fg hover:bg-accent-hover disabled:opacity-40"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" aria-hidden /> : (
                  publishMode === 'schedule'
                    ? <CalendarClock size={14} aria-hidden />
                    : <Check size={14} aria-hidden />
                )}
                {publishMode === 'schedule' ? 'Agendar' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Overlay */}
      {showMediaPicker && (
        <div className="absolute inset-0 z-[110] flex items-end justify-center bg-black/80 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h4 className="text-sm font-bold text-text-primary">Escolher foto</h4>
              <button type="button" onClick={() => setShowMediaPicker(null)} className="rounded-lg p-1 text-text-muted hover:bg-bg" aria-label="Fechar">
                ✕
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-4">
              <div className="grid grid-cols-3 gap-2">
                {mediaLibrary.map(m => (
                  <button key={m.id} type="button"
                    onClick={() => {
                      if (showMediaPicker === 'primary') setPrimaryMediaId(m.id);
                      else setSecondaryMediaId(m.id);
                      setShowMediaPicker(null);
                    }}
                    className={`relative overflow-hidden rounded-xl border-2 ${
                      (showMediaPicker === 'primary' ? primaryMediaId : secondaryMediaId) === m.id
                        ? 'border-accent'
                        : 'border-transparent'
                    }`}
                  >
                    <img src={m.url} alt="" className="h-24 w-full object-cover" />
                  </button>
                ))}
              </div>
              {mediaLibrary.length === 0 && (
                <p className="py-8 text-center text-xs text-text-muted">Nenhuma foto na biblioteca.</p>
              )}
            </div>
            <div className="border-t border-border p-4">
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => void handleUpload(e)} />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-xs font-bold text-text-secondary hover:border-accent/40 hover:text-accent"
              >
                <ImagePlus size={15} aria-hidden /> Enviar nova foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Picker Overlay */}
      {showTemplatePicker && (
        <div className="absolute inset-0 z-[110] flex items-end justify-center bg-black/80 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h4 className="text-sm font-bold text-text-primary">Escolher modelo</h4>
              <button type="button" onClick={() => setShowTemplatePicker(false)} className="rounded-lg p-1 text-text-muted hover:bg-bg" aria-label="Fechar">
                ✕
              </button>
            </div>
            <div className="flex gap-1.5 border-b border-border px-4 pt-3 pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setTemplateFilter('all')}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  templateFilter === 'all' ? 'bg-accent text-accent-fg' : 'text-text-muted hover:bg-bg'
                }`}
              >
                Todos
              </button>
              {TEMPLATE_GROUPS.map(g => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setTemplateFilter(g.key)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    templateFilter === g.key ? 'bg-accent text-accent-fg' : 'text-text-muted hover:bg-bg'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="max-h-80 overflow-y-auto p-4 space-y-1.5">
              {filteredTemplates.map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleSelectTemplate(t.key)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    templateKey === t.key
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-primary">{t.name}</span>
                    {templateKey === t.key && <Check size={14} className="text-accent" aria-hidden />}
                  </div>
                  <span className="text-[10px] text-text-muted">
                    {t.requiredMedia === 0 ? 'Sem foto' : `${t.requiredMedia} foto(s)`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
