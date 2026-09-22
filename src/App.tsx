import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './components/infra/PrivateRoute';
import { AccessBlockedListener } from './components/infra/AccessBlockedListener';
import { CookieConsent } from './components/infra/CookieConsent';
import { AnalyticsListener } from './components/infra/AnalyticsListener';
import { ScrollToTop } from './components/infra/ScrollToTop';
import { ReferralRefCapture } from './components/infra/ReferralRefCapture';
import { Loader } from './components/ui/Loader';
import { ErrorBoundary } from './components/infra/ErrorBoundary';
import { PwaUpdatePrompt } from './components/pwa/PwaUpdatePrompt';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const FeaturesPage = lazy(() => import('./pages/marketing/FeaturesPage'));
const AiPredictivePage = lazy(() => import('./pages/marketing/AiPredictivePage'));
const SchedulingPage = lazy(() => import('./pages/marketing/SchedulingPage'));
const DashboardPage = lazy(() => import('./pages/marketing/DashboardPage'));
const AboutPage = lazy(() => import('./pages/marketing/AboutPage'));
const ContactPage = lazy(() => import('./pages/marketing/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/marketing/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/marketing/TermsPage'));
const PublicHome = lazy(() => import('./pages/PublicHome'));
const PublicAppointmentManagePage = lazy(() => import('./pages/PublicAppointmentManagePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const EmailVerifiedPage = lazy(() => import('./pages/EmailVerifiedPage'));
const AccessBlockedPage = lazy(() => import('./pages/AccessBlockedPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const MasterAdminDashboard = lazy(() => import('./pages/MasterAdmin/MasterAdminDashboard'));
const AdminLayout = lazy(() => import('./components/domain/admin/AdminLayout'));
const WorkSummaryPage = lazy(() => import('./pages/MasterAdmin/WorkSummaryPage'));
const TicketsPage = lazy(() => import('./pages/MasterAdmin/TicketsPage'));
const TicketDetailPage = lazy(() => import('./pages/MasterAdmin/TicketDetailPage'));
const TasksPage = lazy(() => import('./pages/MasterAdmin/TasksPage'));
const TaskDetailPage = lazy(() => import('./pages/MasterAdmin/TaskDetailPage'));
const TeamPage = lazy(() => import('./pages/MasterAdmin/TeamPage'));
const AccountsPage = lazy(() => import('./pages/MasterAdmin/AccountsPage'));
const OperationsPage = lazy(() => import('./pages/MasterAdmin/OperationsPage'));
const AuditPage = lazy(() => import('./pages/MasterAdmin/AuditPage'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const ClientPortalPage = lazy(() => import('./pages/ClientPortalPage'));
const ShowcasePage = lazy(() => import('./pages/ShowcasePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CommercialIntentPage = lazy(() => import('./pages/marketing/CommercialIntentPage'));

const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <ReferralRefCapture />
      <AccessBlockedListener />
      <CookieConsent />
      <AnalyticsListener />
      <PwaUpdatePrompt />
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/funcionalidades" element={<FeaturesPage />} />
          <Route path="/ia-preditiva" element={<AiPredictivePage />} />
          <Route path="/agendamento" element={<SchedulingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/privacidade" element={<PrivacyPolicyPage />} />
          <Route path="/termos" element={<TermsPage />} />
          <Route path="/queue" element={<PublicHome />} />
          <Route path="/queue/:id" element={<PublicHome />} />
          <Route path="/agendamento/gerenciar" element={<PublicAppointmentManagePage />} />
          <Route path="/login" element={<LoginPage mode="login" />} />
          <Route path="/cadastro" element={<LoginPage mode="register" />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
            <Route path="/verificar-codigo" element={<Navigate to="/esqueci-senha" replace />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/email-verificado" element={<EmailVerifiedPage />} />
          <Route path="/bloqueado" element={<AccessBlockedPage />} />
          <Route path="/planos" element={<PlansPage />} />
          <Route path="/software-para-salao-de-beleza" element={<CommercialIntentPage />} />
          <Route path="/sistema-para-salao-de-beleza" element={<CommercialIntentPage />} />
          <Route path="/sistema-para-barbearia" element={<CommercialIntentPage />} />
          <Route path="/app-para-agendamento-de-salao" element={<CommercialIntentPage />} />
          <Route path="/sistema-para-fila-de-barbearia" element={<CommercialIntentPage />} />
          <Route path="/sistema-para-manicure" element={<CommercialIntentPage />} />
          <Route path="/sistema-para-lash-designer" element={<CommercialIntentPage />} />
          <Route path="/crm-para-salao-de-beleza" element={<CommercialIntentPage />} />
          <Route path="/controle-financeiro-para-salao" element={<CommercialIntentPage />} />
          <Route
            path="/checkout"
            element={
              <PrivateRoute
                roles={['OWNER', 'MASTER_ADMIN']}
                fallback={<Navigate to="/login" replace />}
              >
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/master"
            element={
              <PrivateRoute roles={['MASTER_ADMIN']} fallback={<Navigate to="/login" replace />}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/master/work" replace />} />
            <Route path="work" element={<WorkSummaryPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="tickets/new" element={<TicketsPage />} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/new" element={<TasksPage />} />
            <Route path="tasks/:id" element={<TaskDetailPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="operations" element={<OperationsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="billing" element={<MasterAdminDashboard />} />
            <Route path="referrals" element={<MasterAdminDashboard />} />
            <Route path="crm" element={<MasterAdminDashboard />} />
          </Route>
          <Route path="/app/account" element={<Navigate to="/app/settings" replace />} />
          <Route
            path="/app/:tab"
            element={
              <PrivateRoute
                roles={['OWNER', 'EMPLOYEE', 'MASTER_ADMIN']}
                fallback={<Navigate to="/login" replace />}
              >
                <StaffDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/app" element={<Navigate to="/app/overview" replace />} />
          <Route path="/minha-conta" element={<ClientPortalPage />} />
          <Route path="/saloes/:salonId/resultados" element={<ShowcasePage />} />
          <Route path="/saloes/:salonId/resultados/:resultId" element={<ShowcasePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default App;
