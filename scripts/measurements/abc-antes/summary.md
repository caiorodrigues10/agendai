# Medição — abc-antes

Gerado em 2026-10-08T00:11:09.975Z · base http://127.0.0.1:4173 · API both

## Layout (todas as rotas/larguras, API fora)

| métrica | valor |
|---|---|
| rotas medidas | 48 |
| páginas com estouro horizontal | 0 (máx 0px) |
| clicáveis <44px em mobile (alvo real) | 12 |
| exceções justificadas (texto corrido / frase / label com controle ok) | 0 / 0 / 24 |
| textos <12px em mobile | 0 |
| páginas sem exatamente 1 h1 | 0 |
| <img> visíveis sem width/height | 0 |

<details><summary>tap (detalhe)</summary>

- /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab@320=1
- /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments@320=1
- /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c@320=1
- /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab@375=1
- /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments@375=1
- /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c@375=1
- /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab@390=1
- /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments@390=1
- /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c@390=1
- /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab@768=1
- /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments@768=1
- /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c@768=1

</details>

## Performance (4G lenta + CPU 4x, mediana de 5 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 8 | 0.0058 | 0.0743 | 2064ms | 2924ms | 1296ms | 225KB | 16 | 70KB |
| real@375 | 8 | 0.0136 | 0.0501 | 1956ms | 3248ms | 1304ms | 225KB | 16 | 70KB |
| off@1440 | 8 | 0.0015 | 0.3445 | 2132ms | 2908ms | 1296ms | 225KB | 16 | 70KB |
| real@1440 | 8 | 0.0005 | 0.0101 | 2044ms | 3248ms | 1300ms | 225KB | 16 | 70KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0501 | 1908ms | 1296ms | 225KB | 13 | 70KB |
| /planos | 0.0743 | 1872ms | 1288ms | 283KB | 14 | 70KB |
| /login | 0 | 2560ms | 1296ms | 202KB | 16 | 70KB |
| /cadastro | 0.0002 | 2064ms | 1300ms | 202KB | 16 | 70KB |
| /queue | 0.0501 | 1948ms | 1432ms | 225KB | 13 | 70KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0 | 2924ms | 1304ms | 349KB | 23 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 2912ms | 1296ms | 349KB | 23 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0.0058 | 1696ms | 1296ms | 181KB | 9 | 0KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0501 | 1904ms | 1304ms | 225KB | 13 | 70KB |
| /planos | 0.0217 | 1876ms | 1300ms | 283KB | 14 | 70KB |
| /login | 0 | 2448ms | 1304ms | 202KB | 16 | 70KB |
| /cadastro | 0.0002 | 2096ms | 1304ms | 202KB | 16 | 70KB |
| /queue | 0.0501 | 1956ms | 1448ms | 225KB | 13 | 100KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0.0136 | 3248ms | 1308ms | 349KB | 23 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 1316ms | 1316ms | 349KB | 23 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0 | 1888ms | 1300ms | 181KB | 9 | 0KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2024ms | 1296ms | 225KB | 13 | 100KB |
| /login | 0 | 2196ms | 1300ms | 202KB | 16 | 70KB |
| /cadastro | 0.0005 | 2132ms | 1304ms | 202KB | 16 | 70KB |
| /planos | 0.0348 | 1904ms | 1296ms | 283KB | 14 | 70KB |
| /queue | 0.0015 | 2040ms | 1432ms | 225KB | 13 | 124KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0 | 2908ms | 1288ms | 349KB | 23 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 2908ms | 1296ms | 349KB | 23 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0.3445 | 1692ms | 1292ms | 181KB | 9 | 0KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 1976ms | 1288ms | 225KB | 13 | 70KB |
| /login | 0.0003 | 2080ms | 1288ms | 202KB | 16 | 70KB |
| /cadastro | 0.0005 | 2088ms | 1288ms | 202KB | 16 | 70KB |
| /planos | 0.0101 | 1904ms | 1284ms | 283KB | 14 | 70KB |
| /queue | 0.0015 | 2044ms | 1420ms | 225KB | 13 | 70KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab | 0 | 3248ms | 1300ms | 349KB | 23 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab?tab=appointments | 0 | 1304ms | 1304ms | 349KB | 23 | 0KB |
| /queue/1ac5be50-6ce7-464e-bc38-ab18cf24aeab/produtos/68b80815-d9b5-4f0f-a264-c1a2cc34284c | 0 | 1868ms | 1300ms | 181KB | 9 | 0KB |
