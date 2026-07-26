import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target,
  Heart,
  Zap,
  ShieldCheck,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';

const values = [
  {
    icon: Target,
    title: 'Foco no que importa',
    description: 'Construímos apenas o que resolve problemas reais do dia a dia de um salão — sem inchar o produto com recursos que ninguém usa.'
  },
  {
    icon: Heart,
    title: 'Feito para quem trabalha em pé',
    description: 'Cada tela é pensada para ser usada em segundos, entre um atendimento e outro, sem tirar o foco do cliente.'
  },
  {
    icon: Zap,
    title: 'Evolução constante',
    description: 'Lançamos melhorias continuamente a partir do que donos e donas de salão nos pedem.'
  },
  {
    icon: ShieldCheck,
    title: 'Confiança em primeiro lugar',
    description: 'Dados isolados por estabelecimento, pagamentos processados por parceiros homologados e suporte de verdade.'
  }
];

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-neutral-100 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/10 rounded-full blur-[120px]" />
      </div>

      <MarketingNav />

      <section className="relative pt-40 pb-20 md:pt-52 md:pb-28 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            Sobre Nós
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent"
          >
            Tecnologia simples para quem faz a diferença todo dia.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            O AGENDAI nasceu para resolver um problema simples: filas desorganizadas e agendas bagunçadas custam tempo e dinheiro — em salões de beleza, barbearias e studios. Construímos a ferramenta que gostaríamos que existisse.
          </motion.p>
        </div>
      </section>

      <section className="py-10 px-6 relative z-10">
        <div className="max-w-7xl mx-auto bg-white text-black rounded-[3rem] md:rounded-[5rem] overflow-hidden relative">
          <div className="p-10 md:p-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 leading-[1.05]">
                Nossa missão
              </h2>
              <p className="text-lg text-neutral-600 font-light leading-relaxed mb-6">
                Dar a donos e donas de salão o mesmo nível de gestão que grandes redes têm acesso — sem complicação, sem planilhas e sem depender de telefone tocando o dia inteiro.
              </p>
              <p className="text-lg text-neutral-600 font-light leading-relaxed">
                Acreditamos que quem cuida do visual das pessoas merece uma ferramenta que cuida do seu negócio com o mesmo cuidado.
              </p>
            </div>
            <div className="flex items-center gap-3 justify-start md:justify-end text-neutral-500">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Sede em Bebedouro, São Paulo</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 max-w-2xl"
          >
            <h2 className="text-white text-4xl md:text-6xl font-black tracking-tighter mb-6">O que nos guia.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -5 }}
                className="group relative bg-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 hover:border-white/20 transition-all duration-500 flex gap-6 items-start"
              >
                <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <value.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{value.title}</h3>
                  <p className="text-neutral-400 leading-relaxed font-light">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-y border-white/5 bg-neutral-950 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { value: "+500", label: "Estabelecimentos" },
            { value: "+10k", label: "Atendimentos/Mês" },
            { value: "99.9%", label: "Uptime" },
            { value: "4.9/5", label: "Avaliação" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl font-bold text-white mb-3 tracking-tighter">{stat.value}</div>
              <div className="text-neutral-500 text-xs font-bold uppercase tracking-[0.2em]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-32 px-6 relative z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-8"
          >
            Vamos crescer juntos?
          </motion.h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/login')} className="bg-white text-black px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Começar agora
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/contato')} className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Falar com a gente
            </button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
