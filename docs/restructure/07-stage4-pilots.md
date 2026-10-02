# Etapa 4 — Pilotos: layouts + queue

> Status: **concluída** — 4a/4b/4c(adiado, justificado)/4d/4e fechados.
> Anterior: [06-stage3-components](06-stage3-components.md).

## 1. Layouts

- **4a `layouts/admin/`** — `AdminLayout` movido de `components/domain/admin/`; import lazy do
  App (`/master`) preservado com novo path; internos `AuthContext`/`ThemeToggle` ajustados.
- **4d `layouts/app/AppLayout`** — extrai a composição que vivia dentro do `StaffDashboard`:
  skip-link + `Header` + slot `toast` + `StaffNavigation` + `<main id="main-content">`.
  Props flatas (user/logoUrl/onLogin/onLogout/toast/nav/children); ordem de DOM idêntica.
  Overlays da página (`AddCustomerForm`, `ClosedSalonJoinModal`, `ReturnToQueueModal`) ficam
  como **irmãos** do `AppLayout` (todos `fixed`/portal — posição no DOM sem efeito visual).
- **4c `layouts/public/` — adiado com justificativa:** varredura mostrou **zero chrome comum**
  entre `PublicHome`/`ShowcasePage`/`ClientPortalPage` (sem Nav/Footer/SeoHead/`<header>`).
  Criar um wrapper vazio seria abstração sem consumo (viola o princípio de não aumentar
  órfãos); criar quando o segundo consumidor real aparecer.
- **4b `layouts/marketing/MarketingLayout`** — concluído: wrapper único com `forwardRef`
  (páginas gsap usam `pageRef`), `SeoHead` condicional (`title`/`description`/`path` +
  `noindex`/`image`/`jsonLd`), `wrapperClassName` (default = string comum `bg-black …` em 8
  páginas), slot `background` (camada decorativa entre Seo e Nav), `children`, Nav/Footer e slot
  `afterFooter`. Adotado nas **12 páginas** (9 de `pages/marketing` + Landing + Plans +
  EmailVerified) via codemod com validação de âncoras (wrapper/SeoHead/Nav/Footer/fechamento) —
  todos transformados, **0 SKIP**. Casos especiais: AiPredictive/Features (`ref` + className
  próprio), Landing (`ref` + wrapper `#050706` + fundo de 19 linhas), Plans (sticky bar `fixed`
  movida para `afterFooter` — mantém ordem relativa ao footer, visual idêntico), EmailVerified
  (sem SeoHead; wrapper `flex flex-col` claro). Imports Nav/Footer/SeoHead removidos das páginas
  (consumo concentrado no layout).
- providers já estão em `app/` (Etapa 2) — **sem reordenar** (restrição da matriz mantida).

## 2. Piloto `features/queue` (§5.1)

- `QueueItemCard` (+teste), `QueueStatusCard`, `QueueCapacityBanner`, `ReturnToQueueModal`,
  `ClosedSalonJoinModal` → `src/features/queue/` com **barrel `index.ts`** (referência de padrão
  junto a `features/finance`).
- Consumidores: `PublicHome` (2→1 import) e `StaffDashboard` (5→1 import) via barrel.
- Exceção registrada: `QueueItemCard` ainda importa `RetailCheckoutBlock` (domain) — domínio
  cruzado a resolver na Etapa 5 (operação).
- **Adoção do ModalShell** nos 2 modais:
  - shell ganhou `borderClassName` (borda `warning/40` do ClosedSalon) e overflow por slot
    (PromptModal mantém `overflow-hidden`; ReturnToQueue usa `max-h-[90vh] overflow-y-auto`);
  - `ReturnToQueueModal`: portal+FocusLock+Escape manuais → shell (backdrop/X/Escape padronizados,
    guarda `submitting` mantida); conteúdo (ordem atual, slots de inserção) intacto;
  - `ClosedSalonJoinModal`: ganhou X/Escape padrão; **normalizações**: z-90→**z-110** (padrão do
    design system), backdrop 65%→70%, título `h2 text-lg`→`h3` do shell — intencionais da adoção.
- Stories de migração: `Fila/QueueItemCard` (4 histórias) + `Fila/QueueStatusCard` (3) — fixtures
  de `QueueItem`/`Service`/`AIInsight` reais.

## 3. Gate da Etapa 4

| Check | Teto | Agora | Veredito |
|---|---|---|---|
| `tsc --noEmit` | 0 | **0** | ✓ |
| `eslint .` | 11 err / 593 warn | **11 / 593** | ✓ (= teto, **0 folga** — ver nota abaixo) |
| `vitest run` | ≥197 | **199/199 (51 arq.)** | ✓ |
| `test:storybook` | 41 | **48/48 (12 arq.)** | ✓ |
| `test:visual` | 41 | **48/48** (7 novos + 41 intactos) | ✓ |
| `npm run build` | 82 / 2580,63 KiB | **81 / 2585,04 KiB** | ✓ (Δ+4,41 KiB vs Etapa 3; causa: chunk compartilhado `MarketingLayout-*.js` 10,64 KiB deduplicando Nav/Footer/Seo/Layout das 12 páginas; entradas 82→81 = dedup de chunks de marketing; +5,41 KiB vs baseline 2579,63 = +0,21%, reavaliar budget na Etapa 9) |
| `build-storybook` / `docs:check` | ✓ | **✓** | ✓ |

> **Nota (warnings no teto):** 593 = baseline de `00-baseline.md`, portanto **0 folga** para a
> Etapa 5. Migrações devem ser net-zero (moves não alteram contagem); consumos novos precisam de
> offset via remoção de órfãos ou correção registrada em `debts.md` (D-003/D-005).

## 4. Pendências pós-Etapa 4

1. Stories restantes do piloto/área (`ReturnToQueueModal`, `ClosedSalonJoinModal`,
   `QueueCapacityBanner`) + demais componentes da §5.1 na Etapa 5.
2. `RetailCheckoutBlock` cruzado (§2 acima) — Etapa 5.
3. PublicLayout — reavaliar quando houver chrome comum real.
4. Budget PWA: +5,41 KiB vs baseline (§3) — reavaliar na Etapa 9 (junto a D-002).

## 5. Próximo

**Etapa 5** (demais pilotos/área: operation §5.1 + finance §5.2, adoção de
Card/StatCard/Tabs/trio estados nas migrações) — ver [03-migration-matrix](03-migration-matrix.md).
