import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  LuBuilding2 as Building2,
  LuChevronDown as ChevronDown,
  LuPlus as Plus,
  LuTrash2 as Trash2,
} from 'react-icons/lu';
import { organizationsApi, Organization } from '@/infra/organizationsApi';
import { OrganizationSchema, OrganizationFormData } from '@/schemas';
import { getErrorMessage } from '@/utils/errorMessage';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR } from '../ui/Field';

const primary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-50';
const secondary =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-bg px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2 disabled:opacity-50';

export function OrganizationsPanel() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(OrganizationSchema),
    defaultValues: { name: '', slug: '', logoUrl: '' },
  });
  const loadOrgs = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setOrgs(await organizationsApi.listMy());
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Não foi possível carregar as organizações.'));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadOrgs();
  }, [loadOrgs]);
  async function handleCreate(data: OrganizationFormData) {
    setError('');
    try {
      const org = await organizationsApi.create({
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl || undefined,
      });
      setOrgs(prev => [org, ...prev]);
      setShowCreate(false);
      reset();
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível criar a organização.'));
    }
  }
  async function handleDelete(id: string) {
    if (deleting || !confirm('Excluir organização?')) return;
    setDeleting(true);
    setError('');
    try {
      await organizationsApi.delete(id);
      setOrgs(prev => prev.filter(org => org.id !== id));
      setSelected(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível excluir a organização.'));
    } finally {
      setDeleting(false);
    }
  }
  return (
    <section className="space-y-6 text-text-primary" aria-labelledby="organizations-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 id="organizations-title" className="text-xl font-bold">
            Organizações
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Reúna seus salões e acompanhe as unidades de cada organização.
          </p>
        </div>
        {!showCreate && (
          <button
            type="button"
            onClick={() => {
              setError('');
              setShowCreate(true);
            }}
            className={primary}
          >
            <Plus size={18} /> Nova organização
          </button>
        )}
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
        >
          {error}
        </p>
      )}
      {showCreate && (
        <form
          onSubmit={handleSubmit(handleCreate)}
          noValidate
          className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Building2 size={22} />
            </div>
            <div>
              <h4 className="font-semibold">Nova organização</h4>
              <p className="mt-1 text-sm text-text-secondary">
                Comece pelo nome e pelo identificador da sua organização.
              </p>
            </div>
          </div>
          <fieldset disabled={isSubmitting} className="grid min-w-0 gap-5 sm:grid-cols-2">
            <Field label="Nome da organização" error={errors.name?.message}>
              <input
                autoFocus
                autoComplete="organization"
                placeholder="Ex.: Grupo Aurora"
                className={errors.name ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                aria-invalid={!!errors.name}
                {...register('name')}
              />
            </Field>
            <Field
              label="Identificador"
              hint="Um nome curto. Ex.: grupo-aurora."
              error={errors.slug?.message}
            >
              <input
                placeholder="grupo-aurora"
                autoCapitalize="none"
                spellCheck={false}
                className={errors.slug ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                aria-invalid={!!errors.slug}
                {...register('slug')}
              />
            </Field>
            <Field
              label="URL do logo (opcional)"
              className="block sm:col-span-2"
              error={errors.logoUrl?.message}
            >
              <input
                type="url"
                placeholder="https://exemplo.com/logo.png"
                className={errors.logoUrl ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                aria-invalid={!!errors.logoUrl}
                {...register('logoUrl')}
              />
            </Field>
          </fieldset>
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setShowCreate(false);
                setError('');
                reset();
              }}
              className={secondary}
            >
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className={primary}>
              {isSubmitting ? 'Criando…' : 'Criar organização'}
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <p role="status" className="py-8 text-sm text-text-secondary">
          Carregando organizações…
        </p>
      ) : loadError ? (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-5">
          <p className="mb-3 text-sm text-danger">{loadError}</p>
          <button type="button" onClick={() => void loadOrgs()} className={secondary}>
            Tentar novamente
          </button>
        </div>
      ) : orgs.length === 0 ? (
        !showCreate && (
          <div className="rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-12 text-center">
            <Building2 size={32} className="mx-auto mb-4 text-text-muted" />
            <h4 className="font-semibold">Sua primeira organização começa aqui</h4>
            <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
              Crie uma organização para reunir seus salões em um só lugar.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {orgs.map(org => (
            <article
              key={org.id}
              className={`overflow-hidden rounded-2xl border bg-surface ${selected === org.id ? 'border-accent/50' : 'border-border'}`}
            >
              <button
                type="button"
                aria-expanded={selected === org.id}
                onClick={() => setSelected(selected === org.id ? null : org.id)}
                className="flex w-full items-center gap-3 p-5 text-left hover:bg-surface-2"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Building2 size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words font-semibold">{org.name}</span>
                  <span className="mt-1 block break-all text-xs text-text-muted">/{org.slug}</span>
                </span>
                <span className="shrink-0 text-xs text-text-secondary">
                  {org.barbershops?.length ?? 0} salões
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-text-muted ${selected === org.id ? 'rotate-180' : ''}`}
                />
              </button>
              {selected === org.id && (
                <div className="mx-5 flex flex-wrap items-center justify-between gap-3 border-t border-border py-4">
                  <p className="text-sm text-text-secondary">{org.members?.length ?? 0} membros</p>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => void handleDelete(org.id)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-danger/30 px-3 py-2 text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {deleting ? 'Excluindo…' : 'Excluir organização'}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
