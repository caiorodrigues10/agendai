import React, { useEffect, useId, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LuSearch, LuSlidersHorizontal, LuX } from 'react-icons/lu';
import { Button } from '../../components/ui/Button';
import { Field, FIELD_CONTROL } from '../../components/ui/Field';
import { SmartSelect } from '../../components/ui/SmartSelect';
import type { AuditFacets, AuditFilterValues } from '../../infra/adminAuditApi';
import { auditResourceLabel } from './auditPresentation';

const filterSchema = z
  .object({
    q: z.string().trim(),
    action: z.string().trim(),
    resource: z.string(),
    userId: z.string(),
    shopId: z.string(),
    from: z.string(),
    to: z.string(),
  })
  .refine(values => !values.from || !values.to || values.from <= values.to, {
    path: ['to'],
    message: 'A data final deve ser igual ou posterior à data inicial.',
  });
type FilterKey = keyof AuditFilterValues;
const dateInput = (date: Date): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
const filterNames: Record<FilterKey, string> = {
  q: 'Busca',
  action: 'Ação',
  resource: 'Recurso',
  userId: 'Usuário',
  shopId: 'Salão',
  from: 'De',
  to: 'Até',
};
interface AuditFiltersProps {
  values: AuditFilterValues;
  facets: AuditFacets;
  busy: boolean;
  onApply: (values: AuditFilterValues) => void;
  onClear: () => void;
  onRemove: (key: FilterKey) => void;
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  values,
  facets,
  busy,
  onApply,
  onClear,
  onRemove,
}) => {
  const id = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const advancedCount = Object.entries(values).filter(
    ([key, value]) => key !== 'q' && value
  ).length;
  const [expanded, setExpanded] = useState(advancedCount > 0);
  const {
    register,
    control,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<AuditFilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: values,
  });
  const { q, action, resource, userId, shopId, from, to } = values;
  useEffect(() => {
    reset({ q, action, resource, userId, shopId, from, to });
  }, [q, action, resource, userId, shopId, from, to, reset]);
  const { ref: registerSearch, ...searchProps } = register('q');
  const active = (Object.entries(values) as [FilterKey, string][]).filter(([, value]) => value);
  const applyPeriod = (days: number | null) => {
    const today = dateInput(new Date());
    const start = new Date(`${today}T12:00:00.000Z`);
    if (days) start.setUTCDate(start.getUTCDate() - days + 1);
    setValue('from', days ? dateInput(start) : '');
    setValue('to', days ? today : '');
    void handleSubmit(onApply, () => setExpanded(true))();
  };
  const periodSelected = (days: number | null): boolean => {
    if (days === null) return !values.from && !values.to;
    const today = dateInput(new Date());
    const start = new Date(`${today}T12:00:00.000Z`);
    start.setUTCDate(start.getUTCDate() - days + 1);
    return values.from === dateInput(start) && values.to === today;
  };
  const chipValue = (key: FilterKey, value: string): string => {
    if (key === 'userId')
      return facets.users.find(user => user.id === value)?.name ?? 'Usuário selecionado';
    if (key === 'shopId')
      return facets.shops.find(shop => shop.id === value)?.name ?? 'Salão selecionado';
    if (key === 'resource') return auditResourceLabel(value);
    if (key === 'from' || key === 'to') return value.split('-').reverse().join('/');
    return value;
  };

  return (
    <div className="space-y-4 border-b border-border px-4 py-5 sm:px-6">
      <form
        aria-label="Filtros da auditoria"
        onSubmit={handleSubmit(onApply, () => setExpanded(true))}
      >
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Busca" className="min-w-0 basis-full sm:basis-64 sm:flex-1">
            <span className="relative block">
              <LuSearch
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                {...searchProps}
                ref={node => {
                  registerSearch(node);
                  searchRef.current = node;
                }}
                type="search"
                placeholder="Ação, recurso ou detalhes"
                className={`${FIELD_CONTROL} min-h-11 pl-11`}
              />
            </span>
          </Field>
          <Button
            variant="secondary"
            aria-expanded={expanded}
            aria-controls={`${id}-advanced`}
            onClick={() => setExpanded(value => !value)}
            className="flex-1 sm:flex-none"
          >
            <LuSlidersHorizontal size={17} aria-hidden="true" />
            Filtros
            {advancedCount > 0 && (
              <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-xs text-accent">
                {advancedCount}
              </span>
            )}
          </Button>
          <Button type="submit" className="flex-1 sm:flex-none" disabled={busy}>
            <LuSearch size={17} aria-hidden="true" />
            Filtrar
          </Button>
        </div>
        <div id={`${id}-advanced`} hidden={!expanded} className="mt-5">
          <fieldset className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <legend className="sr-only">Filtros avançados</legend>
            <Field label="Ação" hint="Evento ou método HTTP, como PATCH.">
              <input
                {...register('action')}
                placeholder="Ex.: BLOCK_ENTITY ou PATCH"
                className={FIELD_CONTROL}
              />
            </Field>
            <Controller
              name="resource"
              control={control}
              render={({ field }) => (
                <SmartSelect
                  label="Recurso"
                  aria-label="Recurso"
                  options={facets.resources.map(resource => ({
                    value: resource,
                    label: auditResourceLabel(resource),
                    keywords: [resource],
                  }))}
                  value={field.value || null}
                  onChange={value => field.onChange(value ?? '')}
                  placeholder="Todos os recursos"
                  searchable
                />
              )}
            />
            <Controller
              name="userId"
              control={control}
              render={({ field }) => (
                <SmartSelect
                  label="Usuário"
                  aria-label="Usuário"
                  options={facets.users.map(user => ({
                    value: user.id,
                    label: user.name,
                    description: user.email,
                    keywords: [user.email],
                  }))}
                  value={field.value || null}
                  onChange={value => field.onChange(value ?? '')}
                  placeholder="Todos os usuários"
                  searchable
                />
              )}
            />
            <Controller
              name="shopId"
              control={control}
              render={({ field }) => (
                <SmartSelect
                  label="Salão"
                  aria-label="Salão"
                  options={facets.shops.map(shop => ({ value: shop.id, label: shop.name }))}
                  value={field.value || null}
                  onChange={value => field.onChange(value ?? '')}
                  placeholder="Todos os salões"
                  searchable
                />
              )}
            />
            <Field label="De">
              <input {...register('from')} type="date" className={FIELD_CONTROL} />
            </Field>
            <Field label="Até" error={errors.to?.message}>
              <input
                {...register('to')}
                type="date"
                aria-invalid={!!errors.to}
                aria-describedby={errors.to ? `${id}-date-error` : undefined}
                className={FIELD_CONTROL}
              />
              {errors.to && (
                <span id={`${id}-date-error`} className="sr-only">
                  {errors.to.message}
                </span>
              )}
            </Field>
          </fieldset>
        </div>
      </form>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className="mr-1 text-xs font-medium text-text-secondary">Período</span>
        {(
          [
            { label: 'Todo o período', days: null },
            { label: 'Hoje', days: 1 },
            { label: 'Últimos 7 dias', days: 7 },
            { label: 'Últimos 30 dias', days: 30 },
          ] as const
        ).map(period => (
          <button
            key={period.label}
            type="button"
            aria-pressed={periodSelected(period.days)}
            disabled={busy}
            onClick={() => applyPeriod(period.days)}
            className={`min-h-11 rounded-lg px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50 ${periodSelected(period.days) ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'}`}
          >
            {period.label}
          </button>
        ))}
      </div>
      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Filtros aplicados">
          {active.map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onRemove(key);
                searchRef.current?.focus();
              }}
              aria-label={`Remover filtro ${filterNames[key]}: ${chipValue(key, value)}`}
              className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl border border-accent/25 bg-accent/5 px-3 text-xs text-text-primary outline-none transition-colors hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-focus"
            >
              <span className="truncate">
                <span className="text-text-secondary">{filterNames[key]}:</span>{' '}
                {chipValue(key, value)}
              </span>
              <LuX size={14} className="shrink-0" aria-hidden="true" />
            </button>
          ))}
          <Button
            variant="ghost"
            onClick={() => {
              onClear();
              searchRef.current?.focus();
            }}
            className="text-xs"
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
};
