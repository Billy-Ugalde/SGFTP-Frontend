import { useState, useMemo } from 'react';
import { useFairs, useUpdateFairStatus } from '../Services/FairsServices';
import EditFairButton from './EditFairButton';
import ConfirmationModal from './ConfirmationModal';
import '../Styles/FairsList.css';

interface FairsListProps {
  searchTerm?: string;
  statusFilter?: string;
}

const FairsList = ({ searchTerm = '', statusFilter = 'all' }: FairsListProps) => {
  const { data: fairs, isLoading, error } = useFairs();
  const updateStatus = useUpdateFairStatus();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [fairToToggle, setFairToToggle] = useState<any>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleToggleStatusClick = (fair: any) => {
    setFairToToggle(fair);
    setShowConfirmationModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!fairToToggle) return;
    
    setIsUpdatingStatus(true);
    try {
      await updateStatus.mutateAsync({ 
        id_fair: fairToToggle.id_fair, 
        status: !fairToToggle.status 
      });
      setShowConfirmationModal(false);
      setFairToToggle(null);
    } catch (error) {
      console.error('Error actualizando el estado de la feria:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const cancelToggleStatus = () => {
    setShowConfirmationModal(false);
    setFairToToggle(null);
  };
  
  const renderFairDate = (dateString: string) => {
    if (!dateString) {
      return <span className="fairs-list__card-info-text">Sin fecha asignada</span>;
    }
    
    try {
      const date = new Date(dateString);
      
      return (
        <span 
          style={{
            display: 'inline-flex',
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            color: '#1e40af',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '0.375rem',
            whiteSpace: 'nowrap'
          }}
        >
          {date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      );
    } catch {
      return <span className="fairs-list__card-info-text">Fecha inválida</span>;
    }
  };

  const filteredFairs = useMemo(() => {
    if (!fairs) return [];
    
    const sortedFairs = [...fairs].sort((a, b) => b.id_fair - a.id_fair);
    
    return sortedFairs.filter(fair => {
      const matchesSearch = fair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fair.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fair.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && fair.status) ||
                           (statusFilter === 'inactive' && !fair.status);
      
      return matchesSearch && matchesStatus;
    });
  }, [fairs, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredFairs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFairs = filteredFairs.slice(startIndex, endIndex);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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
      <div className="fairs-list__loading">
        <div className="fairs-list__loading-content">
          <svg className="fairs-list__loading-spinner" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando ferias...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fairs-list__error">
        <svg className="fairs-list__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="fairs-list__error-title">Error al cargar las ferias</h3>
        <p className="fairs-list__error-text">Por favor intenta refrescar la página</p>
      </div>
    );
  }

  if (!fairs || fairs.length === 0) {
    return (
      <div className="fairs-list__empty">
        <div className="fairs-list__empty-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="fairs-list__empty-title">No hay ferias registradas</h3>
        <p className="fairs-list__empty-text">Comienza creando tu primera feria para la Fundación Parque Tamarindo.</p>
      </div>
    );
  }

  if (filteredFairs.length === 0) {
    return (
      <div>
        {/* Resumen de Estadísticas */}
        <div className="fairs-list__stats">
          <div className="fairs-list__stat-card fairs-list__stat-card--total">
            <div className="fairs-list__stat-content">
              <div className="fairs-list__stat-icon fairs-list__stat-icon--total">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="fairs-list__stat-label fairs-list__stat-label--total">Total de Ferias</p>
                <p className="fairs-list__stat-value fairs-list__stat-value--total">{fairs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="fairs-list__stat-card fairs-list__stat-card--active">
            <div className="fairs-list__stat-content">
              <div className="fairs-list__stat-icon fairs-list__stat-icon--active">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="fairs-list__stat-label fairs-list__stat-label--active">Ferias Activas</p>
                <p className="fairs-list__stat-value fairs-list__stat-value--active">{fairs.filter(fair => fair.status).length}</p>
              </div>
            </div>
          </div>
          
          <div className="fairs-list__stat-card fairs-list__stat-card--inactive">
            <div className="fairs-list__stat-content">
              <div className="fairs-list__stat-icon fairs-list__stat-icon--inactive">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="fairs-list__stat-label fairs-list__stat-label--inactive">Ferias Inactivas</p>
                <p className="fairs-list__stat-value fairs-list__stat-value--inactive">{fairs.filter(fair => !fair.status).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="fairs-list__empty">
          <div className="fairs-list__empty-icon fairs-list__empty-icon--no-results">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="fairs-list__empty-title">No se encontraron ferias</h3>
          <p className="fairs-list__empty-text">
            {searchTerm ? `No hay ferias que coincidan con "${searchTerm}"` : `No se encontraron ferias ${statusFilter === 'active' ? 'activas' : statusFilter === 'inactive' ? 'inactivas' : ''}`}. 
            Intenta ajustar tu búsqueda o criterios de filtro.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fairs-list">
      {/* Modal de Confirmación */}
      <ConfirmationModal
        show={showConfirmationModal}
        onClose={cancelToggleStatus}
        onConfirm={confirmToggleStatus}
        title={fairToToggle?.status ? "¿Desactivar feria?" : "¿Activar feria?"}
        message={
          fairToToggle?.status 
            ? `¿Estás seguro de que deseas desactivar la feria "${fairToToggle?.name}"? Los usuarios no podrán inscribirse hasta que la reactives.`
            : `¿Estás seguro de que deseas activar la feria "${fairToToggle?.name}"? Los usuarios podrán comenzar a inscribirse inmediatamente.`
        }
        confirmText={fairToToggle?.status ? "Sí, desactivar" : "Sí, activar"}
        cancelText="Cancelar"
        type={fairToToggle?.status ? "warning" : "info"}
        isLoading={isUpdatingStatus}
      />

      {/* Resumen de Estadísticas */}
      <div className="fairs-list__stats">
        <div className="fairs-list__stat-card fairs-list__stat-card--total">
          <div className="fairs-list__stat-content">
            <div className="fairs-list__stat-icon fairs-list__stat-icon--total">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="fairs-list__stat-label fairs-list__stat-label--total">Total de Ferias</p>
              <p className="fairs-list__stat-value fairs-list__stat-value--total">{fairs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="fairs-list__stat-card fairs-list__stat-card--active">
          <div className="fairs-list__stat-content">
            <div className="fairs-list__stat-icon fairs-list__stat-icon--active">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="fairs-list__stat-label fairs-list__stat-label--active">Ferias Activas</p>
              <p className="fairs-list__stat-value fairs-list__stat-value--active">{fairs.filter(fair => fair.status).length}</p>
            </div>
          </div>
        </div>
        
        <div className="fairs-list__stat-card fairs-list__stat-card--inactive">
          <div className="fairs-list__stat-content">
            <div className="fairs-list__stat-icon fairs-list__stat-icon--inactive">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="fairs-list__stat-label fairs-list__stat-label--inactive">Ferias Inactivas</p>
              <p className="fairs-list__stat-value fairs-list__stat-value--inactive">{fairs.filter(fair => !fair.status).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Información de paginación */}
      {totalPages > 1 && (
        <div className="fairs-list__pagination-info">
          <p className="fairs-list__results-text">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredFairs.length)} de {filteredFairs.length} ferias
          </p>
        </div>
      )}

      {/* Grid de Ferias */}
      <div className="fairs-list__grid">
        {currentFairs.map(fair => (
          <div key={fair.id_fair} className="fairs-list__card">
            {/* Encabezado de la Tarjeta */}
            <div className="fairs-list__card-header">
              <div className="fairs-list__card-title-row">
                <h3 className="fairs-list__card-title">{fair.name}</h3>
                <span className={`fairs-list__card-status ${fair.status ? 'fairs-list__card-status--active' : 'fairs-list__card-status--inactive'}`}>
                  {fair.status ? '✓ Activa' : '✕ Inactiva'}
                </span>
              </div>
              
              {/* Ubicación */}
              <div className="fairs-list__card-info">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="fairs-list__card-info-text">{fair.location}</span>
              </div>

              {/* Tipo de Feria */}
              <div className="fairs-list__card-info">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="fairs-list__card-info-text">
                  Feria {fair.typeFair === 'interna' ? 'Interna' : 'Externa'}
                </span>
              </div>
              
              {/* Fecha */}
              <div className="fairs-list__card-info">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {renderFairDate(fair.date)}
              </div>
              
              {/* Capacidad */}
              <div className="fairs-list__card-info">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="fairs-list__card-info-text">{fair.stand_capacity} stands disponibles</span>
              </div>
            </div>

            {/* Cuerpo de la Tarjeta */}
            <div className="fairs-list__card-body">
              <p className="fairs-list__card-description">
                {fair.description}
              </p>

              {/* Acciones */}
              <div className="fairs-list__card-actions">
                <EditFairButton fair={fair} />
                
                <button
                  onClick={() => handleToggleStatusClick(fair)}
                  disabled={updateStatus.isPending}
                  className={`fairs-list__toggle-btn ${fair.status ? 'fairs-list__toggle-btn--active' : 'fairs-list__toggle-btn--inactive'} ${updateStatus.isPending ? 'fairs-list__toggle-btn--loading' : ''}`}
                >
                  {updateStatus.isPending ? (
                    <>
                      <svg className="fairs-list__toggle-spinner" fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      {fair.status ? 'Desactivar' : 'Activar'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="fairs-list__pagination">
          {/* Botón Anterior */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="fairs-list__pagination-btn fairs-list__pagination-btn--prev"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          {/* Números de página */}
          <div className="fairs-list__pagination-numbers">
            {currentPage > 3 && totalPages > 5 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="fairs-list__pagination-number"
                >
                  1
                </button>
                <span className="fairs-list__pagination-ellipsis">...</span>
              </>
            )}

            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`fairs-list__pagination-number ${currentPage === page ? 'fairs-list__pagination-number--active' : ''}`}
              >
                {page}
              </button>
            ))}

            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                <span className="fairs-list__pagination-ellipsis">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="fairs-list__pagination-number"
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
            className="fairs-list__pagination-btn fairs-list__pagination-btn--next"
          >
            Siguiente
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default FairsList;