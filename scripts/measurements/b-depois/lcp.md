# Diagnóstico LCP — 5 execuções por rota

Condições: rede Slow 4G (1,6 Mbps / 150 ms RTT) + CPU 4×, viewport 375×667, consentimento de cookies pré-setado.

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API off, 5 execuções)

- **LCP mediano**: 2244 ms · **FCP mediano**: 1320 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (327×40px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2267 ms (911 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 8 ms · criação do elemento +2102 ms · renderização +21 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2051 · render +24 ⇒ soma ≈ 2244 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=495e8682-a8e9-476d-af07-4375a8cf76d4&status=all 1364→1388ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1374→1391ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1375→1391ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1376→1392ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1376→1392ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1376→1392ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 1391→1394ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=495e8682-a8e9-476d-af07-4375a8cf76d4&status=all 1552→1558ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2268→2270ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=495e8682-a8e9-476d-af07-4375a8cf76d4&status=all 2717→2742ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=495e8682-a8e9-476d-af07-4375a8cf76d4&status=all 3904→3906ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=495e8682-a8e9-476d-af07-4375a8cf76d4&status=all 5063→5066ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=495e8682-a8e9-476d-af07-4375a8cf76d4&status=all 6220→6223ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 194 | 616 | 422 | 27.6 |
| `/assets/index-B4LHt4ig.js` | js | 194 | 1194 | 1000 | 144.3 |
| `/assets/PublicHome-DOl6qu3G.js` | js | 1297 | 1607 | 310 | 8.6 |
| `/assets/ThemedCalendar-C3yaGN1q.js` | js | 1297 | 2009 | 712 | 32.1 |
| `/assets/notificationsApi-C2DDDjr2.js` | js | 1298 | 1479 | 181 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1298 | 1494 | 196 | 0.9 |
| `/assets/StatusBadge-BGzb1HfH.js` | js | 1298 | 1501 | 203 | 1.2 |
| `/assets/ConfirmDialog-C_XodcSJ.js` | js | 1298 | 1681 | 383 | 1.3 |
| `/assets/SmartSelect-_v2rd1TQ.js` | js | 1298 | 1758 | 460 | 17.1 |
| `/assets/ModalShell-5_wr1GbA.js` | js | 1298 | 1780 | 482 | 1.4 |
| `/assets/Combination-Do-9P_fN.js` | js | 1298 | 2002 | 704 | 7.4 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1299 | 1671 | 372 | 2.4 |
| `/assets/Avatar-B7w-0FeM.js` | js | 1299 | 1972 | 673 | 0.9 |
| `/assets/schemas-B5l_tIOE.js` | js | 1299 | 2017 | 717 | 3.5 |
| `/assets/Button-EuudMQsF.js` | js | 1299 | 2144 | 845 | 1.3 |
| `/assets/index-Bcn_OhZH.js` | js | 1299 | 2194 | 895 | 23 |
| `/assets/Card-lyYKrNPX.js` | js | 1300 | 2174 | 873 | 0.5 |
| `/assets/publicProductsApi-DtXHFhCJ.js` | js | 1300 | 2188 | 887 | 0.7 |
| `/assets/Toast-DrYXqUKR.js` | js | 1300 | 2202 | 902 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1309 | 2322 | 1013 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1316 | 2337 | 1021 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1316→2337ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API off, 5 execuções)

- **LCP mediano**: 2236 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (327×40px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2210 ms (914 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2045 ms · renderização +30 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2045 · render +20 ⇒ soma ≈ 2236 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=3133946f-0f3c-4cc0-a933-558388db0eb6&status=all 1303→1316ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1306→1319ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1306→1319ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1308→1319ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1308→1319ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1309→1319ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 1317→1322ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=3133946f-0f3c-4cc0-a933-558388db0eb6&status=all 1488→1489ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2209→2211ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=3133946f-0f3c-4cc0-a933-558388db0eb6&status=all 2653→2655ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=3133946f-0f3c-4cc0-a933-558388db0eb6&status=all 3819→3820ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=3133946f-0f3c-4cc0-a933-558388db0eb6&status=all 4985→4987ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=3133946f-0f3c-4cc0-a933-558388db0eb6&status=all 6143→6146ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 182 | 602 | 420 | 27.6 |
| `/assets/index-B4LHt4ig.js` | js | 182 | 1181 | 1000 | 144.3 |
| `/assets/PublicHome-DOl6qu3G.js` | js | 1254 | 1566 | 312 | 8.6 |
| `/assets/ThemedCalendar-C3yaGN1q.js` | js | 1254 | 1971 | 717 | 32.1 |
| `/assets/notificationsApi-C2DDDjr2.js` | js | 1255 | 1432 | 177 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1255 | 1455 | 200 | 0.9 |
| `/assets/StatusBadge-BGzb1HfH.js` | js | 1255 | 1459 | 204 | 1.2 |
| `/assets/ConfirmDialog-C_XodcSJ.js` | js | 1255 | 1637 | 382 | 1.3 |
| `/assets/SmartSelect-_v2rd1TQ.js` | js | 1255 | 1719 | 464 | 17.1 |
| `/assets/ModalShell-5_wr1GbA.js` | js | 1255 | 1740 | 485 | 1.4 |
| `/assets/Combination-Do-9P_fN.js` | js | 1255 | 1959 | 704 | 7.4 |
| `/assets/schemas-B5l_tIOE.js` | js | 1255 | 1982 | 727 | 3.5 |
| `/assets/index-Bcn_OhZH.js` | js | 1255 | 2140 | 884 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1256 | 1623 | 367 | 2.4 |
| `/assets/Avatar-B7w-0FeM.js` | js | 1256 | 1932 | 675 | 0.9 |
| `/assets/Button-EuudMQsF.js` | js | 1256 | 2102 | 846 | 1.3 |
| `/assets/Card-lyYKrNPX.js` | js | 1256 | 2124 | 867 | 0.5 |
| `/assets/publicProductsApi-DtXHFhCJ.js` | js | 1257 | 2148 | 891 | 0.7 |
| `/assets/Toast-DrYXqUKR.js` | js | 1257 | 2161 | 904 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1265 | 2276 | 1011 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1268 | 2297 | 1029 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1268→2297ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API off, 5 execuções)

- **LCP mediano**: 1696 ms · **FCP mediano**: 1292 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-lg font-bold` — “Não foi possível conectar ao servidor. Verifique se a API está no ar e tente de novo.” (327×84px)
- **Cadeia do elemento**: h1.text-lg.font-bold → div → div.mx-auto.flex.min-h-dvh → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 18px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1678 ms (394 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1514 ms · renderização +26 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1509 · render +25 ⇒ soma ≈ 1696 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1669→1674ms (Failed to fetch) [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 178 | 595 | 417 | 27.6 |
| `/assets/index-B4LHt4ig.js` | js | 178 | 1174 | 996 | 144.3 |
| `/assets/PublicProductPage-CgogK2o6.js` | js | 1246 | 1487 | 241 | 3.4 |
| `/assets/index-Bcn_OhZH.js` | js | 1246 | 1610 | 363 | 23 |
| `/assets/publicProductsApi-DtXHFhCJ.js` | js | 1247 | 1416 | 169 | 0.7 |
| `/assets/StatusBadge-BGzb1HfH.js` | js | 1247 | 1446 | 200 | 1.2 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1247 | 1452 | 205 | 0.9 |
| `/assets/schemas-B5l_tIOE.js` | js | 1247 | 1497 | 251 | 3.5 |
| `/assets/Field-BPkRRELV.js` | js | 1247 | 1618 | 371 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1255 | 1638 | 383 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1259 | 1910 | 651 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1259→1910ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API off, 5 execuções)

- **LCP mediano**: 2224 ms · **FCP mediano**: 1304 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (377×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2214 ms (906 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +2049 ms · renderização +26 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2040 · render +26 ⇒ soma ≈ 2224 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=6a2c49ec-36ec-4343-8702-82e670f6f9cf&status=all 1315→1327ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1318→1330ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1319→1330ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1320→1331ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1320→1331ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1320→1331ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 1328→1335ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=6a2c49ec-36ec-4343-8702-82e670f6f9cf&status=all 1494→1534ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2214→2217ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=6a2c49ec-36ec-4343-8702-82e670f6f9cf&status=all 2696→2698ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=6a2c49ec-36ec-4343-8702-82e670f6f9cf&status=all 3862→3863ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=6a2c49ec-36ec-4343-8702-82e670f6f9cf&status=all 5027→5029ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=6a2c49ec-36ec-4343-8702-82e670f6f9cf&status=all 6186→6189ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-B4LHt4ig.js` | js | 171 | 1181 | 1010 | 144.3 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 172 | 601 | 429 | 27.6 |
| `/assets/notificationsApi-C2DDDjr2.js` | js | 1261 | 1437 | 176 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1261 | 1454 | 193 | 0.9 |
| `/assets/PublicHome-DOl6qu3G.js` | js | 1261 | 1565 | 304 | 8.6 |
| `/assets/SmartSelect-_v2rd1TQ.js` | js | 1261 | 1732 | 470 | 17.1 |
| `/assets/ThemedCalendar-C3yaGN1q.js` | js | 1261 | 1973 | 712 | 32.1 |
| `/assets/StatusBadge-BGzb1HfH.js` | js | 1262 | 1469 | 207 | 1.2 |
| `/assets/ConfirmDialog-C_XodcSJ.js` | js | 1262 | 1652 | 389 | 1.3 |
| `/assets/ModalShell-5_wr1GbA.js` | js | 1262 | 1737 | 475 | 1.4 |
| `/assets/Combination-Do-9P_fN.js` | js | 1262 | 1940 | 677 | 7.4 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1263 | 1622 | 360 | 2.4 |
| `/assets/schemas-B5l_tIOE.js` | js | 1263 | 1990 | 727 | 3.5 |
| `/assets/index-Bcn_OhZH.js` | js | 1263 | 2167 | 905 | 23 |
| `/assets/Avatar-B7w-0FeM.js` | js | 1264 | 1923 | 660 | 0.9 |
| `/assets/Button-EuudMQsF.js` | js | 1264 | 2095 | 832 | 1.3 |
| `/assets/Card-lyYKrNPX.js` | js | 1264 | 2116 | 852 | 0.5 |
| `/assets/publicProductsApi-DtXHFhCJ.js` | js | 1264 | 2147 | 884 | 0.7 |
| `/assets/Toast-DrYXqUKR.js` | js | 1264 | 2160 | 896 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1271 | 2275 | 1004 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1275 | 2304 | 1029 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1275→2304ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API off, 5 execuções)

- **LCP mediano**: 2228 ms · **FCP mediano**: 1300 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (377×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2203 ms (911 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2038 ms · renderização +17 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +2038 · render +26 ⇒ soma ≈ 2228 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ba8c5210-75a9-451e-ab7d-118fb793c664&status=all 1299→1308ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1302→1313ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1303→1313ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1304→1314ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1304→1314ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1304→1314ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 1309→1315ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ba8c5210-75a9-451e-ab7d-118fb793c664&status=all 1481→1484ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2202→2206ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ba8c5210-75a9-451e-ab7d-118fb793c664&status=all 2646→2649ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ba8c5210-75a9-451e-ab7d-118fb793c664&status=all 3811→3813ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ba8c5210-75a9-451e-ab7d-118fb793c664&status=all 4977→4980ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ba8c5210-75a9-451e-ab7d-118fb793c664&status=all 6143→6145ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-B4LHt4ig.js` | js | 172 | 1173 | 1001 | 144.3 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 173 | 595 | 422 | 27.6 |
| `/assets/PublicHome-DOl6qu3G.js` | js | 1248 | 1555 | 306 | 8.6 |
| `/assets/notificationsApi-C2DDDjr2.js` | js | 1249 | 1450 | 201 | 1 |
| `/assets/ThemedCalendar-C3yaGN1q.js` | js | 1249 | 1925 | 676 | 32.1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1250 | 1450 | 201 | 0.9 |
| `/assets/StatusBadge-BGzb1HfH.js` | js | 1250 | 1451 | 201 | 1.2 |
| `/assets/ConfirmDialog-C_XodcSJ.js` | js | 1250 | 1618 | 368 | 1.3 |
| `/assets/SmartSelect-_v2rd1TQ.js` | js | 1250 | 1694 | 445 | 17.1 |
| `/assets/ModalShell-5_wr1GbA.js` | js | 1250 | 1723 | 473 | 1.4 |
| `/assets/Combination-Do-9P_fN.js` | js | 1250 | 1939 | 689 | 7.4 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1251 | 1660 | 409 | 2.4 |
| `/assets/Avatar-B7w-0FeM.js` | js | 1251 | 1910 | 659 | 0.9 |
| `/assets/schemas-B5l_tIOE.js` | js | 1251 | 1953 | 702 | 3.5 |
| `/assets/Button-EuudMQsF.js` | js | 1251 | 2074 | 823 | 1.3 |
| `/assets/index-Bcn_OhZH.js` | js | 1251 | 2153 | 903 | 23 |
| `/assets/Card-lyYKrNPX.js` | js | 1252 | 2096 | 845 | 0.5 |
| `/assets/publicProductsApi-DtXHFhCJ.js` | js | 1252 | 2117 | 865 | 0.7 |
| `/assets/Toast-DrYXqUKR.js` | js | 1252 | 2131 | 880 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1260 | 2252 | 992 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1263 | 2281 | 1019 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1263→2281ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API off, 5 execuções)

- **LCP mediano**: 1700 ms · **FCP mediano**: 1296 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-lg font-bold` — “Não foi possível conectar ao servidor. Verifique se a API está no ar e tente de novo.” (400×56px)
- **Cadeia do elemento**: h1.text-lg.font-bold → div → div.mx-auto.flex.min-h-dvh → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 18px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1676 ms (372 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1512 ms · renderização +24 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1517 · render +24 ⇒ soma ≈ 1700 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1664→1670ms (Failed to fetch) [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 172 | 600 | 428 | 27.6 |
| `/assets/index-B4LHt4ig.js` | js | 172 | 1183 | 1011 | 144.3 |
| `/assets/PublicProductPage-CgogK2o6.js` | js | 1255 | 1490 | 235 | 3.4 |
| `/assets/publicProductsApi-DtXHFhCJ.js` | js | 1256 | 1430 | 174 | 0.7 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1256 | 1453 | 197 | 0.9 |
| `/assets/StatusBadge-BGzb1HfH.js` | js | 1256 | 1460 | 204 | 1.2 |
| `/assets/schemas-B5l_tIOE.js` | js | 1256 | 1495 | 239 | 3.5 |
| `/assets/index-Bcn_OhZH.js` | js | 1256 | 1603 | 347 | 23 |
| `/assets/Field-BPkRRELV.js` | js | 1257 | 1617 | 360 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1267 | 1645 | 378 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1272 | 1918 | 647 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1272→1918ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API real, 5 execuções)

- **LCP mediano**: 2504 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary leading-relaxed` — “O salão está tranquilo agora. Ótimo momento para chegar e ser atendido(a) sem espera.” (245×68px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.leading-relaxed → div.rounded-xl.bg-bg/80.border → div.relative.pl-5.pr-5 → div.mb-6.relative.overflow-hidden → main.max-w-md.sm:max-w-xl.md:max-w-3xl → div.min-h-dvh.pb-[max(5rem,env(safe-area-inset-bottom))].bg-bg
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2460 ms (1152 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · criação do elemento +2296 ms · renderização +64 ms
- **Divisão (mediana)**: TTFB 1 · elemento/recurso +2296 · render +45 ⇒ soma ≈ 2504 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=885b81e0-21b6-44ff-826a-611878f16206&status=all 1315→1497ms (signal is aborted without reason) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1318→2285ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1319→2297ms status 200 [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1319→2311ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1319→2317ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1319→2433ms status 200 [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 1499→2447ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=885b81e0-21b6-44ff-826a-611878f16206&status=all 1495→2461ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2203→2469ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=885b81e0-21b6-44ff-826a-611878f16206&status=all 2692→2870ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=885b81e0-21b6-44ff-826a-611878f16206&status=all 3869→4034ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=885b81e0-21b6-44ff-826a-611878f16206&status=all 5035→5200ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 179 | 600 | 422 | 27.6 |
| `/assets/index-B4LHt4ig.js` | js | 179 | 1181 | 1002 | 144.3 |
| `/assets/PublicHome-DOl6qu3G.js` | js | 1257 | 1552 | 295 | 8.6 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1258 | 1416 | 158 | 0.9 |
| `/assets/notificationsApi-C2DDDjr2.js` | js | 1258 | 1424 | 166 | 1 |
| `/assets/ThemedCalendar-C3yaGN1q.js` | js | 1258 | 1976 | 718 | 32.1 |
| `/assets/StatusBadge-BGzb1HfH.js` | js | 1259 | 1430 | 171 | 1.2 |
| `/assets/ConfirmDialog-C_XodcSJ.js` | js | 1259 | 1609 | 350 | 1.3 |
| `/assets/SmartSelect-_v2rd1TQ.js` | js | 1259 | 1701 | 443 | 17.1 |
| `/assets/ModalShell-5_wr1GbA.js` | js | 1259 | 1724 | 465 | 1.4 |
| `/assets/Combination-Do-9P_fN.js` | js | 1259 | 1947 | 688 | 7.4 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1260 | 1616 | 356 | 2.4 |
| `/assets/Avatar-B7w-0FeM.js` | js | 1260 | 1918 | 658 | 0.9 |
| `/assets/schemas-B5l_tIOE.js` | js | 1260 | 1961 | 702 | 3.5 |
| `/assets/Button-EuudMQsF.js` | js | 1260 | 2089 | 828 | 1.3 |
| `/assets/index-Bcn_OhZH.js` | js | 1260 | 2132 | 873 | 23 |
| `/assets/Card-lyYKrNPX.js` | js | 1261 | 2118 | 857 | 0.5 |
| `/assets/publicProductsApi-DtXHFhCJ.js` | js | 1261 | 2139 | 878 | 0.7 |
| `/assets/Toast-DrYXqUKR.js` | js | 1261 | 2153 | 892 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1270 | 2267 | 997 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1276 | 2288 | 1013 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1276→2288ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API real, 5 execuções)

- **LCP mediano**: 1308 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary` — “Carregando...” (88×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary → div.flex.flex-col.items-center → div.flex.items-center.justify-center → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1258 ms (antes/do FCP)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · criação do elemento +1100 ms · renderização +30 ms
- **Divisão (mediana)**: TTFB 1 · elemento/recurso +1110 · render +34 ⇒ soma ≈ 1308 ms
- **Depende de JS**: elemento criado após FCP em 0/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2279ec10-6c35-4a9c-b517-fe940f6c2feb&status=all 1296→1475ms (signal is aborted without reason) [depois do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1299→2269ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1300→2298ms status 200 [depois do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1301→2304ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1301→2312ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1301→2418ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2279ec10-6c35-4a9c-b517-fe940f6c2feb&status=all 1474→2447ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 1475→2453ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2188→2594ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 2522→2684ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2523→2692ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2279ec10-6c35-4a9c-b517-fe940f6c2feb&status=all 2768→2933ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2279ec10-6c35-4a9c-b517-fe940f6c2feb&status=all 3933→4099ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2279ec10-6c35-4a9c-b517-fe940f6c2feb&status=all 5100→5264ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 158 | 158 | 1.2 |
| `/assets/index-B4LHt4ig.js` | js | 172 | 1168 | 996 | 144.3 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 173 | 586 | 413 | 27.6 |
| `/assets/PublicHome-DOl6qu3G.js` | js | 1245 | 1544 | 299 | 8.6 |
| `/assets/notificationsApi-C2DDDjr2.js` | js | 1246 | 1416 | 170 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1246 | 1425 | 179 | 0.9 |
| `/assets/StatusBadge-BGzb1HfH.js` | js | 1246 | 1437 | 191 | 1.2 |
| `/assets/ConfirmDialog-C_XodcSJ.js` | js | 1246 | 1618 | 372 | 1.3 |
| `/assets/SmartSelect-_v2rd1TQ.js` | js | 1246 | 1695 | 449 | 17.1 |
| `/assets/ModalShell-5_wr1GbA.js` | js | 1246 | 1716 | 470 | 1.4 |
| `/assets/ThemedCalendar-C3yaGN1q.js` | js | 1246 | 1933 | 687 | 32.1 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1247 | 1624 | 377 | 2.4 |
| `/assets/Avatar-B7w-0FeM.js` | js | 1247 | 1903 | 655 | 0.9 |
| `/assets/Combination-Do-9P_fN.js` | js | 1247 | 1953 | 705 | 7.4 |
| `/assets/schemas-B5l_tIOE.js` | js | 1247 | 1961 | 714 | 3.5 |
| `/assets/index-Bcn_OhZH.js` | js | 1247 | 2140 | 893 | 23 |
| `/assets/Button-EuudMQsF.js` | js | 1248 | 2074 | 826 | 1.3 |
| `/assets/Card-lyYKrNPX.js` | js | 1248 | 2103 | 854 | 0.5 |
| `/assets/publicProductsApi-DtXHFhCJ.js` | js | 1248 | 2126 | 878 | 0.7 |
| `/assets/Toast-DrYXqUKR.js` | js | 1249 | 2132 | 884 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1258 | 2253 | 995 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1262 | 2289 | 1027 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1262→2289ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API real, 5 execuções)

- **LCP mediano**: 1884 ms · **FCP mediano**: 1300 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-xl font-bold` — “Produto Sintetico 01” (191×28px)
- **Cadeia do elemento**: h1.text-xl.font-bold → div.flex.flex-wrap.items-center → div.rounded-2xl.border.border-border → main.mx-auto.max-w-md.px-4 → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 20px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1849 ms (541 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1683 ms · renderização +39 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1679 · render +39 ⇒ soma ≈ 1884 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1669→1834ms status 200 [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 166 | 166 | 1.2 |
| `/assets/index-B4LHt4ig.js` | js | 183 | 1189 | 1006 | 144.3 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 184 | 607 | 423 | 27.6 |
| `/assets/publicProductsApi-DtXHFhCJ.js` | js | 1264 | 1433 | 169 | 0.7 |
| `/assets/PublicProductPage-CgogK2o6.js` | js | 1264 | 1495 | 232 | 3.4 |
| `/assets/schemas-B5l_tIOE.js` | js | 1264 | 1502 | 238 | 3.5 |
| `/assets/index-Bcn_OhZH.js` | js | 1264 | 1624 | 360 | 23 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1265 | 1445 | 180 | 0.9 |
| `/assets/StatusBadge-BGzb1HfH.js` | js | 1265 | 1460 | 196 | 1.2 |
| `/assets/Field-BPkRRELV.js` | js | 1265 | 1609 | 345 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1274 | 1646 | 372 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1279 | 1933 | 654 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1279→1933ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API real, 5 execuções)

- **LCP mediano**: 2504 ms · **FCP mediano**: 1296 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary leading-relaxed` — “O salão está tranquilo agora. Ótimo momento para chegar e ser atendido(a) sem espera.” (573×23px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.leading-relaxed → div.rounded-xl.bg-bg/80.border → div.relative.pl-5.pr-5 → div.mb-6.relative.overflow-hidden → main.max-w-md.sm:max-w-xl.md:max-w-3xl → div.min-h-dvh.pb-[max(5rem,env(safe-area-inset-bottom))].bg-bg
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2439 ms (1127 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2275 ms · renderização +37 ms
- **Divisão (mediana)**: TTFB 1 · elemento/recurso +2288 · render +47 ⇒ soma ≈ 2504 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=7d7e5312-d2e0-4de9-82f5-cc3db3a7749d&status=all 1320→1503ms (signal is aborted without reason) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1324→2260ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1325→2289ms status 200 [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1326→2303ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1326→2310ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1326→2410ms status 200 [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 1505→2432ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=7d7e5312-d2e0-4de9-82f5-cc3db3a7749d&status=all 1502→2467ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2197→2467ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=7d7e5312-d2e0-4de9-82f5-cc3db3a7749d&status=all 2684→2848ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=7d7e5312-d2e0-4de9-82f5-cc3db3a7749d&status=all 3854→4020ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=7d7e5312-d2e0-4de9-82f5-cc3db3a7749d&status=all 5020→5186ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 172 | 593 | 421 | 27.6 |
| `/assets/index-B4LHt4ig.js` | js | 172 | 1173 | 1001 | 144.3 |
| `/assets/PublicHome-DOl6qu3G.js` | js | 1256 | 1556 | 300 | 8.6 |
| `/assets/notificationsApi-C2DDDjr2.js` | js | 1257 | 1431 | 174 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1257 | 1438 | 181 | 0.9 |
| `/assets/SmartSelect-_v2rd1TQ.js` | js | 1257 | 1702 | 445 | 17.1 |
| `/assets/ThemedCalendar-C3yaGN1q.js` | js | 1257 | 1903 | 646 | 32.1 |
| `/assets/StatusBadge-BGzb1HfH.js` | js | 1258 | 1445 | 187 | 1.2 |
| `/assets/ConfirmDialog-C_XodcSJ.js` | js | 1258 | 1630 | 373 | 1.3 |
| `/assets/ModalShell-5_wr1GbA.js` | js | 1258 | 1723 | 466 | 1.4 |
| `/assets/Combination-Do-9P_fN.js` | js | 1258 | 1966 | 708 | 7.4 |
| `/assets/index-Bcn_OhZH.js` | js | 1258 | 2147 | 888 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1259 | 1638 | 379 | 2.4 |
| `/assets/Avatar-B7w-0FeM.js` | js | 1259 | 1916 | 657 | 0.9 |
| `/assets/schemas-B5l_tIOE.js` | js | 1259 | 1954 | 695 | 3.5 |
| `/assets/Button-EuudMQsF.js` | js | 1259 | 2074 | 815 | 1.3 |
| `/assets/Card-lyYKrNPX.js` | js | 1259 | 2089 | 829 | 0.5 |
| `/assets/publicProductsApi-DtXHFhCJ.js` | js | 1259 | 2124 | 865 | 0.7 |
| `/assets/Toast-DrYXqUKR.js` | js | 1260 | 2138 | 879 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1269 | 2247 | 978 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1275 | 2317 | 1042 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1275→2317ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API real, 5 execuções)

- **LCP mediano**: 1300 ms · **FCP mediano**: 1300 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary` — “Carregando...” (88×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary → div.flex.flex-col.items-center → div.flex.items-center.justify-center → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1262 ms (antes/do FCP)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · criação do elemento +1105 ms · renderização +38 ms
- **Divisão (mediana)**: TTFB 1 · elemento/recurso +1098 · render +38 ⇒ soma ≈ 1300 ms
- **Depende de JS**: elemento criado após FCP em 0/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2b84c854-0fd6-4a18-9f1c-1eaad2122c28&status=all 1305→1481ms (signal is aborted without reason) [depois do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1308→2268ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 1309→2290ms status 200 [depois do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1309→2304ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 1310→2312ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 1310→2417ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 1483→2447ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2b84c854-0fd6-4a18-9f1c-1eaad2122c28&status=all 1480→2555ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2187→2556ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 2499→2660ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2500→2669ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2b84c854-0fd6-4a18-9f1c-1eaad2122c28&status=all 2725→2890ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2b84c854-0fd6-4a18-9f1c-1eaad2122c28&status=all 3890→4055ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2b84c854-0fd6-4a18-9f1c-1eaad2122c28&status=all 5057→5222ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-B4LHt4ig.js` | js | 165 | 1168 | 1003 | 144.3 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 166 | 588 | 423 | 27.6 |
| `/assets/PublicHome-DOl6qu3G.js` | js | 1247 | 1544 | 297 | 8.6 |
| `/assets/notificationsApi-C2DDDjr2.js` | js | 1248 | 1416 | 168 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1248 | 1423 | 175 | 0.9 |
| `/assets/StatusBadge-BGzb1HfH.js` | js | 1248 | 1439 | 191 | 1.2 |
| `/assets/ConfirmDialog-C_XodcSJ.js` | js | 1248 | 1623 | 375 | 1.3 |
| `/assets/SmartSelect-_v2rd1TQ.js` | js | 1248 | 1702 | 454 | 17.1 |
| `/assets/ModalShell-5_wr1GbA.js` | js | 1248 | 1718 | 470 | 1.4 |
| `/assets/ThemedCalendar-C3yaGN1q.js` | js | 1248 | 1940 | 692 | 32.1 |
| `/assets/Combination-Do-9P_fN.js` | js | 1249 | 1952 | 703 | 7.4 |
| `/assets/index-Bcn_OhZH.js` | js | 1249 | 2131 | 882 | 23 |
| `/assets/ThemedCalendar-CVhhtr8Y.css` | css (bloqueia pintura) | 1250 | 1617 | 367 | 2.4 |
| `/assets/Avatar-B7w-0FeM.js` | js | 1250 | 1910 | 660 | 0.9 |
| `/assets/schemas-B5l_tIOE.js` | js | 1250 | 1962 | 712 | 3.5 |
| `/assets/Button-EuudMQsF.js` | js | 1250 | 2075 | 825 | 1.3 |
| `/assets/Card-lyYKrNPX.js` | js | 1250 | 2110 | 860 | 0.5 |
| `/assets/publicProductsApi-DtXHFhCJ.js` | js | 1251 | 2125 | 875 | 0.7 |
| `/assets/Toast-DrYXqUKR.js` | js | 1251 | 2139 | 888 | 0.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1262 | 2253 | 991 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1265 | 2297 | 1031 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1265→2297ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API real, 5 execuções)

- **LCP mediano**: 1864 ms · **FCP mediano**: 1300 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-center text-2xs leading-relaxed text-text-muted` — “A reserva é gratuita e não é um pagamento. O pagamento é feito na retirada. Informe seu no” (374×39px)
- **Cadeia do elemento**: p.text-center.text-2xs.leading-relaxed → form.mt-4.space-y-4.rounded-2xl → main.mx-auto.max-w-md.px-4 → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 12px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1768 ms (532 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · criação do elemento +1611 ms · renderização +40 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1670 · render +40 ⇒ soma ≈ 1864 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1588→1753ms status 200 [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-B4LHt4ig.js` | js | 163 | 1161 | 999 | 144.3 |
| `/assets/index-MBgDwb25.css` | css (bloqueia pintura) | 164 | 579 | 415 | 27.6 |
| `/assets/publicProductsApi-DtXHFhCJ.js` | js | 1198 | 1373 | 175 | 0.7 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1198 | 1380 | 182 | 0.9 |
| `/assets/StatusBadge-BGzb1HfH.js` | js | 1198 | 1388 | 190 | 1.2 |
| `/assets/PublicProductPage-CgogK2o6.js` | js | 1198 | 1423 | 225 | 3.4 |
| `/assets/schemas-B5l_tIOE.js` | js | 1198 | 1438 | 240 | 3.5 |
| `/assets/index-Bcn_OhZH.js` | js | 1198 | 1531 | 333 | 23 |
| `/assets/Field-BPkRRELV.js` | js | 1198 | 1544 | 346 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1200 | 1574 | 374 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1201 | 1860 | 659 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1201→1860ms (61.4KB)
