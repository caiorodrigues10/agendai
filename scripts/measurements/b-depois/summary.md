# Medição — b-depois

Gerado em 2026-10-08T02:19:38.580Z · base http://127.0.0.1:4173 · API both

## Performance (4G lenta + CPU 4x, mediana de 5 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 3 | 0 | 0.0058 | 2224ms | 2232ms | 1304ms | 249KB | 18 | 0KB |
| real@375 | 3 | 0 | 0.0136 | 1908ms | 2512ms | 1324ms | 249KB | 18 | 0KB |
| off@1440 | 7 | 0.0005 | 0.3445 | 2176ms | 2224ms | 1296ms | 225KB | 15 | 35KB |
| real@1440 | 7 | 0.0003 | 0.0101 | 1996ms | 2496ms | 1288ms | 225KB | 15 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0 | 2224ms | 1300ms | 249KB | 18 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 2232ms | 1304ms | 249KB | 18 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0.0058 | 1716ms | 1316ms | 181KB | 9 | 0KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0.0136 | 2512ms | 1324ms | 249KB | 18 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 1336ms | 1336ms | 249KB | 18 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0 | 1908ms | 1316ms | 181KB | 9 | 0KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2012ms | 1296ms | 225KB | 13 | 35KB |
| /login | 0 | 2180ms | 1292ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2176ms | 1300ms | 202KB | 15 | 35KB |
| /planos | 0.0356 | 1908ms | 1296ms | 283KB | 14 | 35KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0 | 2220ms | 1296ms | 249KB | 18 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 2224ms | 1300ms | 249KB | 18 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0.3445 | 1696ms | 1296ms | 181KB | 9 | 0KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 1996ms | 1288ms | 225KB | 13 | 64KB |
| /login | 0.0003 | 2068ms | 1284ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2084ms | 1284ms | 202KB | 15 | 35KB |
| /planos | 0.0101 | 1904ms | 1288ms | 283KB | 14 | 35KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0 | 2496ms | 1308ms | 249KB | 18 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 1308ms | 1308ms | 249KB | 18 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0 | 1888ms | 1300ms | 181KB | 9 | 0KB |
