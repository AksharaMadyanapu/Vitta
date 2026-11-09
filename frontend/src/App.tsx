import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';
import { AppShell } from '@/components/layout/AppShell';

import { DashboardPage } from '@/pages/DashboardPage';
import { BankingPage } from '@/pages/BankingPage';
import { InvoicesPage } from '@/pages/InvoicesPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { PartiesPage } from '@/pages/PartiesPage';
import { RemindersPage } from '@/pages/RemindersPage';
import { ForecastPage } from '@/pages/ForecastPage';
import { PreTransactionPage } from '@/pages/PreTransactionPage';
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
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="parties" element={<PartiesPage />} />
              <Route path="banking" element={<BankingPage />} />
              <Route path="forecast" element={<ForecastPage />} />
              <Route path="pre-transaction" element={<PreTransactionPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="customer-analytics" element={<CustomerAnalyticsPage />} />
              <Route path="risk-alerts" element={<RiskAlertsPage />} />
              <Route path="business-analytics" element={<BusinessAnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};
