# Item 4 — Decomposição do tempo da aba de agenda (margem do LCP real)

Data: 2026-10-08 · rota `/queue/1ac5be50-...?tab=appointments` · API real
(proxy `MEASURE_API_PROXY=1`) · Slow 4G + CPU 4× · 3 runs
(`scripts/measurements/item4-timing.mjs`).

## Números

| métrica | run 1 | run 2 | run 3 | mediana |
|---|---|---|---|---|
| DOMContentLoaded (boot do bundle) | 1273 ms | 1268 ms | 1275 ms | **1273 ms** |
| 1ª `/api/queue` (total percebido)* | 2468 ms | 1598 ms | 1649 ms | **1649 ms** |
| `/api/queue` polls seguintes (ttfb) | 720 ms | 145–345 ms | 45–103 ms | — |
| `public-content-usable` | 6347 ms | 3877 ms | 2686 ms | 3877 ms† |
| LCP real oficial (mediana de 5) | — | — | — | 2428/2432 ms |

\* TTFB detalhado não aparece no Resource Timing: o proxy do preview não envia
`Timing-Allow-Origin` (ttfb=0/size=0B) — o total é o custo real percebido.
† run 1 ruidoso (backend em cold start); a mediana oficial do LCP (2428/2432)
é a referência da margem: **~70 ms para o limite de 2500**.

## Leitura

- O boot do bundle termina ~1273 ms; a **1ª `/api/queue` domina** (~1.6 s,
  disputando banda com staff/services/feed no mesmo origin).
- A query é simples (`queueItem.findMany({ where: { barbershopId } })` com
  `include: { service }` em batch) e o índice **já existe**
  (`@@index([barbershopId, status, joinedAt])` em `schema.prisma`) — não é
  N+1 nem falta de índice.
- O conteúdo útil e o LCP ("Agenda") dependem do pacote de APIs públicas.

## Opções de ganho (PROPOSTAS — nada aplicado)

1. **`<link rel="preconnect">`** para a origem da API no `index.html` do front
   (em prod: origem de `VITE_API_URL`). Economia estimada: TCP+TLS+1 RTT na
   primeira chamada ≈ **150–450 ms** sob Slow 4G.
2. **Fetch antecipado de `/api/queue`** no entry do SPA (o `barbershopId` já
   está na URL desde o primeiro byte): desloca o início da chamada de
   ~1273 ms para o evaluate do bundle; ganho potencial **~300–600 ms** no
   conteúdo útil.
3. **Cache curto em `GET /api/queue`**: `Cache-Control: public, max-age=5` ou
   ETag/304 no controller (fila muda pouco em 5 s) — beneficia polls, voltas
   de aba e reaberturas; primeiro load não muda.
4. (Alternativa a 3) cache Redis de 5 s no useCase — efeito equivalente,
   decisão no backend.

Combinando 1+2, o LCP real tenderia a cair ~150–400 ms (mesma ordem do
adiantamento das APIs), levando a margem de ~70 ms para ~250–450 ms.
Qualquer aplicação exige nova medição antes/depois com o protocolo da rodada.

## Não testado

- Produção (medidas em preview local + backend local via proxy).
- Efeito real de `preconnect` em CDN/domínio cross-origin da Render.
