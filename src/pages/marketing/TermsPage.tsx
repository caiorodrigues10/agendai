import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';

const CONTACT_EMAIL = 'contato@agendai.com.br';

const sections = [
  {
    title: '1. Aceitação dos termos',
    body: [
      'Estes Termos e Condições de Uso regulam o acesso e a utilização da plataforma AgendAI, serviço SaaS multi-tenant para gestão de salões de beleza, barbearias e studios, com sede em Bebedouro-SP, Brasil.',
      'Ao criar uma conta, assinar um plano ou utilizar qualquer funcionalidade da plataforma, você declara que leu, entendeu e concorda com estes termos.',
    ],
  },
  {
    title: '2. Serviço e planos',
    body: [
      'O AgendAI oferece planos de assinatura mensais e anuais (Essencial e Pro). Qualquer plano começa com 30 dias de Pro completo a partir do cadastro, conforme campanha vigente.',
      'O valor do plano e a forma de cobrança são informados no momento da assinatura e podem ser alterados mediante comunicação prévia, respeitados os períodos já pagos.',
    ],
  },
  {
    title: '3. Pagamentos',
    body: [
      'Os pagamentos de assinatura são processados por provedores de pagamento (Mercado Pago, AbacatePay e Asaas). O AgendAI não armazena número completo de cartão.',
      'A não renovação do pagamento pode suspender o acesso à plataforma até a regularização ou o encerramento da assinatura.',
    ],
  },
  {
    title: '4. Cancelamento e reembolso',
    body: [
      'O cancelamento pode ser feito a qualquer momento pelo painel. O acesso permanece ativo até o fim do período já pago.',
      'Se houver período pago e não utilizado, o valor proporcional é devolvido automaticamente com multa de cancelamento de 20% sobre o valor do reembolso. Exemplo: com R$ 150,00 restantes, o reembolso é de R$ 120,00.',
      'Em caso de reembolso integral (por decisão do suporte ou do AgendAI), não há incidência de multa.',
    ],
    list: [
      'Mercado Pago e Asaas: estorno parcial real no valor proporcional com a multa aplicada.',
      'AbacatePay: devolução via PIX no valor proporcional com a multa aplicada, mediante chave informada pelo cliente.',
    ],
  },
  {
    title: '5. Trial e renovação',
    body: [
      'O período de trial dá acesso Pro completo por 30 dias a partir do cadastro, em qualquer plano (Essencial ou Pro). Após o término, a assinatura continua somente se houver pagamento válido no plano escolhido.',
      'Renovações seguem o mesmo modelo de reembolso proporcional com multa de 20% sobre o valor do reembolso.',
    ],
  },
  {
    title: '6. Obrigações do usuário',
    body: [
      'Você é responsável pela veracidade dos dados cadastrados, pela guarda das credenciais de acesso e pelo uso conforme a legislação aplicável.',
      'É vedado o uso da plataforma para fins ilícitos, fraudes, ou práticas que prejudiquem outros usuários ou a infraestrutura do serviço.',
    ],
  },
  {
    title: '7. Limitação de responsabilidade',
    body: [
      'O AgendAI envidará esforços para manter o serviço disponível e os dados seguros, mas não se responsabiliza por interrupções decorrentes de manutenção, falhas de terceiros ou casos fortuitos e de força maior.',
      'Dados de fila, agendamentos e financeiro são de responsabilidade do estabelecimento; recomendamos a guarda de backups próprios.',
    ],
  },
  {
    title: '8. Suspensão e encerramento',
    body: [
      'O AgendAI pode suspender o acesso temporariamente em caso de inadimplência, uso indevido ou violação destes termos, mediante comunicação.',
      'O encerramento definitivo pode ocorrer por decisão de qualquer das partes, respeitados os períodos já pagos e o modelo de reembolso previsto.',
    ],
  },
  {
    title: '9. Alterações destes termos',
    body: [
      'Estes termos podem ser atualizados a qualquer momento. Alterações relevantes serão comunicadas pelos canais oficiais da plataforma.',
      'A continuação do uso após a comunicação de alterações implica aceitação das novas condições.',
    ],
  },
  {
    title: '10. Contato',
    body: [
      `Dúvidas sobre estes termos ou sobre reembolsos: ${CONTACT_EMAIL}.`,
      'Ao utilizar o AgendAI, você concorda também com nossa Política de Privacidade.',
    ],
  },
] as const;

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-sans text-neutral-100 selection:bg-emerald-500/30">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-[15%] top-[-12%] h-[50%] w-[50%] rounded-full bg-emerald-900/25 blur-[140px]" />
        <div className="absolute -right-[10%] bottom-[-10%] h-[45%] w-[45%] rounded-full bg-teal-900/15 blur-[120px]" />
      </div>

      <MarketingNav />

      <section className="relative z-10 px-6 pb-20 pt-32 md:px-10 md:pt-40 xl:px-12">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
              <FileText className="h-3.5 w-3.5" />
              Termos e Condições
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Termos e Condições de Uso
            </h1>
            <p className="mt-4 text-sm font-medium text-neutral-500">
              Última atualização: agosto de 2026
            </p>
            <p className="mt-6 text-base leading-relaxed text-neutral-400">
              As regras de uso, pagamento, cancelamento e reembolso da plataforma AgendAI.
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
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
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
              to="/privacidade"
              className="group inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-black transition hover:bg-emerald-300"
            >
              Ver Política de Privacidade
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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

      <MarketingFooter />
    </div>
  );
};

export default TermsPage;
