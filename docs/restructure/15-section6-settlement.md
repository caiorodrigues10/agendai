# Settlement §6 — painéis `0c` e UI órfã

Status: **EXECUTADO** (sanção do usuário: "resolva tudo"). Data: 2026-10-03.
Varredura: script de imports em todo `src/` (auto-imports e barrels contam; arquivo homônimo excluído).

## 0. Decisão final (2026-10-03)

Sanção recebida → **remoção completa do que estava morto**, em duas levas:

**Leva 1 — os 25 adiados (doc17 §3):** 16 painéis domain + `credit-card-form` +
`MasterAdminDashboard` + 7 skeletons (`Calendar/Clients/Dashboard/Financial/Queue/Today/Weather`).
Skeletons: linha do barrel `patterns/skeletons/index.ts` removida (seguem `primitives`,
`FinanceResumoSkeleton`, `PublicPageSkeleton`).

**Leva 2 — conssequências diretas (12):**
- `PromptModal` — perdeu o único consumidor (`MasterAdminDashboard`);
- 11 wrappers HTTP que ficaram órfãas sem os painéis: `copilotApi`, `corporateApi`,
  `enhancedForecastApi`, `fiscalApi`, `formsApi`, `integrationsApi`, `pricingApi`, `purchasingApi`,
  `qualityApi`, `vouchersApi`, `whatsappAiApi`.

**Total: 37 arquivos removidos** (25 + 12).

**Preservadas por terem outros consumidores:** `staffApi` (TeamManager), `depositsApi`
(DepositPolicyPanel), `reputationApi`, `barbershopApi` (OnboardingMissions usava, mas é
compartilhada). **APIs dos painéis removidos: endpoints do backend seguem vivos** — regra §6
(original): features de backend não são tocadas; se o produto religar, git history + backend
continuam.

Resultado do detector pós-settlement: **0 arquivos mortos** (eram 25 + 12 = 37).
Nenhum contrato HTTP foi alterado (wrappers removidos somem do `contract:check`;
`contract:strict` segue 0 pendências). Nenhuma rota/permissão/persistência alterada.

## 1. Painéis de domínio (16) — todos **0c confirmados** (registro pré-remoção)

| Painel | LOC | Infra `*Api.ts` | Destino |
|---|---|---|---|
| StaffManagementPanel | 568 | staffApi (251L) — mantida (TeamManager) | **removido** (decisão já registrada na [13-stage6d](13-stage6d-growth.md): não substitui TeamManager) |
| SmartPricingPanel | 530 | pricingApi (164L) — removida (órfã) | **removido** |
| VouchersPanel | 505 | vouchersApi (283L) — removida (órfã) | **removido** |
| FormsPanel | 492 | formsApi (97L) — removida (órfã) | **removido** |
| IntegrationsPanel | 641 | integrationsApi (102L) — removida (órfã) | **removido** |
| WhatsAppAIPanel | 367 | whatsappAiApi (129L) — removida (órfã) | **removido** |
| FiscalPanel | 363 | fiscalApi (116L) — removida (órfã) | **removido** |
| QualityPanel | 314 | qualityApi (91L) — removida (órfã) | **removido** |
| CorporatePanel | 323 | corporateApi (99L) — removida (órfã) | **removido** |
| PurchasingPanel | 268 | purchasingApi (89L) — removida (órfã) | **removido** |
| CopilotPanel | 168 | copilotApi (62L) — removida (órfã) | **removido** |
| DepositIndicators | 112 | depositsApi (97L) — mantida (DepositPolicyPanel) | **removido** |
| EnhancedForecastPanel | 120 | enhancedForecastApi (60L) — removida (órfã) | **removido** |
| ServiceBookingSelector | 185 | — (sem API própria) | **removido** |
| ReputationPanel | 193 | reputationApi (117L) — mantida (outro consumidor) | **removido** |
| OnboardingMissions | 55 | (barbershopApi — compartilhada, mantida) | **removido** |

## 2. UI genérica `0c`/parcial (matriz §1) — decisão final

| Item | Decisão |
|---|---|
| `ui/PaginationBar` | **adotado**: `ProductReservationsPanel.tsx` (consumidor externo da fila de reservas) → mantido em `ui/` |
| `ui/DataTableState` | mantido — trio vivo em `components/patterns/states/` +story (D-014: adoção story-first continua) |
| `ui/credit-card-form` | **removido** — 0c confirmado; checkout usa embed do provedor (D-010 atualizada) |
| `MasterAdminDashboard` | **removido** — 0c confirmado; rotas usam as 13 páginas (D-012 sanada) |
| `PromptModal` | **removido** (conssequência: perdeu `MasterAdminDashboard`) |

## 3. Evidências

- Varredura pré: `StaffManagementPanel … OnboardingMissions` = 0 importadores; `CreditCardForm` 0;
  `MasterAdminDashboard` 0; skeletons 7 × 0.
- Varredura pós: detector `check-orphan-exports.mjs` → **0 arquivos mortos**; `tsc` 0.
- Nenhum teste, story ou rota importava os removidos (barrel de skeletons foi o único ajuste de código).

## 4. Pendência de decisão (usuário) — RESOLVIDA

1. ~~Remover (ou não) os 16 painéis + APIs correspondentes~~ → **removidos** (APIs só quando órfãs).
2. ~~Destino do `credit-card-form`~~ → **removido**.
3. ~~`MasterAdminDashboard` (D-012)~~ → **removido**, dívida sanada.
