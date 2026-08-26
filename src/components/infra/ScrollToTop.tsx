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
 * Reseta o scroll ao trocar de pathname — exceto quando há hash
 * (`/#precos`), para a LandingPage poder rolar até a seção.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    const pathChanged = prevPathname.current !== pathname;
    prevPathname.current = pathname;
    if (!pathChanged) return;
    // Com hash, a página de destino faz o scrollIntoView.
    if (hash) return;
    jumpToTop();
  }, [pathname, hash]);

  useEffect(() => {
    if (hash) {
      const id = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(id);
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
