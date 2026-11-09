# Diagnóstico LCP — 3 execuções por rota

Condições: rede Slow 4G (1,6 Mbps / 150 ms RTT) + CPU 4×, viewport 375×667, consentimento de cookies pré-setado.

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API off, 3 execuções)

- **LCP mediano**: 2940 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (327×40px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2934 ms (1626 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 5 ms · criação do elemento +2769 ms · renderização +6 ms
- **Divisão (mediana)**: TTFB 4 · elemento/recurso +2753 · render +11 ⇒ soma ≈ 2940 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2876→2914ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ea7c8565-9f2a-471e-bc3c-e6d05af641c8&status=all 2881→2916ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2892→2919ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 2893→2919ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2893→2919ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2893→2920ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 2894→2920ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 2918→2931ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ea7c8565-9f2a-471e-bc3c-e6d05af641c8&status=all 3055→3058ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ea7c8565-9f2a-471e-bc3c-e6d05af641c8&status=all 4218→4220ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ea7c8565-9f2a-471e-bc3c-e6d05af641c8&status=all 5384→5386ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-BFIhfbNw.js` | js | 184 | 1178 | 994 | 144.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 185 | 599 | 414 | 27.5 |
| `/assets/PublicHome-Cz-drsY3.js` | js | 1255 | 1557 | 302 | 8.5 |
| `/assets/notificationsApi-BF_63z01.js` | js | 1256 | 1443 | 187 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1256 | 1451 | 195 | 0.9 |
| `/assets/StatusBadge-BY30jDQT.js` | js | 1256 | 1459 | 203 | 1.2 |
| `/assets/ConfirmDialog-BKai1sG_.js` | js | 1256 | 1645 | 389 | 1.3 |
| `/assets/SmartSelect-DTnHc8X9.js` | js | 1256 | 1708 | 452 | 17.1 |
| `/assets/ShopProfile-Csz8-EgY.js` | js | 1256 | 2081 | 825 | 39.3 |
| `/assets/ModalShell-y7GE-xk4.js` | js | 1257 | 1731 | 474 | 1.4 |
| `/assets/Combination-D9hMB0-M.js` | js | 1257 | 1973 | 716 | 7.4 |
| `/assets/schemas-bbERxAmZ.js` | js | 1257 | 1981 | 724 | 3.5 |
| `/assets/PostDetail-NMMRqz1j.js` | js | 1257 | 2036 | 779 | 4.6 |
| `/assets/index-BYJWPTdV.js` | js | 1257 | 2209 | 952 | 23 |
| `/assets/ShopProfile-boBQ_sKJ.css` | css (bloqueia pintura) | 1258 | 1636 | 378 | 2.3 |
| `/assets/Toast-CwikF2ub.js` | js | 1258 | 2153 | 895 | 0.9 |
| `/assets/clientPortalApi-BtbMxQgj.js` | js | 1258 | 2173 | 915 | 1.7 |
| `/assets/reputationApi-BcBDaXIO.js` | js | 1258 | 2202 | 944 | 0.8 |
| `/assets/chart-B3OGkCZ2.js` | js | 1258 | 2809 | 1551 | 77.9 |
| `/assets/Card-DZ_LaXyp.js` | js | 1259 | 2344 | 1085 | 0.5 |
| `/assets/Avatar-M1q1IKNs.js` | js | 1259 | 2381 | 1122 | 0.9 |
| `/assets/utils-DCADjnpI.js` | js | 1259 | 2473 | 1214 | 8.8 |
| `/assets/Button-B6XUSs3y.js` | js | 1260 | 2387 | 1128 | 1.3 |
| `/assets/publicProductsApi-BS4AzQVg.js` | js | 1260 | 2511 | 1251 | 0.7 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1268 | 2559 | 1291 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1274 | 2494 | 1220 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1274→2494ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API off, 3 execuções)

- **LCP mediano**: 2936 ms · **FCP mediano**: 1312 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (327×40px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2902 ms (1590 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 3 ms · criação do elemento +2738 ms · renderização +22 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +2755 · render +20 ⇒ soma ≈ 2936 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2875→2895ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=5f3b3c4d-2ad4-4b25-9aee-cc4291a5b1bf&status=all 2877→2897ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2879→2898ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 2879→2898ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2879→2898ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2880→2898ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 2880→2899ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 2897→2901ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=5f3b3c4d-2ad4-4b25-9aee-cc4291a5b1bf&status=all 3040→3042ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=5f3b3c4d-2ad4-4b25-9aee-cc4291a5b1bf&status=all 4204→4207ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=5f3b3c4d-2ad4-4b25-9aee-cc4291a5b1bf&status=all 5363→5367ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 179 | 602 | 422 | 27.5 |
| `/assets/index-BFIhfbNw.js` | js | 179 | 1180 | 1001 | 144.2 |
| `/assets/PublicHome-Cz-drsY3.js` | js | 1258 | 1561 | 302 | 8.5 |
| `/assets/ShopProfile-Csz8-EgY.js` | js | 1259 | 2089 | 830 | 39.3 |
| `/assets/notificationsApi-BF_63z01.js` | js | 1260 | 1430 | 170 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1260 | 1453 | 193 | 0.9 |
| `/assets/StatusBadge-BY30jDQT.js` | js | 1260 | 1458 | 198 | 1.2 |
| `/assets/ConfirmDialog-BKai1sG_.js` | js | 1260 | 1637 | 377 | 1.3 |
| `/assets/SmartSelect-DTnHc8X9.js` | js | 1260 | 1709 | 449 | 17.1 |
| `/assets/ModalShell-y7GE-xk4.js` | js | 1260 | 1730 | 470 | 1.4 |
| `/assets/Combination-D9hMB0-M.js` | js | 1260 | 1938 | 678 | 7.4 |
| `/assets/schemas-bbERxAmZ.js` | js | 1261 | 1975 | 714 | 3.5 |
| `/assets/PostDetail-NMMRqz1j.js` | js | 1261 | 2024 | 763 | 4.6 |
| `/assets/index-BYJWPTdV.js` | js | 1261 | 2203 | 942 | 23 |
| `/assets/ShopProfile-boBQ_sKJ.css` | css (bloqueia pintura) | 1262 | 1617 | 355 | 2.3 |
| `/assets/clientPortalApi-BtbMxQgj.js` | js | 1262 | 2132 | 870 | 1.7 |
| `/assets/Toast-CwikF2ub.js` | js | 1262 | 2153 | 891 | 0.9 |
| `/assets/reputationApi-BcBDaXIO.js` | js | 1262 | 2195 | 933 | 0.8 |
| `/assets/utils-DCADjnpI.js` | js | 1262 | 2445 | 1182 | 8.8 |
| `/assets/chart-B3OGkCZ2.js` | js | 1262 | 2811 | 1548 | 77.9 |
| `/assets/Card-DZ_LaXyp.js` | js | 1263 | 2332 | 1069 | 0.5 |
| `/assets/Avatar-M1q1IKNs.js` | js | 1263 | 2375 | 1112 | 0.9 |
| `/assets/Button-B6XUSs3y.js` | js | 1263 | 2389 | 1126 | 1.3 |
| `/assets/publicProductsApi-BS4AzQVg.js` | js | 1263 | 2503 | 1240 | 0.7 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1274 | 2553 | 1279 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1279 | 2496 | 1217 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1279→2496ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API off, 3 execuções)

- **LCP mediano**: 1708 ms · **FCP mediano**: 1296 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-lg font-bold` — “Não foi possível conectar ao servidor. Verifique se a API está no ar e tente de novo.” (327×84px)
- **Cadeia do elemento**: h1.text-lg.font-bold → div → div.mx-auto.flex.min-h-dvh → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 18px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1675 ms (371 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1518 ms · renderização +33 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1518 · render +24 ⇒ soma ≈ 1708 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1669→1672ms (Failed to fetch) [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-BFIhfbNw.js` | js | 175 | 1172 | 998 | 144.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 176 | 594 | 418 | 27.5 |
| `/assets/PublicProductPage-BPSGZMm-.js` | js | 1252 | 1489 | 236 | 3.3 |
| `/assets/index-BYJWPTdV.js` | js | 1252 | 1603 | 351 | 23 |
| `/assets/publicProductsApi-BS4AzQVg.js` | js | 1253 | 1431 | 178 | 0.7 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1254 | 1453 | 200 | 0.9 |
| `/assets/StatusBadge-BY30jDQT.js` | js | 1254 | 1460 | 206 | 1.2 |
| `/assets/schemas-bbERxAmZ.js` | js | 1254 | 1494 | 241 | 3.5 |
| `/assets/Field-DzEiuVIJ.js` | js | 1254 | 1617 | 363 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1263 | 1647 | 384 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1269 | 1916 | 647 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1269→1916ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API off, 3 execuções)

- **LCP mediano**: 2948 ms · **FCP mediano**: 1300 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (379×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2931 ms (1631 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2766 ms · renderização +29 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2750 · render +29 ⇒ soma ≈ 2948 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2890→2912ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2d757e38-8abf-4a32-a024-a4c64318d70c&status=all 2892→2914ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2894→2915ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 2895→2915ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2896→2915ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2896→2915ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 2897→2915ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 2914→2927ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2d757e38-8abf-4a32-a024-a4c64318d70c&status=all 3055→3056ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2d757e38-8abf-4a32-a024-a4c64318d70c&status=all 4220→4222ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=2d757e38-8abf-4a32-a024-a4c64318d70c&status=all 5385→5388ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-BFIhfbNw.js` | js | 174 | 1181 | 1007 | 144.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 175 | 600 | 425 | 27.5 |
| `/assets/notificationsApi-BF_63z01.js` | js | 1254 | 1459 | 205 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1254 | 1466 | 212 | 0.9 |
| `/assets/StatusBadge-BY30jDQT.js` | js | 1254 | 1473 | 219 | 1.2 |
| `/assets/PublicHome-Cz-drsY3.js` | js | 1254 | 1574 | 321 | 8.5 |
| `/assets/ConfirmDialog-BKai1sG_.js` | js | 1254 | 1652 | 397 | 1.3 |
| `/assets/SmartSelect-DTnHc8X9.js` | js | 1254 | 1724 | 470 | 17.1 |
| `/assets/ModalShell-y7GE-xk4.js` | js | 1254 | 1745 | 491 | 1.4 |
| `/assets/Combination-D9hMB0-M.js` | js | 1254 | 1989 | 735 | 7.4 |
| `/assets/schemas-bbERxAmZ.js` | js | 1254 | 1995 | 740 | 3.5 |
| `/assets/PostDetail-NMMRqz1j.js` | js | 1254 | 2045 | 791 | 4.6 |
| `/assets/ShopProfile-Csz8-EgY.js` | js | 1254 | 2095 | 841 | 39.3 |
| `/assets/clientPortalApi-BtbMxQgj.js` | js | 1254 | 2189 | 935 | 1.7 |
| `/assets/index-BYJWPTdV.js` | js | 1254 | 2225 | 970 | 23 |
| `/assets/ShopProfile-boBQ_sKJ.css` | css (bloqueia pintura) | 1255 | 1659 | 404 | 2.3 |
| `/assets/Toast-CwikF2ub.js` | js | 1255 | 2167 | 912 | 0.9 |
| `/assets/reputationApi-BcBDaXIO.js` | js | 1255 | 2211 | 956 | 0.8 |
| `/assets/Card-DZ_LaXyp.js` | js | 1255 | 2360 | 1105 | 0.5 |
| `/assets/Avatar-M1q1IKNs.js` | js | 1255 | 2390 | 1135 | 0.9 |
| `/assets/Button-B6XUSs3y.js` | js | 1255 | 2410 | 1156 | 1.3 |
| `/assets/utils-DCADjnpI.js` | js | 1255 | 2489 | 1235 | 8.8 |
| `/assets/publicProductsApi-BS4AzQVg.js` | js | 1255 | 2525 | 1270 | 0.7 |
| `/assets/chart-B3OGkCZ2.js` | js | 1255 | 2827 | 1572 | 77.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1269 | 2570 | 1301 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1271 | 2517 | 1247 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1271→2517ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API off, 3 execuções)

- **LCP mediano**: 2920 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary mt-1` — “Não foi possível carregar os dados deste estabelecimento.” (379×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.mt-1 → div → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2902 ms (1598 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +2736 ms · renderização +10 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +2747 · render +10 ⇒ soma ≈ 2920 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2873→2894ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=f2c15059-c834-4276-a9d0-8598b05643b9&status=all 2875→2895ms (Failed to fetch) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2877→2897ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 2878→2897ms (Failed to fetch) [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2878→2898ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2879→2898ms (Failed to fetch) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 2879→2898ms (Failed to fetch) [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 2896→2900ms (Failed to fetch) [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=f2c15059-c834-4276-a9d0-8598b05643b9&status=all 3033→3035ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=f2c15059-c834-4276-a9d0-8598b05643b9&status=all 4198→4201ms (Failed to fetch) [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=f2c15059-c834-4276-a9d0-8598b05643b9&status=all 5364→5366ms (Failed to fetch) [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 166 | 166 | 1.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 174 | 603 | 429 | 27.5 |
| `/assets/index-BFIhfbNw.js` | js | 174 | 1181 | 1007 | 144.2 |
| `/assets/PublicHome-Cz-drsY3.js` | js | 1255 | 1560 | 305 | 8.5 |
| `/assets/notificationsApi-BF_63z01.js` | js | 1256 | 1439 | 182 | 1 |
| `/assets/ShopProfile-Csz8-EgY.js` | js | 1256 | 2081 | 824 | 39.3 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1257 | 1446 | 189 | 0.9 |
| `/assets/StatusBadge-BY30jDQT.js` | js | 1257 | 1459 | 202 | 1.2 |
| `/assets/ConfirmDialog-BKai1sG_.js` | js | 1257 | 1639 | 382 | 1.3 |
| `/assets/SmartSelect-DTnHc8X9.js` | js | 1257 | 1709 | 453 | 17.1 |
| `/assets/ModalShell-y7GE-xk4.js` | js | 1258 | 1730 | 473 | 1.4 |
| `/assets/schemas-bbERxAmZ.js` | js | 1258 | 1976 | 718 | 3.5 |
| `/assets/Combination-D9hMB0-M.js` | js | 1258 | 1981 | 723 | 7.4 |
| `/assets/PostDetail-NMMRqz1j.js` | js | 1258 | 2031 | 773 | 4.6 |
| `/assets/Toast-CwikF2ub.js` | js | 1258 | 2153 | 895 | 0.9 |
| `/assets/clientPortalApi-BtbMxQgj.js` | js | 1258 | 2166 | 909 | 1.7 |
| `/assets/reputationApi-BcBDaXIO.js` | js | 1258 | 2203 | 945 | 0.8 |
| `/assets/index-BYJWPTdV.js` | js | 1258 | 2212 | 954 | 23 |
| `/assets/ShopProfile-boBQ_sKJ.css` | css (bloqueia pintura) | 1259 | 1646 | 387 | 2.3 |
| `/assets/Card-DZ_LaXyp.js` | js | 1259 | 2339 | 1080 | 0.5 |
| `/assets/Avatar-M1q1IKNs.js` | js | 1259 | 2384 | 1125 | 0.9 |
| `/assets/Button-B6XUSs3y.js` | js | 1259 | 2397 | 1138 | 1.3 |
| `/assets/utils-DCADjnpI.js` | js | 1259 | 2476 | 1217 | 8.8 |
| `/assets/publicProductsApi-BS4AzQVg.js` | js | 1259 | 2503 | 1244 | 0.7 |
| `/assets/chart-B3OGkCZ2.js` | js | 1259 | 2810 | 1551 | 77.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1268 | 2560 | 1292 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1273 | 2510 | 1237 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1273→2510ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API off, 3 execuções)

- **LCP mediano**: 1724 ms · **FCP mediano**: 1312 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-lg font-bold` — “Não foi possível conectar ao servidor. Verifique se a API está no ar e tente de novo.” (400×56px)
- **Cadeia do elemento**: h1.text-lg.font-bold → div → div.mx-auto.flex.min-h-dvh → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 18px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1682 ms (374 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1518 ms · renderização +18 ms
- **Divisão (mediana)**: TTFB 3 · elemento/recurso +1535 · render +21 ⇒ soma ≈ 1724 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1669→1678ms (Failed to fetch) [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-BFIhfbNw.js` | js | 171 | 1179 | 1008 | 144.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 172 | 602 | 430 | 27.5 |
| `/assets/PublicProductPage-BPSGZMm-.js` | js | 1257 | 1495 | 237 | 3.3 |
| `/assets/publicProductsApi-BS4AzQVg.js` | js | 1259 | 1439 | 180 | 0.7 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1259 | 1453 | 194 | 0.9 |
| `/assets/StatusBadge-BY30jDQT.js` | js | 1259 | 1468 | 209 | 1.2 |
| `/assets/schemas-bbERxAmZ.js` | js | 1259 | 1503 | 244 | 3.5 |
| `/assets/index-BYJWPTdV.js` | js | 1259 | 1610 | 352 | 23 |
| `/assets/Field-DzEiuVIJ.js` | js | 1259 | 1623 | 363 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1270 | 1653 | 383 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1274 | 1923 | 649 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1274→1923ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API real, 3 execuções)

- **LCP mediano**: 3248 ms · **FCP mediano**: 1316 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary leading-relaxed` — “O salão está tranquilo agora. Ótimo momento para chegar e ser atendido(a) sem espera.” (245×68px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.leading-relaxed → div.rounded-xl.bg-bg/80.border → div.relative.pl-5.pr-5 → div.mb-6.relative.overflow-hidden → main.max-w-md.sm:max-w-xl.md:max-w-3xl → div.min-h-dvh.pb-[max(5rem,env(safe-area-inset-bottom))].bg-bg
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 3213 ms (1897 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +3048 ms · renderização +35 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +3041 · render +35 ⇒ soma ≈ 3248 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=391818d6-fa47-499e-8983-6e4910c54106&status=all 2871→3034ms (signal is aborted without reason) [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 2875→3046ms status 200 [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2873→3054ms status 200 [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2875→3055ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2869→3062ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2876→3069ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 2876→3198ms status 200 [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 3036→3206ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=391818d6-fa47-499e-8983-6e4910c54106&status=all 3033→3214ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=391818d6-fa47-499e-8983-6e4910c54106&status=all 4207→4371ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=391818d6-fa47-499e-8983-6e4910c54106&status=all 5371→5536ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-BFIhfbNw.js` | js | 185 | 1182 | 997 | 144.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 186 | 601 | 415 | 27.5 |
| `/assets/PublicHome-Cz-drsY3.js` | js | 1260 | 1552 | 291 | 8.5 |
| `/assets/notificationsApi-BF_63z01.js` | js | 1261 | 1425 | 164 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1261 | 1438 | 177 | 0.9 |
| `/assets/ShopProfile-Csz8-EgY.js` | js | 1261 | 2074 | 813 | 39.3 |
| `/assets/StatusBadge-BY30jDQT.js` | js | 1262 | 1444 | 183 | 1.2 |
| `/assets/ConfirmDialog-BKai1sG_.js` | js | 1262 | 1624 | 362 | 1.3 |
| `/assets/SmartSelect-DTnHc8X9.js` | js | 1262 | 1704 | 442 | 17.1 |
| `/assets/ModalShell-y7GE-xk4.js` | js | 1262 | 1723 | 462 | 1.4 |
| `/assets/Combination-D9hMB0-M.js` | js | 1262 | 1970 | 707 | 7.4 |
| `/assets/schemas-bbERxAmZ.js` | js | 1263 | 1974 | 711 | 3.5 |
| `/assets/PostDetail-NMMRqz1j.js` | js | 1263 | 2032 | 770 | 4.6 |
| `/assets/Toast-CwikF2ub.js` | js | 1263 | 2145 | 883 | 0.9 |
| `/assets/clientPortalApi-BtbMxQgj.js` | js | 1263 | 2169 | 907 | 1.7 |
| `/assets/index-BYJWPTdV.js` | js | 1263 | 2198 | 935 | 23 |
| `/assets/reputationApi-BcBDaXIO.js` | js | 1263 | 2203 | 941 | 0.8 |
| `/assets/ShopProfile-boBQ_sKJ.css` | css (bloqueia pintura) | 1264 | 1632 | 368 | 2.3 |
| `/assets/Card-DZ_LaXyp.js` | js | 1264 | 2340 | 1076 | 0.5 |
| `/assets/Avatar-M1q1IKNs.js` | js | 1264 | 2376 | 1112 | 0.9 |
| `/assets/Button-B6XUSs3y.js` | js | 1264 | 2390 | 1126 | 1.3 |
| `/assets/utils-DCADjnpI.js` | js | 1264 | 2460 | 1196 | 8.8 |
| `/assets/chart-B3OGkCZ2.js` | js | 1264 | 2804 | 1540 | 77.9 |
| `/assets/publicProductsApi-BS4AzQVg.js` | js | 1265 | 2510 | 1245 | 0.7 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1275 | 2554 | 1279 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1281 | 2496 | 1214 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1281→2496ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API real, 3 execuções)

- **LCP mediano**: 1312 ms · **FCP mediano**: 1312 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary` — “Carregando...” (88×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary → div.flex.flex-col.items-center → div.flex.items-center.justify-center → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1261 ms (antes/do FCP)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · criação do elemento +1104 ms · renderização +35 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1108 · render +37 ⇒ soma ≈ 1312 ms
- **Depende de JS**: elemento criado após FCP em 0/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=3295f387-1151-48bc-94a4-ac57b9da0ab5&status=all 2855→3021ms (signal is aborted without reason) [depois do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2858→3029ms status 200 [depois do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2860→3034ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 2859→3042ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2860→3047ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2853→3055ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 2861→3183ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 3022→3192ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=3295f387-1151-48bc-94a4-ac57b9da0ab5&status=all 3019→3316ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 3247→3413ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 3247→3421ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=3295f387-1151-48bc-94a4-ac57b9da0ab5&status=all 4191→4357ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=3295f387-1151-48bc-94a4-ac57b9da0ab5&status=all 5357→5523ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 174 | 596 | 422 | 27.5 |
| `/assets/index-BFIhfbNw.js` | js | 174 | 1172 | 999 | 144.2 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1245 | 1416 | 171 | 0.9 |
| `/assets/notificationsApi-BF_63z01.js` | js | 1245 | 1423 | 177 | 1 |
| `/assets/PublicHome-Cz-drsY3.js` | js | 1245 | 1539 | 294 | 8.5 |
| `/assets/ShopProfile-Csz8-EgY.js` | js | 1245 | 2066 | 821 | 39.3 |
| `/assets/SmartSelect-DTnHc8X9.js` | js | 1246 | 1689 | 442 | 17.1 |
| `/assets/StatusBadge-BY30jDQT.js` | js | 1247 | 1439 | 193 | 1.2 |
| `/assets/ConfirmDialog-BKai1sG_.js` | js | 1247 | 1623 | 376 | 1.3 |
| `/assets/ModalShell-y7GE-xk4.js` | js | 1247 | 1709 | 463 | 1.4 |
| `/assets/Combination-D9hMB0-M.js` | js | 1247 | 1960 | 714 | 7.4 |
| `/assets/index-BYJWPTdV.js` | js | 1247 | 2188 | 941 | 23 |
| `/assets/ShopProfile-boBQ_sKJ.css` | css (bloqueia pintura) | 1248 | 1616 | 367 | 2.3 |
| `/assets/schemas-bbERxAmZ.js` | js | 1248 | 1954 | 707 | 3.5 |
| `/assets/PostDetail-NMMRqz1j.js` | js | 1248 | 2016 | 769 | 4.6 |
| `/assets/Toast-CwikF2ub.js` | js | 1248 | 2131 | 883 | 0.9 |
| `/assets/clientPortalApi-BtbMxQgj.js` | js | 1248 | 2154 | 907 | 1.7 |
| `/assets/reputationApi-BcBDaXIO.js` | js | 1248 | 2184 | 936 | 0.8 |
| `/assets/Card-DZ_LaXyp.js` | js | 1249 | 2333 | 1084 | 0.5 |
| `/assets/Avatar-M1q1IKNs.js` | js | 1249 | 2360 | 1110 | 0.9 |
| `/assets/Button-B6XUSs3y.js` | js | 1249 | 2374 | 1125 | 1.3 |
| `/assets/utils-DCADjnpI.js` | js | 1249 | 2447 | 1198 | 8.8 |
| `/assets/chart-B3OGkCZ2.js` | js | 1249 | 2790 | 1542 | 77.9 |
| `/assets/publicProductsApi-BS4AzQVg.js` | js | 1250 | 2497 | 1247 | 0.7 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1260 | 2532 | 1271 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1266 | 2475 | 1209 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1266→2475ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API real, 3 execuções)

- **LCP mediano**: 1888 ms · **FCP mediano**: 1312 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<h1>` classe `text-xl font-bold` — “Produto Sintetico 01” (191×28px)
- **Cadeia do elemento**: h1.text-xl.font-bold → div.flex.flex-wrap.items-center → div.rounded-2xl.border.border-border → main.mx-auto.max-w-md.px-4 → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 20px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1835 ms (539 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 1 ms · criação do elemento +1678 ms · renderização +37 ms
- **Divisão (mediana)**: TTFB 1 · elemento/recurso +1683 · render +39 ⇒ soma ≈ 1888 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1653→1820ms status 200 [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 157 | 157 | 1.2 |
| `/assets/index-BFIhfbNw.js` | js | 174 | 1180 | 1006 | 144.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 175 | 600 | 426 | 27.5 |
| `/assets/PublicProductPage-BPSGZMm-.js` | js | 1253 | 1480 | 227 | 3.3 |
| `/assets/index-BYJWPTdV.js` | js | 1253 | 1610 | 356 | 23 |
| `/assets/publicProductsApi-BS4AzQVg.js` | js | 1254 | 1417 | 163 | 0.7 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1254 | 1437 | 183 | 0.9 |
| `/assets/schemas-bbERxAmZ.js` | js | 1254 | 1490 | 236 | 3.5 |
| `/assets/StatusBadge-BY30jDQT.js` | js | 1255 | 1446 | 191 | 1.2 |
| `/assets/Field-DzEiuVIJ.js` | js | 1255 | 1603 | 349 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1263 | 1639 | 376 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1266 | 1919 | 653 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1266→1919ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (API real, 3 execuções)

- **LCP mediano**: 3252 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary leading-relaxed` — “O salão está tranquilo agora. Ótimo momento para chegar e ser atendido(a) sem espera.” (573×23px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary.leading-relaxed → div.rounded-xl.bg-bg/80.border → div.relative.pl-5.pr-5 → div.mb-6.relative.overflow-hidden → main.max-w-md.sm:max-w-xl.md:max-w-3xl → div.min-h-dvh.pb-[max(5rem,env(safe-area-inset-bottom))].bg-bg
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 3215 ms (1907 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +3049 ms · renderização +37 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +3049 · render +37 ⇒ soma ≈ 3252 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 2
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ca228e59-45a3-4c81-a27e-65669df922a2&status=all 2869→3034ms (signal is aborted without reason) [terminou antes do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2873→3042ms status 200 [terminou antes do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2875→3047ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 2874→3054ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2875→3062ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2866→3069ms status 200 [terminou antes do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 2876→3198ms status 200 [terminou antes do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 3036→3205ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ca228e59-45a3-4c81-a27e-65669df922a2&status=all 3033→3216ms status 200 [terminou antes do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ca228e59-45a3-4c81-a27e-65669df922a2&status=all 4205→4370ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=ca228e59-45a3-4c81-a27e-65669df922a2&status=all 5371→5533ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab (document)` | html | 0 | 166 | 166 | 1.2 |
| `/assets/index-BFIhfbNw.js` | js | 175 | 1175 | 1000 | 144.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 176 | 596 | 420 | 27.5 |
| `/assets/PublicHome-Cz-drsY3.js` | js | 1254 | 1540 | 286 | 8.5 |
| `/assets/notificationsApi-BF_63z01.js` | js | 1255 | 1417 | 161 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1255 | 1423 | 168 | 0.9 |
| `/assets/ShopProfile-Csz8-EgY.js` | js | 1255 | 2067 | 812 | 39.3 |
| `/assets/StatusBadge-BY30jDQT.js` | js | 1256 | 1431 | 175 | 1.2 |
| `/assets/ConfirmDialog-BKai1sG_.js` | js | 1256 | 1610 | 354 | 1.3 |
| `/assets/SmartSelect-DTnHc8X9.js` | js | 1256 | 1688 | 432 | 17.1 |
| `/assets/ModalShell-y7GE-xk4.js` | js | 1256 | 1710 | 454 | 1.4 |
| `/assets/Combination-D9hMB0-M.js` | js | 1257 | 1933 | 676 | 7.4 |
| `/assets/schemas-bbERxAmZ.js` | js | 1257 | 1953 | 696 | 3.5 |
| `/assets/PostDetail-NMMRqz1j.js` | js | 1257 | 2003 | 745 | 4.6 |
| `/assets/clientPortalApi-BtbMxQgj.js` | js | 1257 | 2125 | 867 | 1.7 |
| `/assets/Toast-CwikF2ub.js` | js | 1257 | 2131 | 874 | 0.9 |
| `/assets/index-BYJWPTdV.js` | js | 1257 | 2188 | 931 | 23 |
| `/assets/ShopProfile-boBQ_sKJ.css` | css (bloqueia pintura) | 1258 | 1625 | 366 | 2.3 |
| `/assets/reputationApi-BcBDaXIO.js` | js | 1258 | 2167 | 909 | 0.8 |
| `/assets/Card-DZ_LaXyp.js` | js | 1259 | 2303 | 1044 | 0.5 |
| `/assets/Avatar-M1q1IKNs.js` | js | 1259 | 2338 | 1079 | 0.9 |
| `/assets/Button-B6XUSs3y.js` | js | 1259 | 2367 | 1108 | 1.3 |
| `/assets/utils-DCADjnpI.js` | js | 1259 | 2445 | 1187 | 8.8 |
| `/assets/publicProductsApi-BS4AzQVg.js` | js | 1259 | 2468 | 1209 | 0.7 |
| `/assets/chart-B3OGkCZ2.js` | js | 1259 | 2791 | 1532 | 77.9 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1269 | 2511 | 1242 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1274 | 2475 | 1200 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1274→2475ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (API real, 3 execuções)

- **LCP mediano**: 1308 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-sm text-text-secondary` — “Carregando...” (88×20px)
- **Cadeia do elemento**: p.text-sm.text-text-secondary → div.flex.flex-col.items-center → div.flex.items-center.justify-center → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 14px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1267 ms (antes/do FCP)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1101 ms · renderização +41 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1101 · render +41 ⇒ soma ≈ 1308 ms
- **Depende de JS**: elemento criado após FCP em 0/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 1, 1, 1
- **Chamadas API antes do LCP**: /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=f942b777-7fab-469e-92e3-974e078a6f3e&status=all 2868→3035ms (signal is aborted without reason) [depois do LCP] · /api/services?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2872→3043ms status 200 [depois do LCP] · /api/feed?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2874→3047ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/staff 2873→3057ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab 2874→3064ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 2866→3071ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/schedule 2874→3198ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 3036→3206ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=f942b777-7fab-469e-92e3-974e078a6f3e&status=all 3034→3301ms status 200 [depois do LCP] · /api/appointments/availability?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&date=2026-10-07 3253→3422ms status 200 [depois do LCP] · /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products 3254→3429ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=f942b777-7fab-469e-92e3-974e078a6f3e&status=all 4205→4364ms status 200 [depois do LCP] · /api/queue?barbershopId=1ac5be50-6ce7-464e-bc38-ab18cf24aeab&sessionId=f942b777-7fab-469e-92e3-974e078a6f3e&status=all 5371→5528ms status 200 [depois do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments (document` | html | 0 | 166 | 166 | 1.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 173 | 594 | 421 | 27.5 |
| `/assets/index-BFIhfbNw.js` | js | 173 | 1173 | 999 | 144.2 |
| `/assets/PublicHome-Cz-drsY3.js` | js | 1253 | 1544 | 292 | 8.5 |
| `/assets/notificationsApi-BF_63z01.js` | js | 1254 | 1426 | 172 | 1 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1254 | 1430 | 176 | 0.9 |
| `/assets/SmartSelect-DTnHc8X9.js` | js | 1254 | 1697 | 443 | 17.1 |
| `/assets/ShopProfile-Csz8-EgY.js` | js | 1254 | 2076 | 822 | 39.3 |
| `/assets/StatusBadge-BY30jDQT.js` | js | 1255 | 1445 | 190 | 1.2 |
| `/assets/ConfirmDialog-BKai1sG_.js` | js | 1255 | 1624 | 369 | 1.3 |
| `/assets/ModalShell-y7GE-xk4.js` | js | 1255 | 1718 | 463 | 1.4 |
| `/assets/Combination-D9hMB0-M.js` | js | 1255 | 1961 | 706 | 7.4 |
| `/assets/schemas-bbERxAmZ.js` | js | 1256 | 1967 | 711 | 3.5 |
| `/assets/PostDetail-NMMRqz1j.js` | js | 1256 | 2026 | 770 | 4.6 |
| `/assets/Toast-CwikF2ub.js` | js | 1256 | 2138 | 882 | 0.9 |
| `/assets/clientPortalApi-BtbMxQgj.js` | js | 1256 | 2160 | 903 | 1.7 |
| `/assets/index-BYJWPTdV.js` | js | 1256 | 2204 | 948 | 23 |
| `/assets/ShopProfile-boBQ_sKJ.css` | css (bloqueia pintura) | 1257 | 1632 | 375 | 2.3 |
| `/assets/reputationApi-BcBDaXIO.js` | js | 1257 | 2197 | 940 | 0.8 |
| `/assets/Card-DZ_LaXyp.js` | js | 1257 | 2331 | 1074 | 0.5 |
| `/assets/Avatar-M1q1IKNs.js` | js | 1257 | 2376 | 1118 | 0.9 |
| `/assets/Button-B6XUSs3y.js` | js | 1257 | 2383 | 1126 | 1.3 |
| `/assets/utils-DCADjnpI.js` | js | 1257 | 2453 | 1196 | 8.8 |
| `/assets/chart-B3OGkCZ2.js` | js | 1257 | 2798 | 1541 | 77.9 |
| `/assets/publicProductsApi-BS4AzQVg.js` | js | 1258 | 2491 | 1232 | 0.7 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1267 | 2553 | 1286 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1271 | 2475 | 1204 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1271→2475ms (61.4KB)

## /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c (API real, 3 execuções)

- **LCP mediano**: 1892 ms · **FCP mediano**: 1308 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `text-center text-2xs leading-relaxed text-text-muted` — “A reserva é gratuita e não é um pagamento. O pagamento é feito na retirada. Informe seu no” (374×39px)
- **Cadeia do elemento**: p.text-center.text-2xs.leading-relaxed → form.mt-4.space-y-4.rounded-2xl → main.mx-auto.max-w-md.px-4 → div.min-h-dvh.bg-bg.text-text-primary → div#root
- **Estilo no paint**: opacity=1, visibility=visible, fonte 12px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1823 ms (539 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1659 ms · renderização +41 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1680 · render +46 ⇒ soma ≈ 1892 ms
- **Depende de JS**: elemento criado após FCP em 3/3 execuções · nasceu escondido em 0/3 · dentro de `div#root`: sim · entradas LCP por execução (repinturas): 2, 2, 2
- **Chamadas API antes do LCP**: /api/barbershops/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/public-products/68b80815-d9b5-4f0f-a264-c1a2cc34284c 1641→1803ms status 200 [terminou antes do LCP]

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-ClewyVsV.css` | css (bloqueia pintura) | 171 | 586 | 415 | 27.5 |
| `/assets/index-BFIhfbNw.js` | js | 171 | 1165 | 994 | 144.2 |
| `/assets/publicProductsApi-BS4AzQVg.js` | js | 1236 | 1410 | 174 | 0.7 |
| `/assets/PublicProductPage-BPSGZMm-.js` | js | 1236 | 1465 | 229 | 3.3 |
| `/assets/index-BYJWPTdV.js` | js | 1236 | 1581 | 345 | 23 |
| `/assets/StatusBadge-BY30jDQT.js` | js | 1237 | 1423 | 185 | 1.2 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1237 | 1431 | 194 | 0.9 |
| `/assets/schemas-bbERxAmZ.js` | js | 1237 | 1480 | 243 | 3.5 |
| `/assets/Field-DzEiuVIJ.js` | js | 1237 | 1590 | 352 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1247 | 1616 | 369 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1251 | 1903 | 652 | 61.4 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1251→1903ms (61.4KB)
