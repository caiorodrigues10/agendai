# Graphify — Frontend

## Procedimento obrigatório

1. Ler `AGENTS.md` local e checar alterações existentes (`git status`).
2. Consultar Graphify para o domínio afetado.
3. Confirmar arquivos/contratos/consumidores no código.
4. Planejar alteração focada.
5. Rodar verificações compatíveis com o risco (`typecheck`, `test`, `lint`, `docs:check`).
6. Atualizar docs/grafo quando aplicável.

## Comandos (PowerShell / bash)

Executar a partir do **diretório onde o grafo está** ou passar `--graph`.

Há grafo em:

- pasta externa do monorepo: `graphify-out/`
- frontend: `agendai/graphify-out/`

```powershell
graphify query "domínio ou funcionalidade" --budget 1500
graphify explain "Símbolo"
graphify path "Origem" "Destino"
graphify affected "Símbolo" --depth 2
graphify update .
```

Com múltiplos grafos:

```powershell
graphify query "ProductsHub" --graph graphify-out/graph.json --budget 1500
```

## Regras

- Arestas **INFERRED** são pistas, não prova.
- Grafo desatualizado → confrontar com o código.
- Se Graphify estiver ausente/inválido: registrar limitação e seguir com busca direcionada (`rg`, leitura de arquivos).
- **Subagentes não atualizam** o mesmo `graph.json` em paralelo; o agente principal coordena `graphify update`.

## Delegação a subagentes

Informar: objetivo/resultado; arquivos permitidos e fora de escopo; contratos a preservar; consulta Graphify obrigatória; testes; formato do relatório.

Mimo/OpenCode: inventários, resumos e revisão documental delimitada. Decisões financeiras, migrations e permissões: revisão do agente principal.
