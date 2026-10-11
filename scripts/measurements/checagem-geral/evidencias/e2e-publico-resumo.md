# E2E publico (suíte completa)

Total: **73** · esperados: **56** · pulados: **17** · falhas: **0**

| projeto | arquivo | teste | status |
|---|---|---|---|
| desktop-chromium | login-safari.spec.ts | sem requestIdleCallback: login com reCAPTCHA envia o token no corpo e navega | skipped |
| desktop-chromium | login-safari.spec.ts | api.js bloqueado: erro claro, sem envio, e o retry reinjeta o script | skipped |
| desktop-chromium | login-safari.spec.ts | GIS bloqueado: erro no 1º clique e o clique seguinte carrega o script e executa o prompt | skipped |
| mobile-chromium | login-safari.spec.ts | sem requestIdleCallback: login com reCAPTCHA envia o token no corpo e navega | skipped |
| mobile-chromium | login-safari.spec.ts | api.js bloqueado: erro claro, sem envio, e o retry reinjeta o script | skipped |
| mobile-chromium | login-safari.spec.ts | GIS bloqueado: erro no 1º clique e o clique seguinte carrega o script e executa o prompt | skipped |
| webkit-iphone | login-safari.spec.ts | sem requestIdleCallback: login com reCAPTCHA envia o token no corpo e navega | skipped |
| webkit-iphone | login-safari.spec.ts | api.js bloqueado: erro claro, sem envio, e o retry reinjeta o script | skipped |
| webkit-iphone | login-safari.spec.ts | GIS bloqueado: erro no 1º clique e o clique seguinte carrega o script e executa o prompt | skipped |
| desktop-chromium | mvp-public.spec.ts | cadastro autônomo apresenta trial e campos essenciais | expected |
| desktop-chromium | mvp-public.spec.ts | páginas públicas críticas não têm overflow horizontal | expected |
| desktop-chromium | mvp-public.spec.ts | agendamento público abre sem autenticação | expected |
| mobile-chromium | mvp-public.spec.ts | cadastro autônomo apresenta trial e campos essenciais | expected |
| mobile-chromium | mvp-public.spec.ts | páginas públicas críticas não têm overflow horizontal | expected |
| mobile-chromium | mvp-public.spec.ts | agendamento público abre sem autenticação | expected |
| desktop-chromium | panel-queue.spec.ts | fluxo completo sem conclusão duplicada | skipped |
| desktop-chromium | panel-queue.spec.ts | URL direta de aba proibida para EMPLOYEE mostra Acesso negado | skipped |
| mobile-chromium | panel-queue.spec.ts | fluxo completo sem conclusão duplicada | skipped |
| mobile-chromium | panel-queue.spec.ts | URL direta de aba proibida para EMPLOYEE mostra Acesso negado | skipped |
| desktop-chromium | post-editor.spec.ts | catálogo real oferece foto opcional e a prévia Story tem dimensões corretas | skipped |
| desktop-chromium | post-editor.spec.ts | agendamento funciona no celular e o modal prende/restaura o foco e rolagem | skipped |
| mobile-chromium | post-editor.spec.ts | catálogo real oferece foto opcional e a prévia Story tem dimensões corretas | skipped |
| mobile-chromium | post-editor.spec.ts | agendamento funciona no celular e o modal prende/restaura o foco e rolagem | skipped |
| desktop-chromium | post-social.spec.ts | link direto permite comentar via OTP sem conta de salão | expected |
| desktop-chromium | post-social.spec.ts | compartilhamento copia um link permanente para o post | expected |
| desktop-chromium | post-social.spec.ts | publicação com vídeo usa player mesmo quando existe uma capa | expected |
| desktop-chromium | post-social.spec.ts | perfil mostra grade, abas sociais, stories e avaliações verificadas | expected |
| desktop-chromium | post-social.spec.ts | perfil sem avaliações não mostra nota zero | expected |
| mobile-chromium | post-social.spec.ts | link direto permite comentar via OTP sem conta de salão | expected |
| mobile-chromium | post-social.spec.ts | compartilhamento copia um link permanente para o post | expected |
| mobile-chromium | post-social.spec.ts | publicação com vídeo usa player mesmo quando existe uma capa | expected |
| mobile-chromium | post-social.spec.ts | perfil mostra grade, abas sociais, stories e avaliações verificadas | expected |
| mobile-chromium | post-social.spec.ts | perfil sem avaliações não mostra nota zero | expected |
| desktop-chromium | pwa-offline.spec.ts | gate — precache do dist/sw.js fica em 3.185.427 B ou menos | expected |
| desktop-chromium | pwa-offline.spec.ts | todas as rotas públicas abrem offline e a API falha sem quebrar | expected |
| desktop-chromium | pwa-offline.spec.ts | chunk fora do precache vira acesso offline via cache de runtime | expected |
| mobile-chromium | pwa-offline.spec.ts | gate — precache do dist/sw.js fica em 3.185.427 B ou menos | expected |
| mobile-chromium | pwa-offline.spec.ts | todas as rotas públicas abrem offline e a API falha sem quebrar | expected |
| mobile-chromium | pwa-offline.spec.ts | chunk fora do precache vira acesso offline via cache de runtime | expected |
| desktop-chromium | queue-content-mark.spec.ts | fila pública ?tab=appointments emite mark de conteúdo útil e não tem "Carregando..." visível | expected |
| mobile-chromium | queue-content-mark.spec.ts | fila pública ?tab=appointments emite mark de conteúdo útil e não tem "Carregando..." visível | expected |
| desktop-chromium | responsive/public-layout.spec.ts | R1 — nenhum alvo clicável mede menos que 44×44 px em mobile | expected |
| desktop-chromium | responsive/public-layout.spec.ts | R1 — nenhuma rota falha na coleta | expected |
| desktop-chromium | responsive/public-layout.spec.ts | R2 — nenhum texto de conteúdo mede menos que 12px em mobile | expected |
| desktop-chromium | responsive/public-layout.spec.ts | R5 — toda rota pública tem exatamente um <h1> no DOM | expected |
| desktop-chromium | responsive/public-layout.spec.ts | R6 — toda <img> visível das rotas públicas declara width e height | expected |
| desktop-chromium | responsive/public-layout.spec.ts | R7 — nenhum chunk JS de dist ultrapassa 500KB | expected |
| desktop-chromium | responsive/public-layout.spec.ts | R8 — DM Sans e Syne vêm do próprio domínio (sem Google Fonts) | expected |
| desktop-chromium | responsive/public-layout.spec.ts | R9 — nenhuma rota pública apresenta estouro horizontal | expected |
| desktop-chromium | responsive/public-layout.spec.ts | R3 — CLS de /planos fica em 0,1 ou menos com a API fora | expected |
| desktop-chromium | responsive/public-layout.spec.ts | R3 — CLS de /planos fica em 0,1 ou menos com a API real | expected |
| mobile-chromium | responsive/public-layout.spec.ts | R1 — nenhum alvo clicável mede menos que 44×44 px em mobile | expected |
| mobile-chromium | responsive/public-layout.spec.ts | R1 — nenhuma rota falha na coleta | expected |
| mobile-chromium | responsive/public-layout.spec.ts | R2 — nenhum texto de conteúdo mede menos que 12px em mobile | expected |
| mobile-chromium | responsive/public-layout.spec.ts | R5 — toda rota pública tem exatamente um <h1> no DOM | expected |
| mobile-chromium | responsive/public-layout.spec.ts | R6 — toda <img> visível das rotas públicas declara width e height | expected |
| mobile-chromium | responsive/public-layout.spec.ts | R7 — nenhum chunk JS de dist ultrapassa 500KB | expected |
| mobile-chromium | responsive/public-layout.spec.ts | R8 — DM Sans e Syne vêm do próprio domínio (sem Google Fonts) | expected |
| mobile-chromium | responsive/public-layout.spec.ts | R9 — nenhuma rota pública apresenta estouro horizontal | expected |
| mobile-chromium | responsive/public-layout.spec.ts | R3 — CLS de /planos fica em 0,1 ou menos com a API fora | expected |
| mobile-chromium | responsive/public-layout.spec.ts | R3 — CLS de /planos fica em 0,1 ou menos com a API real | expected |
| desktop-chromium | responsive/reduced-motion.spec.ts | /funcionalidades: conteúdo com opacity-0 fica visível sem rolar | expected |
| desktop-chromium | responsive/reduced-motion.spec.ts | /ia-preditiva: conteúdo com opacity-0 fica visível sem rolar | expected |
| desktop-chromium | responsive/reduced-motion.spec.ts | /: conteúdo com opacity-0 fica visível sem rolar | expected |
| desktop-chromium | responsive/reduced-motion.spec.ts | /planos: conteúdo com opacity-0 fica visível sem rolar | expected |
| desktop-chromium | responsive/reduced-motion.spec.ts | /: as linhas do H1 animam sem reduce e param com reduce | expected |
| desktop-chromium | responsive/reduced-motion.spec.ts | /planos: o hero anima sem reduce e para com reduce | expected |
| mobile-chromium | responsive/reduced-motion.spec.ts | /funcionalidades: conteúdo com opacity-0 fica visível sem rolar | expected |
| mobile-chromium | responsive/reduced-motion.spec.ts | /ia-preditiva: conteúdo com opacity-0 fica visível sem rolar | expected |
| mobile-chromium | responsive/reduced-motion.spec.ts | /: conteúdo com opacity-0 fica visível sem rolar | expected |
| mobile-chromium | responsive/reduced-motion.spec.ts | /planos: conteúdo com opacity-0 fica visível sem rolar | expected |
| mobile-chromium | responsive/reduced-motion.spec.ts | /: as linhas do H1 animam sem reduce e param com reduce | expected |
| mobile-chromium | responsive/reduced-motion.spec.ts | /planos: o hero anima sem reduce e para com reduce | expected |

## Pulados (motivo)

- `login-safari.spec.ts` (9): exige `VITE_RECAPTCHA_SITE_KEY` no build.
- `panel-queue.spec.ts` (4): exige `PANEL_E2E=1` + credenciais.
- `post-editor.spec.ts` (4): exige `POST_EDITOR_QA=1`.
