import { useEffect, useMemo, useRef, useState } from 'react';
import { barbershopApi, type PostAiSuggestion } from '../../infra/barbershopApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { renderTextWarning, renderTextWarningMessage } from './renderTextGlyphs';
import {
  CTA_RENDER_MAX,
  itemsToRows,
  PRICE_BUSINESS_RENDER_MAX,
  PRICE_ITEM_RENDER_MAX,
  PRICE_MAX_ITEMS,
  readStoredPriceSplit,
  TITLE_RENDER_MAX,
  type LocalDraftPayload,
  type PostTone,
  type PriceRow,
} from './postEditorShared';
import type { FeedPost, PostMode, PriceSplitPayload, Service, ShopSettings } from '../../types';
import type { PostType } from './objectives';

/**
 * Campos exclusivos do editor legado: lista de preços, nome do negócio, tom de
 * voz e sugestões de IA. Também concentra os avisos de render (glifos e corte)
 * e o payload `priceSplit` enviado ao backend.
 */
export function useLegacyExtras(args: {
  draft: LocalDraftPayload | null;
  post: FeedPost | null;
  barbershopId: string;
  templateKey: string;
  type: PostType;
  postMode: PostMode;
  title: string;
  ctaText: string;
  shopServices: Service[];
  shopSettings: ShopSettings | null;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const {
    draft, post, barbershopId, templateKey, type, postMode, title, ctaText,
    shopServices, shopSettings, showToast,
  } = args;

  const [priceItems, setPriceItems] = useState<PriceRow[]>(() =>
    draft?.priceItems ?? itemsToRows(readStoredPriceSplit(post?.designOptions ?? null)?.items)
  );
  const [businessName, setBusinessName] = useState<string>(
    () => draft?.businessName ?? readStoredPriceSplit(post?.designOptions ?? null)?.businessName ?? ''
  );

  const [tone, setTone] = useState<PostTone>(null);
  const [extra, setExtra] = useState('');
  const [suggestions, setSuggestions] = useState<PostAiSuggestion[]>([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

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

  return {
    priceItems,
    businessName,
    tone,
    extra,
    suggestions,
    generatingSuggestions,
    isPriceSplit,
    priceSplitPayload,
    titleWarningMessage,
    ctaWarningMessage,
    priceItemWarnings,
    businessWarningMessage,
    setBusinessName,
    setTone,
    setExtra,
    updatePriceRow,
    addPriceRow,
    removePriceRow,
    importPriceServices,
    handleGenerate,
  };
}
