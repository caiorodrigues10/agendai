import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  User,
  MessageSquare
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';

const CONTACT_EMAIL = 'contato@agendaai.com.br';

const ContactSchema = z.object({
  name: z.string().min(2, 'Informe seu nome completo'),
  email: z.string().email('E-mail inválido'),
  subject: z.string().min(3, 'Conte brevemente o assunto'),
  message: z.string().min(10, 'Escreva uma mensagem com pelo menos 10 caracteres')
});

type ContactFormData = z.infer<typeof ContactSchema>;

const inputClass = (hasError: boolean) =>
  `w-full bg-neutral-900/60 border rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-neutral-600
   outline-none transition-all
   focus:ring-1 focus:ring-emerald-500/50
   ${hasError ? 'border-red-500/40 focus:border-red-500' : 'border-white/10 focus:border-emerald-500/50 hover:border-white/20'}`;

export const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({ resolver: zodResolver(ContactSchema) });

  const onSubmit = (data: ContactFormData) => {
    const body = `Nome: ${data.name}\nE-mail: ${data.email}\n\n${data.message}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
    reset();
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/10 rounded-full blur-[120px]" />
      </div>

      <MarketingNav />

      <section className="relative pt-40 pb-20 md:pt-52 md:pb-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            Contato
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent"
          >
            Vamos conversar sobre o seu salão.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Dúvidas sobre planos, suporte técnico ou parcerias para franquias — nossa equipe responde em até 1 dia útil.
          </motion.p>
        </div>
      </section>

      <section className="pb-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          {/* Contact info */}
          <div className="md:col-span-2 space-y-6">
            {[
              { icon: Mail, title: 'E-mail', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
              { icon: MapPin, title: 'Sede', value: 'Bebedouro, São Paulo — Brasil' },
              { icon: Clock, title: 'Atendimento', value: 'Segunda a sexta, 9h às 18h' }
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{item.title}</div>
                  {item.href ? (
                    <a href={item.href} className="text-white font-medium hover:text-emerald-400 transition-colors">{item.value}</a>
                  ) : (
                    <span className="text-white font-medium">{item.value}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-3 bg-neutral-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/10"
          >
            {sent && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400 text-sm font-medium">
                <CheckCircle2 size={18} className="shrink-0" />
                Seu cliente de e-mail foi aberto com a mensagem pronta. Basta enviar!
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Nome</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User size={16} className="text-neutral-500" />
                    </div>
                    <input id="contact-name" className={inputClass(!!errors.name)} placeholder="Seu nome" {...register('name')} />
                  </div>
                  {errors.name && (
                    <span className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.name.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-email" className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">E-mail</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail size={16} className="text-neutral-500" />
                    </div>
                    <input id="contact-email" type="email" className={inputClass(!!errors.email)} placeholder="seu@email.com" {...register('email')} />
                  </div>
                  {errors.email && (
                    <span className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.email.message}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-subject" className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Assunto</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MessageSquare size={16} className="text-neutral-500" />
                  </div>
                  <input id="contact-subject" className={inputClass(!!errors.subject)} placeholder="Sobre o que você quer falar?" {...register('subject')} />
                </div>
                {errors.subject && (
                  <span className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.subject.message}</span>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-message" className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Mensagem</label>
                <textarea
                  id="contact-message"
                  rows={5}
                  className={`w-full bg-neutral-900/60 border rounded-xl py-3 px-4 text-sm text-white placeholder:text-neutral-600 outline-none transition-all resize-none focus:ring-1 focus:ring-emerald-500/50 ${errors.message ? 'border-red-500/40 focus:border-red-500' : 'border-white/10 focus:border-emerald-500/50 hover:border-white/20'}`}
                  placeholder="Conte com detalhes o que você precisa..."
                  {...register('message')}
                />
                {errors.message && (
                  <span className="text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.message.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Enviar mensagem
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
