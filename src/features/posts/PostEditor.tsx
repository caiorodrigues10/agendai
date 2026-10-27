import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';
import {
  LuLoaderCircle as Loader2,
  LuChevronRight as ChevronRight,
  LuSparkles as Sparkles,
  LuDownload as Download,
  LuImagePlus as ImagePlus,
  LuCheck as Check,
  LuPalette as Palette,
  LuRectangleHorizontal as RectangleHorizontal,
  LuRectangleVertical as RectangleVertical,
  LuSmartphone as Smartphone,
  LuTrash2 as Trash2,
  LuImageOff as ImageOff,
} from 'react-icons/lu';
import { postsApi, type PostMedia, type PostPaletteDef, type PostTemplateDef } from '../../infra/postsApi';
import { barbershopApi, PostAiSuggestion } from '../../infra/barbershopApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FeedPost, PostFormat, PostMode, type PriceSplitPayload } from '../../types';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PostPreviewBox } from './PostPreviewBox';
import { TemplateThumbnail } from './TemplateThumbnail';
import { OBJECTIVES, type PostType, type ObjectiveId } from './objectives';
import { readDraft, writeDraft, clearDraft } from './draftStorage';
import {
  POST_MEDIA_MAX_BYTES,
  POST_MEDIA_MIN_SIDE,
  POST_MEDIA_FORMAT_HINT,
  mediaValidationErrorPT,
  validatePostMediaFile,
} from './postMediaValidation';
import { optimizeImageIfNeeded } from './optimizeImage';
import { BarbershopContext } from '../../contexts/BarbershopContext';
import { renderTextWarning, renderTextWarningMessage } from './renderTextGlyphs';

type PostTone = 'promocional' | 'informativo' | 'divertido' | null;
type EditorTab = 'content' | 'image' | 'format' | 'identity';

const GROUP_LABELS: Record<string, string> = {
  agenda: 'Agenda',
  ofertas: 'Ofertas',
  resultados: 'Resultados',
  equipe: 'Equipe',
  depoimentos: 'Depoimentos',
  editorial: 'Editorial',
  tipografia: 'Tipografia',
};

function groupLabel(key: string) {
  return GROUP_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
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
/** Limites que o motor de render aplica na imagem (Modelo #1 — manifesto). */
const TITLE_RENDER_MAX = 40;
const CTA_RENDER_MAX = 40;
/** Limites do modelo price-split (manifesto): lista e nome da marca. */
const PRICE_MAX_ITEMS = 8;
const PRICE_ITEM_RENDER_MAX = 48;
const PRICE_BUSINESS_RENDER_MAX = 60;

interface PriceRow {
  name: string;
  price: string;
}

/** Lista gravada no post (designOptions.priceSplit) → linhas do editor. */
function itemsToRows(items: PriceSplitPayload['items'] | undefined): PriceRow[] {
  return (items ?? []).map(item => ({
    name: item?.name ?? '',
    price: item?.price === null || item?.price === undefined ? '' : String(item.price),
  }));
}

/** Lê a lista salva no post p/ pré-carregar o editor na edição. */
function readStoredPriceSplit(designOptions: FeedPost['designOptions']): PriceSplitPayload | undefined {
  const value = designOptions?.priceSplit;
  if (!value || !Array.isArray(value.items)) return undefined;
  return { ...value, items: value.items ?? [] };
}

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
  objectiveId: ObjectiveId | null;
  templateKey: string;
  paletteKey: string;
  format: PostFormat;
  postMode: PostMode;
  type: PostType;
  title: string;
  ctaText: string;
  content: string;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  /** Opcional: rascunhos antigos não têm e caem no seed de serviços. */
  priceItems?: PriceRow[];
  businessName?: string;
}

// ─── Props ────────────────────────────────────────────────────

export interface PostEditorProps {
  post: FeedPost | null;
  barbershopId: string;
  userId: string;
  palettes: PostPaletteDef[];
  mediaLibrary: PostMedia[];
  onClose: () => void;
  onSaved: (status: 'draft' | 'published') => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onMediaUploaded: (m: PostMedia) => void;
  mediaLoading?: boolean;
  mediaError?: boolean;
  onRetryMedia?: () => void;
  onMediaRemoved?: (id: string) => void;
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
  mediaLoading = false,
  mediaError = false,
  onRetryMedia,
  onMediaRemoved,
}) => {
  const isEditing = !!post;
  const storageKey = post?.id ?? 'new';

  // Restaura o rascunho local ANTES do primeiro render dos estados, para que o
  // efeito de persistência nunca sobrescreva o rascunho salvo com valores vazios.
  const [initialDraft] = useState<LocalDraftPayload | null>(() =>
    post ? null : readDraft<LocalDraftPayload>(userId, barbershopId, 'new', DRAFT_VERSION)
  );
  const draft = !isEditing ? initialDraft : null;

  const [tab, setTab] = useState<EditorTab>('content');
  const [objectiveId, setObjectiveId] = useState<ObjectiveId | null>(draft?.objectiveId ?? null);
  const [templateKey, setTemplateKey] = useState(draft?.templateKey ?? post?.templateKey ?? 'agenda-aberta');
  const [paletteKey, setPaletteKey] = useState(draft?.paletteKey ?? post?.paletteKey ?? 'brand');
  const [format, setFormat] = useState<PostFormat>(draft?.format ?? post?.format ?? 'square');
  const [postMode, setPostMode] = useState<PostMode>(draft?.postMode ?? post?.postMode ?? 'both');
  const [type, setType] = useState<PostType>(draft?.type ?? post?.type ?? 'haircut');
  const [title, setTitle] = useState(draft?.title ?? post?.title ?? '');
  const [ctaText, setCtaText] = useState(draft?.ctaText ?? post?.ctaText ?? '');
  const [content, setContent] = useState(draft?.content ?? post?.content ?? '');
  const [primaryMediaId, setPrimaryMediaId] = useState<string | null>(draft?.primaryMediaId ?? post?.primaryMediaId ?? null);
  const [secondaryMediaId, setSecondaryMediaId] = useState<string | null>(draft?.secondaryMediaId ?? post?.secondaryMediaId ?? null);
  const [priceItems, setPriceItems] = useState<PriceRow[]>(() =>
    draft?.priceItems ?? itemsToRows(readStoredPriceSplit(post?.designOptions ?? null)?.items)
  );
  const [businessName, setBusinessName] = useState<string>(
    () => draft?.businessName ?? readStoredPriceSplit(post?.designOptions ?? null)?.businessName ?? ''
  );

  // Contexto cru (não o useBarbershop): o editor sobe fora do provider nos
  // testes/Storybook — aqui falta de serviços só esconde o botão de importar.
  const shopContext = useContext(BarbershopContext);
  const shopServices = shopContext?.services ?? [];
  const shopSettings = shopContext?.settings ?? null;

  const [templates, setTemplates] = useState<PostTemplateDef[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PostMedia | null>(null);
  const [deletingMedia, setDeletingMedia] = useState(false);

  const [tone, setTone] = useState<PostTone>(null);
  const [extra, setExtra] = useState('');
  const [suggestions, setSuggestions] = useState<PostAiSuggestion[]>([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(post?.imageUrl ?? null);
  const [previewStale, setPreviewStale] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mediaBusy = uploadingPhoto;

  const [showMediaPicker, setShowMediaPicker] = useState<'primary' | 'secondary' | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<'all' | 'with-photo' | 'no-photo'>('all');
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewSeqRef = useRef(0);
  const liveRef = useRef<{ templateKey: string; paletteKey: string; format: PostFormat; title: string; ctaText: string; primaryMediaId: string | null; secondaryMediaId: string | null; postMode: PostMode; type: PostType; priceSplit: PriceSplitPayload | undefined }>({
    templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId, postMode, type, priceSplit: undefined,
  });

  // Catálogo de modelos: postsApi.templates() é a fonte única.
  useEffect(() => {
    let cancelled = false;
    setTemplatesLoading(true);
    postsApi.templates()
      .then(list => { if (!cancelled) setTemplates(list); })
      .catch(() => { if (!cancelled) showToast('Não foi possível carregar os modelos.', 'error'); })
      .finally(() => { if (!cancelled) setTemplatesLoading(false); });
    return () => { cancelled = true; };
  }, [showToast]);

  const selectedTemplate = useMemo(() => templates.find(t => t.key === templateKey), [templates, templateKey]);
  const selectedPhotoMode = templatePhotoMode(selectedTemplate);

  // Reconciliação: rascunho/post podem guardar um mediaId que já não existe na
  // biblioteca (ex.: foto excluída em outra sessão). Quando a lista está pronta
  // (sem loading/erro), limpa o id órfão e avisa.
  useEffect(() => {
    if (mediaLoading || mediaError) return;
    const orphanPrimary = primaryMediaId && !mediaLibrary.some(m => m.id === primaryMediaId);
    const orphanSecondary = secondaryMediaId && !mediaLibrary.some(m => m.id === secondaryMediaId);
    if (!orphanPrimary && !orphanSecondary) return;
    if (orphanPrimary) setPrimaryMediaId(null);
    if (orphanSecondary) setSecondaryMediaId(null);
    showToast('A foto selecionada não está mais disponível.', 'error');
  }, [mediaLibrary, mediaLoading, mediaError, primaryMediaId, secondaryMediaId, showToast]);

  const templateGroups = useMemo(() => {
    const seen = new Map<string, string>();
    for (const t of templates) {
      const g = t.group ?? 'outros';
      if (!seen.has(g)) seen.set(g, groupLabel(g));
    }
    return Array.from(seen, ([key, label]) => ({ key, label }));
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (templateFilter === 'all') return templates;
    return templates.filter(t =>
      templateFilter === 'with-photo' ? templatePhotoMode(t) !== 'none' : templatePhotoMode(t) === 'none'
    );
  }, [templates, templateFilter]);

  const isPriceSplit = templateKey === 'price-split';

  // Seed único: ao escolher o modelo, puxa os serviços do salão (até 8) e o
  // nome do negócio. `priceSeededRef` evita reimportar quando o usuário limpa
  // a lista manualmente.
  const priceSeededRef = useRef(false);
  useEffect(() => {
    if (!isPriceSplit || priceSeededRef.current) return;
    priceSeededRef.current = true;
    if (priceItems.length > 0) return;
    const rows = itemsToRows(
      shopServices
        .filter(service => service.name.trim())
        .slice(0, PRICE_MAX_ITEMS)
        .map(service => ({ name: service.name, price: service.price ?? null }))
    );
    if (rows.length) setPriceItems(rows);
  }, [isPriceSplit, priceItems.length, shopServices]);

  useEffect(() => {
    if (!isPriceSplit || businessName || !shopSettings?.shopName) return;
    setBusinessName(shopSettings.shopName);
  }, [isPriceSplit, businessName, shopSettings?.shopName]);

  /** Payload enviado na prévia/salvamento (somente no modelo price-split). */
  const priceSplitPayload = useMemo<PriceSplitPayload | undefined>(() => {
    if (!isPriceSplit) return undefined;
    const items = priceItems
      .map(row => ({ name: row.name.trim(), price: row.price.trim() ? row.price.trim() : null }))
      .filter(item => item.name);
    return {
      items,
      businessName: businessName.trim() || undefined,
      whatsapp: shopSettings?.whatsapp || undefined,
    };
  }, [isPriceSplit, priceItems, businessName, shopSettings]);

  // Avisa o usuário quando o render da imagem vai descartar o que ele digitou
  // (sem glifo na fonte do motor) ou cortar o texto no limite do modelo.
  const titleWarning = useMemo(() => renderTextWarning(title, TITLE_RENDER_MAX), [title]);
  const ctaWarning = useMemo(() => renderTextWarning(ctaText, CTA_RENDER_MAX), [ctaText]);
  const titleWarningMessage = useMemo(
    () => renderTextWarningMessage(titleWarning, 'Título', TITLE_RENDER_MAX),
    [titleWarning],
  );
  const ctaWarningMessage = useMemo(
    () => (ctaWarning.dropped.length || ctaWarning.truncated ? renderTextWarningMessage(ctaWarning, 'CTA', CTA_RENDER_MAX) : ''),
    [ctaWarning],
  );
  const priceItemWarnings = useMemo(
    () =>
      priceItems.map(row =>
        renderTextWarningMessage(renderTextWarning(row.name, PRICE_ITEM_RENDER_MAX), 'Serviço', PRICE_ITEM_RENDER_MAX)
      ),
    [priceItems],
  );
  const businessWarningMessage = useMemo(
    () =>
      renderTextWarningMessage(
        renderTextWarning(businessName, PRICE_BUSINESS_RENDER_MAX),
        'Nome do negócio',
        PRICE_BUSINESS_RENDER_MAX
      ),
    [businessName],
  );

  const persistDraft = useCallback(() => {
    writeDraft<LocalDraftPayload>(userId, barbershopId, storageKey, DRAFT_VERSION, {
      objectiveId, templateKey, paletteKey, format, postMode, type, title, ctaText,
      content, primaryMediaId, secondaryMediaId, priceItems, businessName,
    });
  }, [userId, barbershopId, storageKey, objectiveId, templateKey, paletteKey, format, postMode, type, title, ctaText, content, primaryMediaId, secondaryMediaId, priceItems, businessName]);

  useEffect(() => { persistDraft(); }, [persistDraft]);

  const triggerPreview = useCallback(() => {
    if (!barbershopId) return;
    setPreviewStale(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const snap = liveRef.current;
      const seq = ++previewSeqRef.current;
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
          priceSplit: snap.priceSplit,
        });
        const cur = liveRef.current;
        // Ignora respostas fora de ordem e qualquer mudança de estado posterior,
        // incluindo postMode/type.
        if (
          seq !== previewSeqRef.current ||
          cur.templateKey !== snap.templateKey ||
          cur.paletteKey !== snap.paletteKey ||
          cur.format !== snap.format ||
          cur.title !== snap.title ||
          cur.ctaText !== snap.ctaText ||
          cur.primaryMediaId !== snap.primaryMediaId ||
          cur.secondaryMediaId !== snap.secondaryMediaId ||
          cur.postMode !== snap.postMode ||
          cur.type !== snap.type ||
          cur.priceSplit !== snap.priceSplit
        ) {
          return;
        }
        setPreviewUrl(url);
        setPreviewStale(false);
      } catch {
        if (seq !== previewSeqRef.current) return;
        showToast('Não foi possível gerar a prévia.', 'error');
        setPreviewStale(true);
      } finally {
        if (seq === previewSeqRef.current) setPreviewLoading(false);
      }
    }, 500);
  }, [barbershopId, showToast]);

  useEffect(() => {
    liveRef.current = { templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId, postMode, type, priceSplit: priceSplitPayload };
    triggerPreview();
  }, [templateKey, paletteKey, format, title, ctaText, primaryMediaId, secondaryMediaId, postMode, type, priceSplitPayload, triggerPreview]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Invalida qualquer preview em voo ao desmontar.
    previewSeqRef.current += 1;
  }, []);

  const pickObjective = (id: ObjectiveId) => {
    const obj = OBJECTIVES.find(o => o.id === id);
    if (!obj) return;
    setObjectiveId(id);
    setTemplateKey(obj.templateKey);
    setType(obj.type);
    setTab('content');
  };

  const updatePriceRow = (index: number, patch: Partial<PriceRow>) =>
    setPriceItems(rows => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const addPriceRow = () =>
    setPriceItems(rows => (rows.length < PRICE_MAX_ITEMS ? [...rows, { name: '', price: '' }] : rows));

  const removePriceRow = (index: number) => setPriceItems(rows => rows.filter((_, i) => i !== index));

  const importPriceServices = () => {
    const rows = itemsToRows(
      shopServices
        .filter(service => service.name.trim())
        .slice(0, PRICE_MAX_ITEMS)
        .map(service => ({ name: service.name, price: service.price ?? null }))
    );
    if (!rows.length) return;
    setPriceItems(rows);
    if (!businessName && shopSettings?.shopName) setBusinessName(shopSettings.shopName);
    showToast('Serviços importados para a lista de preços.');
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
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length || !barbershopId || uploadingPhoto) return;
    const target = showMediaPicker;
    setUploadingPhoto(true);
    const uploaded: PostMedia[] = [];
    const errors: string[] = [];
    try {
      for (const [index, file] of files.entries()) {
        const progressLabel = files.length > 1 ? `${index + 1} de ${files.length}` : null;
        let candidate = file;
        if (file.size > POST_MEDIA_MAX_BYTES) {
          setUploadProgress(progressLabel ? `Otimizando foto ${progressLabel}…` : 'Otimizando foto…');
          candidate = await optimizeImageIfNeeded(file);
        }
        setUploadProgress(progressLabel ? `Enviando ${progressLabel}…` : 'Enviando foto…');
        const validation = await validatePostMediaFile(candidate);
        if (validation.error) {
          const reason = mediaValidationErrorPT(validation.error, validation);
          errors.push(files.length > 1 ? `${file.name}: ${reason}` : reason);
          continue;
        }
        try {
          const media = await postsApi.uploadMedia(barbershopId, candidate, { inGallery: true });
          uploaded.push(media);
          onMediaUploaded(media);
        } catch (err) {
          const reason = getErrorMessage(err, 'Não foi possível enviar a imagem.');
          errors.push(files.length > 1 ? `${file.name}: ${reason}` : reason);
        }
      }
    } finally {
      setUploadingPhoto(false);
      setUploadProgress(null);
    }
    // Auto-seleciona no slot somente quando um único arquivo foi enviado.
    if (uploaded.length === 1 && files.length === 1) {
      if (target === 'primary') setPrimaryMediaId(uploaded[0].id);
      else if (target === 'secondary') setSecondaryMediaId(uploaded[0].id);
      setShowMediaPicker(null);
      showToast('Imagem adicionada à biblioteca.');
    } else if (uploaded.length > 0) {
      showToast(
        uploaded.length === 1
          ? '1 foto enviada à biblioteca. Toque em uma foto para usá-la.'
          : `${uploaded.length} fotos enviadas à biblioteca. Toque em uma foto para usá-la.`
      );
    }
    // Resumo das falhas: continua as demais e lista o que falhou e por quê.
    if (errors.length === 1 && files.length === 1) {
      showToast(errors[0], 'error');
    } else if (errors.length > 0) {
      const listed = errors.slice(0, 3).map((msg, i) => `${i + 1}) ${msg}`).join(' ');
      const extraCount = errors.length - 3;
      showToast(
        `${errors.length} de ${files.length} fotos não foram enviadas. ${listed}${extraCount > 0 ? ` (+${extraCount} mais)` : ''}`,
        'error'
      );
    }
  };

  const handleSave = async (action: 'draft' | 'publish') => {
    if (!barbershopId || submitting || mediaBusy) return;
    if (action !== 'draft' && (!selectedTemplate || templatesLoading)) {
      showToast('Aguarde o carregamento e selecione um modelo.', 'error');
      return;
    }
    if (action !== 'draft' && selectedTemplate && (
      (selectedTemplate.requiredMedia >= 1 && !primaryMediaId) ||
      (selectedTemplate.requiredMedia >= 2 && !secondaryMediaId)
    )) {
      showToast('Adicione as fotos exigidas pelo modelo antes de publicar.', 'error');
      setTab('image');
      return;
    }
    if (action !== 'draft' && isPriceSplit && !priceSplitPayload?.items.length) {
      showToast('Adicione ao menos um serviço à lista de preços.', 'error');
      setTab('content');
      return;
    }
    setSubmitting(true);
    try {
      let targetId = post?.id;

      if (isEditing) {
        // Sem videoUrl no payload: posts antigos com vídeo preservam o campo
        // (o backend só altera videoUrl quando ele é enviado).
        await postsApi.update(targetId!, {
          title: title || undefined,
          ctaText: ctaText || undefined,
          content,
          postMode, templateKey, format, paletteKey,
          primaryMediaId, secondaryMediaId,
          priceSplit: priceSplitPayload,
        });
      } else {
        const created = await postsApi.create({
          barbershopId, type, postMode,
          title: title || undefined,
          ctaText: ctaText || undefined,
          content: content.trim() ? content : undefined,
          templateKey, format, paletteKey,
          primaryMediaId, secondaryMediaId,
          priceSplit: priceSplitPayload,
          status: 'draft',
        });
        targetId = created.id;
      }

      if (action === 'publish') {
        await postsApi.publish(targetId!);
        clearDraft(userId, barbershopId, storageKey);
        onSaved('published');
        showToast('Post publicado no perfil.');
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

  /** Exclui a foto da biblioteca. Se o id estiver em uso neste rascunho/edição,
   * limpa o slot. O back bloqueia (409) fotos usadas em outros posts não
   * publicados; em posts publicados a arte já materializada permanece. */
  const handleDeleteMedia = async () => {
    if (!deleteTarget || deletingMedia) return;
    setDeletingMedia(true);
    try {
      await postsApi.deleteMedia(deleteTarget.id);
      if (primaryMediaId === deleteTarget.id) setPrimaryMediaId(null);
      if (secondaryMediaId === deleteTarget.id) setSecondaryMediaId(null);
      onMediaRemoved?.(deleteTarget.id);
      setDeleteTarget(null);
      showToast('Foto removida da biblioteca.');
    } catch (err) {
      showToast(getErrorMessage(err, 'Não foi possível remover a foto.'), 'error');
    } finally {
      setDeletingMedia(false);
    }
  };

  const handleSelectTemplate = (key: string) => {
    setTemplateKey(key);
    setShowTemplatePicker(false);
  };

  if (!objectiveId && !isEditing) {
    return (
      <EditorDialog>
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
      </EditorDialog>
    );
  }

  return (
    <EditorDialog>
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-surface sm:h-auto sm:max-h-[92vh] sm:rounded-2xl sm:border sm:border-border">
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
          <details className="border-b border-border p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold text-accent">Ver prévia do post</summary>
            <div className="mt-4">
              <PostPreviewBox format={format} previewUrl={previewUrl} loading={previewLoading} stale={previewStale} />
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
                    type="text"
                    maxLength={80}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex.: Corte + barba por R$ 45"
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                    aria-describedby={titleWarningMessage ? 'post-title-render-warning' : undefined}
                  />
                  {titleWarningMessage && (
                    <p id="post-title-render-warning" role="status" className="mt-1 text-[11px] leading-snug text-warning">
                      {titleWarningMessage}
                    </p>
                  )}
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
                    aria-describedby={ctaWarningMessage ? 'post-cta-render-warning' : undefined}
                  />
                  {ctaWarningMessage && (
                    <p id="post-cta-render-warning" role="status" className="mt-1 text-[11px] leading-snug text-warning">
                      {ctaWarningMessage}
                    </p>
                  )}
                </div>

                {/* Lista de preços (modelo price-split) */}
                {isPriceSplit && (
                  <div data-testid="price-split-editor">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-bold text-text-secondary">Serviços e preços</span>
                      <span className="text-[10px] text-text-muted">{priceItems.length}/{PRICE_MAX_ITEMS}</span>
                    </div>
                    <div className="space-y-2">
                      {priceItems.map((row, index) => (
                        <div key={index} className="rounded-xl border border-border p-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={row.name}
                              maxLength={100}
                              onChange={e => updatePriceRow(index, { name: e.target.value })}
                              placeholder={`Serviço ${index + 1}`}
                              aria-label={`Nome do serviço ${index + 1}`}
                              className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-2.5 py-2 text-sm focus:border-accent focus:outline-none"
                              aria-describedby={priceItemWarnings[index] ? `price-item-warning-${index}` : undefined}
                            />
                            <input
                              type="text"
                              inputMode="decimal"
                              value={row.price}
                              maxLength={16}
                              onChange={e => updatePriceRow(index, { price: e.target.value })}
                              placeholder="45,90"
                              aria-label={`Preço do serviço ${index + 1}`}
                              className="w-24 rounded-lg border border-border bg-bg px-2.5 py-2 text-sm focus:border-accent focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removePriceRow(index)}
                              disabled={priceItems.length <= 1}
                              className="rounded-lg px-2 text-text-muted hover:text-danger disabled:opacity-40"
                              aria-label={`Remover serviço ${index + 1}`}
                            >
                              <Trash2 size={15} aria-hidden />
                            </button>
                          </div>
                          {priceItemWarnings[index] && (
                            <p id={`price-item-warning-${index}`} role="status" className="mt-1 text-[11px] leading-snug text-warning">
                              {priceItemWarnings[index]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {priceItems.length < PRICE_MAX_ITEMS && (
                        <button
                          type="button"
                          onClick={addPriceRow}
                          className="rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-text-secondary hover:border-accent hover:text-accent"
                        >
                          + Adicionar serviço
                        </button>
                      )}
                      {shopServices.length > 0 && (
                        <button
                          type="button"
                          onClick={importPriceServices}
                          className="rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-text-secondary hover:border-accent hover:text-accent"
                        >
                          Importar dos meus serviços
                        </button>
                      )}
                    </div>
                    <div className="mt-3">
                      <label htmlFor="post-business-name" className="mb-1 block text-xs font-bold text-text-secondary">Nome do negócio</label>
                      <input
                        id="post-business-name"
                        type="text"
                        maxLength={120}
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        placeholder={shopSettings?.shopName || 'Ex.: Barber Test'}
                        className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                        aria-describedby={businessWarningMessage ? 'post-business-render-warning' : undefined}
                      />
                      {businessWarningMessage && (
                        <p id="post-business-render-warning" role="status" className="mt-1 text-[11px] leading-snug text-warning">
                          {businessWarningMessage}
                        </p>
                      )}
                    </div>
                  </div>
                )}

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
                <p className="text-xs font-bold text-text-secondary">Foto do post</p>
                {mediaError && (
                  <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3">
                    <p className="text-xs font-semibold text-danger">Não foi possível carregar a biblioteca de fotos.</p>
                    <Button variant="secondary" size="sm" onClick={() => onRetryMedia?.()} disabled={mediaLoading}>
                      Tentar novamente
                    </Button>
                  </div>
                )}
                {selectedPhotoMode !== 'none' && (
                  <div className="flex flex-wrap gap-3">
                    {(['primary', 'secondary'] as const).map(slot => {
                      if (slot === 'secondary' && (selectedTemplate?.requiredMedia ?? 0) < 2) return null;
                      const mediaId = slot === 'primary' ? primaryMediaId : secondaryMediaId;
                      const media = mediaLibrary.find(m => m.id === mediaId);
                      const required = selectedPhotoMode === 'required' && (selectedTemplate?.requiredMedia ?? 0) >= (slot === 'primary' ? 1 : 2);
                      if (mediaLoading && mediaId && !media) {
                        return (
                          <div key={slot} aria-busy="true" aria-label="Carregando foto" className="flex h-36 w-40 animate-pulse flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-bg p-2">
                            <div className="h-20 w-full rounded bg-surface" />
                            <span className="text-[10px] text-text-muted">Carregando…</span>
                          </div>
                        );
                      }
                      return (
                        <button key={slot} type="button"
                          aria-label={slot === 'primary' ? 'Foto principal' : 'Foto secundária'}
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
                              {required
                                ? <span className="text-[10px] font-bold text-warning">Requerida</span>
                                : <span className="text-[10px] text-text-muted">Opcional</span>}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {(primaryMediaId || secondaryMediaId) && (
                  <div className="flex flex-wrap gap-2">
                    {primaryMediaId && (
                      <Button variant="secondary" size="sm" onClick={() => setPrimaryMediaId(null)} disabled={mediaBusy}
                        className="gap-1.5"
                      >
                        <Trash2 size={13} aria-hidden /> Remover foto principal
                      </Button>
                    )}
                    {secondaryMediaId && (
                      <Button variant="secondary" size="sm" onClick={() => setSecondaryMediaId(null)} disabled={mediaBusy}
                        className="gap-1.5"
                      >
                        <Trash2 size={13} aria-hidden /> Remover foto secundária
                      </Button>
                    )}
                  </div>
                )}
                {selectedPhotoMode === 'none' && (
                  templatesLoading ? (
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-bg/50 p-4 text-xs text-text-muted">
                      <Loader2 size={14} className="animate-spin" aria-hidden /> Carregando modelos…
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-bg/50 p-4">
                      <p className="text-sm font-bold text-text-primary">Este modelo não usa foto</p>
                      <p className="mt-1 text-xs leading-relaxed text-text-muted">
                        A arte é composta apenas com tipografia e identidade do salão. Se preferir usar
                        uma foto sua, troque por um modelo com foto.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => { setTemplateFilter('with-photo'); setShowTemplatePicker(true); }}
                        className="mt-3 gap-1.5"
                      >
                        Ver modelos com foto
                      </Button>
                    </div>
                  )
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
                  {templatesLoading ? (
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Loader2 size={13} className="animate-spin" aria-hidden /> Carregando modelos…
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {templateGroups.map(group => {
                        const items = templates.filter(t => (t.group ?? 'outros') === group.key);
                        if (items.length === 0) return null;
                        return (
                          <div key={group.key}>
                            <p className="mb-1 text-[10px] font-bold uppercase text-text-muted">{group.label}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {items.map(t => (
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
                  )}
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
            <Button variant="secondary" onClick={onClose} disabled={submitting || mediaBusy}
              className="gap-1.5"
            >
              Cancelar
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => void handleSave('draft')} disabled={submitting || mediaBusy}
                className="gap-1.5"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
                Rascunho
              </Button>
              <Button variant="primary"
                onClick={() => void handleSave('publish')}
                disabled={submitting || mediaBusy || templatesLoading}
                className="gap-2 px-5"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Check size={14} aria-hidden />}
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Overlay */}
      {showMediaPicker && (
        <div className="absolute inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Fechar seletor de fotos"
            disabled={uploadingPhoto}
            onClick={() => setShowMediaPicker(null)}
            className="absolute inset-0 cursor-default bg-black/80 disabled:cursor-wait"
          />
          <FocusLock returnFocus className="relative w-full max-w-lg">
            <div role="dialog" aria-modal="true" aria-labelledby="media-picker-title"
              className="w-full max-w-lg rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h4 id="media-picker-title" className="text-sm font-bold text-text-primary">Escolher foto</h4>
                <button type="button" onClick={() => setShowMediaPicker(null)} disabled={uploadingPhoto} className="rounded-lg p-1 text-text-muted hover:bg-bg disabled:opacity-40" aria-label="Fechar">
                  ✕
                </button>
              </div>
              <div className="max-h-[min(70vh,28rem)] overflow-y-auto p-4">
                {mediaLoading ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="status" aria-busy="true" aria-label="Carregando fotos">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="aspect-square animate-pulse rounded-xl bg-surface" />
                    ))}
                  </div>
                ) : mediaError ? (
                  <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
                    <p className="text-sm font-semibold text-text-secondary">Não foi possível carregar a biblioteca de fotos.</p>
                    <Button variant="secondary" size="sm" onClick={() => onRetryMedia?.()}>
                      Tentar novamente
                    </Button>
                  </div>
                ) : mediaLibrary.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <ImageOff size={28} className="text-text-muted" aria-hidden />
                    <p className="text-sm font-bold text-text-primary">Envie a primeira foto do seu salão</p>
                    <p className="text-xs text-text-muted">
                      {POST_MEDIA_FORMAT_HINT} · até {Math.round(POST_MEDIA_MAX_BYTES / (1024 * 1024))} MB · mínimo {POST_MEDIA_MIN_SIDE}px
                    </p>
                    <Button variant="primary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} className="mt-2 gap-1.5">
                      <ImagePlus size={14} aria-hidden /> Enviar foto
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {mediaLibrary.map((m, index) => {
                      const isSelected = (showMediaPicker === 'primary' ? primaryMediaId : secondaryMediaId) === m.id;
                      const otherSlotId = showMediaPicker === 'primary' ? secondaryMediaId : primaryMediaId;
                      const usedInOtherSlot = m.id === otherSlotId;
                      return (
                        <div key={m.id} className="relative">
                          <button
                            type="button"
                            disabled={uploadingPhoto || usedInOtherSlot}
                            aria-label={`Foto ${index + 1}`}
                            aria-pressed={isSelected}
                            title={usedInOtherSlot
                              ? (showMediaPicker === 'primary' ? 'Já usada na foto secundária' : 'Já usada na foto principal')
                              : undefined}
                            onClick={() => {
                              if (showMediaPicker === 'primary') setPrimaryMediaId(m.id);
                              else setSecondaryMediaId(m.id);
                              setShowMediaPicker(null);
                            }}
                            className={`relative block aspect-square w-full overflow-hidden rounded-xl border-2 disabled:opacity-50 ${
                              isSelected ? 'border-accent' : 'border-transparent'
                            }`}
                          >
                            <img
                              src={m.url}
                              alt={`Foto ${index + 1} da biblioteca`}
                              className="h-full w-full object-cover"
                            />
                            {usedInOtherSlot && (
                              <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[9px] font-bold text-white">
                                Em uso
                              </span>
                            )}
                          </button>
                          {isSelected && (
                            <span className="pointer-events-none absolute right-1 top-1 rounded-full bg-accent p-0.5 text-accent-fg">
                              <Check size={11} aria-hidden />
                            </span>
                          )}
                          {!usedInOtherSlot && (
                            <button
                              type="button"
                              disabled={uploadingPhoto || deletingMedia}
                              onClick={() => setDeleteTarget(m)}
                              className="absolute bottom-1 right-1 rounded-lg bg-black/60 p-1 text-white transition hover:bg-black/80 disabled:opacity-40"
                              aria-label={`Remover foto ${index + 1} da biblioteca`}
                            >
                              <Trash2 size={12} aria-hidden />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="border-t border-border p-4">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e => void handleUpload(e)} />
                <Button variant="primary" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
                  className="w-full gap-2 text-xs"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 size={15} className="animate-spin" aria-hidden /> {uploadProgress ?? 'Enviando foto…'}
                    </>
                  ) : (
                    <>
                      <ImagePlus size={15} aria-hidden /> Enviar nova foto
                    </>
                  )}
                </Button>
                {uploadingPhoto && (
                  <p role="status" className="mt-2 text-center text-[10px] text-text-muted">{uploadProgress ?? 'Enviando foto…'}</p>
                )}
              </div>
            </div>
          </FocusLock>
        </div>
      )}

      {/* Confirmar exclusão de foto da biblioteca */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remover foto"
        message={
          deleteTarget && (deleteTarget.id === primaryMediaId || deleteTarget.id === secondaryMediaId)
            ? 'Esta foto está no slot deste post. Ao removê-la, o slot ficará vazio. A foto sai da biblioteca permanentemente. Continuar?'
            : 'A foto será removida da biblioteca permanentemente. Publicações já publicadas mantêm a imagem gerada. Continuar?'
        }
        confirmLabel="Remover"
        variant="danger"
        loading={deletingMedia}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDeleteMedia()}
      />

      {/* Template Picker Overlay */}
      {showTemplatePicker && (
        <div className="absolute inset-0 z-[110] flex items-end justify-center bg-black/80 sm:items-center sm:p-4">
          <FocusLock returnFocus className="w-full max-w-lg">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h4 className="text-sm font-bold text-text-primary">Escolher modelo</h4>
              <button type="button" onClick={() => setShowTemplatePicker(false)} className="rounded-lg p-1 text-text-muted hover:bg-bg" aria-label="Fechar">
                ✕
              </button>
            </div>
            <div className="flex gap-1.5 border-b border-border px-4 pt-3 pb-2 overflow-x-auto">
              {([
                { id: 'all', label: 'Todos' },
                { id: 'with-photo', label: 'Com foto' },
                { id: 'no-photo', label: 'Sem foto' },
              ] as const).map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTemplateFilter(f.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    templateFilter === f.id ? 'bg-accent text-accent-fg' : 'text-text-muted hover:bg-bg'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              {templatesLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-xs text-text-muted">
                  <Loader2 size={14} className="animate-spin" aria-hidden /> Carregando modelos…
                </div>
              ) : filteredTemplates.length === 0 ? (
                <p className="py-8 text-center text-xs text-text-muted">Nenhum modelo neste filtro.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredTemplates.map(t => {
                    const photoMode = templatePhotoMode(t);
                    return (
                      <div
                        key={t.key}
                        className={`overflow-hidden rounded-xl border text-left transition ${
                          templateKey === t.key
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent/40'
                        }`}
                      >
                        <div className="relative">
                          <TemplateThumbnail
                            barbershopId={barbershopId}
                            templateKey={t.key}
                            format={format}
                            paletteKey={paletteKey}
                            alt={`Prévia do modelo ${t.name}`}
                          />
                          <button type="button" onClick={() => handleSelectTemplate(t.key)} aria-label={`Selecionar modelo ${t.name}`} className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent" />
                          {templateKey === t.key && (
                            <span className="pointer-events-none absolute right-1.5 top-1.5 z-10 rounded-full bg-accent p-1 text-accent-fg">
                              <Check size={11} aria-hidden />
                            </span>
                          )}
                        </div>
                        <button type="button" onClick={() => handleSelectTemplate(t.key)} className="w-full space-y-0.5 p-2.5 text-left">
                          <p className="text-xs font-bold text-text-primary">{t.name}</p>
                          {t.description && <p className="text-[10px] leading-snug text-text-muted">{t.description}</p>}
                          <span className="inline-block rounded bg-bg px-1.5 py-0.5 text-[9px] font-bold uppercase text-text-muted">
                            {photoMode === 'none' ? 'Sem foto' : photoMode === 'required' ? `Requer ${t.requiredMedia} foto(s)` : 'Foto opcional'}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
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
