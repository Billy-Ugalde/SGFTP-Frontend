import { useState, useRef, useEffect } from 'react';
import '../Styles/AuditDropdown.css';

export interface AuditDropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface AuditDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: AuditDropdownOption[];
}

const AuditDropdown = ({ value, onChange, options }: AuditDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value) ?? options[0];

  return (
    <div className="audit-dropdown" ref={ref}>
      <button
        type="button"
        className={`audit-dropdown__trigger${isOpen ? ' audit-dropdown__trigger--open' : ''}`}
        onClick={() => setIsOpen(o => !o)}
      >
        <div className="audit-dropdown__trigger-content">
          {selected?.icon && <span className="audit-dropdown__selected-icon">{selected.icon}</span>}
          <span className="audit-dropdown__selected-text">{selected?.label}</span>
        </div>
        <div className={`audit-dropdown__chevron${isOpen ? ' audit-dropdown__chevron--open' : ''}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="audit-dropdown__menu">
          <div className="audit-dropdown__options">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`audit-dropdown__option${value === opt.value ? ' audit-dropdown__option--selected' : ''}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                <div className="audit-dropdown__option-content">
                  {opt.icon && <span className="audit-dropdown__option-icon">{opt.icon}</span>}
                  <span className="audit-dropdown__option-text">{opt.label}</span>
                </div>
                {value === opt.value && (
                  <div className="audit-dropdown__check">
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

export default AuditDropdown;
