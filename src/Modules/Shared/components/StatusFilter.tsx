import { useState, useRef, useEffect } from 'react';
import { Filter, CheckCircle2, XCircle } from 'lucide-react';
import '../styles/StatusFilter.css';

interface StatusFilterProps {
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusChange: (status: 'all' | 'active' | 'inactive') => void;
}

const StatusFilter = ({ statusFilter, onStatusChange }: StatusFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statuses = [
    { value: 'all', label: 'Activos e Inactivos', icon: <Filter size={14} /> },
    { value: 'active', label: 'Activos', icon: <CheckCircle2 size={14} /> },
    { value: 'inactive', label: 'Inactivos', icon: <XCircle size={14} /> },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedStatusData = statuses.find(s => s.value === statusFilter);

  return (
    <div className="status-filter" ref={dropdownRef}>
      <button
        className="status-filter__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="status-filter__trigger-content">
          <span className="status-filter__trigger-icon"><Filter size={14} /></span>
          <span className="status-filter__text">
            {selectedStatusData?.label}
          </span>
        </div>
        <div className={`status-filter__chevron ${isOpen ? 'status-filter__chevron--open' : ''}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="status-filter__dropdown">
          <div className="status-filter__options">
            {statuses.map((status) => (
              <button
                key={status.value}
                className={`status-filter__option ${statusFilter === status.value ? 'status-filter__option--selected' : ''}`}
                onClick={() => {
                  onStatusChange(status.value as 'all' | 'active' | 'inactive');
                  setIsOpen(false);
                }}
                type="button"
              >
                <div className="status-filter__option-content">
                  {status.icon && (
                    <span className="status-filter__option-icon">{status.icon}</span>
                  )}
                  <span className="status-filter__option-text">
                    {status.label}
                  </span>
                </div>
                {statusFilter === status.value && (
                  <div className="status-filter__check">
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

export default StatusFilter;
