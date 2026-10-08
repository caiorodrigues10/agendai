import React from 'react';
import { LuLoaderCircle as Loader2 } from 'react-icons/lu';
import { Skeleton } from '../patterns/skeletons/Skeleton';

/**
 * Fallback de Suspense em rota pública (App/PublicShopRoute).
 * Sem texto visível: o <p> "Carregando..." era o LCP da rota
 * /queue/:id?tab=appointments em modo real (anomalia d1) — texto pequeno
 * pintado antes do conteúdo e nunca substituído como maior candidato.
 * Altura reservada (bloco skeleton) evita layout shift no swap; leitores
 * de tela ainda são avisados via role=status + sr-only.
 */
export const Loader: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="Carregando"
    className="flex items-center justify-center h-dvh w-full fixed inset-0 bg-background"
  >
    <div className="flex flex-col items-center gap-4 w-full max-w-xs px-6">
      <Loader2 className="animate-spin text-accent" size={32} />
      <div className="w-full space-y-2" aria-hidden>
        <Skeleton height="1rem" width="70%" />
        <Skeleton height="1rem" width="100%" />
        <Skeleton height="1rem" width="55%" />
      </div>
      <span className="sr-only">Carregando…</span>
    </div>
  </div>
);
