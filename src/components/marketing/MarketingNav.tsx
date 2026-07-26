import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '../ui/Logo';

const sectionLinks = [
  { id: 'recursos', label: 'Recursos' },
  { id: 'tecnologia', label: 'Tecnologia' },
  { id: 'precos', label: 'Preços' },
];

/**
 * Nav compartilhada entre a landing page e as páginas de marketing
 * (Funcionalidades, IA Preditiva, Agendamento, Dashboard, Sobre Nós, Contato).
 *
 * Os links de seção (Recursos/Tecnologia/Preços) sempre apontam para a home
 * via hash (`/#id`); a `LandingPage` lê `location.hash` no mount e faz o
 * scroll suave até a seção correspondente.
 */
export const MarketingNav: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-2xl border-b border-white/5 px-6 py-4 bg-black/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 cursor-pointer group" onClick={() => setMobileOpen(false)}>
          <Logo size="md" className="text-white" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-neutral-400">
          {sectionLinks.map((link) => (
            <Link
              key={link.id}
              to={`/#${link.id}`}
              className="transition-colors hover:text-white relative group cursor-pointer"
            >
              {link.label}
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="hidden md:block text-xs font-bold uppercase tracking-tight text-neutral-400 hover:text-white transition-colors">Acessar Painel</button>
          <button onClick={() => navigate('/planos')} className="hidden sm:block bg-white text-black px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-tighter hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            Começar Agora
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden text-white p-2 -mr-2"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-4 pb-2 flex flex-col gap-1 text-sm font-bold uppercase tracking-widest text-neutral-300 border-t border-white/5 pt-4">
          {sectionLinks.map((link) => (
            <Link
              key={link.id}
              to={`/#${link.id}`}
              onClick={() => setMobileOpen(false)}
              className="py-3 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              navigate('/login');
            }}
            className="py-3 text-left hover:text-white transition-colors"
          >
            Acessar Painel
          </button>
          <button
            onClick={() => {
              setMobileOpen(false);
              navigate('/planos');
            }}
            className="mt-2 bg-white text-black px-5 py-3 rounded-full text-xs font-black uppercase tracking-tighter"
          >
            Começar Agora
          </button>
        </div>
      )}
    </nav>
  );
};
