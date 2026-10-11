# Medição — c-ctrl-semanim

Gerado em 2026-10-08T03:50:59.166Z · base http://127.0.0.1:4173 · API both

## Performance (4G lenta + CPU 4x, mediana de 7 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 2 | 0.0743 | 0.0743 | 1968ms | 1968ms | 1304ms | 283KB | 14 | 35KB |
| real@375 | 2 | 0.0501 | 0.0501 | 1964ms | 1964ms | 1332ms | 283KB | 14 | 35KB |
| off@1440 | 4 | 0.0015 | 0.0348 | 2132ms | 2252ms | 1332ms | 225KB | 15 | 35KB |
| real@1440 | 4 | 0.0015 | 0.0093 | 2176ms | 2196ms | 1320ms | 225KB | 15 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0501 | 1968ms | 1292ms | 225KB | 13 | 35KB |
| /planos | 0.0743 | 1900ms | 1304ms | 283KB | 14 | 35KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0501 | 1964ms | 1312ms | 225KB | 13 | 35KB |
| /planos | 0.0217 | 1928ms | 1332ms | 283KB | 14 | 35KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2104ms | 1304ms | 225KB | 13 | 35KB |
| /login | 0.0003 | 2132ms | 1304ms | 202KB | 15 | 35KB |
| /cadastro | 0 | 2252ms | 1332ms | 202KB | 15 | 35KB |
| /planos | 0.0348 | 2004ms | 1340ms | 283KB | 14 | 35KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2116ms | 1300ms | 225KB | 13 | 35KB |
| /login | 0.0003 | 2176ms | 1320ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2196ms | 1328ms | 202KB | 15 | 35KB |
| /planos | 0.0093 | 1964ms | 1316ms | 283KB | 14 | 35KB |
