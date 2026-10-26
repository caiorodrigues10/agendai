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
- Capa: aceita QUALQUER medida/proporção — validação instantânea no front só de tipo (JPEG/PNG/WebP; GIF/SVG rejeitados); medida fora do ideal vira aviso suave não-bloqueante. Recorte 16:9 + ponto focal (`coverFocalX/Y`, editor arrastável com setas do teclado) aplicados na entrega pelo helper único `src/shared/coverImage.ts` (`c_fill,ar_16:9,g_auto|g_xy_center,f_auto,q_auto`, srcset sem ampliar além do `coverWidth/Height` do back; OG `w_1200,h_630,c_fill,f_jpg,q_auto` também sem ampliar); overlay 0–80; envio direto assinado ao Cloudinary com progresso/cancelamento (multipart via backend mantido como fallback).
- Anti-FOUC: `PublicHome` aplica o tema o quanto antes carregado (`usePageTheme` com cache por módulo; `clearPageThemeCache()` para testes).

## Posts (formato da arte)

- Grade do perfil: célula **4:5** (`aspect-[4/5]` + `bg-surface-2` em `ProfileSections.tsx`), sem cortar arte antiga — `object-cover` **só** no formato 4:5; 1:1 e 9:16 aparecem inteiros (`object-contain`, com as barras da célula nas laterais/base). O detalhe do post mostra a arte inteira (`object-contain` + `max-h-[70vh]` em `PostDetail.tsx`).
- Formato padrão por modelo (`price-split` → 4:5, demais → 1:1) vem do catálogo **`GET /api/posts/templates`** (`defaultFormat`); o fallback local `defaultFormatFor` em `PostEditor.tsx` só vale antes da lista carregar (ou se a chamada falhar) e precisa ser alterado junto com o back no mesmo PR — regra completa em `backend/docs/agents/BUSINESS_RULES.md`.
- Escolha manual no card "Formato" trava o default (`formatTouched`): trocar de modelo não sobrescreve a decisão do usuário.
- OG da capa (`buildCoverOgUrl`): `w_1200,h_630,c_fill` + focal, largura limitada ao original (nunca amplia), **`f_jpg,q_auto`** — PNG a ~900 KB passava do limite de 300 KB aceito para `og:image`; JPEG fica em ~80 KB.

## Pendências documentais

Divergências código ↔ regra de produto aprovada devem ser listadas como pendência **sem** alterar comportamento nesta entrega só documental.
