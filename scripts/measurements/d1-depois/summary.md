# Medição — d1-depois

Gerado em 2026-10-08T07:11:05.044Z · base http://127.0.0.1:4173 · API both

## Performance (4G lenta + CPU 4x, mediana de 5 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 2 | 0 | 0 | 2336ms | 2336ms | 1300ms | 202KB | 15 | 35KB |
| real@375 | 2 | 0.0002 | 0.0002 | 2108ms | 2108ms | 1304ms | 202KB | 15 | 35KB |
| off@1440 | 4 | 0.0015 | 0.0356 | 2100ms | 2172ms | 1300ms | 225KB | 15 | 35KB |
| real@1440 | 4 | 0.0015 | 0.0101 | 2088ms | 2104ms | 1292ms | 225KB | 15 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| /login | 0 | 2336ms | 1300ms | 202KB | 15 | 35KB |
| /cadastro | 0 | 2116ms | 1300ms | 202KB | 15 | 35KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| /login | 0 | 2108ms | 1300ms | 202KB | 15 | 35KB |
| /cadastro | 0.0002 | 2048ms | 1304ms | 202KB | 15 | 35KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2012ms | 1304ms | 225KB | 13 | 64KB |
| /login | 0 | 2172ms | 1300ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2100ms | 1300ms | 202KB | 15 | 35KB |
| /planos | 0.0356 | 1916ms | 1300ms | 283KB | 14 | 35KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 1988ms | 1288ms | 225KB | 13 | 35KB |
| /login | 0.0003 | 2088ms | 1292ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2104ms | 1292ms | 202KB | 15 | 35KB |
| /planos | 0.0101 | 1888ms | 1280ms | 283KB | 14 | 35KB |
