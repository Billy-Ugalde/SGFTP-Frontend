import { useState } from 'react';
import { useAddFair } from '../Services/FairsServices';

const AddFairForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    stand_capacity: 0,
    status: true  
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addFair = useAddFair();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : 
              name === 'status' ? value === 'true' : 
              value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await addFair.mutateAsync(formData);
      onSuccess();
    } catch (err) {
      setError('Error adding fair. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: '#111827',
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    fontFamily: 'inherit'
  };

  const inputWithIconStyle = {
    ...inputStyle,
    paddingLeft: '2.5rem'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  };

  const buttonStyle = {
    padding: '0.75rem 2rem',
    background: isLoading ? '#9ca3af' : 'linear-gradient(to right, #059669, #047857)',
    color: 'white',
    borderRadius: '0.5rem',
    fontWeight: '600',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease-in-out',
    fontSize: '0.875rem'
  };

  return (
    <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Fair Name */}
        <div>
          <label htmlFor="name" style={labelStyle}>
            Fair Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter fair name"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" style={labelStyle}>
            Description <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the fair, its purpose, and key features..."
            style={{
              ...inputStyle,
              resize: 'none',
              minHeight: '100px'
            }}
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" style={labelStyle}>
            Location <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '0.75rem',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}>
              <svg style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter fair location"
              style={inputWithIconStyle}
            />
          </div>
        </div>

        {/* Stand Capacity and Status Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
          {/* Stand Capacity */}
          <div>
            <label htmlFor="stand_capacity" style={labelStyle}>
              Stand Capacity <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '0.75rem',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}>
                <svg style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <input
                id="stand_capacity"
                name="stand_capacity"
                type="number"
                min="1"
                required
                value={formData.stand_capacity}
                onChange={handleChange}
                placeholder="Number of stands"
                style={inputWithIconStyle}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Maximum number of vendor stands
            </p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" style={labelStyle}>
              Initial Status <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '0.75rem',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}>
                <svg style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <select
                id="status"
                name="status"
                value={formData.status.toString()}
                onChange={handleChange}
                style={{
                  ...inputWithIconStyle,
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Set fair availability status
            </p>
          </div>
        </div>

        {/* Status Info */}
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '0.5rem',
          padding: '1rem',
          display: 'flex',
          alignItems: 'flex-start'
        }}>
          <svg style={{ height: '1.25rem', width: '1.25rem', color: '#0284c7', marginRight: '0.75rem', marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#0c4a6e', margin: '0 0 0.25rem 0', fontWeight: 'medium' }}>
              About Fair Status
            </p>
            <p style={{ fontSize: '0.75rem', color: '#075985', margin: 0, lineHeight: 1.4 }}>
              <strong>Active:</strong> Fair is visible and accepting vendor registrations<br />
              <strong>Inactive:</strong> Fair is hidden and not accepting new registrations
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <svg style={{ height: '1.25rem', width: '1.25rem', color: '#f87171', marginRight: '0.75rem', marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{ fontSize: '0.875rem', fontWeight: 'medium', color: '#991b1b', margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* Submit Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            type="button"
            onClick={onSuccess}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              color: '#374151',
              backgroundColor: 'white',
              fontWeight: 'medium',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              fontSize: '0.875rem'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            style={buttonStyle}
          >
            {isLoading ? (
              <>
                <svg style={{
                  animation: 'spin 1s linear infinite',
                  height: '1rem',
                  width: '1rem'
                }} fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Fair...
              </>
            ) : (
              <>
                <svg style={{ height: '1rem', width: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Fair
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFairForm;