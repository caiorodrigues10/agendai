# Item 3 — A/B da animação `hero-line-rise` de `/` (rodada atual)

## Pergunta

A animação do H1 de `/` (que no Item C piorou LCP em +220 ms e foi revertida)
pode voltar sem custo de LCP nesta build?

## Método

- Mesma build (toggle sem rebuild): `A` = sem animação (style injetado via
  `addInitScript`, `html .hero-line-rise{animation:none !important}`);
  `B` = com animação. Toggle verificado a cada run
  (`animationName === 'none'` em A, `'hero-line-rise'` em B).
- 6 sessões intercaladas A-B-A-B-A-B (controle de deriva de máquina).
- Células: `/` off@1440 (decisiva, 5 runs/sessão) e off@375 (3 runs/sessão).
- Slow 4G + CPU 4×, mediana por sessão (mesmo protocolo de
  `scripts/measure-responsive.mjs`).
- Runner: `ab-item3.mjs` (log completo em `ab-item3.log`).

## Resultado

### off@1440 (decisiva)

| Sessão | Arm  | Mediana (ms) |
| ------ | ---- | ------------ |
| 1      | sem  | 2008         |
| 2      | com  | 2028         |
| 3      | sem  | 1988         |
| 4      | com  | 2028         |
| 5      | sem  | 2012         |
| 6      | com  | 2020         |

- Sem animação (A): 2008 / 1988 / 2012 → mediana **2008 ms**
- Com animação (B): 2028 / 2028 / 2020 → mediana **2028 ms**
- **Delta B−A: +20 ms** (critério: ≤ +100 ms) — dentro do ruído de sessão.
- Nenhuma célula acima de 2500 ms.

### off@375

| Arm  | Sessões (ms)      | Mediana |
| ---- | ----------------- | ------- |
| sem  | 1928 / 1900 / 1904 | 1904    |
| com  | 1924 / 1940 / 1892 | 1924    |

Neutro (±20 ms, sem direção consistente).

## Veredito

**MANTER a animação.** O critério da rodada (Δ ≤ +100 ms em off@1440 e
células ≤ 2500 ms) foi atendido. A piora de +220 ms do Item C não se
reproduziu na build atual.

## Mudanças de contrato

- `src/tests/item-c.test.tsx`: `/` agora exige `@keyframes hero-line-rise`,
  classes `.hero-line-rise` e stagger; sem opacity.
- `e2e/responsive/reduced-motion.spec.ts`: `/` anima sem `reduce`, para com
  `reduce` (mesmo contrato de `/planos`).
- `src/styles/features/hero.css`: regra `no-hero-anim` (toggle do A/B) NÃO
  entrou na build final.
