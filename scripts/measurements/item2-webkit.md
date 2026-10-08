# ITEM 2 — Safari/WebKit: login em WebKit real + diagnóstico de sessão/cookies

Data: 2026-10-08 · branch `fix/lcp-precache` · apenas medição/diagnóstico (**nenhum
arquivo de cookies, CORS, CSP, auth ou infra foi alterado**).

## 1. Evidência: fluxos de login no WebKit real (iPhone 13)

`e2e/login-safari.spec.ts` rodou **3/3 aprovados no WebKit real** (engine Safari,
dispositivo `iPhone 13`):

| teste | resultado |
|---|---|
| submit com reCAPTCHA envia token no corpo e navega | ✓ 5,7s |
| api.js bloqueado → erro claro, sem envio, retry reinjeta script | ✓ 1,3s |
| GIS bloqueado → erro no clique, retry carrega script e executa prompt | ✓ 1,1s |

Também confirmado ao vivo no WebKit: `typeof window.requestIdleCallback === 'undefined'`
(premissa do Item 1 — Safari não implementa a API).

### Como rodar (e a limitação desta máquina)

- **Repositório**: projeto `webkit-iphone` no `playwright.config.ts` (device
  `iPhone 13`, só specs de auth). Em CI/Ubuntu ele usa o WebKit oficial do Playwright.
- **Bug desta máquina (macOS 14 arm64)**: o Playwright 1.62.1 do repo cai no WebKit
  "frozen" `webkit_mac14_arm64_special-2251`, que **não conhece** o setting de protocolo
  `PushAPIEnabled` que o core 1.62.1 envia em contexts `isMobile` → falha em
  `browserContext.newPage` (`Protocol error (Page.overrideSetting): Unknown setting:
  PushAPIEnabled`). É limitação conhecida do combo Playwright ≥1.62 × macOS 14 arm64
  (WebKit frozen; Playwright orienta atualizar o SO).
- **Evidência local**: runner isolado **Playwright 1.58.2** em `/tmp` (fora do repo,
  sem tocar nas dependências) + WebKit 2248, apontando para o mesmo preview
  (`VITE_RECAPTCHA_SITE_KEY` de teste no build). Comando usado:
  `cd /tmp/pw158 && VITE_RECAPTCHA_SITE_KEY=... ./node_modules/.bin/playwright test --project=webkit-iphone`.

## 2. Diagnóstico de sessão/cookies no WebKit (contexto persistente)

Cenário: WebKit/iPhone 13, **dev stack real** (`:3003` → backend `:3333`,
`NODE_ENV=development`), usuário seed `admin@admin.com` (MASTER_ADMIN), perfil
persistente (`launchPersistentContext`) fechado e reaberto.

| passo | comportamento observado |
|---|---|
| 1. login pela UI | ✓ entrou em `/master/work`; `Set-Cookie` em `POST /api/auth/login` |
| 2. reload da página | ✓ sessão restaurada (sem redirect para `/login`) |
| 3. nova aba no mesmo contexto | ✓ `/master/work` autenticado |
| 4. fechar browser e reabrir o mesmo perfil | ✓ segue autenticado, sem redirect |

Cookies emitidos no login (dev):

| cookie | atributos observados |
|---|---|
| `refresh_token` | `Max-Age=604800; Path=/api/auth; HttpOnly; SameSite=Lax` |
| `saved_refresh_<userId>` | `Max-Age=604800; Path=/api/auth; HttpOnly; SameSite=Lax` |

Mecanismo (código, sem alteração): access token **só em memória**
(`src/infra/authStorage.ts`); no reload/reabertura o boot chama
`POST /api/auth/refresh` com o cookie httpOnly (`credentials: 'include'`) e
restaura a sessão — funcionou em todos os passos acima. Observação: o Playwright
não expõe o header `Cookie` das requisições em `request.headers()` (oculto por
design); a restauração da sessão é a prova comportamental do round-trip.

Atributos de produção (inspeção de `authCookieOptions.ts`, **não executados aqui**):
`SameSite=None; Secure; Partitioned` (CHIPS) quando `sameSite=none`/produção —
`NODE_ENV=development` usa `Lax` sem `Secure`, como observado.

## 3. Configuração de deploy/origem (só leitura)

- `frontend/render.yaml`: static site + rewrite `/* → /index.html` (SPA); sem
  configuração de cookies/sessão no deploy do front.
- Backend `.env.example`: `AUTH_COOKIE_SAME_SITE="none"`, `ALLOWED_ORIGINS=...:3000/3003`;
  `.env` local: `ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3002"`,
  `NODE_ENV=development`. CORS em dev aceita `localhost/127.0.0.1` em qualquer porta.

## 4. Não testado (fora deste diagnóstico)

- Safari/iOS **físico**, domínio de produção (HTTPS) e o caminho real
  `SameSite=None; Secure; Partitioned` (ITP/CHIPS cross-site).
- Firefox; cookies cross-site entre domínios distintos (front Render × API).
- Fluxos de cadastro/recuperação em WebKit além dos cobertos por
  `login-safari.spec.ts` (token, bloqueio/retry e GIS); não há spec próprio de
  cadastro/recuperação no repo.
