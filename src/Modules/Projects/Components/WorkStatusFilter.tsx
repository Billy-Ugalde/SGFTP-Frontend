import { useState, useRef, useEffect } from 'react';
import { Filter, Clock, ClipboardList, Zap, PauseCircle, CheckCircle2 } from 'lucide-react';
import '../Styles/WorkStatusFilter.css';

type WorkStatus = 'all' | 'pending' | 'planning' | 'execution' | 'suspended' | 'finished';

interface WorkStatusFilterProps {
  statusFilter: WorkStatus;
  onStatusChange: (status: WorkStatus) => void;
}

const WorkStatusFilter = ({ statusFilter, onStatusChange }: WorkStatusFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statuses = [
    { value: 'all', label: 'Todos los estados', icon: <Filter size={14} /> },
    { value: 'pending', label: 'Pendiente', icon: <Clock size={14} /> },
    { value: 'planning', label: 'Planificación', icon: <ClipboardList size={14} /> },
    { value: 'execution', label: 'Ejecución', icon: <Zap size={14} /> },
    { value: 'suspended', label: 'Suspendido', icon: <PauseCircle size={14} /> },
    { value: 'finished', label: 'Finalizado', icon: <CheckCircle2 size={14} /> },
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
    <div className="work-status-filter" ref={dropdownRef}>
      <button
        className="work-status-filter__trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="work-status-filter__trigger-content">
          <span className="work-status-filter__trigger-icon"><Filter size={14} /></span>
          <span className="work-status-filter__text">
            {selectedStatusData?.label}
          </span>
        </div>
        <div className={`work-status-filter__chevron ${isOpen ? 'work-status-filter__chevron--open' : ''}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="work-status-filter__dropdown">
          <div className="work-status-filter__options">
            {statuses.map((status) => (
              <button
                key={status.value}
                className={`work-status-filter__option ${statusFilter === status.value ? 'work-status-filter__option--selected' : ''}`}
                onClick={() => {
                  onStatusChange(status.value as WorkStatus);
                  setIsOpen(false);
                }}
                type="button"
              >
                <div className="work-status-filter__option-content">
                  {status.icon && (
                    <span className="work-status-filter__option-icon">{status.icon}</span>
                  )}
                  <span className="work-status-filter__option-text">
                    {status.label}
                  </span>
                </div>
                {statusFilter === status.value && (
                  <div className="work-status-filter__check">
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

export default WorkStatusFilter;
