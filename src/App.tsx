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
import UsersPage from './Modules/Users/Pages/UsersPage';

// Ruta protegida 
import PrivateRoute from './PrivateRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Vista pública principal */}
        <Route path="/" element={<PublicView />} />

        {/* Nueva ruta para ferias */}
        <Route path="/ferias" element={<FairsPage />} />

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <DashboardPrincipal />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/informativo"
          element={
            <PrivateRoute>
              <InformativeAdminPage />
            </PrivateRoute>
          }
        />
           <Route
          path="/admin/emprendedores"
          element={
            <PrivateRoute>
              <EntrepreneurDashboardPage />
            </PrivateRoute>
          }
        />
           <Route
          path="/admin/ferias"
          element={
            <PrivateRoute>
              <FairsPage />
            </PrivateRoute>
          }
        />
           <Route
          path="/admin/usuarios"
          element={
            <PrivateRoute>
              <UsersPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
