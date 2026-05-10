import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { CalendarDays, LayoutGrid, Table } from 'lucide-react';
import ActivityList from '../Components/ActivityList';
import AddActivityButton from '../Components/AddActivityButton';

const AddActivityForm          = lazy(() => import('../Components/AddActivityForm'));
const EditActivityForm         = lazy(() => import('../Components/EditActivityForm'));
const ChangeActivityStatusModal = lazy(() => import('../Components/ChangeActivityStatusModal'));
const ActivityDetailsModal     = lazy(() => import('../Components/ActivityDetailsModal'));
const ActivityEnrollmentsModal = lazy(() => import('../Components/ActivityEnrollmentsModal'));
import BackToDashboardButton from '../../Shared/components/BackToDashboardButton';
import { ListState } from '../../Shared/components';
import StatusFilter from '../../Shared/components/StatusFilter';
import WorkStatusFilter from '../../Projects/Components/WorkStatusFilter';
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useToggleActivityActive,
  useUpdateActivityStatus,
  transformFormDataToDto,
  type Activity,
  type ActivityFormData,
  type UpdateActivityDto,
} from '../Services/ActivityService';
import '../Styles/ActivitiesPage.css';

const ActivitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'planning' | 'execution' | 'suspended' | 'finished'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activityToChangeStatus, setActivityToChangeStatus] = useState<Activity | null>(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'table' ? 10 : 9;

  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [selectedActivityForEnrollments, setSelectedActivityForEnrollments] = useState<Activity | null>(null);

  const { data: activities = [], isLoading: loadingActivities, error, refetch } = useActivities();
  const addActivity = useCreateActivity();
  const updateMutation = useUpdateActivity();
  const toggleActivityActive = useToggleActivityActive();
  const updateActivityStatus = useUpdateActivityStatus();

  const filteredActivities = useMemo(() => {
    const filtered = activities.filter((activity: any) => {
      const matchesSearch =
        activity.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.Aim.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || activity.Status_activity === statusFilter;
      const matchesActive = activeFilter === 'all' ||
        (activeFilter === 'active' && activity.Active) ||
        (activeFilter === 'inactive' && !activity.Active);

      return matchesSearch && matchesStatus && matchesActive;
    });

    return filtered.sort((a: any, b: any) => {
      const dateA = new Date(a.Registration_date).getTime();
      const dateB = new Date(b.Registration_date).getTime();
      return dateB - dateA;
    });
  }, [activities, searchTerm, statusFilter, activeFilter]);

  const stats = useMemo(() => {
    return {
      total: filteredActivities.length,
      active: filteredActivities.filter((activity: any) => activity.Active).length,
      inactive: filteredActivities.filter((activity: any) => !activity.Active).length,
    };
  }, [filteredActivities]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const buildPages = (current: number, total: number): (number | '...')[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [];
    pages.push(1);
    if (current <= 4) {
      for (let i = 2; i <= 5; i++) pages.push(i);
      pages.push('...');
    } else if (current >= total - 3) {
      pages.push('...');
      for (let i = total - 4; i <= total - 1; i++) pages.push(i);
    } else {
      pages.push('...');
      pages.push(current - 1);
      pages.push(current);
      pages.push(current + 1);
      pages.push('...');
    }
    pages.push(total);
    return pages;
  };

  const handleCreateActivity = useCallback(async (value: ActivityFormData, images?: File[]) => {
    const dto = transformFormDataToDto(value);
    await addActivity.mutateAsync({ activityData: dto, images });
    setCurrentPage(1);
    setShowAddModal(false);
  }, [addActivity]);

  const handleUpdateActivity = useCallback(async (id: number, data: UpdateActivityDto, images?: { [key: string]: File }) => {
    await updateMutation.mutateAsync({ id, data, images });
    setShowEditModal(false);
    setSelectedActivity(null);
  }, [updateMutation]);

  const handleViewActivity = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  }, []);

  const handleEditActivity = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
    setShowEditModal(true);
  }, []);

  const handleToggleActive = useCallback(async (activity: Activity) => {
    if (!activity.Id_activity) return;
    await toggleActivityActive.mutateAsync({
      id_activity: activity.Id_activity,
      active: !activity.Active
    });
  }, [toggleActivityActive]);

  const handleChangeStatusClick = useCallback((activity: Activity) => {
    setActivityToChangeStatus(activity);
    setShowStatusModal(true);
  }, []);

  const confirmChangeStatus = useCallback(async (newStatus: Activity['Status_activity']) => {
    if (!activityToChangeStatus?.Id_activity) return;

    try {
      await updateActivityStatus.mutateAsync({
        id_activity: activityToChangeStatus.Id_activity,
        status: newStatus
      });

      setShowStatusModal(false);
      setActivityToChangeStatus(null);
    } catch {
      // error manejado por React Query
    }
  }, [activityToChangeStatus, updateActivityStatus]);

  const handleViewEnrollments = useCallback((activity: Activity) => {
    setSelectedActivityForEnrollments(activity);
    setShowEnrollmentsModal(true);
  }, []);

  return (
    <div className="activities-dashboard">
      {/* Header compacto — igual al de emprendedores */}
      <div className="activities-dashboard__header">
        <div className="activities-dashboard__header-inner">
          <div className="activities-dashboard__header-left">
            <div className="activities-dashboard__header-icon">
              <CalendarDays size={18} strokeWidth={2} />
            </div>
            <h1 className="activities-dashboard__title">Gestión de Actividades</h1>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      <div className="activities-dashboard__main">
        {/* ── Barra de acción independiente (igual a emprendedores) ── */}
        <div className="activities-dashboard__action-bar">
          <WorkStatusFilter
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
          <StatusFilter
            statusFilter={activeFilter}
            onStatusChange={setActiveFilter}
          />

          <div className="activities-dashboard__search-wrapper">
            <div className="activities-dashboard__search-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar actividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="activities-dashboard__search-input"
            />
          </div>

          <div className="activities-dashboard__view-toggle">
            <button onClick={() => setViewMode('cards')} className={viewMode === 'cards' ? 'active' : ''} type="button">
              <LayoutGrid size={16} strokeWidth={2} />
              Cards
            </button>
            <button onClick={() => setViewMode('table')} className={viewMode === 'table' ? 'active' : ''} type="button">
              <Table size={16} strokeWidth={2} />
              Tabla
            </button>
          </div>

          <AddActivityButton onClick={() => setShowAddModal(true)} />
        </div>

        <div className="activities-list__stats">
          <div className="activities-list__stat-card activities-list__stat-card--total">
            <div className="activities-list__stat-content">
              <div className="activities-list__stat-icon activities-list__stat-icon--total">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <div>
                <p className="activities-list__stat-label activities-list__stat-label--total">Total Actividades</p>
                <p className="activities-list__stat-value activities-list__stat-value--total">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="activities-list__stat-card activities-list__stat-card--active">
            <div className="activities-list__stat-content">
              <div className="activities-list__stat-icon activities-list__stat-icon--active">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="activities-list__stat-label activities-list__stat-label--active">Activos</p>
                <p className="activities-list__stat-value activities-list__stat-value--active">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="activities-list__stat-card activities-list__stat-card--inactive">
            <div className="activities-list__stat-content">
              <div className="activities-list__stat-icon activities-list__stat-icon--inactive">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="activities-list__stat-label activities-list__stat-label--inactive">Inactivos</p>
                <p className="activities-list__stat-value activities-list__stat-value--inactive">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </div>

        {loadingActivities || error ? (
          <ListState
            isLoading={loadingActivities}
            error={error}
            loadingText="Cargando actividades..."
            errorTitle="No se pudieron cargar las actividades"
            errorDescription="Hubo un problema al obtener la informacion. Verifica tu conexion e intentalo nuevamente."
            onRetry={refetch}
          />
        ) : filteredActivities.length === 0 ? (
          <div className="activities-list__empty">
            <div className="activities-list__empty-icon">
              <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h4 className="activities-list__empty-title">No se encontraron actividades</h4>
            <p className="activities-list__empty-desc">Intenta ajustar los filtros para ver más resultados.</p>
          </div>
        ) : (
          <>
            <ActivityList
              activities={currentActivities}
              onView={handleViewActivity}
              onEdit={handleEditActivity}
              onToggleActive={handleToggleActive}
              onChangeStatus={handleChangeStatusClick}
              onViewEnrollments={handleViewEnrollments}
              viewMode={viewMode}
            />

            {filteredActivities.length > 0 && <div className="activities-list__pagination">
              <div className="activities-list__pagination-btns">
                <button
                  className="activities-list__pagination-btn activities-list__pagination-btn--nav"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>

                {buildPages(currentPage, totalPages).map((item, i) =>
                  item === '...' ? (
                    <span key={`dots-${i}`} className="activities-list__pagination-dots">…</span>
                  ) : (
                    <button
                      key={item}
                      className={`activities-list__pagination-btn${item === currentPage ? ' activities-list__pagination-btn--active' : ''}`}
                      onClick={() => handlePageChange(item as number)}
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  className="activities-list__pagination-btn activities-list__pagination-btn--nav"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <span className="activities-list__pagination-info">
                {`${startIndex + 1}–${Math.min(startIndex + itemsPerPage, filteredActivities.length)} de ${filteredActivities.length}`}
              </span>
            </div>}
          </>
        )}
      </div>

      {showAddModal && (
        <Suspense fallback={null}>
          <AddActivityForm
            onSubmit={handleCreateActivity}
            onCancel={() => setShowAddModal(false)}
          />
        </Suspense>
      )}

      {showEditModal && selectedActivity && (
        <Suspense fallback={null}>
          <EditActivityForm
            activity={selectedActivity}
            onSubmit={handleUpdateActivity}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedActivity(null);
            }}
          />
        </Suspense>
      )}

      {activityToChangeStatus && (
        <Suspense fallback={null}>
          <ChangeActivityStatusModal
            show={showStatusModal}
            onClose={() => {
              setShowStatusModal(false);
              setActivityToChangeStatus(null);
            }}
            onConfirm={confirmChangeStatus}
            currentStatus={activityToChangeStatus.Status_activity}
            activityName={activityToChangeStatus.Name}
            isLoading={updateActivityStatus.isPending}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <ActivityDetailsModal
          activity={selectedActivity}
          show={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedActivity(null);
          }}
        />
      </Suspense>

      {selectedActivityForEnrollments && (
        <Suspense fallback={null}>
          <ActivityEnrollmentsModal
            activityId={selectedActivityForEnrollments.Id_activity}
            activityName={selectedActivityForEnrollments.Name}
            activitySpaces={selectedActivityForEnrollments.Spaces}
            show={showEnrollmentsModal}
            onClose={() => {
              setShowEnrollmentsModal(false);
              setSelectedActivityForEnrollments(null);
            }}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ActivitiesPage;
