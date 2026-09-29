# Inventário de marca — Agenda Já (frontend)

> Troca de marca `AgendAI` / `AGENDAI` / `AgendaJá` → **Agenda Já** (2026-09-26).
> Escopo: apresentação pública do app Vite. Contratos, URLs, chaves e identificadores técnicos preservados.
> Resultado: 41 arquivos alterados (+109/−101), fora `graphify-out` e `package-lock.json`.

## 1. Alterada

| Área | Arquivos / detalhes |
|---|---|
| Estático / SEO | `index.html` (title, apple-mobile-web-app-title), `metadata.json` (name), `vite.config.ts` (manifest `name`/`short_name` via constante) |
| Marketing | `commercialPages.ts` (23 textos + metaTitles, via constante), `softwareApplicationLd.ts` (JSON-LD `name`, via constante), `LandingPage` (título + 2 textos), `About`, `Contact`, `Features`, `Dashboard`, `Scheduling`, `AiPredictive`, `CommercialIntent`, `Plans` |
| Termos / privacidade | `TermsPage` (10), `PrivacyPolicyPage` (5) — apenas a marca; regras, contatos e `agendai:…` citados preservados |
| UI / painel | `MarketingFooter` (logo + copyright, via constante), `Logo.tsx` (comentário + alts; `AgendaJá` → `Agenda Já`), `AdminLayout`, `MasterAdminDashboard` (`AGENDA JÁ Master`), `TeamPage`, `OnboardingMissions`, `PwaInstallCard` (redação: "Agenda Já está instalada"), `PwaUpdatePrompt`, `SystemStatePage`, `credit-card-form`, `ShopProfile` (selo), `PublicLinkPanel`, `ShareReferralButton`, `OwnerReferralsPanel`, `OwnerSubscriptionPanel`, `ShowcasePublicPage`, `EmailPreferencesPanel`, `AppointmentScheduler` (PRODID do `.ics`) |
| Documentação | `README.md`, `AGENTS.md`, `.github/copilot-instructions.md` |
| Testes | `NotFoundPage.test.tsx` (expectativas de título), `LandingPage.test.tsx` (mock de nav) |

**Constante:** `src/config/brand.ts` — `BRAND_NAME`, `BRAND_NAME_UPPER`, `BRAND_TITLE_SUFFIX`, reutilizada nos geradores principais (marketing, Ld, rodapé, títulos, manifesto PWA, selos). Arquivos estáticos (`index.html`, `metadata.json`) usam literal — não importam módulos.

**Gênero/preposição:** ajustado em todos os textos (`O AgendAI` → `A Agenda Já`, `no` → `na`, `do` → `da`, `ao` → `à`, `sobre o` → `sobre a`, …).

**Não alterado por design:** `public/sitemap.xml` e `public/robots.txt` (só URLs canônicas com `agendai`); logos/favicon/screenshots (binários já atualizados).

## 2. Exceção técnica (preservadas, deliberadas)

- **URLs/e-mails exibidos:** `agendai-pcts.onrender.com`, `agendai.app` (FeaturesPage), `contato@agendai.com.br`.
- **Chaves locais/eventos:** `agendai:theme`, `agendai:cookie-consent(-v2)`, `agendai:consent-changed`, `agendai:referral-code`, `agendai:session-expired`, `agendai:access-block(ed)`, `agendai:post-draft:*`, `agendai-gtag`, `agendai-fbpixel`, JSON-LD id `agendai-jsonld`, cache `agendai-static-images`.
- **Identificadores:** `package.json` `name`, diretórios (`agendai/`, `agendai-back-end`, `agendai-nextjs`), caminhos de asset `/brand/agendai-logo*.png`, UID de calendário `…@agendai`.
- `.ic` PRODID contém `Agenda Já` (alterada); `UID` preservado.

## 3. Histórico preservado

- `.opencode/snapshots/*` (snapshots datados de estado).
- Dados já gravados no navegador/dispositivo (sessões, preferências, rascunhos) — sem migração, tudo continua válido.

## 4. Pendências / notas

- **Screenshots do PWA refeitos** com a marca nova: `queue-real.png`, `appointments-real.png` e `reports-real.png` (os dois últimos ainda tinham o logo antigo "AGENDA|AI"). Captura automatizável via `scripts/capture-screenshots.mjs` (Playwright; requer stack local: BE dev + DB local + dados demo).
- Landing/marketing é **dark por design** (`ThemeContext`: público sem sessão = dark); tema claro aplicado e verificado no painel logado (`staff-queue-light`).
- Checks visuais executados: landing desktop/mobile, login, fila pública, fila do staff (dark/claro), agenda e relatórios — todos com "Agenda Já".
- Nome do remetente em produção: env `EMAIL_FROM` no Render (fallback do backend já alterado).
