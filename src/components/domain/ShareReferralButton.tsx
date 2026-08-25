import React, { useState } from 'react';
import { Copy, CheckCircle2, Share2 } from 'lucide-react';

interface ShareReferralButtonProps {
  shareUrl: string;
  shareText: string;
}

export const ShareReferralButton: React.FC<ShareReferralButtonProps> = ({
  shareUrl,
  shareText,
}) => {
  const [copied, setCopied] = useState(false);
  const supportsShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Indique o AGENDAI',
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch (err: unknown) {
      const name =
        err && typeof err === 'object' && 'name' in err
          ? String((err as { name: string }).name)
          : '';
      if (name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          /* silent */
        }
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-accent text-accent-fg text-xs font-bold uppercase tracking-wider hover:bg-accent-hover transition-colors"
    >
      {supportsShare ? (
        <>
          <Share2 size={14} /> Compartilhar
        </>
      ) : copied ? (
        <>
          <CheckCircle2 size={14} /> Copiado
        </>
      ) : (
        <>
          <Copy size={14} /> Copiar link
        </>
      )}
    </button>
  );
};
