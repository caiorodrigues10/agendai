# Matriz de autorização/IDOR — 102 probes

Total: **102** · dentro do esperado: **88** · desvios: **14**

## Desvios

| grupo | probe | esperado | obtido | detalhe |
|---|---|---|---|---|
| barbearias | GET /barbershops/:B/schedule com token A | 403/404/200-público | 200 | {"success":true,"data":[{"dayOfWeek":0,"isOpen":false,"openT |
| barbearias | GET /barbershops/:B/staff com token A | 403/404/200-público | 200 | {"success":true,"data":[{"id":"2ae257d4-932c-48c3-bbb4-4dd15 |
| servicos | GET /services sem token (barbershopId A) | 401/400 | 200 | {"success":true,"data":[{"id":"96afc3ce-63d7-43cc-96be-9ed7e |
| servicos | GET /services/:id (tenant B) token A | 403/404 | 400 | barbershopId é obrigatório |
| agenda | GET /appointments/availability shop B token A (isolamento) | 403/404 | 200 | [] |
| lista-espera | GET /barbershops/:B/waitlist token A (isolamento) | 403/404/200-vazio | 200 | {"success":true,"data":{"items":[],"total":0,"page":1,"limit |
| avaliacoes | POST reviews respond token A em tenant B | 403/404 | 400 | Dados inválidos |
| feed | GET /feed sem token | 401/403/400 | 200 | {"success":true,"data":[]} |
| feed | GET /posts token A | 200 | 400 | Dados inválidos |
| fidelidade | GET loyalty/shop B token A (isolamento) | 403/404/200-vazio | 200 | {"success":true,"data":{"id":"7f4905b2-82c2-4b8a-9fd2-c33331 |
| metas | GET goals shop B token A (isolamento) | 403/404/200-vazio | 200 | {"success":true,"data":[]} |
| financeiro | GET /barbershops/:B/profit/period/month token A (IDOR) | 403/404 | 400 | Dados inválidos |
| webhooks | POST /payments/webhook genérico sem token | 401/403/400 | 200 | {"received":true} |
| upload | GET users/:id/avatar/upload-url token A em id inexistente | 401/403/404 | 400 | Dados inválidos |

## Todos os probes

| grupo | probe | esperado | obtido | ok |
|---|---|---|---|---|
| auth | POST /auth/login body inválido | 400 | 400 | sim |
| auth | GET /auth/me sem token | 401 | 401 | sim |
| auth | GET /auth/sessions sem token | 401 | 401 | sim |
| auth | POST /auth/logout sem token | 401 | 401 | sim |
| auth | POST /auth/refresh token inválido | 401 | 401 | sim |
| auth | GET /auth/me token A | 200 | 200 | sim |
| usuarios | GET /users sem token | 401 | 401 | sim |
| usuarios | GET /users com token A | 200? | 200 | sim |
| usuarios | GET /admin/users (master-only) com token A | 403 | 403 | sim |
| usuarios | GET /admin/users sem token | 401 | 401 | sim |
| usuarios | GET /admin/users com master | 200 | 200 | sim |
| usuarios | POST /users body inválido | 400 | 400 | sim |
| barbearias | GET /barbershops (público?) | 200 | 200 | sim |
| barbearias | PUT /barbershops/:B com token A (isolamento) | 403/404 | 403 | sim |
| barbearias | GET /barbershops/:B/schedule com token A | 403/404/200-público | 200 | DESVIO |
| barbearias | PUT /barbershops/:A body inválido | 400 | 400 | sim |
| barbearias | POST /barbershops com token A (master-only) | 403 | 403 | sim |
| barbearias | GET /barbershops/:B/staff com token A | 403/404/200-público | 200 | DESVIO |
| servicos | GET /services sem token (barbershopId A) | 401/400 | 200 | DESVIO |
| servicos | GET /services sem barbershopId | 400 | 400 | sim |
| servicos | GET /services token A + shop A | 200 | 200 | sim |
| servicos | GET /services token A + shop B (isolamento) | 403/404/vazio | 200 | sim |
| servicos | POST /services body inválido | 400 | 400 | sim |
| servicos | GET /services/:id (tenant B) token A | 403/404 | 400 | DESVIO |
| staff | GET /barbershops/:A/staff token A | 200 | 200 | sim |
| staff | GET /staff (rota staff) sem token | 401/404 | 404 | sim |
| staff | POST /staff body inválido token A | 400/404 | 404 | sim |
| agenda | GET /appointments/availability shop A | 200/400 | 200 | sim |
| agenda | GET /appointments/availability shop B token A (isolamento) | 403/404 | 200 | DESVIO |
| agenda | GET /appointments/slots sem token | 401/400/200 | 400 | sim |
| agendamentos | GET /appointments sem token | 401 | 401 | sim |
| agendamentos | GET /appointments token A shop A | 200 | 200 | sim |
| agendamentos | GET /appointments token A shop B (isolamento) | 403/404/vazio | 200 | sim |
| agendamentos | POST /appointments body inválido | 400 | 400 | sim |
| agendamentos | GET /appointments/:id (UUID inválido) | 400 | 400 | sim |
| agendamentos | POST /appointments/:id/complete inexistente | 404 | 404 | sim |
| fila | GET /queue sem barbershopId | 400 | 400 | sim |
| fila | GET /queue shop A token A | 200 | 200 | sim |
| fila | GET /queue shop B token A (isolamento) | 403/404/vazio | 403 | sim |
| fila | POST /queue sem token | 401/400 | 400 | sim |
| lista-espera | GET /barbershops/:A/waitlist token A | 200/404 | 200 | sim |
| lista-espera | GET /barbershops/:B/waitlist token A (isolamento) | 403/404/200-vazio | 200 | DESVIO |
| lista-espera | GET waitlist public token inválido | 404 | 404 | sim |
| clientes | GET /clients sem token | 401 | 401 | sim |
| clientes | GET /clients token A shop A | 200 | 200 | sim |
| clientes | GET /clients token A shop B (isolamento) | 403/404/vazio | 200 | sim |
| clientes | GET /clients/:id (cliente do tenant B) | 403/404 | 403 | sim |
| clientes | POST /clients body inválido | 400 | 400 | sim |
| produtos | GET /products sem token | 401 | 401 | sim |
| produtos | GET /products token A shop B (isolamento) | 403/404/vazio | 200 | sim |
| produtos | PATCH /products/:id (tenant B) | 403/404 | 404 | sim |
| produtos | GET /products/:id (rota nao existe no swagger) | 404 | 404 | sim |
| produtos | POST /products body inválido | 400 | 400 | sim |
| produtos | GET public-products shop A | 200 | 200 | sim |
| avaliacoes | GET /reviews/public/context | 200/400 | 400 | sim |
| avaliacoes | GET /barbershops/:B/reviews token A | 200/403/404 | 200 | sim |
| avaliacoes | POST reviews respond sem token | 401 | 401 | sim |
| avaliacoes | POST reviews respond token A em tenant B | 403/404 | 400 | DESVIO |
| feed | GET /feed sem token | 401/403/400 | 200 | DESVIO |
| feed | GET /feed token A shop A | 200 | 200 | sim |
| feed | GET /feed token A shop B (isolamento) | 403/404/vazio | 200 | sim |
| feed | GET /posts token A | 200 | 400 | DESVIO |
| feed | GET /posts sem token | 401 | 401 | sim |
| feed | POST /posts body inválido | 400 | 400 | sim |
| fidelidade | GET loyalty/program shop A | 200/404 | 200 | sim |
| fidelidade | GET loyalty/shop B token A (isolamento) | 403/404/200-vazio | 200 | DESVIO |
| fidelidade | GET loyalty/program sem token | 401 | 401 | sim |
| metas | GET goals shop A | 200/404 | 200 | sim |
| metas | GET goals shop B token A (isolamento) | 403/404/200-vazio | 200 | DESVIO |
| metas | POST goals body inválido | 400 | 400 | sim |
| pacotes | GET /service-packages sem token | 401/400 | 401 | sim |
| pacotes | GET /service-packages token A shop A | 200 | 200 | sim |
| pacotes | GET /client-packages token A | 200/400 | 200 | sim |
| comissoes | GET /commissions sem token | 401/400 | 401 | sim |
| comissoes | GET /commissions token A shop A | 200 | 200 | sim |
| comissoes | GET /commissions/summary token A shop B (isolamento) | 403/404/vazio | 200 | sim |
| financeiro | GET /barbershop/financial/summary token A | 200/400 | 200 | sim |
| financeiro | GET /barbershop/financial/summary sem token | 401 | 401 | sim |
| financeiro | GET /admin/financial/overview token A (master-only) | 403 | 403 | sim |
| financeiro | GET /admin/financial/overview master | 200 | 200 | sim |
| financeiro | GET /barbershops/:B/profit/period/month token A (IDOR) | 403/404 | 400 | DESVIO |
| assinaturas | GET /plans (público) | 200 | 200 | sim |
| assinaturas | GET /subscriptions/me token A | 200/404 | 200 | sim |
| assinaturas | GET /subscriptions/me sem token | 401 | 401 | sim |
| assinaturas | GET /admin/subscriptions token A (master-only) | 403 | 403 | sim |
| assinaturas | POST /subscriptions body inválido token A | 400/403 | 400 | sim |
| webhooks | POST /payments/webhook/asaas sem assinatura | 401/403/400 | 401 | sim |
| webhooks | POST /payments/webhook/asaas assinatura inválida | 401/403/400 | 401 | sim |
| webhooks | POST /payments/webhook/abacate sem token | 401/403/400 | 401 | sim |
| webhooks | POST /payments/webhook genérico sem token | 401/403/400 | 200 | DESVIO |
| upload | GET logo/upload-url sem token | 401 | 401 | sim |
| upload | GET products/:id/image/upload-url sem token | 401/404 | 401 | sim |
| upload | GET users/:id/avatar/upload-url token A em id inexistente | 401/403/404 | 400 | DESVIO |
| upload | GET users/:id/avatar/upload-url token A em user A (mesmo) | 200/400/403 | 400 | sim |
| contato | POST /contact body inválido | 400 | 400 | sim |
| contato | POST /contact sem token (público esperado) | 400 | 400 | sim |
| master | GET /admin/dashboard sem token | 401 | 401 | sim |
| master | GET /admin/dashboard com token A | 403 | 403 | sim |
| master | GET /admin/dashboard com master | 200 | 200 | sim |
| master | GET /admin/accounts com token A | 403 | 403 | sim |
| master | GET /admin/audit-logs com token A | 403 | 403 | sim |
| master | POST /admin/accounts/:id/suspend com token A | 403 | 403 | sim |
