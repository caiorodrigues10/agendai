import React from 'react';
import {
  CheckCircle2,
  Download,
  Loader2,
  MoreVertical,
  Share2,
  Smartphone,
} from 'lucide-react';
import { usePwaInstall } from '../../contexts/PwaInstallContext';

interface PwaInstallCardProps {
  variant?: 'marketing' | 'panel';
  videoUrl?: string;
}

const installSteps = [
  { icon: MoreVertical, label: 'Abra o menu do navegador' },
  { icon: Download, label: 'Toque em Instalar aplicativo' },
  { icon: Smartphone, label: 'Abra pela tela inicial' },
] as const;

export const PwaInstallCard: React.FC<PwaInstallCardProps> = ({
  variant = 'panel',
  videoUrl,
}) => {
  const { canInstall, install, installing, isInstalled, isIos, isMobile } = usePwaInstall();
  const marketing = variant === 'marketing';

  const installHelp = isIos
    ? 'No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.'
    : isMobile
      ? 'No Chrome, abra o menu e escolha Instalar app se o botão ainda não apareceu.'
      : 'No Chrome ou Edge, use o ícone de instalação na barra de endereço.';

  return (
    <article
      className={
        marketing
          ? 'overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c100e] text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)]'
          : 'overflow-hidden rounded-2xl border border-border bg-surface text-text-primary'
      }
    >
      <div className={marketing ? 'grid lg:grid-cols-[0.9fr_1.1fr]' : ''}>
        {marketing && (
          <div
            data-video-slot="pwa-install"
            className="relative flex min-h-96 items-center justify-center overflow-hidden border-b border-white/8 bg-black/35 p-8 lg:border-b-0 lg:border-r"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.16),_transparent_62%)]" />
            {videoUrl ? (
              <video
                className="relative z-10 aspect-[9/16] max-h-128 rounded-[2rem] border border-white/12 bg-black object-cover shadow-2xl"
                controls
                playsInline
                preload="metadata"
                poster="/screenshots/queue-real.png"
                src={videoUrl}
              >
                Seu navegador não reproduz este vídeo.
              </video>
            ) : (
              <div className="relative z-10 w-full max-w-68 rounded-[2rem] border border-white/12 bg-[#111714] p-4 shadow-2xl">
                <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-white/15" />
                <div className="flex aspect-[9/14] flex-col justify-between rounded-[1.35rem] bg-linear-to-b from-accent/15 to-black p-5">
                  <div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00c2b3] font-black text-[#0a0f18] shadow-lg">
                      AI
                    </div>
                    <p className="mt-5 text-2xl font-black leading-tight">AgendAI na tela inicial</p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                      Um guia visual curto, pronto para receber o vídeo vertical de instalação.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-xs font-bold text-accent-light">
                    Guia visual · 15–20 segundos
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={marketing ? 'p-7 sm:p-10 lg:p-14' : 'p-4 sm:p-5'}>
          <div className="flex items-start gap-3">
            <div
              className={
                marketing
                  ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent'
                  : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent'
              }
            >
              <Smartphone size={marketing ? 22 : 19} />
            </div>
            <div>
              <p
                className={
                  marketing
                    ? 'text-[11px] font-black uppercase tracking-[0.22em] text-accent'
                    : 'text-[10px] font-bold uppercase tracking-wider text-accent'
                }
              >
                Aplicativo instalável
              </p>
              <h3 className={marketing ? 'mt-2 text-3xl font-black sm:text-4xl' : 'mt-1 text-lg font-bold'}>
                Seu salão a um toque de distância.
              </h3>
            </div>
          </div>

          <p
            className={
              marketing
                ? 'mt-6 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg'
                : 'mt-3 text-sm leading-relaxed text-text-secondary'
            }
          >
            Instale o AgendAI direto pelo navegador. Ele abre em tela cheia e fica junto dos outros
            aplicativos, sem depender de loja.
          </p>

          <div className={marketing ? 'mt-8 space-y-3' : 'mt-4 grid gap-2 sm:grid-cols-3'}>
            {installSteps.map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                className={
                  marketing
                    ? 'flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3'
                    : 'flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5'
                }
              >
                <span
                  className={
                    marketing
                      ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent'
                      : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent'
                  }
                >
                  {isIos && index === 0 ? <Share2 size={14} /> : <Icon size={14} />}
                </span>
                <span className={marketing ? 'text-sm font-semibold text-neutral-200' : 'text-xs font-semibold'}>
                  {index + 1}. {label}
                </span>
              </div>
            ))}
          </div>

          <div className={marketing ? 'mt-8' : 'mt-4'}>
            {isInstalled ? (
              <p className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-bold text-accent">
                <CheckCircle2 size={17} /> AgendAI já está instalado
              </p>
            ) : canInstall ? (
              <button
                type="button"
                onClick={() => void install()}
                disabled={installing}
                className={
                  marketing
                    ? 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-black text-black transition hover:bg-accent-hover disabled:opacity-60'
                    : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-fg transition hover:bg-accent-hover disabled:opacity-60'
                }
              >
                {installing ? <Loader2 className="animate-spin" size={17} /> : <Download size={17} />}
                Instalar AgendAI
              </button>
            ) : (
              <p className={marketing ? 'text-sm leading-relaxed text-neutral-400' : 'text-xs leading-relaxed text-text-muted'}>
                {installHelp}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
