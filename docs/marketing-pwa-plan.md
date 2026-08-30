# Plano de marketing e PWA

Objetivo: reduzir fricção de entrada, aumentar a leitura no mobile e transformar a landing em uma peça de conversão real, sem exagero de copy e sem promessas que a plataforma ainda não cumpre.

## 1. Posicionamento

- Produto: gestão para salões, barbearias e studios com fila digital, agenda, clientes e financeiro.
- Promessa principal: organizar o atendimento em celular primeiro.
- Prova: prints reais das telas da operação, não mock genérico.
- Oferta de entrada: 30 dias de Pro completo sem cartão.

## 2. Estrutura recomendada da landing

1. Hero curto com CTA para `Criar conta grátis`.
1. Prints reais logo acima da dobra.
1. Seção de vídeo do produto, curta, antes do preço.
1. Seção de instalação do PWA.
1. Preços.
1. CTA final.

Regras:

- Não repetir “30 dias free” em excesso.
- Não misturar login e cadastro no mesmo botão.
- Não esconder o caminho de criar conta.
- Não vender recurso não implementado como se fosse pronto.

## 3. Vídeo: onde colocar

Recomendação:

- Landing: vídeo curto de demonstração do produto, 30 a 45 segundos, logo depois dos prints.
- Dentro da plataforma: tutorial de onboarding e de instalação do PWA.

Motivo:

- Na landing, o vídeo ajuda conversão e reduz dúvida.
- Depois do acesso, o vídeo deve ensinar uso e ativação, não competir com a conversão.

## 4. Use real screenshots

Usar screenshots da operação, de preferência:

- fila digital
- agenda
- relatórios

Essas imagens precisam aparecer com contexto e legenda curta. A função do print é provar a experiência real.

## 5. Separação de login e cadastro

O fluxo de entrada deve ficar assim:

- `Entrar` leva para login.
- `Criar conta grátis` leva para cadastro.

Não usar um CTA ambíguo como “começar” para tudo.

## 6. PWA mobile-first

Fases:

1. Foundation
   - manifest
   - service worker
   - ícones
   - prompt de instalação

2. UX mobile
   - safe areas
   - alvos de toque maiores
   - páginas sem overflow horizontal
   - tabelas e painéis responsivos

3. Conversão e ativação
   - instalação explicada
   - onboarding visual
   - vídeo no lugar certo

4. Validação
   - Lighthouse
   - mobile smoke tests
   - verificacao de rotas públicas e privadas

## 7. Guardrails de marketing

- Não prometer comissão se a funcionalidade não estiver pronta.
- Não prometer IA preditiva com precisão numérica sem base real.
- Não prometer lembretes automáticos com SLA fechado se isso ainda não existe.
- Não alterar regra de negócio da oferta: trial sem cartão, cobrança só na continuação.

## 8. KPIs

- clique em `Criar conta grátis`
- conclusão de cadastro
- ativação do salão
- instalação do PWA
- retenção de 7 dias

## 9. Fontes técnicas usadas

- [web.dev install criteria](https://web.dev/articles/install-criteria)
- [web.dev installation prompt](https://web.dev/learn/pwa/installation-prompt?hl=en)
- [web.dev manifest](https://web.dev/learn/pwa/web-app-manifest?hl=en)
- [MDN app icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons)

