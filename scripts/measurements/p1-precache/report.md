# P1 — precache do PWA contido e offline íntegro

Gerado em 2026-10-07 · gate: `node scripts/precache-report.mjs --limit=3185427`
(limite = baseline R7/R12, 3.185.427 B = 3,04 MiB).

## Antes / depois

| cenário | itens | bytes | MiB |
|---|---:|---:|---:|
| baseline R7/R12 (limite) | 107 | 3.185.427 | 3,04 |
| build pós-L2, `globPatterns` padrão (ESTOURA) | 122 | 3.412.136 | 3,25 |
| **depois (P1)** | **70** | **2.453.390** | **2,34** |

Δ: −958.746 B vs. build pós-L2; −732.037 B vs. baseline do limite.

## Composição do precache depois (P1)

| tipo | itens | bytes |
|---|---:|---:|
| js | 51 | 1.681.490 |
| img | 12 | 371.630 |
| css | 2 | 223.387 |
| fonte | 3 | 173.292 |
| html | 1 | 2.210 |
| manifest | 1 | 1.381 |
| **total** | **70** | **2.453.390** |

## O que mudou (`vite.config.ts`)

1. `workbox.globPatterns` explícito em vez de `**/*`:
   - shell: `index.html`, `favicon.png`, `brand/*.webp`, fontes latinas
     (DM Sans normal/itálico + Syne), cena climática `weather/*.jpg`;
   - fechamento estático de **todas** as rotas públicas (índice, landing,
     marketing, `/planos` + gráficos, `/login`+`/cadastro`, `/queue` →
     redirect, `/queue/:id`, páginas públicas por `lazy()` e
     `ScrollTrigger` do gsap);
   - ícones PWA (192/512, qualquer e mascarado) continuam entrando pelo
     próprio plugin a partir do `manifest`.
2. `includeAssets` removido: com ele as fontes íntegras e os ícones eram
   precachados **duas vezes** (mesma URL, duas revisões).
3. Regras novas de runtime **depois** de `NetworkOnly /api/`:
   - `StaleWhileRevalidate` em `/assets/` (painel autenticado, chunks fora
     do fechamento público) com `maxEntries: 160` / 30 dias;
   - `StaleWhileRevalidate` em `/fonts/` (latín-ext/grego) com
     `maxEntries: 16` / 365 dias.
   `/api/` segue `NetworkOnly` como primeira regra; `registerType: 'prompt'`
   intocado.

## Evidência

- Gate: `node scripts/precache-report.mjs --limit=3185427` → `OK:
  2453390 ≤ limite 3185427` (exit 1 ao estourar, mesmo papel do gate de
  chunks >500 kB).
- `e2e/pwa-offline.spec.ts` (6 passed, desktop + mobile, `serviceWorkers: 'allow'`):
  1. gate do precache ≤ 3.185.427 B lendo `dist/sw.js`;
  2. offline, **todas as 14 rotas públicas** abrem com `<h1>` visível
     (controle: `fetch('/api/plans')` offline tem de falhar) e `/planos`
     mostra o banner de erro da API em vez de quebrar;
  3. chunk fora do precache (ex.: painel) passa a ser legível offline após
     a primeira busca, provando o `StaleWhileRevalidate` de `/assets/`.
- Achado registrado durante o item: sem o fechamento das páginas
  públicas `lazy()` no precache, `/planos` offline caía no ErrorBoundary
  ("Erro 500") porque `PricingPersuasionCharts` rejeitava o import — foi o
  que motivou fechar o fechamento inteiro (+292.222 B) em vez do shell
  mínimo.
- Fora do precache por decisão: painel autenticado (cache de runtime),
  fontes latín-ext/grego (cache de runtime), `screenshots/` e
  `manifest` de lojas.

## Manutenção

Ao mudar o grafo de imports das rotas públicas: `npm run build && node
scripts/precache-report.mjs --limit=3185427` + `npx playwright test
e2e/pwa-offline.spec.ts`.
