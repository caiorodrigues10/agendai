# Diagnóstico LCP — 5 execuções por rota

Condições: rede Slow 4G (1,6 Mbps / 150 ms RTT) + CPU 4×, viewport 375×667, consentimento de cookies pré-setado.

## / (API off, 5 execuções)

- **LCP mediano**: 1912 ms · **FCP mediano**: 1288 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:mt-7 sm:text-lg xl` — “Fila pública com estimativa de espera, agendamento online e financeiro no mesmo painel. A ” (335×104px)
- **Cadeia do elemento**: p.mt-6.max-w-2xl.text-base → div.relative.z-20.max-w-3xl → div.relative.z-10.mx-auto → section.relative.flex.min-h-dvh → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-[#050706]
- **Estilo no paint**: opacity=1, visibility=visible, fonte 16px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1815 ms (367 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 10 ms · criação do elemento +1650 ms · renderização +269 ms
- **Divisão (mediana)**: TTFB 4 · elemento/recurso +1550 · render +205 ⇒ soma ≈ 1912 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/ (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 208 | 1208 | 1000 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 209 | 629 | 421 | 27.7 |
| `/assets/LandingPage-BVu77587.js` | js | 1325 | 1680 | 355 | 15.2 |
| `/assets/brand-DVsU9mFC.js` | js | 1327 | 1501 | 174 | 0.3 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1327 | 1516 | 189 | 0.9 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1327 | 1529 | 202 | 1 |
| `/assets/MarketingLayout-uQC4oP6-.js` | js | 1327 | 1573 | 246 | 3.8 |
| `/assets/utils-DCADjnpI.js` | js | 1327 | 1638 | 310 | 8.8 |
| `/assets/softwareApplicationLd-d6g1ScMe.js` | js | 1328 | 1687 | 359 | 1.2 |
| `/assets/weatherVisuals-BLxvLQ2x.js` | js | 1328 | 1701 | 373 | 1 |
| `/assets/reducedMotion-D9SWaqt8.js` | js | 1328 | 1738 | 410 | 0.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1343 | 1816 | 473 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1353 | 2201 | 849 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1758 | 2401 | 644 | 34.9 |
| `/assets/ScrollTrigger-7Zy99s9Q.js` | js | 1820 | 2301 | 481 | 18.1 |
| `/assets/index-Bvu9zNsI.js` | js | 1820 | 2396 | 576 | 27.6 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1353→2201ms (61.4KB)

## /planos (API off, 5 execuções)

- **LCP mediano**: 1920 ms · **FCP mediano**: 1304 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-neutral-400 md:text-lg pl` — “Sua conta começa com 30 dias de teste do Pro completo, sem cartão. Depois, escolha Essenci” (327×104px)
- **Cadeia do elemento**: p.mx-auto.mt-4.max-w-xl → div.mx-auto.max-w-2xl.text-center → div.mx-auto.max-w-6xl → section#precos.px-6.pb-16.pt-32 → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-black
- **Estilo no paint**: opacity=1, visibility=visible, fonte 16px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1767 ms (471 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 4 ms · criação do elemento +1603 ms · renderização +129 ms
- **Divisão (mediana)**: TTFB 4 · elemento/recurso +1610 · render +129 ⇒ soma ≈ 1920 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/plans 1774→1870ms (Failed to fetch) [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/planos (document)` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 182 | 600 | 418 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 182 | 1180 | 998 | 144.3 |
| `/assets/PlansPage-CxOghkJF.js` | js | 1255 | 1502 | 247 | 5.3 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1256 | 1431 | 175 | 0.9 |
| `/assets/plansApi-D-yR2t0k.js` | js | 1256 | 1436 | 181 | 0.8 |
| `/assets/brand-DVsU9mFC.js` | js | 1256 | 1452 | 196 | 0.3 |
| `/assets/MarketingLayout-uQC4oP6-.js` | js | 1256 | 1488 | 232 | 3.8 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1257 | 1458 | 202 | 1 |
| `/assets/softwareApplicationLd-d6g1ScMe.js` | js | 1257 | 1595 | 338 | 1.2 |
| `/assets/formatters-qI0gGYoN.js` | js | 1257 | 1616 | 360 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1265 | 1645 | 380 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1269 | 2160 | 891 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1685 | 2460 | 775 | 34.9 |
| `/assets/PricingPersuasionCharts-D3K5fwcq.js` | js | 1698 | 1917 | 218 | 2.7 |
| `/assets/utils-DCADjnpI.js` | js | 1699 | 2103 | 404 | 8.8 |
| `/assets/BarChart-BZJPp71p.js` | js | 1699 | 2453 | 754 | 31.8 |
| `/assets/chart-8h-3QYTP.js` | js | 1699 | 2689 | 990 | 77.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1269→2160ms (61.4KB)

## /login (API off, 5 execuções)

- **LCP mediano**: 2132 ms · **FCP mediano**: 1304 ms · elemento estável em só 2 variações as execuções
- **Elemento LCP**: `<img>` classe `h-9 w-auto object-contain` — “” (173×36px)
- **Cadeia do elemento**: img.h-9.w-auto.object-contain → span.inline-flex.select-none → button.min-h-11.cursor-pointer.transition-transform → div.mb-6.flex.w-full → div.p-5.sm:p-8.flex → div.relative.w-full.max-w-lg
- **Estilo no paint**: opacity=1, visibility=visible, fonte 16px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1999 ms (695 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 4 ms · descoberta do recurso +1798 ms · download do recurso 329 ms · renderização +54 ms
- **Divisão (mediana)**: TTFB 4 · elemento/recurso +1859 · render +83 ⇒ soma ≈ 2132 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 3, 3, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/login (document)` | html | 0 | 156 | 156 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 173 | 1173 | 1000 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 174 | 599 | 426 | 27.7 |
| `/assets/LoginPage-quePmjLu.js` | js | 1250 | 1587 | 337 | 12.9 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1251 | 1437 | 186 | 0.9 |
| `/assets/PasswordInput-C8UD51ds.js` | js | 1251 | 1479 | 228 | 1.8 |
| `/assets/schemas-DqG_sY1H.js` | js | 1251 | 1494 | 243 | 3.5 |
| `/assets/index-BM4uwiVq.js` | js | 1251 | 1716 | 465 | 23 |
| `/assets/Toast-Bor8WHON.js` | js | 1252 | 1452 | 200 | 0.9 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1252 | 1617 | 365 | 0.9 |
| `/assets/recaptcha-CHjodRG9.js` | js | 1252 | 1644 | 392 | 0.4 |
| `/assets/plansApi-D-yR2t0k.js` | js | 1252 | 1666 | 414 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1252 | 1746 | 494 | 0.9 |
| `/assets/Card-BL0IQc_-.js` | js | 1253 | 1781 | 528 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1253 | 1831 | 578 | 1.2 |
| `/assets/Combination-CbLJj9Je.js` | js | 1253 | 1881 | 628 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1265 | 1903 | 637 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1270 | 2046 | 776 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1954 | 2282 | 329 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1270→2046ms (61.4KB)

## /cadastro (API off, 5 execuções)

- **LCP mediano**: 2096 ms · **FCP mediano**: 1304 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-2 max-w-sm text-center text-sm leading-relaxed text-text-muted` — “Crie sua conta em poucos minutos. Sem cartão e sem compromisso.” (296×45px)
- **Cadeia do elemento**: p.mt-2.max-w-sm.text-center → div.mb-6.flex.w-full → div.p-5.sm:p-8.flex → div.relative.w-full.max-w-lg → div.relative.flex.items-center → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2076 ms (704 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 5 ms · criação do elemento +1919 ms · renderização +52 ms
- **Divisão (mediana)**: TTFB 5 · elemento/recurso +1845 · render +55 ⇒ soma ≈ 2096 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/cadastro (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 175 | 594 | 419 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 175 | 1172 | 998 | 144.3 |
| `/assets/LoginPage-quePmjLu.js` | js | 1299 | 1652 | 353 | 12.9 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1300 | 1502 | 202 | 0.9 |
| `/assets/PasswordInput-C8UD51ds.js` | js | 1300 | 1552 | 251 | 1.8 |
| `/assets/schemas-DqG_sY1H.js` | js | 1300 | 1566 | 266 | 3.5 |
| `/assets/index-BM4uwiVq.js` | js | 1300 | 1781 | 481 | 23 |
| `/assets/Toast-Bor8WHON.js` | js | 1301 | 1523 | 223 | 0.9 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1301 | 1694 | 394 | 0.9 |
| `/assets/recaptcha-CHjodRG9.js` | js | 1301 | 1724 | 422 | 0.4 |
| `/assets/plansApi-D-yR2t0k.js` | js | 1301 | 1746 | 444 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1302 | 1817 | 516 | 0.9 |
| `/assets/Card-BL0IQc_-.js` | js | 1303 | 1852 | 548 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1304 | 1917 | 612 | 1.2 |
| `/assets/Combination-CbLJj9Je.js` | js | 1304 | 1980 | 676 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1323 | 1974 | 651 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1332 | 2110 | 778 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 2039 | 2367 | 329 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1332→2110ms (61.4KB)

## /queue (API off, 5 execuções)

- **LCP mediano**: 1996 ms · **FCP mediano**: 1464 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:mt-7 sm:text-lg xl` — “Fila pública com estimativa de espera, agendamento online e financeiro no mesmo painel. A ” (335×104px)
- **Cadeia do elemento**: p.mt-6.max-w-2xl.text-base → div.relative.z-20.max-w-3xl → div.relative.z-10.mx-auto → section.relative.flex.min-h-dvh → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-[#050706]
- **Estilo no paint**: opacity=1, visibility=visible, fonte 16px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1747 ms (307 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +1590 ms · renderização +249 ms
- **Divisão (mediana)**: TTFB 4 · elemento/recurso +1620 · render +249 ⇒ soma ≈ 1996 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 172 | 586 | 414 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 172 | 1165 | 994 | 144.3 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1253 | 1423 | 171 | 2.6 |
| `/assets/brand-DVsU9mFC.js` | js | 1284 | 1452 | 168 | 0.3 |
| `/assets/LandingPage-BVu77587.js` | js | 1284 | 1566 | 282 | 15.2 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1285 | 1466 | 181 | 0.9 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1285 | 1480 | 195 | 1 |
| `/assets/MarketingLayout-uQC4oP6-.js` | js | 1285 | 1509 | 224 | 3.8 |
| `/assets/softwareApplicationLd-d6g1ScMe.js` | js | 1286 | 1631 | 345 | 1.2 |
| `/assets/utils-DCADjnpI.js` | js | 1286 | 1644 | 359 | 8.8 |
| `/assets/weatherVisuals-BLxvLQ2x.js` | js | 1286 | 1652 | 367 | 1 |
| `/assets/reducedMotion-D9SWaqt8.js` | js | 1286 | 1674 | 388 | 0.4 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1402 | 2146 | 744 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1705 | 2346 | 640 | 34.9 |
| `/assets/ScrollTrigger-7Zy99s9Q.js` | js | 1752 | 2241 | 489 | 18.1 |
| `/assets/index-Bvu9zNsI.js` | js | 1752 | 2332 | 580 | 27.6 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1402→2146ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API off, 5 execuções)

- **LCP mediano**: 2228 ms · **FCP mediano**: 1304 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (327×40px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2243 ms (923 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +2079 ms · renderização +29 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2036 · render +29 ⇒ soma ≈ 2228 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=9a58b0bd-02a8-4c78-a35c-07d576dadf8c&status=all 1330→1358ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1346→1362ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1347→1364ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1348→1364ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1348→1365ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1348→1365ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1361→1369ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=9a58b0bd-02a8-4c78-a35c-07d576dadf8c&status=all 1527→1531ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2244→2247ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=9a58b0bd-02a8-4c78-a35c-07d576dadf8c&status=all 2689→2691ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=9a58b0bd-02a8-4c78-a35c-07d576dadf8c&status=all 3855→3857ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=9a58b0bd-02a8-4c78-a35c-07d576dadf8c&status=all 5020→5022ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=9a58b0bd-02a8-4c78-a35c-07d576dadf8c&status=all 6188→6195ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 181 | 601 | 420 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 181 | 1173 | 992 | 144.3 |
| `/assets/PublicHome-Bg-TZ1UR.js` | js | 1261 | 1573 | 313 | 8.6 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1262 | 1452 | 190 | 0.9 |
| `/assets/notificationsApi-CPUEgg9E.js` | js | 1262 | 1459 | 197 | 1 |
| `/assets/SmartSelect-CfvyeQPL.js` | js | 1262 | 1717 | 455 | 17.1 |
| `/assets/ThemedCalendar-BnMqKVkc.js` | js | 1262 | 1867 | 605 | 32.1 |
| `/assets/StatusBadge-CfeHwUKf.js` | js | 1263 | 1466 | 203 | 1.2 |
| `/assets/ConfirmDialog-JAjNKCs9.js` | js | 1263 | 1652 | 389 | 1.3 |
| `/assets/ModalShell-ChL48mVg.js` | js | 1263 | 1784 | 521 | 1.4 |
| `/assets/Combination-CbLJj9Je.js` | js | 1263 | 2017 | 754 | 7.4 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1264 | 1659 | 394 | 2.4 |
| `/assets/schemas-DqG_sY1H.js` | js | 1264 | 1955 | 692 | 3.5 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1264 | 1974 | 710 | 0.9 |
| `/assets/publicProductsApi-CukqZSLf.js` | js | 1264 | 2039 | 775 | 0.7 |
| `/assets/Toast-Bor8WHON.js` | js | 1264 | 2124 | 860 | 0.9 |
| `/assets/index-BM4uwiVq.js` | js | 1264 | 2195 | 931 | 23 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1275 | 2167 | 892 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1281 | 2288 | 1007 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1281→2288ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API off, 5 execuções)

- **LCP mediano**: 2240 ms · **FCP mediano**: 1328 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (327×40px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2202 ms (886 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2045 ms · renderização +30 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +2058 · render +29 ⇒ soma ≈ 2240 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2981c41a-cc51-4bdf-94f6-dcbd777387fa&status=all 1324→1336ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1327→1339ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1328→1340ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1328→1340ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1329→1340ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1329→1340ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1338→1343ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2981c41a-cc51-4bdf-94f6-dcbd777387fa&status=all 1502→1505ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2206→2209ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2981c41a-cc51-4bdf-94f6-dcbd777387fa&status=all 2661→2663ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2981c41a-cc51-4bdf-94f6-dcbd777387fa&status=all 3819→3825ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2981c41a-cc51-4bdf-94f6-dcbd777387fa&status=all 4985→4988ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2981c41a-cc51-4bdf-94f6-dcbd777387fa&status=all 6151→6156ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 181 | 1181 | 999 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 182 | 601 | 419 | 27.7 |
| `/assets/PublicHome-Bg-TZ1UR.js` | js | 1260 | 1566 | 306 | 8.6 |
| `/assets/notificationsApi-CPUEgg9E.js` | js | 1262 | 1438 | 176 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1262 | 1445 | 184 | 0.9 |
| `/assets/StatusBadge-CfeHwUKf.js` | js | 1262 | 1459 | 196 | 1.2 |
| `/assets/SmartSelect-CfvyeQPL.js` | js | 1262 | 1718 | 456 | 17.1 |
| `/assets/ThemedCalendar-BnMqKVkc.js` | js | 1262 | 1966 | 705 | 32.1 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1263 | 1630 | 367 | 2.4 |
| `/assets/ConfirmDialog-JAjNKCs9.js` | js | 1263 | 1646 | 383 | 1.3 |
| `/assets/ModalShell-ChL48mVg.js` | js | 1263 | 1738 | 475 | 1.4 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1263 | 1931 | 668 | 0.9 |
| `/assets/Combination-CbLJj9Je.js` | js | 1263 | 1954 | 691 | 7.4 |
| `/assets/schemas-DqG_sY1H.js` | js | 1263 | 1981 | 718 | 3.5 |
| `/assets/publicProductsApi-CukqZSLf.js` | js | 1263 | 2096 | 832 | 0.7 |
| `/assets/index-BM4uwiVq.js` | js | 1263 | 2154 | 891 | 23 |
| `/assets/Toast-Bor8WHON.js` | js | 1265 | 2124 | 859 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1275 | 2161 | 886 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1280 | 2282 | 1001 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1280→2282ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API off, 5 execuções)

- **LCP mediano**: 1696 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-lg font-bold` — “Não foi possível conectar ao servidor. Verifique se a API está no ar e tente de novo.” (327×84px)
- **Cadeia do elemento**: h1.text-lg.font-bold → div → div.mx-auto.flex.min-h-dvh → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 18px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1693 ms (373 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 4 ms · criação do elemento +1535 ms · renderização +19 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +1518 · render +19 ⇒ soma ≈ 1696 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1682→1688ms (Failed to fetch) [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 158 | 158 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 178 | 1172 | 994 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 179 | 594 | 415 | 27.7 |
| `/assets/PublicProductPage-CaFsS-0Y.js` | js | 1262 | 1502 | 240 | 3.4 |
| `/assets/index-BM4uwiVq.js` | js | 1262 | 1630 | 368 | 23 |
| `/assets/publicProductsApi-CukqZSLf.js` | js | 1263 | 1437 | 175 | 0.7 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1263 | 1467 | 204 | 0.9 |
| `/assets/StatusBadge-CfeHwUKf.js` | js | 1263 | 1474 | 211 | 1.2 |
| `/assets/schemas-DqG_sY1H.js` | js | 1263 | 1516 | 253 | 3.5 |
| `/assets/Field-DvrnQQDx.js` | js | 1263 | 1639 | 376 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1274 | 1667 | 392 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1281 | 1932 | 651 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1281→1932ms (61.4KB)

## / (API off, 5 execuções)

- **LCP mediano**: 2112 ms · **FCP mediano**: 1324 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:mt-7 sm:text-lg xl` — “Fila pública com estimativa de espera, agendamento online e financeiro no mesmo painel. A ” (608×98px)
- **Cadeia do elemento**: p.mt-6.max-w-2xl.text-base → div.relative.z-20.max-w-3xl → div.relative.z-10.mx-auto → section.relative.flex.min-h-dvh → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-[#050706]
- **Estilo no paint**: opacity=1, visibility=visible, fonte 20px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1727 ms (415 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +1562 ms · renderização +341 ms
- **Divisão (mediana)**: TTFB 4 · elemento/recurso +1577 · render +366 ⇒ soma ≈ 2112 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/ (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 173 | 593 | 420 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 173 | 1173 | 1001 | 144.3 |
| `/assets/LandingPage-BVu77587.js` | js | 1252 | 1609 | 357 | 15.2 |
| `/assets/brand-DVsU9mFC.js` | js | 1253 | 1423 | 170 | 0.3 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1254 | 1430 | 176 | 0.9 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1254 | 1451 | 197 | 1 |
| `/assets/MarketingLayout-uQC4oP6-.js` | js | 1254 | 1494 | 240 | 3.8 |
| `/assets/utils-DCADjnpI.js` | js | 1254 | 1559 | 304 | 8.8 |
| `/assets/softwareApplicationLd-d6g1ScMe.js` | js | 1254 | 1602 | 348 | 1.2 |
| `/assets/weatherVisuals-BLxvLQ2x.js` | js | 1254 | 1624 | 370 | 1 |
| `/assets/reducedMotion-D9SWaqt8.js` | js | 1255 | 1653 | 398 | 0.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1265 | 1731 | 466 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1269 | 2218 | 949 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1673 | 2471 | 798 | 34.9 |
| `/weather/sunny.jpg` | imagem | 1715 | 2474 | 759 | 29.4 |
| `/assets/index-Bvu9zNsI.js` | js | 1732 | 2459 | 726 | 27.6 |
| `/assets/ScrollTrigger-7Zy99s9Q.js` | js | 1733 | 2317 | 584 | 18.1 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1269→2218ms (61.4KB)

## /planos (API off, 5 execuções)

- **LCP mediano**: 1980 ms · **FCP mediano**: 1320 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl md:text-6xl planos-hero-rise` — “Teste grátis ou escolha o plano” (672×120px)
- **Cadeia do elemento**: h1.text-4xl.font-black.tracking-[-0.04em] → div.mx-auto.max-w-2xl.text-center → div.mx-auto.max-w-6xl → section#precos.px-6.pb-16.pt-32 → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-black
- **Estilo no paint**: opacity=1, visibility=visible, fonte 60px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1772 ms (464 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 5 ms · criação do elemento +1610 ms · renderização +184 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +1618 · render +195 ⇒ soma ≈ 1980 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/plans 1782→1900ms (Failed to fetch) [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/planos (document)` | html | 0 | 162 | 162 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 172 | 1178 | 1005 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 173 | 598 | 426 | 27.7 |
| `/assets/PlansPage-CxOghkJF.js` | js | 1256 | 1498 | 243 | 5.3 |
| `/assets/plansApi-D-yR2t0k.js` | js | 1257 | 1428 | 171 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1257 | 1450 | 192 | 0.9 |
| `/assets/MarketingLayout-uQC4oP6-.js` | js | 1257 | 1493 | 235 | 3.8 |
| `/assets/brand-DVsU9mFC.js` | js | 1258 | 1456 | 199 | 0.3 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1258 | 1462 | 205 | 1 |
| `/assets/softwareApplicationLd-d6g1ScMe.js` | js | 1258 | 1614 | 356 | 1.2 |
| `/assets/formatters-qI0gGYoN.js` | js | 1258 | 1628 | 370 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1269 | 1649 | 380 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1272 | 2151 | 879 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1688 | 2458 | 770 | 34.9 |
| `/assets/PricingPersuasionCharts-D3K5fwcq.js` | js | 1704 | 1914 | 210 | 2.7 |
| `/assets/utils-DCADjnpI.js` | js | 1704 | 2100 | 396 | 8.8 |
| `/assets/BarChart-BZJPp71p.js` | js | 1704 | 2450 | 746 | 31.8 |
| `/assets/chart-8h-3QYTP.js` | js | 1704 | 2687 | 983 | 77.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1272→2151ms (61.4KB)

## /login (API off, 5 execuções)

- **LCP mediano**: 2104 ms · **FCP mediano**: 1292 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `font-sans text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight` — “Seu salão, no controle.” (592×52px)
- **Cadeia do elemento**: p.font-sans.text-4xl.xl:text-5xl → div → div.flex-1.flex.flex-col → div.relative.z-10.flex → div.relative.hidden.lg:flex → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 48px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2006 ms (706 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 13 ms · criação do elemento +1843 ms · renderização +114 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +1829 · render +114 ⇒ soma ≈ 2104 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 3, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/login (document)` | html | 0 | 163 | 163 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 173 | 593 | 420 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 173 | 1172 | 1000 | 144.3 |
| `/assets/schemas-DqG_sY1H.js` | js | 1249 | 1500 | 251 | 3.5 |
| `/assets/LoginPage-quePmjLu.js` | js | 1249 | 1586 | 337 | 12.9 |
| `/assets/index-BM4uwiVq.js` | js | 1249 | 1715 | 466 | 23 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1250 | 1436 | 186 | 0.9 |
| `/assets/Toast-Bor8WHON.js` | js | 1250 | 1458 | 208 | 0.9 |
| `/assets/PasswordInput-C8UD51ds.js` | js | 1250 | 1487 | 237 | 1.8 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1250 | 1629 | 379 | 0.9 |
| `/assets/recaptcha-CHjodRG9.js` | js | 1250 | 1659 | 409 | 0.4 |
| `/assets/plansApi-D-yR2t0k.js` | js | 1251 | 1672 | 421 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1251 | 1750 | 499 | 0.9 |
| `/assets/Card-BL0IQc_-.js` | js | 1251 | 1794 | 543 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1251 | 1837 | 586 | 1.2 |
| `/assets/Combination-CbLJj9Je.js` | js | 1251 | 1916 | 664 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1262 | 1901 | 639 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1266 | 2044 | 778 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1976 | 2302 | 326 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1266→2044ms (61.4KB)

## /cadastro (API off, 5 execuções)

- **LCP mediano**: 2200 ms · **FCP mediano**: 1292 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `font-sans text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight` — “Seu salão, no controle.” (592×52px)
- **Cadeia do elemento**: p.font-sans.text-4xl.xl:text-5xl → div → div.flex-1.flex.flex-col → div.relative.z-10.flex → div.relative.hidden.lg:flex → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 48px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1996 ms (704 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +1840 ms · renderização +212 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +1832 · render +203 ⇒ soma ≈ 2200 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 3
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/cadastro (document)` | html | 0 | 156 | 156 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 166 | 594 | 428 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 166 | 1165 | 1000 | 144.3 |
| `/assets/LoginPage-quePmjLu.js` | js | 1239 | 1573 | 334 | 12.9 |
| `/assets/index-BM4uwiVq.js` | js | 1239 | 1703 | 463 | 23 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1240 | 1415 | 175 | 0.9 |
| `/assets/Toast-Bor8WHON.js` | js | 1240 | 1445 | 205 | 0.9 |
| `/assets/PasswordInput-C8UD51ds.js` | js | 1240 | 1473 | 233 | 1.8 |
| `/assets/schemas-DqG_sY1H.js` | js | 1240 | 1487 | 247 | 3.5 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1240 | 1616 | 375 | 0.9 |
| `/assets/recaptcha-CHjodRG9.js` | js | 1240 | 1645 | 404 | 0.4 |
| `/assets/plansApi-D-yR2t0k.js` | js | 1241 | 1660 | 419 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1241 | 1731 | 490 | 0.9 |
| `/assets/Card-BL0IQc_-.js` | js | 1241 | 1773 | 532 | 0.5 |
| `/assets/Combination-CbLJj9Je.js` | js | 1241 | 1903 | 662 | 7.4 |
| `/assets/formatters-qI0gGYoN.js` | js | 1242 | 1831 | 589 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1250 | 1889 | 639 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1254 | 2031 | 777 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1963 | 2281 | 318 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1254→2031ms (61.4KB)

## /queue (API off, 5 execuções)

- **LCP mediano**: 2036 ms · **FCP mediano**: 1424 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:mt-7 sm:text-lg xl` — “Fila pública com estimativa de espera, agendamento online e financeiro no mesmo painel. A ” (608×98px)
- **Cadeia do elemento**: p.mt-6.max-w-2xl.text-base → div.relative.z-20.max-w-3xl → div.relative.z-10.mx-auto → section.relative.flex.min-h-dvh → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-[#050706]
- **Estilo no paint**: opacity=1, visibility=visible, fonte 20px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1724 ms (300 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 4 ms · criação do elemento +1568 ms · renderização +324 ms
- **Divisão (mediana)**: TTFB 4 · elemento/recurso +1566 · render +311 ⇒ soma ≈ 2036 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue (document)` | html | 0 | 156 | 156 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 163 | 1165 | 1002 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 164 | 586 | 422 | 27.7 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1246 | 1416 | 171 | 2.6 |
| `/assets/LandingPage-BVu77587.js` | js | 1274 | 1551 | 277 | 15.2 |
| `/assets/brand-DVsU9mFC.js` | js | 1275 | 1437 | 161 | 0.3 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1275 | 1451 | 176 | 0.9 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1275 | 1466 | 190 | 1 |
| `/assets/MarketingLayout-uQC4oP6-.js` | js | 1275 | 1488 | 213 | 3.8 |
| `/assets/utils-DCADjnpI.js` | js | 1275 | 1666 | 391 | 8.8 |
| `/assets/softwareApplicationLd-d6g1ScMe.js` | js | 1276 | 1615 | 339 | 1.2 |
| `/assets/weatherVisuals-BLxvLQ2x.js` | js | 1277 | 1638 | 362 | 1 |
| `/assets/reducedMotion-D9SWaqt8.js` | js | 1277 | 1658 | 382 | 0.4 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1389 | 2175 | 786 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1691 | 2339 | 647 | 34.9 |
| `/assets/index-Bvu9zNsI.js` | js | 1729 | 2318 | 589 | 27.6 |
| `/assets/ScrollTrigger-7Zy99s9Q.js` | js | 1730 | 2239 | 509 | 18.1 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1389→2175ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API off, 5 execuções)

- **LCP mediano**: 2204 ms · **FCP mediano**: 1296 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (377×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2191 ms (887 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 5 ms · criação do elemento +2026 ms · renderização +17 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2027 · render +18 ⇒ soma ≈ 2204 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=7af38df2-a527-4981-83c0-cc5d6af464d7&status=all 1314→1345ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1328→1350ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1330→1351ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1330→1351ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1330→1351ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1331→1353ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1349→1356ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=7af38df2-a527-4981-83c0-cc5d6af464d7&status=all 1511→1515ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2190→2210ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=7af38df2-a527-4981-83c0-cc5d6af464d7&status=all 2674→2676ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=7af38df2-a527-4981-83c0-cc5d6af464d7&status=all 3833→3835ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=7af38df2-a527-4981-83c0-cc5d6af464d7&status=all 4991→5001ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=7af38df2-a527-4981-83c0-cc5d6af464d7&status=all 6151→6153ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 174 | 593 | 419 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 174 | 1172 | 999 | 144.3 |
| `/assets/PublicHome-Bg-TZ1UR.js` | js | 1249 | 1558 | 309 | 8.6 |
| `/assets/notificationsApi-CPUEgg9E.js` | js | 1250 | 1437 | 187 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1250 | 1445 | 195 | 0.9 |
| `/assets/StatusBadge-CfeHwUKf.js` | js | 1250 | 1459 | 209 | 1.2 |
| `/assets/ConfirmDialog-JAjNKCs9.js` | js | 1250 | 1645 | 395 | 1.3 |
| `/assets/SmartSelect-CfvyeQPL.js` | js | 1250 | 1709 | 459 | 17.1 |
| `/assets/ModalShell-ChL48mVg.js` | js | 1250 | 1730 | 480 | 1.4 |
| `/assets/ThemedCalendar-BnMqKVkc.js` | js | 1250 | 1909 | 659 | 32.1 |
| `/assets/Combination-CbLJj9Je.js` | js | 1251 | 1960 | 709 | 7.4 |
| `/assets/index-BM4uwiVq.js` | js | 1251 | 2144 | 893 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1252 | 1637 | 385 | 2.4 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1252 | 1917 | 665 | 0.9 |
| `/assets/schemas-DqG_sY1H.js` | js | 1252 | 1966 | 714 | 3.5 |
| `/assets/publicProductsApi-CukqZSLf.js` | js | 1252 | 2074 | 822 | 0.7 |
| `/assets/Toast-Bor8WHON.js` | js | 1252 | 2096 | 844 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1263 | 2152 | 889 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1269 | 2274 | 1005 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1269→2274ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API off, 5 execuções)

- **LCP mediano**: 2204 ms · **FCP mediano**: 1300 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (377×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2183 ms (891 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2026 ms · renderização +21 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2029 · render +21 ⇒ soma ≈ 2204 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=cea4ebae-cbe0-40c1-8f57-4e2d6988bcc6&status=all 1298→1305ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1300→1311ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1301→1311ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1301→1311ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1301→1311ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1301→1311ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1307→1312ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=cea4ebae-cbe0-40c1-8f57-4e2d6988bcc6&status=all 1474→1476ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2187→2199ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=cea4ebae-cbe0-40c1-8f57-4e2d6988bcc6&status=all 2632→2634ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=cea4ebae-cbe0-40c1-8f57-4e2d6988bcc6&status=all 3790→3793ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=cea4ebae-cbe0-40c1-8f57-4e2d6988bcc6&status=all 4949→4950ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=cea4ebae-cbe0-40c1-8f57-4e2d6988bcc6&status=all 6108→6111ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 164 | 1165 | 1002 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 165 | 586 | 422 | 27.7 |
| `/assets/PublicHome-Bg-TZ1UR.js` | js | 1241 | 1545 | 304 | 8.6 |
| `/assets/notificationsApi-CPUEgg9E.js` | js | 1242 | 1417 | 175 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1242 | 1424 | 181 | 0.9 |
| `/assets/StatusBadge-CfeHwUKf.js` | js | 1242 | 1445 | 203 | 1.2 |
| `/assets/SmartSelect-CfvyeQPL.js` | js | 1242 | 1695 | 452 | 17.1 |
| `/assets/ThemedCalendar-BnMqKVkc.js` | js | 1242 | 1932 | 690 | 32.1 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1243 | 1617 | 374 | 2.4 |
| `/assets/ConfirmDialog-JAjNKCs9.js` | js | 1243 | 1632 | 389 | 1.3 |
| `/assets/ModalShell-ChL48mVg.js` | js | 1243 | 1717 | 475 | 1.4 |
| `/assets/schemas-DqG_sY1H.js` | js | 1243 | 1953 | 710 | 3.5 |
| `/assets/Combination-CbLJj9Je.js` | js | 1243 | 1960 | 717 | 7.4 |
| `/assets/index-BM4uwiVq.js` | js | 1243 | 2138 | 895 | 23 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1244 | 1911 | 667 | 0.9 |
| `/assets/publicProductsApi-CukqZSLf.js` | js | 1244 | 2082 | 839 | 0.7 |
| `/assets/Toast-Bor8WHON.js` | js | 1244 | 2103 | 859 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1253 | 2145 | 892 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1257 | 2259 | 1002 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1257→2259ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API off, 5 execuções)

- **LCP mediano**: 1684 ms · **FCP mediano**: 1292 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-lg font-bold` — “Não foi possível conectar ao servidor. Verifique se a API está no ar e tente de novo.” (400×56px)
- **Cadeia do elemento**: h1.text-lg.font-bold → div → div.mx-auto.flex.min-h-dvh → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 18px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1662 ms (378 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1504 ms · renderização +22 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1504 · render +23 ⇒ soma ≈ 1684 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1655→1659ms (Failed to fetch) [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 158 | 158 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 165 | 587 | 422 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 165 | 1166 | 1001 | 144.3 |
| `/assets/PublicProductPage-CaFsS-0Y.js` | js | 1240 | 1489 | 249 | 3.4 |
| `/assets/publicProductsApi-CukqZSLf.js` | js | 1241 | 1409 | 168 | 0.7 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1241 | 1431 | 190 | 0.9 |
| `/assets/StatusBadge-CfeHwUKf.js` | js | 1241 | 1446 | 205 | 1.2 |
| `/assets/schemas-DqG_sY1H.js` | js | 1241 | 1473 | 232 | 3.5 |
| `/assets/Field-DvrnQQDx.js` | js | 1241 | 1596 | 355 | 1.2 |
| `/assets/index-BM4uwiVq.js` | js | 1241 | 1609 | 368 | 23 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1250 | 1631 | 382 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1253 | 1902 | 649 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1253→1902ms (61.4KB)

## / (API real, 5 execuções)

- **LCP mediano**: 1920 ms · **FCP mediano**: 1296 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:mt-7 sm:text-lg xl` — “Fila pública com estimativa de espera, agendamento online e financeiro no mesmo painel. A ” (335×104px)
- **Cadeia do elemento**: p.mt-6.max-w-2xl.text-base → div.relative.z-20.max-w-3xl → div.relative.z-10.mx-auto → section.relative.flex.min-h-dvh → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-[#050706]
- **Estilo no paint**: opacity=1, visibility=visible, fonte 16px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1703 ms (403 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1546 ms · renderização +177 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1553 · render +208 ⇒ soma ≈ 1920 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/ (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 179 | 593 | 414 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 179 | 1173 | 995 | 144.3 |
| `/assets/brand-DVsU9mFC.js` | js | 1249 | 1410 | 161 | 0.3 |
| `/assets/LandingPage-BVu77587.js` | js | 1249 | 1588 | 339 | 15.2 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1250 | 1415 | 166 | 0.9 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1250 | 1430 | 180 | 1 |
| `/assets/MarketingLayout-uQC4oP6-.js` | js | 1250 | 1473 | 223 | 3.8 |
| `/assets/utils-DCADjnpI.js` | js | 1250 | 1545 | 295 | 8.8 |
| `/assets/softwareApplicationLd-d6g1ScMe.js` | js | 1250 | 1580 | 330 | 1.2 |
| `/assets/weatherVisuals-BLxvLQ2x.js` | js | 1250 | 1602 | 351 | 1 |
| `/assets/reducedMotion-D9SWaqt8.js` | js | 1251 | 1630 | 379 | 0.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1261 | 1723 | 462 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1267 | 2175 | 908 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1647 | 2310 | 664 | 34.9 |
| `/assets/index-Bvu9zNsI.js` | js | 1707 | 2304 | 596 | 27.6 |
| `/assets/ScrollTrigger-7Zy99s9Q.js` | js | 1708 | 2210 | 503 | 18.1 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1267→2175ms (61.4KB)

## /planos (API real, 5 execuções)

- **LCP mediano**: 1868 ms · **FCP mediano**: 1300 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-neutral-400 md:text-lg pl` — “Sua conta começa com 30 dias de teste do Pro completo, sem cartão. Depois, escolha Essenci” (327×104px)
- **Cadeia do elemento**: p.mx-auto.mt-4.max-w-xl → div.mx-auto.max-w-2xl.text-center → div.mx-auto.max-w-6xl → section#precos.px-6.pb-16.pt-32 → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-black
- **Estilo no paint**: opacity=1, visibility=visible, fonte 16px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1771 ms (467 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1607 ms · renderização +137 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1603 · render +112 ⇒ soma ≈ 1868 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/plans 1777→2076ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/planos (document)` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 181 | 1179 | 998 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 182 | 607 | 425 | 27.7 |
| `/assets/plansApi-D-yR2t0k.js` | js | 1257 | 1415 | 158 | 0.8 |
| `/assets/MarketingLayout-uQC4oP6-.js` | js | 1257 | 1473 | 215 | 3.8 |
| `/assets/PlansPage-CxOghkJF.js` | js | 1257 | 1487 | 230 | 5.3 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1258 | 1423 | 165 | 0.9 |
| `/assets/brand-DVsU9mFC.js` | js | 1258 | 1437 | 179 | 0.3 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1258 | 1452 | 194 | 1 |
| `/assets/softwareApplicationLd-d6g1ScMe.js` | js | 1258 | 1587 | 329 | 1.2 |
| `/assets/formatters-qI0gGYoN.js` | js | 1259 | 1601 | 342 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1267 | 1631 | 364 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1271 | 2217 | 946 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1656 | 2461 | 805 | 34.9 |
| `/assets/PricingPersuasionCharts-D3K5fwcq.js` | js | 1669 | 1882 | 212 | 2.7 |
| `/assets/utils-DCADjnpI.js` | js | 1670 | 2066 | 396 | 8.8 |
| `/assets/BarChart-BZJPp71p.js` | js | 1670 | 2452 | 782 | 31.8 |
| `/assets/chart-8h-3QYTP.js` | js | 1670 | 2689 | 1019 | 77.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1271→2217ms (61.4KB)

## /login (API real, 5 execuções)

- **LCP mediano**: 2296 ms · **FCP mediano**: 1300 ms · elemento estável em só 2 variações as execuções
- **Elemento LCP**: `<img>` classe `h-9 w-auto object-contain` — “” (173×36px)
- **Cadeia do elemento**: img.h-9.w-auto.object-contain → span.inline-flex.select-none → button.min-h-11.cursor-pointer.transition-transform → div.mb-6.flex.w-full → div.p-5.sm:p-8.flex → div.relative.w-full.max-w-lg
- **Estilo no paint**: opacity=1, visibility=visible, fonte 16px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1975 ms (687 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · descoberta do recurso +1784 ms · download do recurso 326 ms · renderização +29 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1797 · render +57 ⇒ soma ≈ 2296 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 3, 3, 2, 3, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/login (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 173 | 586 | 413 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 173 | 1165 | 993 | 144.3 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1241 | 1409 | 167 | 0.9 |
| `/assets/PasswordInput-C8UD51ds.js` | js | 1241 | 1466 | 225 | 1.8 |
| `/assets/schemas-DqG_sY1H.js` | js | 1241 | 1480 | 239 | 3.5 |
| `/assets/LoginPage-quePmjLu.js` | js | 1241 | 1567 | 326 | 12.9 |
| `/assets/index-BM4uwiVq.js` | js | 1241 | 1702 | 461 | 23 |
| `/assets/Toast-Bor8WHON.js` | js | 1242 | 1438 | 196 | 0.9 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1242 | 1609 | 367 | 0.9 |
| `/assets/recaptcha-CHjodRG9.js` | js | 1242 | 1632 | 390 | 0.4 |
| `/assets/plansApi-D-yR2t0k.js` | js | 1242 | 1653 | 410 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1242 | 1731 | 488 | 0.9 |
| `/assets/Card-BL0IQc_-.js` | js | 1243 | 1774 | 532 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1243 | 1824 | 581 | 1.2 |
| `/assets/Combination-CbLJj9Je.js` | js | 1243 | 1882 | 639 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1252 | 1896 | 644 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1256 | 2025 | 769 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1941 | 2267 | 326 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1256→2025ms (61.4KB)

## /cadastro (API real, 5 execuções)

- **LCP mediano**: 2056 ms · **FCP mediano**: 1296 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-2 max-w-sm text-center text-sm leading-relaxed text-text-muted` — “Crie sua conta em poucos minutos. Sem cartão e sem compromisso.” (298×45px)
- **Cadeia do elemento**: p.mt-2.max-w-sm.text-center → div.mb-6.flex.w-full → div.p-5.sm:p-8.flex → div.relative.w-full.max-w-lg → div.relative.flex.items-center → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1977 ms (685 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1820 ms · renderização +131 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1820 · render +80 ⇒ soma ≈ 2056 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/cadastro (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 173 | 1174 | 1000 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 174 | 600 | 427 | 27.7 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1249 | 1409 | 160 | 0.9 |
| `/assets/schemas-DqG_sY1H.js` | js | 1249 | 1480 | 231 | 3.5 |
| `/assets/LoginPage-quePmjLu.js` | js | 1249 | 1581 | 333 | 12.9 |
| `/assets/index-BM4uwiVq.js` | js | 1249 | 1709 | 460 | 23 |
| `/assets/Toast-Bor8WHON.js` | js | 1250 | 1424 | 174 | 0.9 |
| `/assets/PasswordInput-C8UD51ds.js` | js | 1250 | 1460 | 210 | 1.8 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1250 | 1594 | 345 | 0.9 |
| `/assets/recaptcha-CHjodRG9.js` | js | 1250 | 1631 | 381 | 0.4 |
| `/assets/plansApi-D-yR2t0k.js` | js | 1250 | 1653 | 403 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1251 | 1745 | 494 | 0.9 |
| `/assets/Card-BL0IQc_-.js` | js | 1251 | 1759 | 508 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1251 | 1823 | 572 | 1.2 |
| `/assets/Combination-CbLJj9Je.js` | js | 1251 | 1874 | 623 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1260 | 1896 | 636 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1263 | 2031 | 768 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1940 | 2259 | 320 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1263→2031ms (61.4KB)

## /queue (API real, 5 execuções)

- **LCP mediano**: 1944 ms · **FCP mediano**: 1428 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:mt-7 sm:text-lg xl` — “Fila pública com estimativa de espera, agendamento online e financeiro no mesmo painel. A ” (335×104px)
- **Cadeia do elemento**: p.mt-6.max-w-2xl.text-base → div.relative.z-20.max-w-3xl → div.relative.z-10.mx-auto → section.relative.flex.min-h-dvh → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-[#050706]
- **Estilo no paint**: opacity=1, visibility=visible, fonte 16px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1738 ms (290 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1581 ms · renderização +222 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1581 · render +205 ⇒ soma ≈ 1944 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 177 | 594 | 417 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 177 | 1173 | 997 | 144.3 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1258 | 1424 | 166 | 2.6 |
| `/assets/LandingPage-BVu77587.js` | js | 1290 | 1559 | 269 | 15.2 |
| `/assets/brand-DVsU9mFC.js` | js | 1291 | 1452 | 162 | 0.3 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1291 | 1466 | 174 | 0.9 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1291 | 1473 | 182 | 1 |
| `/assets/MarketingLayout-uQC4oP6-.js` | js | 1291 | 1503 | 212 | 3.8 |
| `/assets/softwareApplicationLd-d6g1ScMe.js` | js | 1292 | 1631 | 339 | 1.2 |
| `/assets/weatherVisuals-BLxvLQ2x.js` | js | 1292 | 1644 | 352 | 1 |
| `/assets/utils-DCADjnpI.js` | js | 1292 | 1660 | 368 | 8.8 |
| `/assets/reducedMotion-D9SWaqt8.js` | js | 1292 | 1674 | 382 | 0.4 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1407 | 2188 | 781 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1691 | 2346 | 656 | 34.9 |
| `/assets/ScrollTrigger-7Zy99s9Q.js` | js | 1744 | 2239 | 496 | 18.1 |
| `/assets/index-Bvu9zNsI.js` | js | 1744 | 2331 | 587 | 27.6 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1407→2188ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API real, 5 execuções)

- **LCP mediano**: 2376 ms · **FCP mediano**: 1304 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary leading-relaxed` — “O salão está tranquilo agora. Ótimo momento para chegar e ser atendido(a) sem espera.” (245×68px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.leading-relaxed → div.rounded-xl.bg-bg/80.border → div.relative.pl-5.pr-5 → div.mb-6.relative.overflow-hidden → main.max-w-md.sm:max-w-xl.md:max-w-3xl → div.min-h-dvh.pb-[max(5rem,env(safe-area-inset-bottom))].bg-bg
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2331 ms (1027 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2174 ms · renderização +65 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2174 · render +36 ⇒ soma ≈ 2376 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e90e1f15-d623-48c4-97a3-f3628b3ed3a5&status=all 1311→1489ms (signal is aborted without reason) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1314→2179ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1315→2226ms status 200 [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1315→2248ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1316→2290ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1316→2305ms status 200 [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1490→2319ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e90e1f15-d623-48c4-97a3-f3628b3ed3a5&status=all 1488→2382ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2193→2411ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e90e1f15-d623-48c4-97a3-f3628b3ed3a5&status=all 2654→2820ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e90e1f15-d623-48c4-97a3-f3628b3ed3a5&status=all 3812→3970ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e90e1f15-d623-48c4-97a3-f3628b3ed3a5&status=all 4971→5128ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 174 | 1172 | 998 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 175 | 594 | 419 | 27.7 |
| `/assets/PublicHome-Bg-TZ1UR.js` | js | 1252 | 1545 | 293 | 8.6 |
| `/assets/notificationsApi-CPUEgg9E.js` | js | 1253 | 1423 | 171 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1253 | 1431 | 178 | 0.9 |
| `/assets/StatusBadge-CfeHwUKf.js` | js | 1253 | 1445 | 192 | 1.2 |
| `/assets/ConfirmDialog-JAjNKCs9.js` | js | 1253 | 1631 | 378 | 1.3 |
| `/assets/SmartSelect-CfvyeQPL.js` | js | 1253 | 1695 | 443 | 17.1 |
| `/assets/ThemedCalendar-BnMqKVkc.js` | js | 1253 | 1895 | 642 | 32.1 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1254 | 1624 | 369 | 2.4 |
| `/assets/ModalShell-ChL48mVg.js` | js | 1254 | 1716 | 463 | 1.4 |
| `/assets/schemas-DqG_sY1H.js` | js | 1254 | 1952 | 698 | 3.5 |
| `/assets/Combination-CbLJj9Je.js` | js | 1254 | 1960 | 706 | 7.4 |
| `/assets/index-BM4uwiVq.js` | js | 1254 | 2131 | 877 | 23 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1255 | 1910 | 656 | 0.9 |
| `/assets/publicProductsApi-CukqZSLf.js` | js | 1255 | 2061 | 806 | 0.7 |
| `/assets/Toast-Bor8WHON.js` | js | 1255 | 2081 | 827 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1266 | 2145 | 879 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1270 | 2295 | 1026 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1270→2295ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API real, 5 execuções)

- **LCP mediano**: 1308 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary` — “Carregando...” (88×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary → div.flex.flex-col.items-center → div.flex.items-center.justify-center → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1273 ms (antes/do FCP)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +1116 ms · renderização +39 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1112 · render +39 ⇒ soma ≈ 1308 ms
- **Depende de JS**: elemento criado após FCP em 0/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=51f5e9dc-3e29-49ff-b1e6-6c1b6d70d4a5&status=all 1318→1496ms (signal is aborted without reason) [depois do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1323→2181ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1324→2246ms status 200 [depois do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1325→2260ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1325→2298ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1325→2311ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1500→2319ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=51f5e9dc-3e29-49ff-b1e6-6c1b6d70d4a5&status=all 1495→2444ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2194→2445ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 2380→2539ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2381→2576ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=51f5e9dc-3e29-49ff-b1e6-6c1b6d70d4a5&status=all 2660→2818ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=51f5e9dc-3e29-49ff-b1e6-6c1b6d70d4a5&status=all 3819→3978ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=51f5e9dc-3e29-49ff-b1e6-6c1b6d70d4a5&status=all 4978→5135ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 175 | 593 | 418 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 175 | 1173 | 997 | 144.3 |
| `/assets/PublicHome-Bg-TZ1UR.js` | js | 1259 | 1552 | 292 | 8.6 |
| `/assets/notificationsApi-CPUEgg9E.js` | js | 1260 | 1423 | 163 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1260 | 1438 | 178 | 0.9 |
| `/assets/StatusBadge-CfeHwUKf.js` | js | 1260 | 1444 | 184 | 1.2 |
| `/assets/SmartSelect-CfvyeQPL.js` | js | 1260 | 1702 | 441 | 17.1 |
| `/assets/ThemedCalendar-BnMqKVkc.js` | js | 1260 | 1952 | 692 | 32.1 |
| `/assets/ConfirmDialog-JAjNKCs9.js` | js | 1261 | 1623 | 363 | 1.3 |
| `/assets/ModalShell-ChL48mVg.js` | js | 1261 | 1724 | 463 | 1.4 |
| `/assets/Combination-CbLJj9Je.js` | js | 1261 | 1938 | 677 | 7.4 |
| `/assets/schemas-DqG_sY1H.js` | js | 1261 | 1966 | 705 | 3.5 |
| `/assets/index-BM4uwiVq.js` | js | 1261 | 2132 | 871 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1262 | 1610 | 348 | 2.4 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1262 | 1917 | 654 | 0.9 |
| `/assets/publicProductsApi-CukqZSLf.js` | js | 1262 | 2082 | 820 | 0.7 |
| `/assets/Toast-Bor8WHON.js` | js | 1262 | 2103 | 840 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1272 | 2153 | 880 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1278 | 2304 | 1026 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1278→2304ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API real, 5 execuções)

- **LCP mediano**: 1876 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-xl font-bold` — “Produto Sintetico 01” (191×28px)
- **Cadeia do elemento**: h1.text-xl.font-bold → div.flex.flex-wrap.items-center → div.rounded-2xl.border.border-border → main.mx-auto.max-w-md.px-4 → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 20px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1856 ms (544 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1700 ms · renderização +40 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +1678 · render +38 ⇒ soma ≈ 1876 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1675→1839ms status 200 [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 156 | 156 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 179 | 1173 | 995 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 180 | 594 | 414 | 27.7 |
| `/assets/PublicProductPage-CaFsS-0Y.js` | js | 1255 | 1480 | 224 | 3.4 |
| `/assets/index-BM4uwiVq.js` | js | 1255 | 1623 | 367 | 23 |
| `/assets/publicProductsApi-CukqZSLf.js` | js | 1256 | 1415 | 159 | 0.7 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1256 | 1437 | 181 | 0.9 |
| `/assets/schemas-DqG_sY1H.js` | js | 1256 | 1487 | 231 | 3.5 |
| `/assets/StatusBadge-CfeHwUKf.js` | js | 1257 | 1444 | 188 | 1.2 |
| `/assets/Field-DvrnQQDx.js` | js | 1257 | 1602 | 346 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1269 | 1638 | 369 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1274 | 1917 | 643 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1274→1917ms (61.4KB)

## / (API real, 5 execuções)

- **LCP mediano**: 1988 ms · **FCP mediano**: 1288 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:mt-7 sm:text-lg xl` — “Fila pública com estimativa de espera, agendamento online e financeiro no mesmo painel. A ” (608×98px)
- **Cadeia do elemento**: p.mt-6.max-w-2xl.text-base → div.relative.z-20.max-w-3xl → div.relative.z-10.mx-auto → section.relative.flex.min-h-dvh → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-[#050706]
- **Estilo no paint**: opacity=1, visibility=visible, fonte 20px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1709 ms (409 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1552 ms · renderização +363 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1544 · render +294 ⇒ soma ≈ 1988 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/ (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 165 | 586 | 421 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 165 | 1165 | 1000 | 144.3 |
| `/assets/brand-DVsU9mFC.js` | js | 1249 | 1409 | 159 | 0.3 |
| `/assets/LandingPage-BVu77587.js` | js | 1249 | 1574 | 325 | 15.2 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1250 | 1423 | 173 | 0.9 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1250 | 1430 | 180 | 1 |
| `/assets/MarketingLayout-uQC4oP6-.js` | js | 1250 | 1473 | 223 | 3.8 |
| `/assets/utils-DCADjnpI.js` | js | 1250 | 1538 | 288 | 8.8 |
| `/assets/softwareApplicationLd-d6g1ScMe.js` | js | 1250 | 1588 | 338 | 1.2 |
| `/assets/weatherVisuals-BLxvLQ2x.js` | js | 1250 | 1602 | 352 | 1 |
| `/assets/reducedMotion-D9SWaqt8.js` | js | 1251 | 1631 | 380 | 0.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1260 | 1716 | 456 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1265 | 2131 | 866 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1650 | 2304 | 654 | 34.9 |
| `/assets/index-Bvu9zNsI.js` | js | 1713 | 2296 | 583 | 27.6 |
| `/assets/ScrollTrigger-7Zy99s9Q.js` | js | 1714 | 2202 | 488 | 18.1 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1265→2131ms (61.4KB)

## /planos (API real, 5 execuções)

- **LCP mediano**: 1904 ms · **FCP mediano**: 1280 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl md:text-6xl planos-hero-rise` — “Teste grátis ou escolha o plano” (672×120px)
- **Cadeia do elemento**: h1.text-4xl.font-black.tracking-[-0.04em] → div.mx-auto.max-w-2xl.text-center → div.mx-auto.max-w-6xl → section#precos.px-6.pb-16.pt-32 → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-black
- **Estilo no paint**: opacity=1, visibility=visible, fonte 60px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1751 ms (471 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1594 ms · renderização +165 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1594 · render +153 ⇒ soma ≈ 1904 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/plans 1757→2042ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/planos (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 162 | 1159 | 996 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 163 | 587 | 423 | 27.7 |
| `/assets/PlansPage-CxOghkJF.js` | js | 1236 | 1465 | 229 | 5.3 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1237 | 1395 | 158 | 0.9 |
| `/assets/brand-DVsU9mFC.js` | js | 1237 | 1401 | 164 | 0.3 |
| `/assets/plansApi-D-yR2t0k.js` | js | 1237 | 1410 | 173 | 0.8 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1237 | 1430 | 193 | 1 |
| `/assets/MarketingLayout-uQC4oP6-.js` | js | 1237 | 1451 | 214 | 3.8 |
| `/assets/softwareApplicationLd-d6g1ScMe.js` | js | 1238 | 1560 | 323 | 1.2 |
| `/assets/formatters-qI0gGYoN.js` | js | 1238 | 1574 | 336 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1247 | 1603 | 356 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1251 | 2217 | 966 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1625 | 2447 | 822 | 34.9 |
| `/assets/PricingPersuasionCharts-D3K5fwcq.js` | js | 1637 | 1845 | 209 | 2.7 |
| `/assets/chart-8h-3QYTP.js` | js | 1637 | 2667 | 1030 | 77.9 |
| `/assets/utils-DCADjnpI.js` | js | 1638 | 2046 | 408 | 8.8 |
| `/assets/BarChart-BZJPp71p.js` | js | 1638 | 2425 | 787 | 31.8 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1251→2217ms (61.4KB)

## /login (API real, 5 execuções)

- **LCP mediano**: 2108 ms · **FCP mediano**: 1288 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `font-sans text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight` — “Seu salão, no controle.” (592×52px)
- **Cadeia do elemento**: p.font-sans.text-4xl.xl:text-5xl → div → div.flex-1.flex.flex-col → div.relative.z-10.flex → div.relative.hidden.lg:flex → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 48px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1972 ms (684 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1815 ms · renderização +168 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1815 · render +119 ⇒ soma ≈ 2108 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 3, 3, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/login (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 164 | 1158 | 994 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 165 | 579 | 414 | 27.7 |
| `/assets/schemas-DqG_sY1H.js` | js | 1235 | 1467 | 232 | 3.5 |
| `/assets/LoginPage-quePmjLu.js` | js | 1235 | 1559 | 324 | 12.9 |
| `/assets/index-BM4uwiVq.js` | js | 1235 | 1696 | 460 | 23 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1236 | 1395 | 159 | 0.9 |
| `/assets/Toast-Bor8WHON.js` | js | 1236 | 1424 | 188 | 0.9 |
| `/assets/PasswordInput-C8UD51ds.js` | js | 1236 | 1452 | 216 | 1.8 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1236 | 1594 | 358 | 0.9 |
| `/assets/recaptcha-CHjodRG9.js` | js | 1237 | 1623 | 386 | 0.4 |
| `/assets/plansApi-D-yR2t0k.js` | js | 1237 | 1645 | 408 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1237 | 1717 | 480 | 0.9 |
| `/assets/Card-BL0IQc_-.js` | js | 1237 | 1752 | 515 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1237 | 1810 | 573 | 1.2 |
| `/assets/Combination-CbLJj9Je.js` | js | 1237 | 1867 | 630 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1247 | 1880 | 634 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1250 | 2016 | 766 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1934 | 2254 | 320 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1250→2016ms (61.4KB)

## /cadastro (API real, 5 execuções)

- **LCP mediano**: 2120 ms · **FCP mediano**: 1284 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `font-sans text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight` — “Seu salão, no controle.” (592×52px)
- **Cadeia do elemento**: p.font-sans.text-4xl.xl:text-5xl → div → div.flex-1.flex.flex-col → div.relative.z-10.flex → div.relative.hidden.lg:flex → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 48px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1961 ms (677 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +1804 ms · renderização +159 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1803 · render +159 ⇒ soma ≈ 2120 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/cadastro (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 165 | 585 | 420 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 165 | 1159 | 994 | 144.3 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1232 | 1408 | 175 | 0.9 |
| `/assets/schemas-DqG_sY1H.js` | js | 1232 | 1473 | 241 | 3.5 |
| `/assets/LoginPage-quePmjLu.js` | js | 1232 | 1551 | 319 | 12.9 |
| `/assets/index-BM4uwiVq.js` | js | 1232 | 1673 | 441 | 23 |
| `/assets/Toast-Bor8WHON.js` | js | 1233 | 1423 | 190 | 0.9 |
| `/assets/PasswordInput-C8UD51ds.js` | js | 1233 | 1451 | 219 | 1.8 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1233 | 1588 | 356 | 0.9 |
| `/assets/recaptcha-CHjodRG9.js` | js | 1233 | 1615 | 383 | 0.4 |
| `/assets/plansApi-D-yR2t0k.js` | js | 1233 | 1644 | 411 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1233 | 1710 | 476 | 0.9 |
| `/assets/Card-BL0IQc_-.js` | js | 1233 | 1752 | 519 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1234 | 1816 | 582 | 1.2 |
| `/assets/Combination-CbLJj9Je.js` | js | 1234 | 1873 | 639 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1243 | 1859 | 616 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1247 | 2010 | 763 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1930 | 2253 | 324 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1247→2010ms (61.4KB)

## /queue (API real, 5 execuções)

- **LCP mediano**: 1996 ms · **FCP mediano**: 1408 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 sm:mt-7 sm:text-lg xl` — “Fila pública com estimativa de espera, agendamento online e financeiro no mesmo painel. A ” (608×98px)
- **Cadeia do elemento**: p.mt-6.max-w-2xl.text-base → div.relative.z-20.max-w-3xl → div.relative.z-10.mx-auto → section.relative.flex.min-h-dvh → main.relative.z-10 → div.min-h-dvh.overflow-x-hidden.bg-[#050706]
- **Estilo no paint**: opacity=1, visibility=visible, fonte 20px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1704 ms (280 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +1547 ms · renderização +272 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1555 · render +275 ⇒ soma ≈ 1996 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 164 | 579 | 415 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 164 | 1159 | 996 | 144.3 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1238 | 1401 | 163 | 2.6 |
| `/assets/brand-DVsU9mFC.js` | js | 1272 | 1430 | 159 | 0.3 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1272 | 1438 | 166 | 0.9 |
| `/assets/MarketingLayout-uQC4oP6-.js` | js | 1272 | 1480 | 208 | 3.8 |
| `/assets/LandingPage-BVu77587.js` | js | 1272 | 1544 | 273 | 15.2 |
| `/assets/trialCampaign-CsD0cjmz.js` | js | 1273 | 1451 | 179 | 1 |
| `/assets/softwareApplicationLd-d6g1ScMe.js` | js | 1273 | 1610 | 337 | 1.2 |
| `/assets/weatherVisuals-BLxvLQ2x.js` | js | 1273 | 1624 | 351 | 1 |
| `/assets/utils-DCADjnpI.js` | js | 1273 | 1631 | 358 | 8.8 |
| `/assets/reducedMotion-D9SWaqt8.js` | js | 1273 | 1646 | 373 | 0.4 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1386 | 2268 | 881 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1668 | 2474 | 806 | 34.9 |
| `/weather/sunny.jpg` | imagem | 1693 | 2460 | 767 | 29.4 |
| `/assets/index-Bvu9zNsI.js` | js | 1708 | 2440 | 731 | 27.6 |
| `/assets/ScrollTrigger-7Zy99s9Q.js` | js | 1709 | 2303 | 595 | 18.1 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1386→2268ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API real, 5 execuções)

- **LCP mediano**: 2352 ms · **FCP mediano**: 1292 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary leading-relaxed` — “O salão está tranquilo agora. Ótimo momento para chegar e ser atendido(a) sem espera.” (573×23px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.leading-relaxed → div.rounded-xl.bg-bg/80.border → div.relative.pl-5.pr-5 → div.mb-6.relative.overflow-hidden → main.max-w-md.sm:max-w-xl.md:max-w-3xl → div.min-h-dvh.pb-[max(5rem,env(safe-area-inset-bottom))].bg-bg
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2334 ms (1014 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 15 ms · criação do elemento +2171 ms · renderização +46 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2157 · render +39 ⇒ soma ≈ 2352 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ce5c7b10-5a57-4cf8-8741-163b69393255&status=all 1327→1509ms (signal is aborted without reason) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1332→2137ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1333→2231ms status 200 [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1334→2245ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1334→2302ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1334→2308ms status 200 [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1509→2322ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ce5c7b10-5a57-4cf8-8741-163b69393255&status=all 1508→2386ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2201→2409ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ce5c7b10-5a57-4cf8-8741-163b69393255&status=all 2667→2823ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ce5c7b10-5a57-4cf8-8741-163b69393255&status=all 3832→3989ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ce5c7b10-5a57-4cf8-8741-163b69393255&status=all 4990→5148ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 163 | 163 | 1.2 |
| `/assets/index-BmGASRih.js` | js | 175 | 1179 | 1003 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 176 | 598 | 422 | 27.7 |
| `/assets/PublicHome-Bg-TZ1UR.js` | js | 1260 | 1543 | 283 | 8.6 |
| `/assets/notificationsApi-CPUEgg9E.js` | js | 1261 | 1435 | 174 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1261 | 1442 | 180 | 0.9 |
| `/assets/StatusBadge-CfeHwUKf.js` | js | 1261 | 1449 | 188 | 1.2 |
| `/assets/ConfirmDialog-JAjNKCs9.js` | js | 1261 | 1629 | 367 | 1.3 |
| `/assets/SmartSelect-CfvyeQPL.js` | js | 1261 | 1699 | 438 | 17.1 |
| `/assets/ThemedCalendar-BnMqKVkc.js` | js | 1261 | 1900 | 640 | 32.1 |
| `/assets/ModalShell-ChL48mVg.js` | js | 1262 | 1722 | 460 | 1.4 |
| `/assets/schemas-DqG_sY1H.js` | js | 1262 | 1950 | 688 | 3.5 |
| `/assets/Combination-CbLJj9Je.js` | js | 1262 | 1964 | 702 | 7.4 |
| `/assets/index-BM4uwiVq.js` | js | 1262 | 2151 | 889 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1263 | 1635 | 372 | 2.4 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1263 | 1914 | 652 | 0.9 |
| `/assets/publicProductsApi-CukqZSLf.js` | js | 1264 | 2072 | 808 | 0.7 |
| `/assets/Toast-Bor8WHON.js` | js | 1264 | 2086 | 822 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1274 | 2143 | 869 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1279 | 2293 | 1014 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1279→2293ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API real, 5 execuções)

- **LCP mediano**: 1304 ms · **FCP mediano**: 1304 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary` — “Carregando...” (88×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary → div.flex.flex-col.items-center → div.flex.items-center.justify-center → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1260 ms (antes/do FCP)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +1103 ms · renderização +44 ms
- **Divisão (mediana)**: TTFB 1 · elemento/recurso +1103 · render +41 ⇒ soma ≈ 1304 ms
- **Depende de JS**: elemento criado após FCP em 0/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=833911a1-f041-4cf8-881c-7d570f4c3397&status=all 1313→1496ms (signal is aborted without reason) [depois do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1316→2126ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1317→2231ms status 200 [depois do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1317→2260ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1318→2289ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1318→2295ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1497→2311ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=833911a1-f041-4cf8-881c-7d570f4c3397&status=all 1495→2421ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2183→2422ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 2360→2526ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2361→2575ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=833911a1-f041-4cf8-881c-7d570f4c3397&status=all 2653→2811ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=833911a1-f041-4cf8-881c-7d570f4c3397&status=all 3812→3970ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=833911a1-f041-4cf8-881c-7d570f4c3397&status=all 4971→5128ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 166 | 586 | 419 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 166 | 1166 | 1000 | 144.3 |
| `/assets/PublicHome-Bg-TZ1UR.js` | js | 1245 | 1537 | 292 | 8.6 |
| `/assets/ThemedCalendar-BnMqKVkc.js` | js | 1245 | 1937 | 692 | 32.1 |
| `/assets/notificationsApi-CPUEgg9E.js` | js | 1246 | 1401 | 156 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1246 | 1417 | 171 | 0.9 |
| `/assets/StatusBadge-CfeHwUKf.js` | js | 1246 | 1431 | 185 | 1.2 |
| `/assets/ConfirmDialog-JAjNKCs9.js` | js | 1246 | 1617 | 371 | 1.3 |
| `/assets/SmartSelect-CfvyeQPL.js` | js | 1246 | 1687 | 442 | 17.1 |
| `/assets/ModalShell-ChL48mVg.js` | js | 1246 | 1709 | 463 | 1.4 |
| `/assets/Combination-CbLJj9Je.js` | js | 1246 | 1923 | 677 | 7.4 |
| `/assets/index-BM4uwiVq.js` | js | 1246 | 2131 | 885 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1247 | 1601 | 354 | 2.4 |
| `/assets/schemas-DqG_sY1H.js` | js | 1247 | 1945 | 698 | 3.5 |
| `/assets/Avatar-BBT7iUtC.js` | js | 1248 | 1903 | 655 | 0.9 |
| `/assets/publicProductsApi-CukqZSLf.js` | js | 1248 | 2073 | 826 | 0.7 |
| `/assets/Toast-Bor8WHON.js` | js | 1248 | 2095 | 847 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1260 | 2138 | 878 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1266 | 2281 | 1016 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1266→2281ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API real, 5 execuções)

- **LCP mediano**: 1868 ms · **FCP mediano**: 1296 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-center text-2xs leading-relaxed text-text-muted` — “A reserva é gratuita e não é um pagamento. O pagamento é feito na retirada. Informe seu no” (374×39px)
- **Cadeia do elemento**: p.text-center.text-2xs.leading-relaxed → form.mt-4.space-y-4.rounded-2xl → main.mx-auto.max-w-md.px-4 → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 12px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1838 ms (530 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1681 ms · renderização +34 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1675 · render +38 ⇒ soma ≈ 1868 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1652→1818ms status 200 [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 165 | 587 | 421 | 27.7 |
| `/assets/index-BmGASRih.js` | js | 165 | 1165 | 1001 | 144.3 |
| `/assets/PublicProductPage-CaFsS-0Y.js` | js | 1252 | 1473 | 221 | 3.4 |
| `/assets/publicProductsApi-CukqZSLf.js` | js | 1253 | 1409 | 156 | 0.7 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1253 | 1437 | 184 | 0.9 |
| `/assets/schemas-DqG_sY1H.js` | js | 1253 | 1481 | 228 | 3.5 |
| `/assets/index-BM4uwiVq.js` | js | 1253 | 1595 | 342 | 23 |
| `/assets/StatusBadge-CfeHwUKf.js` | js | 1254 | 1445 | 192 | 1.2 |
| `/assets/Field-DvrnQQDx.js` | js | 1254 | 1603 | 349 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1265 | 1631 | 366 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1269 | 1910 | 642 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1269→1910ms (61.4KB)
