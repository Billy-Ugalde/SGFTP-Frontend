import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Vistas
import FairsPage from './Modules/Fairs/Pages/FairsPage';
import PublicView from './Modules/Informative/Public/pages/PublicView';
import LoginPage from './Modules/Auth/pages/LoginPage';
import DashboardPrincipal from './Modules/Admin/pages/dashboard/DashboardPrincipal';
import InformativeAdminPage from './Modules/Informative/Admin/pages/InformativeAdminPage';
import EntrepreneurDashboardPage from './Modules/Entrepreneurs/Pages/EntrepreneurDashboardPage';
//import DonorsPage from './Modules/Donors/Pages/DonorsPage';
import UsersPage from './Modules/Users/Pages/UsersPage';
import { AuthProvider } from './Modules/Auth/context/AuthProvider';
import UnauthorizedPage from './Modules/Auth/pages/UnauthorizedPage';
import ProfilePage from './Modules/Auth/pages/ProfilePage';

// Ruta protegida 
import ProtectedRoute from './Modules/Shared/components/ProtectedRoute';
import ActivateAccountPage from './Modules/Auth/pages/ActivateAccountPage';
import ForgotPasswordPage from './Modules/Auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './Modules/Auth/pages/ResetPassword';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Vista pública principal */}
          <Route path="/" element={<PublicView />} />

          {/* Nueva ruta para ferias */}
          <Route path="/ferias" element={<FairsPage />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* forgotPass */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* resetPass */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Activar cuenta */}
          <Route path="/activate" element={<ActivateAccountPage />} />

          {/* Perfil (pública o protégida según necesites) */}
          <Route path="/perfil" element={<ProfilePage />} />

          {/* Ruta de no autorizado */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

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

          {/* Admins de ferias y emprendedores */}
          <Route
            path="/admin/ferias"
            element={
              <ProtectedRoute requiredRoles={['super_admin', 'general_admin', 'fair_admin']}>
                <FairsPage />
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

        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
