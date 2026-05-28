import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Siempre cargados (auth + layout base)
import { AuthProvider } from './Modules/Auth/context/AuthProvider';
import ProtectedRoute from './Modules/Shared/components/ProtectedRoute';
import AdminLayout from './Modules/Admin/components/AdminLayout';

// Lazy — páginas públicas
const PublicView          = React.lazy(() => import('./Modules/Informative/Public/pages/PublicView'));
const ProjectDetailView   = React.lazy(() => import('./Modules/Informative/Public/pages/ProjectDetailView'));
const ActivityDetailView  = React.lazy(() => import('./Modules/Informative/Public/pages/ActivityDetailView'));
const AllActivitiesView   = React.lazy(() => import('./Modules/Informative/Public/pages/AllActivitiesView'));
const AllProjectsView     = React.lazy(() => import('./Modules/Informative/Public/pages/AllProjectsView'));
const AllNewsView         = React.lazy(() => import('./Modules/Informative/Public/pages/AllNewsView'));
const FairsPage           = React.lazy(() => import('./Modules/Fairs/Pages/FairsPage'));
const PrivacyNotice       = React.lazy(() => import('./Modules/Shared/components/PrivacyNotice'));

// Lazy — auth
const LoginPage           = React.lazy(() => import('./Modules/Auth/pages/LoginPage'));
const ForgotPasswordPage  = React.lazy(() => import('./Modules/Auth/pages/ForgotPasswordPage'));
const ResetPasswordPage   = React.lazy(() => import('./Modules/Auth/pages/ResetPassword'));
const ActivateAccountPage = React.lazy(() => import('./Modules/Auth/pages/ActivateAccountPage'));
const ResendActivationPage = React.lazy(() => import('./Modules/Auth/pages/ResendActivationPage'));
const UnauthorizedPage    = React.lazy(() => import('./Modules/Auth/pages/UnauthorizedPage'));
const SessionExpiredPage  = React.lazy(() => import('./Modules/Auth/pages/SessionExpiredPage'));
const ProfilePage         = React.lazy(() => import('./Modules/Auth/pages/ProfilePage'));

// Lazy — admin
const DashboardPrincipal        = React.lazy(() => import('./Modules/Admin/pages/dashboard/DashboardPrincipal'));
const InformativeAdminPage      = React.lazy(() => import('./Modules/Informative/Admin/pages/InformativeAdminPage'));
const EntrepreneurDashboardPage = React.lazy(() => import('./Modules/Entrepreneurs/Pages/EntrepreneurDashboardPage'));
const ProjectsDashboardPage     = React.lazy(() => import('./Modules/Projects/Pages/ProjectsDashboardPage'));
const NewsPage                  = React.lazy(() => import('./Modules/News/Pages/NewsPage'));
const NewsletterPage            = React.lazy(() => import('./Modules/Newsletter/Pages/NewsletterPage'));
const VolunteerDashboardPage    = React.lazy(() => import('./Modules/Volunteers/Pages/VolunteerDashboardPage'));
const DonorsPage                = React.lazy(() => import('./Modules/Donors/Pages/DonorsPage'));
const UsersPage                 = React.lazy(() => import('./Modules/Users/Pages/UsersPage'));
const ActivitiesPage            = React.lazy(() => import('./Modules/Activities/Pages/ActivitiesPage'));
const AuditPage                 = React.lazy(() => import('./Modules/Audit/Pages/AuditPage'));

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={null}>
          <Routes>
            {/* Vista pública principal */}
            <Route path="/" element={<PublicView />} />

            {/* Nueva ruta para ferias */}
            <Route path="/ferias" element={<FairsPage />} />

            {/*Ruta pública para los proyectos */}
            <Route path="/proyecto/:slug" element={<ProjectDetailView />} />

            {/*Ruta pública para las actividades */}
            <Route path="/actividad/:slug" element={<ActivityDetailView />} />

            {/* Ruta pública para todas las actividades próximas */}
            <Route path="/actividades" element={<AllActivitiesView />} />

            {/* Ruta pública para todos los proyectos */}
            <Route path="/proyectos" element={<AllProjectsView />} />

            {/* Ruta pública para todas las noticias */}
            <Route path="/noticias" element={<AllNewsView />} />

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

            {/* Perfil público */}
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
              <Route path="perfil" element={<ProfilePage />} />
            </Route>

          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;
