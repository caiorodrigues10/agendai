import React, { useEffect, useState } from 'react';
import {
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Send,
} from 'lucide-react';
import { reputationApi, ReputationStats, Review } from '../../infra/reputationApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';

const sentimentIcon = (s: string) => {
  if (s === 'positive') return <ThumbsUp size={12} className="text-success" />;
  if (s === 'negative') return <ThumbsDown size={12} className="text-error" />;
  return <Minus size={12} className="text-text-muted" />;
};

export const ReputationPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();
  const [stats, setStats] = useState<ReputationStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!barbershopId) return;
    setLoading(true);
    Promise.all([
      reputationApi.getStats(barbershopId),
      reputationApi.listReviews(barbershopId, sentimentFilter ? { sentiment: sentimentFilter } : undefined),
    ])
      .then(([s, r]) => { setStats(s); setReviews(r); })
      .catch(err => setError(getErrorMessage(err, 'Erro ao carregar reputação.')))
      .finally(() => setLoading(false));
  }, [barbershopId, sentimentFilter]);

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const resp = await reputationApi.respondToReview(reviewId, responseText.trim());
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, response: resp } : r));
      setRespondingTo(null);
      setResponseText('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao responder.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">Reputação</h3>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-bold text-accent">{stats.averageRating.toFixed(1)}</p>
            <p className="text-xs text-text-muted">Média</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">{stats.totalReviews}</p>
            <p className="text-xs text-text-muted">Avaliações</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-bold text-success">{stats.sentimentBreakdown.positive}</p>
            <p className="text-xs text-text-muted">Positivas</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-bold text-error">{stats.sentimentBreakdown.negative}</p>
            <p className="text-xs text-text-muted">Negativas</p>
          </div>
        </div>
      )}

      {stats && stats.ratingDistribution && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-2">
          <p className="text-xs font-bold text-text-secondary">Distribuição</p>
          {[5, 4, 3, 2, 1].map(n => {
            const count = stats.ratingDistribution[n] || 0;
            const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-2">
                <span className="w-3 text-xs text-text-muted">{n}</span>
                <Star size={12} className="text-warning" />
                <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-xs text-text-muted">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {['', 'positive', 'neutral', 'negative'].map(s => (
          <button
            key={s}
            onClick={() => setSentimentFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
              sentimentFilter === s ? 'bg-accent text-accent-fg' : 'bg-surface text-text-secondary hover:bg-surface-2'
            }`}
          >
            {s === '' ? 'Todos' : s === 'positive' ? 'Positivos' : s === 'neutral' ? 'Neutros' : 'Negativos'}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <MessageSquare size={32} className="mx-auto text-text-muted" />
          <p className="mt-2 text-sm text-text-secondary">Nenhuma avaliação encontrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map(review => (
            <div key={review.id} className="rounded-2xl border border-border bg-surface p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary">{review.clientName}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < review.rating ? 'text-warning fill-warning' : 'text-text-muted'}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {sentimentIcon(review.sentiment || '')}
                  <span className="text-[10px] text-text-muted">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              {review.comment && <p className="text-xs text-text-secondary">{review.comment}</p>}

              {review.response ? (
                <div className="ml-4 rounded-xl bg-surface-2 p-3">
                  <p className="text-[10px] font-bold text-text-muted">Resposta</p>
                  <p className="text-xs text-text-secondary">{review.response.message}</p>
                </div>
              ) : respondingTo === review.id ? (
                <div className="ml-4 space-y-2">
                  <textarea
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    rows={2}
                    placeholder="Sua resposta..."
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleRespond(review.id)}
                      disabled={submitting || !responseText.trim()}
                      className="flex items-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-accent-fg disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={12} /> : <Send size={12} />}
                      Enviar
                    </button>
                    <button
                      onClick={() => { setRespondingTo(null); setResponseText(''); }}
                      className="rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setRespondingTo(review.id); setResponseText(''); }}
                  className="ml-4 text-xs font-bold text-accent hover:underline"
                >
                  Responder
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
