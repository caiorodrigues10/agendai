import React from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { SeoHead } from '../../components/marketing/SeoHead';
import { trialCampaign } from '../../marketing/trialCampaign';
import { commercialPageByPath } from '../../marketing/commercialPages';
import { breadcrumbLd, faqPageLd, softwareApplicationLd } from '../../marketing/softwareApplicationLd';

export const CommercialIntentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const page = commercialPageByPath(location.pathname);

  if (!page) return <Navigate to="/" replace />;

  const jsonLd = [softwareApplicationLd(page.path), faqPageLd(page.faqs), breadcrumbLd([
    { name: 'AgendAI', path: '/' },
    { name: page.eyebrow, path: page.path },
  ])];

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-sans text-neutral-100 selection:bg-accent/30">
      <SeoHead
        title={page.metaTitle}
        description={page.metaDescription}
        path={page.path}
        jsonLd={jsonLd}
      />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-[15%] top-[-12%] h-[55%] w-[55%] rounded-full bg-accent/25 blur-[140px]" />
        <div className="absolute -right-[10%] top-[20%] h-[45%] w-[45%] rounded-full bg-teal-900/15 blur-[130px]" />
      </div>

      <MarketingNav />

      <section className="relative z-10 px-6 pb-16 pt-36 md:px-10 md:pb-24 md:pt-44 xl:px-12">
        <div className="mx-auto max-w-375">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex rounded-full border border-accent/25 bg-accent/8 px-5 py-2.5 text-sm font-black uppercase tracking-[0.16em] text-accent-light"
          >
            {page.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mt-7 max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.04em] text-white md:text-6xl"
          >
            {page.h1} <span className="text-accent-light">{page.h1Accent}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-neutral-300 md:text-xl"
          >
            {page.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <button
              type="button"
              onClick={() => navigate('/cadastro')}
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-base font-black text-black transition hover:-translate-y-0.5 hover:bg-accent-light"
            >
              {trialCampaign.cta}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/planos')}
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/3 px-8 py-4 text-base font-bold text-white transition hover:bg-white/8"
            >
              Ver planos e preços
            </button>
          </motion.div>
          <p className="mt-5 text-sm font-semibold text-neutral-400">{trialCampaign.heroSubline}</p>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-16 md:px-10 xl:px-12">
        <div className="mx-auto grid max-w-375 gap-10 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-2xl font-black text-white">{page.painTitle}</h2>
            <ul className="mt-6 space-y-4">
              {page.pains.map(pain => (
                <li key={pain} className="text-sm leading-relaxed text-neutral-400">
                  {pain}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white">{page.solutionTitle}</h2>
            {page.solutions.map(item => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-16 md:px-10 xl:px-12">
        <div className="mx-auto max-w-375 rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <h2 className="text-2xl font-black text-white">{page.featuresTitle}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {page.features.map(feature => (
              <li key={feature} className="flex items-start gap-3 text-sm font-medium text-neutral-300">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-10 border-t border-white/10 pt-8">
            <h3 className="text-lg font-bold text-white">{page.proofTitle}</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-400">{page.proofBody}</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-16 md:px-10 xl:px-12">
        <div className="mx-auto max-w-375">
          <h2 className="text-2xl font-black text-white">Perguntas frequentes</h2>
          <div className="mt-8 space-y-4">
            {page.faqs.map(faq => (
              <details
                key={faq.question}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 open:border-accent/30"
              >
                <summary className="cursor-pointer text-base font-bold text-white">{faq.question}</summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">{faq.answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {page.related.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-bold text-neutral-300 transition hover:border-white/30 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24 md:px-10 xl:px-12">
        <div className="mx-auto flex max-w-375 flex-col items-start justify-between gap-6 rounded-3xl bg-white px-8 py-10 text-black md:flex-row md:items-center md:px-12">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-neutral-500">Começar</p>
            <p className="mt-2 max-w-xl text-2xl font-black tracking-tight">{trialCampaign.body}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/cadastro')}
            className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-sm font-black text-white"
          >
            {trialCampaign.cta}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};

export default CommercialIntentPage;
