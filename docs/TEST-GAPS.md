# Lista de pendências E2E

## Specs com `test.fixme`

| Spec | Dependência | Motivo | Critério para reativar |
|---|---|---|---|
| `e2e/post-social.spec.ts` — “link direto permite comentar via OTP sem conta de salão” | Fluxo de comentários/OTP no `PostDetail` | A UI foi removida em `15958b5`; o fluxo social deve ser reintroduzido em workstream próprio | Login por OTP, comentário, exclusão e retorno à rota pública funcionando no browser |
| `e2e/post-social.spec.ts` — “perfil com avaliações exibe depoimentos verificados (aba Avaliações — outro workstream)” | Aba “Avaliações” no perfil público | A aba foi removida em `15958b5`; depende do workstream de avaliações | Depoimentos verificados visíveis e nota exibida somente quando houver avaliações |
| `e2e/post-social.spec.ts` — “perfil sem avaliações não mostra nota zero” | Aba “Avaliações” no perfil público | Depende da mesma entrega da aba “Avaliações” | Estado sem avaliações legível, sem exibir `0.0` |

## Cadastro que exige backend real

| Spec | Gate | Motivo | Critério para executar continuamente |
|---|---|---|---|
| `e2e/register-full.spec.ts` — “cadastra conta nova no /cadastro e entra no painel” | `E2E_BASE_URL` | O wizard precisa de `POST /api/auth/register` real; sem `E2E_BASE_URL`, o preview usa um backend indisponível e o teste é pulado | Backend real em `:3333`, Vite em `:3003` com proxy `/api`, PostgreSQL e Redis efêmeros, migrations aplicadas e `E2E_BASE_URL=http://127.0.0.1:3003` |

## Job de CI proposto para o cadastro

Adicionar um job `register-e2e` ao workflow do frontend, executando em um runner com backend, frontend e banco reais:

```yaml
register-e2e:
  name: Cadastro completo com backend real
  runs-on: ubuntu-latest
  timeout-minutes: 20
  services:
    postgres:
      image: postgres:16-alpine
      env:
        POSTGRES_USER: agendai
        POSTGRES_PASSWORD: agendai123
        POSTGRES_DB: agendai
      ports: ["5432:5432"]
      options: >-
        --health-cmd "pg_isready -U agendai"
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
    redis:
      image: redis:7-alpine
      ports: ["6379:6379"]
      options: >-
        --health-cmd "redis-cli ping"
        --health-interval 10s
        --health-timeout 3s
        --health-retries 5
  env:
    DATABASE_URL: postgresql://agendai:agendai123@localhost:5432/agendai
    DIRECT_URL: postgresql://agendai:agendai123@localhost:5432/agendai
    REDIS_URL: redis://localhost:6379
    NODE_ENV: test
    JWT_SECRET: ci-test-secret-key-that-is-at-least-32-chars-long
    JWT_REFRESH_SECRET: ci-test-refresh-secret-key-that-is-at-least-32-chars
    ASAAS_WEBHOOK_TOKEN: ci-test-webhook-token-that-is-at-least-32-chars
    ALLOW_TEST_REDIS: "1"
    E2E_BASE_URL: http://127.0.0.1:3003
  steps:
    - uses: actions/checkout@v4
      with:
        path: agendai
    - uses: actions/checkout@v4
      with:
        repository: caiorodrigues10/agendai-back-end
        path: backend
    - uses: actions/setup-node@v4
      with:
        node-version: "22"
        cache: npm
        cache-dependency-path: |
          agendai/package-lock.json
          backend/package-lock.json
    - run: npm ci
      working-directory: backend
    - run: npm ci
      working-directory: agendai
    - run: npx prisma generate
      working-directory: backend
    - run: npx prisma migrate deploy
      working-directory: backend
    - run: npx tsx src/shared/infra/http/server.ts > /tmp/agendai-backend.log 2>&1 &
      working-directory: backend
    - run: npm run dev -- --host 127.0.0.1 --port 3003 > /tmp/agendai-frontend.log 2>&1 &
      working-directory: agendai
    - run: |
        for attempt in {1..30}; do
          curl --fail --silent http://127.0.0.1:3333/health && exit 0
          sleep 1
        done
        cat /tmp/agendai-backend.log
        exit 1
    - run: |
        for attempt in {1..30}; do
          curl --fail --silent http://127.0.0.1:3003/cadastro && exit 0
          sleep 1
        done
        cat /tmp/agendai-frontend.log
        exit 1
    - run: npx playwright install --with-deps chromium
      working-directory: agendai
    - run: npx playwright test e2e/register-full.spec.ts --project=desktop-chromium
      working-directory: agendai
```

O job deve usar CPF, e-mail e WhatsApp sintéticos únicos por execução. Não deve apontar para staging ou produção, nem reutilizar cookies ou tokens de ambiente real.
