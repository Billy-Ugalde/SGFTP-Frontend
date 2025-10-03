import { PROJECT_STATUS_OPTIONS, ProjectStatus } from '../Services/ProjectsServices';
import '../Styles/StatusFilter.css';

interface StatusFilterProps {
  statusFilter: 'all' | ProjectStatus;
  onStatusChange: (status: 'all' | ProjectStatus) => void;
}

const StatusFilter = ({ statusFilter, onStatusChange }: StatusFilterProps) => {
  return (
    <div className="status-filter">
      <label className="status-filter__label">Estado del Proyecto:</label>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as 'all' | ProjectStatus)}
        className="status-filter__select"
      >
        {PROJECT_STATUS_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatusFilter;