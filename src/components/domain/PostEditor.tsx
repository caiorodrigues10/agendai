import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Clock3,
  Sparkles,
  Download,
  ImagePlus,
  Check,
  Palette,
  CalendarClock,
  Eye,
  Megaphone,
} from 'lucide-react';
import { postsApi, type PostMedia, type PostPaletteDef } from '../../infra/postsApi';
import { barbershopApi, PostAiSuggestion } from '../../infra/barbershopApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FeedPost, PostFormat, PostMode } from '../../types';


type PostType = 'haircut' | 'beard' | 'announcement';
type PostTone = 'promocional' | 'informativo' | 'divertido' | null;
type EditorStep = 'goal' | 'content' | 'review';

const OBJECTIVES = [
  { id: 'promote-service', label: 'Divulgar serviço', description: 'Destaque um serviço e seu preço', templateKey: 'servico-destaque', type: 'haircut' as PostType },
  { id: 'fill-slots', label: 'Preencher horários', description: 'Mostre que ainda há vagas', templateKey: 'agenda-aberta', type: 'announcement' as PostType },
  { id: 'show-result', label: 'Mostrar resultado', description: 'Antes e depois do cliente', templateKey: 'antes-depois', type: 'haircut' as PostType },
  { id: 'highlight-staff', label: 'Destacar profissional', description: 'Apresente sua equipe', templateKey: 'profissional-destaque', type: 'haircut' as PostType },
  { id: 'share-review', label: 'Compartilhar depoimento', description: 'Experiência de clientes', templateKey: 'depoimento', type: 'announcement' as PostType },
  { id: 'announce', label: 'Comunicar novidade', description: 'Aviso, promoção ou lançamento', templateKey: 'novidade', type: 'announcement' as PostType },
] as const;

type ObjectiveId = (typeof OBJECTIVES)[number]['id'];

const FORMAT_OPTIONS: { id: PostFormat; label: string; hint: string }[] = [
  { id: 'square', label: 'Quadrado', hint: '1:1' },
  { id: 'portrait', label: 'Retrato', hint: '4:5' },
  { id: 'story', label: 'Story', hint: '9:16' },
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

const STEP_LABELS: { id: EditorStep; label: string; num: number }[] = [
  { id: 'goal', label: 'Objetivo', num: 1 },
  { id: 'content', label: 'Conteúdo', num: 2 },
  { id: 'review', label: 'Revisão', num: 3 },
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

  const [step, setStep] = useState<EditorStep>('goal');
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRef = useRef<{ templateKey: string; paletteKey: string; format: PostFormat; title: string; ctaText: string; primaryMediaId: string | null; secondaryMediaId: string | null; postMode: PostMode; type: PostType }>({
    templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId, postMode, type,
  });

  // Persist o rascunho local a cada mudança relevante
  const persistDraft = useCallback(() => {
    writeDraft(userId, barbershopId, storageKey, {
      objectiveId, templateKey, paletteKey, format, postMode, type, title, ctaText, primaryMediaId, secondaryMediaId,
    });
  }, [userId, barbershopId, storageKey, objectiveId, templateKey, paletteKey, format, postMode, type, title, ctaText, primaryMediaId, secondaryMediaId]);

  useEffect(() => { persistDraft(); }, [persistDraft]);

  // Recupera rascunho local ao abrir (somente novo post)
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

  // Debounce 500ms para prévia
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
        // Descarta se os dados mudaram enquanto a requisição estava em voo
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
    setStep('content');
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

  const backDisabled = submitting;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 sm:items-center p-0 sm:p-4">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-surface sm:h-auto sm:max-h-[92vh] sm:rounded-2xl sm:border sm:border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-bold text-text-primary">
            {isEditing ? 'Editar post' : 'Criar post'}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-text-muted hover:text-text-primary" aria-label="Fechar">
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {step === 'goal' && (
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
              {OBJECTIVES.map(obj => (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => pickObjective(obj.id)}
                  className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                    objectiveId === obj.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-surface hover:border-text-muted'
                  }`}
                >
                  <p className="text-sm font-bold text-text-primary">{obj.label}</p>
                  <p className="text-xs leading-relaxed text-text-muted">{obj.description}</p>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${objectiveId === obj.id ? 'text-accent' : 'text-text-muted'}`}>
                    Escolher <ChevronRight size={12} aria-hidden />
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 'content' && (
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              {/* Col 1: form */}
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

                {/* Formato + CTA destino */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="post-format" className="mb-1 block text-xs font-bold text-text-secondary">Formato</label>
                    <select
                      id="post-format"
                      value={format}
                      onChange={e => setFormat(e.target.value as PostFormat)}
                      className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                    >
                      {FORMAT_OPTIONS.map(f => (
                        <option key={f.id} value={f.id}>{f.label} · {f.hint}</option>
                      ))}
                    </select>
                  </div>
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
                </div>

                {/* Personalizar */}
                <details className="rounded-xl border border-border bg-bg/50 p-3">
                  <summary className="cursor-pointer text-xs font-bold text-text-secondary">
                    <Palette size={13} className="mr-1 inline" aria-hidden /> Personalizar (paleta)
                  </summary>
                  <div className="mt-3 flex flex-wrap gap-2">
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
                </details>

                {/* Fotos */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-text-secondary">Fotos</p>
                  <div className="flex flex-wrap gap-2">
                    {(['primary', 'secondary'] as const).map(slot => {
                      const mediaId = slot === 'primary' ? primaryMediaId : secondaryMediaId;
                      const media = mediaLibrary.find(m => m.id === mediaId);
                      return (
                        <button key={slot} type="button"
                          onClick={() => setShowMediaPicker(slot)}
                          className={`flex h-20 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed ${
                            media ? 'border-accent bg-accent/5' : 'border-border bg-bg'
                          } p-1 text-center transition hover:border-accent/50`}
                        >
                          {media ? (
                            <>
                              <img src={media.url} alt="" className="h-10 w-full rounded object-cover" />
                              <span className="text-[10px] text-accent">Trocar foto</span>
                            </>
                          ) : (
                            <>
                              <ImagePlus size={18} className="text-text-muted" aria-hidden />
                              <span className="text-[10px] text-text-muted">
                                {slot === 'primary' ? 'Foto principal' : 'Antes (opcional)'}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
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

              {/* Col 2: preview */}
              <div>
                <div className="sticky top-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye size={14} className="text-text-muted" aria-hidden />
                    <span className="text-xs font-bold text-text-secondary">Prévia do post</span>
                    {previewLoading && <span className="text-[10px] text-text-muted">Gerando…</span>}
                    {previewStale && !previewLoading && <span className="text-[10px] text-warning">Desatualizada</span>}
                  </div>
                  <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-bg">
                    {previewLoading && !previewUrl ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-accent" aria-hidden />
                      </div>
                    ) : previewUrl ? (
                      <img src={previewUrl} alt="Prévia do post" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-text-muted">
                        <Megaphone size={28} aria-hidden />
                        <p className="text-xs">Aguardando informações…</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              {/* Left: info */}
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
                      <dt className="text-text-muted">Paleta</dt>
                      <dd className="font-semibold text-text-primary capitalize text-right">{paletteKey}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">Formato</dt>
                      <dd className="font-semibold text-text-primary text-right">
                        {FORMAT_OPTIONS.find(f => f.id === format)?.label ?? format}
                      </dd>
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

              {/* Right: preview grande */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-text-secondary">Prévia final</p>
                <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-bg">
                  {previewLoading && !previewUrl ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 size={28} className="animate-spin text-accent" aria-hidden />
                    </div>
                  ) : previewUrl ? (
                    <img src={previewUrl} alt="Prévia do post" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-text-muted">
                      <Megaphone size={36} aria-hidden />
                      <p className="text-xs">Complete o conteúdo para gerar a prévia.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — actions */}
        <div className="border-t border-border bg-surface px-4 py-3">
          {step === 'content' ? (
            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={() => setStep('goal')} disabled={backDisabled}
                className="flex min-h-11 items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-semibold text-text-secondary disabled:opacity-40"
              >
                <ChevronLeft size={15} aria-hidden /> Voltar
              </button>
              <button type="button"
                onClick={() => { persistDraft(); setStep('review'); }}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-accent-fg hover:bg-accent-hover"
              >
                Revisar <ChevronRight size={15} aria-hidden />
              </button>
            </div>
          ) : step === 'goal' ? (
            <div className="flex justify-end">
              <button type="button" disabled={!objectiveId}
                onClick={() => setStep('content')}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-accent-fg hover:bg-accent-hover disabled:opacity-40"
              >
                Continuar <ChevronRight size={15} aria-hidden />
              </button>
            </div>
          ) : (
            /* Review — opções de publicação */
            <div className="space-y-3">
              {/* Agendamento */}
              <div className="flex items-center gap-2">
                <label htmlFor="schedule-mode" className="flex items-center gap-1.5 text-xs text-text-muted whitespace-nowrap">
                  <Clock3 size={13} aria-hidden /> Agendar para:
                </label>
                <input
                  id="schedule-mode"
                  type="datetime-local"
                  min={new Date(Date.now() + 5 * 60_000).toISOString().slice(0, 16)}
                  value={scheduledFor}
                  onChange={e => { setScheduledFor(e.target.value); if (e.target.value) setPublishMode('schedule'); }}
                  onFocus={() => setPublishMode('schedule')}
                  disabled={publishMode !== 'schedule'}
                  className="flex-1 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none disabled:opacity-40"
                />
                <button type="button" onClick={() => setPublishMode('schedule')}
                  className={`min-h-11 rounded-xl border px-3 text-xs font-bold transition ${
                    publishMode === 'schedule'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-text-muted hover:border-text-muted'
                  }`}
                  aria-pressed={publishMode === 'schedule'}
                >
                  Agendar
                </button>
              </div>

              {/* Ações principais */}
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => void handleSave('draft')} disabled={submitting}
                  className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl border border-border px-2 text-xs font-semibold text-text-secondary hover:border-text-muted disabled:opacity-40"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
                  Salvar rascunho
                </button>
                <button type="button"
                  onClick={() => publishMode === 'schedule' ? void handleSave('schedule') : void handleSave('publish')}
                  disabled={submitting || (publishMode === 'schedule' && !scheduledFor)}
                  className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl bg-accent px-2 text-xs font-bold text-accent-fg hover:bg-accent-hover disabled:opacity-40"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" aria-hidden /> : (
                    publishMode === 'schedule'
                      ? <CalendarClock size={14} aria-hidden />
                      : <Check size={14} aria-hidden />
                  )}
                  {publishMode === 'schedule' ? 'Agendar publicação' : 'Publicar no perfil'}
                </button>
                <button type="button" onClick={onClose} disabled={submitting}
                  className="min-h-11 rounded-xl border border-border px-2 text-xs font-semibold text-text-muted hover:text-text-primary disabled:opacity-40"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
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
    </div>
  );
};

// Removendo imports não usados
