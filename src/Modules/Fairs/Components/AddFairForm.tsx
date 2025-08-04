import { useState } from 'react';
import { useAddFair } from '../Services/FairsServices';
import '../Styles/AddFairForm.css';

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

  return (
    <div className="add-fair-form">
      <form onSubmit={handleSubmit} className="add-fair-form__form">
        {/* Fair Name */}
        <div>
          <label htmlFor="name" className="add-fair-form__label">
            Fair Name <span className="add-fair-form__required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter fair name"
            className="add-fair-form__input"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="add-fair-form__label">
            Description <span className="add-fair-form__required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the fair, its purpose, and key features..."
            className={`add-fair-form__input add-fair-form__textarea`}
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="add-fair-form__label">
            Location <span className="add-fair-form__required">*</span>
          </label>
          <div className="add-fair-form__input-wrapper">
            <div className="add-fair-form__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className={`add-fair-form__input add-fair-form__input--with-icon`}
            />
          </div>
        </div>

        {/* Stand Capacity and Status Row */}
        <div className="add-fair-form__row">
          {/* Stand Capacity */}
          <div>
            <label htmlFor="stand_capacity" className="add-fair-form__label">
              Stand Capacity <span className="add-fair-form__required">*</span>
            </label>
            <div className="add-fair-form__input-wrapper">
              <div className="add-fair-form__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className={`add-fair-form__input add-fair-form__input--with-icon`}
              />
            </div>
            <p className="add-fair-form__help-text">
              Maximum number of vendor stands
            </p>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="add-fair-form__label">
              Initial Status <span className="add-fair-form__required">*</span>
            </label>
            <div className="add-fair-form__input-wrapper">
              <div className="add-fair-form__icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <select
                id="status"
                name="status"
                value={formData.status.toString()}
                onChange={handleChange}
                className={`add-fair-form__input add-fair-form__input--with-icon add-fair-form__select`}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <p className="add-fair-form__help-text">
              Set fair availability status
            </p>
          </div>
        </div>

        {/* Status Info */}
        <div className="add-fair-form__info-box">
          <svg className="add-fair-form__info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="add-fair-form__info-title">
              About Fair Status
            </p>
            <p className="add-fair-form__info-text">
              <strong>Active:</strong> Fair is visible and accepting vendor registrations<br />
              <strong>Inactive:</strong> Fair is hidden and not accepting new registrations
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="add-fair-form__error">
            <svg className="add-fair-form__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="add-fair-form__error-text">
              {error}
            </p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="add-fair-form__actions">
          <button
            type="button"
            onClick={onSuccess}
            className="add-fair-form__cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`add-fair-form__submit-btn ${isLoading ? 'add-fair-form__submit-btn--loading' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="add-fair-form__loading-spinner" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Fair...
              </>
            ) : (
              <>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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