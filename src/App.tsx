import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicHome } from './pages/PublicHome';
import { StaffDashboard } from './pages/StaffDashboard';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/marketing/FeaturesPage';
import { AiPredictivePage } from './pages/marketing/AiPredictivePage';
import { SchedulingPage } from './pages/marketing/SchedulingPage';
import { DashboardPage } from './pages/marketing/DashboardPage';
import { AboutPage } from './pages/marketing/AboutPage';
import { ContactPage } from './pages/marketing/ContactPage';
import { MasterAdminDashboard } from './pages/MasterAdmin/MasterAdminDashboard';
import { PlansPage } from './pages/PlansPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccessBlockedPage } from './pages/AccessBlockedPage';
import { PrivateRoute } from './components/infra/PrivateRoute';
import { AccessBlockedListener } from './components/infra/AccessBlockedListener';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AccessBlockedListener />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/funcionalidades" element={<FeaturesPage />} />
        <Route path="/ia-preditiva" element={<AiPredictivePage />} />
        <Route path="/agendamento" element={<SchedulingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="/queue" element={<PublicHome />} />
        <Route path="/queue/:id" element={<PublicHome />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Tela de bloqueio: também acessível sem sessão (bloqueio pode ocorrer no login) */}
        <Route path="/bloqueado" element={<AccessBlockedPage />} />
        {/* Planos são públicos: qualquer visitante pode ver preços antes de logar.
            O login/checkout só é exigido ao efetivar a assinatura. */}
        <Route path="/planos" element={<PlansPage />} />
        <Route
          path="/checkout"
          element={
            <PrivateRoute roles={['OWNER', 'MASTER_ADMIN', 'ADMIN']} fallback={<Navigate to="/login" replace />}>
              <CheckoutPage />
            </PrivateRoute>
          }
        />
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
