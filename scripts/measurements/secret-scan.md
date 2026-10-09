# S10 — Varredura de segredos no histórico git (relatório)

Data: 2026-10-08 · escopo: histórico completo dos dois repositórios locais
(frontend 305 commits, backend 266 commits). Ferramentas dedicadas
(gitleaks/trufflehog) não instaladas — varredura manual por padrões via
`git log -S` + inspeção de `.env` históricos. Nenhum valor de segredo foi
impresso durante a varredura.

## Resultado

| padrão | frontend | backend |
|---|---|---|
| `AKIA…` (AWS access key) | 0 | 0 |
| `BEGIN PRIVATE KEY` | 0 | 0 |
| `ghp_…` (GitHub token) | 0 | 0 |
| `sk-…` (OpenAI/uísque) | 0 | 0 |
| `xoxb-` (Slack) | 0 | 0 |
| `AIza…` (Google API key) | 0 | 0 |
| `.env` no tree atual | não | não |

## Achado único

- `1263b32` (frontend) adicionou `.env` com **apenas**
  `VITE_MERCADOPAGO_PUBLIC_KEY` (valor de 14 chars — chave **pública** do
  Mercado Pago, por definição embutida no bundle via `VITE_`).
- Removido em `e95c171`; o arquivo **não está no tree atual** e `.env` está
  no `.gitignore` dos dois repos.
- Risco residual: baixo (chave pública), mas o commit permanece no histórico
  — sem ação pedido (reescrita de histórico fora de escopo).

## Conclusão

Nenhum segredo sensível (credenciais, private keys, tokens de serviço)
identificado no histórico dos dois repositórios.
