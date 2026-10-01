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
- Apagar produto (`DELETE /api/products/:id`) só é possível sem histórico de estoque/vendas e sem reserva aberta; `errorMessage` repassa a mensagem do backend para `PRODUCT_HAS_HISTORY` e `PRODUCT_HAS_OPEN_RESERVATIONS`. No card do catálogo as ações (Editar / Inativar / Apagar) só aparecem com `canManage` e ficam fora do clique do card (atalho de edição).
- Reserva de produto (vitrine pública `/queue/:id/produtos/:productId`): sem pagamento, sem estoque baixado — o disponível é `stockQty − SUM(RESERVED)`; quantidade 1..10 (limitada pelo disponível); máximo de 3 reservas abertas por WhatsApp; prazo padrão de 48h (`PRODUCT_RESERVATION_RETENTION_HOURS`); painel em Produtos → **Reservas** (retirada/cancelamento). Códigos `INSUFFICIENT_STOCK`, `RESERVATION_LIMIT_REACHED` e `RESERVATION_FINALIZED` tratados em `errorMessage`.
- Card do catálogo com reserva vigente: selo `Reservado · {n} un`, resumo `Em estoque {x} · reservado {n} · livre {l}` (só quando o produto controla estoque) e expansão **Ver reservas (k)** com `{qtd}× · {nome} · {whatsapp}`, `retirar até {data}` e link `wa.me`. A expansão e o atalho **Ver todas** (→ aba Reservas) ficam fora do `<button>` do card, então não abrem o modal de edição. Sem `reservations[]` (permissão restrita) aparece só o selo.
- A vitrine pública só lista produtos ativos, à venda e não expirados; sem produtos (ou sem estoque) a seção nem renderiza e a página nunca vira bloqueio.
- Marcar **retirada** não baixa estoque: a reserva sai da soma de `RESERVED` e a unidade volta para a vitrine — só a venda registrada na aba **Vendas** baixa `stockQty` (o diálogo de confirmação avisa isso).

## Notificações

- WhatsApp/e-mail são opcionais: falha de gateway não deve quebrar a UI principal; painéis de health mostram estado.

## Pendências documentais

Divergências código ↔ regra de produto aprovada devem ser listadas como pendência **sem** alterar comportamento nesta entrega só documental.
