import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';

import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight, 
  Scissors,
  Zap,
  MousePointer2,
  Instagram,
  Twitter,
  Linkedin,
  Mail
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <div className="min-h-screen bg-black text-neutral-100 selection:bg-cyan-500/30 font-sans overflow-x-hidden scroll-smooth">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl border-b border-white/5 px-6 py-4 bg-black/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <Logo className="w-8 h-8 text-white" />
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-neutral-400">
            <a href="#recursos" onClick={(e) => scrollToSection(e, 'recursos')} className="transition-colors hover:text-white relative group cursor-pointer">
              Recursos
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="#tecnologia" onClick={(e) => scrollToSection(e, 'tecnologia')} className="transition-colors hover:text-white relative group cursor-pointer">
              Tecnologia
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="#precos" onClick={(e) => scrollToSection(e, 'precos')} className="transition-colors hover:text-white relative group cursor-pointer">
              Preços
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-cyan-500 transition-all group-hover:w-full"></span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="hidden md:block text-xs font-bold uppercase tracking-tight text-neutral-400 hover:text-white transition-colors">Acessar Painel</button>
            <button className="bg-white text-black px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-56 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">

          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 pt-4 pb-8 pr-4 leading-tight bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent inline-block"
          >
            O futuro é <br />agora. E é Pro.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            Esqueça as filas. Esqueça o caos. Bem-vindo à era da gestão inteligente de barbearias, potencializada por Inteligência Artificial.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]">
              Descubra o Pro
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto bg-transparent border border-white/20 text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Ver Demonstração
            </button>
          </motion.div>
        </div>

        {/* MacBook Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="mt-24 relative max-w-5xl mx-auto px-4 sm:px-6"
        >
          {/* Screen Bezel */}
          <div className="relative mx-auto w-full max-w-[900px] rounded-t-3xl border-[12px] border-neutral-900 bg-neutral-950 aspect-[16/10] sm:aspect-[16/9] overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
            {/* Camera Notch */}
            <div className="absolute top-0 left-0 right-0 mx-auto w-24 sm:w-32 h-4 sm:h-5 bg-neutral-900 rounded-b-xl z-20 flex items-start justify-center pt-0.5 sm:pt-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-neutral-800 border border-neutral-700/50" />
            </div>
            
            {/* Screen Content - Dashboard UI */}
            <div className="absolute inset-0 bg-[#0a0a0a] flex z-10 overflow-hidden">
              {/* Sidebar */}
              <div className="w-16 sm:w-48 h-full border-r border-white/5 bg-neutral-900/30 flex flex-col p-4">
                <div className="h-6 w-6 sm:w-24 bg-cyan-500/20 rounded mb-8" />
                <div className="space-y-4">
                  <div className="h-4 w-full bg-white/10 rounded" />
                  <div className="h-4 w-3/4 bg-white/5 rounded" />
                  <div className="h-4 w-5/6 bg-white/5 rounded" />
                  <div className="h-4 w-4/5 bg-white/5 rounded" />
                </div>
                <div className="mt-auto h-8 w-full bg-white/5 rounded" />
              </div>
              
              {/* Main Content */}
              <div className="flex-1 flex flex-col p-4 sm:p-6 gap-4 sm:gap-6 bg-gradient-to-br from-neutral-900/50 to-black">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div className="h-6 w-32 sm:w-48 bg-white/10 rounded" />
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10" />
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 sm:h-24 rounded-xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 p-4 flex flex-col justify-between">
                    <div className="h-3 w-16 bg-cyan-500/40 rounded" />
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
                
                {/* Main Chart Area */}
                <div className="flex-1 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
                  <div className="h-4 w-32 bg-white/10 rounded relative z-10" />
                  <div className="flex-1 w-full flex items-end gap-2 sm:gap-4 px-2 relative z-10">
                    {[40, 70, 45, 90, 65, 85, 100, 60, 80, 50].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/40 to-cyan-400/10 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* MacBook Base */}
          <div className="relative mx-auto w-full max-w-[1050px] h-3 sm:h-5 bg-neutral-800 rounded-b-2xl sm:rounded-b-3xl rounded-t-sm flex justify-center shadow-2xl">
            <div className="w-24 sm:w-32 h-1.5 sm:h-2 bg-neutral-700 rounded-b-xl" />
            <div className="absolute top-0 inset-x-0 h-[1px] bg-neutral-600/50" />
            <div className="absolute bottom-0 inset-x-4 h-[1px] bg-black/50 blur-[1px]" />
          </div>
        </motion.div>
      </section>

      {/* Social Proof Marquee */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02] overflow-hidden flex relative z-10">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
        
        <motion.div 
          animate={{ x: [0, -1035] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="flex gap-20 items-center whitespace-nowrap px-10"
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-20 items-center">
              <span className="text-xl font-black text-neutral-600 uppercase tracking-widest">Barba Nostra</span>
              <span className="text-xl font-black text-neutral-600 uppercase tracking-widest">Cavalheiros</span>
              <span className="text-xl font-black text-neutral-600 uppercase tracking-widest">The Barber</span>
              <span className="text-xl font-black text-neutral-600 uppercase tracking-widest">Don Corleone</span>
              <span className="text-xl font-black text-neutral-600 uppercase tracking-widest">Navalha de Ouro</span>
              <span className="text-xl font-black text-neutral-600 uppercase tracking-widest">Sr. Mustache</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Bento Grid */}
      <section id="recursos" className="py-32 px-6 relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 max-w-2xl"
          >
            <h2 className="text-white text-5xl md:text-7xl font-black tracking-tighter mb-6">O poder do seu lado.</h2>
            <p className="text-xl text-neutral-400 font-light leading-relaxed">
              Desenvolvemos ferramentas que resolvem os problemas reais do dia a dia de uma barbearia com <span className="text-white font-medium">elegância</span> e <span className="text-white font-medium">precisão</span>.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-6">
            {/* Big Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="md:col-span-3 md:row-span-2 group relative bg-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">Tempo real</span>
                </div>
                <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">Fila Digital 3.0</h3>
                <p className="text-neutral-400 text-lg leading-relaxed max-w-md font-light">
                  Seus clientes acompanham o tempo real de espera direto do celular. Menos gente acumulada, mais conforto para todos.
                </p>
              </div>

              <div className="mt-12 -mb-20 transform transition-transform duration-700 relative z-10">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold tracking-tight">Próximo da fila</span>
                    <span className="text-cyan-400 text-xs font-black bg-cyan-500/10 px-3 py-1.5 rounded-full tracking-widest uppercase">Em 5 min</span>
                  </div>
                  <div className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      JD
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-base font-bold">João do Corte</div>
                      <div className="text-neutral-400 text-xs uppercase tracking-widest mt-1">Degradê Navalhado</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Small Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="md:col-span-3 group relative bg-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 hover:border-white/20 transition-all duration-500 flex flex-col md:flex-row gap-8 items-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex-1 relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-[0_0_30px_rgba(96,165,250,0.3)]">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Agenda Online</h3>
                <p className="text-neutral-400 font-light text-lg">
                  Agendamentos 24/7 sem interrupções por telefone.
                </p>
              </div>
              <div className="w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center relative transition-transform duration-700 z-10">
                <Calendar className="w-12 h-12 text-blue-400 z-10" />
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
              </div>
            </motion.div>

            {/* Small Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="md:col-span-3 group relative bg-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 hover:border-white/20 transition-all duration-500 flex flex-col md:flex-row gap-8 items-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex-1 relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-[0_0_30px_rgba(192,132,252,0.3)]">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Gestão Financeira</h3>
                <p className="text-neutral-400 font-light text-lg">
                  Fluxo de caixa, comissões e faturamento em um só lugar.
                </p>
              </div>
              <div className="w-32 h-32 bg-purple-500/10 rounded-full flex items-center justify-center relative transition-transform duration-700 z-10">
                <BarChart3 className="w-12 h-12 text-purple-400 z-10" />
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech / AI Section */}
      <section id="tecnologia" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto bg-white text-black rounded-[3rem] md:rounded-[5rem] overflow-hidden relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyan-500 via-transparent to-transparent rotate-[80deg]" />
            </div>
            
            <div className="p-10 md:p-24 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                <div>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-xs font-bold mb-8"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    PROPRIETARY ENGINE
                  </motion.div>
                  <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1]">
                    IA que realmente <br /> entende você.
                  </h2>
                  <p className="text-xl text-neutral-600 leading-relaxed mb-10 font-light">
                    Analisamos padrões de comportamento para prever cancelamentos e sugerir horários para seus clientes mais fiéis, aumentando sua receita em até 30%.
                  </p>
                  
                  <ul className="space-y-6">
                    <motion.li 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="mt-1 p-1 bg-black rounded-full text-white">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <span className="font-bold text-xl block tracking-tight">Previsão de Espera</span>
                        <span className="text-neutral-500 font-light">Cálculo preciso baseado no ritmo real de cada profissional.</span>
                      </div>
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="mt-1 p-1 bg-black rounded-full text-white">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <span className="font-bold text-xl block tracking-tight">Reengajamento Automático</span>
                        <span className="text-neutral-500 font-light">Lembretes enviados no momento exato da necessidade do cliente.</span>
                      </div>
                    </motion.li>
                  </ul>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <div className="bg-white rounded-[3rem] p-10 border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] aspect-square flex flex-col gap-8 overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">Traffic Source</div>
                        <div className="text-4xl font-bold tracking-tighter text-black">231,856</div>
                        <div className="text-neutral-500 text-xs font-medium">
                          Sessions
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-cyan-500" />
                          <span className="text-[10px] text-neutral-500 font-bold uppercase">Organic</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-900" />
                          <span className="text-[10px] text-neutral-500 font-bold uppercase">Paid Ads</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 relative mt-4">
                      <div className="absolute inset-0 flex flex-col justify-between py-2">
                        {[1,2,3,4,5].map(i => <div key={i} className="w-full h-px bg-black/5" />)}
                      </div>
                      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 400 200">
                        <path d="M 0 180 L 40 140 L 80 160 L 120 120 L 160 150 L 200 130 L 240 140 L 280 170 L 320 120 L 360 80 L 400 130" fill="none" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                          d="M 0 170 L 40 100 L 80 150 L 120 110 L 160 100 L 200 160 L 240 80 L 280 80 L 320 60 L 360 40 L 400 100" fill="none" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                          d="M 0 170 L 40 100 L 80 150 L 120 110 L 160 100 L 200 160 L 240 80 L 280 80 L 320 60 L 360 40 L 400 100" fill="none" stroke="#06b6d4" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className="blur-xl opacity-20" />
                      </svg>
                      <div className="absolute bottom-[-24px] w-full flex justify-between text-[8px] font-bold text-neutral-600 uppercase tracking-tighter">
                        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <span key={m}>{m}</span>)}
                      </div>
                    </div>
                    
                    <button className="mt-4 bg-black text-white w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 hover:bg-neutral-900">
                      Gerar Relatório Completo
                      <BarChart3 className="w-4 h-4 text-cyan-500" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 border-y border-white/5 bg-neutral-950 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { value: "+500", label: "Barbearias" },
            { value: "+10k", label: "Cortes/Mês" },
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
              <div className="text-5xl md:text-7xl font-bold text-white mb-3 tracking-tighter">{stat.value}</div>
              <div className="text-neutral-500 text-xs font-bold uppercase tracking-[0.2em]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-40 px-6 relative overflow-hidden bg-[#050505]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
            >
              Pricing Plans
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6"
            >
              Justo. Transparente.<br />
              <span className="inline-block pt-2 pb-6 pr-4" style={{ backgroundImage: "linear-gradient(to right, #22d3ee, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>Sem pegadinhas.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Escolha o plano ideal para o momento da sua barbearia. <br className="hidden md:block" />
              Cancele ou altere quando quiser.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Card 1: Barber Solo Mensal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative flex flex-col p-10 transition-all duration-500 bg-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] z-10 border border-white/10 hover:border-white/20 hover:bg-neutral-900/60"
            >
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="inline-block px-4 py-1.5 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10">Essential</span>
                  <span className="text-neutral-500 font-bold text-[10px] uppercase tracking-widest">Plano Mensal</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Barber Solo</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-xl font-bold text-neutral-400">R$</span>
                  <span className="text-6xl font-black text-white tracking-tighter">49</span>
                  <span className="text-neutral-500 text-sm font-medium">/mês</span>
                </div>
                <p className="text-cyan-400 text-sm font-medium">Paga em 1 cliente a mais por mês</p>
              </div>
              
              <div className="space-y-6 mb-12 flex-1">
                {[
                  '1 Profissional incluído',
                  'Fila digital e agendamento 24h',
                  'Controle financeiro',
                  'Lembretes automáticos (anti-falta)',
                  'Suporte 24h'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 text-sm font-light text-neutral-300 leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-neutral-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 rounded-2xl font-bold text-xs tracking-widest transition-all bg-white/5 border border-white/10 text-white hover:bg-white/10">
                ASSINAR AGORA
              </button>
            </motion.div>

            {/* Card 2: Barber Solo Anual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative flex flex-col p-10 transition-all duration-500 bg-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] z-10 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.05)] hover:border-green-500/50 hover:shadow-[0_0_40px_rgba(34,197,94,0.1)] hover:bg-neutral-900/60"
            >
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="inline-block px-4 py-1.5 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10">Essential</span>
                  <span className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <Zap className="w-3 h-3" /> Plano Anual
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Barber Solo</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-bold text-green-400">R$</span>
                  <span className="text-6xl font-black text-white tracking-tighter">39</span>
                  <span className="text-neutral-500 text-sm font-medium">/mês</span>
                </div>
                <p className="text-neutral-400 text-xs font-medium mb-4">Cobrado R$ 468 anualmente</p>
                <div className="inline-block px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-xs font-bold">Economia de R$ 120 no ano (20% OFF)</p>
                </div>
              </div>
              
              <div className="space-y-6 mb-12 flex-1">
                {[
                  '1 Profissional incluído',
                  'Fila digital e agendamento 24h',
                  'Controle financeiro',
                  'Lembretes automáticos (anti-falta)',
                  'Suporte 24h'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 text-sm font-light text-neutral-300 leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-neutral-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 rounded-2xl font-bold text-xs tracking-widest transition-all bg-white/5 border border-white/10 text-white hover:bg-white/10">
                ASSINAR AGORA
              </button>
            </motion.div>

            {/* Card 3: Barber Pro Mensal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative flex flex-col p-10 transition-all duration-500 bg-gradient-to-b from-neutral-900/80 to-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] z-20 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.1)] hover:shadow-[0_0_60px_rgba(6,182,212,0.2)] hover:border-cyan-500/50 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="mb-8 relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="inline-block px-4 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-widest rounded-full">Mais popular</span>
                  <span className="text-cyan-400/50 font-bold text-[10px] uppercase tracking-widest">Plano Mensal</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Barber Pro</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-xl font-bold text-cyan-400">R$</span>
                  <span className="text-6xl font-black text-white tracking-tighter">99</span>
                  <span className="text-neutral-500 text-sm font-medium">/mês</span>
                </div>
                <p className="text-cyan-400 text-sm font-medium">Retorno de até R$ 1.400/mês</p>
              </div>
              
              <div className="space-y-6 mb-12 flex-1 relative z-10">
                <div className="flex items-start gap-4 text-sm font-bold text-white leading-relaxed uppercase tracking-wider">
                  <span>Tudo do Solo, mais:</span>
                </div>
                <div className="flex items-start gap-4 text-sm font-light text-neutral-200 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>5 Profissionais incluídos</span>
                </div>
                <div className="flex items-start gap-4 text-sm font-light text-neutral-200 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Agendamento + Fila integrados</span>
                </div>
                <div className="flex items-start gap-4 text-sm font-light text-neutral-200 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Comissões automáticas por barbeiro</span>
                </div>
                <div className="flex items-start gap-4 text-sm font-light text-neutral-200 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Reports semanais</span>
                </div>
                <div className="flex items-start gap-4 text-sm font-light text-neutral-200 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span className="flex items-center gap-2">
                    Predict
                    <span className="inline-block px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold rounded uppercase tracking-wider">IA</span>
                  </span>
                </div>
              </div>
              <button className="w-full py-4 rounded-2xl font-bold text-xs tracking-widest transition-all bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] relative z-10">
                ASSINAR AGORA
              </button>
            </motion.div>

            {/* Card 4: Barber Pro Anual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative flex flex-col p-10 transition-all duration-500 bg-gradient-to-b from-neutral-900/80 to-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] z-20 border border-cyan-400/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] hover:shadow-[0_0_80px_rgba(6,182,212,0.3)] hover:border-cyan-400/70 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="mb-8 relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="inline-block px-4 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-widest rounded-full">Mais popular</span>
                  <span className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <Zap className="w-3 h-3" /> Plano Anual
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Barber Pro</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-bold text-cyan-400">R$</span>
                  <span className="text-6xl font-black text-white tracking-tighter">79</span>
                  <span className="text-neutral-500 text-sm font-medium">/mês</span>
                </div>
                <p className="text-neutral-400 text-xs font-medium mb-4">Cobrado R$ 888 anualmente</p>
                <div className="inline-block px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-xs font-bold">Economia de R$ 240 no ano (25% OFF)</p>
                </div>
              </div>
              
              <div className="space-y-6 mb-12 flex-1 relative z-10">
                <div className="flex items-start gap-4 text-sm font-bold text-white leading-relaxed uppercase tracking-wider">
                  <span>Tudo do Solo, mais:</span>
                </div>
                <div className="flex items-start gap-4 text-sm font-light text-neutral-200 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>5 Profissionais incluídos</span>
                </div>
                <div className="flex items-start gap-4 text-sm font-light text-neutral-200 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Agendamento + Fila integrados</span>
                </div>
                <div className="flex items-start gap-4 text-sm font-light text-neutral-200 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Comissões automáticas por barbeiro</span>
                </div>
                <div className="flex items-start gap-4 text-sm font-light text-neutral-200 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>Reports semanais</span>
                </div>
                <div className="flex items-start gap-4 text-sm font-light text-neutral-200 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span className="flex items-center gap-2">
                    Predict
                    <span className="inline-block px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold rounded uppercase tracking-wider">IA</span>
                  </span>
                </div>
              </div>
              <button className="w-full py-4 rounded-2xl font-bold text-xs tracking-widest transition-all bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] relative z-10">
                ASSINAR AGORA
              </button>
            </motion.div>
          </div>
          
          {/* CTA Section inside Pricing */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 relative p-12 md:p-16 rounded-[3rem] bg-gradient-to-br from-neutral-900/80 to-neutral-900/30 border border-white/10 backdrop-blur-xl text-center overflow-hidden group hover:border-white/20 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 bg-white/5 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-8 border border-white/10">Enterprise</span>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Precisa de algo sob medida?</h3>
              <p className="text-neutral-400 mb-10 max-w-2xl mx-auto font-light text-lg leading-relaxed">
                Temos soluções personalizadas para grandes franquias e redes com mais de 20 unidades. Integrações exclusivas, gerente de conta dedicado e IA treinada com seus dados.
              </p>
              <button className="bg-white text-black px-8 py-4 rounded-2xl font-bold text-xs tracking-widest transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3 mx-auto">
                FALAR COM UM ESPECIALISTA
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-40 px-6 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/10 to-transparent" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8"
          >
            Pronto para o <span className="inline-block pt-2 pb-6 pr-4" style={{ backgroundImage: "linear-gradient(to right, #22d3ee, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>futuro?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto font-light"
          >
            Junte-se às barbearias de elite que já estão usando o BarberQueue Pro AI para transformar a experiência dos seus clientes.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button className="bg-white text-black px-12 py-6 rounded-full text-lg font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] flex items-center justify-center gap-4 mx-auto">
              Começar Teste Grátis
              <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#050505] pt-32 pb-10 px-6 border-t border-white/10 z-10 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
            {/* Brand & Newsletter */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-2 mb-8">
                <Logo className="w-8 h-8 text-white" />
              </div>
              <p className="text-neutral-400 text-lg max-w-sm leading-relaxed mb-10 font-light">
                No talento e na disciplina, o sistema definitivo para elevar sua barbearia ao próximo nível.
              </p>
              
              {/* Newsletter */}
              <div className="mb-10">
                <h5 className="text-white font-bold mb-4 uppercase text-[10px] tracking-[0.2em]">Assine nossa Newsletter</h5>
                <div className="flex items-center gap-2 max-w-sm">
                  <div className="relative flex-1 flex items-center">
                    <Mail className="absolute left-4 w-4 h-4 text-neutral-500 z-10" />
                    <input 
                      type="email" 
                      placeholder="Seu melhor e-mail" 
                      className="w-full bg-neutral-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                  </div>
                  <button className="bg-white text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-neutral-200 transition-colors">
                    Assinar
                  </button>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-4">
                {[
                  { icon: Instagram, href: '#' },
                  { icon: Twitter, href: '#' },
                  { icon: Linkedin, href: '#' }
                ].map((social, i) => (
                  <a key={i} href={social.href} className="w-10 h-10 bg-neutral-900/50 rounded-full flex items-center justify-center text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800 transition-all border border-white/5 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Links Grid */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div>
                <h5 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">Plataforma</h5>
                <ul className="space-y-5 text-sm text-neutral-400 font-light">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-2">Funcionalidades</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-2">IA Preditiva <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[8px] font-bold uppercase tracking-wider">Novo</span></a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-2">Agendamento</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-2">Dashboard</a></li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">Empresa</h5>
                <ul className="space-y-5 text-sm text-neutral-400 font-light">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Sobre Nós</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Carreiras</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Contato</a></li>
                </ul>
              </div>

              <div>
                <h5 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">Legal</h5>
                <ul className="space-y-5 text-sm text-neutral-400 font-light">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacidade</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Termos de Uso</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Segurança</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-neutral-500 font-light">
            <p>© {new Date().getFullYear()} BarberQueue Pro. Todos os direitos reservados.</p>
            <div className="flex gap-6 mt-6 md:mt-0 items-center">
              <span className="hover:text-white transition-colors cursor-pointer">Sede: Bebedouro-SP</span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Sistemas Operacionais</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
