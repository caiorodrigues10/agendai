# Etapa 0 — Matriz de migração

Data: 2026-09-28 · Base: `01-component-inventory.md` + `02-map.md`.

**Legenda**
- **Estado:** `ativo` · `0c` (zero consumidores) · `⚠` (importa negócio estando em camada errada) · `dup` (duplicação/adi-hoc)
- **Stories:** `E2` = story na Etapa 2 (fundações) · `mig.` = story criado na migração da área · `—` = sem story
- **Testes:** `✓` = já existe (manter) · `+` = criar na migração · `—` = sem teste planejado
- **Ação:** `migrar` · `migrar+unificar` · `substituir` · `avaliar` (remoção candidata) · `extrair` (corte de página)
- Nenhuma linha altera contrato HTTP, rota, permissão ou persistência.

## 1. `components/ui/` — genérico puro (Etapa 3)

| Origem | Destino | Consumidores | Deps | Stories | Testes | Estado | Ação/Exceção |
|---|---|---|---|---|---|---|---|
| ui/Button | components/ui | 4 | nenhuma | E2 | ✓ (Header.test间接) | ativo | migrar+unificar — **alinhar token**: primary hoje `bg-action-primary` × de-facto `bg-accent` (22×/14 files); adotar receitas secundárias 78×/35 |
| ui/Field + FIELD_CONTROL | components/ui | 30 | nenhuma | E2 | + | ativo | migrar — cobrir os 45 files com inputs sem Field na migração |
| ui/Avatar, StatusBadge, Loader, Logo, DynamicIcon, ConsentCheckbox, CurrencyInput, PasswordInput, SmartSelect, Toast, ThemedCalendar, chart.tsx, floating-paths, EmptyState | components/ui | (ver inv.) | nenhuma | E2 | ✓ ConfirmDialog/SmartSelect | ativo | migrar |
| ui/ConfirmDialog | components/ui | múltiplos | nenhuma | E2 | ✓ ConfirmDialog | dup | migrar+unificar — shell único; **adoção obrigatória** nos 22 files de overlay ad-hoc (portal + `aria-modal` + `z-[110]`). `ui/PromptModal` **removido no settlement §6** (2026-10-03): perdeu o único consumidor (`MasterAdminDashboard`) |
| ui/Skeleton + Table/Card/List/Form + skeletons.ts | components/patterns/skeletons | 11 + composições | nenhuma | E2 | — | dup | migrar+unificar — fundir com `domain/skeletons/` (8 arquivos) em um sistema só |
| domain/skeletons/* (8 + index.ts) | components/patterns/skeletons | barrel + OwnerFinancialPanel | ui/Skeleton | E2 | — | dup | migrar+unificar (ver acima). **Settlement §6:** 7 órfãos (Calendar/Clients/Dashboard/Financial/Queue/Today/Weather) removidos 2026-10-03; seguem `FinanceResumo`/`PublicPage`/primitives |
| ui/DataTableState | components/patterns/states | 0 | nenhuma | E2 | — | **0c** | substituir — trio único loading/error/empty (Substitui SectionError e receitas inline) |
| ui/SectionError | components/patterns/states | só DataTableState (0c) | nenhuma | E2 | — | 0c efet. | substituir (ver acima) |
| ui/PaginationBar | components/patterns | 1 (ProductReservationsPanel) | nenhuma | E2 | — | ativo | mantido — adotado fora da fila 0c (settlement 2026-10-03) |
| ui/credit-card-form | (MP checkout) | 0 | nenhuma | — | — | **removido §6** | removido no settlement (2026-10-03) — checkout real usa embed do provedor; recuperável via git |

## 2. `components/patterns/` — padrões novos a criar (Etapa 3, fecham as duplicações §5)

| Padrão novo | Origem do design | Onde adotar | Stories | Testes | Estado | Ação/Exceção |
|---|---|---|---|---|---|---|
| Card | shell `rounded-xl border border-border bg-surface` (99×/49) | todas as áreas na migração | E2 | + | dup | criar — reuso da receita atual, visual idêntico |
| Modal shell | ConfirmDialog | 22 files ad-hoc + 9 `*Modal.tsx` | E2 | ✓ | dup | criar via unificação (linha §1; PromptModal removido no settlement §6) |
| Tabs | hand-rolled `activeTab` (110×) | CatalogManager, ClientPortalDashboard, ProductsHub, PostEditor/PostsManager, StaffDashboard | mig. | + | dup | criar — respeitar `role=tab`/`aria-selected` (hoje 4×/2 files) |
| Tooltip | `title=` nativo + Recharts tooltip | toolbars/painéis na migração | mig. | + | dup | criar — não mexer no tooltip do Recharts |
| StatCard | stat cards inline (99×/49) | painéis finance/dashboard na migração | mig. | + | dup | criar |
| Spinner (botão) | `animate-spin` inline (172×/83) | Button loading + estados | E2 | + | dup | migrar via Button `loading` |

## 3. `components/infra/` — já existe; ajustes de camada (Etapa 3)

| Origem | Destino | Consumidores | Deps | Stories | Testes | Estado | Ação/Exceção |
|---|---|---|---|---|---|---|---|
| infra/* (8 componentes) | components/infra | App/rotas | contexts/infra | — | ✓ ErrorBoundary×2, ScrollToTop | ativo | migrar como estão (precedente: infra pode consumir contexts) |
| ui/ThemeToggle | components/infra | MarketingNav, AdminLayout | ThemeContext | — | — | ⚠ | mover — sai de ui/ por consumir contexto (regra UI puro) |
| ui/Header | layouts/app/Header | StaffDashboard | SubscriptionContext | — | ✓ Header.test | ⚠ | mover para layouts (chrome de app, consumo de context documentado como exceção) |
| ui/StaffNavigation | layouts/app/StaffNavigation | StaffDashboard | config/tabRegistry | — | ✓ StaffNavigation.test | ⚠ | mover para layouts (idem) |
| pwa/PwaInstallCard, PwaUpdatePrompt | components/infra | StaffDashboard, App | PwaInstallContext, SW | — | — | ⚠ | mover para infra |
| infra: AccessBlocked/Analytics/CookieConsent/ReferralRef | components/infra | App | apiClient/storage | — | — | ativo | migrar |

## 4. `layouts/` (Etapa 4 — resolve repetição de chrome)

| Origem | Destino | Consumidores | Deps | Stories | Testes | Estado | Ação/Exceção |
|---|---|---|---|---|---|---|---|
| domain/admin/AdminLayout | layouts/admin | App (/master) | Auth | mig. | — | ativo | mover — única rota com layout aninhado hoje |
| MarketingNav/Footer + SeoHead | layouts/marketing | 12 páginas | Auth/brand | mig. | — | dup | criar `MarketingLayout` — hoje repetido manualmente em 12 páginas |
| (novo) PublicLayout | layouts/public | queue, minha-conta, showcase | nenhuma | mig. | + | — | criar — páginas públicas sem chrome comum |
| (novo) AppLayout | layouts/app | `/app` (envolve Header+StaffNavigation) | contexts | mig. | + | — | criar — extrai composição feita dentro do StaffDashboard |
| providers do index.tsx | app/providers | todas as rotas | 7 contexts | — | — | ⚠ | mover para `app/` — considerar escopo: contexts só consumidos por `/app`+`/master` hoje envolvem marketing (dívida registrada, **não** reordenar providers nesta etapa) |

## 5. `features/<área>/components/` — domain (Etapas 5–7)

### 5.1 Operação (piloto = queue, Etapa 4)

| Origem | Destino | Consumidores | Deps | Stories | Testes | Estado | Ação/Exceção |
|---|---|---|---|---|---|---|---|
| QueueItemCard | features/queue | 3 | notifications/clients/products APIs | mig. | ✓ | ativo | migrar (piloto) |
| QueueStatusCard | features/queue | 2 | nenhuma | mig. | — | ativo | migrar (piloto) |
| QueueCapacityBanner | features/queue | 1 | barbershopApi | mig. | — | ativo | migrar (piloto) |
| ReturnToQueueModal, ClosedSalonJoinModal | features/queue | 1 cada | nenhuma | mig. | — | ativo | migrar — adotar Modal shell |
| AddCustomerForm, ServiceCard | features/clients | 2 / 1 | nenhuma | mig. | — | ativo | migrar (uso público+app) |
| AppointmentScheduler | features/appointments | 1 (PublicHome) | nenhuma | mig. | — | ativo | migrar |
| AppointmentCalendar | features/appointments | 1 | role-check | mig. | — | ativo | migrar — 18 `<button>` ad-hoc → Button |
| AppointmentBookingModal | features/appointments | 2 | clientsApi, packagesApi | mig. | — | ativo | migrar — overlay ad-hoc → Modal shell |
| BookPackageSessionsModal | features/appointments | 1 | scheduling/packages APIs | mig. | — | ativo | migrar — overlay ad-hoc |
| OnboardingChecklist, ActivationChecklist | features/onboarding | 1 / 1 | barbershopApi | mig. | — | ativo | migrar |
| CashPanel | features/finance | 1 | cashApi, Auth | mig. | — | ativo | migrar — já usa ui/Button |
| FinancialDashboard | features/finance | 1 | financial/commissions APIs | mig. | — | ativo | migrar (área piloto finance, Etapa 5) |
| OwnerFinancialPanel | features/finance | 1 | 1582L, 27 botões/26 inputs | mig. | — | ativo | migrar — maior corte; **extrair** sub-blocos |
| ProfitEnginePanel | features/finance | 1 | profitApi | mig. | — | ativo | migrar |
| WeatherForecastWidget | features/finance | 1 (FinancialDashboard) | financialApi | mig. | — | ativo | migrar — CSS weather sai do index.css para styles/features |
| DemandAlertBanner | features/finance | 1 | financialApi | mig. | — | ativo | migrar |
| FinanceSummaryCard, FiadoStatusBadge | features/finance (já existe) | 1 / 1 | tipo financialApi | mig. | — | ativo | manter — único barrel de feature existente (referência de padrão) |
| GoalsPanel | features/goals | 1 | goalsApi | mig. | — | ativo | migrar |
| LoyaltyPanel | features/loyalty | 1 | loyaltyApi | mig. | — | ativo | migrar |
| WaitlistPanel | features/waitlist | 1 | waitlistApi | mig. | — | ativo | migrar — usa EmptyState |
| RecurringPackagesPanel | features/recurring | 1 | recurringPackagesApi | mig. | — | ativo | migrar — 18 botões |
| RecommendationsPanel | features/recommendations | 1 | recommendationsApi | mig. | — | ativo | migrar |
| EquipmentPanel | features/equipment | 1 | 791L, 17 inputs | mig. | — | ativo | migrar — inputs já consistentes |
| DepositPolicyPanel | features/deposits | 1 | depositsApi | mig. | — | ativo | migrar |

### 5.2 Clientes / CRM (Etapa 6)

| Origem | Destino | Consumidores | Deps | Stories | Testes | Estado | Ação/Exceção |
|---|---|---|---|---|---|---|---|
| ClientsTab, ClientsManager | features/clients | 1 cada | crmApi/clientsApi | mig. | — | ativo | migrar |
| ClientProfileSheet | features/clients | 1 | 1022L, 19 botões, 4 inputs cruos | mig. | — | ativo | migrar — overlay ad-hoc → Modal shell |
| CrmIntelligencePanel | features/crm | 1 | 864L | mig. | — | ativo | migrar |
| CrmMergePanel, CrmBackfillPanel | features/crm | 2 / 4 | crmApi | mig. | ✓ | ativo | migrar (testes movem junto) |
| ShopProfile | features/shop | 2 (app+public) | barbershopApi | mig. | — | ativo | migrar |
| ShopFloorControls | features/shop | 2 | ctx | mig. | — | ativo | migrar |

### 5.3 Catálogo / produtos

| Origem | Destino | Consumidores | Deps | Stories | Testes | Estado | Ação/Exceção |
|---|---|---|---|---|---|---|---|
| CatalogManager | features/catalog | 1 | 10 inputs cruos, tabs inline | mig. | ✓ CategoryManager | ativo | migrar — adotar Tabs+Field |
| CategoryManager | features/catalog | 3 | categoriesApi | mig. | ✓ | ativo | migrar |
| ServiceManager, ServiceForm, PackageCatalog | features/catalog | 1–2 | useCategories/packagesApi | mig. | — | ativo | migrar — ServiceManager já usa ui/Button |
| ProductsHub + products/* (7 + 2 utils) | features/products | 1 cada | productsApi | mig. | — | ativo | migrar — ProductFormModal já usa primitivos ui (referência) |

### 5.4 Conta / settings / time (Etapa 6)

| Origem | Destino | Consumidores | Deps | Stories | Testes | Estado | Ação/Exceção |
|---|---|---|---|---|---|---|---|
| SettingsManager | features/settings | 1 | 937L, 11 inputs cruos, overlay | mig. | — | ativo | migrar — extrair sub-blocos |
| AccountPrivacyPanel | features/settings | 2 | Auth+authApi | mig. | — | ativo | migrar — **lint err `react-hooks/purity` pré-existente**, corrigir ao adotar |
| EmailHistoryPanel, EmailPreferencesPanel | features/settings | 1 cada | emailApi | mig. | — | ativo | migrar — lint err `type→interface` pré-existente ao adotar |
| ProfileSettingsPanel, ProfileAvatarSection | features/settings | 1 cada | Auth/usersApi | mig. | — | ativo | migrar |
| QueueAlertSettings | features/settings (ou queue) | 1 | input recipe própria | mig. | — | dup | migrar — substituir recipe por Field |
| TeamManager | features/team | 1 | usersApi, permissions | mig. | — | ativo | migrar — já usa ui/Button |
| SupportPanel + support/* (4) | features/support | 3 | supportApi | mig. | ✓ | ativo | migrar (testes junto) |
| OrganizationsPanel, MultiUnitDashboard | features/organizations | 2 cada | organizationsApi | mig. | ✓ | ativo | migrar (testes junto) |
| OwnerReferralsPanel, ReferralTierBadge, ShareReferralButton | features/referrals | 1 cada | referralsApi | mig. | — | ativo | migrar |

### 5.5 Crescimento / notificações / assinatura

| Origem | Destino | Consumidores | Deps | Stories | Testes | Estado | Ação/Exceção |
|---|---|---|---|---|---|---|---|
| PostsManager, PostEditor, PostPreviewBox | features/posts | 1 / 1 / 2 | postsApi | mig. | — | ativo | migrar — PostEditor 23 botões/`OBJECTIVES` duplicado com PostsManager (unificar util) |
| ShowcasePanel, ShowcasePublicPage, PublicLinkPanel | features/showcase | 1–2 | showcaseApi | mig. | — | ativo | migrar |
| OwnerNotificationsPanel | features/notifications | 1 | notificationsApi | mig. | — | ativo | migrar |
| NotificationDeliveriesPanel, NotificationHealthPanel | features/notifications | 2 / 1 | notificationsApi | mig. | — | ativo | migrar (uso em BillingTab: páginas) |
| OwnerSubscriptionPanel | features/subscription | 1 | Subscription/plans APIs | mig. | — | ativo | migrar — 2 overlays → Modal shell |
| TrialExpiredPaywallModal | features/subscription | 1 (LoginPage) | plansApi | mig. | — | ativo | migrar |
| ClientPortalDashboard, ClientPortalLogin | features/client-portal | 1 cada | clientPortalApi | mig. | ✓ (api) | ativo | migrar |
| Marketing: PricingPersuasionCharts | features/marketing | 1 | ui/chart, trialCampaign | mig. | — | ativo | migrar — unificar constantes de planos (dup com PlansPage) |

### 5.6 Master admin (Etapa 7)

| Origem | Destino | Consumidores | Deps | Stories | Testes | Estado | Ação/Exceção |
|---|---|---|---|---|---|---|---|
| pages/MasterAdmin/* (13 pages) | pages/master-admin | rotas /master | AdminLayout | mig. | — | ativo | mover+renomear — wrappers finos viram rotas sobre feature |
| BillingTab (1843L), ReferralsTab, CrmMaintenancePage | pages/ + features/billing | 1 | MAIS MAIOR arquivo | mig. | — | ativo | **extrair** painéis internos (NotificationDeliveries/Health já são domain) |
| MasterAdminDashboard (1765L) | pages/master-admin | rota | 28 botões/9 inputs | mig. | — | **removido §6** | removido no settlement (2026-10-03) — rotas `/master` usam as 13 páginas individuais; D-012 sanada |

## 6. Painéis `0c` — fila de avaliação (nenhum import em `src/`, verificado por varredura completa)

> **Settlement §6 EXECUTADO (2026-10-03, após sanção do usuário):** os 16 painéis `0c` +
> `credit-card-form` + `MasterAdminDashboard` + `PromptModal` (conssequência) foram **removidos**;
> as 11 wrappers HTTP que ficaram órfãs (`copilot/corporate/enhancedForecast/fiscal/forms/
> integrations/pricing/purchasing/quality/vouchers/whatsappAi Api`) também — `staffApi`,
> `depositsApi`, `reputationApi`, `barbershopApi` ficaram por terem outros consumidores.
> Recuperação via git. Tabela abaixo é o registro pré-remoção (todos `0c` confirmados).
> Detalhes em [15-section6-settlement](15-section6-settlement.md).

| Componente | LOC | Destino se adotado | Stories | Testes | Estado | Ação/Exceção |
|---|---|---|---|---|---|---|
| StaffManagementPanel | 568 | features/team | — | — | removido §6 | decidido: não substitui TeamManager (ver [13-stage6d](13-stage6d-growth.md)) → removido (API `staffApi` mantida: TeamManager) |
| SmartPricingPanel | 530 | features/pricing | — | — | removido §6 | removido (API órfã junto) |
| VouchersPanel | 505 | features/vouchers | — | — | removido §6 | removido (API órfã junto) |
| FormsPanel | 492 | features/forms | — | — | removido §6 | removido (API órfã junto) |
| IntegrationsPanel | 641 | features/integrations | — | — | removido §6 | removido (API órfã junto) |
| WhatsAppAIPanel | 367 | features/whatsapp | — | — | removido §6 | removido (API órfã junto) |
| FiscalPanel | 363 | features/fiscal | — | — | removido §6 | removido (API órfã junto) |
| QualityPanel | 314 | features/quality | — | — | removido §6 | removido (API órfã junto) |
| CorporatePanel | 323 | features/corporate | — | — | removido §6 | removido (API órfã junto) |
| PurchasingPanel | 268 | features/purchasing | — | — | removido §6 | removido (API órfã junto) |
| CopilotPanel | 168 | features/copilot | — | — | removido §6 | removido (API órfã junto) |
| DepositIndicators | 112 | features/deposits | — | — | removido §6 | removido (`depositsApi` mantida: DepositPolicyPanel) |
| EnhancedForecastPanel | 120 | features/finance | — | — | removido §6 | removido (API órfã junto) |
| ServiceBookingSelector | 185 | features/appointments | — | — | removido §6 | removido (sem API própria) |
| ReputationPanel | 193 | features/reputation | — | — | removido §6 | removido (`reputationApi` mantida: outro consumidor) |
| OnboardingMissions | 55 | features/onboarding | — | — | removido §6 | removido (`barbershopApi` compartilhada, mantida) |

**Regra:** `0c` **não migra silenciosamente** — ou ganha consumidor/decisão explícita de produto, ou sai em PR separado (com rollback independente). Nunca aumentar o limite de órfãos.

## 7. Páginas (`pages/`) e app shell

| Origem | Destino | Consumidores | Deps | Stories | Testes | Estado | Ação/Exceção |
|---|---|---|---|---|---|---|---|
| App.tsx (142L) | app/ (router) | entry | lazy×36 | — | — | ativo | mover — **preservar** imports lazy, guards e 54 rotas byte-a-byte |
| index.tsx | app/ (entry) | index.html | 7 providers | — | — | ativo | mover — ordem de providers idêntica |
| index.css | styles/ + styles/tokens.css | global | @theme/@custom-variant | E2 | — | ativo | separar tokens/temas/base/terceiros sem mudar valores (Etapa 1) |
| LoginPage, Forgot/Reset/EmailVerified/AccessBlocked/Checkout/Plans/NotFound | pages/ (auth) | rotas | RHF/Zod | mig. | ✓ Login/Checkout/NotFound/Plans | ativo | migrar na ordem das áreas |
| LandingPage (2233L) + marketing pages (9+1) | pages/marketing | rotas | gsap/SeoHead | mig. | ✓ Landing/commercialPages | ativo | migrar por último — **extrair** `PhoneMockup` duplicado (AiPredictive∥Features) |
| PublicHome, PublicAppointmentManagePage | pages/public | rotas | nenhuma | mig. | ✓ PublicHome | ativo | migrar — dark por design (não “corrigir”) |
| StaffDashboard (714L, ~55 imports estáticos) | pages/app | rota /app/:tab | tabRegistry | mig. | — | ativo | migrar — **não** introduzir lazy por tab sem medir (registro como dívida, fora de limite) |
| ShowcasePage, ClientPortalPage | pages/public | rotas wrappers | — | mig. | — | ativo | migrar |
| tabRegistry.ts | config/ | StaffDashboard/StaffNavigation | nenhuma | — | + | ativo | manter em config/ — contrato de permissão intocado |

## 8. Ordem de execução resumida (ligação com as etapas)

1. **Etapa 1** — styles/tokens/temas (`index.css` → `styles/`), separar ThemeProvider da política de auth, Storybook inicial lendo os tokens reais.
2. **Etapa 2** — scaffolding `app/`, `layouts/`, barrels públicos `features/*/index.ts`, vitest+MSW+Lint gates, first visual regression (baseline).
3. **Etapa 3** — `components/ui` + `components/patterns` completos (Button↔accent, Card, Modal, Tabs, Tooltip, StatCard, trio states, skeletons unificados) com stories/interação/a11y.
4. **Etapa 4 — pilotos:** queue (features/queue + AppLayout/PublicLayout) e finance (features/finance) com comparação visual.
5. **Etapas 5–7** — migração por área (operação → clientes/CRM/catalog → settings/crescimento/master), adoção obrigatória dos padrões, testes movidos junto.
6. **Etapa 8** — permissão/persistência/contratos: rota a rota, permissão a permissão, storage key a storage key.
7. **Etapa 9** — limpeza: imports órfãos, barrels públicos, teste por rota/fluxo, budget PWA (hoje 82 entries / 2579.63 KiB) não regredir.
8. **Etapa 10** — entrega final: typecheck/lint/testes/build/Storybook/visual test/audit/docs-check verdes + evidências.

**Gate contínuo (baseline em `00-baseline.md`):** typecheck 0 · lint ≤ 17 erros/≤593 warnings · testes ≥137/137 · build 82 precache · dívidas novas registradas em `docs/restructure/debts.md` (criado na primeira adição).
