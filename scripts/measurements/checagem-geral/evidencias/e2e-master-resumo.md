# E2E e2e/master/ (login real)

Total: **18** · esperados: **17** · falhas: **1**

| projeto | arquivo | teste | status |
|---|---|---|---|
| desktop-chromium | master/acesso-negado.spec.ts | usuário OWNER não acessa as rotas do painel master | unexpected |
| desktop-chromium | master/auditoria.spec.ts | auditoria filtra pela URL e exporta o CSV | expected |
| desktop-chromium | master/billing-analises.spec.ts | faturamento: aba análises mostra insights e oferece extrato CSV | expected |
| desktop-chromium | master/contas-acoes.spec.ts | ações de controle: suspende, reativa e entra em visão temporária | expected |
| desktop-chromium | master/contas-acoes.spec.ts | sair pela header durante a visão temporária volta ao painel do master | expected |
| desktop-chromium | master/contas.spec.ts | contas: lista salões, filtra via URL e abre o detalhe | expected |
| desktop-chromium | master/convite-dono.spec.ts | convite do dono: cria salão, reenvia e aceita pelo link público | expected |
| desktop-chromium | master/criacao-chamado-tarefa.spec.ts | cria chamado pelo botão "Novo chamado" e mostra o diálogo | expected |
| desktop-chromium | master/criacao-chamado-tarefa.spec.ts | cria tarefa pelo botão "Nova tarefa" com prazo e responsável | expected |
| desktop-chromium | master/criacao-chamado-tarefa.spec.ts | valida campos obrigatórios no diálogo de chamado | expected |
| desktop-chromium | master/duas-abas.spec.ts | duas abas recarregando ao mesmo tempo: nenhuma é deslogada | expected |
| desktop-chromium | master/engagement.spec.ts | engajamento: funil, adoção, NPS, suporte e risco de churn | expected |
| desktop-chromium | master/operacao.spec.ts | operação mostra saúde de serviços e notificações | expected |
| desktop-chromium | master/overflow.spec.ts | audit e operations não estouram a rolagem horizontal em 390px | expected |
| desktop-chromium | master/overview.spec.ts | visão geral carrega dados reais e responde à troca de período | expected |
| desktop-chromium | master/sessoes.spec.ts | admin encerra a sessão de outro dispositivo e o acesso cai na hora | expected |
| desktop-chromium | master/token-storage.spec.ts | access token só em memória: nenhum token no storage e sessão sobrevive ao reload | expected |
| desktop-chromium | master/usuarios.spec.ts | usuários: lista, valida criação e cria + exclui um usuário | expected |
