# Medição — r12

Gerado em 2026-10-07T21:02:38.196Z · base http://127.0.0.1:4173 · API both

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
| off@375 | 14 | 0.0005 | 0.0526 | 2108ms | 4696ms | 1292ms | 201KB | 9 | 70KB |
| real@375 | 14 | 0.0004 | 0.0457 | 2092ms | 4756ms | 1284ms | 201KB | 9 | 70KB |
| off@1440 | 4 | 0 | 0.0258 | 2964ms | 3588ms | 1284ms | 223KB | 16 | 70KB |
| real@1440 | 4 | 0 | 0.0005 | 2964ms | 3268ms | 1276ms | 223KB | 16 | 70KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3116ms | 1284ms | 223KB | 11 | 70KB |
| /funcionalidades | 0 | 2264ms | 1276ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0.0005 | 2692ms | 1276ms | 205KB | 9 | 70KB |
| /agendamento | 0 | 2296ms | 1276ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 1996ms | 1276ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2060ms | 1280ms | 180KB | 9 | 70KB |
| /privacidade | 0.0095 | 2048ms | 1320ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1976ms | 1292ms | 155KB | 7 | 70KB |
| /login | 0 | 2108ms | 1304ms | 201KB | 16 | 70KB |
| /cadastro | 0.0002 | 2108ms | 1312ms | 201KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1496ms | 1300ms | 149KB | 5 | 35KB |
| /planos | 0.0526 | 3104ms | 1324ms | 281KB | 13 | 70KB |
| /queue | 0 | 4696ms | 1312ms | 418KB | 32 | 70KB |
| /sistema-para-barbearia | 0.0017 | 2016ms | 1280ms | 161KB | 8 | 70KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3168ms | 1284ms | 223KB | 11 | 70KB |
| /funcionalidades | 0 | 2236ms | 1276ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0.0005 | 2696ms | 1276ms | 205KB | 9 | 70KB |
| /agendamento | 0 | 2308ms | 1284ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 2032ms | 1276ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2048ms | 1280ms | 180KB | 9 | 70KB |
| /privacidade | 0.0095 | 1972ms | 1280ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1900ms | 1288ms | 155KB | 7 | 70KB |
| /login | 0 | 2092ms | 1288ms | 201KB | 16 | 35KB |
| /cadastro | 0.0002 | 2056ms | 1288ms | 201KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1464ms | 1280ms | 149KB | 5 | 35KB |
| /planos | 0 | 3052ms | 1296ms | 281KB | 13 | 70KB |
| /queue | 0 | 4756ms | 1300ms | 418KB | 32 | 70KB |
| /sistema-para-barbearia | 0.0017 | 2016ms | 1304ms | 161KB | 8 | 70KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3588ms | 1296ms | 223KB | 11 | 100KB |
| /login | 0 | 2252ms | 1284ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2144ms | 1284ms | 201KB | 16 | 35KB |
| /planos | 0.0258 | 2964ms | 1280ms | 281KB | 13 | 70KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3268ms | 1276ms | 223KB | 11 | 100KB |
| /login | 0 | 2140ms | 1280ms | 201KB | 16 | 70KB |
| /cadastro | 0.0005 | 2076ms | 1272ms | 201KB | 16 | 70KB |
| /planos | 0 | 2964ms | 1272ms | 281KB | 13 | 70KB |
