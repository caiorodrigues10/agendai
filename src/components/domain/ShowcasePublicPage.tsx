import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Filter, CalendarDays, MessageCircle } from 'lucide-react';
import { showcaseApi, ShowcaseEntry } from '../../infra/showcaseApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { SmartSelect } from '../ui/SmartSelect';

export const ShowcasePublicPage: React.FC = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const [entries, setEntries] = useState<ShowcaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<ShowcaseEntry | null>(null);
  const [serviceFilter, setServiceFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');

  useEffect(() => {
    if (!salonId) return;
    setLoading(true);
    showcaseApi
      .getPublicShowcase(salonId)
      .then(setEntries)
      .catch(err => setError(getErrorMessage(err, 'Erro ao carregar showcase.')))
      .finally(() => setLoading(false));
  }, [salonId]);

  const services = [...new Set(entries.map(e => e.serviceName).filter(Boolean))];
  const staffMembers = [...new Set(entries.map(e => e.staffName).filter(Boolean))];

  const filtered = entries.filter(e => {
    if (serviceFilter && e.serviceName !== serviceFilter) return false;
    if (staffFilter && e.staffName !== staffFilter) return false;
    return true;
  });

  const handleTrackClick = (entry: ShowcaseEntry) => {
    setSelectedEntry(entry);
    void showcaseApi.trackEvent(entry.id, 'VIEW');
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-text-muted" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-8 text-center">
        <p className="text-sm text-error">{error}</p>
      </div>
    );
  }

  // Detail view
  if (selectedEntry) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-4">
        <button
          onClick={() => setSelectedEntry(null)}
          className="text-xs font-bold text-support hover:underline"
        >
          ← Voltar ao showcase
        </button>

        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {selectedEntry.mediaType?.startsWith('video') ? (
            <video
              src={selectedEntry.mediaUrl}
              controls
              className="w-full aspect-video object-cover"
              poster={selectedEntry.mediaUrl}
            >
              <track kind="captions" label="Português" srcLang="pt-BR" />
            </video>
          ) : (
            <img
              src={selectedEntry.mediaUrl}
              alt={selectedEntry.altText || selectedEntry.title}
              className="w-full aspect-video object-cover"
            />
          )}

          <div className="p-5 space-y-3">
            <h2 className="text-xl font-bold text-text-primary">{selectedEntry.title}</h2>
            {selectedEntry.description && (
              <p className="text-sm text-text-secondary">{selectedEntry.description}</p>
            )}

            {selectedEntry.serviceName && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <CalendarDays size={14} />
                {selectedEntry.serviceName}
                {selectedEntry.servicePrice != null && (
                  <span className="font-bold text-text-primary">R$ {(selectedEntry.servicePrice / 100).toFixed(2)}</span>
                )}
                {selectedEntry.serviceDuration != null && (
                  <span className="text-text-muted">· {selectedEntry.serviceDuration}min</span>
                )}
              </div>
            )}

            {selectedEntry.staffName && (
              <p className="text-sm text-text-secondary">Profissional: {selectedEntry.staffName}</p>
            )}

            <div className="flex gap-3 pt-2">
              <a
                href={`/queue/${salonId}?tab=appointments`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-accent-fg"
              >
                <CalendarDays size={16} />
                Agendar
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Olá! Vi seu resultado no AgendAI e queria agendar.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-success/40 bg-success/10 py-3 text-sm font-bold text-success"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="mx-auto max-w-4xl space-y-4 py-4 px-4">
      <h1 className="text-xl font-bold text-text-primary">Resultados</h1>

      {/* Filters */}
      {(services.length > 0 || staffMembers.length > 0) && (
        <div className="flex flex-wrap gap-2">
          <Filter size={16} className="text-text-muted" />
          {services.length > 0 && (
            <SmartSelect
              value={serviceFilter || null}
              onChange={val => setServiceFilter(val ?? '')}
              options={services.map(s => ({ value: s, label: s }))}
              placeholder="Todos os serviços"
              size="sm"
              aria-label="Filtrar por serviço"
            />
          )}
          {staffMembers.length > 0 && (
            <SmartSelect
              value={staffFilter || null}
              onChange={val => setStaffFilter(val ?? '')}
              options={staffMembers.map(s => ({ value: s, label: s }))}
              placeholder="Todos os profissionais"
              size="sm"
              aria-label="Filtrar por profissional"
            />
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-text-secondary">Nenhum resultado encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map(entry => (
            <button
              key={entry.id}
              onClick={() => void handleTrackClick(entry)}
                className="group overflow-hidden rounded-2xl border border-border bg-surface text-left transition-all hover:border-border-strong hover:shadow-lg hover:shadow-black/5"
            >
              <div className="aspect-square overflow-hidden bg-surface-2">
                {entry.mediaType?.startsWith('video') ? (
                  <div className="flex h-full items-center justify-center text-text-muted">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                ) : (
                  <img
                    src={entry.mediaUrl}
                    alt={entry.altText || entry.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold text-text-primary">{entry.title}</p>
                {entry.serviceName && (
                  <p className="mt-0.5 truncate text-xs text-text-muted">{entry.serviceName}</p>
                )}
                {entry.servicePrice != null && (
                  <p className="mt-1 text-xs font-bold text-text-primary">R$ {(entry.servicePrice / 100).toFixed(2)}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
