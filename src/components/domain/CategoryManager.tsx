import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category } from '../../infra/categoriesApi';
import { useCategories } from '../../hooks/useCategories';
import { CategorySchema, CategoryFormData } from '../../schemas';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL } from '../ui/Field';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { RiAddLine, RiArrowDownSLine, RiDeleteBin6Line, RiFolder3Line, RiPencilLine } from 'react-icons/ri';

interface Props {
  title: string;
  linkedLabel: string;
  state: ReturnType<typeof useCategories>;
  onChanged: (id: string, category: Category | null) => void;
}

const button = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-bg px-3 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50';

export function CategoryManager({ title, linkedLabel, state, onChanged }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, reset, setValue, handleSubmit, formState: { errors } } = useForm<CategoryFormData>({ resolver: zodResolver(CategorySchema) });
  const start = (category: Category | 'new') => {
    reset(category === 'new' ? { name: '', color: '' } : { name: category.name, color: category.color || '' });
    setError(null);
    setEditing(category);
  };
  const save = async (data: CategoryFormData) => {
    if (busy || !editing || (editing === 'new' ? !state.canCreate : !state.canEdit(editing))) return;
    setBusy(true);
    setError(null);
    try {
      const payload = { name: data.name, color: data.color || null };
      const category = editing === 'new'
        ? await state.api.create({ ...payload, ...(state.barbershopId ? { barbershopId: state.barbershopId } : {}) })
        : await state.api.update(editing.id, payload);
      state.changed(category.id, category);
      onChanged(category.id, category);
      setEditing(null);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (!deleting || busy || !state.canEdit(deleting)) return;
    setBusy(true);
    setError(null);
    try {
      await state.api.delete(deleting.id);
      state.changed(deleting.id, null);
      onChanged(deleting.id, null);
      setDeleting(null);
    } catch (err) { setDeleting(null); setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  return <section className="mb-5 overflow-hidden rounded-2xl border border-border bg-surface">
    <button type="button" className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent sm:px-5" aria-label={title} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-selection text-accent"><RiFolder3Line size={20} aria-hidden="true" /></span>
      <span className="min-w-0 flex-1"><span className="block font-semibold text-text-primary">{title}</span><span className="block text-xs text-text-muted">Organize seus registros por categoria</span></span>
      {!state.loading && !state.error && <span className="rounded-full border border-border bg-bg px-2.5 py-1 text-xs text-text-secondary">{state.categories.length}</span>}
      <RiArrowDownSLine size={20} aria-hidden="true" className={`shrink-0 text-text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>
    {expanded && <div className="space-y-4 border-t border-border px-4 py-4 sm:px-5">
      {state.loading ? <p role="status" className="text-sm text-text-muted">Carregando categorias…</p> : state.error ?
        <div role="alert" className="text-sm text-danger">{state.error} <button type="button" className={button} onClick={() => void state.reload()}>Tentar novamente</button></div> : <>
          {!state.categories.length && <div className="rounded-xl border border-dashed border-border bg-bg px-4 py-7 text-center"><p className="text-sm font-medium text-text-primary">Nenhuma categoria cadastrada.</p><p className="mt-1 text-xs text-text-muted">Crie uma categoria para organizar seus registros.</p></div>}
          <ul className="space-y-2">{state.categories.map(category => <li key={category.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-bg px-3 py-2.5 sm:px-4">
            <span className="flex min-w-0 flex-1 items-center gap-3 break-words text-sm font-medium text-text-primary"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2"><span aria-hidden="true" className="h-3 w-3 rounded-full bg-text-muted" style={category.color ? { backgroundColor: category.color } : undefined} /></span>{category.name}</span>
            {state.canEdit(category) && <div className="flex shrink-0 gap-1.5">
              <button type="button" disabled={busy} className={button} aria-label={`Editar ${category.name}`} onClick={() => start(category)}><RiPencilLine size={16} aria-hidden="true" /> <span className="hidden sm:inline">Editar</span></button>
              <button type="button" disabled={busy} className={`${button} hover:border-danger/30 hover:bg-danger/10 hover:text-danger`} aria-label={`Excluir ${category.name}`} onClick={() => { setError(null); setDeleting(category); }}><RiDeleteBin6Line size={16} aria-hidden="true" /><span className="hidden sm:inline">Excluir</span></button>
            </div>}
          </li>)}</ul>
          {state.canCreate && !editing && <button type="button" className={button} onClick={() => start('new')}><RiAddLine size={18} aria-hidden="true" /> Nova categoria</button>}
        </>}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {editing && <form onSubmit={handleSubmit(save)} className="space-y-3 border-t border-border pt-3">
        <fieldset disabled={busy} className="flex flex-wrap items-start gap-3">
          <Field label="Nome da categoria" error={errors.name?.message} className="min-w-0 flex-1"><input autoFocus className={FIELD_CONTROL} {...register('name')} /></Field>
          <Field label="Cor" error={errors.color?.message}><input type="color" className="h-11 w-16 rounded border border-border bg-bg" {...register('color')} /></Field>
          <button type="button" className={button} onClick={() => setValue('color', '')}>Sem cor</button>
        </fieldset>
        <div className="flex gap-2"><button disabled={busy} className={button} type="submit">{busy ? 'Salvando…' : 'Salvar categoria'}</button><button disabled={busy} type="button" className={button} onClick={() => setEditing(null)}>Cancelar</button></div>
      </form>}
    </div>}
    <ConfirmDialog open={!!deleting} title="Excluir categoria" message={`Excluir “${deleting?.name}”? ${linkedLabel} serão mantidos sem categoria.`} confirmLabel="Excluir categoria" variant="danger" loading={busy} onConfirm={() => void remove()} onCancel={() => { if (!busy) setDeleting(null); }} />
  </section>;
}
