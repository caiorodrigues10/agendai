# Medição — c-depois3

Gerado em 2026-10-08T04:01:54.714Z · base http://127.0.0.1:4173 · API both

## Performance (4G lenta + CPU 4x, mediana de 5 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 2 | 0.0743 | 0.0743 | 1976ms | 1976ms | 1304ms | 283KB | 14 | 35KB |
| real@375 | 2 | 0.0502 | 0.0502 | 1944ms | 1944ms | 1312ms | 283KB | 14 | 64KB |
| off@1440 | 4 | 0.0015 | 0.0348 | 2144ms | 2184ms | 1308ms | 225KB | 15 | 35KB |
| real@1440 | 4 | 0.0015 | 0.009 | 2144ms | 2208ms | 1332ms | 225KB | 15 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0502 | 1976ms | 1300ms | 225KB | 13 | 35KB |
| /planos | 0.0743 | 1904ms | 1304ms | 283KB | 14 | 35KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0502 | 1944ms | 1312ms | 225KB | 13 | 64KB |
| /planos | 0.0217 | 1864ms | 1292ms | 283KB | 14 | 35KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2184ms | 1308ms | 225KB | 13 | 35KB |
| /login | 0.0003 | 2128ms | 1300ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2144ms | 1308ms | 202KB | 15 | 35KB |
| /planos | 0.0348 | 1980ms | 1316ms | 283KB | 14 | 35KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2144ms | 1344ms | 225KB | 13 | 35KB |
| /login | 0.0003 | 2128ms | 1308ms | 202KB | 15 | 35KB |
| /cadastro | 0 | 2208ms | 1312ms | 202KB | 15 | 35KB |
| /planos | 0.009 | 1996ms | 1332ms | 283KB | 14 | 35KB |
