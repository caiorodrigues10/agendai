# Medição — c-depois

Gerado em 2026-10-08T03:34:00.556Z · base http://127.0.0.1:4173 · API both

## Performance (4G lenta + CPU 4x, mediana de 5 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 2 | 0.0743 | 0.0743 | 1952ms | 1952ms | 1304ms | 283KB | 14 | 64KB |
| real@375 | 2 | 0.0502 | 0.0502 | 2016ms | 2016ms | 1324ms | 283KB | 14 | 35KB |
| off@1440 | 4 | 0.0015 | 0.0356 | 2288ms | 2384ms | 1340ms | 225KB | 15 | 35KB |
| real@1440 | 4 | 0.0015 | 0.009 | 2168ms | 3020ms | 1348ms | 225KB | 15 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0502 | 1952ms | 1304ms | 225KB | 13 | 64KB |
| /planos | 0.0743 | 1900ms | 1300ms | 283KB | 14 | 35KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0502 | 2016ms | 1324ms | 225KB | 13 | 35KB |
| /planos | 0.0217 | 1940ms | 1320ms | 283KB | 14 | 35KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2288ms | 1356ms | 225KB | 13 | 35KB |
| /login | 0 | 2384ms | 1340ms | 202KB | 15 | 35KB |
| /cadastro | 0 | 2192ms | 1300ms | 202KB | 15 | 35KB |
| /planos | 0.0356 | 1952ms | 1308ms | 283KB | 14 | 35KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2104ms | 1296ms | 225KB | 13 | 35KB |
| /login | 0.0003 | 2168ms | 1324ms | 202KB | 15 | 35KB |
| /cadastro | 0 | 3020ms | 1348ms | 202KB | 15 | 35KB |
| /planos | 0.009 | 2036ms | 1356ms | 283KB | 14 | 35KB |
