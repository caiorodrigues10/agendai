# Medição — r10

Gerado em 2026-10-07T19:48:54.349Z · base http://127.0.0.1:4173 · API both

## Layout (todas as rotas/larguras, API fora)

| métrica | valor |
|---|---|
| rotas medidas | 84 |
| páginas com estouro horizontal | 0 (máx 0px) |
| clicáveis <44px em mobile (alvo real) | 0 |
| exceções justificadas (texto corrido / frase / label com controle ok) | 0 / 0 / 44 |
| textos <12px em mobile | 0 |
| páginas sem exatamente 1 h1 | 0 |
| <img> visíveis sem width/height | 0 |

## Performance (4G lenta + CPU 4x)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 14 | 0.001 | 0.0526 | 2132ms | 4596ms | 1296ms | 201KB | 9 | 70KB |
| real@375 | 14 | 0.0004 | 0.0457 | 2256ms | 4604ms | 1304ms | 201KB | 9 | 70KB |
| off@1440 | 4 | 0 | 0.0003 | 2248ms | 3248ms | 1332ms | 223KB | 16 | 70KB |
| real@1440 | 4 | 0 | 0.0005 | 2976ms | 3264ms | 1284ms | 223KB | 13 | 70KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3204ms | 1304ms | 223KB | 11 | 100KB |
| /funcionalidades | 0 | 2276ms | 1292ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0 | 2776ms | 1292ms | 205KB | 9 | 70KB |
| /agendamento | 0.001 | 2328ms | 1300ms | 160KB | 8 | 70KB |
| /sobre | 0.0457 | 2020ms | 1296ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2100ms | 1304ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 1996ms | 1296ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1620ms | 1296ms | 155KB | 7 | 70KB |
| /login | 0 | 2132ms | 1296ms | 201KB | 16 | 70KB |
| /cadastro | 0.0002 | 2044ms | 1296ms | 201KB | 16 | 35KB |
| /esqueci-senha | 0.0004 | 1492ms | 1296ms | 149KB | 5 | 35KB |
| /planos | 0.0526 | 3040ms | 1292ms | 281KB | 13 | 70KB |
| /queue | 0 | 4596ms | 1296ms | 418KB | 32 | 70KB |
| /sistema-para-barbearia | 0.0017 | 2020ms | 1292ms | 162KB | 8 | 70KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3124ms | 1300ms | 223KB | 11 | 100KB |
| /funcionalidades | 0 | 2256ms | 1292ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0.0004 | 2720ms | 1296ms | 205KB | 9 | 70KB |
| /agendamento | 0 | 2328ms | 1300ms | 160KB | 8 | 70KB |
| /sobre | 0.0457 | 2012ms | 1292ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2092ms | 1308ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 1968ms | 1296ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1948ms | 1308ms | 155KB | 7 | 70KB |
| /login | 0 | 2596ms | 1308ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2120ms | 1312ms | 201KB | 16 | 35KB |
| /esqueci-senha | 0.0004 | 1492ms | 1304ms | 149KB | 5 | 35KB |
| /planos | 0 | 3036ms | 1288ms | 281KB | 13 | 70KB |
| /queue | 0 | 4604ms | 1304ms | 418KB | 32 | 70KB |
| /sistema-para-barbearia | 0.0017 | 2004ms | 1304ms | 162KB | 8 | 70KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3248ms | 1296ms | 223KB | 11 | 70KB |
| /login | 0.0003 | 2184ms | 1332ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2248ms | 1340ms | 201KB | 16 | 70KB |
| /planos | 0 | 1292ms | 1292ms | 281KB | 13 | 70KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3264ms | 1284ms | 223KB | 11 | 100KB |
| /login | 0 | 0ms | 188ms | 0KB | 1 | 0KB |
| /cadastro | 0.0005 | 2176ms | 1316ms | 201KB | 16 | 35KB |
| /planos | 0 | 2976ms | 1284ms | 281KB | 13 | 70KB |
