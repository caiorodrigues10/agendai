export interface CommercialFaq {
  question: string;
  answer: string;
}

export interface CommercialPageContent {
  path: string;
  eyebrow: string;
  h1: string;
  h1Accent: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  painTitle: string;
  pains: string[];
  solutionTitle: string;
  solutions: { title: string; body: string }[];
  featuresTitle: string;
  features: string[];
  proofTitle: string;
  proofBody: string;
  faqs: CommercialFaq[];
  related: { to: string; label: string }[];
}

export const COMMERCIAL_PAGES: CommercialPageContent[] = [
  {
    path: '/software-para-salao-de-beleza',
    eyebrow: 'Salão de beleza',
    h1: 'Software para salão de beleza',
    h1Accent: 'que organiza fila, agenda e caixa.',
    description:
      'O AgendAI reúne agendamento online, fila digital, pacotes, fiado e comissão num painel feito para o ritmo do salão — sem planilha e sem WhatsApp como sistema.',
    metaTitle: 'Software para salão de beleza | AgendAI',
    metaDescription:
      'Software para salão de beleza com agenda online, fila digital, CRM, fiado e financeiro. 30 dias de Pro grátis, sem cartão.',
    painTitle: 'O que trava o salão no dia a dia',
    pains: [
      'Horário marcado no caderno e no WhatsApp ao mesmo tempo — e os dois erram.',
      'Comissão calculada no fim do mês, com briga de memória e print de Pix.',
      'Cliente some e ninguém percebe; pacote vendido some no papel.',
      'Fiado solto no caderno, sem saldo nem cobrança organizada.',
    ],
    solutionTitle: 'Como o AgendAI resolve no salão',
    solutions: [
      {
        title: 'Agenda e fila no mesmo fluxo',
        body: 'A cliente marca pelo link. No dia, o check-in vira posição na fila. Você não redigita nome nem perde o horário.',
      },
      {
        title: 'Pacotes, fiado e comissão no caixa',
        body: 'Venda de pacote, consumo de sessão, fiado identificado e comissão por serviço ficam no mesmo atendimento.',
      },
      {
        title: 'CRM para quem está sumindo',
        body: 'Você vê última visita, valor total da cliente e quem precisa de retorno — sem exportar planilha.',
      },
    ],
    featuresTitle: 'O que o salão mais usa',
    features: [
      'Agenda por profissional e duração real do serviço',
      'Pacotes de sessões com validade',
      'Fiado com cliente identificado',
      'Comissão na finalização do atendimento',
      'Estoque e PDV de produtos, se você vender retail',
      'WhatsApp opcional para lembrete e confirmação',
    ],
    proofTitle: 'Feito para operação, não só para vitrine',
    proofBody:
      'O AgendAI já cobre fila, agenda, clientes, financeiro e produtos no painel. O teste de 30 dias é o Pro completo, sem cartão. Essencial fica R$ 14/mês; Pro, R$ 20/mês.',
    faqs: [
      {
        question: 'Serve para salão feminino e unissex?',
        answer:
          'Sim. O sistema não é exclusivo de barbearia: serviços, profissionais, pacotes e fila funcionam para salão feminino, unissex ou studio.',
      },
      {
        question: 'Preciso instalar um app na Play Store?',
        answer:
          'Não. A cliente agenda pelo link no celular. A equipe usa o painel no navegador ou instala o PWA na tela inicial.',
      },
      {
        question: 'Consigo controlar comissão por profissional?',
        answer:
          'Sim. Na finalização do atendimento você registra o valor e a divisão de comissão. O módulo de comissões acumula o que cada profissional gerou.',
      },
      {
        question: 'Tem período de teste?',
        answer: 'Sim. 30 dias de Pro completo, sem cartão. Depois você escolhe Essencial ou Pro só se quiser continuar.',
      },
    ],
    related: [
      { to: '/app-para-agendamento-de-salao', label: 'App de agendamento' },
      { to: '/sistema-para-barbearia', label: 'Sistema para barbearia' },
      { to: '/planos', label: 'Ver planos' },
    ],
  },
  {
    path: '/sistema-para-barbearia',
    eyebrow: 'Barbearia',
    h1: 'Sistema para barbearia',
    h1Accent: 'com fila digital de verdade.',
    description:
      'Chega de “quem é o próximo?” na calçada. O AgendAI mostra a fila, o tempo estimado e a agenda do barbeiro no celular — com caixa, fiado e comissão no mesmo lugar.',
    metaTitle: 'Sistema para barbearia | AgendAI',
    metaDescription:
      'Sistema para barbearia com fila digital, agenda, comissão e financeiro. Organize a espera e o caixa. 30 dias grátis, sem cartão.',
    painTitle: 'Dor típica da barbearia',
    pains: [
      'Fila na porta, cliente vai embora e o barbeiro só vê quando já perdeu o corte.',
      'Encaixe no WhatsApp vira conflito de horário com quem já estava sentado.',
      'Comissão de cada barbeiro vira discussão no fechamento.',
      'Movimento de chuva ou sábado some da memória — sem dado para decidir.',
    ],
    solutionTitle: 'Fila, cadeira e caixa alinhados',
    solutions: [
      {
        title: 'Fila digital com posição visível',
        body: 'O cliente entra pelo link, vê a posição e espera no celular. Você chama na ordem, sem gritar o nome na porta.',
      },
      {
        title: 'Agenda que respeita o barbeiro',
        body: 'Horário marcado cai na cadeira certa. No dia, o check-in entra na fila sem cadastro duplicado.',
      },
      {
        title: 'Fechamento sem caderno',
        body: 'Atendimento finalizado registra pagamento, fiado e comissão. O dono vê o dia no financeiro.',
      },
    ],
    featuresTitle: 'Pensado para barbearia',
    features: [
      'Fila por profissional ou fila geral',
      'Tempo médio de espera',
      'Encaixe e walk-in no mesmo painel',
      'Comissão por corte/barba/combo',
      'PDV de pomada, lâmina e produto',
      'Modo só fila, só agenda ou híbrido',
    ],
    proofTitle: 'Barbearia não precisa de ERP pesado',
    proofBody:
      'O AgendAI é mobile-first: o barbeiro opera no celular. Trial de 30 dias no Pro, sem cartão. Planos a partir de R$ 14/mês.',
    faqs: [
      {
        question: 'Funciona se a barbearia só atende por ordem de chegada?',
        answer:
          'Sim. Você pode operar só com fila, só com agenda, ou os dois. O modo de operação é configuração do salão.',
      },
      {
        question: 'O cliente precisa baixar um aplicativo?',
        answer: 'Não. Ele abre o link da barbearia no navegador e entra na fila ou agenda o horário.',
      },
      {
        question: 'Dá para vender produto na cadeira?',
        answer:
          'Sim. Há PDV de varejo junto do atendimento, com estoque, formas de pagamento e fiado quando o cliente está identificado.',
      },
      {
        question: 'WhatsApp é obrigatório?',
        answer:
          'Não. Lembretes e fila funcionam sem WhatsApp. Se você conectar a Evolution API, o salão pode enviar mensagens automáticas.',
      },
    ],
    related: [
      { to: '/sistema-para-fila-de-barbearia', label: 'Fila de barbearia' },
      { to: '/software-para-salao-de-beleza', label: 'Software para salão' },
      { to: '/planos', label: 'Ver planos' },
    ],
  },
  {
    path: '/app-para-agendamento-de-salao',
    eyebrow: 'Agendamento',
    h1: 'App para agendamento de salão',
    h1Accent: 'sem forçar ninguém a baixar nada.',
    description:
      'A cliente escolhe serviço, profissional e horário no link do salão. Você vê a agenda num calendário só. No dia, o horário vira fila — sem telefonema e sem horário duplicado.',
    metaTitle: 'App para agendamento de salão | AgendAI',
    metaDescription:
      'App para agendamento de salão pelo link público: horários livres, profissional, check-in na fila e lembretes. 30 dias grátis.',
    painTitle: 'Por que o telefone não escala',
    pains: [
      'A recepção passa o dia confirmando horário que a cliente já esqueceu.',
      'Dois profissionais marcam o mesmo encaixe no grupo do WhatsApp.',
      'Cancelamento de última hora deixa buraco que ninguém preenche.',
      'A cliente não sabe o que está livre e desiste.',
    ],
    solutionTitle: 'Agenda pública que conversa com a operação',
    solutions: [
      {
        title: 'Só aparece horário livre',
        body: 'A disponibilidade respeita expediente, duração do serviço, profissional e bloqueios. Sem overlap.',
      },
      {
        title: 'A cliente remarca no prazo',
        body: 'Política de antecedência, cancelamento e remarcação fica nas regras da agenda pública.',
      },
      {
        title: 'No dia vira fila',
        body: 'Check-in transforma o agendamento em posição. Você não perde quem chegou nem quem só passou.',
      },
    ],
    featuresTitle: 'O que o agendamento cobre',
    features: [
      'Link público sem login da cliente',
      'Escolha de serviço e profissional',
      'Horários em grade, no fuso do salão',
      'Lembrete opcional por WhatsApp',
      'PWA para a equipe (atalho na tela inicial)',
      'Pacotes: agenda já debita sessão',
    ],
    proofTitle: 'Não é um app de vitrine: é a agenda do salão',
    proofBody:
      'O mesmo sistema que a cliente usa para marcar é o que a equipe usa para atender. Teste 30 dias, sem cartão.',
    faqs: [
      {
        question: 'É um aplicativo da App Store?',
        answer:
          'Para a cliente, não precisa. Ela agenda no navegador. A equipe pode instalar o AgendAI como PWA no celular, com atalho para fila e agenda.',
      },
      {
        question: 'Posso limitar até quando a cliente marca?',
        answer:
          'Sim. Você define antecedência mínima, horizonte de reservas e prazos de cancelamento/remarcação nas regras da agenda.',
      },
      {
        question: 'E se o salão também atender encaixe?',
        answer:
          'Walk-in entra na fila. Agenda e fila convivem no modo híbrido, sem dois sistemas.',
      },
      {
        question: 'Quanto custa depois do teste?',
        answer: 'Essencial a R$ 14/mês e Pro a R$ 20/mês. O trial de 30 dias é o Pro completo.',
      },
    ],
    related: [
      { to: '/software-para-salao-de-beleza', label: 'Software para salão' },
      { to: '/agendamento', label: 'Como funciona a agenda' },
      { to: '/cadastro', label: 'Criar conta grátis' },
    ],
  },
  {
    path: '/sistema-para-fila-de-barbearia',
    eyebrow: 'Fila digital',
    h1: 'Sistema para fila de barbearia',
    h1Accent: 'para parar de perder cliente na porta.',
    description:
      'O cliente entra na fila pelo celular, vê a posição e espera sentado — não na calçada. Você chama na ordem, mede a espera e fecha o atendimento com pagamento na hora.',
    metaTitle: 'Sistema para fila de barbearia | AgendAI',
    metaDescription:
      'Sistema para fila de barbearia: posição na espera, check-in, tempo estimado e caixa no mesmo painel. 30 dias grátis sem cartão.',
    painTitle: 'Fila na rua custa movimento',
    pains: [
      'Cliente olha a porta, acha que vai demorar e vai embora.',
      '“Eu cheguei antes” vira discussão na recepção.',
      'Barbeiro não sabe se chama o próximo ou espera o horário marcado.',
      'Sábado lotado some no feeling — você não sabe onde travou.',
    ],
    solutionTitle: 'Fila que o cliente e o barbeiro enxergam',
    solutions: [
      {
        title: 'Entrada pelo link, não pela porta',
        body: 'QR code ou link do Instagram. O cliente entra na fila com nome e serviço, mesmo na rua ou no carro.',
      },
      {
        title: 'Ordem clara para chamar',
        body: 'A equipe vê quem está esperando, quem está na cadeira e quem já foi chamado. Menos grito, menos furo.',
      },
      {
        title: 'Fila + agenda no mesmo dia',
        body: 'Quem marcou horário faz check-in e entra na fila. Quem chegou agora também. Um painel só.',
      },
    ],
    featuresTitle: 'Fila do começo ao caixa',
    features: [
      'Posição e estimativa de espera',
      'Fila por barbeiro ou fila única',
      'Chamada e finalização no celular',
      'Pagamento, fiado e produto no encerramento',
      'Alerta de capacidade / movimento',
      'Funciona sem WhatsApp; com WhatsApp, avisa o cliente',
    ],
    proofTitle: 'A fila é o produto, não um extra',
    proofBody:
      'O AgendAI nasceu da operação de espera. Agenda, CRM e financeiro entram em volta da fila — não o contrário. 30 dias de Pro, sem cartão.',
    faqs: [
      {
        question: 'O cliente precisa ficar com o site aberto?',
        answer:
          'Ele entra na fila pelo link e pode acompanhar a posição. Se o salão configurar WhatsApp, dá para avisar quando estiver perto da vez.',
      },
      {
        question: 'Dá para ter fila só de um barbeiro?',
        answer: 'Sim. A fila pode ser geral ou por profissional, conforme o jeito da casa.',
      },
      {
        question: 'E os horários marcados no meio da fila walk-in?',
        answer:
          'No modo híbrido o agendamento faz check-in e entra na fila. Você não mantém duas listas mentais.',
      },
      {
        question: 'Serve só para barbearia?',
        answer:
          'A fila também atende salão e studio. Esta página foca barbearia porque a espera na porta é a dor mais forte desse nicho.',
      },
    ],
    related: [
      { to: '/sistema-para-barbearia', label: 'Sistema para barbearia' },
      { to: '/app-para-agendamento-de-salao', label: 'Agendamento online' },
      { to: '/cadastro', label: 'Criar conta grátis' },
    ],
  },
  {
    path: '/sistema-para-salao-de-beleza',
    eyebrow: 'Salão de beleza',
    h1: 'Sistema para salão de beleza',
    h1Accent: 'que a cliente acessa pelo celular.',
    description:
      'O AgendAI é um sistema completo para salão de beleza: agenda online, fila digital, pacotes, fiado e comissão — tudo num link público que a cliente abre no navegador.',
    metaTitle: 'Sistema para salão de beleza | AgendAI',
    metaDescription:
      'Sistema para salão de beleza com agenda online, fila digital, pacotes, fiado e comissão. 30 dias de Pro grátis, sem cartão.',
    painTitle: 'Salão de beleza perde o controle no WhatsApp',
    pains: [
      'Cliente manda "tem vaga?" e a recepção responde no WhatsApp enquanto atende outra pessoa.',
      'Dupla marcação acontece quando dois profissionais marcam o mesmo horário no grupo.',
      'Pacote vendido some do controle — a cliente diz que pagou e ninguém lembra.',
      'Comissão do mês vira discussão porque ninguém anotou quem atendeu quem.',
    ],
    solutionTitle: 'Como o sistema resolve no salão',
    solutions: [
      {
        title: 'Link público sem login',
        body: 'A cliente abre o link, escolhe o serviço e profissional. Horário só aparece se estiver livre.',
      },
      {
        title: 'Pacotes com controle',
        body: 'Venda de pacote com validade e consumo automático. A cliente vê as sessões restantes no link.',
      },
      {
        title: 'Comissão automática',
        body: 'Na finalização do atendimento, o sistema calcula a comissão por profissional. Sem planilha.',
      },
    ],
    featuresTitle: 'Tudo que o salão de beleza precisa',
    features: [
      'Agenda por profissional e duração real do serviço',
      'Pacotes de sessões com validade',
      'Fiado com cliente identificado',
      'Comissão na finalização do atendimento',
      'Estoque e PDV de produtos',
      'WhatsApp opcional para lembrete',
    ],
    proofTitle: 'Feito para salão, não para escritório',
    proofBody:
      'O AgendAI já cobre fila, agenda, clientes, financeiro e produtos. 30 dias de Pro completo, sem cartão. Essencial fica R$ 14/mês; Pro, R$ 20/mês.',
    faqs: [
      {
        question: 'Precisa instalar alguma coisa?',
        answer: 'Não. O salão cadastra no painel web. A cliente agenda pelo link no navegador. A equipe pode instalar o PWA na tela inicial.',
      },
      {
        question: 'Funciona para salão feminino?',
        answer: 'Sim. Serviços, profissionais, pacotes e fila funcionam para salão feminino, masculino ou unissex.',
      },
      {
        question: 'Tem período de teste?',
        answer: 'Sim. 30 dias de Pro completo, sem cartão. Depois escolhe Essencial ou Pro.',
      },
    ],
    related: [
      { to: '/software-para-salao-de-beleza', label: 'Software para salão' },
      { to: '/app-para-agendamento-de-salao', label: 'Agendamento online' },
      { to: '/planos', label: 'Ver planos' },
    ],
  },
  {
    path: '/sistema-para-manicure',
    eyebrow: 'Manicure',
    h1: 'Sistema para manicure',
    h1Accent: 'que agenda sem WhatsApp.',
    description:
      'O AgendAI organiza a agenda da manicure com link público, lembrete automático e controle de pacotes. A cliente marca sozinha, sem ligar.',
    metaTitle: 'Sistema para manicure | AgendAI',
    metaDescription:
      'Sistema para manicure com agenda online, lembrete por WhatsApp, pacotes e fiado. 30 dias grátis sem cartão.',
    painTitle: 'Manicure perde cliente por falta de organização',
    pains: [
      'Cliente combina horário no WhatsApp e esquece — cadeira fica vazia.',
      'Pacote de 10 unhas vende e ninguém anota quantas faltam.',
      'Manicure atende amiga na frente e a cliente fiel espera mais.',
      'Fim do mês e não sabe quantas atendeu nem quanto faturou.',
    ],
    solutionTitle: 'Agenda que funciona sozinha',
    solutions: [
      {
        title: 'Link público com horário real',
        body: 'A cliente escolhe o serviço e horário. Só aparece o que está livre, no fuso do salão.',
      },
      {
        title: 'Lembrete automático',
        body: 'WhatsApp avisa 24h e 1h antes. Menos falta, menos cadeira vazia.',
      },
      {
        title: 'Pacotes digitais',
        body: 'Venda pacote com validade. Cada sessão é descontada automaticamente no atendimento.',
      },
    ],
    featuresTitle: 'Para manicure e studio de unhas',
    features: [
      'Agenda com duração real por serviço',
      'Lembrete por WhatsApp automático',
      'Pacotes com validade e controle',
      'Fiado com cliente identificado',
      'Perfil público do profissional',
      'Funciona sem app — só link',
    ],
    proofTitle: 'Não é app de vitrine: é operação',
    proofBody:
      'O mesmo link que a cliente usa para agendar é o que a equipe usa para atender. Teste 30 dias, sem cartão.',
    faqs: [
      {
        question: 'Precisa de computador?',
        answer: 'Não. Tudo funciona no celular. A cliente agenda pelo link. A manicure opera no painel mobile.',
      },
      {
        question: 'Dá para vender pacotes?',
        answer: 'Sim. Crie pacotes com sessões e validade. O consumo é automático no atendimento.',
      },
    ],
    related: [
      { to: '/software-para-salao-de-beleza', label: 'Software para salão' },
      { to: '/funcionalidades', label: 'Ver funcionalidades' },
      { to: '/planos', label: 'Ver planos' },
    ],
  },
  {
    path: '/sistema-para-lash-designer',
    eyebrow: 'Lash designer',
    h1: 'Sistema para lash designer',
    h1Accent: 'com agenda que respeita o tempo.',
    description:
      'O AgendAI agenda extensão de cílios com duração real, lembrete automático e controle de manutenção. A cliente marca sem ligar.',
    metaTitle: 'Sistema para lash designer | AgendAI',
    metaDescription:
      'Sistema para lash designer com agenda online, manutenção programada, lembrete e pacotes. 30 dias grátis.',
    painTitle: 'Lash designer perde agendamento no WhatsApp',
    pains: [
      'Cliente combina manutenção e não aparece — duas horas perdidas.',
      'Horário de aplicação é longo e o WhatsApp não mostra conflito.',
      'Manutenção atrasada da cliente e ninguém lembra de chamar.',
      'Não sabe quantas aplicações fez no mês nem qual serviço rendeu mais.',
    ],
    solutionTitle: 'Agenda inteligente para lash',
    solutions: [
      {
        title: 'Duração real do serviço',
        body: 'Aplicação, manutenção e remoção têm tempos diferentes. A agenda respeita cada um.',
      },
      {
        title: 'Lembrete de manutenção',
        body: 'O sistema avisa a cliente quando está na hora da manutenção. Menos esquecimento, mais retorno.',
      },
      {
        title: 'Controle de sessões',
        body: 'Pacotes de manutenção com consumo automático. A cliente vê quantas faltam no link.',
      },
    ],
    featuresTitle: 'Feito para o ritmo da lash',
    features: [
      'Agenda com tempos por tipo de serviço',
      'Lembrete de manutenção automático',
      'Pacotes de sessões com validade',
      'Link público sem app',
      'Financeiro por profissional',
      'WhatsApp opcional',
    ],
    proofTitle: 'Operação simples, resultado completo',
    proofBody:
      'Agenda, clientes, financeiro e lembretes no mesmo painel. 30 dias de Pro, sem cartão.',
    faqs: [
      {
        question: 'Funciona para brow designer também?',
        answer: 'Sim. Qualquer serviço de cílios e sobrancelhas se encaixa na agenda com tempos diferenciados.',
      },
      {
        question: 'Precisa baixar aplicativo?',
        answer: 'Não. A lash designer opera no celular pelo navegador. A cliente agenda pelo link.',
      },
    ],
    related: [
      { to: '/sistema-para-manicure', label: 'Sistema para manicure' },
      { to: '/app-para-agendamento-de-salao', label: 'Agendamento online' },
      { to: '/planos', label: 'Ver planos' },
    ],
  },
  {
    path: '/crm-para-salao-de-beleza',
    eyebrow: 'CRM',
    h1: 'CRM para salão de beleza',
    h1Accent: 'que lembra quem está sumindo.',
    description:
      'O AgendAI mostra última visita, frequência, valor total e risco de evasão de cada cliente. Você retoma o contato sem exportar planilha.',
    metaTitle: 'CRM para salão de beleza | AgendAI',
    metaDescription:
      'CRM para salão de beleza: histórico do cliente, frequência, pacotes, fiado e retorno automático. 30 dias grátis.',
    painTitle: 'Salão perde cliente sem perceber',
    pains: [
      'Cliente faz 3 meses que não volta e ninguém percebe.',
      'Não sabe quem são os 20% que geram 80% do faturamento.',
      'Pacote vendido esgota e a cliente não renova — sem aviso.',
      'Dados do cliente estão no WhatsApp e no caderno, nunca num painel.',
    ],
    solutionTitle: 'Visão completa de cada cliente',
    solutions: [
      {
        title: 'Timeline do cliente',
        body: 'Última visita, total gasto, serviços preferidos e profissional de estimação — tudo numa tela.',
      },
      {
        title: 'Alerta de evasão',
        body: 'O sistema marca clientes que estão sem voltar. Você retoma antes de perder de vez.',
      },
      {
        title: 'Integra com agenda e fila',
        body: 'CRM não é apartado. Cada atendimento alimenta o perfil automaticamente.',
      },
    ],
    featuresTitle: 'CRM que o salão realmente usa',
    features: [
      'Perfil do cliente com histórico completo',
      'Alerta de clientes sumindo',
      'Frequência e ticket médio por cliente',
      'Pacotes e fiado vinculados ao perfil',
      'Busca por nome ou telefone',
      'Sem exportar planilha',
    ],
    proofTitle: 'Dado que estava no WhatsApp vira decisão',
    proofBody:
      'O CRM do AgendAI é alimentado automaticamente pela operação. 30 dias de Pro, sem cartão.',
    faqs: [
      {
        question: 'Preciso cadastrar os clientes?',
        answer: 'Não. Quem entra na fila ou agenda já cria o perfil. O histórico se constrói com o uso.',
      },
      {
        question: 'Funciona para salão pequeno?',
        answer: 'Sim. Mesmo com 2 profissionais, saber quem está sumindo faz diferença no faturamento.',
      },
    ],
    related: [
      { to: '/software-para-salao-de-beleza', label: 'Software para salão' },
      { to: '/funcionalidades', label: 'Ver funcionalidades' },
      { to: '/planos', label: 'Ver planos' },
    ],
  },
  {
    path: '/controle-financeiro-para-salao',
    eyebrow: 'Financeiro',
    h1: 'Controle financeiro para salão',
    h1Accent: 'sem planilha e sem surpresa.',
    description:
      'O AgendAI mostra entradas, despesas, fiado e lucro líquido em tempo real. Você vê o resultado do dia sem abrir planilha.',
    metaTitle: 'Controle financeiro para salão | AgendAI',
    metaDescription:
      'Controle financeiro para salão: entradas, despesas, fiado e lucro em tempo real. 30 dias de Pro grátis, sem cartão.',
    painTitle: 'Salão não sabe quanto lucra de verdade',
    pains: [
      'Fim do mês e o dono soma Pix, dinheiro e cartão no caderno.',
      'Despesa pequena some e o lucro parece menor do que deveria.',
      'Fiado acumula e não tem vencimento nem cobrança organizada.',
      'Não sabe qual serviço dá mais lucro nem qual profissional fatura mais.',
    ],
    solutionTitle: 'Financeiro que o dono enxerga',
    solutions: [
      {
        title: 'Entradas em tempo real',
        body: 'Cada pagamento registrado alimenta o painel. PIX, cartão, dinheiro e fiado — tudo junto.',
      },
      {
        title: 'Despesas com categoria',
        body: 'Registre aluguel, produto, equipe e fixos. O sistema subtrai e mostra o líquido.',
      },
      {
        title: 'Fiado com vencimento',
        body: 'Cliente fiado fica identificado. Vencimento, parcial e status — sem caderno.',
      },
    ],
    featuresTitle: 'O que o financeiro cobre',
    features: [
      'Entradas por serviço e profissional',
      'Despesas com categorias',
      'Fiado com vencimento e pagamentos parciais',
      'Lucro líquido do período',
      'Relatório por dia, semana e mês',
      'Exportação para contabilidade',
    ],
    proofTitle: 'O Pro mostra o que o Essencial não vê',
    proofBody:
      'Financeiro, despesas e fiado ficam no plano Pro. 30 dias de teste completo, sem cartão. Depois R$ 20/mês.',
    faqs: [
      {
        question: 'Preciso digitar tudo manualmente?',
        answer: 'Entradas de atendimento são automáticas. Despesas você registra — mas o painel é simples.',
      },
      {
        question: 'Funciona para quem tem vários salões?',
        answer: 'Sim. Cada salão é um mundo isolado. O dono pode ver cada um separadamente.',
      },
    ],
    related: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/software-para-salao-de-beleza', label: 'Software para salão' },
      { to: '/planos', label: 'Ver planos' },
    ],
  },
];

export function commercialPageByPath(path: string): CommercialPageContent | undefined {
  return COMMERCIAL_PAGES.find(page => page.path === path);
}
