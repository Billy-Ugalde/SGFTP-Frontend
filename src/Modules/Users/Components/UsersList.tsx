import { useState, useMemo } from "react";
import { Users, UserCheck, UserX, UserCircle, ShieldCheck } from "lucide-react";
import { useUsers, useUpdateUserStatus } from "../Services/UserService";
import type { User } from "../Services/UserService";
import EditUserForm from "./EditUserForm";
import GenericModal from '../../Entrepreneurs/Components/GenericModal';
import ConfirmationModal from '../../Shared/components/ConfirmationModal';
import { copyToggleActive } from '../../Shared/utils/confirmationCopy';
import "../Styles/UsersList.css";
import "../../Shared/styles/ListState.css";
import { ListState, useSuccessAlert } from "../../Shared/components";
import { formatPhoneForDisplay } from "../../../shared/utils/phone.utils";

type UserDetailTabsProps = {
  user: User;
  getPrimaryPhone: (p?: string) => string;
  getRoleBadgeClass: (name: string) => string;
  getRoleDisplayName: (name: string) => string;
};

type DetailTab = 'personal' | 'access';

function UserDetailTabs({ user, getPrimaryPhone, getRoleBadgeClass, getRoleDisplayName }: UserDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('personal');

  return (
    <div className="user-detail">
      {/* Tabs */}
      <div className="user-detail__tabs">
        <button
          className={`user-detail__tab ${activeTab === 'personal' ? 'user-detail__tab--active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <UserCircle size={18} />
          Datos Personales
        </button>
        <button
          className={`user-detail__tab ${activeTab === 'access' ? 'user-detail__tab--active' : ''}`}
          onClick={() => setActiveTab('access')}
        >
          <ShieldCheck size={18} />
          Acceso y Permisos
        </button>
      </div>

      {/* Tab: Datos Personales */}
      {activeTab === 'personal' && (
        <div className="user-detail__tab-content">
          <div className="user-detail__section">
            <h4 className="user-detail__section-title">Información Personal</h4>
            <div className="user-detail__info-grid">
              <div className="user-detail__info-item">
                <span className="user-detail__label">Primer nombre</span>
                <p className="user-detail__text">{user.person.first_name}</p>
              </div>
              {user.person.second_name && (
                <div className="user-detail__info-item">
                  <span className="user-detail__label">Segundo nombre</span>
                  <p className="user-detail__text">{user.person.second_name}</p>
                </div>
              )}
              <div className="user-detail__info-item">
                <span className="user-detail__label">Primer apellido</span>
                <p className="user-detail__text">{user.person.first_lastname}</p>
              </div>
              <div className="user-detail__info-item">
                <span className="user-detail__label">Segundo apellido</span>
                <p className="user-detail__text">{user.person.second_lastname}</p>
              </div>
            </div>
          </div>

          <div className="user-detail__section">
            <h4 className="user-detail__section-title">Contacto</h4>
            <div className="user-detail__info-grid">
              <div className="user-detail__info-item user-detail__info-item--full">
                <span className="user-detail__label">Correo electrónico</span>
                <p className="user-detail__text">{user.person.email}</p>
              </div>
              <div className="user-detail__info-item">
                <span className="user-detail__label">Teléfono principal</span>
                <p className="user-detail__text">{getPrimaryPhone(user.person.phone_primary)}</p>
              </div>
              {user.person.phone_secondary && (
                <div className="user-detail__info-item">
                  <span className="user-detail__label">Teléfono secundario</span>
                  <p className="user-detail__text">{getPrimaryPhone(user.person.phone_secondary)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Acceso y Permisos */}
      {activeTab === 'access' && (
        <div className="user-detail__tab-content">
          <div className="user-detail__section">
            <h4 className="user-detail__section-title">Estado de la Cuenta</h4>
            <div className="user-detail__info-grid">
              <div className="user-detail__info-item">
                <span className="user-detail__label">Estado</span>
                <span className={`users-list__status-pill ${user.status ? 'users-list__status-pill--active' : 'users-list__status-pill--inactive'}`}>
                  {user.status ? '✓ Activo' : '✕ Inactivo'}
                </span>
              </div>
            </div>
          </div>

          <div className="user-detail__section">
            <h4 className="user-detail__section-title">Roles Asignados</h4>
            <div className="user-detail__info-grid">
              <div className="user-detail__info-item user-detail__info-item--full">
                <span className="user-detail__label">Roles</span>
                <div className="users-list__roles" style={{ marginTop: '0.5rem' }}>
                  {user.roles.map(role => (
                    <span key={role.id_role} className={`users-list__role-badge ${getRoleBadgeClass(role.name)}`}>
                      {getRoleDisplayName(role.name)}
                    </span>
                  ))}
                  {user.roles.length === 0 && <span className="users-list__no-role">Sin rol asignado</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface UsersListProps {
  searchTerm: string;
  statusFilter: string;
  roleFilter: string;
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

const UsersList: React.FC<UsersListProps> = ({ searchTerm, statusFilter, roleFilter }) => {
  const { data: users = [], isLoading, error, refetch } = useUsers();
  const updateUserStatus = useUpdateUserStatus();
  const { showSuccess } = useSuccessAlert();

  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusUser, setPendingStatusUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMessage, setActionMessage] = useState<{ type: 'error'; text: string } | null>(null);
  const itemsPerPage = 10;

  const showError = (text: string) => {
    setActionMessage({ type: 'error', text });
    setTimeout(() => setActionMessage(null), 3500);
  };

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status).length;
    const inactive = users.filter((u) => !u.status).length;
    return { total, active, inactive };
  }, [users]);

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
      const action = pendingStatusUser.status ? 'desactivado' : 'activado';
      showSuccess(`Usuario ${action} exitosamente.`);
    } catch (err) {
      console.error("Error updating user status:", err);
      showError('Error al actualizar el estado del usuario');
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
    [person.first_name, person.second_name, person.first_lastname, person.second_lastname]
      .filter(Boolean)
      .join(' ');

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

  if (isLoading || error) {
    return (
      <ListState
        isLoading={isLoading}
        error={error}
        loadingText="Cargando usuarios..."
        errorTitle="No se pudieron cargar los usuarios"
        errorDescription="Hubo un problema al obtener la informacion. Verifica tu conexion e intentalo nuevamente."
        onRetry={refetch}
      />
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

  const userStatusCopy = pendingStatusUser
    ? copyToggleActive({
        resourceWord: 'usuario',
        resourcePhrase: 'al usuario',
        name: getFullName(pendingStatusUser.person),
        turningOff: pendingStatusUser.status,
        offDetail: 'No podrá acceder al sistema.',
        onDetail: 'Podrá acceder al sistema.',
      })
    : { title: '', message: '', confirmText: '' };

  return (
    <>
      <div className="users-list">
        {/* Action alert */}
        {actionMessage && (
          <div className={`users-list__alert users-list__alert--${actionMessage.type}`}>
            {actionMessage.text}
          </div>
        )}

        {/* ── Estadísticas ── */}
        <div className="users-list__stats">
          {/* Total */}
          <div className="users-list__stat-card">
            <div className="users-list__stat-content">
              <div className="users-list__stat-icon users-list__stat-icon--total">
                <Users strokeWidth={1.75} />
              </div>
              <div className="users-list__stat-info">
                <p className="users-list__stat-label">Total usuarios</p>
                <p className="users-list__stat-value">{stats.total}</p>
              </div>
            </div>
          </div>

          {/* Activos */}
          <div className="users-list__stat-card">
            <div className="users-list__stat-content">
              <div className="users-list__stat-icon users-list__stat-icon--active">
                <UserCheck strokeWidth={1.75} />
              </div>
              <div className="users-list__stat-info">
                <p className="users-list__stat-label">Activos</p>
                <p className="users-list__stat-value">{stats.active}</p>
              </div>
            </div>
          </div>

          {/* Inactivos */}
          <div className="users-list__stat-card">
            <div className="users-list__stat-content">
              <div className="users-list__stat-icon users-list__stat-icon--inactive">
                <UserX strokeWidth={1.75} />
              </div>
              <div className="users-list__stat-info">
                <p className="users-list__stat-label">Inactivos</p>
                <p className="users-list__stat-value">{stats.inactive}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Result count */}
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
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th className="users-list__td--phone">Teléfono</th>
                    <th>Roles</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.id_user}>
                      <td className="users-list__td--name" title={getFullName(user.person)}>
                        {getFullName(user.person).length > 29 ? getFullName(user.person).slice(0, 29) + '...' : getFullName(user.person)}
                      </td>
                      <td className="users-list__td--email">{user.person.email}</td>
                      <td className="users-list__td--phone">{getPrimaryPhone(user.person.phone_primary)}</td>
                      <td className="users-list__td--roles">
                        <div className="users-list__roles">
                          {user.roles.length === 0 && <span className="users-list__no-role">Sin rol</span>}
                          {user.roles.length > 0 && (
                            <>
                              <span className={`users-list__role-badge ${getRoleBadgeClass(user.roles[0].name)}`}>
                                {getRoleDisplayName(user.roles[0].name)}
                              </span>
                              {user.roles.length > 1 && (
                                <span className="users-list__role-more">+{user.roles.length - 1} más</span>
                              )}
                            </>
                          )}
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
                            className="users-list__btn users-list__btn--view"
                            onClick={() => setViewingUser(user)}
                            title="Ver"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver
                          </button>
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
            {filteredUsers.length > 0 && (
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

      </div>

      <GenericModal
        show={!!viewingUser}
        onClose={() => setViewingUser(null)}
        title="Detalle de Usuario"
        size="xl"
        maxHeight
      >
        {viewingUser && <UserDetailTabs user={viewingUser} getPrimaryPhone={getPrimaryPhone} getRoleBadgeClass={getRoleBadgeClass} getRoleDisplayName={getRoleDisplayName} />}
      </GenericModal>

      <GenericModal
        show={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Editar Usuario"
        size="xl"
        maxHeight
      >
        {editingUser && (
          <EditUserForm
            user={editingUser}
            onSuccess={() => {
              setEditingUser(null);
            }}
          />
        )}
      </GenericModal>

      <ConfirmationModal
        show={showStatusModal}
        onClose={handleCancelStatusChange}
        onConfirm={handleConfirmStatusChange}
        title={userStatusCopy.title}
        message={userStatusCopy.message}
        confirmText={userStatusCopy.confirmText}
        cancelText="Cancelar"
        type={pendingStatusUser?.status ? "warning" : "info"}
        isLoading={updateUserStatus.isPending}
      />
    </>
  );
};

export default UsersList;
