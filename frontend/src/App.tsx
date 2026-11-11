import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { AppShell } from '@/components/layout/AppShell';

import { DashboardPage } from '@/pages/DashboardPage';
import { MoneyPage } from '@/pages/MoneyPage';
import { ForecastPage } from '@/pages/ForecastPage';
import { PreTransactionPage } from '@/pages/PreTransactionPage';
import { MorePage } from '@/pages/MorePage';

// Retained detailed pages (accessible via More and direct deep-links)
import { InvoicesPage } from '@/pages/InvoicesPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { BankingPage } from '@/pages/BankingPage';
import { RemindersPage } from '@/pages/RemindersPage';
import { CustomerAnalyticsPage } from '@/pages/CustomerAnalyticsPage';
import { RiskAlertsPage } from '@/pages/RiskAlertsPage';
import { BusinessAnalyticsPage } from '@/pages/BusinessAnalyticsPage';
import { SettingsPage } from '@/pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <OnboardingProvider>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* 5 Core Top-Level Routes */}
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="money" element={<MoneyPage />} />
                <Route path="forecast" element={<ForecastPage />} />
                <Route path="pre-transaction" element={<PreTransactionPage />} />
                <Route path="more" element={<MorePage />} />

                {/* Sub-routes under Money (with automatic redirects or direct views) */}
                <Route path="invoices" element={<Navigate to="/money?tab=invoices" replace />} />
                <Route path="customers" element={<Navigate to="/money?tab=customers" replace />} />
                <Route path="suppliers" element={<Navigate to="/money?tab=suppliers" replace />} />
                <Route path="banking" element={<Navigate to="/money?tab=bank" replace />} />
                <Route path="parties" element={<Navigate to="/money?tab=customers" replace />} />

                {/* Secondary tools (linked from More page, no dead routes) */}
                <Route path="reminders" element={<RemindersPage />} />
                <Route path="customer-analytics" element={<CustomerAnalyticsPage />} />
                <Route path="risk-alerts" element={<RiskAlertsPage />} />
                <Route path="business-analytics" element={<BusinessAnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </OnboardingProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};
