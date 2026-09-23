import React from 'react';
import { CrmBackfillPanel } from '../../components/domain/CrmBackfillPanel';

export const CrmMaintenancePage: React.FC = () => (
  <div className="space-y-4">
    <div>
      <h1 className="text-xl font-bold">CRM</h1>
      <p className="text-sm text-text-muted">Reprocessamento e manutenção dos dados de CRM dos salões.</p>
    </div>
    <CrmBackfillPanel global />
  </div>
);

export default CrmMaintenancePage;
