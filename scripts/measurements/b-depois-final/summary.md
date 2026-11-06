# Medição — b-depois-final

Gerado em 2026-10-08T02:54:43.133Z · base http://127.0.0.1:4173 · API both

## Performance (4G lenta + CPU 4x, mediana de 5 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 3 | 0 | 0.0058 | 2224ms | 2252ms | 1304ms | 247KB | 16 | 0KB |
| real@375 | 3 | 0 | 0.0136 | 1864ms | 2372ms | 1296ms | 247KB | 16 | 0KB |
| off@1440 | 7 | 0.0003 | 0.0356 | 2100ms | 2224ms | 1300ms | 225KB | 15 | 35KB |
| real@1440 | 7 | 0 | 0.009 | 2108ms | 2420ms | 1332ms | 225KB | 15 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0 | 2224ms | 1304ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 2252ms | 1332ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0.0058 | 1704ms | 1304ms | 181KB | 9 | 0KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0.0136 | 2372ms | 1316ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 1296ms | 1296ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0 | 1864ms | 1296ms | 181KB | 9 | 0KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2032ms | 1288ms | 225KB | 13 | 35KB |
| /login | 0.0003 | 2140ms | 1300ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2100ms | 1288ms | 202KB | 15 | 35KB |
| /planos | 0.0356 | 1908ms | 1296ms | 283KB | 14 | 35KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0 | 2220ms | 1308ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 2224ms | 1308ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0 | 1720ms | 1320ms | 181KB | 9 | 0KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2104ms | 1312ms | 225KB | 13 | 35KB |
| /login | 0 | 2212ms | 1312ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2176ms | 1312ms | 202KB | 15 | 35KB |
| /planos | 0.009 | 2108ms | 1384ms | 283KB | 14 | 35KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0 | 2420ms | 1344ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 1344ms | 1344ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0 | 1928ms | 1332ms | 181KB | 9 | 0KB |
