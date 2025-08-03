import React, { useEffect } from "react";
import '../Styles/GenericModal.css';

type GenericModalProps = {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  maxHeight?: boolean;
};

const GenericModal = ({ show, onClose, title, children, size = 'md', maxHeight = false }: GenericModalProps) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && show) {
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
  }, [show, onClose]);

  if (!show) return null;

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'generic-modal__content--sm';
      case 'md': return 'generic-modal__content--md';
      case 'lg': return 'generic-modal__content--lg';
      case 'xl': return 'generic-modal__content--xl';
      case '2xl': return 'generic-modal__content--2xl';
      default: return 'generic-modal__content--md';
    }
  };

  return (
    <div className="generic-modal">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="generic-modal__backdrop"
      />
      
      {/* Modal */}
      <div className={`generic-modal__content ${getSizeClass()} ${maxHeight ? 'generic-modal__content--max-height' : ''}`}>
        {/* Header */}
        {title && (
          <div className="generic-modal__header">
            <h2 className="generic-modal__title">{title}</h2>
            <button
              onClick={onClose}
              className="generic-modal__close-btn"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={`${title ? 'generic-modal__body' : 'generic-modal__body--no-header'} ${maxHeight ? 'generic-modal__body--max-height' : ''}`}>
          {!title && (
            <button
              onClick={onClose}
              className="generic-modal__close-btn generic-modal__close-btn--no-header"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default GenericModal;