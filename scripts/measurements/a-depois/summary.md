# Medição — a-depois

Gerado em 2026-10-08T01:45:14.572Z · base http://127.0.0.1:4173 · API both

## Performance (4G lenta + CPU 4x, mediana de 5 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 1 | 0 | 0 | 2328ms | 2328ms | 1316ms | 202KB | 15 | 35KB |
| real@375 | 1 | 0 | 0 | 2332ms | 2332ms | 1312ms | 202KB | 15 | 35KB |
| off@1440 | 4 | 0.0015 | 0.0356 | 2104ms | 2112ms | 1300ms | 225KB | 15 | 35KB |
| real@1440 | 4 | 0.0015 | 0.0101 | 2156ms | 2164ms | 1300ms | 225KB | 15 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| /login | 0 | 2328ms | 1316ms | 202KB | 15 | 35KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| /login | 0 | 2332ms | 1312ms | 202KB | 15 | 35KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2004ms | 1300ms | 225KB | 13 | 35KB |
| /login | 0.0003 | 2112ms | 1300ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2104ms | 1300ms | 202KB | 15 | 35KB |
| /planos | 0.0356 | 1904ms | 1292ms | 283KB | 14 | 35KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2024ms | 1300ms | 225KB | 13 | 35KB |
| /login | 0 | 2164ms | 1292ms | 202KB | 15 | 35KB |
| /cadastro | 0 | 2156ms | 1296ms | 202KB | 15 | 35KB |
| /planos | 0.0101 | 1912ms | 1300ms | 283KB | 14 | 35KB |
