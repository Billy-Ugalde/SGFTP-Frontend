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

  const rootClass = [
    'phone-input-field',
    variant === 'add' ? 'phone-input-field--add' : 'phone-input-field--edit',
    error ? 'phone-input-field--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      {label && (
        <label className="phone-input-field__label" htmlFor={id}>
          {label}
          {required && !value && <span className="phone-input-field__required">*</span>}
          {!required && <span className="phone-input-field__optional">(opcional)</span>}
        </label>
      )}
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
      {error && <span className="phone-input-field__error">{error}</span>}
    </div>
  );
};

export default PhoneInputField;
