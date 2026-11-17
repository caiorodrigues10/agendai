import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LuArrowRight as ArrowRight, LuShieldCheck as ShieldCheck } from 'react-icons/lu';
import { MarketingLayout } from '../../layouts/marketing/MarketingLayout';

const CONTACT_EMAIL = 'contato@agendai.com.br';

const sections = [
  {
    title: '1. Quem somos',
    body: [
      'A Agenda Já é uma plataforma SaaS multi-tenant para gestão de salões de beleza, barbearias e studios — atendimento feminino, masculino ou unissex. Sede em Bebedouro-SP, Brasil.',
      'Esta política descreve como tratamos dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).',
    ],
  },
  {
    title: '2. Dados que coletamos',
    body: [
      'Conta e cadastro: nome, e-mail, telefone, CPF/CNPJ do responsável e dados do estabelecimento (nome, endereço, horários).',
      'Fila e agendamentos: nome, telefone e serviço escolhido — informados pelo cliente ao entrar na fila ou agendar.',
      'Financeiro e assinatura: dados de pagamento são processados por Mercado Pago e AbacatePay; a Agenda Já não armazena número completo de cartão.',
      'Contato: nome, e-mail, telefone e mensagem enviados pelo formulário de contato — usados apenas para responder.',
    ],
  },
  {
    title: '3. Cookies e armazenamento local',
    body: [
      'Utilizamos armazenamento local do navegador (localStorage e sessionStorage) para funcionalidades essenciais. Não utilizamos cookies de rastreamento publicitário ou analytics de terceiros.',
    ],
    list: [
      'Sessão e autenticação — tokens de acesso para manter você logado no painel.',
      'Preferência de tema — modo claro ou escuro (agendai:theme).',
      'Fila digital — identificador anônimo do cliente na fila pública (agendai:barber_customer_id).',
      'Indicação — código de referral na sessão, quando aplicável.',
      'Consentimento — registro de que você aceitou esta política (agendai:cookie-consent).',
    ],
  },
  {
    title: '4. Contagem anônima de visitas',
    body: [
      'Contamos, de forma anônima, quantas pessoas abriram a página pública de cada salão (perfil, fila, agendamento e produtos) e de onde vieram (hostname de quem linkou, como Instagram ou WhatsApp).',
      'Não usamos cookie, localStorage, fingerprint, IP, user agent ou qualquer identificador persistente do visitante — o visitante não é identificado nem rastreado entre páginas.',
      'Enviamos apenas o padrão da rota, o identificador público do salão (que já está na URL compartilhada), a forma daquele identificador, se é a primeira visita ou uma troca de aba e, quando presente, o nome da aba aberta. Nada de token, query, fragmento, nome, e-mail ou telefone.',
      'Visitas feitas pelo próprio dono ou pela equipe já logada naquele salão não são contadas.',
      'Quem ativa Do Not Track (DNT) ou Global Privacy Control (GPC) no navegador não é contado, e o envio só ocorre em ambiente de produção. Os números são aproximados e servem apenas ao dono do salão ver o interesse na sua página.',
    ],
  },
  {
    title: '5. Finalidade e base legal',
    body: [
      'Executar o contrato de prestação do serviço (gestão de fila, agenda, equipe e financeiro).',
      'Cumprir obrigações legais (emissão de cobrança, prevenção à fraude em pagamentos).',
      'Legítimo interesse em segurança, prevenção de abuso e melhoria da plataforma.',
      'Consentimento quando você envia mensagem de contato ou aceita cookies essenciais.',
    ],
  },
  {
    title: '6. Compartilhamento',
    body: [
      'Dados de cada barbearia são completamente separados (multi-tenant). Não vendemos dados pessoais.',
      'Compartilhamos apenas com processadores necessários ao serviço:',
    ],
    list: [
      'Mercado Pago e AbacatePay — processamento de assinaturas e pagamentos.',
      'Google Cloud Storage — armazenamento de logos dos estabelecimentos.',
      'Evolution API — envio de notificações WhatsApp configuradas pelo salão.',
      'Provedor de hospedagem e banco de dados — infraestrutura da plataforma.',
    ],
  },
  {
    title: '7. Segurança',
    body: [
      'Dados de cada barbearia completamente separados. Autenticação por papéis (Owner, Employee, Master Admin), senhas criptografadas e assinatura validada por CPF.',
      'Conexões seguras (HTTPS). Pagamentos com cartão são tokenizados no navegador e enviados diretamente ao Mercado Pago — nunca passam pelos nossos servidores.',
    ],
  },
  {
    title: '8. Seus direitos (LGPD)',
    body: [
      'Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação ou revogação de consentimento.',
      'Para exercer seus direitos, entre em contato pelo e-mail abaixo. Responderemos em prazo razoável conforme a LGPD.',
    ],
  },
  {
    title: '9. Retenção',
    body: [
      'Mantemos os dados enquanto a conta estiver ativa ou conforme exigido por lei (obrigações fiscais e contratuais).',
      'Dados de fila e agendamentos são vinculados ao estabelecimento e gerenciados pelo dono do salão.',
      'A contagem anônima de visitas é agregada; quaisquer sinais temporários usados para deduplicar são descartados em até 24 horas e nunca viram identificador de visitante.',
    ],
  },
  {
    title: '10. Contato',
    body: [
      `Dúvidas sobre privacidade ou tratamento de dados: ${CONTACT_EMAIL}.`,
      'Seus dados só são usados para as finalidades descritas nesta política.',
    ],
  },
] as const;

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <MarketingLayout
      title="Política de Privacidade — LGPD | Agenda Já"
      description="Transparência sobre como a Agenda Já trata seus dados. Conformidade com a LGPD, dados isolados por salão e senhas criptografadas."
      path="/privacidade"
      background={
        <>
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute -left-[15%] top-[-12%] h-[50%] w-[50%] rounded-full bg-accent/25 blur-[140px]" />
      <div className="absolute -right-[10%] bottom-[-10%] h-[45%] w-[45%] rounded-full bg-teal-900/15 blur-[120px]" />
    </div>
        </>
      }
    >

      <section className="relative z-10 px-6 pb-20 pt-32 md:px-10 md:pt-40 xl:px-12">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-2xs font-black uppercase tracking-[0.2em] text-accent">
              <ShieldCheck size={24} className="h-3.5 w-3.5" />
              Privacidade e LGPD
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Política de Privacidade
            </h1>
            <p className="mt-4 text-sm font-medium text-neutral-500">
              Última atualização: novembro de 2026
            </p>
            <p className="mt-6 text-base leading-relaxed text-neutral-400">
              Transparência sobre como a Agenda Já trata seus dados — alinhado ao que prometemos na
              plataforma: cada salão é um mundo isolado e seus dados estão protegidos.
            </p>
          </motion.div>

          <div className="mt-14 space-y-10">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 * index }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
              >
                <h2 className="text-lg font-bold text-white">{section.title}</h2>
                <div className="mt-4 space-y-3">
                  {section.body.map(paragraph => (
                    <p
                      key={paragraph.slice(0, 40)}
                      className="text-sm leading-relaxed text-neutral-400"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                {'list' in section && section.list && (
                  <ul className="mt-4 space-y-2">
                    {section.list.map(item => (
                      <li
                        key={item.slice(0, 40)}
                        className="flex gap-2 text-sm leading-relaxed text-neutral-400"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.section>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              to="/contato"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-black text-black transition hover:bg-accent-light"
            >
              Falar com a gente
              <ArrowRight size={24} className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-white/10 px-6 py-3 text-sm font-bold text-neutral-300 transition hover:border-white/20 hover:text-white"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </section>

    </MarketingLayout>
  );
};

export default PrivacyPolicyPage;
