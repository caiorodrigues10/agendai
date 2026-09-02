# Auditoria backend ↔ frontend

Data: 2026-09-01

## Escopo e método

O levantamento cruza o Graphify, as rotas Fastify e os consumidores em `src/infra`, contexts, páginas e componentes. Webhooks, callbacks públicos, jobs e endpoints de infraestrutura não são lacunas de interface.

## Correções aplicadas

- Upload de vídeo alinhado de `/api/feed/video?barbershopId=...` para `/api/feed/:barbershopId/video`.
- Logout agora chama `POST /api/auth/logout` e revoga refresh tokens, sem impedir a saída quando a rede falhar.
- Recuperação por WhatsApp removida da tela porque os endpoints usados não existem; a recuperação por e-mail permanece.
- `.eslintignore` obsoleto removido; os ignores já vivem no `eslint.config.js`.

## Backend sem experiência completa no frontend

### Prioridade alta

1. **Categorias de serviço:** listar/criar/editar/excluir existem, mas não há gestão nem seletor completo em serviços.
2. **Categorias de despesa:** a tela somente lista e usa categorias; faltam criar, renomear e excluir.
3. **Mesclagem de clientes:** `POST /crm/clients/merge` não tem seleção, prévia de impacto e confirmação no CRM.

### Prioridade média

4. **Backfill CRM:** execução por tenant/global e histórico de runs não possuem tela administrativa observável.
5. **Detalhe de campanha:** o wrapper possui `GET /crm/campaigns/:id`, mas o histórico não abre destinatários, falhas e exclusões.
6. **Lembretes manuais:** o backend permite executar a rotina sob demanda; falta ação com confirmação e resultado.
7. **Segurança da conta:** falta UI específica para revogar todas as sessões e, futuramente, visualizar dispositivos. O logout atual já revoga os tokens existentes.

### Baixa prioridade ou uso interno

8. Endpoints financeiros por salão no Master Admin podem ganhar drill-down operacional.
9. Upload direto de logo/avatar é fallback; o frontend usa URL assinada e não precisa expô-lo.
10. Webhooks, health checks, callbacks e processadores de fila são backend-only por desenho.

## Riscos estruturais

- O Graphify indexa worktrees `.mimo-service-catalog-*`, gerando símbolos duplicados; eles devem ser excluídos e o grafo regenerado.
- Contratos HTTP são strings independentes no Fastify e no frontend; por isso o erro do vídeo passou pelo TypeScript.
- Multipart fora do `apiClient` fragmenta correlação, sessão e erros.
- A matriz “rota → wrapper → consumidor → teste” ainda não é validada automaticamente no CI.

## Evolução recomendada

1. Gerar OpenAPI no backend e cliente TypeScript tipado; o CI deve bloquear divergências de método e schema.
2. Criar teste de contrato classificando rotas públicas, operacionais, administrativas, webhooks e jobs.
3. Criar **Central de qualidade dos dados**: duplicados, WhatsApp inválido, consentimento ausente, reconciliação e backfills.
4. Criar **Centro de ações**: agenda incompleta, WhatsApp desconectado, fiados vencidos, clientes em risco e dias fracos.
5. Medir ativação sem PII: onboarding, primeiro serviço, agendamento, fechamento e campanha.
6. Consolidar multipart no `apiClient`, preservando correlação, refresh e erros padronizados.

## Ordem sugerida

1. Categorias de serviço e despesa.
2. Mesclagem de duplicados e qualidade dos dados.
3. Detalhe de campanhas e backfill.
4. OpenAPI + gate de contrato no CI.
5. Centro de ações e telemetria.
