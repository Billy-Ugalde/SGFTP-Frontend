import { useState, useMemo } from "react";
import { useUsers, useUpdateUserStatus, useRoles } from "../Services/UserService";
import type { User } from "../Services/UserService";
import EditUserForm from "./EditUserForm";
import ConfirmationModal from './ConfirmationModal';
import "../Styles/UsersList.css";
import { formatPhoneForDisplay } from "../../../shared/utils/phone.utils";

interface UsersListProps {
  searchTerm: string;
  statusFilter: string;
}

const getRoleDisplayName = (roleName: string): string => {
  const roleTranslations: Record<string, string> = {
    'super_admin': 'Super Admin',
    'general_admin': 'Admin General',
    'fair_admin': 'Admin Ferias',
    'content_admin': 'Admin Contenido',
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
  const itemsPerPage = 10;

  const handleToggleStatus = (user: User) => {
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
    } catch (err) {
      console.error("Error updating user status:", err);
    } finally {
      setShowStatusModal(false);
      setPendingStatusUser(null);
    }
  };

  const handleCancelStatusChange = () => {
    setShowStatusModal(false);
    setPendingStatusUser(null);
  };

  const getFullName = (person: any) =>
    `${person.first_name} ${person.second_name || ""} ${person.first_lastname} ${person.second_lastname || ""}`.trim();

  const getPrimaryPhone = (phone_primary?: string) =>
    formatPhoneForDisplay(phone_primary) || "—";

  const getRoleBadgeClass = (roleName: string) => {
    const map: Record<string, string> = {
      auditor: "role-auditor",
      content_admin: "role-content-admin",
      entrepreneur: "role-entrepreneur",
      fair_admin: "role-fair-admin",
      general_admin: "role-general-admin",
      super_admin: "role-super-admin",
      volunteer: "role-volunteer",
    };
    return map[roleName] || "role-default";
  };

  const filteredUsers = useMemo(() => {
    const sorted = [...users].sort((a, b) => b.id_user - a.id_user);
    return sorted.filter((user) => {
      const fullName = getFullName(user.person);
      const matchesSearch =
        searchTerm === "" ||
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.person.email.toLowerCase().includes(searchTerm.toLowerCase());
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
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  useMemo(() => { setCurrentPage(1); }, [searchTerm, statusFilter, roleFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="users-list__state">
        <div className="users-list__spinner" />
        <span>Cargando usuarios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-list__state users-list__state--error">
        <p className="users-list__state-title">Error al cargar usuarios</p>
        <p className="users-list__state-desc">{error.message}</p>
        <button onClick={() => refetch()} className="users-list__retry-btn">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="users-list__state">
        <p className="users-list__state-title">No hay usuarios registrados</p>
        <p className="users-list__state-desc">Comienza creando el primer usuario del sistema.</p>
      </div>
    );
  }

  return (
    <>
      <div className="users-list">
        {/* Toolbar: role filter + result count */}
        <div className="users-list__toolbar">
          <div className="users-list__filter-group">
            <label htmlFor="role-filter" className="users-list__filter-label">Rol:</label>
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

          {filteredUsers.length > 0 && (
            <span className="users-list__count">
              {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="users-list__state">
            <p className="users-list__state-title">No se encontraron usuarios</p>
            <p className="users-list__state-desc">
              {searchTerm
                ? `Sin resultados para "${searchTerm}"`
                : "Intenta ajustar los filtros aplicados."}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="users-list__table-wrap">
              <table className="users-list__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Roles</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, idx) => (
                    <tr key={user.id_user}>
                      <td className="users-list__td--num">{startIndex + idx + 1}</td>
                      <td className="users-list__td--name">{getFullName(user.person)}</td>
                      <td className="users-list__td--email">{user.person.email}</td>
                      <td className="users-list__td--phone">{getPrimaryPhone(user.person.phone_primary)}</td>
                      <td className="users-list__td--roles">
                        <div className="users-list__roles">
                          {user.roles.map((role) => (
                            <span key={role.id_role} className={`users-list__role-badge ${getRoleBadgeClass(role.name)}`}>
                              {getRoleDisplayName(role.name)}
                            </span>
                          ))}
                          {user.roles.length === 0 && <span className="users-list__no-role">Sin rol</span>}
                        </div>
                      </td>
                      <td className="users-list__td--status">
                        <span className={`users-list__status-pill ${user.status ? 'users-list__status-pill--active' : 'users-list__status-pill--inactive'}`}>
                          {user.status ? '✓ Activo' : '✕ Inactivo'}
                        </span>
                      </td>
                      <td className="users-list__td--actions">
                        <div className="users-list__actions">
                          <button
                            className="users-list__btn users-list__btn--edit"
                            onClick={() => setEditingUser(user)}
                            title="Editar"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Editar
                          </button>
                          <button
                            className={`users-list__btn users-list__btn--icon-only ${user.status ? 'users-list__btn--deactivate' : 'users-list__btn--activate'}`}
                            onClick={() => handleToggleStatus(user)}
                            disabled={updateUserStatus.isPending}
                            title={user.status ? 'Desactivar' : 'Activar'}
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="users-list__pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="users-list__pagination-btn"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>

                <div className="users-list__pagination-numbers">
                  {currentPage > 3 && totalPages > 5 && (
                    <>
                      <button onClick={() => handlePageChange(1)} className="users-list__pagination-number">1</button>
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
                      <button onClick={() => handlePageChange(totalPages)} className="users-list__pagination-number">{totalPages}</button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="users-list__pagination-btn"
                >
                  Siguiente
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <span className="users-list__pagination-info">
                  {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length}
                </span>
              </div>
            )}
          </>
        )}

        {/* Edit modal */}
        {editingUser && (
          <div className="add-user-modal">
            <div className="add-user-modal__backdrop" onClick={() => setEditingUser(null)} />
            <div className="add-user-modal__content">
              <div className="add-user-modal__header">
                <h2 className="add-user-modal__title">Editar Usuario</h2>
                <button className="add-user-modal__close" onClick={() => setEditingUser(null)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <EditUserForm user={editingUser} onSuccess={() => setEditingUser(null)} />
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        show={showStatusModal}
        onClose={handleCancelStatusChange}
        onConfirm={handleConfirmStatusChange}
        title={pendingStatusUser?.status ? "Confirmar desactivación" : "Confirmar activación"}
        message={
          pendingStatusUser?.status
            ? `¿Desactivar al usuario "${getFullName(pendingStatusUser.person)}"? No podrá acceder al sistema.`
            : `¿Activar al usuario "${getFullName(pendingStatusUser?.person || {})}"? Podrá acceder al sistema.`
        }
        confirmText={pendingStatusUser?.status ? "Desactivar" : "Activar"}
        cancelText="Cancelar"
        type={pendingStatusUser?.status ? "warning" : "info"}
        isLoading={updateUserStatus.isPending}
      />
    </>
  );
};

export default UsersList;
