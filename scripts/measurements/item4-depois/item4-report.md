# ITEM 4 — Skeleton sem texto visível + mark de conteúdo útil na fila pública

Data: 2026-10-08 · branch `fix/lcp-precache`.

## Problema

Na rota `/queue/:id?tab=appointments` com API real, o LCP era o `<p>Carregando...`
do `Loader` (Suspense fallback em `App.tsx`/`PublicShopRoute.tsx`): texto pequeno
(88×20px) pintado ~1,3 s e mantido como maior candidato mesmo depois do conteúdo
real (~2,4 s) — medições `item4-antes` confirmaram LCP=1304/1312 ms no texto de
loading, com 1 única entrada LCP em 5/5 execuções (o conteúdo real não
substituía o candidato por ser menor/pintar junto).

## Mudanças

1. **`src/components/ui/Loader.tsx`** — sem texto visível "Carregando...":
   spinner + 3 blocos `Skeleton` (altura reservada, sem layout shift no swap),
   `role="status"` + `aria-busy="true"` + nome acessível, rótulo `sr-only`
   "Carregando…".
2. **`src/pages/PublicHome.tsx`** — `performance.mark('public-content-ready')` e
   `performance.measure('public-content-usable', { start: 0, end: ... })` na
   primeira transição `stillLoading → conteúdo real`, uma vez por montagem.
   A duração do measure = ms desde `timeOrigin` até o conteúdo útil.

## Testes (fail-before comprovado)

- **unit** `src/tests/loader-item4.test.tsx` (3 testes): sem texto visível,
   status acessível, skeleton com altura reservada. Com o Loader antigo: **3/3
  falham**; com o novo: 3/3 passam.
- **e2e** `e2e/queue-content-mark.spec.ts` (desktop + mobile chromium): aba
  Agenda visível, zero nós com "Carregando..." visível, `public-content-ready`
  emitido e `public-content-usable` > 0. Sem o efeito em `PublicHome`: **falha**
  (`marks=0`); com o efeito: passa (1,5 s).

## Medição (item4-antes → item4-depois, Slow 4G + CPU 4×, mediana de 5)

Rota `/queue/1ac5be50-...-ab18cf24aeab?tab=appointments`:

| cenário | LCP antes | LCP depois | elemento LCP depois | CLS antes→depois |
|---|---|---|---|---|
| off@375 | 2220 ms (mensagem de erro) | 2248 ms | mensagem de erro (off sem API) | 0 → 0 |
| real@375 | **1312 ms "Carregando..."** | **2428 ms** | botão "Agenda" (conteúdo real) | 0 → 0 |
| off@1440 | 2220 ms | 2224 ms | mensagem de erro | 0 → 0 |
| real@1440 | **1304 ms "Carregando..."** | **2432 ms** | botão "Agenda" (conteúdo real) | 0 → 0 |

- LCP real reflete agora o **conteúdo útil** (≤2500 ms nas 2 larguras).
- Diagnóstico `--lcp` (5 execuções): elemento estável "Agenda" em todas;
  mediana 2444/2452 ms (off 2232/2244 ms).
- As demais rotas-chave (KEY_ROUTES) ficaram na mesma faixa (≤2248 ms off,
  ≤2432 ms real, CLS ≤0,036 — sem regressão).

## Gates

- typecheck 0 · lint 0 erros/480 warnings (baseline) · vitest **134 arquivos /
  596 testes** verdes (133/593 + 3 novos) · e2e queue-content-mark 2/2 ·
  suíte preview completa verificada no commit.

## Não testado

- Rota real em domínio de produção (medida contra preview local + backend local).
- Safari/iOS físico (só chromium desktop+mobile; WebKit coberto pelo ITEM 2).
