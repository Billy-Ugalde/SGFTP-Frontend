import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Vistas
import PublicView from './modules/Informativo/pages/Public/PublicView';
import LoginPage from './modules/Auth/pages/LoginPage';
import DashboardPrincipal from './modules/Admin/pages/dashboard/DashboardPrincipal';
import InformativoAdminPage from './modules/Informativo/pages/Admin/InformativoAdminPage';

// Ruta protegida 
import PrivateRoute from './PrivateRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicView />} />
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
              <InformativoAdminPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
