import FairsList from "../Components/FairsList";
import AddFairButton from "../Components/AddFairButton";
import { useState } from "react";

const FairsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9fafb 0%, #ecfdf5 50%, #eff6ff 100%)'
    }}>
      {/* Header Section */}
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4rem 1.5rem 3rem 1.5rem'
        }}>
          {/* Main Title Section */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                padding: '1.25rem',
                backgroundColor: '#d1fae5',
                borderRadius: '1.5rem',
                marginRight: '1.5rem'
              }}>
                <svg style={{
                  height: '3.5rem',
                  width: '3.5rem',
                  color: '#059669'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 style={{
                  fontSize: '4rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0,
                  lineHeight: 1,
                  letterSpacing: '-0.025em'
                }}>Fairs Management</h1>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '2rem' }}>🌿</div>
            </div>
            
            <p style={{
              fontSize: '1.125rem',
              color: '#6b7280',
              margin: '0 auto',
              maxWidth: '700px',
              lineHeight: 1.7,
              fontWeight: '400'
            }}>
              Manage and organize environmental fairs for{' '}
              <span style={{ 
                color: '#059669', 
                fontWeight: '600' 
              }}>Tamarindo Park Foundation</span>.{' '}
              Create, edit, and coordinate sustainable community events that promote 
              conservation and environmental awareness.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem'
      }}>
        {/* Action Bar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.5rem',
                margin: 0
              }}>Fair Directory</h2>
              <p style={{
                color: '#6b7280',
                fontSize: '1rem',
                margin: 0
              }}>Create, edit, and manage all foundation environmental fairs</p>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', minWidth: '300px', flex: '1', maxWidth: '400px' }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '1rem',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <svg style={{
                    height: '1.25rem',
                    width: '1.25rem',
                    color: '#9ca3af'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search fairs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    paddingLeft: '3rem',
                    paddingRight: '1rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    width: '100%',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: '#f9fafb'
                  }}
                />
              </div>
              
              {/* Filter Dropdown */}
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#f9fafb',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '140px'
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              
              {/* Add Fair Button */}
              <AddFairButton />
            </div>
          </div>
        </div>

        {/* Fairs List */}
        <FairsList searchTerm={searchTerm} statusFilter={statusFilter} />
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '2rem 1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            <svg style={{
              height: '1rem',
              width: '1rem'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Built with care for environmental conservation</span>
            <span style={{ margin: '0 0.5rem' }}>•</span>
            <span>© 2025 Tamarindo Park Foundation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FairsPage;