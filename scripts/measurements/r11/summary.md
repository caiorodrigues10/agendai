# Medição — r11

Gerado em 2026-10-07T20:39:49.451Z · base http://127.0.0.1:4173 · API both

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
| off@375 | 14 | 0.001 | 0.0526 | 2228ms | 4612ms | 1284ms | 201KB | 9 | 70KB |
| real@375 | 14 | 0.0004 | 0.0457 | 2228ms | 4520ms | 1284ms | 201KB | 9 | 70KB |
| off@1440 | 4 | 0.0003 | 0.0258 | 2984ms | 3208ms | 1296ms | 223KB | 16 | 70KB |
| real@1440 | 4 | 0 | 0.0003 | 2984ms | 3184ms | 1288ms | 223KB | 16 | 70KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3172ms | 1284ms | 223KB | 11 | 124KB |
| /funcionalidades | 0 | 2228ms | 1280ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0.0004 | 2736ms | 1288ms | 205KB | 9 | 70KB |
| /agendamento | 0.001 | 2300ms | 1284ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 2052ms | 1280ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2040ms | 1280ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 1964ms | 1284ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1956ms | 1288ms | 155KB | 7 | 70KB |
| /login | 0 | 2572ms | 1288ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2088ms | 1284ms | 201KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1484ms | 1280ms | 149KB | 5 | 35KB |
| /planos | 0.0526 | 3044ms | 1284ms | 281KB | 13 | 70KB |
| /queue | 0 | 4612ms | 1288ms | 418KB | 32 | 70KB |
| /sistema-para-barbearia | 0.0017 | 2016ms | 1284ms | 162KB | 8 | 70KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3128ms | 1288ms | 223KB | 11 | 70KB |
| /funcionalidades | 0 | 2228ms | 1284ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0.0005 | 2712ms | 1276ms | 205KB | 9 | 70KB |
| /agendamento | 0 | 2284ms | 1280ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 1992ms | 1284ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2068ms | 1288ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 2004ms | 1288ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1576ms | 1280ms | 155KB | 7 | 70KB |
| /login | 0 | 2540ms | 1292ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2096ms | 1292ms | 201KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1468ms | 1284ms | 149KB | 5 | 35KB |
| /planos | 0 | 3028ms | 1284ms | 281KB | 13 | 70KB |
| /queue | 0 | 4520ms | 1296ms | 418KB | 32 | 70KB |
| /sistema-para-barbearia | 0.0017 | 1980ms | 1280ms | 162KB | 8 | 70KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3208ms | 1280ms | 223KB | 11 | 70KB |
| /login | 0.0003 | 2132ms | 1300ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2172ms | 1296ms | 201KB | 16 | 70KB |
| /planos | 0.0258 | 2984ms | 1264ms | 281KB | 13 | 70KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3184ms | 1288ms | 223KB | 11 | 124KB |
| /login | 0.0003 | 2092ms | 1280ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2160ms | 1284ms | 201KB | 16 | 70KB |
| /planos | 0 | 2984ms | 1288ms | 281KB | 13 | 70KB |
