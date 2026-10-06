import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams } from 'react-router-dom';
import {
  LuCircleAlert as AlertCircle,
  LuCircleCheck as CheckCircle,
  LuLoaderCircle as Loader2,
} from 'react-icons/lu';
import { Button } from '../components/ui/Button';
import { SectionError } from '../components/patterns/states/SectionError';
import { npsApi, NpsSurveyPublic } from '../infra/npsApi';
import { getErrorMessage } from '../utils/errorMessage';

const MAX_COMMENT_LENGTH = 500;

const answerSchema = z.object({
  score: z
    .number({ required_error: 'Selecione uma nota de 0 a 10.' })
    .int()
    .min(0)
    .max(10),
  comment: z.string().trim().max(MAX_COMMENT_LENGTH).optional(),
  lgpdAccepted: z.boolean().refine(value => value === true, {
    message: 'Autorize o uso dos seus dados para enviar a resposta.',
  }),
});

type AnswerForm = z.infer<typeof answerSchema>;

const PUBLIC_ERROR_TITLES: Record<string, string> = {
  ANSWERED: 'Pesquisa já respondida',
  EXPIRED: 'Pesquisa expirada',
};

const PublicNpsPage: React.FC = () => {
  const { surveyId = '' } = useParams();
  const [survey, setSurvey] = React.useState<NpsSurveyPublic | null>(null);
  const [loading, setLoading] = React.useState(Boolean(surveyId));
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(
    surveyId ? null : 'Link da pesquisa ausente ou inválido.',
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AnswerForm>({
    resolver: zodResolver(answerSchema),
    defaultValues: { lgpdAccepted: false },
  });
  // Espelho local da nota (evita watch(), incompatível com o React Compiler).
  const [score, setScore] = React.useState<number | undefined>(undefined);

  const pickScore = (value: number) => {
    setScore(value);
    setValue('score', value, { shouldValidate: true });
  };

  React.useEffect(() => {
    if (!surveyId) return;
    npsApi
      .getSurvey(surveyId)
      .then(response => setSurvey(response.data))
      .catch(err => setError(getErrorMessage(err, 'Não foi possível abrir esta pesquisa.')))
      .finally(() => setLoading(false));
  }, [surveyId]);

  const unavailable =
    survey && survey.status !== 'PENDING'
      ? PUBLIC_ERROR_TITLES[survey.status] ?? 'Pesquisa indisponível'
      : null;

  const onSubmit = async (data: AnswerForm) => {
    setSubmitting(true);
    setError(null);
    try {
      await npsApi.answer(surveyId, {
        score: data.score,
        comment: data.comment?.trim() ? data.comment.trim() : undefined,
        lgpdAccepted: true,
      });
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível enviar sua resposta.'));
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

  if (error && !survey) {
    return (
      <main className="min-h-screen bg-bg text-text-primary px-4 py-10 flex items-center justify-center">
        <section className="w-full max-w-md rounded-2xl border border-danger/30 bg-surface p-6 text-center">
          <AlertCircle className="mx-auto text-danger" size={34} />
          <h1 className="mt-4 text-xl font-bold">Pesquisa indisponível</h1>
          <p className="mt-2 text-sm text-text-secondary">{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-text-primary px-4 py-10">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Pesquisa NPS
          </p>
          <h1 className="mt-1 text-2xl font-bold">{survey?.shopName}</h1>
          <p className="mt-2 text-sm text-text-secondary">
            De 0 a 10, quão provável é você nos indicar para um amigo?
          </p>
          {survey && (
            <p className="mt-1 text-xs text-text-muted">
              Resposta anônima para {survey.destinationMasked}
            </p>
          )}
        </div>

        {submitted ? (
          <div className="mt-8 rounded-2xl border border-success/30 bg-success/10 p-5 text-center">
            <CheckCircle className="mx-auto text-success" size={34} />
            <h2 className="mt-3 text-lg font-bold">Obrigado pela resposta</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Seu feedback ajuda {survey?.shopName} a melhorar cada atendimento.
            </p>
          </div>
        ) : unavailable ? (
          <div className="mt-8 rounded-2xl border border-warning/30 bg-warning/10 p-5 text-center">
            <AlertCircle className="mx-auto text-warning" size={34} />
            <h2 className="mt-3 text-lg font-bold">{unavailable}</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Este link não aceita mais respostas.
            </p>
          </div>
        ) : (
          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div>
              <p className="mb-3 text-sm font-bold">Sua nota</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {Array.from({ length: 11 }).map((_, value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Nota ${value}`}
                    onClick={() => pickScore(value)}
                    className={`h-9 w-9 rounded-lg border text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus ${
                      score === value
                        ? 'border-accent bg-accent text-white'
                        : 'border-border bg-bg text-text-secondary hover:border-accent'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              {errors.score && (
                <p className="mt-2 text-center text-xs text-danger">
                  {errors.score.message}
                </p>
              )}
            </div>

            <label className="block">
              <span className="text-sm font-bold">Comentário opcional</span>
              <textarea
                {...register('comment')}
                rows={3}
                maxLength={MAX_COMMENT_LENGTH}
                placeholder="Conte em poucas palavras como foi sua experiência."
                className="mt-2 w-full resize-none rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
            </label>

            <label className="flex items-start gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                {...register('lgpdAccepted')}
                className="mt-1 h-4 w-4 accent-[var(--color-accent,#6d28d9)]"
              />
              <span>
                Autorizo o uso dos meus dados para registrar esta resposta, conforme
                a LGPD. A resposta é vinculada ao seu número de forma anônima.
              </span>
            </label>
            {errors.lgpdAccepted && (
              <p className="text-xs text-danger">{errors.lgpdAccepted.message}</p>
            )}

            {error && <SectionError message={error} />}

            <Button type="submit" className="w-full" loading={submitting}>
              Enviar resposta
            </Button>
          </form>
        )}
      </section>
    </main>
  );
};

export default PublicNpsPage;
