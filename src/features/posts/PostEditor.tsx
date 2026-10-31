/* eslint-disable jsx-a11y/media-has-caption -- mídia enviada pelo salão não possui trilha de legenda separada */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';
import {
  LuLoaderCircle as Loader2,
  LuChevronRight as ChevronRight,
  LuClock3 as Clock3,
  LuSparkles as Sparkles,
  LuDownload as Download,
  LuImagePlus as ImagePlus,
  LuCheck as Check,
  LuPalette as Palette,
  LuCalendarClock as CalendarClock,
  LuRectangleHorizontal as RectangleHorizontal,
  LuRectangleVertical as RectangleVertical,
  LuSmartphone as Smartphone,
} from 'react-icons/lu';
import { postsApi, type PostMedia, type PostPaletteDef, type PostTemplateDef } from '../../infra/postsApi';
import { barbershopApi, PostAiSuggestion } from '../../infra/barbershopApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FeedPost, PostFormat, PostMode } from '../../types';
import { Button } from '../../components/ui/Button';
import { SectionError } from '../../components/patterns/states/SectionError';
import { PostPreviewBox } from './PostPreviewBox';
import { PostTemplatePicker } from './PostTemplatePicker';
import { OBJECTIVES, type PostType, type ObjectiveId } from './objectives';
import { readDraft, writeDraft, clearDraft } from './draftStorage';

type PostTone = 'promocional' | 'informativo' | 'divertido' | null;
type EditorTab = 'content' | 'image' | 'format' | 'identity';

/** Agora + offset em minutos, formatado no fuso LOCAL (datetime-local não usa UTC). */
function localDateTime(offsetMinutes = 0, date = new Date()): string {
  const d = new Date(date.getTime() + offsetMinutes * 60_000);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Deriva photoMode de templates antigos que ainda não expõem o campo. */
function templatePhotoMode(t: PostTemplateDef | undefined): 'none' | 'optional' | 'required' {
  if (!t) return 'none';
  if (t.photoMode) return t.photoMode;
  return t.requiredMedia > 0 ? 'required' : 'none';
}

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

const DRAFT_VERSION = 2;
const CAPTION_MAX = 5000;
const VIDEO_MAX_BYTES = 25 * 1024 * 1024;

function downloadImage(imageUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

interface LocalDraftPayload {
  version: number;
  savedAt: number;
  serverPostId?: string | null;
  scheduledFor?: string;
  publishMode?: 'now' | 'schedule';
  objectiveId: ObjectiveId | null;
  templateKey: string;
  paletteKey: string;
  format: PostFormat;
  postMode: PostMode;
  type: PostType;
  title: string;
  ctaText: string;
  content: string;
  videoUrl: string | null;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
}

// ─── Props ────────────────────────────────────────────────────

export interface PostEditorProps {
  post: FeedPost | null;
  sourcePost?: FeedPost | null;
  barbershopId: string;
  userId: string;
  palettes: PostPaletteDef[];
  mediaLibrary: PostMedia[];
  metadataErrors?: string[];
  metadataLoading?: boolean;
  onReloadMetadata?: () => void;
  onClose: () => void;
  onSaved: (status: 'draft' | 'scheduled' | 'published') => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onMediaUploaded: (m: PostMedia) => void;
}

// ─── Componente ────────────────────────────────────────────────

export const PostEditor: React.FC<PostEditorProps> = ({
  post,
  sourcePost,
  barbershopId,
  userId,
  palettes,
  mediaLibrary,
  metadataErrors = [],
  metadataLoading = false,
  onReloadMetadata,
  onClose,
  onSaved,
  showToast: onToast,
  onMediaUploaded,
}) => {
  const isEditing = !!post;
  const isPublished = post?.status === 'published';
  const basePost = post ?? sourcePost;
  const storageKey = post?.id ?? (sourcePost ? `copy-${sourcePost.id}` : 'new');
  const [editorError, setEditorError] = useState<string | null>(null);
  const showToast = useCallback((message: string, kind: 'success' | 'error' = 'success') => {
    setEditorError(kind === 'error' ? message : null);
    onToast(message, kind);
  }, [onToast]);

  // Restaura o rascunho local ANTES do primeiro render dos estados, para que o
  // efeito de persistência nunca sobrescreva o rascunho salvo com valores vazios.
  const [initialDraft] = useState<LocalDraftPayload | null>(() =>
    readDraft<LocalDraftPayload>(userId, barbershopId, storageKey, DRAFT_VERSION)
  );
  const draft = initialDraft;

  const [tab, setTab] = useState<EditorTab>('content');
  const [objectiveId, setObjectiveId] = useState<ObjectiveId | null>(draft?.objectiveId ?? (sourcePost ? OBJECTIVES.find(item => item.templateKey === sourcePost.templateKey)?.id ?? 'announce' : null));
  const [templateKey, setTemplateKey] = useState(draft?.templateKey ?? basePost?.templateKey ?? 'agenda-aberta');
  const [paletteKey, setPaletteKey] = useState(draft?.paletteKey ?? basePost?.paletteKey ?? 'brand');
  const [format, setFormat] = useState<PostFormat>(draft?.format ?? basePost?.format ?? 'square');
  const [postMode, setPostMode] = useState<PostMode>(draft?.postMode ?? basePost?.postMode ?? 'both');
  const [type, setType] = useState<PostType>(draft?.type ?? basePost?.type ?? 'haircut');
  const [title, setTitle] = useState(draft?.title ?? basePost?.title ?? '');
  const [ctaText, setCtaText] = useState(draft?.ctaText ?? basePost?.ctaText ?? '');
  const [content, setContent] = useState(draft?.content ?? basePost?.content ?? '');
  const [videoUrl, setVideoUrl] = useState<string | null>(draft ? draft.videoUrl : basePost?.videoUrl ?? null);
  const [primaryMediaId, setPrimaryMediaId] = useState<string | null>(draft ? draft.primaryMediaId : basePost?.primaryMediaId ?? null);
  const [secondaryMediaId, setSecondaryMediaId] = useState<string | null>(draft ? draft.secondaryMediaId : basePost?.secondaryMediaId ?? null);

  const [templates, setTemplates] = useState<PostTemplateDef[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templatesAttempt, setTemplatesAttempt] = useState(0);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [tone, setTone] = useState<PostTone>(null);
  const [extra, setExtra] = useState('');
  const [suggestions, setSuggestions] = useState<PostAiSuggestion[]>([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  const [scheduledFor, setScheduledFor] = useState(() => draft?.scheduledFor ?? (post?.scheduledFor ? localDateTime(0, new Date(post.scheduledFor)) : localDateTime(3 * 60)));
  const scheduleMin = useMemo(() => localDateTime(5), []);
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>(draft?.publishMode ?? (post?.status === 'scheduled' ? 'schedule' : 'now'));

  const [previewUrl, setPreviewUrl] = useState<string | null>(post?.imageUrl ?? null);
  const [previewStale, setPreviewStale] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewAttempt, setPreviewAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const savedPostId = useRef<string | null>(post?.id ?? draft?.serverPostId ?? null);
  const mediaBusy = uploadingPhoto || uploadingVideo;

  const [showMediaPicker, setShowMediaPicker] = useState<'primary' | 'secondary' | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || submitting || mediaBusy) return;
      event.preventDefault();
      if (showMediaPicker) setShowMediaPicker(null);
      else if (showTemplatePicker) setShowTemplatePicker(false);
      else onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose, showMediaPicker, showTemplatePicker, submitting, mediaBusy]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const previewSeqRef = useRef(0);

  // O catálogo continua vindo exclusivamente da API, com recuperação no editor.
  useEffect(() => {
    let cancelled = false;
    setTemplatesLoading(true);
    setTemplatesError(null);
    postsApi.templates(barbershopId)
      .then(list => { if (!cancelled) setTemplates(list); })
      .catch(error => {
        if (!cancelled) setTemplatesError(getErrorMessage(error, 'Não foi possível carregar os modelos.'));
      })
      .finally(() => { if (!cancelled) setTemplatesLoading(false); });
    return () => { cancelled = true; };
  }, [templatesAttempt, barbershopId]);

  const selectedTemplate = useMemo(() => templates.find(t => t.key === templateKey), [templates, templateKey]);
  const selectedPhotoMode = templatePhotoMode(selectedTemplate);
  const recommendedTemplateKey = OBJECTIVES.find(objective => objective.id === objectiveId)?.templateKey;

  const persistDraft = useCallback(() => {
    writeDraft<LocalDraftPayload>(userId, barbershopId, storageKey, DRAFT_VERSION, {
      serverPostId: savedPostId.current, scheduledFor, publishMode,
      objectiveId, templateKey, paletteKey, format, postMode, type, title, ctaText,
      content, videoUrl, primaryMediaId, secondaryMediaId,
    });
  }, [userId, barbershopId, storageKey, objectiveId, templateKey, paletteKey, format, postMode, type, title, ctaText, content, videoUrl, primaryMediaId, secondaryMediaId, scheduledFor, publishMode]);

  useEffect(() => { persistDraft(); }, [persistDraft]);

  useEffect(() => {
    if (!barbershopId) return;
    const seq = ++previewSeqRef.current;
    const controller = new AbortController();
    setPreviewStale(true);
    setPreviewLoading(true);
    setPreviewError(null);
    const timer = setTimeout(async () => {
      try {
        const url = await postsApi.preview(barbershopId, {
          postMode, type, title: title || undefined, ctaText: ctaText || undefined,
          templateKey, format, paletteKey, primaryMediaId, secondaryMediaId,
        }, { signal: controller.signal });
        if (controller.signal.aborted || seq !== previewSeqRef.current) return;
        setPreviewUrl(url);
        setPreviewStale(false);
      } catch (error) {
        if (controller.signal.aborted || seq !== previewSeqRef.current) return;
        setPreviewError(getErrorMessage(error, 'Não foi possível gerar a prévia.'));
      } finally {
        if (!controller.signal.aborted && seq === previewSeqRef.current) setPreviewLoading(false);
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [barbershopId, templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId, postMode, type, previewAttempt]);

  const retryPreview = () => {
    setPreviewUrl(null);
    setPreviewAttempt(attempt => attempt + 1);
  };
  const previewProps = {
    format, previewUrl, loading: previewLoading, stale: previewStale,
    error: previewError, onRetry: retryPreview,
  };
  const templatePickerProps = {
    templates, selectedKey: templateKey, barbershopId, format, paletteKey,
    loading: templatesLoading, error: templatesError,
    onRetry: () => setTemplatesAttempt(attempt => attempt + 1),
    recommendedTemplateKey,
  };

  const pickObjective = (id: ObjectiveId) => {
    const obj = OBJECTIVES.find(o => o.id === id);
    if (!obj) return;
    setObjectiveId(id);
    setTemplateKey(obj.templateKey);
    setType(obj.type);
    setTab('content');
  };

  const handleGenerate = async () => {
    setEditorError(null);
    setGeneratingSuggestions(true);
    setSuggestions([]);
    try {
      const res = await barbershopApi.generatePostContent({
        barbershopId, type, postMode,
        tone: tone || undefined,
        extra: extra.trim() || undefined,
        count: 3,
      });
      if (!res.suggestions?.length) throw new Error('Nenhuma sugestão foi retornada. Tente novamente.');
      setSuggestions(res.suggestions);
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Não foi possível gerar sugestões.'), 'error');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !barbershopId) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { showToast('Envie uma imagem (JPG, PNG ou WebP).', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Imagem deve ter no máximo 5 MB.', 'error'); return; }
    setUploadingPhoto(true);
    try {
      const media = await postsApi.uploadMedia(barbershopId, file);
      onMediaUploaded(media);
      if (showMediaPicker === 'primary') { setPrimaryMediaId(media.id); setShowMediaPicker(null); }
      else if (showMediaPicker === 'secondary') { setSecondaryMediaId(media.id); setShowMediaPicker(null); }
      showToast('Imagem adicionada à biblioteca.');
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível enviar a imagem.'), 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !barbershopId) return;
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) { showToast('Envie um vídeo (MP4, WebM ou MOV).', 'error'); return; }
    if (file.size > VIDEO_MAX_BYTES) { showToast('Vídeo deve ter no máximo 25 MB.', 'error'); return; }
    setUploadingVideo(true);
    try {
      const { videoUrl: url } = await barbershopApi.uploadPostVideo(barbershopId, file);
      setVideoUrl(url);
      showToast('Vídeo anexado ao post.');
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível enviar o vídeo.'), 'error');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSave = async (action: 'draft' | 'publish' | 'schedule') => {
    if (!barbershopId || submitting || mediaBusy) return;
    if ((action !== 'draft' || isPublished) && (!selectedTemplate || templatesLoading)) {
      showToast('Aguarde o carregamento e selecione um modelo.', 'error');
      return;
    }
    if ((action !== 'draft' || isPublished) && selectedTemplate && (
      (selectedTemplate.requiredMedia >= 1 && !primaryMediaId) ||
      (selectedTemplate.requiredMedia >= 2 && !secondaryMediaId)
    )) {
      showToast('Adicione as fotos exigidas pelo modelo antes de publicar.', 'error');
      setTab('image');
      return;
    }
    if (action === 'schedule' && (!scheduledFor || !Number.isFinite(new Date(scheduledFor).getTime()) || new Date(scheduledFor).getTime() < Date.now() + 5 * 60_000)) {
      showToast('Escolha um horário com pelo menos 5 minutos de antecedência.', 'error');
      return;
    }
    setEditorError(null);
    setSubmitting(true);
    try {
      let targetId = savedPostId.current;

      if (targetId) {
        await postsApi.update(targetId!, {
          title: title || null,
          ctaText: ctaText || null,
          content,
          postMode, templateKey, format, paletteKey,
          primaryMediaId, secondaryMediaId,
          videoUrl,
        });
      } else {
        const created = await postsApi.create({
          barbershopId, type, postMode,
          title: title || undefined,
          ctaText: ctaText || undefined,
          content: content.trim() ? content : undefined,
          templateKey, format, paletteKey,
          primaryMediaId, secondaryMediaId,
          videoUrl,
          status: 'draft',
        });
        targetId = created.id;
        savedPostId.current = created.id;
        persistDraft();
      }

      if (isPublished) {
        clearDraft(userId, barbershopId, storageKey);
        onSaved('published');
        showToast('Alterações do post salvas.');
      } else if (action === 'publish') {
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
        if (post?.status === 'scheduled') await postsApi.cancelSchedule(targetId!);
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
    const sampleTitle = templates.find(template => template.key === key)?.sampleTitle;
    if (!title.trim() && sampleTitle) setTitle(sampleTitle);
    setShowTemplatePicker(false);
  };

  const metadataFeedback = metadataLoading ? (
    <p role="status" className="flex items-center gap-2 p-4 text-sm text-text-muted"><Loader2 size={16} className="animate-spin" aria-hidden />Carregando paletas e fotos…</p>
  ) : metadataErrors.length > 0 ? (
    <SectionError message={metadataErrors.join(' ')} onRetry={onReloadMetadata} className="m-4" />
  ) : null;

  if (!objectiveId && !isEditing) {
    return (
      <EditorDialog>
        <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-surface sm:h-auto sm:max-h-[92dvh] sm:rounded-2xl sm:border sm:border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-bold text-text-primary">Criar post</h3>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-text-muted hover:text-text-primary" aria-label="Fechar">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {metadataFeedback}
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
      </EditorDialog>
    );
  }

  return (
    <EditorDialog>
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-surface sm:h-auto sm:max-h-[92dvh] sm:rounded-2xl sm:border sm:border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-bold text-text-primary">
            {isEditing ? 'Editar post' : 'Criar post'}
          </h3>
          <button type="button" onClick={onClose} disabled={submitting || mediaBusy} className="rounded-lg p-2 text-text-muted hover:text-text-primary disabled:opacity-40" aria-label="Fechar">
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
          {metadataFeedback}
          <details className="border-b border-border p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold text-accent">Ver prévia do post</summary>
            <div className="mt-4">
              <PostPreviewBox {...previewProps} />
            </div>
          </details>
          {/* Tab: Conteúdo */}
          {tab === 'content' && (
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {/* Título */}
                <div>
                  <label htmlFor="post-title" className="mb-1 block text-xs font-bold text-text-secondary">Título</label>
                  <input
                    id="post-title"
                    aria-describedby="post-title-help"
                    type="text"
                    maxLength={80}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex.: Corte + barba por R$ 45"
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  />
                  <p id="post-title-help" className={`mt-1 text-xs ${title.length > 48 ? 'text-warning' : 'text-text-muted'}`}>
                    {title.length > 48 ? 'O título será resumido na arte. Encurte para até 48 caracteres e confira a prévia.' : 'Título na imagem. Use uma frase curta; deixe os detalhes na legenda.'} ({title.length}/48)
                  </p>
                </div>

                {/* CTA */}
                <div>
                  <label htmlFor="post-cta" className="mb-1 block text-xs font-bold text-text-secondary">Texto do botão (CTA)</label>
                  <input
                    id="post-cta"
                    aria-describedby="post-cta-help"
                    type="text"
                    maxLength={40}
                    value={ctaText}
                    onChange={e => setCtaText(e.target.value)}
                    placeholder="Ex.: Agendar horário"
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  />
                  <p id="post-cta-help" className={`mt-1 text-xs ${ctaText.length > 32 ? 'text-warning' : 'text-text-muted'}`}>
                    {ctaText.length > 32 ? 'O botão será resumido na arte. Use até 32 caracteres.' : 'Uma ação curta e clara para quem vê o post.'}
                  </p>
                </div>

                {/* Legenda */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label htmlFor="post-content" className="text-xs font-bold text-text-secondary">Legenda</label>
                    <span className="text-[10px] text-text-muted">{content.length}/{CAPTION_MAX}</span>
                  </div>
                  <textarea
                    id="post-content"
                    rows={4}
                    maxLength={CAPTION_MAX}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Texto que acompanha o post (opcional)"
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Modo + Tipo */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span id="post-mode-label" className="mb-1 block text-xs font-bold text-text-secondary">Destino do CTA</span>
                    <div role="radiogroup" aria-labelledby="post-mode-label" className="flex overflow-hidden rounded-xl border border-border">
                      {MODE_OPTIONS.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          role="radio"
                          aria-checked={postMode === m.id}
                          tabIndex={postMode === m.id ? 0 : -1}
                          onKeyDown={event => {
                            const index = MODE_OPTIONS.findIndex(option => option.id === m.id);
                            const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
                            if (!direction) return;
                            event.preventDefault();
                            const next = (index + direction + MODE_OPTIONS.length) % MODE_OPTIONS.length;
                            setPostMode(MODE_OPTIONS[next].id);
                            const radios = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
                            radios?.[next].focus();
                          }}
                          onClick={() => setPostMode(m.id)}
                          className={`min-h-10 flex-1 px-2 text-xs font-bold transition ${
                            postMode === m.id
                              ? 'bg-accent text-accent-fg'
                              : 'bg-bg text-text-secondary hover:bg-surface'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="post-template" className="mb-1 block text-xs font-bold text-text-secondary">Modelo</label>
                    <button
                      type="button"
                      id="post-template"
                      aria-label={`Selecionar modelo: ${selectedTemplate?.name ?? 'carregar modelos'}`}
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
                    <Button variant="secondary" size="sm" onClick={() => void handleGenerate()} disabled={generatingSuggestions}
                      className="w-full gap-1.5"
                    >
                      {generatingSuggestions ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <Sparkles size={13} aria-hidden />}
                      {generatingSuggestions ? 'Gerando…' : 'Gerar sugestões'}
                    </Button>
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
                  <PostPreviewBox {...previewProps} />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Imagem */}
          {tab === 'image' && (
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <p className="text-xs font-bold text-text-secondary">Gerenciar fotos do post</p>
                {selectedPhotoMode !== 'none' && (
                  <div className="flex flex-wrap gap-3">
                    {(['primary', 'secondary'] as const).map(slot => {
                      if (slot === 'secondary' && (selectedTemplate?.requiredMedia ?? 0) < 2) return null;
                      const mediaId = slot === 'primary' ? primaryMediaId : secondaryMediaId;
                      const media = mediaLibrary.find(m => m.id === mediaId);
                      const required = selectedPhotoMode === 'required' && (selectedTemplate?.requiredMedia ?? 0) >= (slot === 'primary' ? 1 : 2);
                      return (
                        <div key={slot} className="space-y-1">
                        <button type="button"
                          onClick={() => { setEditorError(null); setShowMediaPicker(slot); }}
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
                              {required
                                ? <span className="text-[10px] font-bold text-warning">Requerida</span>
                                : <span className="text-[10px] text-text-muted">Opcional</span>}
                            </>
                          )}
                        </button>
                        {mediaId && <button type="button" onClick={() => slot === 'primary' ? setPrimaryMediaId(null) : setSecondaryMediaId(null)} className="min-h-11 w-40 rounded-lg text-xs font-semibold text-danger hover:bg-danger/10">
                          Remover foto {slot === 'primary' ? 'principal' : 'secundária'}
                        </button>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {selectedPhotoMode === 'none' && (
                  <p className="text-[10px] text-text-muted">Este modelo não usa foto — nenhum envio é necessário.</p>
                )}
                {selectedPhotoMode === 'required' && (
                  <p className="text-[10px] text-text-muted">
                    Este modelo requer {(selectedTemplate?.requiredMedia ?? 1)} foto(s) do seu salão.
                  </p>
                )}
                {selectedPhotoMode === 'optional' && (
                  selectedTemplate?.stockImageKey ? (
                    <p className="text-[10px] leading-relaxed text-text-muted">
                      Foto opcional: envie uma imagem do seu salão ou deixe em branco para usarmos uma
                      imagem ilustrativa gerada automaticamente. A imagem ilustrativa é apenas decorativa
                      e <strong>não representa resultados do seu salão</strong>.
                    </p>
                  ) : (
                    <p className="text-[10px] leading-relaxed text-text-muted">
                      Este modelo funciona com tipografia, sem foto. Se preferir, você pode enviar uma
                      imagem do seu salão para compor a arte.
                    </p>
                  )
                )}

                {/* Vídeo */}
                <div className="space-y-2 border-t border-border pt-4">
                  <p className="text-xs font-bold text-text-secondary">Vídeo (opcional)</p>
                  {videoUrl ? (
                    <div className="space-y-2">
                      <video src={videoUrl} controls className="w-full max-w-xs rounded-xl bg-black" />
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo}
                        >
                          Trocar vídeo
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setVideoUrl(null)} disabled={uploadingVideo}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="secondary" onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo}
                      className="w-full max-w-xs gap-2 border-2 border-dashed"
                    >
                      {uploadingVideo ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <ImagePlus size={14} aria-hidden />}
                      {uploadingVideo ? 'Enviando vídeo…' : 'Enviar vídeo (até 25 MB)'}
                    </Button>
                  )}
                  <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={e => void handleVideoUpload(e)} />
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="sticky top-0">
                  <PostPreviewBox {...previewProps} />
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
                  <PostTemplatePicker {...templatePickerProps} onSelect={template => {
                    setTemplateKey(template.key);
                    if (!title.trim() && template.sampleTitle) setTitle(template.sampleTitle);
                  }} />
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="sticky top-0">
                  <PostPreviewBox {...previewProps} />
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
                <Button
                  variant="secondary"
                  onClick={() => previewUrl && downloadImage(previewUrl, `post-${format}-${Date.now()}.png`)}
                  disabled={!previewUrl || previewLoading || previewStale}
                  className="w-full gap-2"
                >
                  <Download size={15} aria-hidden /> Baixar PNG
                </Button>
              </div>

              <div className="hidden lg:block">
                <div className="sticky top-0">
                  <PostPreviewBox {...previewProps} />
                </div>
              </div>
            </div>
          )}
        </div>

        {editorError && !showMediaPicker && (
          <div role="alert" className="mx-4 mb-3 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {editorError}
          </div>
        )}
        {/* Footer — actions */}
        <div className="border-t border-border bg-surface px-4 py-3">
          {!isPublished && <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-xl border border-border p-1" aria-label="Quando publicar">
              {(['now', 'schedule'] as const).map(mode => (
                <button key={mode} type="button" aria-pressed={publishMode === mode} onClick={() => setPublishMode(mode)} disabled={submitting || mediaBusy}
                  className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${publishMode === mode ? 'bg-accent/15 text-accent' : 'text-text-secondary'}`}>
                  {mode === 'now' ? 'Publicar agora' : 'Agendar publicação'}
                </button>
              ))}
            </div>
            {publishMode === 'schedule' && (
              <label className="flex min-w-0 items-center gap-2 text-xs text-text-secondary">
                <Clock3 size={14} aria-hidden /> <span className="sr-only">Data e horário da publicação</span>
                <input type="datetime-local" min={scheduleMin} value={scheduledFor} disabled={submitting || mediaBusy}
                  onChange={e => setScheduledFor(e.target.value)}
                  className="min-w-0 rounded-xl border border-border bg-bg px-2.5 py-2 text-xs focus:border-accent focus:outline-none" />
              </label>
            )}
          </div>}
          <div className="flex items-center justify-between gap-2">
            <Button variant="secondary" onClick={onClose} disabled={submitting || mediaBusy}
              className="gap-1.5"
            >
              Cancelar
            </Button>
            <div className="flex items-center gap-2">
              {!isPublished && <Button variant="secondary" onClick={() => void handleSave('draft')} disabled={submitting || mediaBusy}
                className="gap-1.5"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
                Rascunho
              </Button>}
              <Button variant="primary"
                onClick={() => isPublished ? void handleSave('draft') : publishMode === 'schedule' ? void handleSave('schedule') : void handleSave('publish')}
                disabled={submitting || mediaBusy || templatesLoading || (publishMode === 'schedule' && !scheduledFor)}
                className="gap-2 px-5"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" aria-hidden /> : (
                  publishMode === 'schedule'
                    ? <CalendarClock size={14} aria-hidden />
                    : <Check size={14} aria-hidden />
                )}
                {isPublished ? 'Salvar alterações' : publishMode === 'schedule' ? 'Agendar' : 'Publicar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Overlay */}
      {showMediaPicker && (
        <div className="absolute inset-0 z-[110] flex items-end justify-center bg-black/80 sm:items-center sm:p-4">
          <FocusLock returnFocus className="w-full max-w-lg">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h4 className="text-sm font-bold text-text-primary">Escolher foto</h4>
              <button type="button" onClick={() => setShowMediaPicker(null)} disabled={uploadingPhoto} className="rounded-lg p-1 text-text-muted hover:bg-bg" aria-label="Fechar">
                ✕
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-4">
              {editorError && <SectionError message={editorError} className="mb-3" />}
              <div className="grid grid-cols-3 gap-2">
                {mediaLibrary.map(m => (
                  <button key={m.id} type="button" disabled={uploadingPhoto}
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
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
                className="w-full gap-2 border-2 border-dashed text-xs"
              >
                <ImagePlus size={15} aria-hidden /> {uploadingPhoto ? 'Enviando foto.' : 'Enviar nova foto'}
              </Button>
            </div>
          </div>
          </FocusLock>
        </div>
      )}

      {/* Template Picker Overlay */}
      {showTemplatePicker && (
        <div className="absolute inset-0 z-[110] flex items-end justify-center bg-black/80 sm:items-center sm:p-4">
          <FocusLock returnFocus className="w-full max-w-3xl">
          <div className="w-full rounded-2xl bg-surface border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h4 className="text-sm font-bold text-text-primary">Escolher modelo</h4>
              <button type="button" onClick={() => setShowTemplatePicker(false)} className="rounded-lg p-1 text-text-muted hover:bg-bg" aria-label="Fechar">
                ✕
              </button>
            </div>
            <div className="max-h-[70dvh] overflow-y-auto p-4">
              <PostTemplatePicker {...templatePickerProps} onSelect={template => handleSelectTemplate(template.key)} />
            </div>
          </div>
          </FocusLock>
        </div>
      )}
    </EditorDialog>
  );
};

function EditorDialog({ children }: { children: React.ReactNode }) {
  return createPortal(
    <FocusLock returnFocus>
      <div role="dialog" aria-modal="true" aria-label="Editor de publicação" className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 sm:items-center p-0 sm:p-4">
        {children}
      </div>
    </FocusLock>,
    document.body
  );
}
