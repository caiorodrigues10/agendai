# Medição — r9

Gerado em 2026-10-07T19:14:39.864Z · base http://127.0.0.1:4173 · API both

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
| off@375 | 14 | 0.001 | 0.0526 | 2280ms | 4644ms | 1296ms | 201KB | 9 | 70KB |
| real@375 | 14 | 0.0002 | 0.0457 | 2296ms | 4552ms | 1300ms | 201KB | 9 | 70KB |
| off@1440 | 4 | 0 | 0.0258 | 3000ms | 3208ms | 1300ms | 223KB | 16 | 70KB |
| real@1440 | 4 | 0 | 0 | 3040ms | 3232ms | 1296ms | 223KB | 16 | 70KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3204ms | 1296ms | 223KB | 11 | 70KB |
| /funcionalidades | 0 | 2280ms | 1292ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0.0005 | 2744ms | 1292ms | 205KB | 9 | 70KB |
| /agendamento | 0.001 | 2324ms | 1296ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 2064ms | 1288ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2100ms | 1304ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 1624ms | 1288ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1620ms | 1296ms | 155KB | 7 | 70KB |
| /login | 0 | 2600ms | 1304ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2116ms | 1312ms | 201KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1492ms | 1288ms | 149KB | 5 | 35KB |
| /planos | 0.0526 | 3048ms | 1300ms | 281KB | 13 | 70KB |
| /queue | 0 | 4644ms | 1296ms | 418KB | 32 | 100KB |
| /sistema-para-barbearia | 0.0017 | 2008ms | 1304ms | 162KB | 8 | 70KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3120ms | 1304ms | 223KB | 11 | 70KB |
| /funcionalidades | 0 | 2296ms | 1292ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0 | 2752ms | 1304ms | 205KB | 9 | 70KB |
| /agendamento | 0 | 2328ms | 1308ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 2052ms | 1288ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2056ms | 1292ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 1624ms | 1300ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1976ms | 1300ms | 155KB | 7 | 70KB |
| /login | 0 | 2444ms | 1296ms | 201KB | 16 | 35KB |
| /cadastro | 0.0002 | 2072ms | 1308ms | 201KB | 16 | 35KB |
| /esqueci-senha | 0.0004 | 1476ms | 1292ms | 149KB | 5 | 35KB |
| /planos | 0 | 3060ms | 1308ms | 281KB | 13 | 70KB |
| /queue | 0 | 4552ms | 1300ms | 418KB | 32 | 70KB |
| /sistema-para-barbearia | 0.0017 | 2052ms | 1300ms | 162KB | 8 | 70KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3208ms | 1268ms | 223KB | 11 | 70KB |
| /login | 0 | 2176ms | 1312ms | 201KB | 16 | 35KB |
| /cadastro | 0 | 2164ms | 1300ms | 201KB | 16 | 70KB |
| /planos | 0.0258 | 3000ms | 1300ms | 281KB | 13 | 70KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3232ms | 1296ms | 223KB | 11 | 100KB |
| /login | 0 | 2172ms | 1292ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2172ms | 1296ms | 201KB | 16 | 35KB |
| /planos | 0 | 3040ms | 1292ms | 281KB | 13 | 70KB |
