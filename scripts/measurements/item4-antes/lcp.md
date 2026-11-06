# Diagnóstico LCP — 5 execuções por rota

Condições: rede Slow 4G (1,6 Mbps / 150 ms RTT) + CPU 4×, viewport 375×667, consentimento de cookies pré-setado.

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API off, 5 execuções)

- **LCP mediano**: 2220 ms · **FCP mediano**: 1312 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (327×40px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2305 ms (825 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 12 ms · criação do elemento +2129 ms · renderização +47 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +2038 · render +20 ⇒ soma ≈ 2220 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=54a4db83-fd06-44bb-acf8-2b7b15ac5157&status=all 1486→1512ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1496→1516ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1497→1516ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1498→1516ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1498→1516ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1498→1516ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1515→1528ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=54a4db83-fd06-44bb-acf8-2b7b15ac5157&status=all 1667→1671ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2310→2314ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=54a4db83-fd06-44bb-acf8-2b7b15ac5157&status=all 2831→2833ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=54a4db83-fd06-44bb-acf8-2b7b15ac5157&status=all 3989→3991ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=54a4db83-fd06-44bb-acf8-2b7b15ac5157&status=all 5156→5157ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 176 | 176 | 1.2 |
| `/assets/index-DEs_LO5O.js` | js | 224 | 1222 | 998 | 144.3 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 225 | 644 | 419 | 27.7 |
| `/assets/PublicHome-QQffyKfb.js` | js | 1326 | 1630 | 303 | 8.6 |
| `/assets/notificationsApi-BiU0bIUh.js` | js | 1327 | 1507 | 180 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1327 | 1524 | 197 | 0.9 |
| `/assets/ThemedCalendar-CmKVL-r_.js` | js | 1327 | 2024 | 697 | 32.1 |
| `/assets/StatusBadge-4_lBAhcO.js` | js | 1328 | 1529 | 201 | 1.2 |
| `/assets/ConfirmDialog-DuxmTgAx.js` | js | 1328 | 1708 | 380 | 1.3 |
| `/assets/SmartSelect-C_cguVIG.js` | js | 1328 | 1788 | 460 | 17.1 |
| `/assets/ModalShell-DlCxiCd-.js` | js | 1328 | 1809 | 481 | 1.4 |
| `/assets/Combination-Di0lpTKl.js` | js | 1328 | 2046 | 718 | 7.4 |
| `/assets/schemas-JlMxmDF3.js` | js | 1328 | 2051 | 723 | 3.5 |
| `/assets/index-DJP8PE1O.js` | js | 1328 | 2225 | 897 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1329 | 1722 | 393 | 2.4 |
| `/assets/Avatar-C5n8x9Na.js` | js | 1329 | 2001 | 672 | 0.9 |
| `/assets/publicProductsApi-BYh_CI4B.js` | js | 1329 | 2173 | 844 | 0.7 |
| `/assets/Toast-f4_W0J-J.js` | js | 1330 | 2196 | 867 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1342 | 2238 | 896 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1352 | 2352 | 1000 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1352→2352ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API off, 5 execuções)

- **LCP mediano**: 2220 ms · **FCP mediano**: 1304 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (377×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2208 ms (924 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2043 ms · renderização +28 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +2038 · render +19 ⇒ soma ≈ 2220 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=c70e4bd2-41df-437e-96ac-3a300f314b5c&status=all 1281→1300ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1286→1308ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1286→1308ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1287→1309ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1287→1309ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1287→1309ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1300→1310ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=c70e4bd2-41df-437e-96ac-3a300f314b5c&status=all 1488→1491ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2208→2212ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=c70e4bd2-41df-437e-96ac-3a300f314b5c&status=all 2646→2648ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=c70e4bd2-41df-437e-96ac-3a300f314b5c&status=all 3805→3807ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=c70e4bd2-41df-437e-96ac-3a300f314b5c&status=all 4964→4966ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=c70e4bd2-41df-437e-96ac-3a300f314b5c&status=all 6145→6149ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 173 | 602 | 430 | 27.7 |
| `/assets/index-DEs_LO5O.js` | js | 173 | 1180 | 1007 | 144.3 |
| `/assets/PublicHome-QQffyKfb.js` | js | 1256 | 1561 | 305 | 8.6 |
| `/assets/notificationsApi-BiU0bIUh.js` | js | 1257 | 1445 | 188 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1257 | 1451 | 194 | 0.9 |
| `/assets/ThemedCalendar-CmKVL-r_.js` | js | 1257 | 1953 | 696 | 32.1 |
| `/assets/StatusBadge-4_lBAhcO.js` | js | 1258 | 1466 | 208 | 1.2 |
| `/assets/ConfirmDialog-DuxmTgAx.js` | js | 1258 | 1645 | 387 | 1.3 |
| `/assets/SmartSelect-C_cguVIG.js` | js | 1258 | 1718 | 460 | 17.1 |
| `/assets/ModalShell-DlCxiCd-.js` | js | 1258 | 1739 | 482 | 1.4 |
| `/assets/Combination-Di0lpTKl.js` | js | 1258 | 1974 | 716 | 7.4 |
| `/assets/index-DJP8PE1O.js` | js | 1258 | 2161 | 903 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1259 | 1652 | 393 | 2.4 |
| `/assets/Avatar-C5n8x9Na.js` | js | 1259 | 1932 | 673 | 0.9 |
| `/assets/schemas-JlMxmDF3.js` | js | 1259 | 1983 | 724 | 3.5 |
| `/assets/publicProductsApi-BYh_CI4B.js` | js | 1259 | 2103 | 844 | 0.7 |
| `/assets/Toast-f4_W0J-J.js` | js | 1259 | 2124 | 865 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1263 | 2167 | 904 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1264 | 2283 | 1019 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1264→2283ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API real, 5 execuções)

- **LCP mediano**: 1312 ms · **FCP mediano**: 1312 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary` — “Carregando...” (88×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary → div.flex.flex-col.items-center → div.flex.items-center.justify-center → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1276 ms (antes/do FCP)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1119 ms · renderização +36 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1115 · render +39 ⇒ soma ≈ 1312 ms
- **Depende de JS**: elemento criado após FCP em 0/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e42a8ac9-86f2-40db-b26a-4dc3b45e2080&status=all 1320→1504ms (signal is aborted without reason) [depois do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1324→2190ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1325→2254ms status 200 [depois do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1326→2284ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1326→2312ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1327→2317ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1505→2332ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e42a8ac9-86f2-40db-b26a-4dc3b45e2080&status=all 1502→2478ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2215→2488ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 2407→2570ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2408→2613ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e42a8ac9-86f2-40db-b26a-4dc3b45e2080&status=all 2675→2842ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e42a8ac9-86f2-40db-b26a-4dc3b45e2080&status=all 3840→3999ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e42a8ac9-86f2-40db-b26a-4dc3b45e2080&status=all 4999→5157ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 173 | 601 | 428 | 27.7 |
| `/assets/index-DEs_LO5O.js` | js | 173 | 1182 | 1009 | 144.3 |
| `/assets/notificationsApi-BiU0bIUh.js` | js | 1262 | 1424 | 162 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1262 | 1439 | 177 | 0.9 |
| `/assets/PublicHome-QQffyKfb.js` | js | 1262 | 1559 | 297 | 8.6 |
| `/assets/SmartSelect-C_cguVIG.js` | js | 1262 | 1718 | 455 | 17.1 |
| `/assets/ThemedCalendar-CmKVL-r_.js` | js | 1262 | 1959 | 697 | 32.1 |
| `/assets/StatusBadge-4_lBAhcO.js` | js | 1263 | 1454 | 191 | 1.2 |
| `/assets/ConfirmDialog-DuxmTgAx.js` | js | 1263 | 1639 | 376 | 1.3 |
| `/assets/ModalShell-DlCxiCd-.js` | js | 1263 | 1731 | 468 | 1.4 |
| `/assets/Combination-Di0lpTKl.js` | js | 1263 | 1945 | 682 | 7.4 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1264 | 1623 | 359 | 2.4 |
| `/assets/schemas-JlMxmDF3.js` | js | 1264 | 1974 | 711 | 3.5 |
| `/assets/index-DJP8PE1O.js` | js | 1264 | 2146 | 882 | 23 |
| `/assets/Avatar-C5n8x9Na.js` | js | 1265 | 1917 | 652 | 0.9 |
| `/assets/publicProductsApi-BYh_CI4B.js` | js | 1265 | 2090 | 825 | 0.7 |
| `/assets/Toast-f4_W0J-J.js` | js | 1265 | 2118 | 854 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1276 | 2162 | 886 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1281 | 2304 | 1023 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1281→2304ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API real, 5 execuções)

- **LCP mediano**: 1304 ms · **FCP mediano**: 1304 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary` — “Carregando...” (88×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary → div.flex.flex-col.items-center → div.flex.items-center.justify-center → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1264 ms (antes/do FCP)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · criação do elemento +1099 ms · renderização +36 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1102 · render +40 ⇒ soma ≈ 1304 ms
- **Depende de JS**: elemento criado após FCP em 0/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=b73cd57e-aee2-47d6-9381-375839f0f9bb&status=all 1295→1482ms (signal is aborted without reason) [depois do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1296→2180ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1296→2242ms status 200 [depois do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1297→2260ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1297→2290ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1297→2310ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1483→2328ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=b73cd57e-aee2-47d6-9381-375839f0f9bb&status=all 1481→2449ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2202→2460ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 2395→2561ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2396→2584ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=b73cd57e-aee2-47d6-9381-375839f0f9bb&status=all 2647→2804ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=b73cd57e-aee2-47d6-9381-375839f0f9bb&status=all 3811→3977ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=b73cd57e-aee2-47d6-9381-375839f0f9bb&status=all 4977→5144ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 174 | 593 | 419 | 27.7 |
| `/assets/index-DEs_LO5O.js` | js | 174 | 1173 | 999 | 144.3 |
| `/assets/notificationsApi-BiU0bIUh.js` | js | 1249 | 1418 | 169 | 1 |
| `/assets/PublicHome-QQffyKfb.js` | js | 1249 | 1547 | 299 | 8.6 |
| `/assets/ThemedCalendar-CmKVL-r_.js` | js | 1249 | 1933 | 684 | 32.1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1250 | 1424 | 174 | 0.9 |
| `/assets/StatusBadge-4_lBAhcO.js` | js | 1250 | 1439 | 189 | 1.2 |
| `/assets/ConfirmDialog-DuxmTgAx.js` | js | 1250 | 1618 | 368 | 1.3 |
| `/assets/SmartSelect-C_cguVIG.js` | js | 1250 | 1696 | 446 | 17.1 |
| `/assets/ModalShell-DlCxiCd-.js` | js | 1250 | 1718 | 468 | 1.4 |
| `/assets/Combination-Di0lpTKl.js` | js | 1250 | 1953 | 702 | 7.4 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1251 | 1624 | 373 | 2.4 |
| `/assets/schemas-JlMxmDF3.js` | js | 1251 | 1961 | 710 | 3.5 |
| `/assets/index-DJP8PE1O.js` | js | 1251 | 2131 | 880 | 23 |
| `/assets/Avatar-C5n8x9Na.js` | js | 1252 | 1911 | 659 | 0.9 |
| `/assets/publicProductsApi-BYh_CI4B.js` | js | 1252 | 2081 | 829 | 0.7 |
| `/assets/Toast-f4_W0J-J.js` | js | 1252 | 2104 | 852 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1264 | 2154 | 890 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1269 | 2298 | 1029 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1269→2298ms (61.4KB)
