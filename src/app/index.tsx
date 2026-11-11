import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '../index.css';
import App from './App';
import { AuthProvider } from '../contexts/AuthContext';
import { BarbershopProvider } from '../contexts/BarbershopContext';
import { BarbershopFiltersProvider } from '../contexts/BarbershopFiltersContext';
import { SchedulingProvider } from '../contexts/SchedulingContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import { PwaInstallProvider } from '../contexts/PwaInstallContext';
import { ImpersonationBanner } from '../components/infra/ImpersonationBanner';
import { captureAndStripResetToken } from '../utils/resetTokenUrl';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

// Antes do React Router e de qualquer init de analytics: o ?token= do link de
// redefinição sai da URL (fica só em memória) para não vazar em page_location,
// Referer dos scripts de terceiros e logs.
captureAndStripResetToken();

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PwaInstallProvider>
        <BarbershopFiltersProvider>
          <AuthProvider>
            <ImpersonationBanner />
            <ThemeProvider>
              <SubscriptionProvider>
                <BarbershopProvider>
                  <SchedulingProvider>
                    <App />
                  </SchedulingProvider>
                </BarbershopProvider>
              </SubscriptionProvider>
            </ThemeProvider>
          </AuthProvider>
        </BarbershopFiltersProvider>
      </PwaInstallProvider>
    </BrowserRouter>
  </React.StrictMode>
);
