import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import PageLoader from '@/components/feedback/PageLoader';

import { AuthProvider } from '@/contexts/AuthContext';

import AdminLayout from '@/layouts/AdminLayout';
import AppLayout from '@/layouts/AppLayout';
import AuthLayout from '@/layouts/AuthLayout';
import PublicLayout from '@/layouts/PublicLayout';

import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import AdminRoute from './AdminRoute';
import ScrollToTop from './ScrollToTop';

// Lazy-loaded public pages
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const PublicInfoPage = lazy(() => import('@/pages/landing/PublicInfoPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));

// Lazy-loaded authentication pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const AdminLoginPage = lazy(() => import('@/pages/auth/AdminLoginPage'));

// Lazy-loaded user application pages
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const IncomePage = lazy(() => import('@/pages/transactions/IncomePage'));
const ExpensesPage = lazy(() => import('@/pages/transactions/ExpensesPage'));
const TransactionsPage = lazy(() => import('@/pages/transactions/TransactionsPage'));
const DataImportPage = lazy(() => import('@/pages/import/DataImportPage'));
const BudgetsPage = lazy(() => import('@/pages/budgets/BudgetsPage'));
const GoalsPage = lazy(() => import('@/pages/goals/GoalsPage'));
const PurchasePlannerPage = lazy(() => import('@/pages/purchases/PurchasePlannerPage'));
const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const FeedbackPage = lazy(() => import('@/pages/support/FeedbackPage'));

// Lazy-loaded admin pages
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminFeedbackPage = lazy(() => import('@/pages/admin/AdminFeedbackPage'));

// Lazy-loaded error page
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />

        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* PUBLIC WEBSITE */}
            <Route element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="features" element={<PublicInfoPage />} />
              <Route path="how-it-works" element={<PublicInfoPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="faq" element={<PublicInfoPage />} />
            </Route>

            {/* AUTHENTICATION */}
            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="admin-login" element={<AdminLoginPage />} />
              </Route>
            </Route>

            {/* USER APPLICATION */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="income" element={<IncomePage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="import" element={<DataImportPage />} />
                <Route path="budgets" element={<BudgetsPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="purchases" element={<PurchasePlannerPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="feedback" element={<FeedbackPage />} />
              </Route>

              {/* ADMIN APPLICATION */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="admin" element={<AdminOverviewPage />} />
                  <Route path="admin/users" element={<AdminUsersPage />} />
                  <Route path="admin/feedback" element={<AdminFeedbackPage />} />
                </Route>
              </Route>
            </Route>

            {/* 404 PAGE */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}