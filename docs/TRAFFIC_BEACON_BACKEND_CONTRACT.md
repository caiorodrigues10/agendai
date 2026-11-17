# Contrato do backend para o beacon de tráfego

> **Status (2026-11-17):** contrato **implementado no backend** (branch
> `feat/traffic-backend`). O backend passou a reconhecer os padrões de rota de
> salão em `POST /api/ping` e a expor `GET /api/barbershops/:id/traffic` no
> formato definido abaixo. Detalhes da implementação (armazenamento, retenção,
> decisões e operação): `backend/docs/TRAFFIC_BEACON_SALON.md`.
>
> Pendência fora do repositório frontend: **decisão de produto** sobre o slug de
> organização multiunidade (ver "Resolução de id e slug") — o backend
> implementou a opção 1 recomendada, mas a decisão final continua pendente.
> Nenhuma alteração de backend foi feita no frontend.

## Requisição

- Método e caminho: `POST /api/ping`.
- `Content-Type: text/plain`.
- O corpo é um JSON serializado em texto, por exemplo:

```json
{"p":"/app-para-agendamento-de-salao"}
```

Quando existe um referrer válido, o único campo opcional é o hostname, sem caminho, query ou fragmento:

```json
{"p":"/","r":"www.google.com.br"}
```

Contrato do payload (beacon global — páginas de marketing/intenção):

- `p`: obrigatório; padrão de rota allowlisted.
- `r`: opcional; somente hostname do referrer.
- Não há campos para token, identificador de visitante, query ou fragmento.
- O frontend não depende do corpo da resposta; qualquer resposta de sucesso do endpoint é suficiente.
- Pings globais (sem `salon`) não têm `kind`: para rotas de marketing todo ping aceito é uma visita.

## Payload de atribuição ao salão (páginas públicas de um salão)

As páginas públicas de um salão usam um segundo payload, com atribuição e com o tipo de evento explícito.

### Tabela de exemplos (payloads reais enviados pelo frontend)

| Caso | Payload |
|---|---|
| Entrada normal em `/queue/<uuid>` | `{"p":"/queue/:id","salon":"<uuid>","salonType":"id","kind":"visit","tab":"queue"}` |
| Deep link `/queue/<uuid>?tab=profile` | `{"p":"/queue/:id","salon":"<uuid>","salonType":"id","kind":"visit","tab":"profile"}` |
| Troca de aba depois da entrada (fila → perfil) | `{"p":"/queue/:id","salon":"<uuid>","salonType":"id","kind":"tab","tab":"profile"}` |
| Vitrine de produto `/queue/<uuid>/produtos/<pid>` | `{"p":"/queue/:id/produtos/:productId","salon":"<uuid>","salonType":"id","kind":"visit"}` |
| Link de slug `/s/<slug>` | `{"p":"/s/:slug","salon":"<slug>","salonType":"slug","kind":"visit"}` |
| Link canônico `/s/salon/<uuid>?tab=profile` | `{"p":"/s/:slug","salon":"<uuid>","salonType":"id","kind":"visit","tab":"profile"}` |

### Contrato deste payload

- `p`: obrigatório; um destes três padrões: `/queue/:id`, `/queue/:id/produtos/:productId`, `/s/:slug`.
- `salon`: obrigatório; id público do salão — UUID do barbershop ou slug público (`a-z0-9` com hífen, máx. 100 caracteres). O id/slug já faz parte da URL pública compartilhada, por isso pode ser enviado; **o visitante continua anônimo** (nada de cookie, localStorage, fingerprint, IP, user agent ou identificador persistente).
- `salonType`: obrigatório; allowlist fixa `id` | `slug`. Informa a forma do valor em `salon` (ver "Resolução de id e slug" abaixo) para o backend não precisar adivinhar. Valor fora da allowlist → descartar o ping.
- `kind`: obrigatório; allowlist fixa `visit` | `tab` (ver "Definições de contagem"). Valor ausente ou fora da allowlist → **descartar o ping inteiro** (responder sucesso sem gravar): um ping sem `kind` é ambíguo e nunca deve virar visita por padrão.
- `tab`: opcional; uma de `queue`, `appointments`, `profile` (allowlist fixa). Qualquer outro valor não é enviado pelo frontend; no backend, valor fora da allowlist vira ausente (ou descarta o ping — o comportamento não é observável pelo frontend).
- `r`: opcional; somente hostname do referrer.
- **Nunca** enviar: `productId` concreto (só o padrão literal), token, query, fragmento, nome/e-mail/telefone.

### Definições de contagem (inequívocas)

- **Visita** = um ping aceito com `kind:"visit"`. O frontend emite **exatamente um** `visit` por carregamento da página pública do salão (entrada na rota ou navegação inicial), sempre com a aba inicial resolvida quando conhecida (inclusive deep link `?tab=`). `totals.visits` e a série contam somente `kind:"visit"`. Um ping de produto é um `visit` sem `tab`.
- **Visitante único** = hash diário distinto (ver pseudonimização abaixo) dentre os pings `kind:"visit"` da janela. Pings `tab` do mesmo carregamento não alteram a contagem de visitantes.
- **Visualização de aba** = um ping com `kind:"tab"`, enviado **somente** quando o usuário troca de aba depois da entrada — nunca para a aba inicial. Abas **só alimentam a quebra por seção** (`sections`): nunca incrementam `totals.visits` nem `totals.visitors`.
- Trocar de query na mesma URL (`?utm=…`) não gera ping novo; a deduplicação de emissão no cliente é por rota + aba (e StrictMode não duplica).

### Visitas do próprio dono e da equipe (regra do frontend)

- O frontend **não envia** o ping de salão quando a sessão autenticada tem `barbershopId` igual ao `salon` da URL (dono ou funcionário do salão visitado — apenas correspondência **clara** de id; em dúvida, envia). A leitura é do storage de sessão já existente, sem token na rede e sem storage novo; nenhum dado do usuário entra no payload.
- O beacon global (marketing, sem `salon`) **não é afetado** por essa regra.
- O endpoint `POST /api/ping` segue anônimo (sem cookie/token), então o backend não recebe a sessão e não precisa — nem pode — repetir essa regra no servidor.
- **Pendência**: correspondência por organização/slug (multiunidade) não é possível no cliente sem consulta de rede — ver "Resolução de id e slug".

### Resolução de id e slug (`salon` + `salonType`)

Como o frontend resolve hoje o identificador:

- `/queue/:id` e `/queue/:id/produtos/:productId` → `id` é sempre o **UUID do barbershop** (`salonType:"id"`). Resolução direta: barbershop.
- `/s/salon/:id` (link canônico de compartilhamento, servido pelo backend) → id público do barbershop (`salonType:"id"`).
- `/s/<slug>` → **slug da organização** (`salonType:"slug"`), não de barbershop. O frontend não consulta qual unidade o slug representa.

Como o backend deve resolver o slug quando a organização tem várias unidades — **opções (decisão pendente de produto/backend)**:

1. **Atribuir o ping à organização** (slug → org) e expor o relatório apenas ao dono da organização (visão agregada da org, ou atribuição à unidade principal). — **Recomendada**: não perde dados, não inventa unidade e mantém a leitura restrita ao dono.
2. **Ignorar o ping quando o slug for ambíguo** (org com mais de uma unidade): responder sucesso sem gravar. — Mais conservadora, mas perde visitas de slug em orgs multiunidade.
3. Atribuir a uma unidade específica fixa (ex.: primeira/unidade primária da org). — Simples, mas atribui visitas a uma unidade que o visitante talvez nem tenha aberto; não recomendada sem decisão explícita.

> ⚠️ **Decisão pendente (backend, 2026-11-17)**: enquanto não decidida, a opção recomendada é a **1**. O `salonType:"slug"` já evita que o backend confunda slug com UUID; para `salonType:"id"` a resolução é direta (barbershop).
>
> **Estado da implementação no backend:** a **opção 1** foi implementada — o ping de
> slug é atribuído à **organização** (`o:<organizationId>`) e o relatório do
> salão inclui esse agregado apenas para o **dono da organização** e para o
> `MASTER_ADMIN` (dono de unidade não enxerga o tráfego de outra unidade). A
> resolução fica isolada em um único adapter
> (`backend/src/modules/traffic/infra/prismaSalonAttributionResolver.ts`), para
> que a troca de decisão não afete contador, consolidação ou relatório.
>
> **Dúvida ainda aberta (produto):** se o dono de **cada unidade** deveria ver o
> agregado da organização. Hoje a leitura é restrita ao dono da organização — a
> interpretação mais conservadora dentro da opção 1.

### Validação no backend

- Validar o formato de `salon` (charset `A-Za-z0-9` + hífen, 1..100) antes de qualquer consulta.
- Validar `salonType` e `kind` contra as allowlists (`id|slug` e `visit|tab`); qualquer valor fora delas → **descartar o ping** (204 sem gravar).
- **Se o salão não existir ou o id for inválido, ignorar silenciosamente** (responder sucesso sem gravar). Não responder erro para não dar sinal de enumeração de ids.
- Um ping com `salon` inválido não pode quebrar nem logar erro de servidor.

### Visitantes únicos sem cookie — pseudonimização só no servidor

Como o frontend não envia identificador, a deduplicação é do backend. **A pseudonimização acontece somente no servidor**:

- Hash salgado diário de `IP + User-Agent` (ex.: `HMAC-SHA256(salt_do_dia, ip || ua)`), calculado no servidor a partir da requisição; **o frontend nunca envia IP, user agent ou qualquer identificador no corpo**.
- O salt é **aleatório e rotativo por dia civil** (o mesmo IP em dias diferentes produz hashes diferentes) e **nunca é exportado** — sem salt o hash não revela o IP.
- O hash diário é **descartado em até 24h**; não vira cookie, não vira id persistente e não é recuperável sem o salt do dia.
- `visitors` = contagem distinta do hash dentro da janela (dentre pings `kind:"visit"`); `visits` = total de pings `kind:"visit"`.
- `visitorsBasis` informa a base usada: `daily_distinct` (janela de 1 dia) ou `sum_of_daily_distinct` (somas das distinções diárias — a mesma pessoa pode contar em dias diferentes). O frontend já exibe a legenda certa conforme o valor.

### Retenção sugerida

- Pings agregados: 13 meses (permite comparar com o mesmo período do ano anterior).
- Hash diário de visitante: descartar em até 24h.
- Log de acesso do endpoint: regra padrão do projeto.

### Proteção contra bot e inflação

- Rate limit por IP em `POST /api/ping` (ex.: 60/min por IP; excedente → 204 sem gravar, para não quebrar o frontend).
- Descartar pings com User-Agent claramente de bot, se desejar, antes de contar.
- Não confiar em `r` (referrer forjável) para métricas críticas.

## Novas rotas que o backend precisa aceitar

O backend precisa reconhecer estes valores exatos em `p` para as novas páginas públicas de marketing/intenção comercial:

1. `/`
2. `/funcionalidades`
3. `/ia-preditiva`
4. `/agendamento`
5. `/dashboard`
6. `/sobre`
7. `/contato`
8. `/privacidade`
9. `/termos`
10. `/planos`
11. `/software-para-salao-de-beleza`
12. `/sistema-para-salao-de-beleza`
13. `/sistema-para-barbearia`
14. `/app-para-agendamento-de-salao`
15. `/sistema-para-fila-de-barbearia`
16. `/sistema-para-manicure`
17. `/sistema-para-lash-designer`
18. `/crm-para-salao-de-beleza`
19. `/controle-financeiro-para-salao`
20. `/software-para-escritorio-de-advocacia`

Mais os três padrões de página de salão, **com os campos `salon`, `salonType` e `kind`** (ver seção acima):

21. `/queue/:id`
22. `/queue/:id/produtos/:productId`
23. `/s/:slug` (com `salon`; sem `salon` continua sendo o ping anônimo já aceito)

## Padrões já existentes que continuam aceitos

- `/esqueci-senha`
- `/s/:slug`
- `/agendamento/:token`

Nos dois últimos, quando não há atribuição de salão, o frontend envia somente o texto do padrão. O token concreto nunca chega ao backend.

## Leitura: relatório de visitas do salão (novo endpoint)

> **Status (backend, 2026-11-17):** implementado em `GET /api/barbershops/:id/traffic`.
> Guardas: bearer obrigatório (401), apenas `OWNER` do salão da rota ou
> `MASTER_ADMIN` **com `internal:traffic:read`** (403 para `EMPLOYEE`, para dono
> de outro salão e para admin interno escopado sem a permissão), query com
> **apenas** `period` (400 para período inválido, ausente ou parâmetro extra).
> `beaconEnabled` reflete `TRAFFIC_BEACON_ENABLED` no servidor. Atraso
> típico: os agregados aparecem após a consolidação horária do cron
> `traffic-consolidation`.

- Método e caminho: `GET /api/barbershops/:id/traffic?period=day|week|month|3m|year`.
- Autenticado (bearer). **Somente o dono do salão** (`OWNER` do barbershop; `MASTER_ADMIN` pode ler **se** tiver `internal:traffic:read` — mesma guarda de `/master/traffic`; lista interna vazia/`internal:all` mantém o acesso total legado) — 403 para os demais. Funcionário (`EMPLOYEE`) não acessa, mesmo com permissão de relatórios.
- **402 `SUBSCRIPTION_REQUIRED`**: o relatório é recurso pago — assinatura vencida do salão → 402 (o `MASTER_ADMIN` não é bloqueado por assinatura). O frontend trata esse 402 com mensagem de assinatura vencida + link para `/planos`, **sem** botão de retry.
- **403 `CPF_BLOCKED`**: o dono está com o CPF bloqueado → o frontend mostra uma mensagem neutra de acesso bloqueado, **sem** link de renovação e **sem** retry (renovar o plano não resolve esse bloqueio).
- `id` na rota é o salão; a query tem **apenas** `period` (janelas móveis calculadas no servidor, fuso `America/Sao_Paulo`):
  - `day` = hoje; `week` = últimos 7 dias; `month` = últimos 30 dias; `3m` = 90 dias; `year` = 365 dias.
  - Não há âncoras de data/mês no frontend.
- Resposta no formato do relatório admin (`AdminTrafficData`), com os campos extras de seção:

```json
{
  "success": true,
  "data": {
    "period": { "key": "week", "label": "…", "granularity": "day", "fromDay": "2026-11-10", "toDay": "2026-11-16", "prevFromDay": "2026-11-03", "prevToDay": "2026-11-09", "timezone": "America/Sao_Paulo", "dataFrom": null },
    "generatedAt": "2026-11-16T12:00:00.000Z",
    "beaconEnabled": true,
    "totals": { "visits": 42, "visitors": 30, "visitorsBasis": "daily_distinct" },
    "prevTotals": { "visits": 20, "visitors": 12, "visitorsBasis": "daily_distinct" },
    "deltaPct": { "visits": 50, "visitors": 75 },
    "series": [ { "bucketStart": "2026-11-15", "label": "15/11", "visits": 12, "visitors": 9, "partial": false } ],
    "sections": [
      { "section": "profile", "visits": 20, "visitors": 15 },
      { "section": "queue", "visits": 12, "visitors": 8 },
      { "section": "appointments", "visits": 6, "visitors": 5 },
      { "section": "products", "visits": 4, "visitors": 3 },
      { "section": "other", "visits": 1, "visitors": 1 }
    ],
    "origins": [ { "host": "www.instagram.com", "visits": 14 } ]
  }
}
```

- `totals`/`series` contam **apenas pings `kind:"visit"`** (ver definições acima).
- `sections` cobre as seções da página pública do salão, derivadas de `p` + `tab`; é a **única** métrica alimentada também pelos pings `kind:"tab"` (visualizações de aba):
  - `profile` = `/s/:slug` e `/queue/:id` com `tab=profile`;
  - `queue` = `/queue/:id` com `tab=queue` (ou sem `tab`);
  - `appointments` = `/queue/:id` com `tab=appointments`;
  - `products` = `/queue/:id/produtos/:productId`;
  - `other` = qualquer ping de salão fora dos casos acima.
  - Em `sections[].visits` entram os `visit` daquela seção **mais** os `tab` da aba correspondente (visualizações de seção); `sections[].visitors` = hashes distintos na seção.
- `origins` = top referrers (hostname) do período, mesmo formato do relatório admin.
- `beaconEnabled: false` quando a coleta está desligada no ambiente; a UI mostra o aviso e esconde os números.
- `deltaPct`/`prevTotals` comparam com a janela anterior imediatamente anterior de mesmo tamanho; `null` quando não há comparação.
- Quando não há dados, `series`/`sections`/`origins` vêm vazios (a UI mostra "Ainda sem visitas registradas") — não é erro.

### Limitação da rota `/s/salon/:id`

O link compartilhado `${PUBLIC_APP_URL}/s/salon/:id` é servido **pelo backend** (HTML fora do prefixo `/api`, para o crawler — ver `app.ts`). O beacon de `salon` para esse caminho só funciona quando quem atende `/s/salon/:id` executa a SPA (ou seja, o próprio backend serve o HTML do frontend nessa rota). Se o backend servir HTML estático próprio sem a SPA, **os pings da rota canônica não serão emitidos** — nesse caso o backend pode: (a) servir a SPA nessa rota, ou (b) contar a visita do redirect server-side. O frontend não contorna isso: a regra de que a rota `/queue/:id?tab=profile` é o destino interno permanece (ver `BUSINESS_RULES.md`).

## Privacidade e CORS

- `POST /api/ping` deve continuar aceitando requisições anônimas, sem token de autenticação.
- O frontend envia `text/plain` para evitar preflight; o endpoint precisa permitir CORS para a origem pública do frontend.
- O frontend desativa o envio em ambiente não produtivo e quando DNT/GPC está ativo. O backend deve continuar tratando o ping como anônimo.
- Rotas da área logada e rotas operacionais fora da allowlist não são enviadas; o backend não deve inferir uma rota monitorada a partir de outro campo da requisição.
- Campos ausentes (`tab`, `r`, `salon`, `salonType`, `kind`) não devem ser presumidos nem preenchidos pelo backend.
