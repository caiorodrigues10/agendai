import React, { useState } from 'react';
import { Link2, Copy, Check, QrCode, Share2 } from 'lucide-react';

interface PublicLinkPanelProps {
  barbershopId: string;
}

export const PublicLinkPanel: React.FC<PublicLinkPanelProps> = ({ barbershopId }) => {
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/queue/${barbershopId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}&bgcolor=1a1a2e&color=00c2b3`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = publicUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Link2 size={18} className="text-accent" />
          <h3 className="text-text-primary font-bold text-sm">Link público do salão</h3>
        </div>

        <p className="text-text-secondary text-xs mb-4">
          Compartilhe esse link no Instagram, WhatsApp ou Google Meu Negócio pra clientes agendarem direto.
        </p>

        <div className="flex items-center gap-2 bg-surface-2 rounded-lg p-3 mb-4">
          <span className="text-text-primary text-xs flex-1 truncate font-mono">{publicUrl}</span>
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              copied
                ? 'bg-success/15 text-success'
                : 'bg-accent/15 text-accent hover:bg-accent/25'
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="bg-white rounded-xl p-3">
            <img src={qrUrl} alt="QR Code do link público" width={160} height={160} className="rounded-lg" />
          </div>
          <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
            <QrCode size={12} />
            <span>QR Code pronto pra compartilhar</span>
          </div>
        </div>
      </div>

      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-surface border border-border text-text-secondary text-xs font-bold hover:bg-surface-2 transition-all"
      >
        <Share2 size={14} />
        Abrir página pública
      </a>
    </div>
  );
};
