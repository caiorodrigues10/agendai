# Mapa de domínio — Frontend ↔ API

Código existente ≠ comprovadamente funcional em produção. Distinguir:

| Estado | Significado |
|---|---|
| **Implementado** | Há UI + chamada HTTP + rota backend correspondente |
| **Habilitado por config** | Depende de env/flag/plano (ex.: OTEL, GCS, WhatsApp) |
| **Validado** | Há testes automatizados cobrindo o fluxo (unit/e2e) |

## Domínios

| Domínio | UI principal | API FE | Backend (prefixo típico) |
|---|---|---|---|
| Auth | `LoginPage`, reset/verify | `authApi` | `/api/auth` |
| Assinatura / planos | `PlansPage`, `CheckoutPage`, `OwnerSubscriptionPanel` | `plansApi`, `subscriptionsApi`, `paymentsApi` | `/api/plans`, `/api/subscriptions`, `/api/payments` |
| Barbearia / settings | `SettingsManager` | `barbershopApi` | `/api/barbershops` |
| Serviços | `ServiceManager`, `ServiceForm` | `barbershopApi` / services | `/api/services` |
| Equipe | `TeamManager` | `usersApi` | `/api/users` |
| Fila | `QueueItemCard`, `PublicHome` | `schedulingApi` | `/api/queue` |
| Agenda | `AppointmentScheduler`, booking modal | `schedulingApi` | `/api/appointments` |
| Clientes CRM | `ClientsManager`, `ClientProfileSheet` | `clientsApi`, `crmApi` | `/api/clients`, `/api/crm` |
| Pacotes | `PackageCatalog`, `BookPackageSessionsModal` | `packagesApi` | `/api/service-packages`, `/api/client-packages` |
| Produtos / estoque / PDV | `ProductsHub`, painéis em `products/` | `productsApi` | `/api/products`, inventory, retail |
| Financeiro owner | `OwnerFinancialPanel`, `FinancialDashboard` | `financialApi` | `/expenses`, `/fiado`, `/barbershop/*` |
| Comissões | painéis de comissão (domain) | `commissionsApi` | `/api/commissions` |
| Notificações | `OwnerNotificationsPanel`, health | `notificationsApi` | `/api/notifications` |
| Posts / feed | `PostsManager` | `barbershopApi` feed / posts | `/api/feed`, `/api/posts` |
| Indicações | `OwnerReferralsPanel` | `referralsApi` | `/api/referrals` |
| Master admin | `MasterAdminDashboard`, `BillingTab` | `adminApi` | `/api/admin/*` |
| Contato público | `ContactPage` | `contactApi` | `/api/contact` |
| Realtime | polling + `realtimeWs` | `realtimeWs` | `/ws` (quando habilitado) |

## Variáveis de ambiente (frontend) — nomes e finalidade

| Var | Finalidade |
|---|---|
| `VITE_API_URL` | Base URL da API em produção |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | Tokenização de cartão no browser |
| `VITE_GOOGLE_CLIENT_ID` | SSO Google |
| `VITE_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 |
| `VITE_PRODUCT_TOUR_VIDEO_URL` | Vídeo de tour (opcional) |
| `VITE_PWA_INSTALL_VIDEO_URL` | Vídeo PWA (opcional) |

Fonte: `.env.example`. Não documentar segredos.
