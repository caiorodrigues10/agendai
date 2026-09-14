import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientsApi } from '../../infra/clientsApi';
import { crmApi } from '../../infra/crmApi';
import { CrmMergeSchema } from '../../schemas';
import { SalonClient } from '../../types';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL } from '../ui/Field';
import { SmartSelect } from '../ui/SmartSelect';

export function CrmMergePanel({ onMerged }: { onMerged: (targetId: string) => void }) {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<SalonClient[]>([]);
  const [matches, setMatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const { control, register, watch, handleSubmit, reset, resetField, formState: { errors, isSubmitting, isValid } } = useForm<z.infer<typeof CrmMergeSchema>>({
    resolver: zodResolver(CrmMergeSchema), mode: 'onChange', defaultValues: { targetId: '', sourceIds: [] },
  });
  const targetId = watch('targetId');
  const sourceIds = watch('sourceIds');
  const selectionKey = JSON.stringify([targetId, ...sourceIds]);
  useEffect(() => { resetField('confirmation'); }, [selectionKey, resetField]);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const result = await clientsApi.list({ search: search.trim() || undefined, limit: 50, page: 1 });
        if (active) {
          setMatches(result.data.map(client => client.id));
          setClients(previous => [...new Map([...previous, ...result.data].map(client => [client.id, client])).values()]);
        }
      } catch (err) { if (active) setError(getErrorMessage(err)); }
      finally { if (active) setLoading(false); }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [search]);
  const label = (id: string) => {
    const client = clients.find(item => item.id === id);
    return client ? `${client.name} · ${client.whatsapp || 'Sem WhatsApp'}` : 'Cliente indisponível';
  };
  const options = clients.filter(client => matches.includes(client.id) || client.id === targetId || sourceIds.includes(client.id)).map(client => ({ value: client.id, label: label(client.id) }));
  const validSelection = !!targetId && sourceIds.length > 0 && !sourceIds.includes(targetId) && [targetId, ...sourceIds].every(id => clients.some(client => client.id === id));
  const submit = handleSubmit(async values => {
    if (lock.current || !validSelection) return;
    lock.current = true;
    setError('');
    try {
      await crmApi.mergeClients({ targetId: values.targetId, sourceIds: values.sourceIds });
      reset();
      setClients(previous => previous.filter(client => !values.sourceIds.includes(client.id)));
      onMerged(values.targetId);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { lock.current = false; }
  });
  return <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-surface p-4 text-sm text-text-primary">
    <h3 className="font-bold">Mesclar clientes duplicados</h3>
    <p className="text-text-secondary">Busque por nome ou WhatsApp. Até 50 resultados por busca; os selecionados são mantidos.</p>
    <Field label="Buscar cadastros"><input aria-label="Buscar cadastros" className={FIELD_CONTROL} value={search} onChange={event => setSearch(event.target.value)} disabled={isSubmitting} /></Field>
    <Controller name="targetId" control={control} render={({ field }) => <SmartSelect label="Cadastro principal" options={options.filter(option => !sourceIds.includes(option.value))} value={field.value || null} onChange={value => field.onChange(value || '')} loading={loading} disabled={isSubmitting} error={errors.targetId?.message} />} />
    <Controller name="sourceIds" control={control} render={({ field }) => <SmartSelect mode="multiple" label="Cadastros duplicados" options={options.filter(option => option.value !== targetId)} value={field.value} onChange={field.onChange} loading={loading} disabled={isSubmitting} error={errors.sourceIds?.message} />} />
    {validSelection && <div className="rounded-lg border border-border bg-bg p-3">
      <p><strong>Manter:</strong> {label(targetId)}</p>
      <p className="mt-2 font-semibold">Remover {sourceIds.length} cadastro(s):</p>
      <ul>{sourceIds.map(id => <li key={id}>{label(id)}</li>)}</ul>
      <p className="mt-2 text-text-secondary">Agendamentos, atendimentos, dívidas, pacotes, vendas e históricos serão transferidos. Os dados cadastrais do principal serão mantidos; os cadastros duplicados serão excluídos. Esta ação não pode ser desfeita pelo painel.</p>
    </div>}
    <Field label="Digite MESCLAR para confirmar" error={errors.confirmation?.message}><input aria-label="Digite MESCLAR para confirmar" className={FIELD_CONTROL} autoComplete="off" disabled={isSubmitting} {...register('confirmation')} /></Field>
    {error && <p role="alert" className="text-danger">{error}</p>}
    <button disabled={!isValid || !validSelection || isSubmitting} className="min-h-11 rounded-lg bg-accent px-4 font-bold text-accent-fg disabled:opacity-40">{isSubmitting ? 'Mesclando…' : 'Mesclar cadastros'}</button>
  </form>;
}
