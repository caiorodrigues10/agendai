# Contrato API e smoke de entrega

## Verificação offline

Na raiz do frontend, com dependências instaladas e o backend irmão disponível:

```powershell
npm run verify:delivery
```

O harness acima encadeia `docs:check`, `typecheck`, `test:contract`, `contract:check` e Vitest (sem produção). Equivalente passo a passo:

```powershell
npm run contract:check
npm run test:contract
npm run typecheck
npm test
npm run docs:check
npm run build
```

`scripts/api-contract-debt.json` deve permanecer com `entries: []`. O parser ignora `fetch(url)` / `clientFetch(url)` quando `url` é parâmetro de transporte (portal do cliente). O check normal e o `--strict` reprovam qualquer divergência de método/caminho. Não adicionar exceções para fazer a checagem passar. A aprovação do check não certifica payloads, permissões nem o comportamento em produção.

Se o checkout backend estiver em outro local, definir `API_CONTRACT_BACKEND` com seu caminho absoluto. Ausência do backend é erro, não skip. Na raiz do backend: `npm run verify:delivery` (docs, typecheck, test:security, unitários). Esses checks de contrato não carregam `.env`, não inicializam a API e não acessam banco/provedores. Fixtures do parser são sintéticas.

O backend já registra `@fastify/swagger` e Swagger UI em `/docs` (`src/config/swagger.ts`); não havia exportação OpenAPI nem geração de cliente frontend. Os wrappers têm tipos manuais e várias rotas validam com Zod em preHandlers/controllers, sem schema equivalente no Swagger. Gerar um SDK desses schemas hoje não garantiria os payloads. A integração mínima mantém o transporte atual e compara a AST TypeScript dos wrappers com as rotas efetivamente chamadas por `apiRoutes`, usando o prefixo registrado em `app.ts`.

Cobertura: chamadas `apiClient`, `apiFetch` e upload HTTP nos arquivos `src/infra/*Api.ts`; método, caminho e quantidade de segmentos, ignorando nomes de parâmetros e queries. Expande a factory de categorias. Não cobre corpos, respostas, parâmetros de query, permissões, chamadas fora desses wrappers nem o transporte interno de refresh. Não é um cliente gerado nem uma validação completa OpenAPI. Sintaxe dinâmica não suportada falha e exige extensão do parser com teste. Se mudar a arquitetura de registro das rotas, atualizar o extrator; ele foi feito para as funções atuais que recebem `app` diretamente.

## Smoke manual mínimo após deploy

Executar em homologação com salão e usuário OWNER sintéticos, assinatura/painel habilitados e dados de teste (inclusive um atendimento finalizado). Nenhuma credencial real é necessária nos scripts ou no repositório. Use credenciais provisionadas no ambiente de teste. O smoke autenticado exige esse ambiente; mocks do Playwright não comprovam integração com a API implantada.

Registrar versão dos dois deploys, horário, navegador, resultado de cada etapa e correlation ID de falhas; não capturar tokens/cookies/senhas. Repetir a navegação em desktop e mobile.

| Etapa | Ação | Aceite |
|---|---|---|
| Login | Abrir `/login`, tentar senha incorreta e depois entrar com OWNER de teste | Erro legível na tentativa inválida; entrada no painel na válida, sem loop de 401/refresh; recarregar mantém sessão |
| Dashboard | Abrir `/dashboard` e o painel `/app`; mudar período quando disponível | Métricas/agenda carregam sem 404/500, sem `NaN`; estado vazio é legível em salão sem dados |
| Relatórios | Abrir relatórios pelo menu; selecionar período contendo o atendimento sintético e outro vazio | Totais coerentes com a fixture; filtros atualizam; período vazio não quebra; exportação, se oferecida, baixa arquivo utilizável |
| Configurações | Abrir `/app/settings`; editar nome do salão de teste, salvar, recarregar e restaurar o valor | Persistência confirmada; formulário inválido mostra erro e não salva; nenhuma informação de outro salão |
| Clima | Abrir previsão/insights do salão com localização válida; simular indisponibilidade de rede no navegador e reabrir | Dados legíveis quando disponíveis; indisponibilidade exibe estado controlado, sem travar o painel ou inventar previsão |
| Logout | Sair, recarregar e tentar retornar ao painel; tentar renovar a sessão anterior no contexto de teste | Retorno ao login; dados privados não reaparecem; sessão revogada não renova; novo login funciona |

Falha em qualquer etapa bloqueia a aprovação desse fluxo. Restore o nome do salão mesmo se outro teste falhar. Não executar gravações de teste em salão de cliente.

Smoke público automatizado já existente: após `npm run build`, executar `npm run test:e2e` (browsers Playwright instalados). Usa respostas mockadas e não substitui as seis etapas acima. Para testar a UI publicada com esse mesmo smoke público, definir `E2E_BASE_URL`; as chamadas API continuam mockadas. Nenhum pipeline externo foi alterado.
