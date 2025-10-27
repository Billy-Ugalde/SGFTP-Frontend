import { useNavigate } from 'react-router-dom';
import '../styles/BackToDashboardButton.css';

interface BackToDashboardButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

const BackToDashboardButton: React.FC<BackToDashboardButtonProps> = ({
  className = '',
  style = {}
}) => {
  const navigate = useNavigate();

  return (
    <button
      className={`back-to-dashboard-btn ${className}`}
      onClick={() => navigate('/admin/dashboard')}
      style={style}
      type="button"
      aria-label="Volver al Dashboard"
    >
      ← Volver al Dashboard
    </button>
  );
};

export default BackToDashboardButton;
