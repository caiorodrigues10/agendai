# Revisão do editor e dos modelos de posts — 2026-11-02

## Problemas encontrados e correções

| Problema | Consequência | Correção |
|---|---|---|
| Objetivos e modelos sem contexto do estabelecimento | Escritório recebia opções de corte, promoções e antes/depois | Catálogo filtrado pelo segmento autenticado; categoria Advocacia com dez modelos e objetivos próprios |
| IA com contexto fixo de barbearia/salão | Sugestões incompatíveis com o negócio e o público cadastrado | Backend fornece segmento/público reais ao gerador e ao fallback |
| Promoção usava o primeiro preço do cadastro | Oferta anunciada podia mostrar outro serviço ou valor | Campos próprios de serviço/valor no post, usados na prévia e na arte final; publicação exige valor válido |
| Elementos já rasterizados nas imagens promocionais | Faixas e selos não acompanhavam paleta/formato e podiam se sobrepor ao texto | Fotos limpas como fundo; texto, faixas e preço desenhados pelo renderer |
| Título próximo demais ao horário no editorial minimalista | Ascendentes das letras tocavam o kicker de horário | Reserva vertical maior entre os blocos |
| Falha de prévia deixava apenas uma imagem antiga | Usuário não sabia como recuperar a geração | Erro com mensagem do servidor e botão de tentar novamente, preservando os campos |
| Falha ao publicar depois de criar rascunho | Nova tentativa podia duplicar o post | Editor reutiliza o ID já criado |
| Mudança só do modo de atendimento não regenerava a arte | Dados e imagem podiam divergir | Modo incluído nas alterações visuais no backend |
| Editor fixo não acompanhava o teclado | Controles podiam ficar fora da área visível no celular | Uso de `useVisualViewport` e rolagem interna |
| Upload no modelo de apresentação podia ficar sem espaço | Foto escolhida não aparecia ou aproximava texto do rodapé | Área da foto reservada antes do ajuste tipográfico |
| Prévia alta encostava no rodapé fixo | Parte final do Story ficava escondida na janela do editor | Largura e altura limitadas pela área visível, mantendo a proporção |
| Link direto de download de arte hospedada | Navegador podia abrir a imagem em vez de baixar; JPEG recebia extensão PNG | Download via blob com extensão baseada no arquivo real e tratamento de falha |

## Categoria Advocacia

Reutiliza `LAW_FIRM`, que já existe no cadastro/configurações. Não cria outro segmento nem exige migration.

Modelos atuais: identidade do escritório, mapa de atuação, pergunta e resposta, checklist de contratos, etapas de contratação, guia de registros, contato seguro, pauta aberta, perfil profissional e aviso com data. As chaves legadas são preservadas para não invalidar rascunhos.

Todos aceitam quadrado (1080×1080), retrato (1080×1350) e Story (1080×1920). Identificação profissional, inscrição, até quatro blocos com descrição, seção, texto principal, destaque, contato, endereço e site/e-mail são persistidos em `designOptions.legalPost`. Os dados de clientes e processos não são usados na arte.

O catálogo jurídico exclui modelos de preços, descontos, depoimentos e resultados de clientes. A restrição de mensagens em massa do segmento também vale para posts, na interface e no backend. Publicação exige nome e inscrição: pergunta/resposta exige resposta no texto principal ou destaque; aviso exige data ou período no destaque; perfil exige apresentação ou bloco; os demais modelos exigem ao menos um bloco. Blocos vazios podem ser removidos nos modelos com apoio opcional. Rascunhos incompletos podem ser salvos. Textos que não cabem em tamanho legível são rejeitados com orientação para resumir ou trocar o formato; a prévia anterior permanece identificada como desatualizada. O texto livre digitado pelo profissional precisa de revisão humana.

Referência consultada: [Provimento 205/2021 do CFOAB](https://www.oab.org.br/leisnormas/legislacao/provimentos/205-2021). O editor ajuda a manter uma apresentação informativa; o profissional continua responsável pela veracidade e revisão do conteúdo que publicar.

## Verificação reproduzível

- Backend: testes dos controllers, catálogo, SVG/PNG, limites de layout, schemas, sugestões e broadcast em `src/modules/posts/`.
- Frontend: `PostEditor.test.tsx`, `PostsManager.test.tsx` e `postsApi.test.ts`.
- Downloads hospedados: `downloadPostArt.test.ts` (blob, extensão JPEG e resposta de erro).
- Navegação real do componente: `e2e/post-editor.spec.ts` e `e2e/post-legal.spec.ts`, com API simulada e imagens geradas pelo renderer real, em Chromium desktop e mobile.
- Galeria completa: `tsx scripts/preview-post-editorial.ts <diretório absoluto>` no backend. Gera 198 imagens (66 modelos × 3 formatos), contato por categoria, `catalog.json` e `index.html`.
- Galeria jurídica: `tsx scripts/preview-post-law.ts <diretório absoluto>`.

Para os testes de navegador, iniciar Vite dev e definir `POST_EDITOR_QA=1`, `POST_EDITOR_ARTIFACTS=<diretório da galeria>`, `POST_TEMPLATE_BACKEND=<backend>` e `E2E_BASE_URL=<Vite>`.

## Alcance

### Revisão visual da coleção jurídica — v6

Após a revisão do usuário, os dez modelos jurídicos receberam composições editoriais próprias: cartão em papel com monograma, colunas escuras com arcos, fotografia arquitetônica com painel sobreposto, fotografia lateral de escritório, papel centralizado, guia numerado, capa empresarial, nota editorial, retrato em arco e carta institucional.

Os títulos usam Cormorant Garamond normal/itálica e o corpo usa Inter. As medidas reais das fontes empacotadas definem as quebras; o tamanho reduz antes de separar uma palavra ou deixar uma conjunção sozinha. Telefones e e-mails também têm ajuste próprio para o rodapé. Quatro modelos aceitam fotografia própria ou um dos dois fundos ilustrativos gerados para a coleção.

`preview-post-law.ts` agora gera uma galeria com filtros de formato e imagens completas. Nesta revisão passaram 163 testes relacionados, quatro testes de interface (desktop/mobile), typecheck e build. O teste do worker confirma que a imagem produzida pelo backend usa as mesmas fontes da renderização local. Detalhes em `docs/POSTS_LEGAL_DESIGN.md` no backend.

Validação local e automatizada, sem publicar posts nem enviar mensagens a clientes. Emulação mobile em Chromium não equivale a uma execução em Safari/iPhone físico. Os modelos de resultado exigem fotos próprias na publicação; fotos ilustrativas nos artefatos de QA não representam resultados de clientes reais.

Resultado: 285 testes do backend, 74 testes do frontend e oito testes de interface em desktop/mobile passaram. Typecheck, contrato da API, documentação e builds passaram. O lint dos arquivos revisados terminou sem erros, com avisos; o build frontend mantém o aviso de bundle grande do dashboard.

Dois ajustes de ambiente encontrados na revisão: o Vite passou a escanear apenas a entrada do app (sem varrer o Storybook já gerado); o build backend copia fontes/stocks arquivo a arquivo porque `cpSync` recursivo falhava neste Windows. O teste de exportação já tinha três erros de tipagem no `main`: foram corrigidos o fixture e o acesso ao mock, sem mudar a funcionalidade de exportar dados.

### Revisão editorial e mobile — v7 / galeria v3

A auditoria independente identificou microtexto, funções repetidas e espaços pouco aproveitados nos Stories. Os dez modelos agora atendem identidade, mapa de atuação, pergunta/resposta, checklist, etapas, documentos, orientação, nota, perfil e aviso com data. O formulário suporta até quatro blocos e os opcionais seção, texto principal e destaque; os rótulos acompanham o modelo. Pergunta principal usa o título do post, resposta usa Texto principal e os blocos são orientações de apoio.

A renderização mede o conteúdo sem reduzir corpo a microtexto: 36px no quadrado, 40px no retrato e46–52px no Story; informações secundárias ficam em pelo menos33px. Em largura360px, isso equivale a12px,13,3px,15,3–17,3px e11px. O conteúdo excessivo retorna mensagem para encurtar ou mudar de formato; campos preenchidos não são removidos para caber. O Perfil aceita foto própria e usa monograma na ausência dela; o retrato da galeria é fictício e não é selecionado automaticamente no produto.

Revisão por três subagentes: direção visual aproximadamente8/10, leitura mobile8/10 e utilidade editorial aprovada como coleção-base. Foram inspecionados os trinta renders em360px. Essas notas são subjetivas e a inspeção estática não inclui os controles reais de redes sociais. Galeria local: `../artifacts/posts-law-v3/index.html`.

### Retomada da interface — 6 de novembro de 2026 / versão 8

O formulário de pergunta identifica a resposta diretamente; a ausência de blocos obrigatórios produz erro visível no formulário. Avisos de texto extenso orientam verificar o encaixe e não prometem cortes silenciosos no renderer jurídico. Sugestões de IA recebem a chave do modelo separadamente, preservando o limite de 500 caracteres do contexto extra. As sugestões de título e chamada acompanham a finalidade do modelo sem substituir texto personalizado.

Passaram 66 testes direcionados de editor, gerenciador e download, além do typecheck. Foram executados oito cenários de navegador em Chromium desktop/mobile com API simulada: sete passaram na rodada ampliada; o cenário mobile de Story excedeu 45 s e passou isoladamente em 7,4 s. O cenário confirma proporção, ausência de rolagem horizontal e prévia acima do rodapé. Pergunta e comunicado também foram validados com erro inline, foco e correção antes da publicação simulada.

As trinta artes da galeria v4 foram inspecionadas em 360 px. Avaliação visual do agente que não implementou o renderer: 9,0/10, aprovada como coleção-base. Critérios, evidências e limites constam em `../artifacts/posts-law-v4/review/AVALIACAO_UX_FRONTEND.md`. Essa nota é subjetiva; a revisão funcional do frontend foi feita pelo mesmo agente que aplicou os ajustes da interface.

### Redução de texto — 6 de novembro de 2026 / versão 9

Os trinta exemplos jurídicos passam de 1.359 para 570 palavras visíveis (58,1% menos). Cada arte apresenta uma ideia; seção e descrição de apoio deixam de ser obrigatórias em Pauta aberta. O modo Essencial apresenta um contato principal e evita repetir o nome no Perfil; Completo preserva a apresentação antiga. Os campos de contato continuam salvos ao alternar o modo. A opção fica explícita no formulário.

O editor diferencia “Chamada na arte” do botão público de agenda. O detalhe público usa `templateKey` para exibir “Agendar atendimento” nos posts jurídicos, preservando as chamadas personalizadas dos demais segmentos. Dois testes cobrem essa distinção.

A galeria atual fica em `../artifacts/posts-law-v5/index.html`, com comparação em `antes-depois.png`. Os oito cenários de navegador passaram em desktop/mobile com API simulada e PNGs reais. A revisão local não comprova publicação em produção nem resultado de geração por provedor real.

### Catálogo por segmento — versão 11

O catálogo reúne dez modelos por segmento. O editor mostra objetivos próprios nas categorias novas e usa a opção de compatibilidade do catálogo para editar modelos gerais e a antiga coleção de beleza. Os campos de imagem seguem o uso de mídia de cada composição. Os avisos de título e chamada orientam a conferir a prévia, que mede o encaixe no formato selecionado.

A galeria `../artifacts/posts-all-v1/index.html` permite filtrar por categoria, formato e modelo. O manifesto registra as dimensões das imagens e a cobertura por segmento. A tabela de preços tem provas em `../artifacts/posts-price-split-v6/index.html`.
