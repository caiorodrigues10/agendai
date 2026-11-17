# Beacon de tráfego — contrato com o backend

Documento de contrato do beacon anônimo de tráfego (`POST /api/ping`). O frontend já
está implementado e envia os padrões abaixo; este arquivo registra **exatamente o que
o backend precisa aceitar**, para o trabalho no repositório do backend.

Nada aqui exige mudança de implementação no backend: o contrato atual já aceita os
valores descritos (ver [“O que o backend já suporta”](#o-que-o-backend-já-suporta)).
A pendência é de **garantia/regressão**: manter a classificação das áreas correta
para as novas rotas.

---

## 1. Endpoint

| Item | Valor |
|---|---|
| Método | `POST` |
| Caminho | `/api/ping` |
| `Content-Type` | `text/plain` (evita preflight de CORS) |
| Resposta | `204 No Content` (também nas respostas excluídas) |
| Origem | mesmo host do frontend; não precisa de cookie nem de autenticação |

## 2. Payload

O body é JSON (o backend também aceita pares `p=…&r=…`):

```json
{ "p": "/app-para-agendamento-de-salao", "r": "www.google.com.br" }
```

| Campo | Tipo | Obrigatório | O que é |
|---|---|---|---|
| `p` | `string` (máx. 2048) | opcional (default `/`) | **Padrão literal de rota** do frontend (nunca o valor concreto de slug/token). |
| `r` | `string` (máx. 2048) | opcional | Apenas o **host** do `document.referrer`. |

Regras do contrato (já validadas pelo backend em `trafficBeaconBodySchema`):

- O backend **descarta query string e fragmento** antes de classificar (`normalizeTrafficPath`).
- O caminho bruto **nunca é persistido nem logado**: só o *enum* de área e o host saem do request.
- A resposta é `204` tanto para visitas contadas quanto para as excluídas (sem sinalizar exclusão ao cliente).

## 3. Rotas que o backend precisa aceitar (novas)

Estas são as **rotas literais** que o frontend passou a enviar além das três já
existentes (`/esqueci-senha`, `/s/:slug`, `/agendamento/:token`):

| # | `p` enviado |
|---|---|
| 1 | `/` |
| 2 | `/funcionalidades` |
| 3 | `/ia-preditiva` |
| 4 | `/agendamento` |
| 5 | `/dashboard` |
| 6 | `/sobre` |
| 7 | `/contato` |
| 8 | `/privacidade` |
| 9 | `/termos` |
| 10 | `/planos` |
| 11 | `/software-para-salao-de-beleza` |
| 12 | `/sistema-para-salao-de-beleza` |
| 13 | `/sistema-para-barbearia` |
| 14 | `/app-para-agendamento-de-salao` |
| 15 | `/sistema-para-fila-de-barbearia` |
| 16 | `/sistema-para-manicure` |
| 17 | `/sistema-para-lash-designer` |
| 18 | `/crm-para-salao-de-beleza` |
| 19 | `/controle-financeiro-para-salao` |
| 20 | `/software-para-escritorio-de-advocacia` |

Além dessas, as duas famílias dinâmicas continuam valendo:

- `/s/:slug` — o slug concreto é descartado no frontend (ex.: `/s/salon/<id>` → `/s/:slug`).
- `/agendamento/:token` — o token concreto é descartado no frontend.

**Total esperado pelo backend: 22 valores de `p`** (20 literais + 2 famílias).

### O que NÃO é enviado

O frontend nunca envia (e o backend não precisa aceitar) identificadores: slug,
token, id, query string ou fragmento de rotas como `/queue/:id`,
`/saloes/:salonId/posts/:postId`, `/convite/:token`, `/assinar/:token`,
`/nps/:surveyId`. Rotas de acesso (`/login`, `/cadastro`, `/reset-password`,
`/email-verificado`, `/bloqueado`), checkout, `/minha-conta` e toda a área logada
(`/app`, `/master`) **não geram beacon**.

## 4. Classificação de área esperada

| `p` | Área esperada |
|---|---|
| `/`, `/funcionalidades`, `/ia-preditiva`, `/agendamento`, `/dashboard`, `/sobre`, `/contato`, `/privacidade`, `/termos`, `/planos`, as 10 páginas de intenção comercial, `/esqueci-senha` | `public_site` |
| `/s/:slug` | `salon_public` |
| `/agendamento/:token` | `salon_public` |

## 5. O que o backend já suporta (sem mudança obrigatória)

Lido no código atual do backend (`src/modules/traffic/`):

- `trafficBeaconBodySchema` (`schemas/trafficSchemas.ts`): `p` é `z.string().max(2048).optional()` e `r` é `z.string().max(2048).optional()` — **não há allowlist de rotas**, então as 22 rotas acima já são aceitas sem alteração.
- `classifyTrafficArea` (`domain/trafficAreas.ts`): classifica por prefixo e usa `public_site` como default para qualquer caminho desconhecido — logo, todas as novas literais caem em `public_site` sem mudança.
- `RecordVisitUseCase` (`application/useCases/RecordVisitUseCase.ts`): normaliza o caminho (descarta query/fragmento), aplica as exclusões de privacidade (DNT/GPC, bot, origem, prefetch, host ignorado) e persiste apenas contadores agregados.

**Conclusão: nenhuma alteração de código é exigida no backend para esta entrega.**

## 6. Pendências reais (regressão a blindar)

1. **`/app-para-agendamento-de-salao` precisa continuar em `public_site`.**
   O prefixo de área logada no backend é `/app`, e a comparação correta é
   `path === "/app" || path.startsWith("/app/")`. Se alguém "simplificar" essa
   comparação para `path.startsWith("/app")`, a página comercial
   `/app-para-agendamento-de-salao` passa a ser classificada como `logged_area` e
   some de "Site público". **Recomenda-se um teste de unidade no backend
   cobrindo explicitamente esse caminho.**
2. **Nenhuma allowlist nova deve ser introduzida** no schema do ping: o beacon é
   anônimo por padrão e a validação atual (string curta) é proposital.
3. **Nenhum identificador pode ser persistido** a partir do `p` — a regra atual
   (reduzir o caminho à área enum) precisa continuar valendo para as novas rotas.

## 7. Como o frontend valida o contrato

- Unitário: `src/infra/trafficBeaconApi.test.ts` (18 testes) — lista de literais,
  famílias, negativos (query, fragmento, rotas logadas, desconhecidas) e o payload
  realmente enviado.
- Browser-level: `e2e/traffic-beacon.spec.ts` — prova que o ping vai como
  `text/plain` para `/api/ping`, com o padrão literal (sem query/fragmento) e sem
  beacon em rotas fora da lista.
- Relatório: `GET /api/admin/traffic` (`adminTrafficApi.getTrafficReport`) com
  `period=day|week` e `area=all` alimenta o card “Pessoas que entraram” do
  `/master/overview` e a tela `/master/traffic`.
