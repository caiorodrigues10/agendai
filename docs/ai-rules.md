## Diretrizes para IAs — Frontend

> **Manual canônico:** [`../AGENTS.md`](../AGENTS.md) e inventários em [`agents/`](./agents/).
> Este arquivo legado **não** substitui o AGENTS.md. Em conflito, prevalece o AGENTS.md.

### Convenções de commits
- Preferir conventional commits: `tipo(escopo): mensagem`
- Tipos comuns: feat, fix, docs, chore, refactor, test, perf

### Qualidade
- Rodar `typecheck`, testes e `lint` conforme o risco da mudança
- Não há meta universal obrigatória de 80% de cobertura neste projeto
- CSS do painel: **Tailwind v4 + tokens semânticos** (`bg-bg`, `text-text-primary`, …). Landing pode usar estilo marketing próprio. Não exigir BEM/CSS Modules.

### Arquitetura
- Separar UI, domain e infra (`*Api.ts`)
- Contexts com responsabilidade única
- Reutilizar `Field`, `SmartSelect` e demais componentes em `components/ui`

### Checklist de PR (orientação)
- `npm run docs:check` se mudou pacotes/scripts/estrutura documentada
- Testes relevantes executados
- Build/typecheck conforme CI
