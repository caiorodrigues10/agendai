import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicHome } from './pages/PublicHome';
import { StaffDashboard } from './pages/StaffDashboard';
import { LoginPage } from './pages/LoginPage';
import { MasterAdminDashboard } from './pages/MasterAdmin/MasterAdminDashboard';
import { PrivateRoute } from './components/infra/PrivateRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/master/*" element={<PrivateRoute roles={['MASTER_ADMIN', 'ADMIN']} fallback={<Navigate to="/login" replace />}> <MasterAdminDashboard /> </PrivateRoute>} />
        <Route
          path="/app/:tab"
          element={
            <PrivateRoute roles={['OWNER', 'EMPLOYEE']} fallback={<Navigate to="/login" replace />}>
              <StaffDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/app" element={<Navigate to="/app/queue" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
