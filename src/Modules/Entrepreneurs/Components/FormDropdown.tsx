import React, { useState, useRef, useEffect } from 'react';
import '../Styles/FormDropdown.css';

export interface FormDropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface FormDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: FormDropdownOption[];
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  variant: 'add' | 'edit';
  showInitialEditable?: boolean;
}

const FormDropdown: React.FC<FormDropdownProps> = ({
  value,
  onChange,
  options,
  label,
  required = false,
  error,
  disabled = false,
  variant,
  showInitialEditable = false,
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
    <div className={`form-dropdown form-dropdown--${variant}`} ref={dropdownRef}>
      <label className="form-dropdown__label">
        {label}{' '}
        {showRequired && <span className="form-dropdown__required">*</span>}
        {showInitialEditable && !showRequired && (
          <span className="form-dropdown__initial-editable">valor inicial editable</span>
        )}
      </label>

      <button
        type="button"
        className={[
          'form-dropdown__trigger',
          error ? 'form-dropdown__trigger--error' : '',
          isOpen ? 'form-dropdown__trigger--open' : '',
        ].filter(Boolean).join(' ')}
        onClick={() => { if (!disabled) setIsOpen(prev => !prev); }}
        disabled={disabled}
      >
        <div className="form-dropdown__trigger-content">
          {selectedOption?.icon && (
            <span className="form-dropdown__selected-icon">{selectedOption.icon}</span>
          )}
          <span className="form-dropdown__selected-text">
            {selectedOption?.label || 'Seleccionar...'}
          </span>
        </div>
        <div className={`form-dropdown__chevron${isOpen ? ' form-dropdown__chevron--open' : ''}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="form-dropdown__menu">
          <div className="form-dropdown__options">
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                className={`form-dropdown__option${value === option.value ? ' form-dropdown__option--selected' : ''}`}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
              >
                <div className="form-dropdown__option-content">
                  {option.icon && (
                    <span className="form-dropdown__option-icon">{option.icon}</span>
                  )}
                  <span className="form-dropdown__option-text">{option.label}</span>
                </div>
                {value === option.value && (
                  <div className="form-dropdown__check">
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

      {error && <span className="form-dropdown__error">{error}</span>}
    </div>
  );
};

export default FormDropdown;
