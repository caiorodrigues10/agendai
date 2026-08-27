import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './components/infra/PrivateRoute';
import { AccessBlockedListener } from './components/infra/AccessBlockedListener';
import { CookieConsent } from './components/infra/CookieConsent';
import { ScrollToTop } from './components/infra/ScrollToTop';
import { ReferralRefCapture } from './components/infra/ReferralRefCapture';
import { Loader } from './components/ui/Loader';
import { ErrorBoundary } from './components/infra/ErrorBoundary';

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
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const VerifyResetCodePage = lazy(() => import('./pages/VerifyResetCodePage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const EmailVerifiedPage = lazy(() => import('./pages/EmailVerifiedPage'));
const AccessBlockedPage = lazy(() => import('./pages/AccessBlockedPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const MasterAdminDashboard = lazy(() => import('./pages/MasterAdmin/MasterAdminDashboard'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ReferralRefCapture />
      <AccessBlockedListener />
      <CookieConsent />
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="/verificar-codigo" element={<VerifyResetCodePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/email-verificado" element={<EmailVerifiedPage />} />
          <Route path="/bloqueado" element={<AccessBlockedPage />} />
          <Route path="/planos" element={<PlansPage />} />
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
            path="/master/*"
            element={
              <PrivateRoute roles={['MASTER_ADMIN']} fallback={<Navigate to="/login" replace />}>
                {' '}
                <MasterAdminDashboard />{' '}
              </PrivateRoute>
            }
          />
          <Route path="/app/account" element={<Navigate to="/app/settings" replace />} />
          <Route
            path="/app/:tab"
            element={
              <PrivateRoute
                roles={['OWNER', 'EMPLOYEE']}
                fallback={<Navigate to="/login" replace />}
              >
                <StaffDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/app" element={<Navigate to="/app/queue" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
