import React, { useEffect } from "react";
import '../Styles/ConfirmationModal.css';

interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  type = 'warning',
  isLoading = false
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && show && !isLoading) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose, isLoading]);

  if (!show) return null;

  const getIconByType = () => {
    switch (type) {
      case 'danger':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default: // warning
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'danger':
        return 'confirmation-modal__icon--danger';
      case 'info':
        return 'confirmation-modal__icon--info';
      default:
        return 'confirmation-modal__icon--warning';
    }
  };

  return (
    <div className="confirmation-modal">
      {/* Backdrop */}
      <div 
        onClick={!isLoading ? onClose : undefined}
        className="confirmation-modal__backdrop"
      />
      
      {/* Modal */}
      <div className="confirmation-modal__content">
        {/* Icon */}
        <div className={`confirmation-modal__icon ${getTypeClass()}`}>
          {getIconByType()}
        </div>
        
        {/* Content */}
        <div className="confirmation-modal__body">
          <h3 className="confirmation-modal__title">{title}</h3>
          <p className="confirmation-modal__message">{message}</p>
        </div>
        
        {/* Actions */}
        <div className="confirmation-modal__actions">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="confirmation-modal__cancel-btn"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`confirmation-modal__confirm-btn confirmation-modal__confirm-btn--${type} ${isLoading ? 'confirmation-modal__confirm-btn--loading' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="confirmation-modal__loading-spinner" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;