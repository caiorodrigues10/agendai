# Medição — r8

Gerado em 2026-10-07T18:20:32.069Z · base http://127.0.0.1:4173 · API both

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
| off@375 | 14 | 0.001 | 0.0526 | 2276ms | 4576ms | 1292ms | 201KB | 9 | 70KB |
| real@375 | 14 | 0.0004 | 0.0457 | 2084ms | 4588ms | 1296ms | 201KB | 9 | 70KB |
| off@1440 | 4 | 0.0003 | 0.0258 | 3000ms | 3224ms | 1296ms | 223KB | 16 | 70KB |
| real@1440 | 4 | 0.0003 | 0.0005 | 2916ms | 3312ms | 1292ms | 223KB | 16 | 70KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3140ms | 1292ms | 223KB | 11 | 124KB |
| /funcionalidades | 0 | 2276ms | 1284ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0.0005 | 2760ms | 1296ms | 205KB | 9 | 70KB |
| /agendamento | 0.001 | 2320ms | 1284ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 2020ms | 1292ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2080ms | 1288ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 1964ms | 1260ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1944ms | 1292ms | 155KB | 7 | 70KB |
| /login | 0 | 2492ms | 1300ms | 201KB | 16 | 35KB |
| /cadastro | 0.0002 | 2084ms | 1296ms | 201KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1500ms | 1288ms | 149KB | 5 | 35KB |
| /planos | 0.0526 | 3052ms | 1288ms | 281KB | 13 | 70KB |
| /queue | 0 | 4576ms | 1300ms | 418KB | 32 | 70KB |
| /sistema-para-barbearia | 0.0017 | 2040ms | 1300ms | 162KB | 8 | 70KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3184ms | 1292ms | 223KB | 11 | 124KB |
| /funcionalidades | 0 | 2276ms | 1296ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0 | 2736ms | 1288ms | 205KB | 9 | 70KB |
| /agendamento | 0.001 | 2332ms | 1296ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 1992ms | 1288ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2060ms | 1292ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 1604ms | 1288ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1604ms | 1296ms | 155KB | 7 | 70KB |
| /login | 0 | 2084ms | 1304ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2076ms | 1292ms | 201KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1492ms | 1272ms | 149KB | 5 | 35KB |
| /planos | 0 | 3040ms | 1296ms | 281KB | 13 | 70KB |
| /queue | 0 | 4588ms | 1300ms | 418KB | 32 | 124KB |
| /sistema-para-barbearia | 0.0017 | 2068ms | 1296ms | 162KB | 8 | 70KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3224ms | 1292ms | 223KB | 11 | 100KB |
| /login | 0.0003 | 2108ms | 1296ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2172ms | 1296ms | 201KB | 16 | 70KB |
| /planos | 0.0258 | 3000ms | 1300ms | 281KB | 13 | 70KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3312ms | 1288ms | 223KB | 11 | 100KB |
| /login | 0.0003 | 2100ms | 1308ms | 201KB | 16 | 35KB |
| /cadastro | 0.0005 | 2104ms | 1288ms | 201KB | 16 | 70KB |
| /planos | 0 | 2916ms | 1292ms | 281KB | 13 | 70KB |
