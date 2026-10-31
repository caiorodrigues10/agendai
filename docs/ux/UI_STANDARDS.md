# Padrões de interface do usuário

Revisão: 28/10/2026. Escopo: frontend Vite, painel do salão e experiência do cliente.

## Hierarquia e composição

- Usar `PageHeader` com título, descrição útil e uma ação principal. Evitar repetir o mesmo título com um ícone dentro de cada card.
- Usar `FilterToolbar` para filtros relacionados; cada campo precisa de um rótulo. Busca sem resultado deve permitir limpar os filtros.
- Usar `Tabs` para alternar conteúdos na mesma área. Setas, Home e End movem o foco; a aba ativa identifica seu painel. Não adicionar `role="tab"` a links que navegam para outra página.
- Manter o conteúdo em `min-w-0`, permitir quebra dos títulos e empilhar ações no celular. Preferir alinhamento à esquerda para listas, dados e formulários; centralização para mensagens curtas de estado.
- Preservar os nomes e a ordem do registro `TAB_GROUPS`. No celular, até quatro destinos operacionais e o botão Mais; as demais áreas ficam agrupadas na folha Mais opções.

## Ícones, cores e tipografia

- Lucide é a família dos controles de interface. Ícones escolhidos pelo salão no catálogo continuam sendo conteúdo configurável.
- Ícone decorativo usa `aria-hidden`. Botão com apenas ícone precisa de nome acessível específico, por exemplo “Cancelar agendamento”.
- Evitar ícone no título, no card e na ação quando os três repetem a mesma informação.
- Usar tokens semânticos de `styles/tokens.css`. Cor de texto de uma ação preenchida deve combinar com seu token de foreground.
- Tema claro usa contraste mais forte nos textos secundários, ações e indicadores. Status precisa de texto além da cor.
- Páginas institucionais e planos seguem a apresentação escura de marketing; o painel e os componentes de operação respeitam os dois temas.
- Textos auxiliares novos têm pelo menos 12px; controles de formulário em telas pequenas usam 16px para evitar zoom involuntário.

## Interações e diálogos

- Alvo principal de toque: pelo menos 44px. Foco de teclado visível e sem ficar escondido atrás de elementos fixos.
- Usar `ModalShell` para diálogo ou folha. `ConfirmDialog` serve para uma decisão curta, especialmente destrutiva.
- O diálogo ativo trata Escape; fechar um diálogo aninhado não pode desbloquear a rolagem da página que ainda está coberta.
- Durante salvamento: bloquear envio duplicado, fechar e cancelar; manter o rótulo da ação e indicar andamento.
- Aguardar a promessa da operação antes de fechar. Em falha, preservar valores preenchidos e contexto para nova tentativa.
- Diferenciar carregando, vazio, nenhum resultado de busca e falha de carregamento. Uma falha não pode virar uma falsa lista vazia.
- Não repetir mensagens genéricas de erro quando há uma orientação concreta de recuperação.

## Formulários e acesso

- Formulários novos do painel: React Hook Form + Zod, `Field` e `SmartSelect`, conforme `AGENTS.md`.
- `Field` associa hint/erro ao input nativo com `aria-describedby` e sinaliza validade. Componentes compostos precisam receber suas próprias props de acessibilidade.
- Enter envia os formulários de autenticação do cliente. Identificar nome, telefone e código com rótulos e autocomplete apropriados.
- A visibilidade do menu e a proteção da URL devem respeitar papel, permissão e plano. A API continua sendo a autoridade.
- Mensagens de recurso indisponível no plano e falta de permissão devem explicar causas diferentes.

## Verificação e manutenção

1. Atualizar o inventário estático: `node scripts/inventory-user-ux.mjs`.
2. Executar testes das interações alteradas e `npm run typecheck`.
3. Conferir Storybook em 375, 768, 1024 e 1440px, com os temas aplicáveis.
4. Rodar `node scripts/check-user-ux.mjs http://127.0.0.1:6014 <diretório-de-evidências>`; quarto argumento opcional filtra por trecho do ID da story.
5. Rodar Playwright para navegação real da SPA e fluxos afetados. Fixtures de erro verificam recuperação; não comprovam sucesso de operações no backend.
6. Registrar cobertura e limites em `USER_EXPERIENCE_AUDIT.md`. Inventário estático não significa que cada controle foi acionado no navegador.
