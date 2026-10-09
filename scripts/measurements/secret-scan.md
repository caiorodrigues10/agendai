# S10 — Varredura de segredos no histórico git (relatório — REFETO)

Data: 2026-10-09 · escopo: histórico completo dos dois repositórios locais.

## Método (corrigido)

A varredura anterior usou `git log -S '<padrão>'` **sem `--pickaxe-regex`**, ou
seja, procurou os padrões como texto literal — o resultado "0" daquela rodada
era **inválido** para regex (`AKIA[0-9A-Z]{16}` etc. nunca casaria como
literal). Este relatório substitui integralmente o anterior.

- **Ferramenta:** `gitleaks 8.30.1` instalada via Homebrew.
- **Comando (em cada repo):** `gitleaks detect --redact --no-banner
  --source . --log-opts="--all"` → relatório JSON em `/tmp/gl-{frontend,backend}.json`.
- **Complemento:** `git log --all --diff-filter=AMD --name-only -- .env` para
  histórico de `.env` (frontend já conhecido: `1263b32`→`e95c171`; backend
  mapeado abaixo).
- **Nenhum valor de segredo foi impresso** durante a varredura; abaixo apenas
  regra, arquivo, commit e nome da chave.

## Limitações

- Heurística (`generic-api-key`): pega formatos conhecidos, não prova ausência
  de segredos em formatos desconhecidos (falso-negativo possível).
- Falsos positivos esperados: chaves de teste públicas e constantes de teste.
- Scan só do histórico git (refs com `--all`); arquivos não rastreados do
  working tree local não foram varridos de propósito (não expor `.env` local).
- Commits com o mesmo segredo em diffs posteriores podem não re-reportar
  (gitleaks reporta por diff, não por persistência do arquivo).

## Resultado — 12 findings (3 frontend + 9 backend)

### Frontend — 3 (baixo risco)

| regra | arquivo | commit | chave |
|---|---|---|---|
| generic-api-key | `.github/workflows/ci.yml` | `b71e6f41` | `VITE_RECAPTCHA_SITE_KEY` = chave de **teste pública do Google** (`6LeIxAcT…`, documentada como não-segura) |
| generic-api-key | `src/tests/recaptcha-safari.test.ts` | `d5d89a1d` | `SITE_KEY` (mesma chave pública de teste) |
| generic-api-key | `src/utils/clientIdStorage.test.ts` | `d2d9f939` | `LEGACY_CLIENT_ID_STORAGE_KEY` (constante de teste) |

### Backend — 9

| regra | arquivo | commit | chave |
|---|---|---|---|
| generic-api-key | `.env` | `af94d4d` | `ASAAS_WEBHOOK_TOKEN` |
| generic-api-key | `.env` | `af94d4d` | `ZAPI_INSTANCE_ID` |
| generic-api-key | `.env` | `af94d4d` | `ZAPI_CLIENT_TOKEN` |
| generic-api-key | `.env` | `7a8c4d8` | `EVOLUTION_API_KEY` |
| generic-api-key | `.env` | `90b2a7b` | `ZAPI_INSTANCE_ID` |
| generic-api-key | `.env` | `90b2a7b` | `ZAPI_CLIENT_TOKEN` |
| generic-api-key | `.github/workflows/ci.yml` | `4e775b5` | `JWT_SECRET` (49 chars, **não** é o `.env` local; contém token `test` → placeholder de teste; **ainda no tree atual**) |
| generic-api-key | `src/tests/setup.ts` | `e68c786` | `process.env.JWT_SECRET` (referência a env, falso positivo) |
| generic-api-key | `src/modules/email/…/emailPreferenceService.spec.ts` | `1ee7c50` | `process.env.EMAIL_UNSUBSCRIBE_SECRET` (referência a env, falso positivo) |

## Histórico de `.env` (backend)

Adicionado/modificado em 7 commits (`07dab5c`, `0d2e42e`, `45d5524`,
`90b2a7b`, `7a8c4d8`, `af94d4d`, `e68c786`); **removido do tree em
`e68c786`** (2026-08-25, "LGPD compliance") e não está no tree atual.
Os commits com tokens (`af94d4d`, `7a8c4d8`, `90b2a7b`) são **ancestrais de
`main`** — os valores existem no histórico já publicado.

## Classificação e pendências (decisão do usuário)

1. **ALTO — tokens reais no histórico do backend** (ZAPI/Z-API,
   EVOLUTION_API_KEY, ASAAS_WEBHOOK_TOKEN) em `.env` histórico de `main`:
   recomenda-se **rotacionar** os tokens (fora de escopo — envolve produção)
   e, se desejado, histórico rewrite (`git filter-repo`), que é operação
   destrutiva/fora do escopo local.
2. **MÉDIO — `JWT_SECRET` hardcoded no `ci.yml` atual** (placeholder com
   `test`, não é o segredo local): mover para GitHub Actions secret;
   alterar workflow = pedir confirmação.
3. **BAIXO — chaves de teste públicas** (reCAPTCHA test key, constantes de
   teste): aceitável; documentado.

Nenhum outro segredo forte (AWS/GitHub/OpenAI/Slack/Google/PEM/URLs com
credencial) foi encontrado pelo gitleaks nos dois históricos.
