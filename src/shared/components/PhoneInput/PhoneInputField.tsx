import React from 'react';
import PhoneInput from 'react-phone-number-input';
import type { Value as PhoneValue } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './PhoneInputField.css';

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
  variant?: 'add' | 'edit';
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  value,
  onChange,
  label,
  required = false,
  error,
  disabled = false,
  placeholder,
  id,
  className = '',
  variant = 'edit',
}) => {
  const handleChange = (val: PhoneValue) => {
    onChange(val ?? '');
  };

  const wrapperClass = [
    'phone-input-field__wrapper',
    variant === 'add' ? 'phone-input-field__wrapper--add' : 'phone-input-field__wrapper--edit',
    error ? 'phone-input-field__wrapper--error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`phone-input-field ${className}`}>
      {label && (
        <label className="phone-input-field__label" htmlFor={id}>
          {label}
          {required && !value && <span className="phone-input-field__required">*</span>}
          {!required && <span className="phone-input-field__optional">(opcional)</span>}
        </label>
      )}
      <div className={wrapperClass}>
        <PhoneInput
          international
          defaultCountry="CR"
          value={value as PhoneValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder ?? 'Número de teléfono'}
          inputComponent={undefined}
          id={id}
        />
      </div>
      {error && <span className="phone-input-field__error">{error}</span>}
    </div>
  );
};

export default PhoneInputField;
