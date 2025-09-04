import React, { useState } from 'react';
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
      'Administrador': 'role-admin',
      'Usuario': 'role-user',  
      'Visitante': 'role-user',
      'Moderador': 'role-moderator',
    };
    return roleColors[roleName] || 'role-default';
  };

  const getPhoneTypeDisplay = (type: string) => {
    return type === 'personal' ? 'Personal' : 'Trabajo';
  };

  const getPrimaryPhone = (phones?: any[]) => {
    if (!phones || phones.length === 0) return 'Sin teléfono';
    const primaryPhone = phones.find(phone => phone.is_primary) || phones[0];
    return `${primaryPhone.number} (${getPhoneTypeDisplay(primaryPhone.type)})`;
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
                {user.status ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>

            {/* User Info - Simplificado */}
            <div className="user-item__content">
              <h3 className="user-item__name">{getFullName(user.person)}</h3>
              
              <div className="user-item__details">
                <div className="user-item__detail">
                  <span className="user-item__text">{user.person.email}</span>
                </div>
                
                <div className="user-item__detail">
                  <span className="user-item__text">{getPrimaryPhone(user.person.phones)}</span>
                </div>
                
                <div className="user-item__detail">
                  <span className={`user-item__role ${getRoleColor(user.role.name)}`}>
                    {user.role.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="user-item__actions">
              <button 
                className="user-item__btn user-item__btn--details"
                onClick={() => setSelectedUser(user)}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Detalles
              </button>
              
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

      {/* Modal de Detalles */}
      {selectedUser && (
        <div className="user-details-modal">
          <div className="user-details-modal__backdrop" onClick={() => setSelectedUser(null)} />
          <div className="user-details-modal__content">
            <div className="user-details-modal__header">
              <h2 className="user-details-modal__title">Detalles del Usuario</h2>
              <button 
                className="user-details-modal__close"
                onClick={() => setSelectedUser(null)}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="user-details-modal__body">
              <div className="user-details-section">
                <h3 className="user-details-section__title">Información Personal</h3>
                <div className="user-details-grid">
                  <div className="user-details-item">
                    <span className="user-details-label">Nombre Completo:</span>
                    <span className="user-details-value">{getFullName(selectedUser.person)}</span>
                  </div>
                  <div className="user-details-item">
                    <span className="user-details-label">Email:</span>
                    <span className="user-details-value">{selectedUser.person.email}</span>
                  </div>
                  <div className="user-details-item">
                    <span className="user-details-label">ID Usuario:</span>
                    <span className="user-details-value">{selectedUser.id_user}</span>
                  </div>
                  <div className="user-details-item">
                    <span className="user-details-label">ID Persona:</span>
                    <span className="user-details-value">{selectedUser.person.id_person}</span>
                  </div>
                </div>
              </div>

              <div className="user-details-section">
                <h3 className="user-details-section__title">Información del Sistema</h3>
                <div className="user-details-grid">
                  <div className="user-details-item">
                    <span className="user-details-label">Rol:</span>
                    <span className={`user-details-value user-details-role ${getRoleColor(selectedUser.role.name)}`}>
                      {selectedUser.role.name}
                    </span>
                  </div>
                  <div className="user-details-item">
                    <span className="user-details-label">Estado:</span>
                    <span className={`user-details-value user-details-status ${selectedUser.status ? 'user-details-status--active' : 'user-details-status--inactive'}`}>
                      {selectedUser.status ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedUser.person.phones && selectedUser.person.phones.length > 0 && (
                <div className="user-details-section">
                  <h3 className="user-details-section__title">Teléfonos</h3>
                  <div className="user-details-phones">
                    {selectedUser.person.phones.map((phone, index) => (
                      <div key={index} className="user-details-phone">
                        <span className="user-details-phone__number">{phone.number}</span>
                        <span className="user-details-phone__type">({getPhoneTypeDisplay(phone.type)})</span>
                        {phone.is_primary && <span className="user-details-phone__primary">Principal</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;