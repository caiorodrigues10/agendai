# Diagnóstico LCP — 3 execuções por rota

Condições: rede Slow 4G (1,6 Mbps / 150 ms RTT) + CPU 4×, viewport 375×667, consentimento de cookies pré-setado.

## /login (API off, 3 execuções)

- **LCP mediano**: 2584 ms · **FCP mediano**: 1312 ms · elemento estável em só 2 variações as execuções
- **Elemento LCP**: `<img>` classe `h-9 hidden w-auto object-contain dark:block` — “” (174×36px)
- **Cadeia do elemento**: img.h-9.hidden.w-auto → span.inline-flex.select-none → button.min-h-11.cursor-pointer.transition-transform → div.mb-6.flex.w-full → div.p-5.sm:p-8.flex → div.relative.w-full.max-w-lg
- **Estilo no paint**: opacity=1, visibility=visible, fonte 16px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2159 ms (727 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 14 ms · descoberta do recurso +1945 ms · download do recurso 520 ms · renderização +42 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +1851 · render +42 ⇒ soma ≈ 2584 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 3, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/login (document)` | html | 0 | 177 | 177 | 1.2 |
| `/assets/index-BFIhfbNw.js` | js | 232 | 1232 | 1000 | 144.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 233 | 653 | 420 | 27.5 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1343 | 1548 | 204 | 0.9 |
| `/assets/schemas-bbERxAmZ.js` | js | 1343 | 1604 | 261 | 3.5 |
| `/assets/LoginPage-CFCKxVH-.js` | js | 1343 | 1689 | 346 | 12.8 |
| `/assets/index-BYJWPTdV.js` | js | 1343 | 1810 | 467 | 23 |
| `/assets/Toast-CwikF2ub.js` | js | 1344 | 1562 | 218 | 0.9 |
| `/assets/PasswordInput-CRgs4ILk.js` | js | 1344 | 1590 | 247 | 1.8 |
| `/assets/Avatar-M1q1IKNs.js` | js | 1344 | 1734 | 390 | 0.9 |
| `/assets/recaptcha-BGUIgozy.js` | js | 1344 | 1761 | 417 | 0.4 |
| `/assets/plansApi-D0ZRkhnO.js` | js | 1344 | 1784 | 440 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1345 | 1853 | 509 | 0.9 |
| `/assets/Card-DZ_LaXyp.js` | js | 1345 | 1896 | 552 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1345 | 1953 | 608 | 1.2 |
| `/assets/Combination-D9hMB0-M.js` | js | 1345 | 2018 | 673 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1361 | 1996 | 635 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1374 | 2149 | 775 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 2122 | 2642 | 520 | 34.9 |
| `/brand/agendai-logo.webp` | imagem | 2122 | 2671 | 550 | 35.4 |
| `/gsi/client` | script | 2151 | 3800 | 1649 | 0 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1374→2149ms (61.4KB)

## /login (API off, 3 execuções)

- **LCP mediano**: 2132 ms · **FCP mediano**: 1304 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `font-sans text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight` — “Seu salão, no controle.” (592×52px)
- **Cadeia do elemento**: p.font-sans.text-4xl.xl:text-5xl → div → div.flex-1.flex.flex-col → div.relative.z-10.flex → div.relative.hidden.lg:flex → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 48px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2017 ms (709 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +1852 ms · renderização +115 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +1852 · render +115 ⇒ soma ≈ 2132 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 3
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/login (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 172 | 605 | 432 | 27.5 |
| `/assets/index-BFIhfbNw.js` | js | 172 | 1181 | 1009 | 144.2 |
| `/assets/LoginPage-CFCKxVH-.js` | js | 1259 | 1601 | 342 | 12.8 |
| `/assets/index-BYJWPTdV.js` | js | 1260 | 1732 | 472 | 23 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1261 | 1459 | 198 | 0.9 |
| `/assets/Toast-CwikF2ub.js` | js | 1261 | 1473 | 212 | 0.9 |
| `/assets/PasswordInput-CRgs4ILk.js` | js | 1261 | 1503 | 242 | 1.8 |
| `/assets/schemas-bbERxAmZ.js` | js | 1261 | 1517 | 257 | 3.5 |
| `/assets/Avatar-M1q1IKNs.js` | js | 1261 | 1647 | 385 | 0.9 |
| `/assets/recaptcha-BGUIgozy.js` | js | 1261 | 1673 | 412 | 0.4 |
| `/assets/plansApi-D0ZRkhnO.js` | js | 1261 | 1695 | 433 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1262 | 1761 | 499 | 0.9 |
| `/assets/Card-DZ_LaXyp.js` | js | 1262 | 1812 | 550 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1262 | 1861 | 599 | 1.2 |
| `/assets/Combination-D9hMB0-M.js` | js | 1262 | 1918 | 656 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1272 | 1924 | 652 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1278 | 2060 | 782 | 61.4 |
| `/brand/agendai-logo.webp` | imagem | 1986 | 2582 | 595 | 35.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1987 | 2576 | 590 | 34.9 |
| `/gsi/client` | script | 2010 | 2985 | 975 | 0 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1278→2060ms (61.4KB)

## /login (API real, 3 execuções)

- **LCP mediano**: 2096 ms · **FCP mediano**: 1308 ms · elemento estável em só 2 variações as execuções
- **Elemento LCP**: `<h1>` classe `mt-5 text-center text-2xl font-black tracking-tight text-text-primary sm:text-3xl` — “Bem-vindo de volta” (217×32px)
- **Cadeia do elemento**: h1.mt-5.text-center.text-2xl → div.mb-6.flex.w-full → div.p-5.sm:p-8.flex → div.relative.w-full.max-w-lg → div.relative.flex.items-center → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 24px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2002 ms (686 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1844 ms · renderização +94 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1819 · render +92 ⇒ soma ≈ 2096 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 3
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/login (document)` | html | 0 | 158 | 158 | 1.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 173 | 607 | 434 | 27.5 |
| `/assets/index-BFIhfbNw.js` | js | 173 | 1181 | 1008 | 144.2 |
| `/assets/LoginPage-CFCKxVH-.js` | js | 1264 | 1587 | 324 | 12.8 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1265 | 1445 | 180 | 0.9 |
| `/assets/schemas-bbERxAmZ.js` | js | 1265 | 1503 | 239 | 3.5 |
| `/assets/index-BYJWPTdV.js` | js | 1265 | 1716 | 452 | 23 |
| `/assets/Toast-CwikF2ub.js` | js | 1266 | 1461 | 195 | 0.9 |
| `/assets/PasswordInput-CRgs4ILk.js` | js | 1266 | 1487 | 221 | 1.8 |
| `/assets/Avatar-M1q1IKNs.js` | js | 1266 | 1631 | 365 | 0.9 |
| `/assets/recaptcha-BGUIgozy.js` | js | 1266 | 1653 | 387 | 0.4 |
| `/assets/plansApi-D0ZRkhnO.js` | js | 1266 | 1674 | 408 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1266 | 1745 | 479 | 0.9 |
| `/assets/Card-DZ_LaXyp.js` | js | 1266 | 1789 | 522 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1267 | 1845 | 578 | 1.2 |
| `/assets/Combination-D9hMB0-M.js` | js | 1267 | 1911 | 644 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1276 | 1903 | 627 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1280 | 2045 | 765 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1976 | 2562 | 586 | 34.9 |
| `/brand/agendai-logo.webp` | imagem | 1976 | 2569 | 594 | 35.4 |
| `/gsi/client` | script | 1994 | 2970 | 976 | 0 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1280→2045ms (61.4KB)

## /login (API real, 3 execuções)

- **LCP mediano**: 2092 ms · **FCP mediano**: 1296 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `font-sans text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight` — “Seu salão, no controle.” (592×52px)
- **Cadeia do elemento**: p.font-sans.text-4xl.xl:text-5xl → div → div.flex-1.flex.flex-col → div.relative.z-10.flex → div.relative.hidden.lg:flex → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 48px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1982 ms (682 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · criação do elemento +1817 ms · renderização +106 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1819 · render +106 ⇒ soma ≈ 2092 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 3, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/login (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 172 | 594 | 422 | 27.5 |
| `/assets/index-BFIhfbNw.js` | js | 172 | 1173 | 1001 | 144.2 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1248 | 1423 | 175 | 0.9 |
| `/assets/schemas-bbERxAmZ.js` | js | 1248 | 1480 | 233 | 3.5 |
| `/assets/LoginPage-CFCKxVH-.js` | js | 1248 | 1574 | 327 | 12.8 |
| `/assets/index-BYJWPTdV.js` | js | 1248 | 1703 | 455 | 23 |
| `/assets/Toast-CwikF2ub.js` | js | 1249 | 1437 | 188 | 0.9 |
| `/assets/PasswordInput-CRgs4ILk.js` | js | 1249 | 1468 | 219 | 1.8 |
| `/assets/Avatar-M1q1IKNs.js` | js | 1249 | 1602 | 354 | 0.9 |
| `/assets/recaptcha-BGUIgozy.js` | js | 1249 | 1639 | 390 | 0.4 |
| `/assets/plansApi-D0ZRkhnO.js` | js | 1249 | 1660 | 411 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1249 | 1731 | 482 | 0.9 |
| `/assets/Card-DZ_LaXyp.js` | js | 1250 | 1762 | 512 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1250 | 1825 | 576 | 1.2 |
| `/assets/Combination-D9hMB0-M.js` | js | 1250 | 1895 | 645 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1258 | 1888 | 630 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1263 | 2033 | 770 | 61.4 |
| `/brand/agendai-logo.webp` | imagem | 1955 | 2561 | 606 | 35.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1955 | 2546 | 591 | 34.9 |
| `/gsi/client` | script | 1974 | 2954 | 980 | 0 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1263→2033ms (61.4KB)
