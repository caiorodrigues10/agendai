# Revisão de UX do salão e do cliente

Revisão: 28/10/2026. Skills utilizadas: `ui-ux-pro-max` e `onboarding`.

## Resultado implementado

A interface passa a compartilhar cabeçalhos, filtros, abas e diálogos. A navegação usa uma família de ícones, rótulos mais legíveis e menos elementos decorativos repetidos. As abas podem quebrar linha no celular, têm foco de teclado e associação com seus painéis. O tema claro recebeu ajustes de contraste nos tokens de texto, ação e status.

Os formulários de serviço e as ações da agenda aguardam a resposta antes de fechar; preservam dados e contexto em caso de erro. A área do cliente distingue falha de carregamento, lista vazia e ausência de vínculos, permite tentar novamente e confirma a remoção de um salão. O login por código aceita envio por Enter e identifica os campos para tecnologias assistivas.

Em Link Público, os cards contêm endereços longos e empilham ações no celular. A largura excessiva anterior fazia o conteúdo atrapalhar o clique no menu inferior.

O menu e a guarda de rota consideram assinatura e permissões. Financeiro e rentabilidade respeitam as capacidades do funcionário; configurações de rentabilidade e os painéis financeiros exclusivos do proprietário não aparecem para quem só pode consultar. Estoque de equipamentos é exclusivo do proprietário/master conforme as rotas do backend; permissão de estoque de produtos não dá acesso a equipamentos.

## Mapa das áreas

Os 21 destinos de `TAB_GROUPS` foram mantidos. Esta tabela descreve o alcance da mudança e suas evidências; a prévia isolada de navegação não equivale a testar o conteúdo de uma rota.

| Menu                 | Revisão aplicada                                                        | Evidência de conteúdo                                                                       |
| -------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Hoje                 | Layout, navegação e acesso compartilhados                               | Inventário estático; componentes de fila/onboarding no Storybook                            |
| Configuração inicial | Progresso acessível e rótulos menos decorativos                         | Storybook OnboardingChecklist                                                               |
| Fila                 | Navegação, controles e formulários compartilhados                       | Stories de inclusão, cards, limite, retorno e salão fechado                                 |
| Agenda               | Diálogos unificados, operações assíncronas, nomes nos controles de data | Storybook calendário/booking; teste de falha, repetição e sucesso                           |
| Clientes             | Abas, pesquisa rotulada, vazio de busca e perfil                        | Storybook ClientProfileSheet/CRM; inventário de lista e organização                         |
| Produtos             | Cabeçalho, abas, filtros e formulário em folha                          | Testes de guarda/permissões; inventário de catálogo, reservas, estoque, vendas e relatórios |
| Serviços             | Cabeçalho, ações identificadas e formulário que preserva dados          | Storybook ServiceForm/CategoryManager; testes de salvamento                                 |
| Equipe               | Cabeçalho e ícones consistentes                                         | Storybook TeamManager                                                                       |
| Relatórios           | Acesso por permissão e contraste compartilhado                          | Storybook FinancialDashboard/RecommendationsPanel                                           |
| Financeiro           | Abas consistentes e painéis condicionados ao papel                      | Stories financeiro, caixa, sinal, lista de espera, recorrência, fidelidade e metas          |
| Rentabilidade        | Abas e modo de consulta para funcionário                                | Storybook ProfitEnginePanel; teste do registro de acesso                                    |
| Estoque              | Abas e três formulários em ModalShell                                   | Storybook EquipmentPanel; teste de acesso por papel                                         |
| Posts                | Cabeçalho, abas e confirmação em diálogo                                | Testes PostsManager/PostEditor; Storybook editor                                            |
| Showcase             | Cabeçalho e ação que informa cadastro aberto/fechado                    | Inventário estático                                                                         |
| Link Público         | Navegação e foco compartilhados                                         | Inventário estático                                                                         |
| Indicações           | Contraste e navegação compartilhados                                    | Storybook OwnerReferralsPanel                                                               |
| Multiunidades        | Acesso por plano e navegação compartilhados                             | Stories OrganizationsPanel/MultiUnitDashboard                                               |
| Configurações        | Sete seções com abas, rótulos dos horários e upload acessível           | Inventário estático das seções e componentes                                                |
| Ajuda                | Navegação e contraste compartilhados                                    | Stories do formulário e detalhe de suporte; inventário do painel                            |
| Plano                | Navegação, botões e contraste                                           | Stories OwnerSubscriptionPanel/CheckoutPage/PlansPage                                       |
| Perfil               | Navegação e experiência pública compartilhada                           | Playwright do perfil social, avaliações, vídeos e stories                                   |

## Evidências e limites

- Inventário por AST em `interaction-inventory.json`, gerado por `scripts/inventory-user-ux.mjs`: 932 controles em 149 arquivos. Inclui arquivo, linha, tipo do controle, rótulo e handler quando identificáveis. Componentes dinâmicos, conteúdo de bibliotecas e combinações de permissões exigem revisão adicional.
- A varredura de Storybook usa dados sintéticos e bloqueia APIs sem fixture. Verifica overflow em quatro larguras, acessibilidade automatizada e abertura de abas seguras. Screenshots existem para 375px/claro e 1440px/escuro.
- A rodada concluída examinou 52 componentes em dois temas: 104 combinações e 416 verificações de largura, com rolagem para revelar seções animadas. Após as correções, zero overflow de documento e zero violações graves/críticas de acessibilidade automatizada nos casos verificados. O carregamento inicial de uma story expirou durante um reload do Vite; a rechecagem isolada passou. Os resultados brutos foram preservados e consolidados em `visual-verified.json` e `verification-summary.json`.
- Playwright percorreu os 21 menus reais da SPA em desktop e celular, incluindo a folha Mais opções e o retorno do navegador, com APIs indisponíveis simuladas. Os fluxos públicos de cadastro/agendamento passaram nos dois tamanhos; os dez casos do perfil social também passaram na rodada de regressão. Curl retornou HTTP 200 para os 21 caminhos do painel local: isso verifica a entrega da SPA, não os endpoints de negócio.
- Testes unitários/integrados: 98 arquivos e 509 testes passaram na suíte completa. Regressões específicas da agenda e posts: 11 testes passaram.
- Typecheck, build, docs:check e contract:check passaram. Contrato verificado contra `agendai-back-end`: 436 chamadas de wrappers e 604 rotas. Lint: zero erros e 475 avisos no conjunto existente do projeto. A checagem dos últimos cinco arquivos alterados também terminou sem erros. Graphify foi atualizado pelo agente principal.
- Evidências brutas locais em `../qa-user-ux-2026-10-27/`, fora do repositório: logs, resultados JSON e screenshots. A data no nome da pasta marca o início da revisão.

Não foi executado cada controle inventariado, cada combinação de formulário nem cada operação no backend real. Pagamentos, disparos de WhatsApp/e-mail e exclusões reais foram substituídos por fixtures. Os testes de navegação com APIs indisponíveis verificam a continuidade da interface, não a correção financeira ou operacional dessas APIs. O desenho do master-admin, páginas institucionais e o projeto Next.js não integram esta revisão.

## Reprodução

```powershell
npm run typecheck
npm test -- --project app --pool=forks --maxWorkers=1
npm run lint
npm run docs:check
$env:API_CONTRACT_BACKEND = 'D:\Programação\agendai\agendai-back-end'
npm run contract:check
npm run build
node scripts/inventory-user-ux.mjs
```

Em outro terminal, iniciar Storybook em 6014 e executar a varredura com diretório de saída fora do repo. Para Playwright, iniciar o preview do build e informar `E2E_BASE_URL`; os specs `mvp-public`, `post-social` e `user-ux-navigation` utilizam fixtures locais.
