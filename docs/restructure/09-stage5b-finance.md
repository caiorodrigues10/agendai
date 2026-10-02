# Etapa 5b — Operação: finance + painéis §5.1

> Status: **concluída** (§5.1 remanescente; painel de extração de sub-blocos vira D-007).
> Anterior: [08-stage5a-operation](08-stage5a-operation.md).

## 1. Migração de componentes

| Origem (`components/domain/`) | Destino | Consumidores atualizados |
|---|---|---|
| `CashPanel`, `FinancialDashboard`, `OwnerFinancialPanel`, `ProfitEnginePanel`, `WeatherForecastWidget`, `DemandAlertBanner` | `features/finance/components/` (profundidade 4 → imports `../../../`) | StaffDashboard (barrel), FinancialDashboard (WeatherForecastWidget irmão) |
| `GoalsPanel` | `features/goals/` (barrel novo) | StaffDashboard |
| `LoyaltyPanel` | `features/loyalty/` (barrel novo) | StaffDashboard |
| `WaitlistPanel` | `features/waitlist/` (barrel novo) | StaffDashboard |
| `RecurringPackagesPanel` | `features/recurring/` (barrel novo) | StaffDashboard |
| `RecommendationsPanel` | `features/recommendations/` (barrel novo) | StaffDashboard |
| `EquipmentPanel` | `features/equipment/` (barrel novo) | StaffDashboard |
| `DepositPolicyPanel` | `features/deposits/` (barrel novo) | StaffDashboard |
| `CategoryManager` (+ `.test.tsx`) | `features/catalog/` (destino da matriz; 1º componente do catálogo) | OwnerFinancialPanel (irmão via `../../catalog`), ServiceManager (domain, via barrel `../../features/catalog`) |

- CSS weather: **já estava** em `src/styles/features/weather.css` desde a Etapa 1 (item da
  matriz cumprido; `index.css` só faz o `@import`).

## 2. Adoção de padrões

- **ModalShell** no modal ad-hoc "Novo fiado" do `OwnerFinancialPanel`: portal+FocusLock+Escape
  herdados; normalizações: z-50 → **z-110**, backdrop/`aria-label` do shell, título `h3` padrão,
  `loading={fiadoSubmitting}` trava X/Escape, efeito manual de Escape removido; `<form>` (RHF)
  envolve body+ações dentro do shell (mesmo precedente do AppointmentBookingModal da Etapa 5a).
- **Sub-blocos do OwnerFinancialPanel (1633L)**: extração das abas resumo/despesas/fiado
  **adiada e registrada como D-007** — ~25 bindings de closure por bloco e zero testes
  unitários do painel para blindar a refactor (cobertura visual inexistente); a movimentação
  + adoção ModalShell já reduziram o escopo do domain.
- Demais painéis já usam `Field`/`SmartSelect`/`ConfirmDialog`/`EmptyState`/`Button`
  (estado prévio, verificado no move) — conversões net-zero.

## 3. Stories (piloto finance)

- `Financeiro/FinancialDashboard` (Default + PlanoUpgrade com 403 `DASHBOARD_REQUIRED`;
  decorator `MemoryRouter`; MSW: insights + commissions/summary + weather-insights).
- `Financeiro/ProfitEnginePanel` (Default + SemMovimentos + Erro; 5 endpoints `profit/*`).
- `Financeiro/WeatherForecastWidget` (Default + Compacto + Erro + SemDados).
- `Financeiro/DemandAlertBanner` (Critico + Compacto + RiscoMedio).
- **Pendência registrada (D-008):** story do `CashPanel` exige `AuthProvider` (o `useAuth`
  arremessa fora do provider); painéis goals/loyalty/waitlist/recurring/recommendations/
  equipment/deposits ainda sem stories próprias.

## 4. Gate da Etapa 5b

| Check | Teto | Agora | Veredito |
|---|---|---|---|
| `tsc --noEmit` | 0 | **0** | ✓ |
| `eslint .` | 11 err / 593 warn | **11 / 589** | ✓ (mesmo patamar da 5a) |
| `vitest run` | ≥199 | **224/224 (60 arq.)** | ✓ (crescimento inclui testes adicionados em paralelo, todos verdes) |
| `test:storybook` | ≥61 | **73/73 (21 arq.)** | ✓ (1 flake D-006 na 1ª execução) |
| `test:visual` | ≥61 | **73/73** (12 novos + 61 intactos; update + verificação limpa) | ✓ |
| `npm run build` | 81 / 2585,04 KiB | **81 / 2582,26 KiB** | ✓ (Δ−2,78 KiB vs baseline) |
| `build-storybook` / `docs:check` | ✓ | **✓** | ✓ |

## 5. Pendências / próximo

1. **D-007** — extrair sub-blocos do `OwnerFinancialPanel` (com story antes, para blindagem visual).
2. **D-008** — stories de `CashPanel` (composer `AuthProvider` de teste) e dos painéis §5.1 remanescentes.
3. Catálogo: `CatalogManager`, `ServiceManager`, `ServiceForm`, `PackageCatalog` → `features/catalog` (Etapa 5+).
4. `RetailCheckoutBlock` cruzado (queue → domain) — decidir nas Etapas 5–7.
5. Painéis settings/growth/master + §5.2 Clientes/CRM (Etapa 6).
