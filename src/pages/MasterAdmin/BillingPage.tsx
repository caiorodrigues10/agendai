import React from 'react';
import { BillingTab } from './BillingTab';

export const BillingPage: React.FC = () => (
  <div className="space-y-4">
    <div>
      <h1 className="text-xl font-bold">Faturamento</h1>
      <p className="text-sm text-text-muted">Planos, cobranças, bloqueios e notificações financeiras.</p>
    </div>
    <BillingTab />
  </div>
);

export default BillingPage;
