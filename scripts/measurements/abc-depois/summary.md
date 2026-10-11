# Medição — abc-depois

Gerado em 2026-10-08T05:16:48.097Z · base http://127.0.0.1:4173 · API both

## Layout (todas as rotas/larguras, API fora)

| métrica | valor |
|---|---|
| rotas medidas | 48 |
| páginas com estouro horizontal | 0 (máx 0px) |
| clicáveis <44px em mobile (alvo real) | 0 |
| exceções justificadas (texto corrido / frase / label com controle ok) | 0 / 0 / 24 |
| textos <12px em mobile | 0 |
| páginas sem exatamente 1 h1 | 0 |
| <img> visíveis sem width/height | 0 |

## Performance (4G lenta + CPU 4x, mediana de 5 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 8 | 0.0058 | 0.0743 | 2108ms | 2352ms | 1308ms | 225KB | 15 | 35KB |
| real@375 | 8 | 0.0136 | 0.0501 | 1952ms | 2364ms | 1300ms | 225KB | 15 | 35KB |
| off@1440 | 8 | 0.0003 | 0.0356 | 2104ms | 2216ms | 1296ms | 225KB | 15 | 35KB |
| real@1440 | 8 | 0.0005 | 0.0101 | 2048ms | 2380ms | 1296ms | 225KB | 15 | 35KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0501 | 1900ms | 1300ms | 225KB | 13 | 64KB |
| /planos | 0.0743 | 1900ms | 1304ms | 283KB | 14 | 35KB |
| /login | 0 | 2352ms | 1296ms | 202KB | 15 | 35KB |
| /cadastro | 0 | 2108ms | 1300ms | 202KB | 15 | 35KB |
| /queue | 0.0501 | 1956ms | 1432ms | 225KB | 13 | 64KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0 | 2232ms | 1308ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 2224ms | 1308ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0.0058 | 1704ms | 1308ms | 181KB | 9 | 0KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0501 | 1928ms | 1308ms | 225KB | 13 | 64KB |
| /planos | 0.0217 | 1884ms | 1304ms | 283KB | 14 | 35KB |
| /login | 0 | 2296ms | 1296ms | 202KB | 15 | 35KB |
| /cadastro | 0.0002 | 2032ms | 1288ms | 202KB | 15 | 35KB |
| /queue | 0.0501 | 1952ms | 1432ms | 225KB | 13 | 35KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0.0136 | 2364ms | 1300ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 1296ms | 1296ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0 | 1876ms | 1292ms | 181KB | 9 | 0KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2012ms | 1288ms | 225KB | 13 | 35KB |
| /login | 0.0003 | 2104ms | 1300ms | 202KB | 15 | 35KB |
| /cadastro | 0 | 2164ms | 1288ms | 202KB | 15 | 35KB |
| /planos | 0.0356 | 1912ms | 1296ms | 283KB | 14 | 35KB |
| /queue | 0.0015 | 2056ms | 1424ms | 225KB | 13 | 64KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0 | 2216ms | 1296ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 2216ms | 1300ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0 | 1672ms | 1276ms | 181KB | 9 | 0KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 1948ms | 1280ms | 225KB | 13 | 64KB |
| /login | 0.0003 | 2056ms | 1280ms | 202KB | 15 | 35KB |
| /cadastro | 0.0005 | 2060ms | 1280ms | 202KB | 15 | 35KB |
| /planos | 0.0101 | 1904ms | 1288ms | 283KB | 14 | 35KB |
| /queue | 0.0015 | 2048ms | 1420ms | 225KB | 13 | 35KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0 | 2380ms | 1296ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 1300ms | 1300ms | 247KB | 16 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0 | 1876ms | 1296ms | 181KB | 9 | 0KB |
