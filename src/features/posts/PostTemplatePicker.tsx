import React, { useMemo, useState } from 'react';
import { LuCheck as Check, LuLoaderCircle as Loader2 } from 'react-icons/lu';
import type { PostFormat, PostTemplateDef } from '../../infra/postsApi';
import { TemplateThumbnail } from './TemplateThumbnail';

const CATEGORY_LABELS: Record<string, string> = {
  agenda: 'Agenda', ofertas: 'Ofertas', resultados: 'Resultados', equipe: 'Equipe',
  depoimentos: 'Depoimentos', editorial: 'Editorial', tipografia: 'Tipografia', outros: 'Outros',
};

interface PostTemplatePickerProps {
  templates: PostTemplateDef[];
  selectedKey: string;
  barbershopId: string;
  format: PostFormat;
  paletteKey: string;
  loading?: boolean;
  error?: string | null;
  onRetry: () => void;
  onSelect: (template: PostTemplateDef) => void;
  recommendedTemplateKey?: string;
}

export function PostTemplatePicker({ templates, selectedKey, barbershopId, format, paletteKey,
  loading, error, onRetry, onSelect, recommendedTemplateKey }: PostTemplatePickerProps) {
  const [category, setCategory] = useState('all');
  const [photoFilter, setPhotoFilter] = useState('all');
  const [business, setBusiness] = useState('recommended');
  const hasRecommendations = templates.some(template => template.recommended);
  const businessLabels = { barbearia: 'Barbearias', salao: 'Salões', beleza: 'Beleza e estética' };
  const groups = useMemo(() => Array.from(new Set(templates.map(template => template.group || 'outros'))), [templates]);
  const visibleTemplates = useMemo(() => templates.filter(template => {
    const photoMode = template.photoMode ?? (template.requiredMedia ? 'required' : 'none');
    return (category === 'all' || (template.group || 'outros') === category)
      && (business === 'all' || (business === 'recommended' ? !hasRecommendations || template.recommended : template.businessCategory === business))
      && (photoFilter === 'all' || (photoFilter === 'no-photo' ? photoMode === 'none' : photoMode !== 'none'));
  }), [templates, category, photoFilter, business, hasRecommendations]);
  const label = (group: string) => CATEGORY_LABELS[group] ?? group;
  const filterClass = (active: boolean) => `min-h-11 rounded-lg border px-3 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${active ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:border-accent/50'}`;

  if (loading) return <div role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-text-muted"><Loader2 size={16} className="animate-spin" aria-hidden />Carregando modelos…</div>;
  if (error) return <div className="rounded-xl border border-danger/40 p-4 text-sm"><p role="alert" className="text-danger">{error}</p><button type="button" onClick={onRetry} className="mt-2 min-h-11 font-semibold text-accent">Tentar carregar modelos novamente</button></div>;
  if (!templates.length) return <div className="p-4 text-sm text-text-muted"><p>Nenhum modelo disponível.</p><button type="button" onClick={onRetry} className="min-h-11 font-semibold text-accent">Recarregar modelos</button></div>;

  return (
    <div className="space-y-4">
      {templates[0]?.contextLabel && <p className="rounded-xl bg-accent/10 p-3 text-sm text-text-primary">Perfil cadastrado: {templates[0].contextLabel}. As recomendações seguem esse perfil.</p>}
      <div role="group" aria-label="Tipo de estabelecimento" className="flex flex-wrap gap-2">
        {hasRecommendations && <button type="button" aria-pressed={business === 'recommended'} onClick={() => setBusiness('recommended')} className={filterClass(business === 'recommended')}>Para meu negócio</button>}
        <button type="button" aria-pressed={business === 'all' || (!hasRecommendations && business === 'recommended')} onClick={() => setBusiness('all')} className={filterClass(business === 'all' || (!hasRecommendations && business === 'recommended'))}>Todos os negócios</button>
        {Object.entries(businessLabels).filter(([key]) => templates.some(template => template.businessCategory === key)).map(([key, text]) => <button key={key} type="button" aria-pressed={business === key} onClick={() => setBusiness(key)} className={filterClass(business === key)}>{text}</button>)}
      </div>
      <div role="group" aria-label="Categorias de modelos" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')} className={filterClass(category === 'all')}>Todas as categorias</button>
        {groups.map(group => <button key={group} type="button" aria-pressed={category === group} onClick={() => setCategory(group)} className={filterClass(category === group)}>{label(group)}</button>)}
      </div>
      <div role="group" aria-label="Uso de fotos" className="flex flex-wrap gap-2">
        {[['all', 'Todos'], ['with-photo', 'Com foto'], ['no-photo', 'Sem foto']].map(([key, text]) => <button key={key} type="button" aria-pressed={photoFilter === key} onClick={() => setPhotoFilter(key)} className={filterClass(photoFilter === key)}>{text}</button>)}
      </div>
      <p role="status" className="text-xs text-text-muted">{visibleTemplates.length} modelo(s) disponível(is). Escolha uma arte para personalizar.</p>
      {visibleTemplates.length === 0 ? (
        <div className="rounded-xl border border-border p-4 text-sm text-text-muted">
          <p>Nenhum modelo nesta combinação de filtros.</p>
          <button type="button" onClick={() => { setCategory('all'); setPhotoFilter('all'); setBusiness('all'); }} className="min-h-11 font-semibold text-accent">Limpar filtros</button>
        </div>
      ) : groups.filter(group => category === 'all' || group === category).map(group => {
        const items = visibleTemplates.filter(template => (template.group || 'outros') === group)
          .sort((a, b) => Number(b.key === recommendedTemplateKey) - Number(a.key === recommendedTemplateKey));
        if (!items.length) return null;
        return <section key={group} aria-label={`Modelos de ${label(group)}`} className="space-y-2">
          <h5 className="text-sm font-bold text-text-primary">{label(group)}</h5>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map(template => {
              const selected = template.key === selectedKey;
              const photoMode = template.photoMode ?? (template.requiredMedia ? 'required' : 'none');
              return <div key={template.key} className={`relative overflow-hidden rounded-xl border ${selected ? 'border-accent bg-accent/10' : 'border-border bg-bg'}`}>
                <TemplateThumbnail barbershopId={barbershopId} templateKey={template.key} format={format} paletteKey={paletteKey} alt={`Prévia do modelo ${template.name}`} />
                <button type="button" aria-label={`Selecionar modelo ${template.name}`} aria-pressed={selected} onClick={() => onSelect(template)} className="absolute inset-0 z-10 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent" />
                {selected && <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-accent p-1 text-accent-fg"><Check size={14} aria-hidden /><span className="sr-only">Selecionado</span></span>}
                <div className="space-y-1 p-3">
                  <p className="text-sm font-bold text-text-primary">{template.name}</p>
                  {template.key === recommendedTemplateKey && <p className="text-xs font-semibold text-accent">Recomendado para seu objetivo</p>}
                  <p className="text-xs leading-relaxed text-text-muted">{template.description}</p>
                  <p className="text-xs font-semibold text-text-secondary">{photoMode === 'none' ? 'Sem foto' : photoMode === 'required' ? `Requer ${template.requiredMedia} foto(s)` : 'Foto opcional'}</p>
                </div>
              </div>;
            })}
          </div>
        </section>;
      })}
    </div>
  );
}
