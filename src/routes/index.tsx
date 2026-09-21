import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { TestLayout } from '../layouts/TestLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoadingSpinner } from '../components/ui';

// Lazy Loaded Pages
const LandingPage = lazy(() => import('../pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('../pages/public/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/public/RegisterPage').then(m => ({ default: m.RegisterPage })));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Test Flow Pages
const TestAccessPage = lazy(() => import('../pages/test/TestAccessPage').then(m => ({ default: m.TestAccessPage })));
const TestStartPage = lazy(() => import('../pages/test/TestStartPage').then(m => ({ default: m.TestStartPage })));
const AssessmentTakingPage = lazy(() => import('../pages/test/AssessmentTakingPage').then(m => ({ default: m.AssessmentTakingPage })));
const TestResultPage = lazy(() => import('../pages/test/TestResultPage').then(m => ({ default: m.TestResultPage })));

// Admin Pages
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AssessmentListPage = lazy(() => import('../pages/admin/AssessmentListPage').then(m => ({ default: m.AssessmentListPage })));
const AssessmentCreatePage = lazy(() => import('../pages/admin/AssessmentCreatePage').then(m => ({ default: m.AssessmentCreatePage })));
const AssessmentOverviewPage = lazy(() => import('../pages/admin/AssessmentOverviewPage').then(m => ({ default: m.AssessmentOverviewPage })));
const AssessmentEditPage = lazy(() => import('../pages/admin/AssessmentEditPage').then(m => ({ default: m.AssessmentEditPage })));
const AssessmentSettingsPage = lazy(() => import('../pages/admin/AssessmentSettingsPage').then(m => ({ default: m.AssessmentSettingsPage })));
const QuestionManagementPage = lazy(() => import('../pages/admin/QuestionManagementPage').then(m => ({ default: m.QuestionManagementPage })));
const AssessmentResultsPage = lazy(() => import('../pages/admin/AssessmentResultsPage').then(m => ({ default: m.AssessmentResultsPage })));
const AssessmentAnalyticsPage = lazy(() => import('../pages/admin/AssessmentAnalyticsPage').then(m => ({ default: m.AssessmentAnalyticsPage })));
const ParticipantsPage = lazy(() => import('../pages/admin/ParticipantsPage').then(m => ({ default: m.ParticipantsPage })));
const ProfilePage = lazy(() => import('../pages/admin/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage').then(m => ({ default: m.SettingsPage })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <LoadingSpinner size="lg" label="Loading page..." />
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Candidate Assessment Taking Flow */}
        <Route element={<TestLayout />}>
          <Route path="/test/:accessCode" element={<TestAccessPage />} />
          <Route path="/test/:accessCode/start" element={<TestStartPage />} />
          <Route path="/test/:accessCode/attempt/:attemptId" element={<AssessmentTakingPage />} />
          <Route path="/test/:accessCode/result/:attemptId" element={<TestResultPage />} />
        </Route>

        {/* Admin / Creator Protected Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'TEST_CREATOR']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assessments" element={<AssessmentListPage />} />
          <Route path="/assessments/create" element={<AssessmentCreatePage />} />
          <Route path="/assessments/:id" element={<AssessmentOverviewPage />} />
          <Route path="/assessments/:id/edit" element={<AssessmentEditPage />} />
          <Route path="/assessments/:id/questions" element={<QuestionManagementPage />} />
          <Route path="/assessments/:id/settings" element={<AssessmentSettingsPage />} />
          <Route path="/assessments/:id/results" element={<AssessmentResultsPage />} />
          <Route path="/assessments/:id/analytics" element={<AssessmentAnalyticsPage />} />
          <Route path="/participants" element={<ParticipantsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
