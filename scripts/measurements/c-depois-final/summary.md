# Medição — c-depois-final

Gerado em 2026-10-08T04:27:37.261Z · base http://127.0.0.1:4173 · API both

## Performance (4G lenta + CPU 4x, mediana de 5 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 2 | 0.0743 | 0.0743 | 1916ms | 1916ms | 1300ms | 283KB | 14 | 35KB |
| real@375 | 2 | 0.0501 | 0.0501 | 1888ms | 1888ms | 1296ms | 283KB | 14 | 35KB |
| off@1440 | 4 | 0.0015 | 0.0356 | 2132ms | 2136ms | 1296ms | 225KB | 15 | 35KB |
| real@1440 | 4 | 0.0015 | 0.0101 | 2056ms | 2120ms | 1288ms | 225KB | 15 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0501 | 1916ms | 1300ms | 225KB | 13 | 35KB |
| /planos | 0.0743 | 1872ms | 1296ms | 283KB | 14 | 35KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0501 | 1888ms | 1292ms | 225KB | 13 | 35KB |
| /planos | 0.0217 | 1868ms | 1296ms | 283KB | 14 | 35KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 1984ms | 1296ms | 225KB | 13 | 64KB |
| /login | 0.0003 | 2132ms | 1300ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2136ms | 1296ms | 202KB | 15 | 35KB |
| /planos | 0.0356 | 1916ms | 1292ms | 283KB | 14 | 35KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 1980ms | 1284ms | 225KB | 13 | 35KB |
| /login | 0.0003 | 2056ms | 1276ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2120ms | 1288ms | 202KB | 15 | 35KB |
| /planos | 0.0101 | 1900ms | 1288ms | 283KB | 14 | 35KB |
