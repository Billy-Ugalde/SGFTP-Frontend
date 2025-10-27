import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Vistas
import FairsPage from './Modules/Fairs/Pages/FairsPage';
import PublicView from './Modules/Informative/Public/pages/PublicView';
import ProjectDetailView from './Modules/Informative/Public/pages/ProjectDetailView';
import LoginPage from './Modules/Auth/pages/LoginPage';
import DashboardPrincipal from './Modules/Admin/pages/dashboard/DashboardPrincipal';
import InformativeAdminPage from './Modules/Informative/Admin/pages/InformativeAdminPage';
import EntrepreneurDashboardPage from './Modules/Entrepreneurs/Pages/EntrepreneurDashboardPage';
import ProjectsDashboardPage from './Modules/Projects/Pages/ProjectsDashboardPage';
import NewsPage from './Modules/News/Pages/NewsPage';
import NewsletterPage from './Modules/Newsletter/Pages/NewsletterPage';

//import DonorsPage from './Modules/Donors/Pages/DonorsPage';
import UsersPage from './Modules/Users/Pages/UsersPage';
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

          {/* Perfil (pública o protégida según necesites) */}
          <Route path="/perfil" element={<ProfilePage />} />

          {/* Ruta de no autorizado */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Ruta de sesión expirada */}
          <Route path="/session-expired" element={<SessionExpiredPage />} />

          {/* Super admin y admin general */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'fair_admin', 'content_admin']}>
                <DashboardPrincipal />
              </ProtectedRoute>
            }
          />

          {/* Admins de contenido */}
          <Route
            path="/admin/informativo"
            element={
              <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'content_admin']}>
                <InformativeAdminPage />
              </ProtectedRoute>
            }
          />

          {/* Admins de ferias y emprendedores */}
          <Route
            path="/admin/emprendedores"
            element={
              <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'fair_admin']}>
                <EntrepreneurDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admins de ferias */}
          <Route
            path="/admin/ferias"
            element={
              <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'fair_admin']}>
                <FairsPage />
              </ProtectedRoute>
            }
          />

          {/*Admins de actividades */}
          <Route
            path="/admin/actividades"
            element={
              <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'fair_admin']}>
                <ActivitiesPage />
              </ProtectedRoute>
            }
          />

          {/* Administracion de proyectos */}
          <Route
            path="/admin/proyectos"
            element={
              <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'auditor']}>
                <ProjectsDashboardPage />
              </ProtectedRoute>
            }
          />
          {/* Solo super admin para usuarios */}
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute requiredRoles={['super_admin']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* Solo super admin y admin general para noticias */}
          <Route
            path="/admin/noticias"
            element={
              <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'content_admin']}>
                <NewsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/newsletters"
            element={
              <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'content_admin']}>
                <NewsletterPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;