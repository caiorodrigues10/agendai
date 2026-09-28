import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function jumpToTop() {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  html.scrollTop = 0;
  document.body.scrollTop = 0;
  html.style.scrollBehavior = previous;
}

/**
 * Troca de aba dentro do painel autenticado (`/app/...`): cada aba é uma rota,
 * mas não é navegação de seção — o reset global de scroll (escrito para a
 * landing/site público) arrastaria a página e o menu lateral para o topo.
 * Entrar/sair do `/app` continua resetando normalmente.
 */
function isAppTabSwitch(prev: string, next: string) {
  const prevIsApp = prev.startsWith('/app/') || prev === '/app';
  const nextIsApp = next.startsWith('/app/') || next === '/app';
  return prevIsApp && nextIsApp;
}

/**
 * Reseta o scroll ao trocar de pathname — exceto quando há hash
 * (`/#precos`), para a LandingPage poder rolar até a seção; e exceto em
 * troca de aba dentro do `/app` (ver `isAppTabSwitch`).
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const prevPathname = useRef(pathname);
  // Decide no layout effect (que roda antes) se o efeito paralelo abaixo
  // deve pular o reset — o prevPathname já foi atualizado nessa altura.
  const skipReset = useRef(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    const prev = prevPathname.current;
    const pathChanged = prev !== pathname;
    prevPathname.current = pathname;
    skipReset.current = pathChanged && !hash && isAppTabSwitch(prev, pathname);
    if (!pathChanged) return;
    // Com hash, a página de destino faz o scrollIntoView.
    if (hash) return;
    if (skipReset.current) return;
    jumpToTop();
  }, [pathname, hash]);

  useEffect(() => {
    if (hash) {
      skipReset.current = false;
      const id = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(id);
    }

    if (skipReset.current) {
      skipReset.current = false;
      return;
    }

    jumpToTop();
    const raf = requestAnimationFrame(() => {
      jumpToTop();
      ScrollTrigger.refresh();
    });
    const timer = window.setTimeout(() => {
      jumpToTop();
      ScrollTrigger.refresh();
    }, 50);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [pathname, hash]);

  return null;
}
