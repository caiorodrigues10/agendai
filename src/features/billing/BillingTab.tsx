import React, { useState, useEffect } from 'react';
import { adminApi } from '../../infra/adminApi';
import { NotificationDeliveriesPanel, NotificationHealthPanel } from '../notifications';
import { RevenueSection } from './RevenueSection';
import { PaymentsSection } from './PaymentsSection';
import { RefundsSection } from './RefundsSection';
import { SubscriptionsSection } from './SubscriptionsSection';
import { PlansSection } from './PlansSection';
import { BlockedSection } from './BlockedSection';
import { NotificationsSection } from './NotificationsSection';
import { BillingSummarySection } from './BillingSummarySection';
import { BillingInsightsSection } from './BillingInsightsSection';
import {
  LuWallet as Wallet,
  LuCreditCard as CreditCard,
  LuRotateCcw as RotateCcw,
  LuReceipt as Receipt,
  LuLayers as Layers,
  LuBan as Ban,
  LuBell as Bell,
  LuLandmark as Landmark,
  LuTrendingUp as TrendingUp,
} from 'react-icons/lu';

// ─────────────────────────────────────────────
// BillingTab (raiz)
// ─────────────────────────────────────────────

type BillingSection =
  | 'summary'
  | 'revenue'
  | 'payments'
  | 'refunds'
  | 'subscriptions'
  | 'plans'
  | 'blocked'
  | 'notifications'
  | 'insights';

const SECTION_OPTIONS: { value: BillingSection; icon: React.ReactNode; label: string }[] = [
  { value: 'summary', icon: <Landmark size={14} />, label: 'Resumo' },
  { value: 'revenue', icon: <Wallet size={14} />, label: 'Receita' },
  { value: 'payments', icon: <CreditCard size={14} />, label: 'Pagamentos' },
  { value: 'refunds', icon: <RotateCcw size={14} />, label: 'Reembolsos' },
  { value: 'subscriptions', icon: <Receipt size={14} />, label: 'Assinaturas' },
  { value: 'plans', icon: <Layers size={14} />, label: 'Planos' },
  { value: 'blocked', icon: <Ban size={14} />, label: 'Bloqueios' },
  { value: 'notifications', icon: <Bell size={14} />, label: 'Notificações' },
  { value: 'insights', icon: <TrendingUp size={14} />, label: 'Análises' },
];

export const BillingTab: React.FC = () => {
  const [section, setSection] = useState<BillingSection>('summary');
  const [shopNames, setShopNames] = useState<Map<string, string>>(new Map());

  // Nome dos salões para exibir na listagem de pagamentos (endpoint só retorna barbershopId)
  useEffect(() => {
    adminApi
      .listBarbershops({ limit: 100 })
      .then(res => setShopNames(new Map(res.data.map(s => [s.id, s.name]))))
      .catch(() => {
        /* fallback: exibe o ID */
      });
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Faturamento</h2>
          <p className="text-text-secondary text-sm mt-1">
            Pagamentos, assinaturas, planos e inadimplência da plataforma
          </p>
        </div>
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1 overflow-x-auto scroller-hidden">
          {SECTION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSection(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                section === opt.value
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {section === 'summary' && <BillingSummarySection />}
      {section === 'insights' && <BillingInsightsSection />}
      {section === 'revenue' && <RevenueSection />}
      {section === 'payments' && <PaymentsSection shopNames={shopNames} />}
      {section === 'refunds' && <RefundsSection shopNames={shopNames} />}
      {section === 'subscriptions' && <SubscriptionsSection />}
      {section === 'plans' && <PlansSection />}
      {section === 'blocked' && <BlockedSection />}
      {section === 'notifications' && (
        <div className="space-y-8">
          <NotificationHealthPanel />
          <NotificationDeliveriesPanel
            masterAdmin
            barbershops={Array.from(shopNames, ([id, name]) => ({ id, name }))}
          />
          <div>
            <h3 className="mb-3 text-lg font-bold text-text-primary">Alertas administrativos</h3>
            <NotificationsSection />
          </div>
        </div>
      )}
    </div>
  );
};
