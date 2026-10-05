# Etapa 6d — Crescimento / notificações / assinatura (§5.5)

> Status: **concluída**.
> Anterior: [12-stage6c-account-settings](12-stage6c-account-settings.md).

## 1. Migração de componentes

| Origem | Destino | Consumidores atualizados |
|---|---|---|
| `PostsManager`, `PostEditor`, `PostPreviewBox` | `features/posts/` (barrel: 3) | StaffDashboard (barrel); irmãos via `./` (PostEditor←PostsManager, PostPreviewBox←ambos) |
| `ShowcasePanel`, `ShowcasePublicPage`, `PublicLinkPanel` | `features/showcase/` (barrel: 3) | StaffDashboard (barrel, 2 imports consolidados), ShowcasePage |
| `OwnerNotificationsPanel`, `NotificationDeliveriesPanel`, `NotificationHealthPanel` | `features/notifications/` (barrel: 3) | SettingsManager (barrel), BillingTab (`pages/MasterAdmin` → barrel), OwnerNotificationsPanel←Deliveries irmão (`./`) |
| `OwnerSubscriptionPanel`, `TrialExpiredPaywallModal` | `features/subscription/` (barrel: 2) | StaffDashboard, LoginPage |
| `ClientPortalDashboard`, `ClientPortalLogin` | `features/client-portal/` (barrel: 2) | ClientPortalPage (2→1 import) |
| `PricingPersuasionCharts` (de `components/marketing/`) | `features/marketing/` (barrel: 1) | PlansPage |

- Depth fix em todos os arquivos vindos de `components/domain/` (nível 3): `'../ui/'` →
  `'../../components/ui/'` e `'../patterns/'` → `'../../components/patterns/'` (8 arquivos
  reescritos); `PricingPersuasionCharts` trocou `'../ui/chart'` pelo caminho em `components/`.
- Irmãos movidos juntos mantiveram `./` sem mudança; `../../marketing/trialCampaign` segue
  válido (`src/marketing/`) de ambas as profundidades.
- **PlansPage.test**: `vi.mock` do componente mockado apontava para o caminho antigo
  (`../components/marketing/PricingPersuasionCharts`) → atualizado para o barrel
  `../features/marketing` (único mock quebrado pela mudança de caminho).

## 2. Adoções (ações sancionadas pela matriz §5.5)

- **OBJECTIVES unificado** (`features/posts/objectives.ts`): as duas cópias (PostsManager e
  PostEditor) divergiam apenas nas `description`s; canonicalizou-se a do **PostEditor** (única
  renderizada — `PostEditor:402`), zerando mudança visual. `PostType` e `ObjectiveId` também
  saíram para o util; PostsManager importa só os tipos, PostEditor importa array+tipos.
- **PostEditor — lint err `react-hooks/purity` corrigido** (D-003, mandato §5.5): o `min=`
  do input de agendamento calculava `Date.now()` em render → constante de módulo
  `SCHEDULE_MIN_DATETIME` (avaliada no load; janela de 5 min a partir do início da sessão —
  servidor segue validando horários passados).
- **OwnerSubscriptionPanel — overlay "cancelar assinatura" → ModalShell**: backdrop manual +
  `FocusLock` próprio + X absoluto (z-50, `max-w-lg`) → shell (portal+FocusLock+Escape,
  `role` padrão dialog, `loading`/`onClose` ligados ao estado de cancelamento); título dinâmico
  por etapa (`Sentimos muito…` / `Nos conte o motivo`), subtítulo no `children`, conteúdo no
  `body`, ações das duas etapas no `footer` (`flex-col sm:flex-row` preservado). `FocusLock` e
  ícone `X` removidos dos imports.
- **Planos unificados**: `ESSENTIAL_MONTHLY/PRO_MONTHLY/ESSENTIAL_YEARLY/PRO_YEARLY` estavam
  duplicados em PlansPage e PricingPersuasionCharts → `src/marketing/planPrices.ts` (única
  fonte; `AVG_TICKET`/`LOST_NOSHOWS_MONTH` seguem locais por serem dados só do gráfico).

### Mantidos com justificativa (fora do mandato)

- **`payOpen` (2º overlay do OwnerSubscriptionPanel)**: `fixed inset-0 z-[80]` com
  `SubscriptionCheckout variant="embedded"` é um *takeover* full-screen com botão voltar —
  ModalShell é diálogo `max-w-md`; converter mudaria a UX de checkout silenciosamente
  (mesma classe da D-009). Registrado como **D-010**.
- **PostEditor: 23 botões crus** (inventário §1; o arquivo já mistura 23 `ui/Button`): a ação
  explícita da matriz era "unificar util"; conversão cega muda visuais de botões
  icon/toggle sem story de referência → **D-011** (story-first, padrão D-007/D-009).
- ClientPortal (`mig.` puro, testes de api já existiam), Showcase*, notificações puras.

## 3. Gate da Etapa 6d

| Check | Teto | Agora | Veredito |
|---|---|---|---|
| `tsc --noEmit` | 0 | **0** | ✓ |
| `eslint .` | 11 err / 593 warn | **7 / 573** | ✓ (−1 erro: purity do PostEditor; −7 warnings vs 6c) |
| `vitest run` | ≥224 | **224/224 (60 arq.)** | ✓ (1ª execução falhou no mock desatualizado do PlansPage; corrigido) |
| `test:storybook` | ≥73 | **73/73 (21 arq.)** | ✓ |
| `test:visual` | ≥73 | **73/73** (sem stories novas) | ✓ |
| `npm run build` | 82 / 2579,63 KiB | **82 / 2581,89 KiB** | ✓ (Δ+2,26 KiB vs baseline) |
| `docs:check` / `graphify` | ✓ | **✓** | ✓ |

Erros restantes (7): 2 parsing estruturais + `emailApi`×2/`goalsApi`/`staffApi`
`consistent-type-definitions` + `LoginPage.test` `array-type` (todos fora do mandato; D-003
atualizado).

## 4. Pendências / próximo

1. **Etapa 7 (§5.6 Master):** `pages/MasterAdmin/*` (13 páginas → `pages/master-admin`),
   extração de sub-blocos de `BillingTab` (1948L; os 2 painéis de notificação já saíram em
   6d) e `MasterAdminDashboard` (1765L; 28 botões/9 inputs crus).
2. **Decisão registrada (matriz §6):** `StaffManagementPanel` (568L, 0 consumidores) **não**
   substitui o `TeamManager` adotado na Etapa 6c; permanece na fila 0c de avaliação.
3. Dívidas novas: **D-010** (overlay full-screen do checkout → variante sheet/fullscreen do
   ModalShell) e **D-011** (23 botões crus do PostEditor, story-first). D-007/D-008/D-009
   seguem abertos.
4. `RetailCheckoutBlock` → features/queue ou domain (decisão nas Etapas 7–10).
