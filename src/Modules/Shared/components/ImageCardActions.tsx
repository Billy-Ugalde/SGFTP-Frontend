import { RefreshCw, Trash2 } from 'lucide-react';
import './ImageCardActions.css';

interface ImageCardActionsProps {
  onReplace: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

export default function ImageCardActions({ onReplace, onDelete, disabled }: ImageCardActionsProps) {
  return (
    <div className="image-card-actions">
      <button
        type="button"
        className="image-card-actions__btn image-card-actions__btn--replace"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onReplace();
        }}
        disabled={disabled}
        title="Reemplazar imagen"
        aria-label="Reemplazar imagen"
      >
        <RefreshCw size={18} />
      </button>

      {onDelete && (
        <button
          type="button"
          className="image-card-actions__btn image-card-actions__btn--delete"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          disabled={disabled}
          title="Eliminar imagen"
          aria-label="Eliminar imagen"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}
