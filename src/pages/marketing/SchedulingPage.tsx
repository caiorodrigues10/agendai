import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Smartphone,
  Bell,
  CheckCircle2,
  ArrowRight,
  CalendarCheck,
  UserCheck,
  Repeat
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';

const highlights = [
  {
    icon: Clock,
    title: 'Disponibilidade em tempo real',
    description: 'Os horários livres são calculados na hora, considerando a agenda de cada profissional e a duração de cada serviço.'
  },
  {
    icon: Smartphone,
    title: 'Marcação pelo celular',
    description: 'O cliente escolhe o serviço, o profissional e o horário direto do navegador, sem precisar instalar nada.'
  },
  {
    icon: Bell,
    title: 'Lembretes automáticos',
    description: 'Notificações antes do horário marcado reduzem faltas e mantêm sua agenda previsível.'
  },
  {
    icon: Repeat,
    title: 'Check-in direto na fila',
    description: 'Cliente com agendamento pode entrar na fila do dia com um toque, sem duplicar cadastro.'
  }
];

export const SchedulingPage: React.FC = () => {
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
            Agendamento
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent"
          >
            Sua agenda sempre cheia, sem telefone tocando.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Clientes marcam horário 24 horas por dia, você acompanha tudo em um calendário único, organizado por profissional.
          </motion.p>
        </div>

        {/* Mini calendar mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-20 max-w-4xl mx-auto px-4"
        >
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-[0_0_60px_rgba(16,185,129,0.1)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-bold tracking-tight">Quinta-feira, 09 de julho</span>
              </div>
              <span className="text-emerald-400 text-xs font-black bg-emerald-500/10 px-3 py-1.5 rounded-full tracking-widest uppercase">6 vagas livres</span>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
              {['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00'].map((time, i) => {
                const busy = [1, 4].includes(i);
                return (
                  <div
                    key={time}
                    className={`rounded-xl py-3 text-center text-xs font-bold tracking-wide border transition-all ${
                      busy
                        ? 'bg-white/5 border-white/5 text-neutral-600 line-through'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {time}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5 }}
              className="group relative bg-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 hover:border-white/20 transition-all duration-500 flex gap-6 items-start"
            >
              <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                <item.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{item.title}</h3>
                <p className="text-neutral-400 leading-relaxed font-light">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 relative z-10 border-y border-white/5 bg-neutral-950">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            { icon: UserCheck, value: '-40%', label: 'Faltas com lembretes ativos' },
            { icon: Calendar, value: '24/7', label: 'Marcação sem depender do telefone' },
            { icon: CheckCircle2, value: '100%', label: 'Sincronizado com a fila do dia' }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <stat.icon className="w-8 h-8 text-emerald-400 mb-4" />
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter">{stat.value}</div>
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
            Chega de agenda de papel.
          </motion.h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/login')} className="bg-white text-black px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Começar agora
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
