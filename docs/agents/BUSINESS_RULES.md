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

## Aparência da página pública (tema)

- Tema via CSS vars escopadas no wrapper `[data-ag-shop-theme]`: família canônica `--shop-*` (por variante) + espelho legado `--ag-*`; as utilities do Tailwind resolvem `var(--shop-x, var(--ag-x))` (`styles/tokens.css`). Variantes `light`/`dark` por salão (`darkColors`/`lightColors` no payload; `lightColors` nula é gerada no cliente via `generateVariantColors`, mesmo gerador do back) e `mode` do dono (`AUTO` segue `prefers-color-scheme`; `LIGHT`/`DARK` força). Padrão sem tema salvo = visual dark atual (`PAGE_THEME_DEFAULTS` em `src/shared/pageThemeDefaults.ts`, espelho do backend via `npm run theme:mirror`).
- Contraste WCAG AA (texto/fundo + muted/fundo + acento/superfície + botão/acento) é **bloqueante** no botão Salvar — em QUALQUER variante, materializada ou gerada — e no back (`pageThemeContrast.ts`); cores são editadas na variante ativa da prévia (toggle Claro|Escuro, travado quando o Modo força a variante); sem token de owner, o painel mostra estado somente-leitura.
- Capa: aceita QUALQUER medida/proporção — validação instantânea no front só de tipo (JPEG/PNG/WebP; GIF/SVG rejeitados); medida fora do ideal vira aviso suave não-bloqueante. Recorte 16:9 + ponto focal (`coverFocalX/Y`, editor arrastável com setas do teclado) aplicados na entrega pelo helper único `src/shared/coverImage.ts` (`c_fill,ar_16:9,g_auto|g_xy_center,f_auto,q_auto`, srcset sem ampliar além do `coverWidth/Height` do back; OG `w_1200,h_630,f_jpg`); overlay 0–80; envio direto assinado ao Cloudinary com progresso/cancelamento (multipart via backend mantido como fallback).
- Anti-FOUC: `PublicHome` aplica o tema o quanto antes carregado (`usePageTheme` com cache por módulo; `clearPageThemeCache()` para testes).

## Compartilhamento público (`/s/salon/:id`)

- O link que o dono compartilha é `${VITE_PUBLIC_SITE_URL}/s/salon/:id` (`buildProfileShareUrl` em `src/features/shop/PostDetail.tsx`). A rota `/queue/:id?tab=profile` continua sendo o destino **interno** do app (é para lá que a página de compartilhamento redireciona), não o link compartilhado.
- O backend serve `GET /s/salon/:id` **fora do prefixo `/api`**: HTML com `<title>`, canonical e `og:url` lidos da env `PUBLIC_APP_URL` (que deve valer **a mesma origem** de `VITE_PUBLIC_SITE_URL`), tags Open Graph/Twitter e um `meta refresh` + link de fallback. O corpo é mínimo e acessível (`<main>`, `<h1>` "Abrindo o perfil...", link visível, fundo escuro `#0b1220`) — por isso também nenhum `<script>` inline: a CSP de produção do back não tem `unsafe-inline`. Salão inexistente ou inativo → 404 HTML com `noindex`; respostas 200/404 saem com `Cache-Control: public, max-age=300` (404: 60 s), `ETag` e `304` para `If-None-Match`, e `HEAD` devolve os mesmos cabeçalhos sem corpo.
- `og:image`: com capa usa o recorte Cloudinary 1200×630 JPEG (`f_jpg,q_auto` + focal, largura limitada ao original — mesmo espelho do `buildCoverOgUrl` do front); sem capa aponta para `<PUBLIC_API_URL>/api/barbershops/:id/page-theme/og-image`. A base vem da env do back `PUBLIC_API_URL` (sem ela, **só fora de produção** a origem da requisição é usada; em produção cai para `PUBLIC_APP_URL` e, sem nenhuma, o `og:image` é omitido — a API avisa no boot).
- **Rewrite obrigatório no host do frontend** — sem ele o catch-all da SPA engole `/s/salon/:id` e o crawler lê o `index.html` sem meta tags. Regras acima do catch-all, **mantidas comentadas até a URL pública do backend ser confirmada**:
  - Render (`render.yaml`): `- type: rewrite` com `source: /s/*` e `destination: https://<backend>/s/*`.
  - Netlify/Cloudflare (`public/_redirects`): `/s/*  https://<backend>/s/*  200`.
- CORS fica restrito ao escopo `/api` (`corsOptions.ts`, registrado em `routes/api.ts`): `/s/salon/:id`, `/health` e `/docs` não emitem cabeçalhos CORS (`app.security.spec.ts` no back cobre os dois lados).

### Ativação em staging (obrigatória antes de produção)

Não descomentar a regra sem confirmar a URL pública do backend **e** rodar estes testes no staging (todos contra o host do front, não do back):

1. `curl -s https://<front>/s/salon/<id> | head -30` → precisa conter `<title>`, `og:url` e `<meta http-equiv="refresh"`. Se vier o `index.html` da SPA (`<div id="root">`), a regra não está ativa ou está **depois** do catch-all.
2. `curl -sI https://<front>/s/salon/<id>` → `content-type: text/html` + cabeçalhos do back (`etag`, `cache-control: public, max-age=300`); em `id` inexistente → `404` com HTML (não 200 da SPA).
3. `curl -s https://<front>/s/salon/<id> | grep -o 'property="og:image" content="[^"]*"'` e depois `curl -sI <valor>` → `200` (isso valida também a origem de `/api`/`PUBLIC_API_URL`; sem capa, a URL do back precisa ser alcançável de fora).
4. Ferramenta de preview (Facebook Sharing Debugger / opengraph.xyz) na URL do staging → título + imagem aparecem.
5. Só então publicar a URL real em `render.yaml`/`_redirects` e repetir os 4 testes em produção.

## Pendências documentais

Divergências código ↔ regra de produto aprovada devem ser listadas como pendência **sem** alterar comportamento nesta entrega só documental.
