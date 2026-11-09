# Medição — r7

Gerado em 2026-10-07T17:57:13.245Z · base http://127.0.0.1:4173 · API both

## Layout (todas as rotas/larguras, API fora)

| métrica | valor |
|---|---|
| rotas medidas | 84 |
| páginas com estouro horizontal | 2 (máx 5px) |
| clicáveis <44px em mobile (alvo real) | 0 |
| exceções justificadas (texto corrido / frase / label com controle ok) | 0 / 0 / 44 |
| textos <12px em mobile | 0 |
| páginas sem exatamente 1 h1 | 0 |
| <img> visíveis sem width/height | 0 |

<details><summary>estouro (detalhe)</summary>

- /login@320=5px
- /esqueci-senha@320=5px

</details>

## Performance (4G lenta + CPU 4x)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 14 | 0 | 0.0526 | 2128ms | 4680ms | 1308ms | 201KB | 9 | 70KB |
| real@375 | 14 | 0 | 0.0457 | 2120ms | 4628ms | 1308ms | 201KB | 9 | 70KB |
| off@1440 | 4 | 0.0003 | 0.0258 | 2652ms | 3292ms | 1300ms | 223KB | 16 | 70KB |
| real@1440 | 4 | 0 | 0.0005 | 2976ms | 3240ms | 1296ms | 223KB | 16 | 70KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3176ms | 1304ms | 223KB | 11 | 70KB |
| /funcionalidades | 0 | 2340ms | 1300ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0 | 2812ms | 1296ms | 205KB | 9 | 70KB |
| /agendamento | 0 | 2260ms | 1300ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 2028ms | 1308ms | 159KB | 8 | 70KB |
| /contato | 0 | 2088ms | 1304ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 2024ms | 1308ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1656ms | 1288ms | 155KB | 7 | 70KB |
| /login | 0 | 2124ms | 1292ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2128ms | 1308ms | 201KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1508ms | 1316ms | 149KB | 5 | 35KB |
| /planos | 0.0526 | 3040ms | 1320ms | 281KB | 13 | 70KB |
| /queue | 0 | 4680ms | 1308ms | 418KB | 32 | 100KB |
| /sistema-para-barbearia | 0.0017 | 2088ms | 1308ms | 162KB | 8 | 70KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3236ms | 1284ms | 223KB | 11 | 100KB |
| /funcionalidades | 0 | 2344ms | 1312ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0 | 2804ms | 1320ms | 205KB | 9 | 70KB |
| /agendamento | 0 | 2248ms | 1304ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 1992ms | 1300ms | 159KB | 8 | 70KB |
| /contato | 0 | 2088ms | 1308ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 1988ms | 1312ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1616ms | 1312ms | 155KB | 7 | 70KB |
| /login | 0 | 2112ms | 1312ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2120ms | 1316ms | 201KB | 16 | 35KB |
| /esqueci-senha | 0.0004 | 1484ms | 1304ms | 149KB | 5 | 35KB |
| /planos | 0 | 3048ms | 1304ms | 281KB | 13 | 70KB |
| /queue | 0 | 4628ms | 1292ms | 418KB | 32 | 70KB |
| /sistema-para-barbearia | 0.0017 | 2076ms | 1308ms | 162KB | 8 | 70KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3292ms | 1296ms | 223KB | 11 | 70KB |
| /login | 0.0003 | 2092ms | 1308ms | 201KB | 16 | 35KB |
| /cadastro | 0 | 2180ms | 1296ms | 201KB | 16 | 35KB |
| /planos | 0.0258 | 2652ms | 1300ms | 281KB | 13 | 70KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3240ms | 1296ms | 223KB | 11 | 124KB |
| /login | 0 | 2140ms | 1296ms | 201KB | 16 | 35KB |
| /cadastro | 0.0005 | 2088ms | 1312ms | 201KB | 16 | 70KB |
| /planos | 0 | 2976ms | 1296ms | 281KB | 13 | 70KB |
