import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category } from '../../infra/categoriesApi';
import { useCategories } from '../../hooks/useCategories';
import { CategorySchema, CategoryFormData } from '../../schemas';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL } from '../ui/Field';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface Props {
  title: string;
  linkedLabel: string;
  state: ReturnType<typeof useCategories>;
  onChanged: (id: string, category: Category | null) => void;
}

const button = 'min-h-10 rounded-lg border border-border px-3 text-sm text-text-secondary hover:bg-surface-2 disabled:opacity-50';

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
  return <section className="mb-4 border-y border-border py-3">
    <button type="button" className={button} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{title}</button>
    {expanded && <div className="mt-3 space-y-3">
      {state.loading ? <p role="status" className="text-sm text-text-muted">Carregando categorias…</p> : state.error ?
        <div role="alert" className="text-sm text-danger">{state.error} <button type="button" className={button} onClick={() => void state.reload()}>Tentar novamente</button></div> : <>
          {!state.categories.length && <p className="text-sm text-text-muted">Nenhuma categoria cadastrada.</p>}
          <ul className="divide-y divide-border">{state.categories.map(category => <li key={category.id} className="flex items-center justify-between gap-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-sm text-text-primary"><span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full bg-text-muted" style={category.color ? { backgroundColor: category.color } : undefined} />{category.name}</span>
            {state.canEdit(category) && <div className="flex shrink-0 gap-2">
              <button type="button" disabled={busy} className={button} aria-label={`Editar ${category.name}`} onClick={() => start(category)}>Editar</button>
              <button type="button" disabled={busy} className={button} aria-label={`Excluir ${category.name}`} onClick={() => { setError(null); setDeleting(category); }}>Excluir</button>
            </div>}
          </li>)}</ul>
          {state.canCreate && !editing && <button type="button" className={button} onClick={() => start('new')}>Nova categoria</button>}
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
