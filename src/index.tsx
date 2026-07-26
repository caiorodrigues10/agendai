import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { BarbershopProvider } from './contexts/BarbershopContext';
import { BarbershopFiltersProvider } from './contexts/BarbershopFiltersContext';
import { SchedulingProvider } from './contexts/SchedulingContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <BarbershopFiltersProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <BarbershopProvider>
              <SchedulingProvider>
                <App />
              </SchedulingProvider>
            </BarbershopProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </BarbershopFiltersProvider>
    </ThemeProvider>
  </React.StrictMode>
);
