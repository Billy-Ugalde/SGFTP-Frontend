import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Vistas
import FairsPage from './Modules/Fairs/Pages/FairsPage';
import PublicView from './Modules/Informative/Public/pages/PublicView';
import ProjectDetailView from './Modules/Informative/Public/pages/ProjectDetailView';
import ActivityDetailView from './Modules/Informative/Public/pages/ActivityDetailView';
import LoginPage from './Modules/Auth/pages/LoginPage';
import DashboardPrincipal from './Modules/Admin/pages/dashboard/DashboardPrincipal';
import AdminLayout from './Modules/Admin/components/AdminLayout';
import InformativeAdminPage from './Modules/Informative/Admin/pages/InformativeAdminPage';
import EntrepreneurDashboardPage from './Modules/Entrepreneurs/Pages/EntrepreneurDashboardPage';
import ProjectsDashboardPage from './Modules/Projects/Pages/ProjectsDashboardPage';
import NewsPage from './Modules/News/Pages/NewsPage';
import NewsletterPage from './Modules/Newsletter/Pages/NewsletterPage';
import VolunteerDashboardPage from './Modules/Volunteers/Pages/VolunteerDashboardPage';

import DonorsPage from './Modules/Donors/Pages/DonorsPage';
import UsersPage from './Modules/Users/Pages/UsersPage';
import AuditPage from './Modules/Audit/Pages/AuditPage';
import ActivitiesPage from './Modules/Activities/Pages/ActivitiesPage';
import { AuthProvider } from './Modules/Auth/context/AuthProvider';
import UnauthorizedPage from './Modules/Auth/pages/UnauthorizedPage';
import SessionExpiredPage from './Modules/Auth/pages/SessionExpiredPage';
import ProfilePage from './Modules/Auth/pages/ProfilePage';

// Ruta protegida
import ProtectedRoute from './Modules/Shared/components/ProtectedRoute';
import ActivateAccountPage from './Modules/Auth/pages/ActivateAccountPage';
import ForgotPasswordPage from './Modules/Auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './Modules/Auth/pages/ResetPassword';
import ResendActivationPage from './Modules/Auth/pages/ResendActivationPage';
import PrivacyNotice from './Modules/Shared/components/PrivacyNotice';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Vista pública principal */}
          <Route path="/" element={<PublicView />} />

          {/* Nueva ruta para ferias */}
          <Route path="/ferias" element={<FairsPage />} />

          {/*Ruta pública para los proyectos */}
          <Route path="/proyecto/:slug" element={<ProjectDetailView />} />

          {/*Ruta pública para las actividades */}
          <Route path="/actividad/:id" element={<ActivityDetailView />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* forgotPass */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* resetPass */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Activar cuenta */}
          <Route path="/activate" element={<ActivateAccountPage />} />

          {/* Reenviar enlace de activación */}
          <Route path="/resend-activation" element={<ResendActivationPage />} />

          {/* Páginas legales */}
          <Route path="/aviso-de-privacidad" element={<PrivacyNotice />} />

          {/* Perfil (pública o protégida según necesites) */}
          <Route path="/perfil" element={<ProfilePage />} />

          {/* Ruta de no autorizado */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Ruta de sesión expirada */}
          <Route path="/session-expired" element={<SessionExpiredPage />} />

          {/* Admin layout — sidebar siempre visible */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'fair_admin', 'content_admin', 'auditor']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPrincipal />} />
            <Route path="dashboard" element={<DashboardPrincipal />} />
            <Route
              path="ferias"
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'fair_admin']}>
                  <FairsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="informativo"
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'content_admin']}>
                  <InformativeAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="emprendedores"
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'fair_admin']}>
                  <EntrepreneurDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="actividades"
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'fair_admin']}>
                  <ActivitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="donadores"
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'auditor']}>
                  <DonorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="voluntarios"
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'fair_admin']}>
                  <VolunteerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="proyectos"
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'auditor']}>
                  <ProjectsDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="auditoria"
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'auditor']}>
                  <AuditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="usuarios"
              element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="noticias"
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'content_admin']}>
                  <NewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="newsletters"
              element={
                <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'content_admin']}>
                  <NewsletterPage />
                </ProtectedRoute>
              }
            />
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;