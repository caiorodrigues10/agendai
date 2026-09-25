import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  LuSparkles as Sparkles,
  LuUsers as Users,
  LuChartColumn as BarChart3,
  LuSettings2 as Settings2,
  LuLink2 as Link2,
  LuRefreshCw as RefreshCw,
} from 'react-icons/lu';
import { Service, ShopSettings, StaffMember } from '../../types';
import { AppointmentFormData } from '../../schemas';
import { AvailabilitySlot } from '../../utils/schedulingUtils';
import { METRIC_LABEL } from '../../utils/metricLabels';
import { addDaysISO, todayISO } from '../../utils/dateRanges';
import { ClientsManager } from './ClientsManager';
import { CrmIntelligencePanel } from './CrmIntelligencePanel';
import { ClientProfileSheet } from './ClientProfileSheet';
import { CrmMergePanel } from './CrmMergePanel';
import { CrmBackfillPanel } from './CrmBackfillPanel';
import { useAuth } from '../../contexts/AuthContext';
import { crmApi } from '../../infra/crmApi';

type ClientsSection = 'clientes' | 'analises' | 'organizar';

const VALID_SECTIONS: ClientsSection[] = ['clientes', 'analises', 'organizar'];

const SECTION_META: { id: ClientsSection; label: string; shortLabel?: string; icon: React.ReactNode; requiresAnalytics: boolean; requiresTools: boolean }[] = [
  { id: 'clientes', label: 'Clientes', icon: <Users size={14} />, requiresAnalytics: false, requiresTools: false },
  { id: 'analises', label: 'Análises', icon: <BarChart3 size={14} />, requiresAnalytics: true, requiresTools: false },
  { id: 'organizar', label: 'Organizar cadastros', shortLabel: 'Organizar', icon: <Settings2 size={14} />, requiresAnalytics: true, requiresTools: true },
];

interface ClientsTabProps {
  services: Service[];
  staff: StaffMember[];
  settings: ShopSettings;
  canAnalytics: boolean;
  canCampaigns: boolean;
  canCancelSale: boolean;
  showUpgradeHint: boolean;
  availability: AvailabilitySlot[];
  onBook: (data: AppointmentFormData) => Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error' | 'bot') => void;
}

const initialPeriod = () => ({
  from: addDaysISO(-29),
  to: todayISO(),
});

export const ClientsTab: React.FC<ClientsTabProps> = ({
  services,
  staff,
  settings,
  canAnalytics,
  canCampaigns,
  canCancelSale,
  showUpgradeHint,
  availability,
  onBook,
  onNotify,
}) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawSection = searchParams.get('sec');
  const section: ClientsSection = VALID_SECTIONS.includes(rawSection as ClientsSection)
    ? (rawSection as ClientsSection)
    : 'clientes';

  const setSection = useCallback((s: ClientsSection) => {
    setSearchParams(prev => { prev.set('sec', s); return prev; }, { replace: true });
  }, [setSearchParams]);

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [period, setPeriod] = useState(initialPeriod);
  const [listRefreshSignal, setListRefreshSignal] = useState(0);
  const [operationMessage, setOperationMessage] = useState('');

  // Tools modal state
  const [toolsModal, setToolsModal] = useState<'merge' | 'backfill' | null>(null);
  const [lastBackfill, setLastBackfill] = useState<{ status: string; date: string; count: number } | null>(null);

  // Load last backfill run for summary
  useEffect(() => {
    if (section !== 'organizar' || !canAnalytics) return;
    crmApi.backfillRuns().then(runs => {
      if (runs.length > 0) {
        const last = runs[0];
        setLastBackfill({
          status: last.status,
          date: new Date(last.startedAt).toLocaleString('pt-BR'),
          count: last.linkedRecords + last.createdEvents,
        });
      }
    }).catch(() => {});
  }, [section, canAnalytics, listRefreshSignal]);

  // Invalidate section if no permission
  useEffect(() => {
    if (section === 'analises' && !canAnalytics) setSection('clientes');
    if (section === 'organizar' && (!canAnalytics || (!canCampaigns && user?.role !== 'OWNER'))) setSection('clientes');
  }, [section, canAnalytics, canCampaigns, user?.role, setSection]);

  const showTabs = canAnalytics || (!canAnalytics && false);
  const visibleSections = SECTION_META.filter(s => {
    if (s.requiresAnalytics && !canAnalytics) return false;
    if (s.requiresTools && (!canCampaigns && user?.role !== 'OWNER')) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {showUpgradeHint && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-surface-2 p-2 text-text-secondary">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Inteligência de clientes no plano Pro</p>
              <p className="text-xs text-text-secondary">
                {METRIC_LABEL.LTV}, segmentos, previsão de receita e campanhas WhatsApp.
              </p>
            </div>
          </div>
          <Link
            to="/checkout"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 text-xs font-bold text-accent-fg"
          >
            Ver planos Pro
          </Link>
        </div>
      )}

      {visibleSections.length > 1 && (
        <nav
          aria-label="Áreas do CRM"
          className="flex gap-1 rounded-xl border border-border bg-surface p-1"
        >
          {visibleSections.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              aria-current={section === s.id ? 'page' : undefined}
              className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-1.5 text-xs font-bold transition-colors sm:px-3 ${
                section === s.id
                  ? 'bg-accent text-accent-fg'
                  : 'text-text-muted hover:bg-bg hover:text-text-secondary'
              }`}
            >
              <span className="shrink-0 inline-flex">{s.icon}</span>
              <span className="sm:hidden">{s.shortLabel ?? s.label}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </nav>
      )}

      {operationMessage && (
        <p role="status" className="rounded-lg bg-success/10 p-3 text-sm text-success">{operationMessage}</p>
      )}

      {section === 'clientes' || !canAnalytics ? (
        <ClientsManager
          selectedId={selectedClientId}
          onSelectClient={setSelectedClientId}
          refreshSignal={listRefreshSignal}
        />
      ) : section === 'analises' ? (
        <CrmIntelligencePanel
          canAnalytics={canAnalytics}
          canCampaigns={canCampaigns}
          period={period}
          onPeriodChange={setPeriod}
          onOpenClient={setSelectedClientId}
          onNotify={onNotify}
        />
      ) : (
        /* Organizar cadastros */
        <div className="space-y-4">
          <p className="text-xs text-text-secondary">
            Ferramentas para manter a base de clientes limpa e atualizada.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {canCampaigns && (
              <button
                type="button"
                onClick={() => setToolsModal('merge')}
                className="flex flex-col items-start gap-2 rounded-xl border border-border bg-surface p-4 text-left transition hover:border-accent/40"
              >
                <div className="flex items-center gap-2">
                  <Link2 size={16} className="text-accent" />
                  <span className="text-sm font-bold text-text-primary">Unir clientes duplicados</span>
                </div>
                <p className="text-xs leading-relaxed text-text-secondary">
                  Junte cadastros da mesma pessoa e mantenha seu histórico em um só lugar.
                </p>
                <span className="mt-auto text-xs font-bold text-accent">Revisar cadastros</span>
              </button>
            )}
            {user?.role === 'OWNER' && (
              <button
                type="button"
                onClick={() => setToolsModal('backfill')}
                className="flex flex-col items-start gap-2 rounded-xl border border-border bg-surface p-4 text-left transition hover:border-accent/40"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw size={16} className="text-accent" />
                  <span className="text-sm font-bold text-text-primary">Atualizar histórico dos clientes</span>
                </div>
                <p className="text-xs leading-relaxed text-text-secondary">
                  Recalcule os vínculos e indicadores a partir dos registros existentes do salão.
                </p>
                <span className="mt-auto text-xs font-bold text-accent">Ver atualização do histórico</span>
              </button>
            )}
          </div>
          {lastBackfill && (
            <p className="text-xs text-text-muted">
              Último reprocessamento: {lastBackfill.date} — {lastBackfill.count} registros
              {lastBackfill.status === 'SUCCEEDED' ? ' atualizados com sucesso.' :
               lastBackfill.status === 'FAILED' ? ' com falha.' : ' em andamento.'}
            </p>
          )}
        </div>
      )}

      {/* Tools modals */}
      {toolsModal === 'merge' && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
          <div className="w-full max-w-lg">
            <CrmMergePanel
              onMerged={id => {
                setSelectedClientId(id);
                setListRefreshSignal(v => v + 1);
                setOperationMessage('Clientes mesclados. Lista e perfil atualizados.');
                setToolsModal(null);
              }}
              onClose={() => setToolsModal(null)}
            />
          </div>
        </div>
      )}
      {toolsModal === 'backfill' && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
          <div className="w-full max-w-lg">
            <CrmBackfillPanel
              onUpdated={() => {
                setListRefreshSignal(v => v + 1);
                setToolsModal(null);
              }}
              onClose={() => setToolsModal(null)}
            />
          </div>
        </div>
      )}

      <ClientProfileSheet
        clientId={selectedClientId}
        onClose={() => setSelectedClientId(null)}
        services={services}
        staff={staff}
        settings={settings}
        canCancelSale={canCancelSale}
        canAnalytics={canAnalytics}
        period={period}
        onUpdated={() => setListRefreshSignal(n => n + 1)}
        onBook={onBook}
        availability={availability}
      />
    </div>
  );
};
