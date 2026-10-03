# Settlement §6 — painéis `0c` e UI órfã

Status: **avaliação concluída** (decisões de produto pendem de sanção). Data: 2026-10-03.
Varredura: script de imports em todo `src/` (auto-imports e barrels contam; arquivo homônimo excluído).

## 1. Painéis de domínio (16) — todos **0c confirmados** hoje

| Painel | LOC | Infra `*Api.ts` | Recomendação |
|---|---|---|---|
| StaffManagementPanel | 568 | staffApi (251L) | **manter 0c** — decisão já registrada na [13-stage6d](13-stage6d-growth.md): não substitui `TeamManager` |
| SmartPricingPanel | 530 | pricingApi (164L) | manter 0c — API pronta, painel aguarda wiring de produto |
| VouchersPanel | 505 | vouchersApi (283L) | manter 0c — idem |
| FormsPanel | 492 | formsApi (97L) | manter 0c — idem |
| IntegrationsPanel | 641 | integrationsApi (102L) | manter 0c — idem |
| WhatsAppAIPanel | 367 | whatsappAiApi (129L) | manter 0c — idem |
| FiscalPanel | 363 | fiscalApi (116L) | manter 0c — idem |
| QualityPanel | 314 | qualityApi (91L) | manter 0c — idem |
| CorporatePanel | 323 | corporateApi (99L) | manter 0c — idem |
| PurchasingPanel | 268 | purchasingApi (89L) | manter 0c — idem |
| CopilotPanel | 168 | copilotApi (62L) | manter 0c — idem |
| DepositIndicators | 112 | depositsApi (97L) | manter 0c — idem |
| EnhancedForecastPanel | 120 | enhancedForecastApi (60L) | manter 0c — idem |
| ServiceBookingSelector | 185 | — (sem API própria) | manter 0c — genérico de agendamento; avaliar adoção junto com AppointmentScheduler |
| ReputationPanel | 193 | reputationApi (117L) | manter 0c — idem |
| OnboardingMissions | 55 | (barbershopApi) | manter 0c — idem |

**Por que não remover agora:** os 14 wrappers HTTP correspondentes existem e são auditados por
`contract:check`; remover só o painel deixaria a API órfã, remover os dois é decisão de produto
(features em backend podem estar vivas). Remoção, se decidida, é **PR separado com rollback
independente** (regra §6) — nada é apagado pela reestruturação.

**Por que não migrar:** regra `0c não migra silenciosamente` — os painéis permanecem em
`components/domain/` até ganharem consumidor ou decisão explícita. Orfãos: 16 (baseline 16; limite
não aumentou).

## 2. UI genórica `0c`/parcial (matriz §1)

| Item | Status na varredura | Decisão |
|---|---|---|
| `ui/PaginationBar` | **adotado**: `ProductReservationsPanel.tsx` (consumidor externo da fila de reservas) | mantido em `ui/` — sai da fila 0c |
| `ui/DataTableState` | removido na Etapa 3; o trio vivo é `components/patterns/states/DataTableState` (+story) com **re-export no barrel e nenhum uso em produto** | adoção pendente: receitas locais (ex.: `billingShared.SectionError`/`PaginationBar`, variantes em painéis) trocam por story-first — **D-014** |
| `ui/credit-card-form` | 0c confirmado (checkout usa embed do provedor) | manter até decisão: ou vira `features/payments` com adotante, ou candidato a remoção em PR separado |
| `MasterAdminDashboard` | 0c confirmado | **D-012** (settlement/remoção antes de extrair sub-blocos) |

## 3. Evidências

- Varredura: `StaffManagementPanel … OnboardingMissions` = 0 importadores; `DataTableState` só
  barrel+stories; `ui/PaginationBar` 1 consumidor real; `CreditCardForm` 0.
- Nenhum órfão novo foi criado pelas Etapas 5–7 (limite de orfãos estável em 16 painéis + 1 UI).

## 4. Pendência de decisão (usuário)

1. Remover (ou não) os 16 painéis + APIs correspondentes — PRs separados, por feature.
2. Destino do `credit-card-form` (features/payments vs remoção).
3. `MasterAdminDashboard` (D-012): remoção ou restauração de uso.
