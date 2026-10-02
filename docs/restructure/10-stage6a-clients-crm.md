# Etapa 6a — Clientes / CRM / shop (§5.2)

> Status: **concluída** (movimentação + barrels + consumidores; conversão do ClientProfileSheet
> para ModalShell vira D-009).
> Anterior: [09-stage5b-finance](09-stage5b-finance.md).

## 1. Migração de componentes

| Origem (`components/domain/`) | Destino | Consumidores atualizados |
|---|---|---|
| `ClientsTab`, `ClientsManager`, `ClientProfileSheet` | `features/clients/` (barrel estendido) | StaffDashboard (barrel), ClientsTab irmãos (`./`) |
| `CrmIntelligencePanel`, `CrmMergePanel` (+test), `CrmBackfillPanel` (+test) | `features/crm/` (barrel novo) | ClientsTab (`../crm/...`), MasterAdminDashboard, CrmMaintenancePage (barrel) |
| `ShopProfile`, `ShopFloorControls` | `features/shop/` (barrel novo) | StaffDashboard, PublicHome, SettingsManager (`../../features/shop`) |

- Testes `CrmMergePanel.test`/`CrmBackfillPanel.test` movem junto (imports `../../infra|schemas`
  válidos no novo depth 3).
- `vi.mock` path atualizado em `PublicHome.test.tsx` (`../features/shop`).

## 2. Adoção de padrões

- **`ClientProfileSheet` (1072L):** conversão do overlay ad-hoc → ModalShell **adiada (D-009)** —
  é um sheet (`max-w-2xl`, bottom-sheet mobile, header com ações + nav de tabs, restore de
  `body.overflow` e foco anterior) que não corresponde ao diálogo centrado do shell; converter às
  cegas mudaria UX sem cobertura visual. Caminho previsto: story MSW primeiro → decidir variante
  sheet do shell → converter comparando snapshots.
- **"4 inputs cruos" (matriz):** verificado — **0 inputs sem `Field`** no arquivo (adoção já
  ocorreu em iterações anteriores; item satisfeito, nenhuma mudança necessária).
- `CrmIntelligencePanel`, `CrmMergePanel`, `CrmBackfillPanel`, `ShopProfile`,
  `ShopFloorControls`, `ClientsTab`, `ClientsManager`: migração pura (já usam
  Field/SmartSelect/ConfirmDialog/ui primitivos).

## 3. Gate da Etapa 6a

| Check | Teto | Agora | Veredito |
|---|---|---|---|
| `tsc --noEmit` | 0 | **0** | ✓ |
| `eslint .` | 11 err / 593 warn | **11 / 589** | ✓ |
| `vitest run` | ≥224 | **224/224 (60 arq.)** + PublicHome isolado após fix de mock | ✓ |
| `npm run build` | 82 / 2579,63 KiB (baseline 00) | **82 / 2585,14 KiB** | ✓ (Δ+5,51 KiB = chunks compartilhados; entradas iguais ao baseline) |
| `test:storybook` / `test:visual` | ≥73 | **73/73** (sem stories novas nesta etapa; binário anterior válido) | ✓ |
| `docs:check` / `graphify` | ✓ | **✓** | ✓ |

## 4. Pendências / próximo

1. **D-009** — story + conversão do `ClientProfileSheet` (sheet variant).
2. **§5.3 Catálogo/produtos:** `CatalogManager`, `ServiceManager`, `ServiceForm`,
   `PackageCatalog` → `features/catalog`; `ProductsHub` + `products/*` → `features/products`
   (Componente `ProductFormModal` já é referência de aderência).
3. **§5.4 Conta/settings/time (Etapa 6)** — SettingsManager, TeamManager, AccountPrivacyPanel,
   ProfileSettingsPanel, OwnerSubscriptionPanel, OwnerReferralsPanel, PostsManager, etc.
4. **§5.5 Crescimento/notificações/assinatura** e **§5.6 Master (Etapa 7)**.
5. Stories pendentes: D-008.
