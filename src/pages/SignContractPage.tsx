import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LuCircleCheck as CheckCircle,
  LuDownload as Download,
  LuPenLine as PenLine,
} from 'react-icons/lu';
import { casesApi, type PublicContract } from '../infra/casesApi';
import { getErrorMessage } from '../utils/errorMessage';
import { Logo } from '../components/ui/Logo';
import { FIELD_CONTROL } from '../components/ui/Field';

type SignatureMode = 'TYPED' | 'DRAWN';

/**
 * Página pública de assinatura de contrato/procuração.
 *
 * O link traz um token: quem o recebe assina, sem precisar de conta. A
 * página **não** mostra número de processo, apelido interno do caso nem
 * dados do cliente — só o documento e o nome de quem vai assinar.
 */
export const SignContractPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [contract, setContract] = useState<PublicContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<SignatureMode>('TYPED');
  const [typedName, setTypedName] = useState('');
  const [drawn, setDrawn] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setError('Link de assinatura inválido.');
      setLoading(false);
      return;
    }
    let active = true;
    void (async () => {
      try {
        const data = await casesApi.getPublicContract(token);
        if (!active) return;
        setContract(data);
        setTypedName(data.signerName);
      } catch (err) {
        if (!active) return;
        setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setDrawn(null);
  }, []);

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    drawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    context.beginPath();
    context.moveTo(x, y);
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = '#111827';
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const rect = canvas.getBoundingClientRect();
    context.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    context.stroke();
  };

  const endDrawing = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDrawn(canvas.toDataURL('image/png'));
  };

  const sign = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'DRAWN') {
        if (!drawn) throw new Error('Desenhe sua assinatura antes de confirmar.');
        await casesApi.signContract(token, { drawnSignature: drawn });
      } else {
        if (!typedName.trim()) throw new Error('Digite seu nome para assinar.');
        await casesApi.signContract(token, { typedName: typedName.trim() });
      }
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <p className="text-sm text-text-muted">Carregando documento…</p>
      </Shell>
    );
  }

  if (!contract) {
    return (
      <Shell>
        <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
          {error ?? 'Documento não encontrado.'}
        </p>
      </Shell>
    );
  }

  if (done || contract.status === 'SIGNED') {
    return (
      <Shell>
        <div className="space-y-3 text-center">
          <CheckCircle size={40} className="mx-auto text-success" />
          <h1 className="font-display text-xl font-bold text-text-primary">Assinatura registrada</h1>
          <p className="text-sm text-text-muted">
            O documento foi assinado em nome de {contract.signerName}. O escritório já foi notificado.
          </p>
        </div>
      </Shell>
    );
  }

  if (contract.status === 'DECLINED') {
    return (
      <Shell>
        <p className="text-sm text-text-muted">Esta assinatura foi recusada.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-4">
        <header className="space-y-1">
          <h1 className="font-display text-xl font-bold text-text-primary">{contract.contractTitle}</h1>
          <p className="text-sm text-text-muted">
            Olá, {contract.signerName}. Revise o documento e assine abaixo.
          </p>
        </header>

        {contract.content && (
          <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-secondary">
            {contract.content}
          </div>
        )}

        {contract.fileUrl && (
          <a
            href={contract.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-bold text-accent"
          >
            <Download size={14} /> Baixar o documento
          </a>
        )}

        <form onSubmit={sign} className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('TYPED')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                mode === 'TYPED' ? 'bg-accent/15 text-accent' : 'text-text-muted'
              }`}
            >
              Digitar
            </button>
            <button
              type="button"
              onClick={() => setMode('DRAWN')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold ${
                mode === 'DRAWN' ? 'bg-accent/15 text-accent' : 'text-text-muted'
              }`}
            >
              <PenLine size={12} /> Desenhar
            </button>
          </div>

          {mode === 'TYPED' ? (
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Assine com seu nome
              </span>
              <input
                className={FIELD_CONTROL}
                value={typedName}
                onChange={event => setTypedName(event.target.value)}
                aria-label="Nome para assinatura"
              />
            </label>
          ) : (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Desenhe sua assinatura
              </span>
              <canvas
                ref={canvasRef}
                width={600}
                height={180}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={endDrawing}
                onPointerLeave={endDrawing}
                className="w-full touch-none rounded-xl border border-border bg-white"
                aria-label="Área de assinatura"
              />
              <button
                type="button"
                onClick={clearCanvas}
                className="text-[11px] font-bold text-text-muted hover:text-text-primary"
              >
                Limpar
              </button>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-fg disabled:opacity-50"
          >
            {submitting ? 'Registrando…' : 'Assinar documento'}
          </button>
        </form>
      </div>
    </Shell>
  );
};

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-bg">
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      <Logo />
    </header>
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
    <footer className="border-t border-border px-4 py-3 text-center text-[11px] text-text-muted">
      Assinatura eletrônica registrada com data e hora.
    </footer>
  </div>
);

export default SignContractPage;
