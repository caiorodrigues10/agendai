# Medição — l2-depois

Gerado em 2026-10-07T23:14:30.212Z · base http://127.0.0.1:4173 · API both

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
| off@375 | 14 | 0.0017 | 0.0743 | 2012ms | 2716ms | 1292ms | 202KB | 11 | 70KB |
| real@375 | 14 | 0.0017 | 0.0501 | 2012ms | 2696ms | 1300ms | 202KB | 11 | 70KB |
| off@1440 | 4 | 0.0015 | 0.0356 | 2112ms | 2188ms | 1300ms | 225KB | 16 | 70KB |
| real@1440 | 4 | 0.0015 | 0.0101 | 2108ms | 2128ms | 1296ms | 225KB | 16 | 70KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0501 | 1936ms | 1304ms | 225KB | 13 | 70KB |
| /funcionalidades | 0.0003 | 2200ms | 1288ms | 208KB | 11 | 70KB |
| /ia-preditiva | 0.0005 | 2716ms | 1300ms | 207KB | 11 | 70KB |
| /agendamento | 0.001 | 2324ms | 1296ms | 160KB | 8 | 70KB |
| /sobre | 0.0457 | 2000ms | 1292ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2052ms | 1284ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 1616ms | 1288ms | 156KB | 7 | 70KB |
| /termos | 0.0122 | 1612ms | 1284ms | 156KB | 7 | 70KB |
| /login | 0 | 2552ms | 1292ms | 202KB | 16 | 70KB |
| /cadastro | 0 | 2072ms | 1296ms | 202KB | 16 | 35KB |
| /esqueci-senha | 0.0004 | 1472ms | 1288ms | 150KB | 5 | 35KB |
| /planos | 0.0743 | 1860ms | 1288ms | 283KB | 14 | 70KB |
| /queue | 0.0501 | 1932ms | 1428ms | 225KB | 13 | 70KB |
| /sistema-para-barbearia | 0.0017 | 2012ms | 1292ms | 162KB | 8 | 70KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0501 | 1904ms | 1292ms | 225KB | 13 | 70KB |
| /funcionalidades | 0.0003 | 2200ms | 1292ms | 208KB | 11 | 70KB |
| /ia-preditiva | 0.0005 | 2696ms | 1300ms | 207KB | 11 | 70KB |
| /agendamento | 0.001 | 2308ms | 1296ms | 160KB | 8 | 70KB |
| /sobre | 0.0457 | 2004ms | 1296ms | 159KB | 8 | 70KB |
| /contato | 0.0017 | 2064ms | 1284ms | 181KB | 9 | 70KB |
| /privacidade | 0.0095 | 1992ms | 1304ms | 156KB | 7 | 70KB |
| /termos | 0.0122 | 1916ms | 1292ms | 156KB | 7 | 70KB |
| /login | 0 | 2104ms | 1304ms | 202KB | 16 | 70KB |
| /cadastro | 0.0002 | 2040ms | 1300ms | 202KB | 16 | 70KB |
| /esqueci-senha | 0.0004 | 1484ms | 1296ms | 150KB | 5 | 35KB |
| /planos | 0.0217 | 1880ms | 1304ms | 283KB | 14 | 70KB |
| /queue | 0.0501 | 1964ms | 1440ms | 225KB | 13 | 100KB |
| /sistema-para-barbearia | 0.0017 | 2012ms | 1300ms | 162KB | 8 | 70KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2032ms | 1304ms | 225KB | 13 | 70KB |
| /login | 0.0003 | 2112ms | 1296ms | 202KB | 16 | 70KB |
| /cadastro | 0 | 2188ms | 1300ms | 202KB | 16 | 35KB |
| /planos | 0.0356 | 1900ms | 1292ms | 283KB | 14 | 70KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0.0015 | 2000ms | 1296ms | 225KB | 13 | 70KB |
| /login | 0.0003 | 2108ms | 1296ms | 202KB | 16 | 70KB |
| /cadastro | 0.0005 | 2128ms | 1296ms | 202KB | 16 | 70KB |
| /planos | 0.0101 | 1904ms | 1296ms | 283KB | 14 | 70KB |
