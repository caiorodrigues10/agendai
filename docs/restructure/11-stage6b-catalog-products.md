# Etapa 6b — Catálogo / produtos (§5.3)

> Status: **concluída**.
> Anterior: [10-stage6a-clients-crm](10-stage6a-clients-crm.md).

## 1. Migração de componentes

| Origem (`components/domain/`) | Destino | Consumidores atualizados |
|---|---|---|
| `CatalogManager`, `ServiceManager`, `ServiceForm`, `PackageCatalog` | `features/catalog/` (barrel estendido: 5 exports) | StaffDashboard (barrel), ServiceManager irmãos (`./`), CategoryManager irmão (`./`) |
| `ProductsHub` + `products/*` (7 tsx + 2 utils) | `features/products/` (barrel novo, 8 exports) | StaffDashboard (barrel), ProductsHub (`./X` após rewrite), painéis irmãos |

- Depth fix dos arquivos que viviam em `domain/products/` (nível 4): `../../../` → `../../` e
  `../../ui/` → `../../components/ui/`.
- **`RetailCheckoutBlock`** (continua em `components/domain` — consumido pela queue):
  import de `./products/productMoney` → `../../features/products/productMoney` (pendência de
  domínio cruzado registrada desde a Etapa 4 segue aberta).
- ServiceManager passou a importar `./CategoryManager` (irmão) em vez do próprio barrel
  (evita ciclo barrel→membro→barrel).

## 2. Adoção de padrões (CatalogManager — ação da matriz)

- **Tabs**: barra inline (botões crus, sem semântica) → `patterns/Tabs` (role=tablist/tab,
  roving tabindex, setas/Home/End); painéis ganharam `role=tabpanel` + `id`/`aria-labelledby`
  correspondentes aos `aria-controls` do componente.
- **Field**: os **10 inputs crus** do modal de criação (variações/addons/combos) foram
  envolvidos em `Field` com rótulos visíveis (antes: placeholder-only, sem associação de label)
  e `FIELD_CONTROL`; o input inline de preço do combo ganhou `Field label="Preço"` + `aria-label`.
- **ModalShell**: overlay ad-hoc do modal (backdrop manual, `z-50`, X próprio, Escape ausente)
  → shell (portal+FocusLock+Escape, z-110, `loading` trava X durante criação); ações Salvar/
  Cancelar no slot `footer` (mesmo layout `mt-5 flex gap-2`).
- Limpeza: ícones mortos `Pencil`/`GripVertical`/`X` removidos (−3 warnings de lint).
- `ServiceManager`/`ServiceForm`/`PackageCatalog`/produtos: migração pura (`ProductFormModal`
  já era referência de aderência; painéis já usam primitivos ui).

## 3. Gate da Etapa 6b

| Check | Teto | Agora | Veredito |
|---|---|---|---|
| `tsc --noEmit` | 0 | **0** | ✓ |
| `eslint .` | 11 err / 593 warn | **11 / 587** | ✓ (−6 vs teto: −3 ícones mortos, −3 dos movimentos anteriores) |
| `vitest run` | ≥224 | **224/224 (60 arq.)** | ✓ |
| `test:storybook` | ≥73 | **73/73 (21 arq.)** | ✓ |
| `test:visual` | ≥73 | **73/73** (sem stories novas; binário da 5b válido — nada no grafo SB mudou) | ✓ |
| `npm run build` | 82 / 2579,63 KiB | **82 / 2584,78 KiB** | ✓ (Δ+5,15 KiB vs baseline) |
| `build-storybook` / `docs:check` / `graphify` | ✓ | **✓** | ✓ |

## 4. Pendências / próximo

1. **§5.4 Conta/settings/time (Etapa 6):** SettingsManager, TeamManager, AccountPrivacyPanel,
   ProfileSettingsPanel, OwnerSubscriptionPanel, OwnerReferralsPanel, PostsManager, ShowcasePanel,
   SupportPanel, OrganizationsPanel, PublicLinkPanel, etc.
2. **§5.5 Crescimento/notificações/assinatura** e **§5.6 Master (Etapa 7)**.
3. `RetailCheckoutBlock` → features/queue ou domain (decisão nas Etapas 5–7).
4. Stories: D-008 / D-009.
