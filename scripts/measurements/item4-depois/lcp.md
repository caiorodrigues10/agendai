# Diagnóstico LCP — 5 execuções por rota

Condições: rede Slow 4G (1,6 Mbps / 150 ms RTT) + CPU 4×, viewport 375×667, consentimento de cookies pré-setado.

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API off, 5 execuções)

- **LCP mediano**: 2232 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (327×40px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2350 ms (914 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 12 ms · criação do elemento +2176 ms · renderização +46 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +2045 · render +31 ⇒ soma ≈ 2232 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=8f03072e-4dd3-46d4-a46f-89ad563487e1&status=all 1445→1470ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1455→1475ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1456→1475ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1456→1475ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1456→1475ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1457→1476ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1474→1481ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=8f03072e-4dd3-46d4-a46f-89ad563487e1&status=all 1640→1642ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2347→2352ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=8f03072e-4dd3-46d4-a46f-89ad563487e1&status=all 2802→2805ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=8f03072e-4dd3-46d4-a46f-89ad563487e1&status=all 3968→3971ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=8f03072e-4dd3-46d4-a46f-89ad563487e1&status=all 5133→5135ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=8f03072e-4dd3-46d4-a46f-89ad563487e1&status=all 6299→6303ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 174 | 174 | 1.2 |
| `/assets/index-D2kAYejh.js` | js | 232 | 1229 | 997 | 144.4 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 234 | 649 | 415 | 27.7 |
| `/assets/PublicHome-Ca0gSXlE.js` | js | 1342 | 1660 | 318 | 8.6 |
| `/assets/notificationsApi-4FBxtjsW.js` | js | 1343 | 1530 | 187 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1343 | 1543 | 200 | 0.9 |
| `/assets/StatusBadge-BavxzCjO.js` | js | 1343 | 1552 | 209 | 1.2 |
| `/assets/SmartSelect-O60HpWtN.js` | js | 1343 | 1808 | 465 | 17.1 |
| `/assets/ThemedCalendar-Dr0pg9Ri.js` | js | 1343 | 2043 | 700 | 32.1 |
| `/assets/ConfirmDialog-CAD8lf6v.js` | js | 1344 | 1737 | 393 | 1.3 |
| `/assets/ModalShell-BbARGIm5.js` | js | 1344 | 1830 | 486 | 1.4 |
| `/assets/Combination-D9gNMgBc.js` | js | 1344 | 2059 | 715 | 7.4 |
| `/assets/schemas-CzpO3tJj.js` | js | 1344 | 2073 | 729 | 3.5 |
| `/assets/index-BbAX54DG.js` | js | 1344 | 2245 | 901 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1345 | 1729 | 384 | 2.4 |
| `/assets/Avatar-DmlKHhI1.js` | js | 1345 | 2024 | 678 | 0.9 |
| `/assets/publicProductsApi-BLRF2qea.js` | js | 1345 | 2196 | 850 | 0.7 |
| `/assets/Toast-C74PLG6A.js` | js | 1345 | 2216 | 871 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1361 | 2259 | 898 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1373 | 2373 | 1000 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1373→2373ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API off, 5 execuções)

- **LCP mediano**: 2244 ms · **FCP mediano**: 1320 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (377×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2199 ms (883 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2033 ms · renderização +21 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2041 · render +25 ⇒ soma ≈ 2244 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=def7f0ee-dbb6-4364-b3e5-c274b2f3b51a&status=all 1327→1348ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1336→1352ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1337→1353ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1338→1353ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1338→1353ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1339→1353ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1351→1355ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=def7f0ee-dbb6-4364-b3e5-c274b2f3b51a&status=all 1509→1513ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2198→2214ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=def7f0ee-dbb6-4364-b3e5-c274b2f3b51a&status=all 2682→2685ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=def7f0ee-dbb6-4364-b3e5-c274b2f3b51a&status=all 3848→3850ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=def7f0ee-dbb6-4364-b3e5-c274b2f3b51a&status=all 5014→5016ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=def7f0ee-dbb6-4364-b3e5-c274b2f3b51a&status=all 6179→6181ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 166 | 166 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 174 | 600 | 426 | 27.7 |
| `/assets/index-D2kAYejh.js` | js | 174 | 1182 | 1008 | 144.4 |
| `/assets/PublicHome-Ca0gSXlE.js` | js | 1264 | 1574 | 310 | 8.6 |
| `/assets/notificationsApi-4FBxtjsW.js` | js | 1265 | 1447 | 183 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1265 | 1460 | 195 | 0.9 |
| `/assets/StatusBadge-BavxzCjO.js` | js | 1265 | 1466 | 201 | 1.2 |
| `/assets/ConfirmDialog-CAD8lf6v.js` | js | 1265 | 1644 | 379 | 1.3 |
| `/assets/SmartSelect-O60HpWtN.js` | js | 1265 | 1724 | 460 | 17.1 |
| `/assets/ModalShell-BbARGIm5.js` | js | 1265 | 1747 | 482 | 1.4 |
| `/assets/ThemedCalendar-Dr0pg9Ri.js` | js | 1265 | 1932 | 668 | 32.1 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1266 | 1651 | 385 | 2.4 |
| `/assets/Combination-D9gNMgBc.js` | js | 1266 | 1974 | 708 | 7.4 |
| `/assets/schemas-CzpO3tJj.js` | js | 1266 | 1982 | 716 | 3.5 |
| `/assets/index-BbAX54DG.js` | js | 1266 | 2152 | 886 | 23 |
| `/assets/Avatar-DmlKHhI1.js` | js | 1267 | 1939 | 672 | 0.9 |
| `/assets/publicProductsApi-BLRF2qea.js` | js | 1267 | 2104 | 837 | 0.7 |
| `/assets/Toast-C74PLG6A.js` | js | 1267 | 2119 | 852 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1277 | 2166 | 889 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1284 | 2288 | 1004 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1284→2288ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API real, 5 execuções)

- **LCP mediano**: 2444 ms · **FCP mediano**: 1312 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<button>` classe `flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center g` — “Agenda” (111×36px)
- **Cadeia do elemento**: button.flex-1.py-2.text-sm → div.flex.bg-surface.p-1 → main.max-w-md.sm:max-w-xl.md:max-w-3xl → div.min-h-dvh.pb-[max(5rem,env(safe-area-inset-bottom))].bg-bg → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2420 ms (1112 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2256 ms · renderização +76 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2225 · render +47 ⇒ soma ≈ 2444 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e97dae28-705f-4090-bab8-6de4ef99ab12&status=all 1318→1496ms (signal is aborted without reason) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1324→2138ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1325→2238ms status 200 [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1326→2267ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1326→2304ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1326→2311ms status 200 [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1496→2325ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e97dae28-705f-4090-bab8-6de4ef99ab12&status=all 1495→2485ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2206→2496ms status 200 [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 2411→2570ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2411→2589ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e97dae28-705f-4090-bab8-6de4ef99ab12&status=all 2667→2833ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e97dae28-705f-4090-bab8-6de4ef99ab12&status=all 3832→3990ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=e97dae28-705f-4090-bab8-6de4ef99ab12&status=all 4999→5156ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-D2kAYejh.js` | js | 180 | 1180 | 1000 | 144.4 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 181 | 600 | 420 | 27.7 |
| `/assets/PublicHome-Ca0gSXlE.js` | js | 1258 | 1553 | 295 | 8.6 |
| `/assets/notificationsApi-4FBxtjsW.js` | js | 1259 | 1425 | 167 | 1 |
| `/assets/ThemedCalendar-Dr0pg9Ri.js` | js | 1259 | 1938 | 680 | 32.1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1260 | 1436 | 177 | 0.9 |
| `/assets/StatusBadge-BavxzCjO.js` | js | 1260 | 1444 | 185 | 1.2 |
| `/assets/ConfirmDialog-CAD8lf6v.js` | js | 1260 | 1630 | 370 | 1.3 |
| `/assets/SmartSelect-O60HpWtN.js` | js | 1260 | 1703 | 443 | 17.1 |
| `/assets/ModalShell-BbARGIm5.js` | js | 1260 | 1724 | 464 | 1.4 |
| `/assets/Combination-D9gNMgBc.js` | js | 1260 | 1958 | 699 | 7.4 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1261 | 1622 | 361 | 2.4 |
| `/assets/Avatar-DmlKHhI1.js` | js | 1261 | 1916 | 655 | 0.9 |
| `/assets/schemas-CzpO3tJj.js` | js | 1261 | 1965 | 705 | 3.5 |
| `/assets/index-BbAX54DG.js` | js | 1261 | 2145 | 884 | 23 |
| `/assets/publicProductsApi-BLRF2qea.js` | js | 1262 | 2080 | 818 | 0.7 |
| `/assets/Toast-C74PLG6A.js` | js | 1262 | 2103 | 840 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1272 | 2153 | 881 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1277 | 2297 | 1019 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1277→2297ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API real, 5 execuções)

- **LCP mediano**: 2452 ms · **FCP mediano**: 1304 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<button>` classe `flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center g` — “Agenda” (285×36px)
- **Cadeia do elemento**: button.flex-1.py-2.text-sm → div.flex.bg-surface.p-1 → main.max-w-md.sm:max-w-xl.md:max-w-3xl → div.min-h-dvh.pb-[max(5rem,env(safe-area-inset-bottom))].bg-bg → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2369 ms (1077 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2212 ms · renderização +43 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2228 · render +59 ⇒ soma ≈ 2452 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=1455824f-c004-4804-a1ae-c36f0508097d&status=all 1300→1482ms (signal is aborted without reason) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1304→2166ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1305→2217ms status 200 [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1305→2248ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1305→2281ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1306→2304ms status 200 [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 1482→2310ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=1455824f-c004-4804-a1ae-c36f0508097d&status=all 1481→2415ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2176→2416ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-08 2358→2518ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2359→2575ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=1455824f-c004-4804-a1ae-c36f0508097d&status=all 2646→2812ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=1455824f-c004-4804-a1ae-c36f0508097d&status=all 3812→3977ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=1455824f-c004-4804-a1ae-c36f0508097d&status=all 4978→5143ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-Dw0xtK6y.css` | css (bloqueia pintura) | 166 | 586 | 420 | 27.7 |
| `/assets/index-D2kAYejh.js` | js | 166 | 1166 | 1000 | 144.4 |
| `/assets/PublicHome-Ca0gSXlE.js` | js | 1241 | 1539 | 298 | 8.6 |
| `/assets/notificationsApi-4FBxtjsW.js` | js | 1242 | 1416 | 174 | 1 |
| `/assets/ThemedCalendar-Dr0pg9Ri.js` | js | 1242 | 1890 | 647 | 32.1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1243 | 1423 | 181 | 0.9 |
| `/assets/StatusBadge-BavxzCjO.js` | js | 1243 | 1431 | 189 | 1.2 |
| `/assets/SmartSelect-O60HpWtN.js` | js | 1243 | 1690 | 447 | 17.1 |
| `/assets/ConfirmDialog-CAD8lf6v.js` | js | 1244 | 1616 | 373 | 1.3 |
| `/assets/ModalShell-BbARGIm5.js` | js | 1244 | 1709 | 465 | 1.4 |
| `/assets/schemas-CzpO3tJj.js` | js | 1244 | 1947 | 703 | 3.5 |
| `/assets/Combination-D9gNMgBc.js` | js | 1244 | 1953 | 709 | 7.4 |
| `/assets/index-BbAX54DG.js` | js | 1244 | 2123 | 879 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1245 | 1624 | 379 | 2.4 |
| `/assets/Avatar-DmlKHhI1.js` | js | 1245 | 1905 | 660 | 0.9 |
| `/assets/publicProductsApi-BLRF2qea.js` | js | 1245 | 2060 | 815 | 0.7 |
| `/assets/Toast-C74PLG6A.js` | js | 1245 | 2081 | 836 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1255 | 2147 | 891 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1260 | 2290 | 1029 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1260→2290ms (61.4KB)
