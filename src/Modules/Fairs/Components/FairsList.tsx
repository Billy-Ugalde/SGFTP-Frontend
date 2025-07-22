import { useFairs, useUpdateFairStatus } from '../Services/FairsServices';
import EditFairButton from './EditFairButton';

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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem 0'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: 'medium',
          color: '#059669',
          backgroundColor: '#ecfdf5',
          borderRadius: '0.5rem'
        }}>
          <svg style={{
            animation: 'spin 1s linear infinite',
            marginRight: '0.5rem',
            width: '1rem',
            height: '1rem'
          }} fill="none" viewBox="0 0 24 24">
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
      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        <svg style={{
          margin: '0 auto 0.5rem auto',
          height: '3rem',
          width: '3rem',
          color: '#f87171'
        }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 'medium',
          color: '#991b1b',
          margin: '0 0 0.25rem 0'
        }}>Error loading fairs</h3>
        <p style={{
          fontSize: '0.875rem',
          color: '#dc2626',
          margin: 0
        }}>Please try refreshing the page</p>
      </div>
    );
  }

  if (!fairs || fairs.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '3rem',
        textAlign: 'center'
      }}>
        <div style={{
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '4rem',
          width: '4rem',
          borderRadius: '50%',
          backgroundColor: '#ecfdf5',
          marginBottom: '1rem'
        }}>
          <svg style={{
            height: '2rem',
            width: '2rem',
            color: '#059669'
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 'medium',
          color: '#111827',
          margin: '0 0 0.5rem 0'
        }}>No fairs registered</h3>
        <p style={{
          color: '#6b7280',
          margin: '0 0 1rem 0'
        }}>Get started by creating your first fair for Tamarindo Park Foundation.</p>
        <div style={{ fontSize: '2.25rem' }}>🌿</div>
      </div>
    );
  }

  if (filteredFairs.length === 0) {
    return (
      <div>
        {/* Stats Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Total Fairs */}
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '0.5rem',
                backgroundColor: '#d1fae5',
                borderRadius: '0.5rem',
                marginRight: '0.75rem'
              }}>
                <svg style={{
                  height: '1.5rem',
                  width: '1.5rem',
                  color: '#059669'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  color: '#059669',
                  margin: 0
                }}>Total Fairs</p>
                <p style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#064e3b',
                  margin: 0
                }}>{fairs.length}</p>
              </div>
            </div>
          </div>
          
          {/* Active Fairs */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '0.5rem',
                backgroundColor: '#dbeafe',
                borderRadius: '0.5rem',
                marginRight: '0.75rem'
              }}>
                <svg style={{
                  height: '1.5rem',
                  width: '1.5rem',
                  color: '#2563eb'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  color: '#2563eb',
                  margin: 0
                }}>Active Fairs</p>
                <p style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1e3a8a',
                  margin: 0
                }}>{fairs.filter(fair => fair.status).length}</p>
              </div>
            </div>
          </div>
          
          {/* Inactive Fairs */}
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '0.5rem',
                backgroundColor: '#fee2e2',
                borderRadius: '0.5rem',
                marginRight: '0.75rem'
              }}>
                <svg style={{
                  height: '1.5rem',
                  width: '1.5rem',
                  color: '#dc2626'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  color: '#dc2626',
                  margin: 0
                }}>Inactive Fairs</p>
                <p style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#991b1b',
                  margin: 0
                }}>{fairs.filter(fair => !fair.status).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* No Results Message */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <div style={{
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '4rem',
            width: '4rem',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            marginBottom: '1rem'
          }}>
            <svg style={{
              height: '2rem',
              width: '2rem',
              color: '#6b7280'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 'medium',
            color: '#111827',
            margin: '0 0 0.5rem 0'
          }}>No fairs found</h3>
          <p style={{
            color: '#6b7280',
            margin: 0
          }}>
            {searchTerm ? `No fairs match "${searchTerm}"` : `No ${statusFilter} fairs found`}. 
            Try adjusting your search or filter criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Total Fairs */}
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '0.75rem',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: '0.5rem',
              backgroundColor: '#d1fae5',
              borderRadius: '0.5rem',
              marginRight: '0.75rem'
            }}>
              <svg style={{
                height: '1.5rem',
                width: '1.5rem',
                color: '#059669'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: 'medium',
                color: '#059669',
                margin: 0
              }}>Total Fairs</p>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#064e3b',
                margin: 0
              }}>{fairs.length}</p>
            </div>
          </div>
        </div>
        
        {/* Active Fairs */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.75rem',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: '0.5rem',
              backgroundColor: '#dbeafe',
              borderRadius: '0.5rem',
              marginRight: '0.75rem'
            }}>
              <svg style={{
                height: '1.5rem',
                width: '1.5rem',
                color: '#2563eb'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: 'medium',
                color: '#2563eb',
                margin: 0
              }}>Active Fairs</p>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1e3a8a',
                margin: 0
              }}>{fairs.filter(fair => fair.status).length}</p>
            </div>
          </div>
        </div>
        
        {/* Inactive Fairs */}
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.75rem',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: '0.5rem',
              backgroundColor: '#fee2e2',
              borderRadius: '0.5rem',
              marginRight: '0.75rem'
            }}>
              <svg style={{
                height: '1.5rem',
                width: '1.5rem',
                color: '#dc2626'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: 'medium',
                color: '#dc2626',
                margin: 0
              }}>Inactive Fairs</p>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#991b1b',
                margin: 0
              }}>{fairs.filter(fair => !fair.status).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fairs Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredFairs.map(fair => (
          <div key={fair.id_fair} style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out'
          }}>
            {/* Card Header */}
            <div style={{
              background: 'linear-gradient(to right, #ecfdf5, #d1fae5)',
              padding: '1.5rem',
              borderBottom: '1px solid #a7f3d0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0
                }}>{fair.name}</h3>
                <span style={{
                  display: 'inline-flex',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  borderRadius: '9999px',
                  backgroundColor: fair.status ? '#dcfce7' : '#fee2e2',
                  color: fair.status ? '#166534' : '#991b1b',
                  border: fair.status ? '1px solid #bbf7d0' : '1px solid #fecaca'
                }}>
                  {fair.status ? '✓ Active' : '✕ Inactive'}
                </span>
              </div>
              
              {/* Location */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                color: '#6b7280',
                marginBottom: '0.5rem'
              }}>
                <svg style={{
                  height: '1rem',
                  width: '1rem',
                  marginRight: '0.5rem',
                  color: '#059669'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span style={{ fontSize: '0.875rem', fontWeight: 'medium' }}>{fair.location}</span>
              </div>
              
              {/* Capacity */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                color: '#6b7280'
              }}>
                <svg style={{
                  height: '1rem',
                  width: '1rem',
                  marginRight: '0.5rem',
                  color: '#059669'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span style={{ fontSize: '0.875rem', fontWeight: 'medium' }}>{fair.stand_capacity} stands capacity</span>
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '1.5rem' }}>
              <p style={{
                color: '#374151',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                marginBottom: '1.5rem',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {fair.description}
              </p>

              {/* Actions */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <EditFairButton fair={fair} />
                
                <button
                  onClick={() => toggleStatus(fair)}
                  disabled={updateStatus.isPending}
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 'medium',
                    borderRadius: '0.5rem',
                    border: '1px solid',
                    cursor: updateStatus.isPending ? 'not-allowed' : 'pointer',
                    opacity: updateStatus.isPending ? 0.5 : 1,
                    transition: 'all 0.2s ease-in-out',
                    borderColor: fair.status ? '#fca5a5' : '#86efac',
                    color: fair.status ? '#dc2626' : '#059669',
                    backgroundColor: fair.status ? '#fef2f2' : '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {updateStatus.isPending ? (
                    <>
                      <svg style={{
                        animation: 'spin 1s linear infinite',
                        marginRight: '0.5rem',
                        height: '1rem',
                        width: '1rem'
                      }} fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg style={{
                        height: '1rem',
                        width: '1rem',
                        marginRight: '0.5rem'
                      }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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