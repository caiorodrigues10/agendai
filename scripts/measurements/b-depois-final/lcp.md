# Diagnóstico LCP — 5 execuções por rota

Condições: rede Slow 4G (1,6 Mbps / 150 ms RTT) + CPU 4×, viewport 375×667, consentimento de cookies pré-setado.

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API off, 5 execuções)

- **LCP mediano**: 2256 ms · **FCP mediano**: 1332 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (327×40px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2253 ms (869 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 9 ms · criação do elemento +2089 ms · renderização +27 ms
- **Divisão (mediana)**: TTFB 4 · elemento/recurso +2077 · render +27 ⇒ soma ≈ 2256 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=0fb03c53-1237-4763-a79a-0a5b26afa877&status=all 1392→1416ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1403→1421ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1405→1421ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1405→1421ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1406→1422ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1406→1422ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 1420→1429ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=0fb03c53-1237-4763-a79a-0a5b26afa877&status=all 1580→1582ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2252→2273ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=0fb03c53-1237-4763-a79a-0a5b26afa877&status=all 2749→2751ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=0fb03c53-1237-4763-a79a-0a5b26afa877&status=all 3910→3913ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=0fb03c53-1237-4763-a79a-0a5b26afa877&status=all 5069→5071ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=0fb03c53-1237-4763-a79a-0a5b26afa877&status=all 6228→6230ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 196 | 613 | 417 | 27.6 |
| `/assets/index-ERD1rBeY.js` | js | 196 | 1193 | 997 | 144.3 |
| `/assets/notificationsApi-dlkWyr8p.js` | js | 1291 | 1479 | 188 | 1 |
| `/assets/PublicHome-BK42qFzJ.js` | js | 1291 | 1600 | 309 | 8.6 |
| `/assets/ThemedCalendar-CAOCTVfH.js` | js | 1291 | 1957 | 666 | 32.1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1292 | 1486 | 194 | 0.9 |
| `/assets/StatusBadge-Dmv1KvS1.js` | js | 1292 | 1500 | 208 | 1.2 |
| `/assets/ConfirmDialog-Dz-rlKUh.js` | js | 1292 | 1679 | 387 | 1.3 |
| `/assets/SmartSelect-CvT33XNR.js` | js | 1292 | 1751 | 459 | 17.1 |
| `/assets/ModalShell-auN_riPX.js` | js | 1293 | 1773 | 480 | 1.4 |
| `/assets/Combination-DtBv3lu6.js` | js | 1293 | 2015 | 722 | 7.4 |
| `/assets/index-DqPfb07V.js` | js | 1293 | 2187 | 894 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1294 | 1686 | 393 | 2.4 |
| `/assets/Avatar-5xwma14L.js` | js | 1294 | 1965 | 671 | 0.9 |
| `/assets/schemas-DFsilv9l.js` | js | 1294 | 2008 | 715 | 3.5 |
| `/assets/publicProductsApi-Kk8QWl1o.js` | js | 1294 | 2123 | 829 | 0.7 |
| `/assets/Toast-CKEN6a5I.js` | js | 1294 | 2137 | 843 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1305 | 2201 | 896 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1313 | 2315 | 1003 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1313→2315ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API off, 5 execuções)

- **LCP mediano**: 2204 ms · **FCP mediano**: 1284 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (327×40px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2193 ms (901 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +2036 ms · renderização +23 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2015 · render +24 ⇒ soma ≈ 2204 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=9b9221f5-6c93-4a6e-85a1-b9685acf4028&status=all 1300→1312ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1303→1314ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1304→1315ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1305→1315ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1306→1315ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1306→1315ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 1313→1319ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=9b9221f5-6c93-4a6e-85a1-b9685acf4028&status=all 1481→1484ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2191→2195ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=9b9221f5-6c93-4a6e-85a1-b9685acf4028&status=all 2639→2641ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=9b9221f5-6c93-4a6e-85a1-b9685acf4028&status=all 3797→3799ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=9b9221f5-6c93-4a6e-85a1-b9685acf4028&status=all 4956→4958ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=9b9221f5-6c93-4a6e-85a1-b9685acf4028&status=all 6115→6117ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 175 | 593 | 418 | 27.6 |
| `/assets/index-ERD1rBeY.js` | js | 175 | 1174 | 999 | 144.3 |
| `/assets/PublicHome-BK42qFzJ.js` | js | 1249 | 1553 | 304 | 8.6 |
| `/assets/notificationsApi-dlkWyr8p.js` | js | 1250 | 1432 | 182 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1250 | 1438 | 188 | 0.9 |
| `/assets/StatusBadge-Dmv1KvS1.js` | js | 1250 | 1452 | 202 | 1.2 |
| `/assets/ConfirmDialog-Dz-rlKUh.js` | js | 1250 | 1632 | 381 | 1.3 |
| `/assets/SmartSelect-CvT33XNR.js` | js | 1250 | 1702 | 451 | 17.1 |
| `/assets/ModalShell-auN_riPX.js` | js | 1250 | 1725 | 474 | 1.4 |
| `/assets/ThemedCalendar-CAOCTVfH.js` | js | 1250 | 1909 | 659 | 32.1 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1251 | 1638 | 387 | 2.4 |
| `/assets/schemas-DFsilv9l.js` | js | 1251 | 1952 | 701 | 3.5 |
| `/assets/Combination-DtBv3lu6.js` | js | 1251 | 1967 | 716 | 7.4 |
| `/assets/index-DqPfb07V.js` | js | 1251 | 2146 | 895 | 23 |
| `/assets/Avatar-5xwma14L.js` | js | 1252 | 1917 | 665 | 0.9 |
| `/assets/publicProductsApi-Kk8QWl1o.js` | js | 1252 | 2075 | 823 | 0.7 |
| `/assets/Toast-CKEN6a5I.js` | js | 1253 | 2096 | 843 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1261 | 2138 | 877 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1264 | 2267 | 1002 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1264→2267ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API off, 5 execuções)

- **LCP mediano**: 1688 ms · **FCP mediano**: 1288 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-lg font-bold` — “Não foi possível conectar ao servidor. Verifique se a API está no ar e tente de novo.” (327×84px)
- **Cadeia do elemento**: h1.text-lg.font-bold → div → div.mx-auto.flex.min-h-dvh → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 18px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1668 ms (380 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1511 ms · renderização +28 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1502 · render +27 ⇒ soma ≈ 1688 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1658→1664ms (Failed to fetch) [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 174 | 594 | 420 | 27.6 |
| `/assets/index-ERD1rBeY.js` | js | 174 | 1172 | 998 | 144.3 |
| `/assets/publicProductsApi-Kk8QWl1o.js` | js | 1245 | 1408 | 163 | 0.7 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1245 | 1437 | 192 | 0.9 |
| `/assets/PublicProductPage-P3nAIYF3.js` | js | 1245 | 1473 | 228 | 3.4 |
| `/assets/schemas-DFsilv9l.js` | js | 1245 | 1481 | 236 | 3.5 |
| `/assets/index-DqPfb07V.js` | js | 1245 | 1609 | 364 | 23 |
| `/assets/StatusBadge-Dmv1KvS1.js` | js | 1246 | 1444 | 198 | 1.2 |
| `/assets/Field-DnyiDM_m.js` | js | 1246 | 1603 | 357 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1254 | 1637 | 383 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1257 | 1902 | 645 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1257→1902ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API real, 5 execuções)

- **LCP mediano**: 2372 ms · **FCP mediano**: 1292 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary leading-relaxed` — “O salão está tranquilo agora. Ótimo momento para chegar e ser atendido(a) sem espera.” (245×68px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.leading-relaxed → div.rounded-xl.bg-bg/80.border → div.relative.pl-5.pr-5 → div.mb-6.relative.overflow-hidden → main.max-w-md.sm:max-w-xl.md:max-w-3xl → div.min-h-dvh.pb-[max(5rem,env(safe-area-inset-bottom))].bg-bg
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2323 ms (1035 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · criação do elemento +2166 ms · renderização +49 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2166 · render +39 ⇒ soma ≈ 2372 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=c0d15d22-ebd4-4a68-88b3-6036fab03d6b&status=all 1279→1468ms (signal is aborted without reason) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1280→2137ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1280→2225ms status 200 [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1280→2262ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1280→2290ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1280→2303ms status 200 [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 1468→2311ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=c0d15d22-ebd4-4a68-88b3-6036fab03d6b&status=all 1467→2382ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2187→2426ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=c0d15d22-ebd4-4a68-88b3-6036fab03d6b&status=all 2626→2783ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=c0d15d22-ebd4-4a68-88b3-6036fab03d6b&status=all 3783→3942ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=c0d15d22-ebd4-4a68-88b3-6036fab03d6b&status=all 4942→5100ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 171 | 586 | 416 | 27.6 |
| `/assets/index-ERD1rBeY.js` | js | 171 | 1165 | 995 | 144.3 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1241 | 1410 | 169 | 0.9 |
| `/assets/notificationsApi-dlkWyr8p.js` | js | 1241 | 1416 | 175 | 1 |
| `/assets/StatusBadge-Dmv1KvS1.js` | js | 1241 | 1431 | 189 | 1.2 |
| `/assets/PublicHome-BK42qFzJ.js` | js | 1241 | 1538 | 297 | 8.6 |
| `/assets/SmartSelect-CvT33XNR.js` | js | 1241 | 1687 | 446 | 17.1 |
| `/assets/ThemedCalendar-CAOCTVfH.js` | js | 1241 | 1925 | 684 | 32.1 |
| `/assets/ConfirmDialog-Dz-rlKUh.js` | js | 1242 | 1617 | 375 | 1.3 |
| `/assets/ModalShell-auN_riPX.js` | js | 1242 | 1710 | 468 | 1.4 |
| `/assets/schemas-DFsilv9l.js` | js | 1242 | 1946 | 704 | 3.5 |
| `/assets/Combination-DtBv3lu6.js` | js | 1242 | 1952 | 710 | 7.4 |
| `/assets/index-DqPfb07V.js` | js | 1242 | 2128 | 886 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1243 | 1609 | 367 | 2.4 |
| `/assets/Avatar-5xwma14L.js` | js | 1243 | 1903 | 660 | 0.9 |
| `/assets/publicProductsApi-Kk8QWl1o.js` | js | 1243 | 2067 | 824 | 0.7 |
| `/assets/Toast-CKEN6a5I.js` | js | 1243 | 2096 | 852 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1252 | 2146 | 894 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1256 | 2281 | 1026 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1256→2281ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API real, 5 execuções)

- **LCP mediano**: 1288 ms · **FCP mediano**: 1288 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary` — “Carregando...” (88×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary → div.flex.flex-col.items-center → div.flex.items-center.justify-center → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1258 ms (antes/do FCP)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1101 ms · renderização +34 ms
- **Divisão (mediana)**: TTFB 1 · elemento/recurso +1097 · render +34 ⇒ soma ≈ 1288 ms
- **Depende de JS**: elemento criado após FCP em 0/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=91a3c180-1bc8-4972-8897-a32ee410fed4&status=all 1299→1482ms (signal is aborted without reason) [depois do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1303→2157ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1304→2225ms status 200 [depois do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1304→2246ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1305→2274ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1305→2304ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 1483→2318ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=91a3c180-1bc8-4972-8897-a32ee410fed4&status=all 1481→2398ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2177→2462ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 2387→2552ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2388→2561ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=91a3c180-1bc8-4972-8897-a32ee410fed4&status=all 2646→2804ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=91a3c180-1bc8-4972-8897-a32ee410fed4&status=all 3805→3962ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=91a3c180-1bc8-4972-8897-a32ee410fed4&status=all 4963→5121ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-ERD1rBeY.js` | js | 175 | 1173 | 998 | 144.3 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 176 | 594 | 418 | 27.6 |
| `/assets/PublicHome-BK42qFzJ.js` | js | 1246 | 1544 | 298 | 8.6 |
| `/assets/notificationsApi-dlkWyr8p.js` | js | 1247 | 1409 | 162 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1247 | 1423 | 177 | 0.9 |
| `/assets/StatusBadge-Dmv1KvS1.js` | js | 1247 | 1437 | 190 | 1.2 |
| `/assets/SmartSelect-CvT33XNR.js` | js | 1247 | 1702 | 454 | 17.1 |
| `/assets/ThemedCalendar-CAOCTVfH.js` | js | 1247 | 1960 | 713 | 32.1 |
| `/assets/ConfirmDialog-Dz-rlKUh.js` | js | 1248 | 1616 | 368 | 1.3 |
| `/assets/ModalShell-auN_riPX.js` | js | 1248 | 1717 | 470 | 1.4 |
| `/assets/Combination-DtBv3lu6.js` | js | 1248 | 1902 | 655 | 7.4 |
| `/assets/schemas-DFsilv9l.js` | js | 1248 | 1952 | 703 | 3.5 |
| `/assets/index-DqPfb07V.js` | js | 1248 | 2116 | 868 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1249 | 1595 | 346 | 2.4 |
| `/assets/Avatar-5xwma14L.js` | js | 1249 | 1910 | 661 | 0.9 |
| `/assets/publicProductsApi-Kk8QWl1o.js` | js | 1249 | 2066 | 818 | 0.7 |
| `/assets/Toast-CKEN6a5I.js` | js | 1250 | 2088 | 839 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1258 | 2146 | 889 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1261 | 2296 | 1035 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1261→2296ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API real, 5 execuções)

- **LCP mediano**: 1856 ms · **FCP mediano**: 1288 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-xl font-bold` — “Produto Sintetico 01” (191×28px)
- **Cadeia do elemento**: h1.text-xl.font-bold → div.flex.flex-wrap.items-center → div.rounded-2xl.border.border-border → main.mx-auto.max-w-md.px-4 → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 20px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1817 ms (529 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · criação do elemento +1660 ms · renderização +51 ms
- **Divisão (mediana)**: TTFB 1 · elemento/recurso +1661 · render +36 ⇒ soma ≈ 1856 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1643→1802ms status 200 [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 173 | 594 | 422 | 27.6 |
| `/assets/index-ERD1rBeY.js` | js | 173 | 1174 | 1001 | 144.3 |
| `/assets/publicProductsApi-Kk8QWl1o.js` | js | 1248 | 1410 | 161 | 0.7 |
| `/assets/PublicProductPage-P3nAIYF3.js` | js | 1248 | 1466 | 217 | 3.4 |
| `/assets/schemas-DFsilv9l.js` | js | 1248 | 1473 | 224 | 3.5 |
| `/assets/index-DqPfb07V.js` | js | 1248 | 1581 | 333 | 23 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1249 | 1430 | 181 | 0.9 |
| `/assets/StatusBadge-Dmv1KvS1.js` | js | 1249 | 1438 | 189 | 1.2 |
| `/assets/Field-DnyiDM_m.js` | js | 1250 | 1595 | 346 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1257 | 1624 | 367 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1260 | 1902 | 642 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1260→1902ms (61.4KB)
