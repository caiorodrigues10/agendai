# Medição — item4-depois

Gerado em 2026-10-08T19:28:57.840Z · base http://127.0.0.1:4173 · API both

## Performance (4G lenta + CPU 4x, mediana de 5 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 1 | 0 | 0 | 2248ms | 2248ms | 1304ms | 247KB | 16 | 0KB |
| real@375 | 1 | 0 | 0 | 2428ms | 2428ms | 1300ms | 247KB | 16 | 0KB |
| off@1440 | 5 | 0 | 0.0356 | 2168ms | 2224ms | 1296ms | 225KB | 15 | 35KB |
| real@1440 | 5 | 0.0005 | 0.0101 | 2120ms | 2432ms | 1300ms | 225KB | 15 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 2248ms | 1304ms | 247KB | 16 | 0KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 2428ms | 1300ms | 247KB | 16 | 0KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2008ms | 1288ms | 225KB | 13 | 35KB |
| /login | 0 | 2176ms | 1296ms | 202KB | 15 | 35KB |
| /cadastro | 0 | 2168ms | 1304ms | 202KB | 15 | 35KB |
| /planos | 0.0356 | 1908ms | 1296ms | 283KB | 14 | 35KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 2224ms | 1308ms | 247KB | 16 | 0KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2024ms | 1300ms | 225KB | 13 | 35KB |
| /login | 0.0003 | 2120ms | 1296ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2160ms | 1312ms | 202KB | 15 | 35KB |
| /planos | 0.0101 | 1916ms | 1308ms | 283KB | 14 | 35KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 2432ms | 1292ms | 247KB | 16 | 0KB |
