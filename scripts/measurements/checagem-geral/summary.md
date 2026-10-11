# Medição — checagem-geral

Gerado em 2026-10-09T05:23:20.099Z · base http://127.0.0.1:4173 · API both

## Layout (todas as rotas/larguras, API fora)

| métrica | valor |
|---|---|
| rotas medidas | 10 |
| páginas com estouro horizontal | 0 (máx 0px) |
| clicáveis <44px em mobile (alvo real) | 0 |
| exceções justificadas (texto corrido / frase / label com controle ok) | 0 / 0 / 6 |
| textos <12px em mobile | 0 |
| páginas sem exatamente 1 h1 | 0 |
| <img> visíveis sem width/height | 0 |

## Performance (4G lenta + CPU 4x, mediana de 1 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 5 | 0.0502 | 0.0743 | 1932ms | 2332ms | 1288ms | 226KB | 14 | 35KB |
| real@375 | 5 | 0.0217 | 0.0502 | 1940ms | 2080ms | 1292ms | 226KB | 14 | 35KB |
| off@1440 | 5 | 0.0015 | 0.0356 | 2048ms | 2196ms | 1296ms | 226KB | 14 | 35KB |
| real@1440 | 5 | 0.0015 | 0.0101 | 2012ms | 2156ms | 1284ms | 226KB | 14 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0502 | 1872ms | 1280ms | 226KB | 13 | 35KB |
| /login | 0 | 2332ms | 1288ms | 202KB | 15 | 35KB |
| /cadastro | 0 | 2084ms | 1280ms | 202KB | 15 | 35KB |
| /planos | 0.0743 | 1872ms | 1292ms | 283KB | 14 | 35KB |
| /queue | 0.0502 | 1932ms | 1412ms | 226KB | 13 | 64KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0502 | 1876ms | 1292ms | 226KB | 13 | 35KB |
| /login | 0 | 2080ms | 1292ms | 202KB | 15 | 35KB |
| /cadastro | 0.0002 | 2028ms | 1296ms | 202KB | 15 | 35KB |
| /planos | 0.0217 | 1860ms | 1288ms | 283KB | 14 | 35KB |
| /queue | 0.0502 | 1940ms | 1424ms | 226KB | 13 | 35KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2048ms | 1284ms | 226KB | 13 | 35KB |
| /login | 0.0003 | 2092ms | 1296ms | 202KB | 15 | 35KB |
| /cadastro | 0 | 2196ms | 1320ms | 202KB | 15 | 35KB |
| /planos | 0.0356 | 1900ms | 1292ms | 283KB | 14 | 35KB |
| /queue | 0.0015 | 2040ms | 1416ms | 226KB | 13 | 64KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2000ms | 1284ms | 226KB | 13 | 89KB |
| /login | 0 | 2156ms | 1284ms | 202KB | 15 | 35KB |
| /cadastro | 0 | 2132ms | 1284ms | 202KB | 15 | 35KB |
| /planos | 0.0101 | 1904ms | 1284ms | 283KB | 14 | 35KB |
| /queue | 0.0015 | 2012ms | 1424ms | 226KB | 13 | 35KB |
