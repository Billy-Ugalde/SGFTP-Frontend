import { useState, useMemo } from "react";
import { useUsers, useUpdateUserStatus, useRoles } from "../Services/UserService";
import type { User } from "../Services/UserService";
import EditUserForm from "./EditUserForm";
import ConfirmationModal from './ConfirmationModal';
import "../styles/UsersList.css";

interface UsersListProps {
  searchTerm: string;
  statusFilter: string;
}

const getRoleDisplayName = (roleName: string): string => {
    const roleTranslations: Record<string, string> = {
      'super_admin': 'Super Administrador',
      'general_admin': 'Administrador General',
      'fair_admin': 'Administrador de Ferias',
      'content_admin': 'Administrador de Contenido',
      'auditor': 'Auditor',
      'entrepreneur': 'Emprendedor',
      'volunteer': 'Voluntario'
    };
    
    return roleTranslations[roleName] || roleName;
  };

const UsersList: React.FC<UsersListProps> = ({ searchTerm, statusFilter }) => {
  const { data: users = [], isLoading, error, refetch } = useUsers();
  const { data: roles = [] } = useRoles();
  const updateUserStatus = useUpdateUserStatus();

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusUser, setPendingStatusUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const itemsPerPage = 6;

  
  const handleToggleStatus = async (user: User) => {
    setPendingStatusUser(user);
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusUser) return;

    try {
      await updateUserStatus.mutateAsync({
        id_user: pendingStatusUser.id_user,
        status: !pendingStatusUser.status,
      });
      setShowStatusModal(false);
      setPendingStatusUser(null);
    } catch (error) {
      console.error("Error updating user status:", error);
      setShowStatusModal(false);
      setPendingStatusUser(null);
    }
  };

  const handleCancelStatusChange = () => {
    setShowStatusModal(false);
    setPendingStatusUser(null);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
  };

  const getFullName = (person: any) => {
    return `${person.first_name} ${person.second_name || ""} ${
      person.first_lastname
    } ${person.second_lastname || ""}`.trim();
  }

  const getRoleColor = (roleName: string) => {
    const roleColors: { [key: string]: string } = {
      auditor: "role-auditor",
      content_admin: "role-content-admin",
      entrepreneur: "role-entrepreneur", 
      fair_admin: "role-fair-admin",
      general_admin: "role-general-admin",
      super_admin: "role-super-admin",
      volunteer: "role-volunteer",
      Admin: "role-admin",
      Administrador: "role-admin",
      Usuario: "role-user",
      Visitante: "role-user",
      Moderador: "role-moderator",
    };
    return roleColors[roleName] || "role-default";
  };

  const getPhoneTypeDisplay = (type: string) => {
    return type === "personal" ? "Personal" : "Trabajo";
  };

  const getPrimaryPhone = (phones?: any[]) => {
    if (!phones || phones.length === 0) return "Sin teléfono";
    const primaryPhone = phones.find((phone) => phone.is_primary) || phones[0];
    return `${primaryPhone.number} (${getPhoneTypeDisplay(primaryPhone.type)})`;
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    const sortedUsers = [...users].sort((a, b) => b.id_user - a.id_user);
    
    return sortedUsers.filter((user) => {
      const fullName = getFullName(user.person);

      const matchesSearch =
        searchTerm === "" ||
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roles[0]?.name || 'Sin rol'.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.status) ||
        (statusFilter === "inactive" && !user.status);

      const matchesRole =
        roleFilter === "all" ||
        user.roles.some(role => role.id_role === parseInt(roleFilter));

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <div className="users-list">
        <div className="users-list__loading">
          <svg
            className="users-list__loading-spinner"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
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
          <svg
            className="users-list__error-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="users-list__error-title">
              Error al cargar usuarios
            </h3>
            <p className="users-list__error-message">{error.message}</p>
            <button onClick={() => refetch()} className="users-list__retry-btn">
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="users-list">
        <div className="users-list__empty">
          <svg
            className="users-list__empty-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="users-list__empty-title">No hay usuarios registrados</h3>
          <p className="users-list__empty-description">
            Comienza creando el primer usuario del sistema.
          </p>
        </div>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="users-list">
        {/* Filtro por rol - mostrar incluso cuando no hay resultados */}
        <div className="users-list__filters">
          <div className="users-list__filter-group">
            <label htmlFor="role-filter" className="users-list__filter-label">
              Filtrar por rol
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="users-list__filter-select"
            >
              <option value="all">Todos los roles</option>
              {roles.map(role => (
                <option key={role.id_role} value={role.id_role.toString()}>
                  {getRoleDisplayName(role.name)}  {/* ← AGREGAR ESTA FUNCIÓN */}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="users-list__empty">
          <div className="users-list__empty-icon users-list__empty-icon--no-results">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="users-list__empty-title">No se encontraron usuarios</h3>
          <p className="users-list__empty-description">
            {searchTerm 
              ? `No hay usuarios que coincidan con "${searchTerm}"`
              : `No se encontraron usuarios ${
                  statusFilter === 'active' ? 'activos' : 
                  statusFilter === 'inactive' ? 'inactivos' : ''
                }${roleFilter !== 'all' ? ` con el rol ${roles.find(r => r.id_role === parseInt(roleFilter))?.name || ''}` : ''}`
            }. Intenta ajustar tu búsqueda o criterios de filtro.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="users-list">
        {/* Filtro por rol */}
        <div className="users-list__filters">
          <div className="users-list__filter-group">
            <label htmlFor="role-filter" className="users-list__filter-label">
              Filtrar por rol
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="users-list__filter-select"
            >
              <option value="all">Todos los roles</option>
              {roles.map(role => (
                <option key={role.id_role} value={role.id_role.toString()}>
                  {getRoleDisplayName(role.name)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Información de paginación*/}
        {totalPages > 1 && (
          <div className="users-list__pagination-info">
            <p className="users-list__results-text">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
            </p>
          </div>
        )}

        <div className="users-list__grid">
          {currentUsers.map((user) => (
            <div
              key={user.id_user}
              className={`user-item ${
                user.status ? "user-item--active" : "user-item--inactive"
              }`}
            >
              {/* Status Badge */}
              <div className="user-item__status">
                <span
                  className={`status-badge ${
                    user.status
                      ? "status-badge--active"
                      : "status-badge--inactive"
                  }`}
                >
                  {user.status ? "ACTIVO" : "INACTIVO"}
                </span>
              </div>

              {/* User Info */}
              <div className="user-item__content">
                <h3 className="user-item__name">{getFullName(user.person)}</h3>

                <div className="user-item__details">
                  <div className="user-item__detail">
                    <svg
                      className="user-item__icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                    <span className="user-item__text">{user.person.email}</span>
                  </div>

                  <div className="user-item__detail">
                    <svg
                      className="user-item__icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="user-item__text">
                      {getPrimaryPhone(user.person.phones)}
                    </span>
                  </div>

                  <div className="user-item__detail">
                    <div className="user-item__roles">
                      {user.roles.map((role) => (
                        <span 
                          key={role.id_role} 
                          className={`user-item__role ${getRoleColor(role.name)}`}
                        >
                          {getRoleDisplayName(role.name)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="user-item__actions">
                <button
                  className="user-item__btn user-item__btn--edit"
                  onClick={() => handleEditUser(user)}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Editar
                </button>

                <button
                  className={`user-item__btn ${
                    user.status
                      ? "user-item__btn--deactivate"
                      : "user-item__btn--activate"
                  }`}
                  onClick={() => handleToggleStatus(user)}
                  disabled={updateUserStatus.isPending}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  {updateUserStatus.isPending
                    ? "Cambiando..."
                    : user.status
                    ? "Desactivar"
                    : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Controles de Paginación*/}
        {totalPages > 1 && (
          <div className="users-list__pagination">
            {/* Botón Anterior */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="users-list__pagination-btn users-list__pagination-btn--prev"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            {/* Números de página */}
            <div className="users-list__pagination-numbers">
              {currentPage > 3 && totalPages > 5 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="users-list__pagination-number"
                  >
                    1
                  </button>
                  <span className="users-list__pagination-ellipsis">...</span>
                </>
              )}

              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`users-list__pagination-number ${currentPage === page ? 'users-list__pagination-number--active' : ''}`}
                >
                  {page}
                </button>
              ))}

              {currentPage < totalPages - 2 && totalPages > 5 && (
                <>
                  <span className="users-list__pagination-ellipsis">...</span>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="users-list__pagination-number"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            {/* Botón Siguiente */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="users-list__pagination-btn users-list__pagination-btn--next"
            >
              Siguiente
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Modal de edición */}
        {editingUser && (
          <div className="add-user-modal">
            <div className="add-user-modal__backdrop" onClick={handleCloseEdit} />
            <div className="add-user-modal__content">
              <div className="add-user-modal__header">
                <h2 className="add-user-modal__title">Editar Usuario</h2>
                <button
                  className="add-user-modal__close"
                  onClick={handleCloseEdit}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <EditUserForm user={editingUser} onSuccess={handleCloseEdit} />
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para cambio de estado */}
      <ConfirmationModal
        show={showStatusModal}
        onClose={handleCancelStatusChange}
        onConfirm={handleConfirmStatusChange}
        title={
          pendingStatusUser?.status 
            ? "Confirmar desactivación de usuario" 
            : "Confirmar activación de usuario"
        }
        message={
          pendingStatusUser?.status
            ? `¿Estás seguro de que deseas desactivar al usuario "${getFullName(pendingStatusUser.person)}"? El usuario no podrá acceder al sistema.`
            : `¿Estás seguro de que deseas activar al usuario "${getFullName(pendingStatusUser?.person || {})}"? El usuario podrá acceder al sistema.`
        }
        confirmText={pendingStatusUser?.status ? "Desactivar Usuario" : "Activar Usuario"}
        cancelText="Cancelar"
        type={pendingStatusUser?.status ? "warning" : "info"}
        isLoading={updateUserStatus.isPending}
      />
    </>
  );
};

export default UsersList;