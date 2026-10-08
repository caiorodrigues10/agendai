# Medição — c-depois2

Gerado em 2026-10-08T03:42:21.081Z · base http://127.0.0.1:4173 · API both

## Performance (4G lenta + CPU 4x, mediana de 5 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 2 | 0.0737 | 0.0737 | 1968ms | 1968ms | 1368ms | 283KB | 14 | 64KB |
| real@375 | 2 | 0.0502 | 0.0502 | 2332ms | 2332ms | 1436ms | 283KB | 14 | 35KB |
| off@1440 | 4 | 0.0015 | 0.0356 | 2196ms | 2360ms | 1324ms | 225KB | 15 | 35KB |
| real@1440 | 4 | 0.0015 | 0.0093 | 2180ms | 2296ms | 1316ms | 225KB | 15 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0502 | 1956ms | 1304ms | 225KB | 13 | 64KB |
| /planos | 0.0737 | 1968ms | 1368ms | 283KB | 14 | 35KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0502 | 2332ms | 1436ms | 225KB | 13 | 35KB |
| /planos | 0.0211 | 2024ms | 1380ms | 283KB | 14 | 35KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2360ms | 1388ms | 225KB | 13 | 35KB |
| /login | 0.0003 | 2196ms | 1324ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2140ms | 1300ms | 202KB | 15 | 35KB |
| /planos | 0.0356 | 1928ms | 1300ms | 283KB | 14 | 35KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2052ms | 1292ms | 225KB | 13 | 35KB |
| /login | 0 | 2296ms | 1344ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2180ms | 1312ms | 202KB | 15 | 35KB |
| /planos | 0.0093 | 1992ms | 1316ms | 283KB | 14 | 35KB |
