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

## Publicações do feed (posts)

- `PostsManager` só tem as sub-abas **Publicados** e **Rascunhos** — não existe sub-aba "Agendados", nem ação de agendar/cancelar agendamento na UI.
- Salvar rascunho: `postsApi.create({status:'draft'})` (post novo) ou `postsApi.update` (edição); publicar: `postsApi.publish(id)`. Publicação exige modelo carregado + fotos exigidas pelo template + preço (quando o modelo usa lista de preços).
- Rascunho local (`draftStorage`, `DRAFT_VERSION`) vale só para post **novo** (`storageKey 'new'`) e é limpo ao salvar/publicar.
- Rotas legadas de agendamento continuam existindo no backend por compatibilidade, mas nenhum consumidor no frontend as chama.

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

## Assistente no WhatsApp (dono)

- A seção fica em **Configurações → WhatsApp** (`OwnerBotSection`): gera o código de vínculo, mostra o estado, o que o assistente sabe fazer por segmento e o histórico de ações.
- O código de vínculo é gerado pelo backend (6 caracteres, 10 minutos, uso único) e vale **apenas para o telefone cadastrado no estabelecimento** — a UI avisa quando o número vinculado é diferente do cadastrado.
- O selo **"via WhatsApp"** aparece no agendamento quando `source === 'WHATSAPP_OWNER_BOT'` (`AppointmentCalendar`).
- **Preferências** (`PreferencesPanel`): briefing/resumo com horário (`HH:MM`), alertas proativos por tipo (chips em `OWNER_BOT_ALERT_TYPES`) e tom — salvas via `PUT .../owner-bot/preferences` (upsert parcial, rascunho local em `prefsDraft` até "Salvar preferências").
- **Catálogo** (`CatalogPanel`): `GET .../owner-bot/catalog` devolve só os comandos do `businessSegment` do salão (`buildOwnerBotSegmentCatalog`), agrupados por categoria com a classe de risco.
- **Auditoria** (`ActionLogsPanel`): `GET .../owner-bot/action-logs` com filtros (`limit` ≤ 100, `from`, `to`, `commandId`, `riskClass`, `status`); rótulos via `ownerBotActionLabel`.
- **Bloquear/desbloquear**: ação sensível com modal de confirmação; altera `blocked` nas preferências e o painel passa a exibir o selo bloqueado com botão "Desbloquear".

## Aparência da página pública (tema)

- Tema via CSS vars escopadas no wrapper `[data-ag-shop-theme]`: família canônica `--shop-*` (por variante) + espelho legado `--ag-*`; as utilities do Tailwind resolvem `var(--shop-x, var(--ag-x))` (`styles/tokens.css`). Variantes `light`/`dark` por salão (`darkColors`/`lightColors` no payload; `lightColors` nula é gerada no cliente via `generateVariantColors`, mesmo gerador do back) e `mode` do dono (`AUTO` segue `prefers-color-scheme`; `LIGHT`/`DARK` força). Padrão sem tema salvo = visual dark atual (`PAGE_THEME_DEFAULTS` em `src/shared/pageThemeDefaults.ts`, espelho do backend via `npm run theme:mirror`).
- Contraste WCAG AA (texto/fundo + muted/fundo + acento/superfície + botão/acento) é **bloqueante** no botão Salvar — em QUALQUER variante, materializada ou gerada — e no back (`pageThemeContrast.ts`); cores são editadas na variante ativa da prévia (toggle Claro|Escuro, travado quando o Modo força a variante); sem token de owner, o painel mostra estado somente-leitura.
- Capa: aceita QUALQUER medida/proporção — validação instantânea no front só de tipo (JPEG/PNG/WebP; GIF/SVG rejeitados); medida fora do ideal vira aviso suave não-bloqueante. Recorte 16:9 + ponto focal (`coverFocalX/Y`, editor arrastável com setas do teclado) aplicados na entrega pelo helper único `src/shared/coverImage.ts` (`c_fill,ar_16:9,g_auto|g_xy_center,f_auto,q_auto`, srcset sem ampliar além do `coverWidth/Height` do back; OG `w_1200,h_630,f_jpg`); overlay 0–80; envio direto assinado ao Cloudinary com progresso/cancelamento (multipart via backend mantido como fallback).
- Anti-FOUC: `PublicHome` aplica o tema o quanto antes carregado (`usePageTheme` com cache por módulo; `clearPageThemeCache()` para testes).

## Pendências documentais

Divergências código ↔ regra de produto aprovada devem ser listadas como pendência **sem** alterar comportamento nesta entrega só documental.
