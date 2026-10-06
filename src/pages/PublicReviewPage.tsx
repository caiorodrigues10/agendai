import React from 'react';
import {
  LuCircleAlert as AlertCircle,
  LuCircleCheck as CheckCircle,
  LuExternalLink as ExternalLink,
  LuLoaderCircle as Loader2,
  LuStar as Star,
} from 'react-icons/lu';
import { Button } from '../components/ui/Button';
import { SectionError } from '../components/patterns/states/SectionError';
import { reputationApi, PublicReviewContext } from '../infra/reputationApi';
import { getErrorMessage } from '../utils/errorMessage';

const MAX_COMMENT_LENGTH = 200;

function getTokenFromLocation(): string {
  const hashToken = window.location.hash.replace(/^#token=/, '');
  if (hashToken) return decodeURIComponent(hashToken);
  return new URLSearchParams(window.location.search).get('token') ?? '';
}

const PublicReviewPage: React.FC = () => {
  const [token] = React.useState(getTokenFromLocation);
  const [context, setContext] = React.useState<PublicReviewContext | null>(null);
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) {
      setError('Link de avaliação ausente ou inválido.');
      setLoading(false);
      return;
    }
    window.history.replaceState(null, '', window.location.pathname);
    reputationApi
      .getPublicReviewContext(token)
      .then(data => {
        setContext(data);
        setSubmitted(data.alreadySubmitted);
      })
      .catch(err => setError(getErrorMessage(err, 'Não foi possível abrir esta avaliação.')))
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async () => {
    if (!token || rating < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      await reputationApi.submitPublicReview(token, rating, comment);
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível enviar sua avaliação.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-bg text-text-muted flex items-center justify-center">
        <Loader2 className="animate-spin" size={28} />
      </main>
    );
  }

  if (error && !context) {
    return (
      <main className="min-h-screen bg-bg text-text-primary px-4 py-10 flex items-center justify-center">
        <section className="w-full max-w-md rounded-2xl border border-danger/30 bg-surface p-6 text-center">
          <AlertCircle className="mx-auto text-danger" size={34} />
          <h1 className="mt-4 text-xl font-bold">Avaliação indisponível</h1>
          <p className="mt-2 text-sm text-text-secondary">{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-text-primary px-4 py-10">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="text-center">
          {context?.barbershop.logoUrl ? (
            <img
              src={context.barbershop.logoUrl}
              alt={context.barbershop.name}
              className="mx-auto h-16 w-16 rounded-2xl border border-border object-cover"
            />
          ) : (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-bg text-xl font-black text-accent">
              {context?.barbershop.name.slice(0, 1) ?? 'A'}
            </div>
          )}
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-text-muted">
            Avaliação verificada
          </p>
          <h1 className="mt-1 text-2xl font-bold">{context?.barbershop.name}</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Conte como foi seu atendimento de {context?.serviceName.toLowerCase()}.
          </p>
        </div>

        {submitted ? (
          <div className="mt-8 rounded-2xl border border-success/30 bg-success/10 p-5 text-center">
            <CheckCircle className="mx-auto text-success" size={34} />
            <h2 className="mt-3 text-lg font-bold">Obrigado pela avaliação</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Seu depoimento ajuda o salão a melhorar e mostra confiança para novos clientes.
            </p>
            {context?.barbershop.googleReviewUrl && (
              <a
                href={context.barbershop.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-bg px-4 py-3 text-sm font-bold text-text-primary hover:border-accent"
              >
                Avaliar também no Google <ExternalLink size={16} />
              </a>
            )}
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            <div>
              <p className="mb-3 text-sm font-bold">Sua nota</p>
              <div className="flex justify-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} estrela${value > 1 ? 's' : ''}`}
                      onClick={() => setRating(value)}
                      className="rounded-xl p-2 text-warning outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <Star
                        size={34}
                        className={value <= rating ? 'fill-warning text-warning' : 'text-text-muted'}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-bold">Comentário opcional</span>
              <textarea
                value={comment}
                onChange={event => setComment(event.target.value.slice(0, MAX_COMMENT_LENGTH))}
                rows={4}
                maxLength={MAX_COMMENT_LENGTH}
                placeholder="Escreva em poucas palavras como foi sua experiência."
                className="mt-2 w-full resize-none rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
              <span className="mt-1 block text-right text-xs text-text-muted">
                {comment.length}/{MAX_COMMENT_LENGTH}
              </span>
            </label>

            {error && <SectionError message={error} />}

            <Button
              type="button"
              className="w-full"
              loading={submitting}
              disabled={rating < 1}
              onClick={() => void submit()}
            >
              Enviar avaliação
            </Button>
          </div>
        )}
      </section>
    </main>
  );
};

export default PublicReviewPage;
