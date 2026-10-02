# Etapa 6c — Conta / settings / time (§5.4)

> Status: **concluída**.
> Anterior: [11-stage6b-catalog-products](11-stage6b-catalog-products.md).

## 1. Migração de componentes

| Origem (`components/domain/`) | Destino | Consumidores atualizados |
|---|---|---|
| `SettingsManager`, `AccountPrivacyPanel`, `EmailHistoryPanel`, `EmailPreferencesPanel`, `ProfileSettingsPanel`, `ProfileAvatarSection`, `QueueAlertSettings` | `features/settings/` (barrel: 7 exports) | StaffDashboard (barrel), SettingsManager irmãos (`./X`, `../support/SupportPanel`) |
| `TeamManager` | `features/team/` (barrel: 1) | StaffDashboard (barrel) |
| `SupportPanel` + `support/*` (`SupportReportDetail/Form/List`, `supportLabels`, +test) | `features/support/` (barrel: 5 exports; subpasta achatada) | StaffDashboard (barrel), SettingsManager (`../support/SupportPanel`) |
| `OrganizationsPanel`, `MultiUnitDashboard` (+test) | `features/organizations/` (barrel: 2) | StaffDashboard (barrel) |
| `OwnerReferralsPanel`, `ReferralTierBadge`, `ShareReferralButton` | `features/referrals/` (barrel: 3) | StaffDashboard (barrel) |

- `domain/support/` removido. Depth fix dos arquivos vindos de `domain/support/` (nível 4):
  `../../../` → `../../` e `../../ui/` → `../../components/ui/`.
- `OwnerNotificationsPanel` permanece em `components/domain/` nesta etapa (destino
  `features/notifications` na §5.5); SettingsManager importa via `../../components/domain/`.
- StaffDashboard consolidou 8 linhas de import em 5 (barrels) e removeu import duplicado de
  `features/catalog`.

## 2. Adoções (ações sancionadas pela matriz §5.4)

- **AccountPrivacyPanel** — lint err `react-hooks/purity` pré-existente corrigido ao adotar:
  contagem de cooldown movida para estado (`cooldownSeconds`), `Date.now()` só dentro do
  `setInterval` do effect; `useRef`/ref de intervalo removidos.
- **EmailHistoryPanel / EmailPreferencesPanel** — lint err `consistent-type-definitions`
  corrigido: `type LogEntry`/`type CategoryDef` → `interface`.
- **QueueAlertSettings** — recipe própria de inputs substituída por `Field` + `FIELD_CONTROL`
  (limite numérico e WhatsApp); botões Salvar/teste → `Button` (`primary`/`secondary`).
- **SettingsManager — "extrair sub-blocos" (ação principal):** 997L → **~330L**. Seis blocos
  extraídos para arquivos irmãos em `features/settings/`:
  `ShopCityField`, `WeatherForecastCard` (+ helpers `weatherIcon`/`weatherDayLabel`),
  `AppointmentPolicySection` (+ `DEFAULT_APPOINTMENT_POLICY`),
  `SalonWhatsAppConnection` (+ consts de polling + `platformWhatsAppUnavailable`,
  334L), `BusinessSegmentSection` (+ `SEGMENT_OPTIONS`), `OperationModeSection`
  (+ `MODE_OPTIONS`/props). Props de `onNotify` redeclaradas localmente (sem ciclo com o pai).
- **Overlay → ModalShell**: modal "Desconectar WhatsApp?" (portal ad-hoc, backdrop manual,
  sem Escape/foco) → `patterns/ModalShell` (`role=alertdialog`, `loading` trava fechamento,
  mensagem+erro no `body`, Cancelar/Desconectar (`Button secondary`/`danger`) no `footer`).
- **Field** também no formulário principal: `ShopCityField` (Cidade), Nome do Salão, Endereço,
  pareamento WhatsApp e "Receber avisos em outro número" (ícone mantido no wrapper `relative`,
  `pl-10` sobrepõe o `px-4` do `FIELD_CONTROL`); dicas passaram para o slot `hint`.
- Mantidos como estão (fora do mandato, receitas compactas): inputs de horário dos dias
  (relógio embutido), inputs numéricos/checkbox de `AppointmentPolicySection`, file input da
  logo (label-button), toggles/segmented control. "Logo do Salão" virou `span` (era `label`
  sem control — corrige `jsx-a11y/label-has-associated-control`).

## 3. Gate da Etapa 6c

| Check | Teto | Agora | Veredito |
|---|---|---|---|
| `tsc --noEmit` | 0 | **0** | ✓ |
| `eslint .` | 11 err / 593 warn | **8 / 580** | ✓ (−3 erros sancionados: purity + 2×type→interface; −7 warnings) |
| `vitest run` | ≥224 | **224/224 (60 arq.)** | ✓ |
| `test:storybook` | ≥73 | **73/73 (21 arq.)** | ✓ (sem flake D-006) |
| `test:visual` | ≥73 | **73/73** (sem stories novas) | ✓ |
| `npm run build` | 82 / 2579,63 KiB | **82 / 2582,58 KiB** | ✓ (Δ+2,95 KiB vs baseline) |
| `docs:check` / `graphify` | ✓ | **✓** | ✓ |

Erros restantes (8): 2 parsing estrutural (e2e/server) + `PostEditor` purity (§5.5) +
`emailApi`×2/`goalsApi`/`staffApi` type→interface + `LoginPage.test` array-type (fora do
mandato das §5.x — teto D-003 respeitado).

## 4. Pendências / próximo

1. **§5.5 Crescimento/notificações/assinatura:** PostsManager/PostEditor (corrigir purity do
   `Date.now` no `min` do agendamento + unificar `OBJECTIVES`), ShowcasePanel, painéis de
   notificações, OwnerSubscriptionPanel (2 overlays → ModalShell), TrialExpiredPaywallModal,
   ClientPortal, PricingPersuasionCharts.
2. **§5.6 Master admin (Etapa 7)** e Etapas 8–10 (permissions/storage/contracts, budget/perf,
   gate final).
3. Stories: D-008 / D-009 seguem abertos; extração do `OwnerFinancialPanel` = D-007.
