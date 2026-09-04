import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Service, ShopSettings, StaffMember } from '../../types';
import { AppointmentFormData } from '../../schemas';
import { AvailabilitySlot } from '../../utils/schedulingUtils';
import { METRIC_LABEL } from '../../utils/metricLabels';
import { ClientsManager } from './ClientsManager';
import { CrmIntelligencePanel } from './CrmIntelligencePanel';
import { ClientProfileSheet } from './ClientProfileSheet';

type ClientsSection = 'operacao' | 'inteligencia';

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
  from: new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
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
  const [section, setSection] = useState<ClientsSection>('operacao');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [period, setPeriod] = useState(initialPeriod);
  const [listRefreshSignal, setListRefreshSignal] = useState(0);

  return (
    <div className="space-y-4">
      {showUpgradeHint && (
        <div className="flex flex-col gap-3 rounded-xl border border-accent/25 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-accent/15 p-2 text-accent">
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

      {canAnalytics && (
        <nav
          aria-label="Áreas do CRM"
          className="flex gap-1 rounded-xl border border-border bg-surface p-1"
        >
          {(
            [
              ['operacao', 'Operação'],
              ['inteligencia', 'Inteligência'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`min-h-10 flex-1 rounded-lg text-xs font-bold transition-colors ${
                section === id
                  ? 'bg-accent text-accent-fg'
                  : 'text-text-muted hover:bg-bg hover:text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {section === 'operacao' || !canAnalytics ? (
        <ClientsManager
          selectedId={selectedClientId}
          onSelectClient={setSelectedClientId}
          refreshSignal={listRefreshSignal}
        />
      ) : (
        <CrmIntelligencePanel
          canAnalytics={canAnalytics}
          canCampaigns={canCampaigns}
          period={period}
          onPeriodChange={setPeriod}
          onOpenClient={setSelectedClientId}
          onNotify={onNotify}
        />
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
