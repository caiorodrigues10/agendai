import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { trialCampaign } from '../../marketing/trialCampaign';

const friendships = [
  {
    who: 'Rafa → Leo',
    years: '4 anos na mesma cadeira',
    line: '“Sempre o Leo. Se ele estiver de folga, eu volto outro dia.”',
    detail: 'Não é só degradê. É a conversa de sábado, o futebol, o “e aí, como tá a família?”.',
    tone: 'emerald' as const,
  },
  {
    who: 'Ana → Marina',
    years: 'Desde o primeiro corte pós-parto',
    line: '“Ela sabe o que eu quero sem eu explicar.”',
    detail:
      'Confiança que vira ritual. A agenda existe para proteger esse horário — não para atrapalhar.',
    tone: 'cyan' as const,
  },
  {
    who: 'Paulo → Carlos',
    years: 'Cliente fiado, amigo de verdade',
    line: '“Deixa pra próxima. Eu sei que você vem.”',
    detail:
      'Relação de salão também é crédito, memória e respeito. O sistema só anota o que o caderno já carregava.',
    tone: 'amber' as const,
  },
];

const beats = [
  {
    n: '01',
    title: 'O telefone não para',
    copy: '“Tem horário amanhã?” no WhatsApp, enquanto alguém espera na cadeira. A conversa com o cliente da vez fica pela metade.',
  },
  {
    n: '02',
    title: 'O amigo some da lista',
    copy: 'Horário marcado no caderno, lembrete nenhum. A cadeira fica vazia. A amizade continua — o faturamento, não.',
  },
  {
    n: '03',
    title: 'A equipe se perde',
    copy: 'Quem atende quem, quem está livre, quem já passou do ponto. O salão vira ruído. O vínculo cliente–profissional paga o preço.',
  },
];

const beliefs = [
  {
    title: 'A relação vem primeiro',
    copy: 'Software bom some na hora do corte. O que importa é o profissional e a pessoa na cadeira.',
  },
  {
    title: 'Organização é respeito',
    copy: 'Fila clara, horário certo e lembrete no ponto são formas de cuidar de quem confia no salão.',
  },
  {
    title: 'Dono também merece paz',
    copy: 'Quem constrói o espaço precisa ver o movimento sem virar escravo do celular.',
  },
];

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-sans text-neutral-100 selection:bg-emerald-500/30">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-[18%] top-[-14%] h-[55%] w-[55%] rounded-full bg-emerald-900/28 blur-[150px]" />
        <div className="absolute -right-[12%] top-[30%] h-[40%] w-[40%] rounded-full bg-teal-900/18 blur-[130px]" />
        <div className="absolute bottom-[-20%] left-[30%] h-[45%] w-[50%] rounded-full bg-amber-950/20 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse at top, black, transparent 72%)',
          }}
        />
      </div>

      <MarketingNav />

      {/* Hero — brand + one truth */}
      <section className="relative z-10 px-6 pb-20 pt-36 md:px-10 md:pb-28 md:pt-44 xl:px-12">
        <div className="mx-auto max-w-375">
          <div className="grid items-end gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90"
              >
                Sobre o AgendAI
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="mt-5 text-5xl font-black tracking-[-0.055em] text-white md:text-7xl xl:text-[5.5rem] xl:leading-[0.95]"
              >
                O corte muda.
                <br />
                <span className="text-emerald-400">A conversa fica.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-neutral-400 md:text-xl"
              >
                Em todo salão e barbearia do Brasil existe uma verdade quieta: o cliente não volta
                só pelo serviço. Volta pela pessoa. O AgendAI nasceu para proteger essa relação —
                tirando o caos do caminho.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="relative overflow-hidden rounded-4xl border border-white/10 bg-[#0d110e] p-7 md:p-8"
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/12 blur-[60px]" />
              <p className="relative z-10 text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">
                A grande verdade
              </p>
              <p className="relative z-10 mt-5 text-2xl font-black leading-snug tracking-tight text-white md:text-3xl">
                “Meu barbeiro” não é um serviço.
                <br />
                <span className="text-emerald-300">É um vínculo.</span>
              </p>
              <p className="relative z-10 mt-5 text-base font-medium leading-relaxed text-neutral-400">
                Preferência de profissional, horário de sempre, conversa que só os dois entendem.
                Tecnologia boa não compete com isso — ela segura a porta aberta.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Manifesto band */}
      <section className="relative z-10 border-y border-white/8 bg-white/[0.02] px-6 py-16 md:px-10 md:py-20 xl:px-12">
        <div className="mx-auto max-w-375">
          <motion.blockquote
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl"
          >
            <p className="text-3xl font-black leading-[1.15] tracking-tight text-white md:text-5xl md:leading-[1.1]">
              A gente não quer transformar o salão num call center.
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
                {' '}
                Quer devolver tempo para o que importa:{' '}
              </span>
              <span className="text-white">
                olhar no olho, fazer o serviço certo e manter a amizade que sustenta o negócio.
              </span>
            </p>
          </motion.blockquote>
        </div>
      </section>

      {/* Friendships */}
      <section className="relative z-10 px-6 py-24 md:px-10 md:py-32 xl:px-12">
        <div className="mx-auto max-w-375">
          <div className="mb-14 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">
              Amizades de cadeira
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
              Histórias que o sistema não inventa — só protege.
            </h2>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-neutral-400">
              Todo estabelecimento tem essas duplas. São elas que enchem a agenda, indicam o amigo e
              voltam mesmo quando abre um concorrente na esquina.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {friendships.map((item, i) => {
              const border =
                item.tone === 'emerald'
                  ? 'border-emerald-400/25 hover:border-emerald-400/45'
                  : item.tone === 'cyan'
                    ? 'border-cyan-400/25 hover:border-cyan-400/45'
                    : 'border-amber-300/25 hover:border-amber-300/45';
              const accent =
                item.tone === 'emerald'
                  ? 'text-emerald-300'
                  : item.tone === 'cyan'
                    ? 'text-cyan-300'
                    : 'text-amber-200';
              const glow =
                item.tone === 'emerald'
                  ? 'bg-emerald-400/10'
                  : item.tone === 'cyan'
                    ? 'bg-cyan-400/10'
                    : 'bg-amber-300/10';

              return (
                <motion.article
                  key={item.who}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className={`group relative overflow-hidden rounded-4xl border bg-[#0a0f0c] p-7 transition-colors md:p-8 ${border}`}
                >
                  <div
                    className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${glow} blur-[70px] transition duration-700 group-hover:opacity-100`}
                  />
                  <p
                    className={`relative z-10 text-xs font-bold uppercase tracking-[0.2em] ${accent}`}
                  >
                    {item.who}
                  </p>
                  <p className="relative z-10 mt-2 text-sm font-semibold text-neutral-500">
                    {item.years}
                  </p>
                  <p className="relative z-10 mt-6 text-xl font-black leading-snug tracking-tight text-white md:text-2xl">
                    {item.line}
                  </p>
                  <p className="relative z-10 mt-4 text-base font-medium leading-relaxed text-neutral-400">
                    {item.detail}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why we exist — problem */}
      <section className="relative z-10 border-y border-white/8 bg-[#070a08] px-6 py-24 md:px-10 md:py-32 xl:px-12">
        <div className="mx-auto max-w-375">
          <div className="mb-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-neutral-500">
                Por que criamos
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
                O caos rouba a conversa.
              </h2>
            </div>
            <p className="max-w-xl text-lg font-medium leading-relaxed text-neutral-400 lg:justify-self-end">
              A gente viu salões ótimos perdendo o essencial: presença. Não por falta de talento —
              por excesso de barulho operacional.
            </p>
          </div>

          <div className="relative grid gap-0 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden h-px bg-linear-to-r from-emerald-400/30 via-white/15 to-amber-300/30 md:block" />
            {beats.map((beat, i) => (
              <motion.div
                key={beat.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`border border-white/8 bg-black/40 p-7 md:border-y md:border-l-0 md:p-8 md:first:rounded-l-[2rem] md:first:border-l md:last:rounded-r-[2rem] ${
                  i === 0 ? 'rounded-t-[2rem] md:rounded-tr-none' : ''
                } ${i === 2 ? 'rounded-b-[2rem] md:rounded-bl-none' : ''}`}
              >
                <span className="text-sm font-black text-emerald-400">{beat.n}</span>
                <h3 className="mt-4 text-2xl font-black tracking-tight text-white">{beat.title}</h3>
                <p className="mt-3 text-base font-medium leading-relaxed text-neutral-400">
                  {beat.copy}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What we do about it */}
      <section className="relative z-10 px-6 py-24 md:px-10 md:py-32 xl:px-12">
        <div className="mx-auto max-w-375">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">
                O que o AgendAI faz
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
                Menos atrito.
                <br />
                Mais cadeira ocupada com gente que importa.
              </h2>
              <p className="mt-6 text-lg font-medium leading-relaxed text-neutral-400">
                Fila pública, agenda que respeita o profissional preferido, lembrete no WhatsApp,
                financeiro e visão de dono no Pro. Tudo para o salão respirar — e a relação
                sobreviver ao dia corrido.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'O cliente escolhe “o seu” profissional sem ligar.',
                  'O lembrete chega sem o dono virar secretária.',
                  'A equipe vê a fila e a agenda no mesmo lugar.',
                  'O vínculo continua humano. A bagunça, não.',
                ].map(line => (
                  <li key={line} className="flex gap-3 text-base font-semibold text-neutral-200">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-4xl border border-emerald-400/20 bg-[#07110b]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/50 to-transparent" />
              <div className="space-y-0 p-2 md:p-3">
                {[
                  {
                    from: 'Cliente',
                    text: 'Pode ser com a Marina quinta 14h?',
                    side: 'left' as const,
                  },
                  {
                    from: 'AgendAI',
                    text: 'Horário livre. Confirmado. Lembrete amanhã às 20h.',
                    side: 'right' as const,
                  },
                  {
                    from: 'Marina',
                    text: 'Ana de novo. Já sei o que ela gosta.',
                    side: 'left' as const,
                  },
                ].map(msg => (
                  <div
                    key={msg.text}
                    className={`flex px-4 py-3 ${msg.side === 'right' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.side === 'right'
                          ? 'rounded-br-md bg-emerald-400 text-black'
                          : 'rounded-bl-md border border-white/10 bg-white/5 text-white'
                      }`}
                    >
                      <p
                        className={`text-[10px] font-black uppercase tracking-wider ${
                          msg.side === 'right' ? 'text-black/55' : 'text-neutral-500'
                        }`}
                      >
                        {msg.from}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/8 px-6 py-5">
                <p className="text-sm font-medium leading-relaxed text-neutral-400">
                  A tecnologia confirma o horário. A amizade acontece na cadeira.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Beliefs — editorial, no icon boxes */}
      <section className="relative z-10 border-y border-white/8 bg-white/[0.015] px-6 py-24 md:px-10 md:py-28 xl:px-12">
        <div className="mx-auto max-w-375">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">
            No que acreditamos
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
            Três princípios. Zero buzzword.
          </h2>

          <div className="mt-14 divide-y divide-white/8 border-y border-white/8">
            {beliefs.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid gap-4 py-10 md:grid-cols-[0.35fr_1fr] md:gap-12"
              >
                <h3 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                  {item.title}
                </h3>
                <p className="text-lg font-medium leading-relaxed text-neutral-400 md:text-xl">
                  {item.copy}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin */}
      <section className="relative z-10 px-6 py-24 md:px-10 md:py-32 xl:px-12">
        <div className="mx-auto max-w-375">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0d110e] md:rounded-[3rem]">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-8 md:p-12 lg:p-16">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px w-10 bg-gradient-to-r from-emerald-400 to-transparent" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-400/90">
                    De onde viemos
                  </p>
                </div>
                <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                  Bebedouro, São Paulo.
                  <br />
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
                    Pé no chão, olho no salão.
                  </span>
                </h2>
                <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-neutral-400">
                  O AgendAI não nasceu num pitch de Silicon Valley. Nasceu da observação próxima:
                  barbearias e salões onde o profissional é quase da família — e onde o celular
                  ainda era o "sistema".
                </p>
                <p className="mt-4 max-w-xl text-lg font-medium leading-relaxed text-neutral-400">
                  Queremos que cada estabelecimento, do studio pequeno à casa cheia no sábado, tenha
                  ferramenta digna — sem taxa por cadeira e sem complicar o que já funciona entre
                  pessoas.
                </p>
              </div>
              <div className="relative flex flex-col justify-end border-t border-white/8 bg-gradient-to-br from-white/[0.03] to-transparent p-8 md:p-12 lg:border-l lg:border-t-0 lg:p-16">
                <div
                  className="absolute top-8 right-8 w-32 h-32 rounded-full blur-[80px] pointer-events-none opacity-40"
                  style={{
                    background: 'radial-gradient(circle, rgba(16,185,129,0.5), transparent 70%)',
                  }}
                />
                <p className="relative text-6xl font-black tracking-tighter md:text-8xl">
                  <span className="text-white/50">desde</span>
                  <br />
                  <span className="text-emerald-400/70">o vínculo</span>
                </p>
                <p className="relative mt-6 text-base font-semibold text-neutral-300">
                  Multi-tenant, fila, agenda, financeiro e lembretes — construídos para o dia a dia
                  brasileiro de salão, barbearia e studio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-32 pt-8 md:px-10 md:pb-40 xl:px-12">
        <div className="relative mx-auto max-w-375 overflow-hidden rounded-[2.5rem] border border-emerald-400/15 bg-[#0d1510] px-8 py-16 text-center md:rounded-[3.5rem] md:px-16 md:py-24">
          <div className="absolute left-1/2 top-0 h-72 w-2/3 -translate-x-1/2 rounded-full bg-emerald-400/12 blur-[100px]" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300/80">
              Faça parte
            </p>
            <h2 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.05em] text-white md:text-6xl xl:text-7xl">
              Proteja as amizades que pagam o aluguel.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-relaxed text-neutral-400">
              {trialCampaign.body} Organize a fila e a agenda — e deixe a cadeira para o que só
              humanos fazem bem.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-emerald-400 px-8 py-4 text-base font-black text-black transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                {trialCampaign.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/contato')}
                className="inline-flex items-center justify-center px-4 py-3 text-sm font-bold text-neutral-400 transition hover:text-white"
              >
                Contar a história do seu salão
              </button>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};

export default AboutPage;
