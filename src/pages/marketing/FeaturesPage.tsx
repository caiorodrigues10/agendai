import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Calendar,
  BarChart3,
  Users,
  Bell,
  ShieldCheck,
  Smartphone,
  Wallet,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';

const features = [
  {
    icon: Clock,
    color: 'from-emerald-400 to-teal-600',
    shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    title: 'Fila Digital em Tempo Real',
    description: 'Seus clientes entram na fila pelo celular e acompanham o tempo estimado de espera ao vivo, sem precisar ficar parado no salão.'
  },
  {
    icon: Calendar,
    color: 'from-teal-400 to-cyan-500',
    shadow: 'shadow-[0_0_30px_rgba(20,184,166,0.3)]',
    title: 'Agendamento Online 24/7',
    description: 'Clientes marcam horário a qualquer momento, com disponibilidade calculada automaticamente por profissional e serviço.'
  },
  {
    icon: Wallet,
    color: 'from-emerald-400 to-cyan-600',
    shadow: 'shadow-[0_0_30px_rgba(20,184,166,0.3)]',
    title: 'Gestão Financeira Completa',
    description: 'Fluxo de caixa, comissões por profissional, despesas e fiado organizados em um único painel, sem planilhas.'
  },
  {
    icon: Users,
    color: 'from-cyan-400 to-blue-600',
    shadow: 'shadow-[0_0_30px_rgba(34,211,238,0.3)]',
    title: 'Gestão de Equipe',
    description: 'Cadastre profissionais, defina horários de trabalho e acompanhe a produtividade individual de cada um.'
  },
  {
    icon: Bell,
    color: 'from-amber-400 to-orange-500',
    shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]',
    title: 'Lembretes Automáticos',
    description: 'Notificações via WhatsApp reduzem faltas e cancelamentos de última hora, mantendo a agenda sempre cheia.'
  },
  {
    icon: BarChart3,
    color: 'from-violet-400 to-purple-600',
    shadow: 'shadow-[0_0_30px_rgba(167,139,250,0.3)]',
    title: 'Relatórios e Métricas',
    description: 'Acompanhe faturamento, ticket médio, taxa de recorrência e desempenho por serviço em gráficos claros.'
  },
  {
    icon: Smartphone,
    color: 'from-emerald-400 to-green-600',
    shadow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
    title: 'Perfil Público do Salão',
    description: 'Uma página exclusiva com serviços, horários e feed de fotos para seus clientes conhecerem o seu trabalho.'
  },
  {
    icon: ShieldCheck,
    color: 'from-teal-400 to-emerald-600',
    shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    title: 'Multi-tenant e Seguro',
    description: 'Cada estabelecimento opera isolado, com autenticação por papéis (dono, funcionário) e dados protegidos.'
  }
];

export const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-neutral-100 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/10 rounded-full blur-[120px]" />
      </div>

      <MarketingNav />

      <section className="relative pt-40 pb-20 md:pt-52 md:pb-28 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            Funcionalidades
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent"
          >
            Tudo que o seu salão precisa, num só lugar.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Do primeiro cliente na fila ao fechamento do caixa: ferramentas para salões, barbearias e studios — feminino, masculino ou unissex.
          </motion.p>
        </div>
      </section>

      <section className="py-10 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.08 }}
                whileHover={{ y: -5 }}
                className="group relative bg-neutral-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 hover:border-white/20 transition-all duration-500 flex flex-col"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 ${feature.shadow}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed font-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto bg-white text-black rounded-[3rem] md:rounded-[5rem] overflow-hidden relative">
          <div className="p-10 md:p-20 relative z-10 flex flex-col md:flex-row items-center gap-12 justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-xs font-bold mb-6">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Comece hoje
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 leading-[1.05]">
                Veja todas as funcionalidades funcionando de verdade.
              </h2>
              <p className="text-lg text-neutral-600 font-light leading-relaxed">
                30 dias grátis, sem cartão de crédito. Configure seu salão em minutos.
              </p>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <button onClick={() => navigate('/login')} className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2">
                Criar minha conta
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/queue')} className="border border-black/10 text-black px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black/5 transition-all">
                Ver demonstração
              </button>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
