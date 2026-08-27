import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { staffHomePath } from '../../utils/subscriptionPaywall';

/** Âncoras da landing (`/#id`). */
const sectionLinks = [
  { id: 'recursos', label: 'Recursos' },
  { id: 'tecnologia', label: 'Tecnologia' },
  { id: 'precos', label: 'Preços' },
] as const;

/** Páginas de marketing. */
const pageLinks = [
  { to: '/funcionalidades', label: 'Funcionalidades' },
  { to: '/planos', label: 'Planos' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
] as const;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

/**
 * Nav compartilhada entre a landing e as páginas de marketing.
 * Seções usam scroll na home; páginas usam rotas normais.
 */
export const MarketingNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goPanel = () => {
    setMobileOpen(false);
    navigate(user ? staffHomePath(user.role) : '/login');
  };

  const goStart = () => {
    setMobileOpen(false);
    navigate(user ? staffHomePath(user.role) : '/planos');
  };

  const goToSection = (id: string) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      scrollToSection(id);
      if (location.hash !== `#${id}`) {
        window.history.pushState(null, '', `/#${id}`);
      }
      return;
    }
    navigate(`/#${id}`);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 px-5 py-4 backdrop-blur-2xl sm:px-8 xl:px-12">
      <div className="mx-auto flex max-w-400 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3 cursor-pointer group"
          onClick={() => setMobileOpen(false)}
        >
          <Logo size="md" className="text-white" />
        </Link>

        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          {sectionLinks.map(link => (
            <button
              key={link.id}
              type="button"
              onClick={() => goToSection(link.id)}
              className="relative cursor-pointer text-[11px] font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
            >
              {link.label}
            </button>
          ))}
          <span className="h-3 w-px bg-white/10" aria-hidden />
          {pageLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={goPanel}
            className="hidden text-xs font-bold uppercase tracking-tight text-neutral-400 transition-colors hover:text-white md:block"
          >
            Acessar Painel
          </button>
          <button
            type="button"
            onClick={goStart}
            className="hidden rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase tracking-tighter text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] sm:block"
          >
            {user ? 'Ir para o painel' : 'Começar Agora'}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            className="p-2 -mr-2 text-white lg:hidden"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mx-auto mt-4 flex max-w-400 flex-col gap-0.5 border-t border-white/5 pb-2 pt-4 text-sm font-bold uppercase tracking-widest text-neutral-300 lg:hidden">
          {sectionLinks.map(link => (
            <button
              key={link.id}
              type="button"
              onClick={() => goToSection(link.id)}
              className="py-3 text-left transition-colors hover:text-white"
            >
              {link.label}
            </button>
          ))}
          <div className="my-2 h-px bg-white/8" />
          {pageLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="py-3 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={goPanel}
            className="py-3 text-left transition-colors hover:text-white"
          >
            Acessar Painel
          </button>
          <button
            type="button"
            onClick={goStart}
            className="mt-2 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-tighter text-black"
          >
            {user ? 'Ir para o painel' : 'Começar Agora'}
          </button>
        </div>
      )}
    </nav>
  );
};
