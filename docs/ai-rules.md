## Diretrizes universais para IAs

> **Contexto completo do projeto:** leia [`../../AGENTS.md`](../../AGENTS.md) na raiz do monorepo antes de qualquer tarefa (arquitetura, rotas, bugs conhecidos, o que já existe no backend).


### Convenções de commits
- Padrão: conventional-changelog
- Formato: tipo(escopo): mensagem
- Tipos recomendados: feat, fix, docs, chore, refactor, test, perf

### Fluxo de branches (GitFlow)
- main: releases estáveis
- develop: integração contínua
- feature/*: novas funcionalidades
- bugfix/*: correções não críticas
- hotfix/*: correções urgentes em produção
- release/*: preparação para release

### Qualidade e testes
- Cobertura mínima: 80% em testes unitários
- Priorizar testes de regras de negócio, autenticação e rotas
- Testes devem rodar em CI antes de merge

### Padrão de CSS
- BEM obrigatório em classes customizadas
- Preferir CSS Modules quando possível

### Checklist de PR
- Lint executado
- Testes executados
- Build executado
- Análise de segurança OWASP ZAP

### Diretrizes de arquitetura
- Separar UI, domain e infra
- Contexts com responsabilidade única
- Evitar dependências globais e acoplamento entre features
