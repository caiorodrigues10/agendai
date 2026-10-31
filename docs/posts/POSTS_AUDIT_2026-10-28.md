# Auditoria da área de posts — 28/10/2026

Escopo: página `/app/posts`, modal de criação/edição, catálogo de modelos, prévia, geração por IA, mídia, rascunho, agendamento e publicação. Frontend Vite em `agendai/` e backend Fastify em `agendai-back-end/`. A produção consultada foi `https://agendai-pcts.onrender.com/app/posts`.

## Problemas encontrados e correções locais

| Área | Problema | Correção |
|---|---|---|
| Catálogo | Modelos expostos como uma lista de nomes, sem comparação visual nem recuperação de erro. | Seletor por categoria, filtros de foto, miniaturas geradas pelo endpoint autenticado e estados de carregamento, erro e nova tentativa. |
| Prévia | Requisição podia ficar pendente; respostas antigas podiam substituir alterações recentes; erro de imagem não explicava a falha. | Limite de 30 s, cancelamento e sequência das requisições, erro dentro do modal e ação de tentar novamente. |
| Artes promocionais | Fundos raster com cartões e faixas vazios recebiam textos SVG em coordenadas diferentes, causando áreas sem conteúdo e sobreposição. | Fotografias editoriais limpas, composição SVG com limites de texto e ordem correta para identidade, informação e CTA. |
| Sugestões por IA | Dependência externa ou cache lento podia deixar a ação sem resposta clara. | Limites de tempo para provedores e cache, mantendo as mensagens de erro e a recuperação no editor. |
| Mídia | Upload aceitava arquivo de imagem inválido; erro de upload ficava atrás do seletor; não havia remoção clara da foto selecionada. | Validação da imagem real, tratamento de tamanho e falhas, erro dentro do seletor e ação de remover foto principal/secundária. |
| Rascunho, cópia e edição | Retentativa podia criar rascunho duplicado; cópia podia reaproveitar estado local de outro post; edição publicada usava fluxo de publicação. | Identidade persistida do rascunho, armazenamento separado por post/cópia e ação exclusiva de salvar alterações no publicado. |
| Agendamento e exclusão | Mudanças concorrentes de status podiam gerar transições ou exclusões indevidas. | Atualizações e exclusão condicionadas ao status esperado; conflito retorna 409. Salvar agendado como rascunho cancela o agendamento. |
| Lista e WhatsApp | Respostas antigas podiam atualizar a aba errada; falhas de metadados e público do WhatsApp ficavam sem saída clara. | Controle de sequência, recarga da aba atual, erros independentes com nova tentativa e ajuste da última página após exclusão. |

## Verificação

- Backend: 231 testes direcionados à área de posts e workers/cron passaram; `npm run typecheck` passou.
- Frontend: 54 testes direcionados passaram; ESLint direcionado terminou com 0 erros e avisos de complexidade/estilo.
- Os builds de produção do frontend (`vite build`) e backend (`tsup`) passaram.
- Navegador local: 16 cenários Playwright passaram em Chromium desktop e mobile, com serviços simulados e PNGs produzidos pelo renderizador real. Cobrem catálogo, prévia, erro e retentativa, IA, publicação, edição, agendamento e upload/remoção de foto.
- Renderização: 26 modelos em três formatos (78 PNGs) produzidos para inspeção; geometria dos modelos e variações promocionais coberta por testes de layout.
- Contrato de API e `docs:check` dos dois projetos passaram na rodada anterior da auditoria.

## Limites da verificação

O site publicado ainda entrega um bundle anterior às correções locais. A rota de modelos exige autenticação e retornou 401 em consulta sem sessão, conforme esperado; os fluxos protegidos de produção não foram exercitados com uma conta real. Os testes de navegador usam o frontend local, respostas de API simuladas e imagens geradas pelo backend local. Para que a correção chegue ao endereço publicado, é necessário integrar e publicar ambos os projetos pelos processos de entrega existentes.
