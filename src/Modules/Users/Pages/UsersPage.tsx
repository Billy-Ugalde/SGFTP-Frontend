import React, { useState } from 'react';
import { Users } from 'lucide-react';
import UsersList from '../Components/UsersList';
import AddUserButton from '../Components/AddUserButton';
import { useUsers } from '../Services/UserService';
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import StatusFilter from '../../Shared/components/StatusFilter';
import '../Styles/UsersPage.css';

const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: users = [] } = useUsers();

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <div className="users-page">
      {/* Header Section */}
      <div className="users-page__header">
        <div className="users-page__header-container">
          <div className="users-page__title-section">
            {/* Fila superior: título y botones */}
            <div className="users-page__title-row">
              {/* Espaciador izquierdo */}
              <div style={{ flex: 1 }}></div>

              {/* Centro: ícono + título */}
              <div className="users-page__title-center">
                <div style={{ backgroundColor: "#4CAF8C", color: "white", width: "72px", height: "72px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "16px" }}>
                  <Users size={32} strokeWidth={2} />
                </div>
                <h1 className="users-page__title">Gestión de usuarios</h1>
              </div>

              {/* Botón alineado a la derecha */}
              <div className="users-page__title-actions">
                <BackToDashboardButton />
              </div>
            </div>

            <p className="users-page__description">
              Administrar y organizar usuarios del sistema para la{" "}
              <span className="users-page__foundation-name">
                Fundación Tamarindo Park
              </span>
              . Crear, editar y coordinar accesos de usuarios que administran eventos comunitarios sostenibles que promuevan la conservación y la conciencia ambiental.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="users-page__main">
        {/* Action Bar */}
        <div className="users-page__action-bar">
          <div className="users-page__action-content">
            <div className="users-page__directory-header">
              <h2 className="users-page__directory-title">Directorio de usuarios</h2>
              <p className="users-page__directory-description">
                Crear, editar y administrar todos los usuarios del sistema de la fundación
              </p>
            </div>

            <div className="users-page__controls">
              {/* Search Bar */}
              <div className="users-page__search-wrapper">
                <div className="users-page__search-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="users-page__search-input"
                />
              </div>

              {/* Status Filter */}
              <StatusFilter
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />

              {/* Add User Button */}
              <AddUserButton />
            </div>
          </div>
        </div>

        {/* Statistics Cards - Integradas en la página */}
        <div className="users-page__stats">
          <div className="users-page__stat-card users-page__stat-card--total">
            <div className="users-page__stat-icon">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="users-page__stat-content">
              <p className="users-page__stat-title">Total de Usuarios</p>
              <p className="users-page__stat-count">{totalUsers}</p>
            </div>
          </div>

          <div className="users-page__stat-card users-page__stat-card--active">
            <div className="users-page__stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="users-page__stat-content">
              <p className="users-page__stat-title">Usuarios Activos</p>
              <p className="users-page__stat-count">{activeUsers}</p>
            </div>
          </div>

          <div className="users-page__stat-card users-page__stat-card--inactive">
            <div className="users-page__stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="users-page__stat-content">
              <p className="users-page__stat-title">Usuarios Inactivos</p>
              <p className="users-page__stat-count">{inactiveUsers}</p>
            </div>
          </div>
        </div>

        {/* Users List */}
        <UsersList searchTerm={searchTerm} statusFilter={statusFilter} />
      </div>

      {/* Footer */}
      <div className="users-page__footer">
        <div className="users-page__footer-container">
          <div className="users-page__footer-content">
            <span>Fundación Tamarindo Park</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;