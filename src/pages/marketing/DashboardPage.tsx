import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Wallet,
  Users,
  ArrowRight,
  TrendingUp,
  ClipboardList,
  Settings2,
  CheckCircle2
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';

const tabs = [
  { icon: ClipboardList, label: 'Fila & Agenda', description: 'Veja quem está esperando e quem tem horário marcado, tudo numa única tela.' },
  { icon: Wallet, label: 'Financeiro', description: 'Fluxo de caixa, comissões, despesas e fiado organizados automaticamente.' },
  { icon: Users, label: 'Equipe', description: 'Gerencie profissionais, horários de trabalho e desempenho individual.' },
  { icon: Settings2, label: 'Configurações', description: 'Serviços, horário de funcionamento e perfil público do salão.' }
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-neutral-100 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/10 rounded-full blur-[120px]" />
      </div>

      <MarketingNav />

      <section className="relative pt-40 pb-20 md:pt-52 md:pb-16 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            Dashboard
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent"
          >
            A visão completa do seu negócio, num só painel.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Fila, agenda, financeiro e equipe reunidos em uma interface rápida, pensada para o dia a dia corrido de quem gerencia um salão ou barbearia.
          </motion.p>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-20 relative max-w-5xl mx-auto px-4 sm:px-6"
        >
          <div className="relative mx-auto w-full max-w-[900px] rounded-3xl border border-white/10 bg-neutral-950 aspect-[16/9] overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.15)]">
            <div className="absolute inset-0 bg-[#0a0a0a] flex z-10 overflow-hidden">
              <div className="w-16 sm:w-48 h-full border-r border-white/5 bg-neutral-900/30 flex flex-col p-4">
                <div className="h-6 w-6 sm:w-24 bg-emerald-500/20 rounded mb-8" />
                <div className="space-y-4">
                  {[100, 75, 85, 65].map((w, i) => (
                    <div key={i} className={`h-4 rounded ${i === 0 ? 'bg-emerald-500/30' : 'bg-white/5'}`} style={{ width: `${w}%` }} />
                  ))}
                </div>
                <div className="mt-auto h-8 w-full bg-white/5 rounded" />
              </div>

              <div className="flex-1 flex flex-col p-4 sm:p-6 gap-4 sm:gap-6 bg-gradient-to-br from-neutral-900/50 to-black">
                <div className="flex justify-between items-center">
                  <div className="h-6 w-32 sm:w-48 bg-white/10 rounded" />
                  <div className="h-8 w-8 rounded-full bg-white/10" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 sm:h-24 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-4 flex flex-col justify-between">
                    <div className="h-3 w-16 bg-emerald-500/40 rounded" />
                    <div className="h-6 sm:h-8 w-24 bg-white/20 rounded" />
                  </div>
                  <div className="h-20 sm:h-24 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col justify-between">
                    <div className="h-3 w-20 bg-white/20 rounded" />
                    <div className="h-6 sm:h-8 w-16 bg-white/10 rounded" />
                  </div>
                  <div className="h-20 sm:h-24 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col justify-between">
                    <div className="h-3 w-24 bg-white/20 rounded" />
                    <div className="h-6 sm:h-8 w-20 bg-white/10 rounded" />
                  </div>
                </div>

                <div className="flex-1 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col gap-4 relative overflow-hidden">
                  <div className="h-4 w-32 bg-white/10 rounded relative z-10" />
                  <div className="flex-1 w-full flex items-end gap-2 sm:gap-4 px-2 relative z-10">
                    {[40, 70, 45, 90, 65, 85, 100, 60, 80, 50].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/40 to-emerald-400/10 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {tabs.map((tab, i) => (
            <motion.div
              key={tab.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5 }}
              className="group relative bg-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 hover:border-white/20 transition-all duration-500 flex gap-6 items-start"
            >
              <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <tab.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{tab.label}</h3>
                <p className="text-neutral-400 leading-relaxed font-light">{tab.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 border-y border-white/5 bg-neutral-950 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { icon: BarChart3, value: 'Tempo real', label: 'Atualização de métricas' },
            { icon: TrendingUp, value: '360°', label: 'Visão do faturamento' },
            { icon: Users, value: 'Ilimitado', label: 'Histórico de clientes' },
            { icon: CheckCircle2, value: 'Simples', label: 'Sem curva de aprendizado' }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <stat.icon className="w-6 h-6 text-emerald-400 mb-3 mx-auto" />
              <div className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tighter">{stat.value}</div>
              <div className="text-neutral-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">{stat.label}</div>
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
            Experimente o painel na prática.
          </motion.h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/login')} className="bg-white text-black px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Criar conta grátis
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/planos')} className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Ver planos
            </button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
