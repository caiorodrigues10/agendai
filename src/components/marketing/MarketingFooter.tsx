import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Linkedin } from 'lucide-react';
import { Logo } from '../ui/Logo';

const platformLinks = [
  { to: '/funcionalidades', label: 'Funcionalidades' },
  { to: '/ia-preditiva', label: 'IA Preditiva', badge: 'Novo' },
  { to: '/agendamento', label: 'Agendamento' },
  { to: '/dashboard', label: 'Dashboard' },
];

const companyLinks = [
  { to: '/sobre', label: 'Sobre Nós' },
  { to: '/contato', label: 'Contato' },
];

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

/** Footer compartilhado entre a landing page e as páginas de marketing. */
export const MarketingFooter: React.FC = () => {
  return (
    <footer className="relative bg-[#050505] pt-32 pb-10 px-6 border-t border-white/10 z-10 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <Logo size="sm" className="text-white" />
            </Link>
            <p className="text-neutral-400 text-lg max-w-sm leading-relaxed mb-10 font-light">
              Fila, agenda e gestão para salões de beleza, barbearias e studios — feitos para atender todo mundo.
            </p>

            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <a key={i} href={social.href} aria-label={social.label} className="w-10 h-10 bg-neutral-900/50 rounded-full flex items-center justify-center text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-all border border-white/5 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 gap-12">
            <div>
              <h5 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">Plataforma</h5>
              <ul className="space-y-5 text-sm text-neutral-400 font-light">
                {platformLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                      {link.label}
                      {link.badge && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase tracking-wider">{link.badge}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-white font-bold mb-8 uppercase text-[10px] tracking-[0.2em]">Empresa</h5>
              <ul className="space-y-5 text-sm text-neutral-400 font-light">
                {companyLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="hover:text-emerald-400 transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-neutral-500 font-light">
          <p>© {new Date().getFullYear()} AGENDAI. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-6 md:mt-0 items-center">
            <span className="hover:text-white transition-colors cursor-pointer">Sede: Bebedouro-SP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
