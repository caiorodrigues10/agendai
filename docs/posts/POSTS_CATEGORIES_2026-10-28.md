# Posts por segmento — revisão de 28/10/2026

## Diagnóstico e alterações

A etapa inicial de escolha de objetivo foi preservada. O editor já tinha melhorias locais de mídia, publicação e recuperação de erros, documentadas em `POSTS_AUDIT_2026-10-28.md`. Esta revisão completa a ligação com o perfil do estabelecimento.

- **Contexto ausente na IA:** o prompt tratava todo negócio como “barbearia/salão”. Agora a API consulta `businessSegment` e `targetAudience` do estabelecimento autorizado e os inclui no prompt. O fallback local também usa o segmento e o destino do botão, sem inventar desconto, escassez ou depoimento.
- **Fotos inadequadas:** modelos legados com foto ilustrativa agora seguem o segmento cadastrado. Segmentos sem coleção correspondente usam o layout sem foto de beleza. Foto própria continua tendo prioridade; falhas em fotos próprias não são substituídas silenciosamente por stock.
- **Catálogo sem orientação por negócio:** `GET /api/posts/templates?barbershopId=…` adiciona recomendações e contexto, com validação de UUID e isolamento de estabelecimento. O catálogo sem parâmetro continua compatível com consumidores antigos.
- **30 opções novas:** dez variantes para barbearias, dez para salões e dez para beleza/estética, totalizando 56 modelos. São composições parametrizadas que reutilizam as três fotografias ilustrativas locais existentes; não são 30 fotografias diferentes. Cada opção inclui título de exemplo, substituição por foto própria e suporte a quadrado, retrato e Story.
- **Leitura na imagem:** as novas coleções separam fotografia e texto com superfície opaca. Reservam espaço para identidade, título, horários e botão, inclusive com logo e Story. As paletas têm teste de contraste mínimo de 4,5:1 para texto principal e secundário dessas superfícies.
- **Editor:** filtro “Para meu negócio”, comparação por segmento e filtros existentes por objetivo/foto. O título de exemplo só preenche um título vazio, preservando texto digitado. Avisos explicam quando título ou botão excedem o que o renderizador mostra; a legenda continua separada da arte.

## Verificação

- TypeScript dos dois projetos aprovado; build frontend aprovado.
- Catálogo completo renderizado: 56 modelos × 3 formatos = 168 PNGs em `C:/Users/caioh/AppData/Local/Temp/agendai-post-categories-20261028/`. Inspeção visual de amostras claras e escuras, quadradas e Story; geração de todas as variantes e testes de geometria complementam a inspeção. Reproduzir com `npx tsx scripts/preview-post-editorial.ts <diretório-absoluto>` no backend.
- Testes de segmento, público no prompt, fallback local, dez artes por coleção, limites do texto, contraste e isolamento entre estabelecimentos.
- Testes do editor e API cobrem catálogo, erros, prévia, sugestões, mídia e persistência. Testes Chromium desktop/mobile usam o editor real com API simulada e PNGs do renderizador real.
- Frontend: 39 testes direcionados aprovados. Navegador: 18 cenários únicos aprovados entre a rodada inicial e as repetições dos casos investigados. Build aprovado; ESLint direcionado sem erros e com oito avisos de complexidade/tamanho/tipagem legados.
- Backend: módulo inteiro de posts aprovado, com 262 testes em oito arquivos; TypeScript e documentação dos dois projetos aprovados.
- A primeira rodada do navegador teve timeouts esperando `load` no HTML do harness. A navegação passou a esperar `domcontentloaded` e a disponibilidade dos controles. Uma asserção nova também foi corrigida para selecionar o modelo pelo nome, pois o catálogo agrupa Agenda antes de Editorial.

## Limites

Sem publicação em produção, uso de credenciais de clientes ou chamada paga de IA nesta validação. Integrações de IA foram testadas com respostas simuladas. A publicação precisa incluir frontend e backend. O componente `PostEditor` ainda apresenta avisos de tamanho/complexidade no ESLint; a revisão não afirma ausência de dívida técnica nem validação manual de cada PNG.
