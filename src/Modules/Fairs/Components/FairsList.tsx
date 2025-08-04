import { useFairs, useUpdateFairStatus } from '../Services/FairsServices';
import EditFairButton from './EditFairButton';
import '../Styles/FairsList.css';

interface FairsListProps {
  searchTerm?: string;
  statusFilter?: string;
}

const FairsList = ({ searchTerm = '', statusFilter = 'all' }: FairsListProps) => {
  const { data: fairs, isLoading, error } = useFairs();
  const updateStatus = useUpdateFairStatus();

  const toggleStatus = async (fair: any) => {
    try {
      await updateStatus.mutateAsync({ id_fair: fair.id_fair, status: !fair.status });
    } catch (error) {
      console.error('Error updating fair status:', error);
    }
  };

  // Filtrar ferias basado en búsqueda y estado
  const filteredFairs = fairs?.filter(fair => {
    const matchesSearch = fair.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fair.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fair.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && fair.status) ||
                         (statusFilter === 'inactive' && !fair.status);
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="fairs-list__loading">
        <div className="fairs-list__loading-content">
          <svg className="fairs-list__loading-spinner" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading fairs...
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
        <h3 className="fairs-list__error-title">Error loading fairs</h3>
        <p className="fairs-list__error-text">Please try refreshing the page</p>
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
        <h3 className="fairs-list__empty-title">No fairs registered</h3>
        <p className="fairs-list__empty-text">Get started by creating your first fair for Tamarindo Park Foundation.</p>
        <div className="fairs-list__empty-emoji">🌿</div>
      </div>
    );
  }

  if (filteredFairs.length === 0) {
    return (
      <div>
        {/* Stats Summary */}
        <div className="fairs-list__stats">
          {/* Total Fairs */}
          <div className="fairs-list__stat-card fairs-list__stat-card--total">
            <div className="fairs-list__stat-content">
              <div className="fairs-list__stat-icon fairs-list__stat-icon--total">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="fairs-list__stat-label fairs-list__stat-label--total">Total Fairs</p>
                <p className="fairs-list__stat-value fairs-list__stat-value--total">{fairs.length}</p>
              </div>
            </div>
          </div>
          
          {/* Active Fairs */}
          <div className="fairs-list__stat-card fairs-list__stat-card--active">
            <div className="fairs-list__stat-content">
              <div className="fairs-list__stat-icon fairs-list__stat-icon--active">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="fairs-list__stat-label fairs-list__stat-label--active">Active Fairs</p>
                <p className="fairs-list__stat-value fairs-list__stat-value--active">{fairs.filter(fair => fair.status).length}</p>
              </div>
            </div>
          </div>
          
          {/* Inactive Fairs */}
          <div className="fairs-list__stat-card fairs-list__stat-card--inactive">
            <div className="fairs-list__stat-content">
              <div className="fairs-list__stat-icon fairs-list__stat-icon--inactive">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="fairs-list__stat-label fairs-list__stat-label--inactive">Inactive Fairs</p>
                <p className="fairs-list__stat-value fairs-list__stat-value--inactive">{fairs.filter(fair => !fair.status).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* No Results Message */}
        <div className="fairs-list__empty">
          <div className="fairs-list__empty-icon fairs-list__empty-icon--no-results">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="fairs-list__empty-title">No fairs found</h3>
          <p className="fairs-list__empty-text">
            {searchTerm ? `No fairs match "${searchTerm}"` : `No ${statusFilter} fairs found`}. 
            Try adjusting your search or filter criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fairs-list">
      {/* Stats Summary */}
      <div className="fairs-list__stats">
        {/* Total Fairs */}
        <div className="fairs-list__stat-card fairs-list__stat-card--total">
          <div className="fairs-list__stat-content">
            <div className="fairs-list__stat-icon fairs-list__stat-icon--total">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="fairs-list__stat-label fairs-list__stat-label--total">Total Fairs</p>
              <p className="fairs-list__stat-value fairs-list__stat-value--total">{fairs.length}</p>
            </div>
          </div>
        </div>
        
        {/* Active Fairs */}
        <div className="fairs-list__stat-card fairs-list__stat-card--active">
          <div className="fairs-list__stat-content">
            <div className="fairs-list__stat-icon fairs-list__stat-icon--active">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="fairs-list__stat-label fairs-list__stat-label--active">Active Fairs</p>
              <p className="fairs-list__stat-value fairs-list__stat-value--active">{fairs.filter(fair => fair.status).length}</p>
            </div>
          </div>
        </div>
        
        {/* Inactive Fairs */}
        <div className="fairs-list__stat-card fairs-list__stat-card--inactive">
          <div className="fairs-list__stat-content">
            <div className="fairs-list__stat-icon fairs-list__stat-icon--inactive">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="fairs-list__stat-label fairs-list__stat-label--inactive">Inactive Fairs</p>
              <p className="fairs-list__stat-value fairs-list__stat-value--inactive">{fairs.filter(fair => !fair.status).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fairs Grid */}
      <div className="fairs-list__grid">
        {filteredFairs.map(fair => (
          <div key={fair.id_fair} className="fairs-list__card">
            {/* Card Header */}
            <div className="fairs-list__card-header">
              <div className="fairs-list__card-title-row">
                <h3 className="fairs-list__card-title">{fair.name}</h3>
                <span className={`fairs-list__card-status ${fair.status ? 'fairs-list__card-status--active' : 'fairs-list__card-status--inactive'}`}>
                  {fair.status ? '✓ Active' : '✕ Inactive'}
                </span>
              </div>
              
              {/* Location */}
              <div className="fairs-list__card-info">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="fairs-list__card-info-text">{fair.location}</span>
              </div>
              
              {/* Capacity */}
              <div className="fairs-list__card-info">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="fairs-list__card-info-text">{fair.stand_capacity} stands capacity</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="fairs-list__card-body">
              <p className="fairs-list__card-description">
                {fair.description}
              </p>

              {/* Actions */}
              <div className="fairs-list__card-actions">
                <EditFairButton fair={fair} />
                
                <button
                  onClick={() => toggleStatus(fair)}
                  disabled={updateStatus.isPending}
                  className={`fairs-list__toggle-btn ${fair.status ? 'fairs-list__toggle-btn--active' : 'fairs-list__toggle-btn--inactive'} ${updateStatus.isPending ? 'fairs-list__toggle-btn--loading' : ''}`}
                >
                  {updateStatus.isPending ? (
                    <>
                      <svg className="fairs-list__toggle-spinner" fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      {fair.status ? 'Deactivate' : 'Activate'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FairsList;