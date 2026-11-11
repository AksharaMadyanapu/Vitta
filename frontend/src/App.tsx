import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { AppShell } from '@/components/layout/AppShell';
import { ServerHealthCheck } from '@/components/layout/ServerHealthCheck';
import { CardSkeleton } from '@/components/ui/LoadingState';

// Lazy-load routes for faster initial load & minimal bundle size
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const MoneyPage = lazy(() => import('@/pages/MoneyPage').then((m) => ({ default: m.MoneyPage })));
const ForecastPage = lazy(() => import('@/pages/ForecastPage').then((m) => ({ default: m.ForecastPage })));
const PreTransactionPage = lazy(() => import('@/pages/PreTransactionPage').then((m) => ({ default: m.PreTransactionPage })));
const MorePage = lazy(() => import('@/pages/MorePage').then((m) => ({ default: m.MorePage })));

// Retained detailed pages (lazy-loaded)
const InvoicesPage = lazy(() => import('@/pages/InvoicesPage').then((m) => ({ default: m.InvoicesPage })));
const CustomersPage = lazy(() => import('@/pages/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const SuppliersPage = lazy(() => import('@/pages/SuppliersPage').then((m) => ({ default: m.SuppliersPage })));
const BankingPage = lazy(() => import('@/pages/BankingPage').then((m) => ({ default: m.BankingPage })));
const RemindersPage = lazy(() => import('@/pages/RemindersPage').then((m) => ({ default: m.RemindersPage })));
const CustomerAnalyticsPage = lazy(() => import('@/pages/CustomerAnalyticsPage').then((m) => ({ default: m.CustomerAnalyticsPage })));
const RiskAlertsPage = lazy(() => import('@/pages/RiskAlertsPage').then((m) => ({ default: m.RiskAlertsPage })));
const BusinessAnalyticsPage = lazy(() => import('@/pages/BusinessAnalyticsPage').then((m) => ({ default: m.BusinessAnalyticsPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 60 seconds TanStack Query cache
      retry: 2,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ServerHealthCheck>
          <BrowserRouter>
            <OnboardingProvider>
              <Suspense
                fallback={
                  <div className="max-w-5xl mx-auto p-10 space-y-6">
                    <CardSkeleton height="h-44" />
                    <CardSkeleton height="h-72" />
                  </div>
                }
              >
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
              </Suspense>
            </OnboardingProvider>
          </BrowserRouter>
        </ServerHealthCheck>
      </ToastProvider>
    </QueryClientProvider>
  );
};
