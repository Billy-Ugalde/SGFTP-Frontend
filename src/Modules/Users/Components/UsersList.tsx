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

            {/* User Info - Como en la imagen con iconos */}
            <div className="user-item__content">
              <h3 className="user-item__name">{getFullName(user.person)}</h3>
              
              <div className="user-item__details">
                <div className="user-item__detail">
                  <svg className="user-item__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <span className="user-item__text">{user.person.email}</span>
                </div>
                
                <div className="user-item__detail">
                  <svg className="user-item__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="user-item__text">{getPrimaryPhone(user.person.phones)}</span>
                </div>
                
                <div className="user-item__detail">
                  <svg className="user-item__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className={`user-item__role ${getRoleColor(user.role.name)}`}>
                    {user.role.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions - Solo dos botones */}
            <div className="user-item__actions">
              <EditUserButton user={user} />
              
              <button 
                className={`user-item__btn ${user.status ? 'user-item__btn--deactivate' : 'user-item__btn--activate'}`}
                onClick={() => handleToggleStatus(user)}
                disabled={updateUserStatus.isPending}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={user.status ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
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