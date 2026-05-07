import React, { useState, useRef, useEffect } from 'react';
import '../Styles/ActivityFormDropdown.css';

export interface ActivityDropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ActivityFormDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: ActivityDropdownOption[];
  label: string;
  required?: boolean;
  showInitialEditable?: boolean;
  optionalLabel?: string;
  error?: string;
  disabled?: boolean;
}

const ActivityFormDropdown: React.FC<ActivityFormDropdownProps> = ({
  value,
  onChange,
  options,
  label,
  required = false,
  showInitialEditable = false,
  optionalLabel,
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const showRequired = required && !value;

  return (
    <div className="activity-form-dropdown" ref={dropdownRef}>
      <label className="activity-form-dropdown__label">
        {label}{' '}
        {showRequired && <span className="activity-form-dropdown__required">*</span>}
        {showInitialEditable && !showRequired && (
          <span className="activity-form-dropdown__initial-editable">valor inicial editable</span>
        )}
        {optionalLabel && !showRequired && (
          <span className="activity-form-dropdown__optional">{optionalLabel}</span>
        )}
      </label>

      <button
        type="button"
        className={[
          'activity-form-dropdown__trigger',
          error ? 'activity-form-dropdown__trigger--error' : '',
          isOpen ? 'activity-form-dropdown__trigger--open' : '',
        ].filter(Boolean).join(' ')}
        onClick={() => { if (!disabled) setIsOpen(prev => !prev); }}
        disabled={disabled}
      >
        <div className="activity-form-dropdown__trigger-content">
          {selectedOption?.icon && (
            <span className="activity-form-dropdown__selected-icon">{selectedOption.icon}</span>
          )}
          <span className="activity-form-dropdown__selected-text">
            {selectedOption?.label || 'Seleccionar...'}
          </span>
        </div>
        <div className={`activity-form-dropdown__chevron${isOpen ? ' activity-form-dropdown__chevron--open' : ''}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="activity-form-dropdown__menu">
          <div className="activity-form-dropdown__options">
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                className={`activity-form-dropdown__option${value === option.value ? ' activity-form-dropdown__option--selected' : ''}`}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
              >
                <div className="activity-form-dropdown__option-content">
                  {option.icon && (
                    <span className="activity-form-dropdown__option-icon">{option.icon}</span>
                  )}
                  <span className="activity-form-dropdown__option-text">{option.label}</span>
                </div>
                {value === option.value && (
                  <div className="activity-form-dropdown__check">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <span className="activity-form-dropdown__error">{error}</span>}
    </div>
  );
};

export default ActivityFormDropdown;
