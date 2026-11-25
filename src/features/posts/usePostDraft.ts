import { useCallback, useEffect, useState } from 'react';
import { clearDraft, readDraft, writeDraft } from './draftStorage';
import {
  DRAFT_VERSION,
  type LocalDraftPayload,
  type PriceRow,
} from './postEditorShared';
import type { DesignContent, DesignOverrides } from '../../infra/postsApi';
import type { PostFormat, PostMode } from '../../types';
import type { ObjectiveId, PostType } from './objectives';

/** Campos do post gravados no rascunho local (espelha `LocalDraftPayload`). */
export interface PostDraftFields {
  objectiveId: ObjectiveId | null;
  templateKey: string;
  paletteKey: string;
  format: PostFormat;
  formatTouched: boolean;
  postMode: PostMode;
  type: PostType;
  title: string;
  ctaText: string;
  content: string;
  primaryMediaId: string | null;
  secondaryMediaId: string | null;
  priceItems: PriceRow[];
  businessName: string;
}

/** Estado do gerador de designs preservado no rascunho local. */
export interface PostDraftDesign {
  designKey?: string;
  designVersion?: number;
  designContent?: DesignContent;
  designOverrides?: DesignOverrides;
}

/**
 * Restaura o rascunho local ANTES do primeiro render dos estados, para que o
 * efeito de persistência nunca sobrescreva o rascunho salvo com valores vazios.
 * A gravação só vale para post novo (chave 'new'): abrir edição limpa qualquer
 * órfão histórico do mesmo id.
 */
export function useRestoredDraft(args: {
  userId: string;
  barbershopId: string;
  isEditing: boolean;
}) {
  const { userId, barbershopId, isEditing } = args;

  const [initialDraft] = useState<LocalDraftPayload | null>(() =>
    isEditing ? null : readDraft<LocalDraftPayload>(userId, barbershopId, 'new', DRAFT_VERSION),
  );

  return isEditing ? null : initialDraft;
}

/** Persiste o rascunho local sempre que um campo muda. */
export function usePersistDraft(args: {
  userId: string;
  barbershopId: string;
  storageKey: string;
  isEditing: boolean;
  fields: PostDraftFields;
  design: PostDraftDesign;
}) {
  const { userId, barbershopId, storageKey, isEditing, fields, design } = args;
  const {
    objectiveId, templateKey, paletteKey, format, formatTouched, postMode, type,
    title, ctaText, content, primaryMediaId, secondaryMediaId, priceItems, businessName,
  } = fields;
  const { designKey, designVersion, designContent, designOverrides } = design;

  const persistDraft = useCallback(() => {
    // Só post novo: a restauração usa exclusivamente a chave 'new', então
    // gravar rascunho local sob o id de um post existente criaria entradas órfãs
    // — nunca lidas hoje, mas capazes de sobrescrever dados do servidor se alguém
    // passasse a ler. Ao abrir edição, limpa qualquer órfão histórico do mesmo id.
    if (isEditing) {
      clearDraft(userId, barbershopId, storageKey);
      return;
    }
    writeDraft<LocalDraftPayload>(userId, barbershopId, storageKey, DRAFT_VERSION, {
      objectiveId, templateKey, paletteKey, format, formatTouched, postMode, type,
      title, ctaText, content, primaryMediaId, secondaryMediaId, priceItems, businessName,
      designKey,
      designVersion,
      designContent,
      designOverrides,
    });
  }, [
    isEditing, userId, barbershopId, storageKey, objectiveId, templateKey, paletteKey,
    format, formatTouched, postMode, type, title, ctaText, content, primaryMediaId,
    secondaryMediaId, priceItems, businessName, designKey, designVersion,
    designContent, designOverrides,
  ]);

  useEffect(() => { persistDraft(); }, [persistDraft]);
}
