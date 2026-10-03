# Posts e perfil social — entrega e validação

## O que mudou

- Catálogo único do backend, com 18 modelos e seis novos layouts editoriais/tipográficos. Filtros com/sem foto, modelos com fotos opcionais e modelos de resultados que exigem fotos reais.
- Três imagens geradas e documentadas em `agendai-back-end/src/modules/posts/assets/README.md`. São ilustrações, nunca provas de resultados ou depoimentos de clientes. Upload do salão substitui a imagem ilustrativa nos layouts compatíveis.
- Prévia e exportação nos formatos 1:1, 4:5 e 9:16; prévia desatualizada não pode ser baixada. Rascunho local separado por usuário/salão. Uploads bloqueiam o salvamento até terminar.
- Editor acessível com foco contido, Escape, restauração de rolagem, acesso explícito à prévia e agendamento visíveis no celular.
- Perfil público inspirado na navegação de perfis sociais: avatar, informações reais, status de funcionamento, atalhos de atendimento, stories de 24 horas e grade.
- Abas Publicações, Vídeos, Marcados, Avaliações e Sobre. Avaliações continuam vinculadas a atendimentos reais; nota oculta quando o módulo de reputação não libera a média. Não há seguidores/estatísticas inventados.
- Vídeos com player e capa; stories com navegação. Não há autoplay obrigatório nem publicação automática no Instagram.
- Comentários persistidos, paginação e exclusão pelo autor/responsável; cliente comenta por sessão de telefone verificado via WhatsApp. Salão sem WhatsApp conectado recebe erro explicativo, não confirmação falsa de envio.
- Marcações entre salões passam pela aprovação do responsável pelo salão marcado.
- Compartilhamento nativo ou cópia de link permanente. `/saloes/:salonId/posts/:postId` abre a publicação e seus comentários; `/queue/:salonId?tab=profile` abre o perfil.

## Verificação feita em 02/10/2026

- Backend: suíte completa com 131 arquivos / 1.154 testes aprovados; typecheck, build e docs:check aprovados.
- Frontend: 40 testes focados de editor/perfil/API social/carrossel aprovados; typecheck, build e lint sem erros nos arquivos da entrega. O build mantém o aviso anterior de bundle grande do StaffDashboard.
- Navegador: 14 cenários aprovados em desktop e celular, incluindo formato real da arte, agendamento, contenção de foco, modal/story, OTP/comentário/exclusão, links, player e ocultação de nota sem avaliações.
- Renderização visual: 54 PNGs, cobrindo os 18 modelos nos três formatos; testes de geometria verificam títulos longos, logo, CTA e áreas seguras.
- SQL da migration validada em PostgreSQL isolado em memória (PGlite): constraints, FK/cascade, unicidade, grants e RLS. Nenhuma migration executada no Supabase de produção.
- A suíte completa de frontend não está verde: 10 falhas em `ProductCatalogPanel.test.tsx` e `ProductFormModal.test.tsx`, que não foram alterados nesta entrega. O primeiro usa o componente sem AuthProvider; o segundo falha na expectativa de criação/validação do formulário. Não confundir esses testes com os fluxos sociais aprovados.

Os cenários HTTP/UI usam dependências/servidores simulados. Não comprovam envio real por Evolution, decodificação de vídeo de cliente, funcionamento do storage remoto ou deploy. Essa homologação precisa acontecer com um salão de teste após a implantação.

## Repetir a QA local

Na pasta frontend, com ambos os repositórios e dependências presentes:

```powershell
npm run typecheck
npx vitest run src/features/posts/PostEditor.test.tsx src/features/shop/ShopProfile.test.tsx src/infra/socialApi.test.ts src/components/domain/PublicProductCarousel.test.tsx
npm run build
npm run docs:check
```

Abrir Vite dev em um terminal (`npm run dev -- --host 127.0.0.1 --port 3003`) e em outro:

```powershell
$env:E2E_BASE_URL='http://127.0.0.1:3003'
$env:POST_EDITOR_QA='1'
npx playwright test e2e/post-social.spec.ts e2e/post-editor.spec.ts
```

O harness monta o editor real somente na interceptação do teste; não adiciona rota pública de laboratório ao aplicativo. Gera suas próprias artes em um diretório temporário. O teste do editor é opt-in porque usa módulos de desenvolvimento do Vite; não executá-lo contra produção ou `vite preview`. Fotos/casos são ilustrativos, sem dados reais de clientes.

## Implantação pendente

Aplicar a migration `20261002000004_add_post_social_interactions` pelo processo normal de `prisma migrate deploy`, gerar Prisma Client e implantar backend + frontend compatíveis. Não usar `db push`. Confirmar o histórico/baseline de migrations antes de executar em um banco existente. O contrato completo está em `agendai-back-end/docs/POST_SOCIAL.md`.

Após deploy: validar com duas contas/salões que um salão não modera comentários nem aprova marcações de outro; confirmar OTP com WhatsApp conectado/desconectado; publicar/agendar modelos com e sem foto; testar arquivo MP4/MOV real, stories expirados e links compartilhados em outro aparelho.

Esta entrega preserva alterações pré-existentes e não cria commit/push automaticamente.
