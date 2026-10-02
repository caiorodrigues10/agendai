# Etapa 5a — Operação: clients / appointments / onboarding

> Status: **concluída** (parte da §5.1 da matriz; finance e painéis seguem na Etapa 5b).
> Anterior: [07-stage4-pilots](07-stage4-pilots.md).

## 1. Migração de componentes (§5.1)

| Origem (`components/domain/`) | Destino | Consumidores atualizados |
|---|---|---|
| `AddCustomerForm`, `ServiceCard` | `features/clients/` | PublicHome, StaffDashboard (barrel) |
| `AppointmentScheduler`, `AppointmentCalendar`, `AppointmentBookingModal`, `BookPackageSessionsModal` | `features/appointments/` | PublicHome, StaffDashboard, ClientProfileSheet (Etapa 6 fica no domain — importa via `../../features/appointments`) |
| `OnboardingChecklist`, `ActivationChecklist` | `features/onboarding/` | StaffDashboard (barrel único) |

- Barrels novos: `features/clients/index.ts`, `features/appointments/index.ts`,
  `features/onboarding/index.ts` (padrão do piloto `features/queue`).
- Reescrita de imports internos `../ui/*` → `../../components/ui/*` (profundidade de
  `features/<área>` = 3 níveis, idêntica a `components/domain` — `../../types|utils|infra`
  permaneceram válidos; tsc 0 após o move).
- **Exceção de escopo registrada:** os 6 arquivos alterados em paralelo fora da reestruturação
  (`AppointmentScheduler`/`AppointmentCalendar` + `productsApi`/`schemas`/`types`/`schedulingUtils`,
  features "produtos reservados"/"venda pública" de 01/10) foram **preservados intactos** no move —
  gates desta etapa já os cobrem.

## 2. Adoção de padrões

- **ModalShell** nos 2 modais ad-hoc:
  - `AppointmentBookingModal`: portal+backdrop+header manual → shell. O `<form>` (RHF) envolve
    body + ação de confirmação dentro do slot `body` (o submit precisa viver no form;
    atributo `form=` descartado por suporte Safari). Normalizações: z-120→**z-110**,
    `animate-fade-in` removido (shell não anima), footer full-bleed → `border-t pt-4` no fluxo,
    backdrop `aria-label "Fechar agendamento"` → `"Fechar"` do shell, X/Escape padronizados
    (`loading` trava X durante submit). Conteúdo (seções, validações, pacote, busca de cliente) intacto.
  - `BookPackageSessionsModal`: idem — subtítulo do pacote foi para o slot `children` (sob o
    título), erro/filtros/calendário/horários no slot `body`, confirmação no slot `footer`
    (agora `w-full`); scroll do painel inteiro (`max-h-[min(88dvh,…)] overflow-y-auto`,
    precedente do ReturnToQueue) no lugar do scroll-only do body.
- **Button** em `AppointmentCalendar` — 3 conversões fiéis: "Novo" (primary/sm),
  "Não compareceu" (secondary/sm), "Fechar" (ghost). **Justificativa das demais (16):**
  segmentos Salão/Profissional, itens de dropdown, células do mini-calendário, card de
  agendamento na grade e o par de ações soft (check-in/danger/10) são `<button>` bruto com
  semântica/estética correta — mapear para `Button` mudaria tamanho (chevrons `p-2` ≠
  `size=icon` 44px) ou identidade (soft → sólido); registrado como desvio da linha "18 botões"
  da matriz.
- Overlays internos restantes (detalhe do agendamento `z-50`, dropdowns) **não** constavam da
  matriz de adoção — mantidos.

## 3. Stories (inclui pendências da Etapa 4)

- `Fila/ReturnToQueueModal` (3), `Fila/ClosedSalonJoinModal` (2), `Fila/QueueCapacityBanner` (3,
  MSW story-level `GET /api/barbershops/:id/queue-alert`), `Agenda/AppointmentBookingModal` (3),
  `Agenda/BookPackageSessionsModal` (2, MSW `GET /api/appointments/availability`).
- Fixtures compartilhadas: `features/appointments/storyFixtures.ts` (schedule/settings/staff/services).

## 4. Gate da Etapa 5a

| Check | Teto | Agora | Veredito |
|---|---|---|---|
| `tsc --noEmit` | 0 | **0** | ✓ |
| `eslint .` | 11 err / 593 warn | **11 / 589** | ✓ (−4 vs teto) |
| `vitest run` | ≥199 | **199/199 (51 arq.)** | ✓ |
| `test:storybook` | ≥48 | **61/61 (17 arq.)** | ✓ (1 flake D-006 na 1ª execução, passou na reexecução) |
| `test:visual` | ≥48 | **61/61** (13 novos + 48 intactos) | ✓ (update + verificação limpa) |
| `npm run build` | 81 / 2585,04 KiB | **81 / 2582,87 KiB** | ✓ (Δ−2,17 KiB: moves p/ features não duplicam módulos) |
| `build-storybook` / `docs:check` | ✓ | **✓** | ✓ |

## 5. Pendências / próximo

1. **Etapa 5b — finance:** `CashPanel`, `FinancialDashboard`, `OwnerFinancialPanel` (1582L —
   maior corte, extrair sub-blocos), `ProfitEnginePanel`, `WeatherForecastWidget`
   (CSS weather sai de `index.css` → `styles/features/`), `DemandAlertBanner` → `features/finance`.
2. Painéis §5.1 restantes: goals/loyalty/waitlist/recurring/recommendations/equipment/deposits.
3. `RetailCheckoutBlock` cruzado (queue → domain) — decidir quando.
4. ClientProfileSheet: testado como consumidor; adoção ModalShell/estilo é da Etapa 6 (§5.2).
