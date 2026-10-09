# Item 5 — Safari/ITP: resumo de 10 linhas

1. Login no WebKit real (iPhone 13, projeto `webkit-iphone`): **3/3 verdes** em CI/Ubuntu; local macOS só com runner isolado (WebKit frozen não aceita `PushAPIEnabled` — limitação do combo Playwright 1.62 × macOS 14 arm64, não do app).
2. Sessão WebKit persistente: login → reload → nova aba → fechar/reabrir → **autenticado em todos os passos** (dev, cookies `HttpOnly; SameSite=Lax`).
3. Mecanismo: access token só em memória (`authStorage.ts`); restauração no boot via `POST /api/auth/refresh` com cookie httpOnly (`credentials: 'include'`) — round-trip provado comportamentalmente (Playwright oculta o header `Cookie` por design).
4. Produção (não executado aqui): cookies com `SameSite=None; Secure; Partitioned` (CHIPS, `authCookieOptions.ts`) — o caminho ITP/cross-site real depende de validação em iOS físico + domínios HTTPS.
5. Domínios/origens relevantes: front `agendai-frontend` (Render static, SPA rewrite), API `VITE_API_URL=https://agendai-back-end.onrender.com` (`.env.example:24`, **valor de produção a confirmar no Render**); CORS backend: `ALLOWED_ORIGINS` com localhost/127.0.0.1 :3000/:3003 (dev) — origem do domínio Render precisa constar no `.env` de produção do backend (**a confirmar**).
6. ITP clássico (7 dias de cap para cookies não-preenchidos) não deve atingir o refresh: o cookie `refresh_token` tem `Max-Age=604800` (7 dias) e é re-gravado a cada refresh — mas **não testado em iOS físico**.
7. CHIPS (`Partitioned`) exige Chrome ≥117/Safari 17+; Safari 17+ suporta — compatível com o alvo iPhone 13 (iOS 17+).
8. `requestIdleCallback` não existe no WebKit (confirmado ao vivo) — premissa do Item 1 respeitada no código.
9. Risco residual principal: **cross-site em produção** (front e API em domínios distintos + `SameSite=None`) — único cenário não exercitável neste ambiente; validar no deploy com iOS real.
10. Nenhuma alteração de cookies/CORS/CSP/auth foi feita neste diagnóstico; evidência completa: `item2-webkit.md`.
