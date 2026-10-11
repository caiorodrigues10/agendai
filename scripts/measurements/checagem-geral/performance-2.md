# Checagem 2 — medição responsive/perf (task 6)

Comando: `npm run measure -- scripts/measure-responsive.mjs --label=checagem-2 --perf --api=both --runs=5 --routes=/,/login,/cadastro,/planos,/queue,/agendamento,/funcionalidades,/sobre --perf-widths=375,1440 --port=4174`

Mediana de 5 execuções por célula (32 células = 8 rotas x 2 larguras x 2 cenários). Orçamento: LCP ≤ 2500 ms, CLS ≤ 0,1.

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 8 | 0.0332 | 0.0743 | 2076ms | 2352ms | 1304ms | 208KB | 13 | 35KB |
| off@1440 | 8 | 0.0015 | 0.0785 | 2116ms | 2284ms | 1304ms | 208KB | 13 | 35KB |
| real@375 | 8 | 0.0217 | 0.0502 | 2076ms | 2212ms | 1304ms | 208KB | 13 | 35KB |
| real@1440 | 8 | 0.0015 | 0.0785 | 2088ms | 2276ms | 1292ms | 208KB | 13 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0502 | 1912ms | 1300ms | 226KB | 13 | 35KB |
| /login | 0 | 2352ms | 1304ms | 202KB | 15 | 35KB |
| /cadastro | 0.0002 | 2076ms | 1312ms | 202KB | 15 | 35KB |
| /planos | 0.0743 | 1884ms | 1300ms | 283KB | 14 | 35KB |
| /queue | 0.0502 | 1972ms | 1440ms | 226KB | 13 | 35KB |
| /agendamento | 0 | 2156ms | 1300ms | 160KB | 8 | 35KB |
| /funcionalidades | 0.0003 | 2232ms | 1304ms | 208KB | 11 | 35KB |
| /sobre | 0.0332 | 2068ms | 1304ms | 160KB | 8 | 35KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2024ms | 1304ms | 226KB | 13 | 35KB |
| /login | 0 | 2168ms | 1296ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2116ms | 1296ms | 202KB | 15 | 35KB |
| /planos | 0.0356 | 1916ms | 1308ms | 283KB | 14 | 35KB |
| /queue | 0.0015 | 2068ms | 1444ms | 226KB | 13 | 64KB |
| /agendamento | 0.0003 | 2284ms | 1296ms | 160KB | 8 | 35KB |
| /funcionalidades | 0.0003 | 2256ms | 1304ms | 208KB | 11 | 35KB |
| /sobre | 0.0785 | 1980ms | 1308ms | 160KB | 8 | 35KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0502 | 1920ms | 1296ms | 226KB | 13 | 35KB |
| /login | 0 | 2112ms | 1308ms | 202KB | 15 | 35KB |
| /cadastro | 0.0002 | 2076ms | 1304ms | 202KB | 15 | 35KB |
| /planos | 0.0217 | 1888ms | 1308ms | 283KB | 14 | 35KB |
| /queue | 0.0502 | 1992ms | 1440ms | 226KB | 13 | 35KB |
| /agendamento | 0 | 2144ms | 1304ms | 160KB | 8 | 35KB |
| /funcionalidades | 0.0003 | 2212ms | 1296ms | 208KB | 11 | 35KB |
| /sobre | 0.0457 | 2012ms | 1304ms | 160KB | 8 | 35KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2004ms | 1292ms | 226KB | 13 | 64KB |
| /login | 0 | 2152ms | 1292ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2088ms | 1300ms | 202KB | 15 | 35KB |
| /planos | 0.0101 | 1916ms | 1300ms | 283KB | 14 | 35KB |
| /queue | 0.0015 | 2036ms | 1428ms | 226KB | 13 | 35KB |
| /agendamento | 0.0003 | 2276ms | 1292ms | 160KB | 8 | 35KB |
| /funcionalidades | 0.0003 | 2236ms | 1292ms | 208KB | 11 | 35KB |
| /sobre | 0.0785 | 1944ms | 1292ms | 160KB | 8 | 35KB |

