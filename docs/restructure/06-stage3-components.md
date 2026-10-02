# Etapa 3 — Componentes: movimentos, unificação e novos padrões

> Status: **concluída** (validações §5). Anterior: [05-stage2-scaffolding](05-stage2-scaffolding.md).

## 1. Movimentos (infra/layout, conforme [03-matrix](03-migration-matrix.md) §3)

| De | Para | Consumidores ajustados |
|---|---|---|
| `ui/ThemeToggle` | `components/infra/ThemeToggle` | AdminLayout, MasterAdminDashboard, AccessBlockedPage, CheckoutPage(+test mock), Forgot/ResetPasswordPage, Header |
| `ui/Header` (+test) | `layouts/app/Header` | StaffDashboard |
| `ui/StaffNavigation` (+test) | `layouts/app/StaffNavigation` | StaffDashboard |
| `pwa/PwaInstallCard`, `pwa/PwaUpdatePrompt` | `components/infra/` (dir `pwa/` removido) | StaffDashboard, `app/App.tsx` |

Também removido resíduo `src/components/ui/graphify-out/` (graphify executado na pasta errada em alguma rodada anterior).

## 2. Skeletons unificados — `components/patterns/skeletons/`

- Base `Skeleton`/`SkeletonRegion` (+`Skeleton.css`), variantes `Card/Table/List/FormSkeleton`, barrel `primitives.ts` e as **9 composições de domínio** (antes `domain/skeletons/`) num sistema só; `index.ts` público.
- Consumidores migrados: 9 composições, `OwnerFinancialPanel` (barrel único), `PostsManager`, `DataTableState`. `domain/skeletons/` e `ui/skeletons.ts` removidos.
- `DataTableState` + `SectionError` → `components/patterns/states/` (trio loading/error/empty destinado a substituir receitas inline nas Etapas 5–7).
- Fora por decisão do matrix: `PaginationBar` e `credit-card-form` (0 consumidores — avaliar na adoção; não migram silenciosamente).

## 3. Modal shell único

- **`components/patterns/ModalShell.tsx`**: portal + FocusLock + backdrop `z-[110]` + `aria-modal` + Escape (default, respeita `loading`) + slots `children`/`body`/`footer` + ícone comestilização.
- `ConfirmDialog` e `PromptModal` (ui) agora são cascas finas do shell — markup visual idêntico; **ConfirmDialog ganhou fechamento por Escape** (não tinha). Teste existente segue verde.

## 4. Novos padrões (+ stories + testes)

| Padrão | API | Acessibilidade |
|---|---|---|
| `Card` (+`CardHeader/Title/Body`) | shell `rounded-xl border-border bg-surface` (receita de-facto) | herda do wrapper |
| `Tabs` | controlado `items/value/onChange` | `role=tablist/tab`, `aria-selected`, roving tabindex, ←→ Home/End, disabled |
| `Tooltip` | `label` + filho clonado | `role=tooltip` + `aria-describedby`, hover/focus, top/bottom |
| `StatCard` | `label/value/hint/icon/delta{up,down,neutral}` | delta com texto+ícone, sem cor só por si |
| stories | `Padrões/{Card,Tabs,Tooltip,StatCard,DataTableState,Skeleton}` + `UI/{ConfirmDialog,Field}` | tags `autodocs,test` |
| testes | `Card/Tabs/Tooltip/StatCard.test.tsx` (+2) | — |

## 5. Alinhamento Button × accent (token)

- `--ag-accent` **é alias** de `--ag-action-primary` (mesma cor nos 2 temas) — divergência era só de vocabulário.
- `Button.primary` migrado para a receita de-facto `bg-accent text-accent-fg hover:bg-accent-hover` (22×/14 arquivos já usavam); comentário do `tokens.css` atualizado.
- **Prova objetiva:** os 8 snapshots visuais da Etapa 2 (7 stories do Button + Tokens) **passaram sem reescrita** — zero mudança de pixels.

## 6. Gate da Etapa 3

| Check | Teto (Etapa 0/1) | Agora | Veredito |
|---|---|---|---|
| `tsc --noEmit` | 0 | **0** | ✓ |
| `eslint .` | 11 err / 593 warn | **11 err / 591 warn** | ✓ |
| `vitest run` | 145 | **190/190 (49 arq.)** | ✓ |
| `test:storybook` | 8 | **41/41 (10 arq.)** | ✓ |
| `test:visual` | 8 | **41/41** (8 antigos intactos + 33 novos) | ✓ |
| `npm run build` | 82 / 2580,19 KiB | **82 / 2580,63 KiB** | ✓ (Δ+0,44 KiB = ModalShell no grafo; D-002) |
| `build-storybook` / `docs:check` | ✓ | **✓** | ✓ |

**Flake conhecido (D-006):** a primeira execução de `vitest run` após adicionar imports novos pode falhar suites aleatórias do projeto storybook com "Vite unexpectedly reloaded / failed to find the current suite" (re-otimização de deps); reexecução passa. Aquecer antes do gate.

## 7. Pendências conhecidas (não bloqueiam)

- Stories E2 restantes do inventário (Avatar, StatusBadge, Loader, Logo, DynamicIcon, ConsentCheckbox, CurrencyInput, PasswordInput, SmartSelect, Toast, ThemedCalendar, chart, EmptyState) — junto à fila das áreas.
- adoção dos novos padrões (22 overlays ad-hoc → ModalShell; trio de estados; Tabs×110; StatCard; Card×99) acontece nas Etapas 5–7; `PaginationBar`/`credit-card-form` avaliados na adoção.

## 8. Próximo

Etapa 4: pilotos **queue (fila) + finance**, `layouts/app/` (AdminLayout/StaffDashboard/MarketingNav→layouts conforme matrix §4) — ver [03-migration-matrix](03-migration-matrix.md) §4–5.
