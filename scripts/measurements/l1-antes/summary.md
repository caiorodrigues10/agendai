# Medição — l1-antes

Gerado em 2026-10-07T22:45:07.128Z · base http://127.0.0.1:4173 · API both

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

## Performance (4G lenta + CPU 4x, mediana de 5 execuções por rota)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 14 | 0.0004 | 0.0526 | 2276ms | 4584ms | 1300ms | 201KB | 9 | 70KB |
| real@375 | 14 | 0.0004 | 0.0457 | 2260ms | 4556ms | 1300ms | 201KB | 9 | 70KB |
| off@1440 | 4 | 0.0005 | 0.0258 | 3024ms | 3276ms | 1304ms | 223KB | 16 | 70KB |
| real@1440 | 4 | 0 | 0.0003 | 3004ms | 3252ms | 1292ms | 223KB | 16 | 70KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3168ms | 1292ms | 223KB | 11 | 70KB |
| /funcionalidades | 0 | 2276ms | 1304ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0.0004 | 2748ms | 1296ms | 205KB | 9 | 70KB |
| /agendamento | 0 | 2340ms | 1308ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 2008ms | 1300ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2080ms | 1304ms | 180KB | 9 | 70KB |
| /privacidade | 0.0095 | 2004ms | 1304ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1632ms | 1308ms | 155KB | 7 | 70KB |
| /login | 0 | 2588ms | 1296ms | 201KB | 16 | 70KB |
| /cadastro | 0.0002 | 2092ms | 1304ms | 201KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1500ms | 1292ms | 149KB | 5 | 35KB |
| /planos | 0.0526 | 3080ms | 1296ms | 281KB | 13 | 70KB |
| /queue | 0 | 4584ms | 1292ms | 418KB | 32 | 70KB |
| /sistema-para-barbearia | 0.0017 | 2032ms | 1300ms | 161KB | 8 | 70KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3148ms | 1300ms | 223KB | 11 | 70KB |
| /funcionalidades | 0 | 2260ms | 1300ms | 206KB | 9 | 70KB |
| /ia-preditiva | 0.0004 | 2732ms | 1296ms | 205KB | 9 | 70KB |
| /agendamento | 0.001 | 2316ms | 1300ms | 159KB | 8 | 70KB |
| /sobre | 0.0457 | 2012ms | 1300ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2072ms | 1292ms | 180KB | 9 | 70KB |
| /privacidade | 0.0095 | 1624ms | 1300ms | 155KB | 7 | 70KB |
| /termos | 0.0122 | 1952ms | 1296ms | 155KB | 7 | 70KB |
| /login | 0 | 2444ms | 1296ms | 201KB | 16 | 70KB |
| /cadastro | 0.0002 | 2076ms | 1308ms | 201KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1488ms | 1304ms | 149KB | 5 | 35KB |
| /planos | 0 | 3060ms | 1304ms | 281KB | 13 | 70KB |
| /queue | 0 | 4556ms | 1304ms | 418KB | 32 | 70KB |
| /sistema-para-barbearia | 0.0017 | 2052ms | 1300ms | 161KB | 8 | 70KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3276ms | 1304ms | 223KB | 11 | 70KB |
| /login | 0.0003 | 2128ms | 1300ms | 201KB | 16 | 70KB |
| /cadastro | 0.0005 | 2120ms | 1292ms | 201KB | 16 | 70KB |
| /planos | 0.0258 | 3024ms | 1304ms | 281KB | 13 | 70KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3252ms | 1288ms | 223KB | 11 | 70KB |
| /login | 0.0003 | 2140ms | 1292ms | 201KB | 16 | 70KB |
| /cadastro | 0 | 2164ms | 1292ms | 201KB | 16 | 70KB |
| /planos | 0 | 3004ms | 1292ms | 281KB | 13 | 70KB |
