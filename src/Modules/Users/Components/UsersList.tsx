import React from 'react';
import { useUsers, useUpdateUserStatus } from '../Services/UserService';
import type { User } from '../Services/UserService';
import EditUserButton from './EditUserButton';
import '../styles/UsersList.css';

interface UsersListProps {
  searchTerm: string;
  statusFilter: string;
}

const UsersList: React.FC<UsersListProps> = ({ searchTerm, statusFilter }) => {
  const { data: users = [], isLoading, error, refetch } = useUsers();
  const updateUserStatus = useUpdateUserStatus();

  const handleToggleStatus = async (user: User) => {
    try {
      await updateUserStatus.mutateAsync({
        id_user: user.id_user,
        status: !user.status
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const getFullName = (person: any) => {
    return `${person.first_name} ${person.second_name || ''} ${person.first_lastname} ${person.second_lastname || ''}`.trim();
  };

  const getRoleColor = (roleName: string) => {
    const roleColors: { [key: string]: string } = {
      'Admin': 'role-admin',
      'Usuario': 'role-user',  
      'Moderador': 'role-moderator',
    };
    return roleColors[roleName] || 'role-default';
  };

  const filteredUsers = users.filter(user => {
    const fullName = getFullName(user.person);
    
    const matchesSearch = searchTerm === '' || 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.status) ||
      (statusFilter === 'inactive' && !user.status);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="users-list">
        <div className="users-list__loading">
          <svg className="users-list__loading-spinner" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-list">
        <div className="users-list__error">
          <svg className="users-list__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="users-list__error-title">Error al cargar usuarios</h3>
            <p className="users-list__error-message">{error.message}</p>
            <button 
              onClick={() => refetch()}
              className="users-list__retry-btn"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="users-list">
        <div className="users-list__empty">
          <svg className="users-list__empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="users-list__empty-title">
            {searchTerm || statusFilter !== 'all' ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
          </h3>
          <p className="users-list__empty-description">
            {searchTerm || statusFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda para encontrar usuarios.'
              : 'Comienza creando el primer usuario del sistema.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-list">
      <div className="users-list__grid">
        {filteredUsers.map(user => (
          <div 
            key={user.id_user} 
            className={`user-item ${user.status ? 'user-item--active' : 'user-item--inactive'}`}
          >
            {/* Status Badge */}
            <div className="user-item__status">
              <span className={`status-badge ${user.status ? 'status-badge--active' : 'status-badge--inactive'}`}>
                {user.status ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {/* User Info */}
            <div className="user-item__content">
              <h3 className="user-item__name">{getFullName(user.person)}</h3>
              
              <div className="user-item__details">
                <div className="user-item__detail">
                  <span className="user-item__icon">📧</span>
                  <span className="user-item__text">{user.person.email}</span>
                </div>
                
                <div className="user-item__detail">
                  <span className="user-item__icon">🔧</span>
                  <span className={`user-item__role ${getRoleColor(user.role.name)}`}>
                    {user.role.name}
                  </span>
                </div>
                
                <div className="user-item__detail">
                  <span className="user-item__icon">🆔</span>
                  <span className="user-item__text">ID: {user.id_user}</span>
                </div>
              </div>

              <div className="user-item__description">
                {user.status ? 
                  'Usuario con acceso completo al sistema' : 
                  'Usuario desactivado - Sin acceso al sistema'
                }
              </div>
            </div>

            {/* Actions */}
            <div className="user-item__actions">
              <EditUserButton user={user} />
              
              <button 
                className={`user-item__btn ${user.status ? 'user-item__btn--deactivate' : 'user-item__btn--activate'}`}
                onClick={() => handleToggleStatus(user)}
                disabled={updateUserStatus.isPending}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={user.status ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 6h10a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"} />
                </svg>
                {updateUserStatus.isPending ? 'Cambiando...' : (user.status ? 'Desactivar' : 'Activar')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;