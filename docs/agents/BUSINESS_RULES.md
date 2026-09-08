# Regras de negócio (visão frontend)

Invariantes confirmadas pelo consumo de API e UI. A fonte de verdade autoritativa está no backend + testes.

## Assinatura e acesso

- Trial **30 dias** (Pro) desde criação do salão; UI não deve tratar trial calendário como `CPF_BLOCKED`.
- Códigos: `SUBSCRIPTION_REQUIRED` (402), `CPF_BLOCKED` (403), `DASHBOARD_REQUIRED` (403) — `apiClient` / `AccessBlockedListener`.
- Plano Essencial: sem dashboard/insights; painel deve respeitar paywall.

## Papéis

- `OWNER` / `EMPLOYEE` / `MASTER_ADMIN` no painel; `CUSTOMER` no schema não tem portal neste frontend.
- Permissões granulares de employee: `usePermissions` + flags do usuário.

## Fila / agenda / híbrido

- Modos de operação do salão controlam UI pública (`PublicHome`, `PublicLinkPanel`).
- Booking público e staff usam `schedulingApi`; alinhamento guest vs auth depende do backend.

## Pacotes / fiado / produtos

- Receita de pacote na venda; consumo de sessão não deve duplicar receita na UI de insights.
- Fiado exige cliente quando método é fiado (PDV / retail).
- Produtos: estoque, venda, estorno — erros `INSUFFICIENT_STOCK` / códigos de SKU duplicado tratados em `errorMessage`.

## Notificações

- WhatsApp/e-mail são opcionais: falha de gateway não deve quebrar a UI principal; painéis de health mostram estado.

## Pendências documentais

Divergências código ↔ regra de produto aprovada devem ser listadas como pendência **sem** alterar comportamento nesta entrega só documental.
