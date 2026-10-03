import React from 'react';
import { ReferralsTab } from './ReferralsTab';

export const ReferralsPage: React.FC = () => (
  <div className="space-y-4">
    <div>
      <h1 className="text-xl font-bold">Indicações</h1>
      <p className="text-sm text-text-muted">Métricas globais do programa de indicações.</p>
    </div>
    <ReferralsTab />
  </div>
);

export default ReferralsPage;
