import React, { useState } from 'react';
import { ClientPortalLogin } from '../components/domain/ClientPortalLogin';
import { ClientPortalDashboard } from '../components/domain/ClientPortalDashboard';

const ClientPortalPage: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg px-4">
        <ClientPortalLogin onAuthenticated={() => setAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg px-4">
      <ClientPortalDashboard />
    </div>
  );
};

export default ClientPortalPage;
