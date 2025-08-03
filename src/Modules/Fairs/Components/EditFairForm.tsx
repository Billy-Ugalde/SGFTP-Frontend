import { useState, useEffect } from 'react';
import { useUpdateFair } from '../Services/FairsServices';
import '../Styles/EditFairForm.css';;

const EditFairForm = ({ fair, onSuccess }: { fair: any, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    stand_capacity: 0,
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const updateFair = useUpdateFair();

  useEffect(() => {
    if (fair) {
      setFormData({
        name: fair.name,
        description: fair.description,
        location: fair.location,
        stand_capacity: fair.stand_capacity,
      });
    }
  }, [fair]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stand_capacity' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await updateFair.mutateAsync({ id_fair: fair.id_fair, ...formData });
      onSuccess();
    } catch (err) {
      setError('Error updating fair. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-fair-form">
      <form onSubmit={handleSubmit} className="edit-fair-form__form">
        {/* Fair Name */}
        <div>
          <label htmlFor="edit-name" className="edit-fair-form__label">
            Fair Name <span className="edit-fair-form__required">*</span>
          </label>
          <input
            id="edit-name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter fair name"
            className="edit-fair-form__input"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="edit-description" className="edit-fair-form__label">
            Description <span className="edit-fair-form__required">*</span>
          </label>
          <textarea
            id="edit-description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the fair, its purpose, and key features..."
            className={`edit-fair-form__input edit-fair-form__textarea`}
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="edit-location" className="edit-fair-form__label">
            Location <span className="edit-fair-form__required">*</span>
          </label>
          <div className="edit-fair-form__input-wrapper">
            <div className="edit-fair-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              id="edit-location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter fair location"
              className={`edit-fair-form__input edit-fair-form__input--with-icon`}
            />
          </div>
        </div>

        {/* Stand Capacity */}
        <div>
          <label htmlFor="edit-capacity" className="edit-fair-form__label">
            Stand Capacity <span className="edit-fair-form__required">*</span>
          </label>
          <div className="edit-fair-form__input-wrapper">
            <div className="edit-fair-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <input
              id="edit-capacity"
              name="stand_capacity"
              type="number"
              min="1"
              required
              value={formData.stand_capacity}
              onChange={handleChange}
              placeholder="Number of stands"
              className={`edit-fair-form__input edit-fair-form__input--with-icon`}
            />
          </div>
          <p className="edit-fair-form__help-text">
            Maximum number of vendor stands available
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="edit-fair-form__error">
            <svg className="edit-fair-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="edit-fair-form__error-text">
              {error}
            </p>
          </div>
        )}

        {/* Fair Status Info */}
        <div className="edit-fair-form__status-info">
          <svg className="edit-fair-form__status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="edit-fair-form__status-title">
              <span className="edit-fair-form__status-label">Current Status:</span>
              <span className={`edit-fair-form__status-badge ${fair?.status ? 'edit-fair-form__status-badge--active' : 'edit-fair-form__status-badge--inactive'}`}>
                {fair?.status ? 'Active' : 'Inactive'}
              </span>
            </p>
            <p className="edit-fair-form__status-description">
              Use the toggle button in the fairs list to change the status
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="edit-fair-form__actions">
          <button
            type="button"
            onClick={onSuccess}
            className="edit-fair-form__cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`edit-fair-form__submit-btn ${isLoading ? 'edit-fair-form__submit-btn--loading' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="edit-fair-form__loading-spinner" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Fair...
              </>
            ) : (
              <>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Update Fair
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditFairForm;