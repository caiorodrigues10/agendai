# Arquitetura do frontend

O frontend é organizado por feature. Páginas montam rotas e layouts; fluxos operacionais vivem em `src/features/<feature>`.

## Estrutura

```text
features/<feature>/
  components/   # apresentação e composição específica do domínio
  hooks/        # API, loading, erro, filtros, paginação e mutações
  context/      # somente estado compartilhado pela feature
  utils/        # funções puras específicas do domínio
  constants.ts  # labels, opções, mapas de status e estilos
  types.ts      # contratos locais
  index.ts      # entrada pública da feature
```

## Regras

- Componentes `ui` não importam `infra` nem regras de negócio.
- Toda chamada HTTP usa `src/infra/*Api.ts`; hooks orquestram essas chamadas.
- Context não substitui estado local: use-o apenas quando componentes irmãos ou profundos precisam do mesmo estado.
- Funções puras, formatadores, labels e regras reutilizadas não ficam dentro de JSX.
- Use `src/utils/formatters.ts`, `src/utils/query.ts`, `src/utils/dateRanges.ts` e `src/utils/statusLabels.ts` antes de criar novas versões locais.
- Arquivos React acima de 400 linhas devem ser quebrados; exceções de marketing exigem justificativa documentada.
- Fluxos de API, formulário, paginação e erro devem ficar em hooks testáveis.
- Uma refatoração não pode alterar payloads, nomes de filtros, contratos de API ou estados de negócio.

## Auditoria

Execute `npm run audit:frontend-structure` antes de abrir um PR. O relatório aponta arquivos grandes, estado excessivo, chamadas `fetch` fora da camada HTTP e formatadores recriados em telas.
