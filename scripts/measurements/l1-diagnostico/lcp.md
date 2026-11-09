# Diagnóstico LCP — 5 execuções por rota

Condições: rede Slow 4G (1,6 Mbps / 150 ms RTT) + CPU 4×, viewport 375×667, consentimento de cookies pré-setado.

## / (API off, 5 execuções)

- **LCP mediano**: 3140 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:mt-7 sm:text-lg xl` — “Fila pública com estimativa de espera, agendamento online e financeiro no mesmo painel. A ” (335×104px)
- **Cadeia do elemento**: p.mt-6.max-w-2xl.text-base → div.relative.z-20.max-w-3xl → div.relative.z-10.mx-auto → section.relative.flex.min-h-dvh → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-[#050706]
- **Estilo no paint**: opacity=0.8495, visibility=visible, fonte 16px "DM Sans" · **nasceu escondido: style.opacity=0**
- **Entrada no DOM**: 2499 ms (1063 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 12 ms · criação do elemento +2325 ms · renderização +885 ms
- **Divisão (mediana)**: TTFB 4 · elemento/recurso +2162 · render +845 ⇒ soma ≈ 3140 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 5/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 4, 5, 5, 5, 6
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/ (document)` | html | 0 | 174 | 174 | 1.2 |
| `/assets/index-C6FvOS5C.css` | css (bloqueia pintura) | 230 | 658 | 428 | 27.4 |
| `/assets/index-BQwnyFN5.js` | js | 230 | 1229 | 999 | 143.3 |
| `/assets/LandingPage-IjLkJtEs.js` | js | 1347 | 1729 | 382 | 15.1 |
| `/assets/brand-DVsU9mFC.js` | js | 1348 | 1529 | 181 | 0.3 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1348 | 1558 | 210 | 0.9 |
| `/assets/MarketingLayout-DNJENUuM.js` | js | 1348 | 1600 | 252 | 3.8 |
| `/assets/reducedMotion-BesYf7lH.js` | js | 1348 | 2108 | 760 | 44.7 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1349 | 1565 | 216 | 1 |
| `/assets/softwareApplicationLd-BwVy-2RS.js` | js | 1349 | 1746 | 397 | 1.2 |
| `/assets/weatherVisuals-BLxvLQ2x.js` | js | 1349 | 1772 | 423 | 1 |
| `/assets/utils-DCADjnpI.js` | js | 1349 | 1880 | 531 | 8.8 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1365 | 1922 | 558 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1378 | 2244 | 866 | 61.4 |
| `/weather/sunny.jpg` | imagem | 2211 | 2802 | 591 | 29.4 |
| `/brand/agendai-logo.webp` | imagem | 2218 | 2868 | 650 | 35.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 2219 | 2852 | 634 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1378→2244ms (61.4KB)

## /planos (API off, 5 execuções)

- **LCP mediano**: 3080 ms · **FCP mediano**: 1304 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-neutral-400 md:text-lg` — “Sua conta começa com 30 dias de teste do Pro completo, sem cartão. Depois, escolha Essenci” (327×104px)
- **Cadeia do elemento**: p.mx-auto.mt-4.max-w-xl → div.mx-auto.max-w-2xl.text-center → div.mx-auto.max-w-6xl → section#precos.px-6.pb-16.pt-32 → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-black
- **Estilo no paint**: opacity=1, visibility=visible, fonte 16px "DM Sans" · **nasceu escondido: style.opacity=0**
- **Entrada no DOM**: 2621 ms (1349 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 4 ms · criação do elemento +2456 ms · renderização +463 ms
- **Divisão (mediana)**: TTFB 4 · elemento/recurso +2452 · render +463 ⇒ soma ≈ 3080 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 5/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 4, 4, 4, 4, 4
- **Chamadas API antes do LCP**: /api/plans 2685→2939ms (Failed to fetch) [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/planos (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-C6FvOS5C.css` | css (bloqueia pintura) | 185 | 601 | 416 | 27.4 |
| `/assets/index-BQwnyFN5.js` | js | 185 | 1174 | 989 | 143.3 |
| `/assets/plansApi-CDJENJdb.js` | js | 1230 | 1401 | 170 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1230 | 1424 | 193 | 0.9 |
| `/assets/brand-DVsU9mFC.js` | js | 1230 | 1429 | 199 | 0.3 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1230 | 1439 | 208 | 1 |
| `/assets/MarketingLayout-DNJENUuM.js` | js | 1230 | 1466 | 235 | 3.8 |
| `/assets/PlansPage-B7OG-dO3.js` | js | 1230 | 1482 | 252 | 6.7 |
| `/assets/softwareApplicationLd-BwVy-2RS.js` | js | 1231 | 1645 | 414 | 1.2 |
| `/assets/formatters-qI0gGYoN.js` | js | 1231 | 1674 | 443 | 1.2 |
| `/assets/utils-DCADjnpI.js` | js | 1231 | 1787 | 557 | 8.8 |
| `/assets/BarChart-CCiEu5XA.js` | js | 1231 | 2140 | 909 | 31.8 |
| `/assets/chart-CU3b1OFD.js` | js | 1231 | 2482 | 1251 | 77.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1238 | 1851 | 614 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1242 | 2373 | 1131 | 61.4 |
| `/brand/agendai-logo.webp` | imagem | 2613 | 3117 | 504 | 35.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 2614 | 3113 | 499 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1242→2373ms (61.4KB)

## /queue (API off, 5 execuções)

- **LCP mediano**: 4616 ms · **FCP mediano**: 1312 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:mt-7 sm:text-lg xl` — “Fila pública com estimativa de espera, agendamento online e financeiro no mesmo painel. A ” (335×104px)
- **Cadeia do elemento**: p.mt-6.max-w-2xl.text-base → div.relative.z-20.max-w-3xl → div.relative.z-10.mx-auto → section.relative.flex.min-h-dvh → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-[#050706]
- **Estilo no paint**: opacity=0.8183, visibility=visible, fonte 16px "DM Sans" · **nasceu escondido: style.opacity=0**
- **Entrada no DOM**: 3743 ms (2427 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +3578 ms · renderização +893 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +3578 · render +874 ⇒ soma ≈ 4616 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 5/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 5, 6, 6, 5, 6
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-BQwnyFN5.js` | js | 181 | 1174 | 994 | 143.3 |
| `/assets/index-C6FvOS5C.css` | css (bloqueia pintura) | 182 | 600 | 419 | 27.4 |
| `/assets/PublicHome-aDmkg73C.js` | js | 1255 | 1581 | 326 | 9 |
| `/assets/ShopProfile-Cnz2xI8C.js` | js | 1255 | 2076 | 821 | 39.5 |
| `/assets/notificationsApi-DLiXvhQ3.js` | js | 1256 | 1437 | 182 | 1 |
| `/assets/documentUtils-ZKVidJu0.js` | js | 1256 | 1453 | 198 | 0.9 |
| `/assets/StatusBadge-CyNMfpe9.js` | js | 1256 | 1460 | 204 | 1.2 |
| `/assets/SmartSelect-a3xy-MmZ.js` | js | 1256 | 1716 | 461 | 17.1 |
| `/assets/ConfirmDialog-DC4Ltz73.js` | js | 1256 | 1753 | 498 | 1.3 |
| `/assets/ModalShell-De9c2urG.js` | js | 1256 | 1775 | 519 | 1.4 |
| `/assets/Combination-Cne9-q_7.js` | js | 1256 | 1954 | 697 | 7.4 |
| `/assets/Skeleton-C6t0a5h7.css` | css (bloqueia pintura) | 1257 | 1603 | 347 | 0.6 |
| `/assets/Skeleton-Aid-pSaG.js` | js | 1257 | 1970 | 713 | 0.9 |
| `/assets/schemas-DV3XYwFM.js` | js | 1257 | 2013 | 756 | 3.5 |
| `/assets/index-Dncbkhqt.js` | js | 1257 | 2262 | 1005 | 23 |
| `/assets/ShopProfile-boBQ_sKJ.css` | css (bloqueia pintura) | 1258 | 1653 | 395 | 2.3 |
| `/assets/clientPortalApi-D1d36Y4d.js` | js | 1258 | 2177 | 919 | 1.7 |
| `/assets/Toast-Bxmp3YV0.js` | js | 1258 | 2197 | 940 | 0.9 |
| `/assets/PostDetail-CYKhXN2V.js` | js | 1258 | 2212 | 954 | 4.6 |
| `/assets/reputationApi-B1DcTEZ3.js` | js | 1258 | 2246 | 989 | 0.8 |
| `/assets/utils-DCADjnpI.js` | js | 1258 | 2491 | 1233 | 8.8 |
| `/assets/chart-CU3b1OFD.js` | js | 1258 | 2839 | 1581 | 77.9 |
| `/assets/Card-lDzNYzWX.js` | js | 1259 | 2389 | 1131 | 0.5 |
| `/assets/Avatar-BWcCib7u.js` | js | 1259 | 2425 | 1166 | 0.9 |
| `/assets/Button-BKCQBfCk.js` | js | 1259 | 2439 | 1180 | 1.3 |
| `/assets/publicProductsApi-ODSDJZle.js` | js | 1259 | 2553 | 1294 | 0.7 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1269 | 2588 | 1319 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1276 | 2411 | 1136 | 61.4 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 2904 | 3070 | 166 | 0.9 |
| `/assets/brand-DVsU9mFC.js` | js | 2904 | 3084 | 181 | 0.3 |
| `/assets/MarketingLayout-DNJENUuM.js` | js | 2904 | 3133 | 229 | 3.8 |
| `/assets/LandingPage-IjLkJtEs.js` | js | 2904 | 3270 | 366 | 15.1 |
| `/assets/reducedMotion-BesYf7lH.js` | js | 2904 | 3420 | 516 | 44.7 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 2905 | 3075 | 170 | 1 |
| `/assets/softwareApplicationLd-BwVy-2RS.js` | js | 2905 | 3238 | 333 | 1.2 |
| `/assets/weatherVisuals-BLxvLQ2x.js` | js | 2905 | 3249 | 344 | 1 |
| `/brand/agendai-logo-dark.webp` | imagem | 3496 | 3991 | 495 | 34.9 |
| `/brand/agendai-logo.webp` | imagem | 3496 | 4005 | 510 | 35.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1276→2411ms (61.4KB)

## /cadastro (API off, 5 execuções)

- **LCP mediano**: 2112 ms · **FCP mediano**: 1296 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-2 max-w-sm text-center text-sm leading-relaxed text-text-muted` — “Crie sua conta em poucos minutos. Sem cartão e sem compromisso.” (298×45px)
- **Cadeia do elemento**: p.mt-2.max-w-sm.text-center → div.mb-6.flex.w-full → div.p-5.sm:p-8.flex → div.relative.w-full.max-w-lg → div.relative.flex.items-center → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2052 ms (756 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +1884 ms · renderização +116 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +1874 · render +73 ⇒ soma ≈ 2112 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/cadastro (document)` | html | 0 | 168 | 168 | 1.2 |
| `/assets/index-BQwnyFN5.js` | js | 180 | 1167 | 988 | 143.3 |
| `/assets/index-C6FvOS5C.css` | css (bloqueia pintura) | 181 | 594 | 414 | 27.4 |
| `/assets/documentUtils-ZKVidJu0.js` | js | 1245 | 1440 | 194 | 0.9 |
| `/assets/schemas-DV3XYwFM.js` | js | 1245 | 1501 | 256 | 3.5 |
| `/assets/LoginPage-BH7nxq_q.js` | js | 1245 | 1595 | 350 | 12.8 |
| `/assets/index-Dncbkhqt.js` | js | 1245 | 1704 | 459 | 23 |
| `/assets/Toast-Bxmp3YV0.js` | js | 1246 | 1452 | 206 | 0.9 |
| `/assets/PasswordInput-Blw91kmQ.js` | js | 1246 | 1487 | 241 | 1.8 |
| `/assets/Avatar-BWcCib7u.js` | js | 1246 | 1652 | 405 | 0.9 |
| `/assets/recaptcha-CEdXQ8zo.js` | js | 1247 | 1676 | 429 | 0.4 |
| `/assets/plansApi-CDJENJdb.js` | js | 1247 | 1752 | 505 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1247 | 1776 | 529 | 0.9 |
| `/assets/Skeleton-C6t0a5h7.css` | css (bloqueia pintura) | 1248 | 1609 | 361 | 0.6 |
| `/assets/Card-lDzNYzWX.js` | js | 1248 | 1811 | 563 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1248 | 1876 | 628 | 1.2 |
| `/assets/Combination-Cne9-q_7.js` | js | 1248 | 1925 | 677 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1258 | 1940 | 682 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1262 | 2054 | 792 | 61.4 |
| `/brand/agendai-logo.webp` | imagem | 2003 | 2510 | 507 | 35.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 2005 | 2505 | 500 | 34.9 |
| `/gsi/client` | script | 2041 | 3006 | 965 | 0 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1262→2054ms (61.4KB)

## / (API real, 5 execuções)

- **LCP mediano**: 3156 ms · **FCP mediano**: 1296 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:mt-7 sm:text-lg xl` — “Fila pública com estimativa de espera, agendamento online e financeiro no mesmo painel. A ” (335×104px)
- **Cadeia do elemento**: p.mt-6.max-w-2xl.text-base → div.relative.z-20.max-w-3xl → div.relative.z-10.mx-auto → section.relative.flex.min-h-dvh → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-[#050706]
- **Estilo no paint**: opacity=0.8439, visibility=visible, fonte 16px "DM Sans" · **nasceu escondido: style.opacity=0**
- **Entrada no DOM**: 2313 ms (1013 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2147 ms · renderização +923 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2129 · render +860 ⇒ soma ≈ 3156 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 5/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 5, 5, 5, 4, 5
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/ (document)` | html | 0 | 166 | 166 | 1.2 |
| `/assets/index-C6FvOS5C.css` | css (bloqueia pintura) | 182 | 600 | 418 | 27.4 |
| `/assets/index-BQwnyFN5.js` | js | 182 | 1174 | 992 | 143.3 |
| `/assets/LandingPage-IjLkJtEs.js` | js | 1249 | 1632 | 383 | 15.1 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1250 | 1416 | 167 | 0.9 |
| `/assets/brand-DVsU9mFC.js` | js | 1250 | 1424 | 174 | 0.3 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1250 | 1431 | 181 | 1 |
| `/assets/MarketingLayout-DNJENUuM.js` | js | 1250 | 1482 | 233 | 3.8 |
| `/assets/softwareApplicationLd-BwVy-2RS.js` | js | 1250 | 1610 | 360 | 1.2 |
| `/assets/utils-DCADjnpI.js` | js | 1250 | 1752 | 503 | 8.8 |
| `/assets/reducedMotion-BesYf7lH.js` | js | 1250 | 1996 | 746 | 44.7 |
| `/assets/weatherVisuals-BLxvLQ2x.js` | js | 1251 | 1659 | 409 | 1 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1259 | 1794 | 535 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1263 | 2133 | 870 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 2089 | 2590 | 501 | 34.9 |
| `/brand/agendai-logo.webp` | imagem | 2089 | 2596 | 506 | 35.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1263→2133ms (61.4KB)

## /planos (API real, 5 execuções)

- **LCP mediano**: 3048 ms · **FCP mediano**: 1296 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-neutral-400 md:text-lg` — “Sua conta começa com 30 dias de teste do Pro completo, sem cartão. Depois, escolha Essenci” (327×104px)
- **Cadeia do elemento**: p.mx-auto.mt-4.max-w-xl → div.mx-auto.max-w-2xl.text-center → div.mx-auto.max-w-6xl → section#precos.px-6.pb-16.pt-32 → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-black
- **Estilo no paint**: opacity=1, visibility=visible, fonte 16px "DM Sans" · **nasceu escondido: style.opacity=0**
- **Entrada no DOM**: 2593 ms (1297 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · criação do elemento +2435 ms · renderização +455 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2435 · render +455 ⇒ soma ≈ 3048 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 5/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 3, 3, 3, 3, 3
- **Chamadas API antes do LCP**: /api/plans 2655→2892ms status 200 [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/planos (document)` | html | 0 | 158 | 158 | 1.2 |
| `/assets/index-BQwnyFN5.js` | js | 173 | 1167 | 994 | 143.3 |
| `/assets/index-C6FvOS5C.css` | css (bloqueia pintura) | 174 | 600 | 427 | 27.4 |
| `/assets/plansApi-CDJENJdb.js` | js | 1248 | 1410 | 162 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1248 | 1425 | 177 | 0.9 |
| `/assets/MarketingLayout-DNJENUuM.js` | js | 1248 | 1474 | 227 | 3.8 |
| `/assets/PlansPage-B7OG-dO3.js` | js | 1248 | 1490 | 242 | 6.7 |
| `/assets/brand-DVsU9mFC.js` | js | 1249 | 1430 | 181 | 0.3 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1249 | 1439 | 190 | 1 |
| `/assets/softwareApplicationLd-BwVy-2RS.js` | js | 1249 | 1660 | 411 | 1.2 |
| `/assets/formatters-qI0gGYoN.js` | js | 1249 | 1681 | 432 | 1.2 |
| `/assets/utils-DCADjnpI.js` | js | 1249 | 1781 | 533 | 8.8 |
| `/assets/BarChart-CCiEu5XA.js` | js | 1249 | 2139 | 890 | 31.8 |
| `/assets/chart-CU3b1OFD.js` | js | 1249 | 2489 | 1240 | 77.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1261 | 1868 | 608 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1265 | 2388 | 1124 | 61.4 |
| `/brand/agendai-logo.webp` | imagem | 2586 | 3104 | 518 | 35.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 2586 | 3097 | 511 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1265→2388ms (61.4KB)

## /queue (API real, 5 execuções)

- **LCP mediano**: 4608 ms · **FCP mediano**: 1300 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:mt-7 sm:text-lg xl` — “Fila pública com estimativa de espera, agendamento online e financeiro no mesmo painel. A ” (335×104px)
- **Cadeia do elemento**: p.mt-6.max-w-2xl.text-base → div.relative.z-20.max-w-3xl → div.relative.z-10.mx-auto → section.relative.flex.min-h-dvh → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-[#050706]
- **Estilo no paint**: opacity=0.7459, visibility=visible, fonte 16px "DM Sans" · **nasceu escondido: style.opacity=0**
- **Entrada no DOM**: 3647 ms (2367 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · criação do elemento +3490 ms · renderização +921 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +3531 · render +921 ⇒ soma ≈ 4608 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 5/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 6, 6, 6, 5, 6
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-C6FvOS5C.css` | css (bloqueia pintura) | 171 | 593 | 421 | 27.4 |
| `/assets/index-BQwnyFN5.js` | js | 171 | 1167 | 995 | 143.3 |
| `/assets/PublicHome-aDmkg73C.js` | js | 1239 | 1552 | 313 | 9 |
| `/assets/notificationsApi-DLiXvhQ3.js` | js | 1240 | 1408 | 169 | 1 |
| `/assets/documentUtils-ZKVidJu0.js` | js | 1240 | 1418 | 178 | 0.9 |
| `/assets/SmartSelect-a3xy-MmZ.js` | js | 1240 | 1689 | 449 | 17.1 |
| `/assets/ShopProfile-Cnz2xI8C.js` | js | 1240 | 2047 | 807 | 39.5 |
| `/assets/StatusBadge-CyNMfpe9.js` | js | 1241 | 1430 | 190 | 1.2 |
| `/assets/ConfirmDialog-DC4Ltz73.js` | js | 1241 | 1724 | 484 | 1.3 |
| `/assets/ModalShell-De9c2urG.js` | js | 1241 | 1745 | 505 | 1.4 |
| `/assets/Combination-Cne9-q_7.js` | js | 1241 | 1921 | 680 | 7.4 |
| `/assets/schemas-DV3XYwFM.js` | js | 1241 | 1981 | 740 | 3.5 |
| `/assets/index-Dncbkhqt.js` | js | 1241 | 2232 | 991 | 23 |
| `/assets/Skeleton-C6t0a5h7.css` | css (bloqueia pintura) | 1242 | 1575 | 333 | 0.6 |
| `/assets/Skeleton-Aid-pSaG.js` | js | 1242 | 1930 | 689 | 0.9 |
| `/assets/clientPortalApi-D1d36Y4d.js` | js | 1242 | 2133 | 891 | 1.7 |
| `/assets/Toast-Bxmp3YV0.js` | js | 1242 | 2159 | 918 | 0.9 |
| `/assets/PostDetail-CYKhXN2V.js` | js | 1242 | 2173 | 932 | 4.6 |
| `/assets/ShopProfile-boBQ_sKJ.css` | css (bloqueia pintura) | 1243 | 1617 | 374 | 2.3 |
| `/assets/reputationApi-B1DcTEZ3.js` | js | 1243 | 2219 | 976 | 0.8 |
| `/assets/Card-lDzNYzWX.js` | js | 1244 | 2347 | 1103 | 0.5 |
| `/assets/Avatar-BWcCib7u.js` | js | 1244 | 2389 | 1145 | 0.9 |
| `/assets/Button-BKCQBfCk.js` | js | 1244 | 2418 | 1175 | 1.3 |
| `/assets/utils-DCADjnpI.js` | js | 1244 | 2463 | 1219 | 8.8 |
| `/assets/publicProductsApi-ODSDJZle.js` | js | 1244 | 2510 | 1266 | 0.7 |
| `/assets/chart-CU3b1OFD.js` | js | 1244 | 2811 | 1568 | 77.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1253 | 2560 | 1307 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1257 | 2424 | 1168 | 61.4 |
| `/assets/brand-DVsU9mFC.js` | js | 2874 | 3039 | 165 | 0.3 |
| `/assets/LandingPage-IjLkJtEs.js` | js | 2874 | 3240 | 366 | 15.1 |
| `/assets/reducedMotion-BesYf7lH.js` | js | 2874 | 3392 | 518 | 44.7 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 2875 | 3047 | 172 | 1 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 2875 | 3055 | 180 | 0.9 |
| `/assets/MarketingLayout-DNJENUuM.js` | js | 2875 | 3106 | 231 | 3.8 |
| `/assets/softwareApplicationLd-BwVy-2RS.js` | js | 2875 | 3213 | 338 | 1.2 |
| `/assets/weatherVisuals-BLxvLQ2x.js` | js | 2875 | 3227 | 351 | 1 |
| `/brand/agendai-logo-dark.webp` | imagem | 3464 | 3964 | 500 | 34.9 |
| `/brand/agendai-logo.webp` | imagem | 3464 | 3971 | 507 | 35.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1257→2424ms (61.4KB)

## /cadastro (API real, 5 execuções)

- **LCP mediano**: 2076 ms · **FCP mediano**: 1296 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-2 max-w-sm text-center text-sm leading-relaxed text-text-muted` — “Crie sua conta em poucos minutos. Sem cartão e sem compromisso.” (297×45px)
- **Cadeia do elemento**: p.mt-2.max-w-sm.text-center → div.mb-6.flex.w-full → div.p-5.sm:p-8.flex → div.relative.w-full.max-w-lg → div.relative.flex.items-center → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2013 ms (717 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +1848 ms · renderização +63 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +1854 · render +63 ⇒ soma ≈ 2076 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/cadastro (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-C6FvOS5C.css` | css (bloqueia pintura) | 181 | 600 | 419 | 27.4 |
| `/assets/index-BQwnyFN5.js` | js | 181 | 1173 | 993 | 143.3 |
| `/assets/documentUtils-ZKVidJu0.js` | js | 1250 | 1432 | 181 | 0.9 |
| `/assets/schemas-DV3XYwFM.js` | js | 1250 | 1487 | 237 | 3.5 |
| `/assets/LoginPage-BH7nxq_q.js` | js | 1250 | 1582 | 331 | 12.8 |
| `/assets/index-Dncbkhqt.js` | js | 1250 | 1698 | 448 | 23 |
| `/assets/Toast-Bxmp3YV0.js` | js | 1251 | 1453 | 202 | 0.9 |
| `/assets/PasswordInput-Blw91kmQ.js` | js | 1251 | 1474 | 223 | 1.8 |
| `/assets/Avatar-BWcCib7u.js` | js | 1252 | 1644 | 393 | 0.9 |
| `/assets/recaptcha-CEdXQ8zo.js` | js | 1252 | 1659 | 407 | 0.4 |
| `/assets/plansApi-CDJENJdb.js` | js | 1252 | 1746 | 494 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1252 | 1762 | 511 | 0.9 |
| `/assets/Card-lDzNYzWX.js` | js | 1252 | 1811 | 559 | 0.5 |
| `/assets/Skeleton-C6t0a5h7.css` | css (bloqueia pintura) | 1253 | 1597 | 345 | 0.6 |
| `/assets/formatters-qI0gGYoN.js` | js | 1253 | 1867 | 614 | 1.2 |
| `/assets/Combination-Cne9-q_7.js` | js | 1253 | 1902 | 649 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1262 | 1932 | 670 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1266 | 2045 | 779 | 61.4 |
| `/brand/agendai-logo.webp` | imagem | 1978 | 2577 | 599 | 35.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1979 | 2560 | 581 | 34.9 |
| `/gsi/client` | script | 2003 | 2978 | 976 | 0 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1266→2045ms (61.4KB)
