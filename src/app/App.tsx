import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '../components/infra/PrivateRoute';
import { AccessBlockedListener } from '../components/infra/AccessBlockedListener';
import { CookieConsent } from '../components/infra/CookieConsent';
import { AnalyticsListener } from '../components/infra/AnalyticsListener';
import { ScrollToTop } from '../components/infra/ScrollToTop';
import { ReferralRefCapture } from '../components/infra/ReferralRefCapture';
import { Loader } from '../components/ui/Loader';
import { ErrorBoundary } from '../components/infra/ErrorBoundary';
import { PwaUpdatePrompt } from '../components/infra/PwaUpdatePrompt';

const LandingPage = lazy(() => import('../pages/LandingPage'));
const FeaturesPage = lazy(() => import('../pages/marketing/FeaturesPage'));
const AiPredictivePage = lazy(() => import('../pages/marketing/AiPredictivePage'));
const SchedulingPage = lazy(() => import('../pages/marketing/SchedulingPage'));
const DashboardPage = lazy(() => import('../pages/marketing/DashboardPage'));
const AboutPage = lazy(() => import('../pages/marketing/AboutPage'));
const ContactPage = lazy(() => import('../pages/marketing/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/marketing/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('../pages/marketing/TermsPage'));
const PublicHome = lazy(() => import('../pages/PublicHome'));
const PublicProductPage = lazy(() => import('../pages/PublicProductPage'));
const PublicAppointmentManagePage = lazy(() => import('../pages/PublicAppointmentManagePage'));
const PublicReviewPage = lazy(() => import('../pages/PublicReviewPage'));
const PublicNpsPage = lazy(() => import('../pages/PublicNpsPage'));
const PublicPostPage = lazy(() => import('../pages/PublicPostPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const PublicOwnerInvitePage = lazy(() => import('../pages/PublicOwnerInvitePage'));
const EmailVerifiedPage = lazy(() => import('../pages/EmailVerifiedPage'));
const AccessBlockedPage = lazy(() => import('../pages/AccessBlockedPage'));
const PlansPage = lazy(() => import('../pages/PlansPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const AdminLayout = lazy(() => import('../layouts/admin/AdminLayout'));
const OverviewPage = lazy(() => import('../pages/master-admin/OverviewPage'));
const WorkSummaryPage = lazy(() => import('../pages/master-admin/WorkSummaryPage'));
const TicketsPage = lazy(() => import('../pages/master-admin/TicketsPage'));
const TicketDetailPage = lazy(() => import('../pages/master-admin/TicketDetailPage'));
const TasksPage = lazy(() => import('../pages/master-admin/TasksPage'));
const TaskDetailPage = lazy(() => import('../pages/master-admin/TaskDetailPage'));
const TeamPage = lazy(() => import('../pages/master-admin/TeamPage'));
const UsersPage = lazy(() => import('../pages/master-admin/UsersPage'));
const AccountsPage = lazy(() => import('../pages/master-admin/AccountsPage'));
const AccountDetailPage = lazy(() => import('../pages/master-admin/AccountDetailPage'));
const OperationsPage = lazy(() => import('../pages/master-admin/OperationsPage'));
const AuditPage = lazy(() => import('../pages/master-admin/AuditPage'));
const BillingPage = lazy(() => import('../pages/master-admin/BillingPage'));
const ReferralsPage = lazy(() => import('../pages/master-admin/ReferralsPage'));
const CrmMaintenancePage = lazy(() => import('../pages/master-admin/CrmMaintenancePage'));
const EngagementPage = lazy(() => import('../pages/master-admin/EngagementPage'));
const StaffDashboard = lazy(() => import('../pages/StaffDashboard'));
const ClientPortalPage = lazy(() => import('../pages/ClientPortalPage'));
const ShowcasePage = lazy(() => import('../pages/ShowcasePage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const CommercialIntentPage = lazy(() => import('../pages/marketing/CommercialIntentPage'));

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
          <Route path="/queue/:id/produtos/:productId" element={<PublicProductPage />} />
          <Route path="/agendamento/gerenciar" element={<PublicAppointmentManagePage />} />
          <Route path="/avaliar" element={<PublicReviewPage />} />
          <Route path="/nps/:surveyId" element={<PublicNpsPage />} />
          <Route path="/saloes/:salonId/posts/:postId" element={<PublicPostPage />} />
          <Route path="/login" element={<LoginPage mode="login" />} />
          <Route path="/cadastro" element={<LoginPage mode="register" />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
            <Route path="/verificar-codigo" element={<Navigate to="/esqueci-senha" replace />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/convite/:token" element={<PublicOwnerInvitePage />} />
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
              <PrivateRoute roles={['OWNER', 'MASTER_ADMIN']}>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/master"
            element={
              <PrivateRoute roles={['MASTER_ADMIN']}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/master/overview" replace />} />
            <Route path="dashboard" element={<Navigate to="/master/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="work" element={<WorkSummaryPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="tickets/new" element={<TicketsPage />} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/new" element={<TasksPage />} />
            <Route path="tasks/:id" element={<TaskDetailPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="accounts/:id" element={<AccountDetailPage />} />
            <Route path="operations" element={<OperationsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="referrals" element={<ReferralsPage />} />
            <Route path="crm" element={<CrmMaintenancePage />} />
            <Route path="engagement" element={<EngagementPage />} />
          </Route>
          <Route path="/app/account" element={<Navigate to="/app/settings" replace />} />
          <Route
            path="/app/:tab"
            element={
              <PrivateRoute roles={['OWNER', 'EMPLOYEE', 'MASTER_ADMIN']}>
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
