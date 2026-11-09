import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';
import { AppShell } from '@/components/layout/AppShell';

import { DashboardPage } from '@/pages/DashboardPage';
import { BankingPage } from '@/pages/BankingPage';
import { PartiesPage } from '@/pages/PartiesPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { RemindersPage } from '@/pages/RemindersPage';
import { CustomerAnalyticsPage } from '@/pages/CustomerAnalyticsPage';
import { ForecastPage } from '@/pages/ForecastPage';
import { RiskAlertsPage } from '@/pages/RiskAlertsPage';
import { PreTransactionPage } from '@/pages/PreTransactionPage';
import { BusinessAnalyticsPage } from '@/pages/BusinessAnalyticsPage';

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
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="banking" element={<BankingPage />} />
              <Route path="parties" element={<PartiesPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="customer-analytics" element={<CustomerAnalyticsPage />} />
              <Route path="forecast" element={<ForecastPage />} />
              <Route path="risk-alerts" element={<RiskAlertsPage />} />
              <Route path="pre-transaction" element={<PreTransactionPage />} />
              <Route path="business-analytics" element={<BusinessAnalyticsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

