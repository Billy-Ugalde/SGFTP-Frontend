import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600 mt-2">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Usuario:</strong> {user?.firstName} {user?.firstLastname}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Rol actual:</strong> {user?.role}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Volver atrás
          </button>
          
          <Link
            to="/"
            className="block w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            Ir al inicio
          </Link>
          
          <button
            onClick={logout}
            className="w-full border border-red-600 text-red-600 py-2 px-4 rounded hover:bg-red-50 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;