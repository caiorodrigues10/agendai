import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { trialCampaign } from '../../marketing/trialCampaign';

const platformLinks = [
  { to: '/funcionalidades', label: 'Funcionalidades' },
  { to: '/agendamento', label: 'Agendamento' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/planos', label: 'Planos' },
];

const companyLinks = [
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
  { to: '/login', label: 'Acessar painel' },
  { to: '/cadastro', label: trialCampaign.cta },
];

const exploreLinks = [
  { to: '/#recursos', label: 'Recursos' },
  { to: '/#produto', label: 'Aplicativo' },
  { to: '/#precos', label: 'Preços' },
  { to: '/#produto', label: 'Ver demonstração' },
];

const socialLinks: { href?: string; label: string }[] = [];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { to?: string; href?: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
        {links.map(link => (
          <li key={`${title}-${link.label}`}>
            {link.to ? (
              <Link
                to={link.to}
                className="text-[13px] font-medium leading-snug text-neutral-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="text-[13px] font-medium leading-snug text-neutral-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Footer compartilhado entre a landing page e as páginas de marketing. */
export const MarketingFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-bg px-6 pb-12 pt-16 text-neutral-400 md:px-10 md:pt-24 xl:px-12">
      <div className="mx-auto max-w-375">
        <div className="border-b border-white/10 pb-12 md:pb-14">
          <nav
            className="mb-10 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-600"
            aria-label="Breadcrumb"
          >
            <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <li>
                <Link to="/" className="transition-colors hover:text-neutral-300">
                  AgendAI
                </Link>
              </li>
              <li aria-hidden className="text-neutral-700">
                /
              </li>
              <li className="normal-case tracking-normal text-neutral-300">
                Para salões e barbearias
              </li>
            </ol>
          </nav>

          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-20 xl:gap-28">
            <div className="max-w-md shrink-0">
              <Link to="/" className="group inline-flex transition duration-300 hover:opacity-100">
                <Logo
                  size="lg"
                  className="text-white transition duration-300 group-hover:text-accent-light"
                />
              </Link>

              <div className="mt-8 space-y-4 md:mt-10">
                <p className="max-w-[22ch] text-[clamp(1.35rem,2.4vw,1.75rem)] font-semibold leading-[1.2] tracking-[-0.035em] text-white">
                  Fila, agenda e caixa no ritmo do seu salão.
                </p>
                <p className="max-w-sm text-[13px] font-light leading-relaxed text-neutral-500 md:text-sm">
                  Para salões de beleza, barbearias e studios — atendimento feminino, masculino ou
                  unissex.
                </p>
              </div>

              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-accent/90">
                {trialCampaign.eyebrow}
              </p>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-4 sm:gap-x-8 lg:pt-1">
              <FooterColumn title="Explorar" links={exploreLinks} />
              <FooterColumn title="Plataforma" links={platformLinks} />
              <FooterColumn title="Empresa" links={companyLinks} />
              {socialLinks.length > 0 && <FooterColumn title="Rede" links={socialLinks} />}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-7 text-[11px] font-medium leading-relaxed text-neutral-600 md:flex-row md:items-center md:justify-between md:text-[12px]">
          <p>Copyright © {year} AgendAI. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Brasil</span>
            <span className="hidden text-neutral-700 sm:inline" aria-hidden>
              |
            </span>
            <span>Sede: Bebedouro-SP</span>
            <span className="hidden text-neutral-700 sm:inline" aria-hidden>
              |
            </span>
            <Link to="/contato" className="transition-colors hover:text-white">
              Contato
            </Link>
            <Link to="/privacidade" className="transition-colors hover:text-white">
              Privacidade
            </Link>
            <Link to="/termos" className="transition-colors hover:text-white">
              Termos
            </Link>
            <Link to="/planos" className="transition-colors hover:text-white">
              Planos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
