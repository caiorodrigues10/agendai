# Medição — r6

Gerado em 2026-10-07T14:01:05.864Z · base http://127.0.0.1:4173 · API both

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
| off@375 | 14 | 0.0002 | 0.0526 | 2108ms | 4568ms | 1292ms | 201KB | 9 | 70KB |
| real@375 | 14 | 0.0004 | 0.0457 | 2132ms | 4552ms | 1296ms | 181KB | 9 | 70KB |
| off@1440 | 4 | 0.0005 | 0.0258 | 2964ms | 3216ms | 1296ms | 223KB | 16 | 70KB |
| real@1440 | 4 | 0 | 0.0003 | 2992ms | 3340ms | 1292ms | 223KB | 16 | 70KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3164ms | 1292ms | 223KB | 11 | 124KB |
| /funcionalidades | 0 | 2348ms | 1304ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0 | 2812ms | 1296ms | 205KB | 9 | 70KB |
| /agendamento | 0 | 2212ms | 1292ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 2052ms | 1288ms | 159KB | 8 | 70KB |
| /contato | 0 | 2088ms | 1292ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 1600ms | 1280ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1588ms | 1280ms | 155KB | 7 | 70KB |
| /login | 0 | 2108ms | 1308ms | 201KB | 16 | 70KB |
| /cadastro | 0.0002 | 2048ms | 1288ms | 201KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1484ms | 1296ms | 149KB | 5 | 35KB |
| /planos | 0.0526 | 3000ms | 1284ms | 281KB | 13 | 70KB |
| /queue | 0 | 4568ms | 1300ms | 418KB | 32 | 70KB |
| /sistema-para-barbearia | 0.0017 | 2024ms | 1304ms | 162KB | 8 | 70KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 1296ms | 1296ms | 165KB | 6 | 0KB |
| /funcionalidades | 0 | 2304ms | 1316ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0.0004 | 2744ms | 1300ms | 205KB | 9 | 70KB |
| /agendamento | 0.001 | 2308ms | 1308ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 1984ms | 1292ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2048ms | 1280ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 1976ms | 1292ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1924ms | 1284ms | 155KB | 7 | 70KB |
| /login | 0 | 2544ms | 1296ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2132ms | 1304ms | 201KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1500ms | 1300ms | 149KB | 5 | 35KB |
| /planos | 0 | 3008ms | 1292ms | 281KB | 13 | 70KB |
| /queue | 0 | 4552ms | 1296ms | 418KB | 32 | 100KB |
| /sistema-para-barbearia | 0.0017 | 2000ms | 1284ms | 162KB | 8 | 70KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3216ms | 1296ms | 223KB | 11 | 70KB |
| /login | 0 | 2148ms | 1288ms | 201KB | 16 | 70KB |
| /cadastro | 0.0005 | 2072ms | 1288ms | 201KB | 16 | 70KB |
| /planos | 0.0258 | 2964ms | 1300ms | 281KB | 13 | 70KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3340ms | 1292ms | 223KB | 11 | 70KB |
| /login | 0.0003 | 2048ms | 1288ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2140ms | 1280ms | 201KB | 16 | 70KB |
| /planos | 0 | 2992ms | 1296ms | 281KB | 13 | 70KB |
