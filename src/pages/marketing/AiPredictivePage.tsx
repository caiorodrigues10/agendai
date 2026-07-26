import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Gauge,
  MessageCircleWarning,
  LineChart,
  Bot
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';

const capabilities = [
  {
    icon: Gauge,
    title: 'Previsão de Espera',
    description: 'Cálculo dinâmico do tempo de fila baseado no ritmo real de cada profissional e no serviço escolhido, atualizado a cada movimentação.'
  },
  {
    icon: MessageCircleWarning,
    title: 'Alerta de Cancelamento',
    description: 'Identifica padrões de comportamento que costumam anteceder um "não comparecimento" e avisa a equipe para agir antes.'
  },
  {
    icon: Bot,
    title: 'Reengajamento Automático',
    description: 'Lembretes disparados no momento exato em que o cliente mais precisa, reduzindo faltas e mantendo a agenda cheia.'
  },
  {
    icon: LineChart,
    title: 'Insights de Faturamento',
    description: 'Relatórios que apontam os serviços mais lucrativos e os horários de pico, para você ajustar preços e escala da equipe.'
  }
];

export const AiPredictivePage: React.FC = () => {
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            IA Preditiva
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-bold uppercase tracking-wider">Novo</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent"
          >
            Inteligência que trabalha antes de você perceber o problema.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Disponível no plano Pro: analisamos o comportamento da sua fila e agenda para prever gargalos, evitar faltas e sugerir os melhores horários.
          </motion.p>
        </div>
      </section>

      <section className="py-10 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5 }}
              className="group relative bg-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 hover:border-emerald-500/30 transition-all duration-500 flex gap-6 items-start"
            >
              <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <cap.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{cap.title}</h3>
                <p className="text-neutral-400 leading-relaxed font-light">{cap.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto bg-white text-black rounded-[3rem] md:rounded-[5rem] overflow-hidden relative">
          <div className="p-10 md:p-24 relative z-10">
            <div className="max-w-2xl mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-xs font-bold mb-8">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Como funciona
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 leading-[1.05]">
                Sem configuração complicada.
              </h2>
              <p className="text-lg text-neutral-600 font-light leading-relaxed">
                A IA Preditiva já vem ativa nos salões do plano Pro. Ela aprende com o histórico de fila, agenda e atendimentos — quanto mais você usa, mais precisa fica.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { step: '01', title: 'Você opera normalmente', text: 'Fila, agendamentos e financeiro seguem funcionando como sempre.' },
                { step: '02', title: 'Os dados alimentam o modelo', text: 'Cada atendimento concluído refina as previsões do seu salão.' },
                { step: '03', title: 'Você recebe os insights', text: 'Alertas e recomendações aparecem direto no seu painel, sem esforço extra.' }
              ].map((item) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="text-5xl font-black text-emerald-500/30 tracking-tighter">{item.step}</span>
                  <h3 className="text-xl font-bold mt-4 mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-neutral-600 font-light leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-8"
          >
            Disponível no plano <span className="text-emerald-400">Pro</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg text-neutral-400 mb-10 max-w-xl mx-auto font-light"
          >
            Faça upgrade a qualquer momento direto do seu painel, sem burocracia.
          </motion.p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/planos')} className="bg-emerald-500 text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              Ver planos
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/queue')} className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Ver demonstração
            </button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
