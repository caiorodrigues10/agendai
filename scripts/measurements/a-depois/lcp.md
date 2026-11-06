# Diagnóstico LCP — 5 execuções por rota

Condições: rede Slow 4G (1,6 Mbps / 150 ms RTT) + CPU 4×, viewport 375×667, consentimento de cookies pré-setado.

## /login (API off, 5 execuções)

- **LCP mediano**: 2360 ms · **FCP mediano**: 1300 ms · elemento estável em só 2 variações as execuções
- **Elemento LCP**: `<img>` classe `h-9 w-auto object-contain` — “” (173×36px)
- **Cadeia do elemento**: img.h-9.w-auto.object-contain → span.inline-flex.select-none → button.min-h-11.cursor-pointer.transition-transform → div.mb-6.flex.w-full → div.p-5.sm:p-8.flex → div.relative.w-full.max-w-lg
- **Estilo no paint**: opacity=1, visibility=visible, fonte 16px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 2050 ms (666 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 7 ms · descoberta do recurso +1858 ms · download do recurso 332 ms · renderização +46 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1816 · render +71 ⇒ soma ≈ 2360 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 3, 3, 2, 3, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/login (document)` | html | 0 | 164 | 164 | 1.2 |
| `/assets/index-xmcxtlRY.css` | css (bloqueia pintura) | 193 | 614 | 421 | 27.5 |
| `/assets/index-DF0YClbO.js` | js | 193 | 1194 | 1001 | 144.3 |
| `/assets/LoginPage-BdfcZbXy.js` | js | 1289 | 1628 | 340 | 12.9 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1290 | 1486 | 196 | 0.9 |
| `/assets/Toast-BZTEvDUF.js` | js | 1290 | 1501 | 210 | 0.9 |
| `/assets/PasswordInput-CL4z2kVB.js` | js | 1290 | 1528 | 238 | 1.8 |
| `/assets/schemas-dGJwPKgF.js` | js | 1290 | 1536 | 246 | 3.5 |
| `/assets/index-Fc0GMTy0.js` | js | 1290 | 1758 | 469 | 23 |
| `/assets/Avatar-BnQSKhR4.js` | js | 1291 | 1672 | 382 | 0.9 |
| `/assets/recaptcha-qJqcbnQr.js` | js | 1291 | 1695 | 405 | 0.4 |
| `/assets/plansApi-BkPc5LZ5.js` | js | 1291 | 1717 | 426 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1291 | 1788 | 497 | 0.9 |
| `/assets/Card-0E-f2xp7.js` | js | 1291 | 1829 | 538 | 0.5 |
| `/assets/Combination-BSO3olMY.js` | js | 1291 | 1945 | 654 | 7.4 |
| `/assets/formatters-qI0gGYoN.js` | js | 1292 | 1886 | 595 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1301 | 1951 | 649 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1309 | 2086 | 777 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 2022 | 2354 | 332 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1309→2086ms (61.4KB)

## /login (API off, 5 execuções)

- **LCP mediano**: 2180 ms · **FCP mediano**: 1288 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `font-sans text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight` — “Seu salão, no controle.” (592×52px)
- **Cadeia do elemento**: p.font-sans.text-4xl.xl:text-5xl → div → div.flex-1.flex.flex-col → div.relative.z-10.flex → div.relative.hidden.lg:flex → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 48px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1976 ms (680 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1811 ms · renderização +252 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1821 · render +180 ⇒ soma ≈ 2180 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 3, 2, 3, 3, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/login (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-xmcxtlRY.css` | css (bloqueia pintura) | 173 | 593 | 420 | 27.5 |
| `/assets/index-DF0YClbO.js` | js | 173 | 1174 | 1002 | 144.3 |
| `/assets/LoginPage-BdfcZbXy.js` | js | 1249 | 1588 | 340 | 12.9 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1250 | 1438 | 188 | 0.9 |
| `/assets/Toast-BZTEvDUF.js` | js | 1250 | 1444 | 194 | 0.9 |
| `/assets/PasswordInput-CL4z2kVB.js` | js | 1250 | 1481 | 232 | 1.8 |
| `/assets/schemas-dGJwPKgF.js` | js | 1250 | 1501 | 252 | 3.5 |
| `/assets/index-Fc0GMTy0.js` | js | 1250 | 1717 | 467 | 23 |
| `/assets/Avatar-BnQSKhR4.js` | js | 1251 | 1610 | 360 | 0.9 |
| `/assets/recaptcha-qJqcbnQr.js` | js | 1251 | 1645 | 394 | 0.4 |
| `/assets/plansApi-BkPc5LZ5.js` | js | 1251 | 1667 | 416 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1251 | 1754 | 504 | 0.9 |
| `/assets/Card-0E-f2xp7.js` | js | 1251 | 1775 | 524 | 0.5 |
| `/assets/Combination-BSO3olMY.js` | js | 1251 | 1881 | 630 | 7.4 |
| `/assets/formatters-qI0gGYoN.js` | js | 1252 | 1837 | 586 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1261 | 1902 | 640 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1266 | 2049 | 783 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1946 | 2267 | 321 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1266→2049ms (61.4KB)

## /login (API real, 5 execuções)

- **LCP mediano**: 2104 ms · **FCP mediano**: 1300 ms · elemento estável em só 2 variações as execuções
- **Elemento LCP**: `<h1>` classe `mt-5 text-center text-2xl font-black tracking-tight text-text-primary sm:text-3xl` — “Bem-vindo de volta” (217×32px)
- **Cadeia do elemento**: h1.mt-5.text-center.text-2xl → div.mb-6.flex.w-full → div.p-5.sm:p-8.flex → div.relative.w-full.max-w-lg → div.relative.flex.items-center → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 24px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1990 ms (698 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1832 ms · renderização +98 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1812 · render +82 ⇒ soma ≈ 2104 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 2, 3, 3, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/login (document)` | html | 0 | 158 | 158 | 1.2 |
| `/assets/index-xmcxtlRY.css` | css (bloqueia pintura) | 171 | 595 | 424 | 27.5 |
| `/assets/index-DF0YClbO.js` | js | 171 | 1173 | 1002 | 144.3 |
| `/assets/schemas-dGJwPKgF.js` | js | 1246 | 1490 | 244 | 3.5 |
| `/assets/LoginPage-BdfcZbXy.js` | js | 1246 | 1573 | 327 | 12.9 |
| `/assets/index-Fc0GMTy0.js` | js | 1246 | 1703 | 457 | 23 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1247 | 1423 | 176 | 0.9 |
| `/assets/Toast-BZTEvDUF.js` | js | 1247 | 1445 | 197 | 0.9 |
| `/assets/PasswordInput-CL4z2kVB.js` | js | 1247 | 1475 | 228 | 1.8 |
| `/assets/Avatar-BnQSKhR4.js` | js | 1247 | 1618 | 371 | 0.9 |
| `/assets/recaptcha-qJqcbnQr.js` | js | 1247 | 1645 | 397 | 0.4 |
| `/assets/plansApi-BkPc5LZ5.js` | js | 1248 | 1668 | 420 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1248 | 1737 | 490 | 0.9 |
| `/assets/Card-0E-f2xp7.js` | js | 1248 | 1781 | 534 | 0.5 |
| `/assets/formatters-qI0gGYoN.js` | js | 1248 | 1839 | 590 | 1.2 |
| `/assets/Combination-BSO3olMY.js` | js | 1248 | 1903 | 655 | 7.4 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1257 | 1887 | 631 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1260 | 2031 | 772 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1963 | 2289 | 326 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1260→2031ms (61.4KB)

## /login (API real, 5 execuções)

- **LCP mediano**: 2092 ms · **FCP mediano**: 1292 ms · elemento estável em todas as execuções
- **Elemento LCP**: `<p>` classe `font-sans text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight` — “Seu salão, no controle.” (592×52px)
- **Cadeia do elemento**: p.font-sans.text-4xl.xl:text-5xl → div → div.flex-1.flex.flex-col → div.relative.z-10.flex → div.relative.hidden.lg:flex → div.min-h-dvh.bg-bg.grid
- **Estilo no paint**: opacity=1, visibility=visible, fonte 48px "DM Sans" · visível desde a criação
- **Entrada no DOM**: 1994 ms (702 ms DEPOIS do FCP ⇒ conteúdo criado/apresentado por JS)
- **Divisão do tempo (execução 1)**: TTFB 2 ms · criação do elemento +1829 ms · renderização +98 ms
- **Divisão (mediana)**: TTFB 2 · elemento/recurso +1814 · render +101 ⇒ soma ≈ 2092 ms
- **Depende de JS**: elemento criado após FCP em 5/5 execuções · nasceu escondido em 0/5 · dentro de `div#root`: não · entradas LCP por execução (repinturas): 2, 3, 2, 2, 2
- **Chamadas API antes do LCP**: nenhuma

Caminho crítico até o LCP (execução 1):

| recurso | tipo | início | fim | dur | KB |
|---|---|---|---|---|---|
| `/login (document)` | html | 0 | 165 | 165 | 1.2 |
| `/assets/index-xmcxtlRY.css` | css (bloqueia pintura) | 173 | 594 | 420 | 27.5 |
| `/assets/index-DF0YClbO.js` | js | 173 | 1173 | 1000 | 144.3 |
| `/assets/LoginPage-BdfcZbXy.js` | js | 1246 | 1575 | 329 | 12.9 |
| `/assets/index-Fc0GMTy0.js` | js | 1246 | 1703 | 457 | 23 |
| `/assets/documentUtils-vKPiRY5z.js` | js | 1247 | 1430 | 182 | 0.9 |
| `/assets/schemas-dGJwPKgF.js` | js | 1247 | 1488 | 241 | 3.5 |
| `/assets/Toast-BZTEvDUF.js` | js | 1248 | 1447 | 200 | 0.9 |
| `/assets/PasswordInput-CL4z2kVB.js` | js | 1248 | 1475 | 227 | 1.8 |
| `/assets/Avatar-BnQSKhR4.js` | js | 1248 | 1617 | 369 | 0.9 |
| `/assets/recaptcha-qJqcbnQr.js` | js | 1248 | 1644 | 397 | 0.4 |
| `/assets/plansApi-BkPc5LZ5.js` | js | 1248 | 1667 | 419 | 0.8 |
| `/assets/subscriptionPaywall-DXyPTYF5.js` | js | 1248 | 1740 | 492 | 0.9 |
| `/assets/Card-0E-f2xp7.js` | js | 1249 | 1781 | 532 | 0.5 |
| `/assets/Combination-BSO3olMY.js` | js | 1249 | 1904 | 654 | 7.4 |
| `/assets/formatters-qI0gGYoN.js` | js | 1250 | 1840 | 591 | 1.2 |
| `/assets/workbox-window.prod.es5-BBnX5xw4.js` | js | 1258 | 1895 | 637 | 2.6 |
| `/fonts/dm-sans-normal-latin.woff2` | fonte | 1262 | 2033 | 771 | 61.4 |
| `/brand/agendai-logo-dark.webp` | imagem | 1964 | 2289 | 325 | 34.9 |

Fontes carregadas até o LCP: dm-sans-normal-latin.woff2 1262→2033ms (61.4KB)
