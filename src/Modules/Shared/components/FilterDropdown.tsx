import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import '../styles/FilterDropdown.css';

export interface FilterOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  minWidth?: number;
}

const FilterDropdown = ({ value, onChange, options, minWidth }: FilterDropdownProps) => {
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

  const selected = options.find((o) => o.value === value);

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        className="filter-dropdown__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        style={minWidth ? { minWidth } : undefined}
      >
        <div className="filter-dropdown__trigger-content">
          {selected?.icon && (
            <span className="filter-dropdown__icon">{selected.icon}</span>
          )}
          <span className="filter-dropdown__text">{selected?.label}</span>
        </div>
        <div className={`filter-dropdown__chevron ${isOpen ? 'filter-dropdown__chevron--open' : ''}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="filter-dropdown__menu">
          <div className="filter-dropdown__options">
            {options.map((option) => (
              <button
                key={option.value}
                className={`filter-dropdown__option ${value === option.value ? 'filter-dropdown__option--selected' : ''}`}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                type="button"
              >
                <div className="filter-dropdown__option-content">
                  {option.icon && (
                    <span className="filter-dropdown__option-icon">{option.icon}</span>
                  )}
                  <span className="filter-dropdown__option-text">{option.label}</span>
                </div>
                {value === option.value && (
                  <div className="filter-dropdown__check">
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
    </div>
  );
};

export default FilterDropdown;
