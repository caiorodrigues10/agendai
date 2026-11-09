# Medição — r4

Gerado em 2026-10-07T07:17:51.051Z · base http://127.0.0.1:4173 · API both

## Layout (todas as rotas/larguras, API fora)

| métrica | valor |
|---|---|
| rotas medidas | 84 |
| páginas com estouro horizontal | 2 (máx 5px) |
| clicáveis <44px em mobile (alvo real) | 0 |
| exceções justificadas (texto corrido / frase / label com controle ok) | 0 / 0 / 44 |
| textos <12px em mobile | 0 |
| páginas sem exatamente 1 h1 | 18 |
| <img> visíveis sem width/height | 154 |

<details><summary>estouro (detalhe)</summary>

- /login@320=5px
- /esqueci-senha@320=5px

</details>

<details><summary>h1 (detalhe)</summary>

- /login@320=2
- /cadastro@320=2
- /esqueci-senha@320=0
- /login@375=2
- /cadastro@375=2
- /esqueci-senha@375=0
- /login@390=2
- /cadastro@390=2
- /esqueci-senha@390=0
- /login@768=2
- /cadastro@768=2
- /esqueci-senha@768=0
- /login@1024=2
- /cadastro@1024=2
- /esqueci-senha@1024=0
- /login@1440=2
- /cadastro@1440=2
- /esqueci-senha@1440=0

</details>

<details><summary>img (detalhe)</summary>

- /@320=2
- /funcionalidades@320=2
- /ia-preditiva@320=2
- /agendamento@320=2
- /sobre@320=2
- /contato@320=2
- /privacidade@320=2
- /termos@320=2
- /login@320=1
- /cadastro@320=1
- /esqueci-senha@320=1
- /planos@320=2
- /queue@320=2
- /sistema-para-barbearia@320=2
- /@375=2
- /funcionalidades@375=2
- /ia-preditiva@375=2
- /agendamento@375=2
- /sobre@375=2
- /contato@375=2
- /privacidade@375=2
- /termos@375=2
- /login@375=1
- /cadastro@375=1
- /esqueci-senha@375=1
- /planos@375=2
- /queue@375=2
- /sistema-para-barbearia@375=2
- /@390=2
- /funcionalidades@390=2
- /ia-preditiva@390=2
- /agendamento@390=2
- /sobre@390=2
- /contato@390=2
- /privacidade@390=2
- /termos@390=2
- /login@390=1
- /cadastro@390=1
- /esqueci-senha@390=1
- /planos@390=2
- /queue@390=2
- /sistema-para-barbearia@390=2
- /@768=2
- /funcionalidades@768=2
- /ia-preditiva@768=2
- /agendamento@768=2
- /sobre@768=2
- /contato@768=2
- /privacidade@768=2
- /termos@768=2
- /login@768=1
- /cadastro@768=1
- /esqueci-senha@768=1
- /planos@768=2
- /queue@768=2
- /sistema-para-barbearia@768=2
- /@1024=2
- /funcionalidades@1024=2
- /ia-preditiva@1024=2
- /agendamento@1024=2
- /sobre@1024=2
- /contato@1024=2
- /privacidade@1024=2
- /termos@1024=2
- /login@1024=2
- /cadastro@1024=2
- /esqueci-senha@1024=1
- /planos@1024=2
- /queue@1024=2
- /sistema-para-barbearia@1024=2
- /@1440=2
- /funcionalidades@1440=2
- /ia-preditiva@1440=2
- /agendamento@1440=2
- /sobre@1440=2
- /contato@1440=2
- /privacidade@1440=2
- /termos@1440=2
- /login@1440=2
- /cadastro@1440=2
- /esqueci-senha@1440=1
- /planos@1440=2
- /queue@1440=2
- /sistema-para-barbearia@1440=2

</details>

## Performance (4G lenta + CPU 4x)

| cenário | rotas | CLS med | CLS máx | LCP med | LCP máx | FCP med | JS med | scripts med | imgs med |
|---|---|---|---|---|---|---|---|---|---|
| off@375 | 14 | 0.0002 | 0.0526 | 2288ms | 4524ms | 1288ms | 201KB | 9 | 129KB |
| real@375 | 14 | 0 | 0.0457 | 2124ms | 4588ms | 1288ms | 201KB | 9 | 129KB |
| off@1440 | 4 | 0.0005 | 0.0265 | 2940ms | 3312ms | 1288ms | 223KB | 16 | 129KB |
| real@1440 | 4 | 0.0003 | 0.0007 | 2928ms | 3172ms | 1280ms | 223KB | 16 | 129KB |

### off@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3196ms | 1288ms | 223KB | 11 | 129KB |
| /funcionalidades | 0 | 2308ms | 1284ms | 206KB | 9 | 129KB |
| /ia-preditiva | 0 | 2808ms | 1292ms | 205KB | 9 | 129KB |
| /agendamento | 0 | 2288ms | 1288ms | 159KB | 8 | 129KB |
| /sobre | 0.0457 | 2004ms | 1296ms | 159KB | 8 | 129KB |
| /contato | 0 | 2108ms | 1280ms | 180KB | 9 | 129KB |
| /privacidade | 0.0095 | 1580ms | 1284ms | 155KB | 7 | 129KB |
| /termos | 0.0122 | 1588ms | 1280ms | 155KB | 7 | 129KB |
| /login | 0 | 3016ms | 1284ms | 201KB | 16 | 129KB |
| /cadastro | 0.0002 | 2028ms | 1288ms | 201KB | 16 | 129KB |
| /esqueci-senha | 0.0004 | 1472ms | 1284ms | 149KB | 5 | 129KB |
| /planos | 0.0526 | 2984ms | 1288ms | 281KB | 13 | 129KB |
| /queue | 0 | 4524ms | 1292ms | 418KB | 32 | 129KB |
| /sistema-para-barbearia | 0.0017 | 2020ms | 1304ms | 162KB | 8 | 129KB |

### real@375

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3172ms | 1292ms | 223KB | 11 | 129KB |
| /funcionalidades | 0 | 2288ms | 1300ms | 206KB | 9 | 129KB |
| /ia-preditiva | 0 | 2784ms | 1292ms | 205KB | 9 | 129KB |
| /agendamento | 0.001 | 2280ms | 1288ms | 159KB | 8 | 129KB |
| /sobre | 0.0457 | 2056ms | 1284ms | 159KB | 8 | 129KB |
| /contato | 0 | 2124ms | 1288ms | 180KB | 9 | 129KB |
| /privacidade | 0.0095 | 1984ms | 1284ms | 155KB | 7 | 129KB |
| /termos | 0.0122 | 1924ms | 1288ms | 155KB | 7 | 129KB |
| /login | 0 | 2116ms | 1292ms | 201KB | 16 | 129KB |
| /cadastro | 0 | 2096ms | 1292ms | 201KB | 16 | 129KB |
| /esqueci-senha | 0.0004 | 1468ms | 1288ms | 149KB | 5 | 129KB |
| /planos | 0 | 2984ms | 1284ms | 281KB | 13 | 129KB |
| /queue | 0 | 4588ms | 1292ms | 418KB | 32 | 129KB |
| /sistema-para-barbearia | 0.0017 | 2012ms | 1288ms | 162KB | 8 | 129KB |

### off@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3312ms | 1288ms | 223KB | 11 | 129KB |
| /login | 0 | 2168ms | 1288ms | 201KB | 16 | 129KB |
| /cadastro | 0.0005 | 2088ms | 1288ms | 201KB | 16 | 129KB |
| /planos | 0.0265 | 2940ms | 1288ms | 281KB | 13 | 129KB |

### real@1440

| rota | CLS | LCP | FCP | JS | scripts | imagens |
|---|---|---|---|---|---|---|
| / | 0 | 3172ms | 1272ms | 223KB | 11 | 129KB |
| /login | 0.0003 | 2040ms | 1280ms | 201KB | 16 | 129KB |
| /cadastro | 0 | 2116ms | 1280ms | 201KB | 16 | 129KB |
| /planos | 0.0007 | 2928ms | 1284ms | 281KB | 13 | 129KB |
